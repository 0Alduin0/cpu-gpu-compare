"""
Kaynak sitenin GPU/CPU veritabanlarindan eksik parcalari ceker ve
data/gpu_database.json, data/cpu_database.json dosyalarina ekler.

Kaynak listeler: scripts/dataset/popular-gpus.txt, popular-cpus.txt
(kurallar dosyalarin basinda). Liste yukaridan asagi yurunur, datasette olan
atlanir; varsayilan olarak listenin tamami cekilir, --target N verilirse
toplam kayit N'ye ulasinca durulur.

Cekilemeyenler (aramada yok, sayfa uyusmuyor, hata...) sebebiyle birlikte
scripts/dataset/missing-gpus.txt, missing-cpus.txt dosyalarina yazilir;
--retry yalnizca onlari tekrar dener.

Bot kontrolu:
  Kaynak site kendi proof-of-work kontrolunu kullaniyor
  (/.firewall, Web Worker). Gercek bir Chrome bunu birkac saniyede kendisi
  gecer; bu yuzden tarayici pydoll ile surulur ve tum istekler sayfanin
  icinden fetch ile yapilir (cookie ve oturum tarayicida kalir).
  Kontrol bir insan dogrulamasina (surukle-birak) yukselirse script bekler;
  acik tarayici penceresinde elle tamamlamaniz gerekir.

Kurulum:  py -m pip install pydoll-python
Calistirma (proje kokunden):
  py scripts/dataset/scrape.py                 # gpu + cpu, listelerin tamami
  py scripts/dataset/scrape.py --kind gpu --limit 5
  py scripts/dataset/scrape.py --dry-run       # sadece isim eslestirme
  py scripts/dataset/scrape.py --retry         # eksikler listesini tekrar dene
  py scripts/dataset/scrape.py --kind gpu --refresh old   # eski cekicinin kayitlarini yenile
  py scripts/dataset/scrape.py --kind gpu --refresh all --only "GeForce 210"   # tek kayit
Sonra: npm run sync-counts (yenilemeden sonra: npm run calibration)
"""
import argparse
import asyncio
import json
import os
import random
import re
import sys
import time
from pathlib import Path

from pydoll import Chrome
from pydoll.browser.options import ChromiumOptions

ROOT = Path(__file__).resolve().parents[2]
# Kaynak sitenin adresi depoda tutulmaz: PCPARTS_SOURCE ortam degiskeni ya da
# scripts/dataset/kaynak.local.txt (tek satir, .gitignore'da).
_LOCAL = Path(__file__).with_name('kaynak.local.txt')
BASE = (os.environ.get('PCPARTS_SOURCE')
        or (_LOCAL.read_text(encoding='utf-8').strip() if _LOCAL.exists() else '')).rstrip('/')

KINDS = {
    'gpu': {
        'list': ROOT / 'scripts' / 'dataset' / 'popular-gpus.txt',
        'missing': ROOT / 'scripts' / 'dataset' / 'missing-gpus.txt',
        'db': ROOT / 'data' / 'gpu_database.json',
        'min_year': 2006,
    },
    'cpu': {
        'list': ROOT / 'scripts' / 'dataset' / 'popular-cpus.txt',
        'missing': ROOT / 'scripts' / 'dataset' / 'missing-cpus.txt',
        'db': ROOT / 'data' / 'cpu_database.json',
        'min_year': 2006,
    },
}

# Arama sayfa basina 100 satir dondurur ve kelime bazli eslestirir
# ("Ryzen 5 9600" tum Ryzen 5'leri getirir); tam ad ilk sayfada yoksa
# bu kadar sayfaya daha bakilir.
MAX_SEARCH_PAGES = 4

# Saklanan alanlar: mevcut kayitlardaki alanlar + src/data/labels.js'deki
# GPU_GROUPS / CPU_GROUPS. Listede olmayan her alan detay sayfasinda "Diger"
# grubuna dusecegi icin (Part#, tCaseMax...) disarida birakilir.
KEEP = {
    'gpu': {
        'GPU Name', 'GPU Variant', 'Architecture', 'Foundry', 'Process Size',
        'Transistors', 'Density', 'Die Size', 'Release Date', 'Launch Price',
        # Eski kartlar ve konsollar Base/Boost yerine tek "GPU Clock" (+ "Shader Clock") veriyor.
        'Bus Interface', 'Base Clock', 'GPU Clock', 'Shader Clock', 'Game Clock', 'Boost Clock', 'Memory Clock',
        'Memory Size', 'Memory Type', 'Memory Bus', 'Bandwidth', 'Shading Units',
        'TMUs', 'ROPs', 'Compute Units', 'Matrix Cores', 'RT Cores', 'Tensor Cores',
        'L0 Cache', 'L1 Cache', 'L2 Cache', 'L3 Cache', 'Pixel Rate', 'Texture Rate',
        'FP16 (half)', 'FP32 (float)', 'FP64 (double)', 'Slot Width', 'TDP',
        'Suggested PSU', 'Outputs', 'Power Connectors', 'DirectX', 'OpenGL',
        'OpenCL', 'Vulkan', 'Shader Model',
    },
    'cpu': {
        'Socket', 'Foundry', 'Process Size', 'Market', 'Release Date', 'Frequency',
        'Turbo Clock', 'Boost Clock', 'Base Clock', 'Multiplier', 'Multiplier Unlocked',
        'TDP', 'Configurable TDP', 'Max Power', 'Codename', 'Generation',
        'Memory Support', 'Rated Speed', 'Memory Bus', 'Memory Bandwidth',
        'Memory Capacity', 'ECC Memory', 'PCI-Express', '# of Cores', '# of Threads',
        'Integrated Graphics', 'Cache L1', 'Cache L2', 'Cache L3',
    },
}

# (tur, bolum, kaynak etiketi) -> datasetteki alan adi. GPU sayfalari
# "FP32 (float)" yerine artik "FP32" yaziyor ve ayni etiket "Matrix Performance"
# bolumunde de geciyor; performans endeksi bu alana dayandigi icin bolumle eslenir.
RENAME = {
    ('gpu', 'Theoretical Performance', 'FP16'): 'FP16 (half)',
    ('gpu', 'Theoretical Performance', 'FP32'): 'FP32 (float)',
    ('gpu', 'Theoretical Performance', 'FP64'): 'FP64 (double)',
}

# Eski Radeon'lar kaynakta "vendor-ati" sinifiyla geliyor (ATI markasi); uygulama AMD sayar.
VENDORS = {'nvidia': 'nvidia', 'amd': 'amd', 'ati': 'amd', 'intel': 'intel'}

# Sayfa icinde calisir. Hucre metni: <br> satir sonu olur, her satir
# sikistirilir; mevcut verideki "2518 MHz\n20.1 Gbps effective" bicimi.
JS_CLEAN = r"""
const clean = el => {
  const c = el.cloneNode(true);
  c.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
  return c.textContent.split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
};
const isChallenge = html => html.includes('pow-progress-bar') || html.includes('/.firewall');
"""

JS_SEARCH = JS_CLEAN + r"""
return (async (kind, q, page) => {
  const enc = encodeURIComponent(q).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const p = page > 1 ? `&p=${page}` : '';
  const r = await fetch(`/${kind}-specs/?q=${enc}${p}&ajax`, {credentials: 'include', headers: {'X-Requested-With': 'XMLHttpRequest'}});
  const txt = await r.text();
  let j;
  try { j = JSON.parse(txt); } catch (e) { return {status: r.status, challenge: isChallenge(txt), rows: null}; }
  const doc = new DOMParser().parseFromString(j.list || '', 'text/html');
  const rows = [];
  doc.querySelectorAll('tr[class*="vendor-"]').forEach(tr => {
    const a = [...tr.querySelectorAll('a[href]')]
      .find(a => /-specs\/[^/?]+\.c\d+$/.test(a.getAttribute('href')) && a.textContent.trim());
    if (!a) return;
    const v = [...tr.classList].find(c => c.startsWith('vendor-')) || '';
    rows.push({name: clean(a), href: a.getAttribute('href'), vendor: v.slice(7)});
  });
  // Sonuclar sayfa basina 100; "1 to 100 of 239" -> 239
  const counts = doc.querySelector('.counts');
  const total = counts ? parseInt([...counts.querySelectorAll('b')].pop().textContent.replace(/\D/g, ''), 10) : rows.length;
  return {status: r.status, challenge: false, rows, total};
})(__ARGS__);
"""

JS_SPEC = JS_CLEAN + r"""
return (async (url) => {
  const r = await fetch(url, {credentials: 'include'});
  const html = await r.text();
  if (isChallenge(html)) return {status: r.status, challenge: true};
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const fields = [];
  doc.querySelectorAll('section.details').forEach(sec => {
    const h = sec.querySelector('h1, h2');
    const section = h ? clean(h) : '';
    sec.querySelectorAll('dl').forEach(dl => {
      const dt = dl.querySelector('dt'), dd = dl.querySelector('dd');
      if (dt && dd) fields.push([section, clean(dt), clean(dd)]);
    });
    sec.querySelectorAll('tr').forEach(tr => {
      const th = tr.querySelector('th'), td = tr.querySelector('td');
      if (th && td) fields.push([section, clean(th).replace(/:$/, '').trim(), clean(td)]);
    });
  });
  return {status: r.status, challenge: false, title: doc.title, fields};
})(__ARGS__);
"""

JS_STATE = r"""
(() => {
  const d = document.getElementById('drag-captcha');
  return JSON.stringify({
    pow: !!document.getElementById('pow-progress-bar'),
    drag: !!d && d.style.display !== 'none',
  });
})()
"""


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


def read_list(path):
    """Satir basi # yorum; "Isim  # not" bicimindeki satir sonu yorumu atilir."""
    if not path.exists():
        return []
    out = []
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.split(' #', 1)[0].strip()
        if line and not line.startswith('#'):
            out.append(line)
    return out


MISSING_HEADER = """\
# Cekilemeyen {kind_upper}'lar — scrape.py tarafindan yazilir.
#
# Her satir: isim  # sebep (tarih). Oncelik sirasi popular-{kind}s.txt ile ayni.
#
# Tekrar denemek icin (kaynakta yeniden aranir, hedef sayisi uygulanmaz):
#   py scripts/dataset/scrape.py --kind {kind} --retry
# Isim kaynakta farkli geciyorsa (orn. TDP varyantlari) popular-{kind}s.txt
# icindeki ismi duzeltip scripti normal calistirin; bu dosya kaynak degil,
# her calismada yeniden yazilan bir rapordur. Cekilen satirlar kendiliginden silinir.

"""


def write_missing(path, kind, missing):
    """missing: {isim: sebep}. Bossa dosya silinir."""
    if not missing:
        path.unlink(missing_ok=True)
        return
    lines = [f'{name}  # {reason}' for name, reason in missing.items()]
    # Repodaki metin dosyalari LF (.gitattributes); Windows'ta write_text varsayilani CRLF.
    path.write_text(MISSING_HEADER.format(kind=kind, kind_upper=kind.upper()) + '\n'.join(lines) + '\n',
                    encoding='utf-8', newline='\n')


def read_missing(path):
    if not path.exists():
        return {}
    out = {}
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        name, _, reason = line.partition(' #')
        out[name.strip()] = reason.strip()
    return out


def key(name):
    return re.sub(r'\s+', ' ', name).strip().casefold()


BROKEN_MM2 = 'mm' + chr(0xFFFD)  # U+FFFD: bozulmus "²"


def load_db(path):
    db = json.loads(path.read_text(encoding='utf-8'))
    # Eski cekici "mm²" karakterini U+FFFD olarak yazmis.
    fixed = 0
    for rec in db:
        for k in ('Die Size', 'Density'):
            v = rec.get(k)
            if isinstance(v, str) and BROKEN_MM2 in v:
                rec[k] = v.replace(BROKEN_MM2, 'mm²')
                fixed += 1
    return db, fixed


def save_db(path, db):
    # Mevcut dosya bicimi: 4 bosluk, CRLF, ASCII kacisi yok, sonda satir sonu yok.
    text = json.dumps(db, indent=4, ensure_ascii=False).replace('\n', '\r\n')
    tmp = path.with_suffix('.json.tmp')
    tmp.write_bytes(text.encode('utf-8'))
    os.replace(tmp, path)


def next_id_num(db, kind):
    nums = [int(m.group(1)) for r in db if (m := re.match(rf'{kind}(\d+)', r.get('id', '')))]
    return max(nums, default=0) + 1


def normalize(kind, fields):
    rec = {}
    for section, k, v in fields:
        k = RENAME.get((kind, section, k), k)
        if k not in KEEP[kind] or k in rec or not v:
            continue
        # Mimari adlari datasetteki ve ARCH_FAMILY'deki (src/data/gpuData.js)
        # bicime cekilir: kaynak "RDNA 4.0" -> "RDNA 4" olarak degistirdi.
        if k == 'Architecture':
            v = re.sub(r'^(RDNA|GCN) (\d+)$', r'\1 \2.0', v)
        # Yeni sayfalar "18.9 billion" yaziyor; uygulama milyon bekliyor
        # (src/kinds/gpu.js), mevcut kayitlar "53,900 million".
        if k == 'Transistors':
            m = re.fullmatch(r'([\d.,]+)\s*billion', v)
            if m:
                v = f"{round(float(m.group(1).replace(',', '')) * 1000):,} million"
        rec[k] = v
    return rec


def release_year(rec):
    m = re.search(r'(19|20)\d{2}', rec.get('Release Date', ''))
    return int(m.group(0)) if m else None


class Source:
    def __init__(self, tab, headless, delay):
        self.tab = tab
        self.headless = headless
        self.delay = delay
        self.last = 0.0

    async def _eval(self, script):
        # execute_script ifadeyi degerlendirir; "return" icin fonksiyona sariyoruz.
        wrapped = f'(async () => {{ {script} }})().then(v => JSON.stringify(v))'
        res = await self.tab.execute_script(wrapped, await_promise=True, return_by_value=True)
        body = res.get('result', {})
        if 'exceptionDetails' in body:
            raise RuntimeError(body['exceptionDetails'].get('exception', {}).get('description')
                               or body['exceptionDetails'].get('text'))
        return json.loads(body['result']['value'])

    async def _state(self):
        try:
            res = await self.tab.execute_script(JS_STATE, return_by_value=True)
            return json.loads(res['result']['result']['value'])
        except Exception:
            return {'pow': True, 'drag': False}  # sayfa gecis halinde

    async def pass_check(self, url):
        await self.tab.go_to(url)
        t0 = time.monotonic()
        warned = False
        while time.monotonic() - t0 < 600:
            st = await self._state()
            if not st['pow']:
                log(f'bot kontrolu gecildi ({time.monotonic() - t0:.1f} sn)')
                return
            if st['drag'] and not warned:
                if self.headless:
                    raise SystemExit('Kaynak site insan dogrulamasi istedi; --headless olmadan calistirin.')
                log('!! Kaynak site insan dogrulamasi istedi. Acik Chrome penceresinde tutamaci '
                    'hedefe surukleyin; 10 dakika bekleniyor.')
                warned = True
            await asyncio.sleep(1)
        raise SystemExit('Bot kontrolu 10 dakikada gecilemedi.')

    async def _throttle(self):
        wait = self.last + random.uniform(*self.delay) - time.monotonic()
        if wait > 0:
            await asyncio.sleep(wait)
        self.last = time.monotonic()

    async def _call(self, script, recover_url):
        for attempt in range(1, 5):
            await self._throttle()
            res = await self._eval(script)
            if res.get('challenge'):
                log('bot kontrolu yeniden istendi')
                await self.pass_check(recover_url)
                continue
            if res.get('status') in (403, 429, 503):
                pause = 60 * attempt
                log(f"HTTP {res['status']}; {pause} sn bekleniyor")
                await asyncio.sleep(pause)
                continue
            return res
        raise SystemExit('Kaynak site tekrar tekrar reddetti; daha uzun --delay ile deneyin.')

    async def search(self, kind, q, page=1):
        script = JS_SEARCH.replace('__ARGS__', f'{json.dumps(kind)}, {json.dumps(q)}, {int(page)}')
        res = await self._call(script, f'{BASE}/{kind}-specs/')
        return res.get('rows') or [], res.get('total') or 0

    async def spec(self, kind, href):
        url = BASE + href
        res = await self._call(JS_SPEC.replace('__ARGS__', json.dumps(url)), url)
        if res.get('status') != 200:
            raise RuntimeError(f"HTTP {res.get('status')} {url}")
        return res


class Skip(Exception):
    """Parca eklenemedi; mesaj eksikler listesine sebep olarak yazilir."""


class Resolver:
    """Liste ismini kaynak arama satirina ({name, href, vendor}) cevirir.

    Arama sonuclari profil klasorunde saklanir: her arama ~100 satir
    dondurdugu icin cogu isim onceki aramalardan cozulur ve --dry-run sonrasi
    gercek calisma ayni aramalari tekrarlamaz.
    """

    def __init__(self, src, kind, profile):
        self.src = src
        self.kind = kind
        self.path = Path(profile) / f'search-cache-{kind}.json'
        stored = json.loads(self.path.read_text(encoding='utf-8')) if self.path.exists() else {}
        if 'rows' not in stored:  # eski bicim: sadece satirlar
            stored = {'rows': stored}
        self.rows = stored['rows']
        self.searched = set(stored.get('searched', []))

    async def resolve(self, name):
        # Tam ad her zaman once aranir. Cache'te baska bir aramadan gelen
        # "X Mobile" varken dogrudan ona dusmek masaustu karti (RTX PRO 5000
        # Blackwell) mobil surumle eslestiriyordu.
        k = key(name)
        if k not in self.rows and k not in self.searched:
            # Arama kelime bazli: "Ryzen 5 9600" yuzlerce Ryzen 5 getirir ve
            # aranan model ilk sayfalara sigmayabilir. Olmazsa yalnizca model
            # numarasiyla ("9600", "i3-10100F", "N4020") tekrar aranir;
            # eslesme her durumda tam ad uzerinden yapilir.
            model = max((t for t in name.split() if re.search(r'\d', t) and len(t) >= 3),
                        key=len, default=None)
            for query in dict.fromkeys(q for q in (name, model) if q):
                page, pages = 1, 1
                while k not in self.rows and page <= min(pages, MAX_SEARCH_PAGES):
                    rows, total = await self.src.search(self.kind, query, page)
                    for row in rows:
                        self.rows.setdefault(key(row['name']), row)
                    pages = -(-total // 100)
                    page += 1
                if k in self.rows:
                    break
            self.searched.add(k)
            self.path.write_text(json.dumps({'rows': self.rows, 'searched': sorted(self.searched)},
                                            ensure_ascii=False), encoding='utf-8')
        hit = self.rows.get(k)
        # Kaynakta yalnizca mobil hali olan tumlesik GPU'lar
        # ("Iris Xe Graphics G7 96EU" -> "... Mobile").
        if not hit and (hit := self.rows.get(key(name + ' Mobile'))):
            log(f"  mobil varyant: {name} -> {hit['name']}")
        return hit


async def fetch_record(src, kind, hit, check_year=True):
    page = await src.spec(kind, hit['href'])
    title = page.get('title', '').split(' Specs')[0]
    if not key(title).endswith(key(hit['name'])):
        raise Skip(f'sayfa basligi uyusmuyor: {title}')
    rec = normalize(kind, page['fields'])
    year = release_year(rec)
    if check_year and year and year < KINDS[kind]['min_year']:
        raise Skip(f"cikis yili {year}, alt sinir {KINDS[kind]['min_year']}")
    return rec


# Performans endeksinin kullandigi alanlar; yenilemede degisirse log'a yazilir.
WATCH = {
    'gpu': {'Architecture', 'FP32 (float)', 'Bandwidth', 'Memory Size', 'Memory Type', 'Boost Clock',
            'TDP', 'L3 Cache', 'Outputs', 'Release Date'},
    'cpu': {'Codename', 'Market', 'Frequency', 'Turbo Clock', '# of Cores', '# of Threads', 'TDP',
            'Cache L3', 'Release Date'},
}


async def refresh_kind(src, kind, args):
    """Mevcut kayitlari kaynaktan yeniden ceker; id ve kayit sirasi korunur.

    old: eski cekicinin kayitlari (Foundry alani yok; L1 Cache, Tensor Cores da
    yazilmamis ve bazi degerler eskimis). all: hepsi. Sayfada artik olmayan
    eski alanlar (Launch Price gibi) silinmez, korunur.
    """
    cfg = KINDS[kind]
    db, _ = load_db(cfg['db'])
    todo = [r['id'] for r in db if args.refresh == 'all' or 'Foundry' not in r]
    if args.only:
        only = {key(n) for n in args.only}
        todo = [rid for rid in todo if key(next(r['name'] for r in db if r['id'] == rid)) in only]
    if args.limit:
        todo = todo[:args.limit]
    resolver = Resolver(src, kind, args.profile)
    failed = {}
    errors_in_row = 0
    updated = 0

    await src.pass_check(f'{BASE}/{kind}-specs/')
    log(f'{kind}: {len(todo)} kayit yenilenecek ({args.refresh})')

    for rid in todo:
        i = next(n for n, r in enumerate(db) if r['id'] == rid)
        old = db[i]
        try:
            hit = await resolver.resolve(old['name'])
            if not hit:
                raise Skip('kaynak aramasinda yok')
            if args.dry_run:
                log(f"  eslesti: {old['name']} -> {hit['name']} ({hit['href']})")
                continue
            new = await fetch_record(src, kind, hit, check_year=False)
        except Skip as e:
            log(f"  -- {old['name']}: {e}")
            failed[old['name']] = str(e)
            continue
        except Exception as e:  # noqa: BLE001 - tek parca yuzunden calisma durmasin
            errors_in_row += 1
            log(f"  !! {old['name']}: {type(e).__name__}: {e}")
            failed[old['name']] = f'hata: {type(e).__name__}: {e}'
            if errors_in_row >= 5:
                raise SystemExit('Ust uste 5 hata; baglanti ya da sayfa yapisi degismis olabilir.') from e
            continue
        errors_in_row = 0

        fields = {k: v for k, v in old.items() if k not in ('id', 'name')}
        kept = {k: v for k, v in fields.items() if k not in new}
        changed = sorted(k for k in new if fields.get(k) != new[k])
        db[i] = {'id': old['id'], 'name': hit['name'], **new, **kept}
        save_db(cfg['db'], db)
        updated += 1
        renamed = f"  (eski ad: {old['name']})" if hit['name'] != old['name'] else ''
        log(f"  ~ {old['id']:<16} {hit['name']}  {len(changed)} alan yeni/degisti"
            + (f", korunan: {', '.join(sorted(kept))}" if kept else '') + renamed)
        for k in changed:
            if k in WATCH[kind] and k in fields:
                log(f'      {k}: {fields[k]!r} -> {new[k]!r}')

    if args.dry_run:
        log(f'{kind}: {len(todo) - len(failed)} eslesti, {len(failed)} eslesmedi (dry-run, dosyalar degismedi)')
    else:
        log(f'{kind}: {updated} kayit yenilendi, {len(failed)} yenilenemedi')
    for name, reason in failed.items():
        log(f'  {name}  # {reason}')


async def run_kind(src, kind, args):
    cfg = KINDS[kind]
    db, fixed = load_db(cfg['db'])
    if fixed:
        log(f'{kind}: {fixed} alanda bozuk "mm²" duzeltildi')
    have = {key(r['name']) for r in db}
    popular = read_list(cfg['list'])
    # Eksikler listesi popular listedeki isimlerden olusur; orada duzeltilen ya
    # da silinen isimlerin eski halleri atilir.
    in_popular = {key(n) for n in popular}
    missing = {n: r for n, r in read_missing(cfg['missing']).items() if key(n) in in_popular}
    # --retry yalnizca eksikleri dener; bunlar oncelikli parcalar oldugu icin
    # hedef sayisi uygulanmaz.
    if args.retry:
        retry = {key(n) for n in missing}
        wanted, target = [n for n in popular if key(n) in retry], 0
    else:
        wanted, target = popular, args.target
    resolver = Resolver(src, kind, args.profile)
    # Onceki calismada bulunamayanlar kaynakta yeniden aranir (sonradan
    # eklenmis olabilirler); olumsuz sonuc bir sonraki calismaya tasinmaz.
    resolver.searched -= {key(n) for n in missing}
    next_num = next_id_num(db, kind)
    added = []
    failed = {}
    errors_in_row = 0
    today = time.strftime('%Y-%m-%d')

    await src.pass_check(f'{BASE}/{kind}-specs/')
    log(f"{kind}: datasette {len(db)} kayit, hedef {target or 'yok'}, denenecek {len(wanted)} isim")

    for name in wanted:
        if target and len(db) + (len(added) if args.dry_run else 0) >= target:
            break
        if args.limit and len(added) >= args.limit:
            break
        if key(name) in have or key(name + ' Mobile') in have:
            missing.pop(name, None)
            continue
        try:
            hit = await resolver.resolve(name)
            if not hit:
                raise Skip('kaynak aramasinda yok')
            if key(hit['name']) in have:
                missing.pop(name, None)
                continue
            if args.dry_run:
                log(f"  eslesti: {name} -> {hit['name']} ({hit['href']})")
                have.add(key(hit['name']))
                added.append(hit['name'])
                continue
            rec = await fetch_record(src, kind, hit)
        except Skip as e:
            log(f'  -- {name}: {e}')
            failed[name] = f'{e} ({today})'
            continue
        except Exception as e:  # noqa: BLE001 - tek parca yuzunden calisma durmasin
            errors_in_row += 1
            log(f'  !! {name}: {type(e).__name__}: {e}')
            failed[name] = f'hata: {type(e).__name__}: {e} ({today})'
            if errors_in_row >= 5:
                raise SystemExit('Ust uste 5 hata; baglanti ya da sayfa yapisi degismis olabilir.') from e
            continue
        errors_in_row = 0

        vendor = VENDORS.get(hit['vendor'].lower(), 'other')
        db.append({'id': f'{kind}{next_num}{vendor}', 'name': hit['name'], **rec})
        next_num += 1
        have.add(key(hit['name']))
        added.append(hit['name'])
        missing.pop(name, None)
        save_db(cfg['db'], db)
        log(f"  + {db[-1]['id']:<16} {hit['name']}  ({len(rec)} alan)  [{len(db)}]")

    if args.dry_run:
        log(f'{kind}: {len(added)} eslesti, {len(failed)} eslesmedi (dry-run, dosyalar degismedi)')
        for name, reason in failed.items():
            log(f'  {name}  # {reason}')
        return

    if fixed and not added:
        save_db(cfg['db'], db)
    # Eksikler listesi oncelik sirasinda (populer listedeki sira) tutulur.
    missing.update(failed)
    order = {key(n): i for i, n in enumerate(popular)}
    missing = dict(sorted(((n, r) for n, r in missing.items() if key(n) not in have),
                          key=lambda nr: order.get(key(nr[0]), len(order))))
    write_missing(cfg['missing'], kind, missing)
    log(f'{kind}: {len(added)} eklendi, toplam {len(db)}; bu calismada cekilemeyen {len(failed)}, '
        f'eksikler listesinde {len(missing)} ({cfg["missing"].name})')


async def main():
    ap = argparse.ArgumentParser(description='GPU/CPU veri cekici')
    ap.add_argument('--kind', choices=['gpu', 'cpu', 'all'], default='all')
    # Varsayilan listenin tamami: bir ust sinir, listenin sonundaki hala satilan
    # masaustu parcalarini eski dizustu cipleri lehine disarida birakiyordu.
    ap.add_argument('--target', type=int, default=0,
                    help='tur basina toplam kayit hedefi; 0 (varsayilan) = listenin tamami')
    ap.add_argument('--limit', type=int, default=0, help='bu calismada en fazla N yeni kayit')
    ap.add_argument('--delay', type=float, nargs=2, default=(3.0, 6.0), metavar=('MIN', 'MAX'),
                    help='istekler arasi rastgele bekleme (sn)')
    ap.add_argument('--dry-run', action='store_true', help='sadece isim eslestir, dosyaya yazma')
    ap.add_argument('--retry', action='store_true',
                    help='yalnizca missing-*.txt listesindekileri dene (hedef sayisi uygulanmaz)')
    ap.add_argument('--refresh', choices=['old', 'all'],
                    help='yeni parca eklemek yerine mevcut kayitlari yenile (old: Foundry alani olmayanlar)')
    ap.add_argument('--only', nargs='+', metavar='ISIM',
                    help='--refresh ile: yalnizca bu isimdeki kayitlar (orn. --refresh all --only "GeForce 210")')
    ap.add_argument('--headless', action='store_true')
    ap.add_argument('--profile', default=os.path.join(os.environ.get('LOCALAPPDATA', str(Path.home())),
                                                      'pcparts-scraper-profile'),
                    help='Chrome profil klasoru (firewall cookie burada kalir)')
    args = ap.parse_args()
    if not BASE:
        raise SystemExit('Kaynak adresi yok: PCPARTS_SOURCE ortam degiskenini ya da '
                         'scripts/dataset/kaynak.local.txt dosyasini ayarlayin.')

    opts = ChromiumOptions()
    opts.add_argument(f'--user-data-dir={args.profile}')
    opts.headless = args.headless
    async with Chrome(options=opts) as browser:
        tab = await browser.start()
        src = Source(tab, args.headless, tuple(args.delay))
        for kind in (['gpu', 'cpu'] if args.kind == 'all' else [args.kind]):
            await (refresh_kind if args.refresh else run_kind)(src, kind, args)


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())
