import { describe, expect, it } from "vitest";
import { BASE_QUEUE, bestCost, evaluateMMs, queueDistribution, scanConfigs } from "./queues";
import { convertRateFromPerMin, costFromPerMinute, costToPerMinute } from "./timeUnit";

describe("distribución de probabilidades M/M/s", () => {
  it("alcanza el 99 % en el ejemplo base y conserva P0", () => {
    const best = bestCost(scanConfigs(BASE_QUEUE))!;
    const probabilities = queueDistribution(best, BASE_QUEUE.lambda, BASE_QUEUE.mu);
    expect(probabilities[0]).toBeCloseTo(best.p0);
    expect(probabilities.reduce((sum, value) => sum + value, 0)).toBeGreaterThanOrEqual(0.99);
    expect(probabilities.reduce((sum, value) => sum + value, 0)).toBeLessThanOrEqual(1);
  });

  it("limita los estados sin fingir cobertura del 99 % cerca de saturación", () => {
    const config = evaluateMMs(19.8, 10, 2, 40, 300);
    const probabilities = queueDistribution(config, 19.8, 10);
    expect(probabilities).toHaveLength(60);
    expect(probabilities.reduce((sum, value) => sum + value, 0)).toBeLessThan(0.99);
  });

  it("no genera probabilidades para un sistema inestable", () => {
    expect(queueDistribution(evaluateMMs(15, 10, 1, 40, 300), 15, 10)).toEqual([]);
  });
});

describe("escalas de tasas", () => {
  it("convierte el costo de espera entre segundos, minutos y horas sin cambiar el valor interno", () => {
    for (const unit of ["s", "min", "h"] as const) {
      expect(costToPerMinute(costFromPerMinute(5, unit), unit)).toBeCloseTo(5);
    }
    expect(costFromPerMinute(5, "s")).toBeCloseTo(5 / 60);
    expect(costFromPerMinute(5, "h")).toBe(300);
  });
  it("convierte de forma proporcional los valores y límites de los controles", () => {
    expect(convertRateFromPerMin(15, "h")).toBe(900);
    expect(convertRateFromPerMin(40, "h")).toBe(2400);
    expect(convertRateFromPerMin(15, "s")).toBe(0.25);
    expect(convertRateFromPerMin(1, "s")).toBeCloseTo(1 / 60);
  });
});
