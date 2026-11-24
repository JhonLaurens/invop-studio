import { describe, expect, it } from "vitest";
import { BASE_TRANSPORT, balance, minimumCost, northwest, vogel } from "./transport";
import { buildPartialMatrix } from "./stepReplay";

function rowSums(alloc: number[][], supply: number[]) {
  return alloc.map((row, i) => ({ i, sum: row.reduce((a, b) => a + b, 0), supply: supply[i] }));
}

describe("buildPartialMatrix", () => {
  const bal = balance(BASE_TRANSPORT);

  for (const [name, sol] of [
    ["noroeste", northwest(bal)],
    ["costo mínimo", minimumCost(bal)],
    ["vogel", vogel(bal)],
  ] as const) {
    it(`${name}: último paso cuadra ofertas y coincide con solución`, () => {
      const last = sol.steps.length - 1;
      const partial = buildPartialMatrix(sol.steps, last, bal.originNames, bal.destNames);
      for (const { sum, supply } of rowSums(partial, bal.supply)) {
        expect(sum).toBeCloseTo(supply, 6);
      }
      expect(partial).toEqual(sol.allocation);
    });
  }
});