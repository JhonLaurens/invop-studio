export type RoutePair = { from: string; to: string };

export function parseAssignQty(text: string): number | null {
  const match = text.match(/Asignar\s+([\d.]+)/);
  return match ? Number(match[1]) : null;
}

export function parseRoute(label: string): RoutePair | null {
  if (label.includes("→")) {
    const [from, rawTo] = label.split("→").map((s) => s.trim());
    const to = rawTo.replace(/\s+costo.*$/i, "").trim();
    return { from, to };
  }
  const cell = label.match(/\(([^,]+),\s*([^)]+)\)/);
  if (cell) return { from: cell[1].trim(), to: cell[2].trim() };
  return null;
}

/** Parsea origen/destino desde etiqueta o detalle (p. ej. Vogel). */
export function parseRouteFromStep(label: string, detail: string): RoutePair | null {
  const fromLabel = parseRoute(label);
  if (fromLabel) return fromLabel;
  const fromDetail = parseRoute(detail);
  if (fromDetail) return fromDetail;
  const assignCell = detail.match(/\(([^,]+),\s*([^)]+)\)/);
  if (assignCell) return { from: assignCell[1].trim(), to: assignCell[2].trim() };
  return null;
}