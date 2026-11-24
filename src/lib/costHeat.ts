export function costHeatLevel(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  if (max <= min) return 0.35;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

export function costMinMax(matrix: number[][]): { min: number; max: number } {
  const flat = matrix.flat();
  return { min: Math.min(...flat), max: Math.max(...flat) };
}

/** Escala por percentiles para evitar bloques uniformes cuando todos los costos son iguales. */
export function costPercentileLevel(value: number, matrix: number[][]): number {
  const flat = [...matrix.flat()].sort((a, b) => a - b);
  if (!flat.length) return 0.35;
  const uniq = [...new Set(flat)];
  if (uniq.length === 1) return 0.2;
  const rank = flat.filter((x) => x <= value).length / flat.length;
  return Math.min(1, Math.max(0, rank));
}