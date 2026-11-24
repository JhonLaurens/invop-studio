import type { TimeUnit } from "./timeUnit";
import { fromSeconds, timeUnitLabel } from "./timeUnit";
import { fmtNum, fmtScientific } from "./format";

const SUB: Record<TimeUnit, TimeUnit | null> = { h: "min", min: "s", s: null };

/** Formatea sin cambiar la unidad indicada en el encabezado de la columna. */
export function formatTimeColumn(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value !== 0 && Math.abs(value) < 0.0001) {
    return fmtScientific(value);
  }
  return new Intl.NumberFormat("es-CO", { maximumSignificantDigits: 4, useGrouping: false }).format(value);
}

/** Valor ya expresado en `unit`. Nunca muestra "0,00" si el valor es distinto de cero. */
export function formatTime(valueInUnit: number, unit: TimeUnit): string {
  if (!Number.isFinite(valueInUnit)) return "—";
  if (valueInUnit === 0) return `0 ${timeUnitLabel(unit)}`;
  const abs = Math.abs(valueInUnit);
  if (abs < 0.01) {
    const sub = SUB[unit];
    if (sub === "min") return formatTime(valueInUnit * 60, "min");
    if (sub === "s") return formatTime(valueInUnit * 60, "s");
    if (abs < 0.0001) return `${fmtScientific(valueInUnit)} ${timeUnitLabel(unit)}`;
    const digits = Math.max(3, Math.ceil(-Math.log10(abs)) + 2);
    return `${fmtNum(valueInUnit, digits)} ${timeUnitLabel(unit)}`;
  }
  const digits = abs >= 100 ? 1 : abs >= 10 ? 2 : 3;
  return `${fmtNum(valueInUnit, digits)} ${timeUnitLabel(unit)}`;
}

/** Segundos → texto en la unidad preferida, bajando de unidad si el número queda diminuto. */
export function formatDuration(sec: number, prefUnit: TimeUnit): string {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  return formatTime(fromSeconds(sec, prefUnit), prefUnit);
}
