export const HEATMAP_BUCKETS = 20;

export function bucketIndexFor(currentTime: number, duration: number) {
  if (!duration || duration <= 0) return 0;
  const ratio = Math.min(Math.max(currentTime / duration, 0), 0.999);
  return Math.floor(ratio * HEATMAP_BUCKETS);
}

export function withBucketSet(watchedBuckets: number, bucketIndex: number) {
  return watchedBuckets | (1 << bucketIndex);
}

export function bitmaskToBuckets(watchedBuckets: number): boolean[] {
  return Array.from({ length: HEATMAP_BUCKETS }, (_, i) => (watchedBuckets & (1 << i)) !== 0);
}

function bucketCounts(bitmasks: number[]) {
  const counts = new Array(HEATMAP_BUCKETS).fill(0);
  for (const mask of bitmasks) {
    const buckets = bitmaskToBuckets(mask);
    buckets.forEach((watched, i) => {
      if (watched) counts[i]++;
    });
  }
  return counts;
}

/** Intensidade relativa (0–1) de cada trecho, normalizada pelo trecho mais assistido — usada para desenhar o gráfico. */
export function computeHeatmap(bitmasks: number[]): number[] {
  const counts = bucketCounts(bitmasks);
  const max = Math.max(1, ...counts);
  return counts.map((c) => c / max);
}
