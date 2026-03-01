export function fuzzyScore(query: string, target: string): number {
  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 0;

  if (t.includes(q)) {
    return 1000 - t.indexOf(q);
  }

  let ti = 0;
  let score = 0;
  for (let qi = 0; qi < q.length; qi += 1) {
    const ch = q[qi];
    const nextIndex = t.indexOf(ch, ti);
    if (nextIndex === -1) {
      return -1;
    }
    score += 10 - Math.min(9, nextIndex - ti);
    ti = nextIndex + 1;
  }
  return score;
}

export function fuzzyMatch<T>(
  query: string,
  items: T[],
  getText: (item: T) => string
): T[] {
  const q = query.trim();
  if (!q) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(q, getText(item)) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
