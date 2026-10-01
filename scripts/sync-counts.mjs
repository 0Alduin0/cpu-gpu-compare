/**
 * src/data/counts.js dosyasini veritabanlarindaki kayit sayisina gore gunceller.
 * Veri dosyalari degistiginde calistirin: npm run sync-counts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const count = (f) => JSON.parse(readFileSync(join(root, 'data', f), 'utf8')).length

const cpu = count('cpu_database.json')
const gpu = count('gpu_database.json')

const contents = `/**
 * Ana sayfadaki sayaclar.
 *
 * "npm run sync-counts" komutu ile veritabanlarindan uretilir.
 * Hero bileseninin JSON'lari import etmemesi icin ayri tutulur; aksi halde
 * ana sayfa sadece iki sayi gostermek icin ~200 KB veri indirir.
 */
export const CPU_COUNT = ${cpu}
export const GPU_COUNT = ${gpu}
`

writeFileSync(join(root, 'src', 'data', 'counts.js'), contents)

// Arama motoru açıklaması da aynı sayıları söylesin (eskiden elle yazılıydı ve geride kalmıştı).
const htmlPath = join(root, 'index.html')
const html = readFileSync(htmlPath, 'utf8')
const description = `${gpu} ekran kartı ve ${cpu} işlemciyi yan yana karşılaştır. Teknik özelliklerden hesaplanan, yöntemi açık tahmini performans endeksi.`
const nextHtml = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
if (nextHtml === html && !html.includes(description)) throw new Error('index.html içinde <meta name="description"> bulunamadı')
writeFileSync(htmlPath, nextHtml)

console.log(`counts.js ve index.html guncellendi: ${cpu} CPU, ${gpu} GPU`)
