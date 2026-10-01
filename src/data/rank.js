/**
 * Endekse göre sıra (1 = en güçlü). Sunucu parçaları kendi aralarında sıralanır;
 * masaüstü ve dizüstü sıralamasına karışmaz.
 *
 * rank: id -> grubundaki sıra; count: { main, server } sıralanan parça sayısı.
 */
export function rankParts(list) {
  const rank = new Map()
  const count = {}
  for (const group of ['main', 'server']) {
    const ranked = list
      .filter(x => x.perfIndex != null && (x.server ? 'server' : 'main') === group)
      .sort((a, b) => b.perfIndex - a.perfIndex)
    ranked.forEach((x, i) => rank.set(x.id, i + 1))
    count[group] = ranked.length
  }
  return { rank, count }
}
