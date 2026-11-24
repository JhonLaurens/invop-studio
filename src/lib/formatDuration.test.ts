import { describe, expect, it } from "vitest";
import { formatTime, formatTimeColumn } from "./formatDuration";
import { BASE_QUEUE, bestCost, scanConfigs } from "./queues";

describe("formatTime", () => {
  it("mantiene la unidad del encabezado y precisión en las celdas", () => {
    expect(formatTimeColumn(0.00172)).toBe("0,00172");
    expect(formatTimeColumn(0.00004972)).toBe("4,972 × 10⁻⁵");
    expect(formatTimeColumn(-0.000000001637)).toBe("-1,637 × 10⁻⁹");
    expect(formatTimeColumn(0)).toBe("0");
    expect(formatTimeColumn(Number.NaN)).toBe("—");
  });
  it("no colapsa valores pequeños a 0,00", () => {
    expect(formatTime(0.00172, "h")).not.toBe("0,00");
    expect(formatTime(0.00172, "h")).not.toMatch(/^0,00/);
    expect(formatTime(0.003, "min")).not.toMatch(/^0,00/);
  });
});

describe("SLA invariante a la unidad de presentación", () => {
  it("el mejor s y slaOk no dependen de cómo se muestre el tiempo", () => {
    const best = bestCost(scanConfigs(BASE_QUEUE));
    expect(best).not.toBeNull();
    if (!best) return;
    expect(best.s).toBe(4);
    expect(best.slaOk).toBe(true);
    expect(formatTime(best.wSec / 3600, "h")).not.toMatch(/^0,00/);
  });
});
