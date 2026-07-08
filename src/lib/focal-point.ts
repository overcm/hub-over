export function focalPointToObjectPosition(x: number | null | undefined, y: number | null | undefined) {
  const fx = x ?? 0.5;
  const fy = y ?? 0.5;
  return `${(fx * 100).toFixed(2)}% ${(fy * 100).toFixed(2)}%`;
}
