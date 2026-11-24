type ChartTheme = "light" | "dark";

const LIGHT = {
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  transportBar: "#102d69",
  transportBarOpt: "#17643e",
  transportBarMuted: "#5a6f8f",
  lineService: "#2563eb",
  lineWait: "#0891b2",
  lineTotal: "#a78bfa",
  pnBar: "#1c527c",
} as const;

const DARK = {
  ...LIGHT,
  lineService: "#7eb8ff",
  lineWait: "#5eead4",
  lineTotal: "#d8b4fe",
  pnBar: "#56acde",
  transportBar: "#7eb8ff",
  transportBarMuted: "#94a3b8",
} as const;

const LIGHT_FULL = { ...LIGHT, transportBarMuted: "#5a6f8f" } as const;

export function chartPalette(theme: ChartTheme) {
  return theme === "dark" ? DARK : LIGHT_FULL;
}

/** @deprecated usar chartPalette(theme) */
export const CHART = { ...LIGHT, tooltipBg: "var(--chart-tooltip-bg)", tooltipBorder: "var(--chart-tooltip-border)", pnLine: LIGHT.pnBar };

export const chartMargin = { top: 8, right: 12, left: 4, bottom: 4 };