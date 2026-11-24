import { describe, expect, it } from "vitest";
import { BASE_TRANSPORT, balance, minimumCost, modi, northwest, vogel } from "./transport";
import { BASE_QUEUE, bestCost, evaluateMMs, scanConfigs } from "./queues";
import { fmtNum, fmtPct } from "./format";
import { transportToCsv } from "./exportData";

describe("transporte: cálculos y balance", () => {
  it("exporta los costos de reserva y protege nombres con comas", () => {
    const csv = transportToCsv({ ...BASE_TRANSPORT, originNames: ["A, principal", ...BASE_TRANSPORT.originNames.slice(1)] });
    expect(csv.split("\n")[0]).toContain("Costo de reserva");
    expect(csv.split("\n")[1]).toBe('"A, principal",2,5,3,6,1000,3');
  });
  it("reproduce los cuatro costos del ejercicio y conserva las restricciones", () => {
    const problem = balance(BASE_TRANSPORT);
    const methods = [northwest(problem), minimumCost(problem), vogel(problem)];
    const optimal = modi(problem.costs, methods[2].allocation);
    expect([...methods.map((m) => m.totalCost), optimal.totalCost]).toEqual([13000, 10700, 9400, 8750]);
    expect(optimal.certified).toBe(true);
    for (const sol of [...methods, optimal]) {
      sol.allocation.forEach((row, i) => expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(problem.supply[i]));
      problem.demand.forEach((d, j) => expect(sol.allocation.reduce((sum, row) => sum + row[j], 0)).toBeCloseTo(d));
      expect(sol.allocation.flat().every((value) => value >= 0)).toBe(true);
    }
  });

  it("no considera óptima una solución con mejora de costo menor que 1e-9", () => {
    const result = modi([[0, 0], [0, 1e-10]], [[1, 0], [0, 1]]);
    expect(result.certified).toBe(true);
    expect(result.totalCost).toBe(0);
  });

  it("no crea un destino ficticio por un residuo binario de 0,1 + 0,2", () => {
    const b = balance({ originNames: ["A", "B"], destNames: ["D"], supply: [0.1, 0.2], demand: [0.3], costs: [[1], [1]] });
    expect(b.dummyCol).toBe(false);
    expect(b.dummyRow).toBe(false);
  });

  it("crea un origen ficticio cuando la demanda supera la oferta", () => {
    const b = balance({ ...BASE_TRANSPORT, demand: [800, 700, 700, 1200] });
    expect(b.dummyRow).toBe(true);
    expect(b.surplus).toBe(300);
    expect(b.costs.at(-1)).toEqual([0, 0, 0, 0]);
  });

  it("detecta que H4 = 900 equilibra la oferta: no hay faltante", () => {
    const b = balance({ ...BASE_TRANSPORT, demand: [800, 700, 700, 900] });
    expect(b.dummyRow || b.dummyCol).toBe(false);
    expect(modi(b.costs, vogel(b).allocation).totalCost).toBe(10300);
  });
});

describe("colas: fórmulas y escenarios del curso", () => {
  it("no presenta como cero indicadores o probabilidades positivas pequeñas", () => {
    expect(fmtNum(0.00000001, 4)).toBe("1,000 × 10⁻⁸");
    expect(fmtPct(0.00000001)).toBe("1,000 × 10⁻⁶ %");
    expect(fmtNum(0, 4)).toBe("0,0000");
  });
  it("satisface las fórmulas M/M/1 y las leyes de Little", () => {
    const c = evaluateMMs(15, 30, 1, 110, 300, 7, 10);
    expect(c.p0).toBeCloseTo(0.5);
    expect(c.pw).toBeCloseTo(0.5);
    expect(c.lq).toBeCloseTo(0.5);
    expect(c.l).toBeCloseTo(1);
    expect(c.wSec).toBeCloseTo(4);
    expect(c.totalCost).toBeCloseTo(410);
    expect(c.slaOk).toBe(false);
    expect(c.lq).toBeCloseTo(15 * c.wqMin);
    expect(c.l).toBeCloseTo(15 * c.wMin);
  });

  it("identifica inestabilidad en el límite y el óptimo del escenario de crecimiento", () => {
    expect(evaluateMMs(20, 10, 2, 40, 300).stable).toBe(false);
    const best = bestCost(scanConfigs({ ...BASE_QUEUE, lambda: 20 }));
    expect(best?.s).toBe(5);
    expect(best?.totalCost).toBeCloseTo(811.94, 2);
    expect(best?.slaOk).toBe(true);
  });

  it("distingue el menor costo de las configuraciones que cumplen SLA", () => {
    const configs = scanConfigs({ ...BASE_QUEUE, pwMax: 1 });
    expect(bestCost(configs)?.s).toBe(4);
    expect(bestCost(configs)?.slaOk).toBe(false);
    expect(bestCost(configs.filter((c) => c.slaOk))).toBeNull();
  });
});
