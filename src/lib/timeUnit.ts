export type TimeUnit = "s" | "min" | "h";

const FACTOR: Record<TimeUnit, number> = { s: 1, min: 60, h: 3600 };

export function timeUnitLabel(unit: TimeUnit): string {
  return unit === "s" ? "s" : unit === "min" ? "min" : "h";
}

/** Convierte segundos a la unidad de visualización. */
export function fromSeconds(sec: number, unit: TimeUnit): number {
  return sec / FACTOR[unit];
}

/** Convierte valor en unidad de visualización a segundos. */
export function toSeconds(value: number, unit: TimeUnit): number {
  return value * FACTOR[unit];
}

/** Tasas internas en /min → etiqueta según unidad elegida. */
export function ratePerUnitLabel(unit: TimeUnit): string {
  if (unit === "min") return "/min";
  if (unit === "h") return "/h";
  return "/s";
}

export function convertRateFromPerMin(ratePerMin: number, unit: TimeUnit): number {
  if (unit === "min") return ratePerMin;
  if (unit === "h") return ratePerMin * 60;
  return ratePerMin / 60;
}

/** Costo por entidad y minuto a la unidad mostrada. */
export function costFromPerMinute(cost: number, unit: TimeUnit): number {
  return unit === "s" ? cost / 60 : unit === "h" ? cost * 60 : cost;
}

/** Costo mostrado a la unidad interna por minuto. */
export function costToPerMinute(cost: number, unit: TimeUnit): number {
  return unit === "s" ? cost * 60 : unit === "h" ? cost / 60 : cost;
}
