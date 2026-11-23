import {
  BASE_TRANSPORT,
  balance,
  minimumCost,
  modi,
  northwest,
  vogel,
} from "../src/lib/transport.ts";
import assert from "node:assert/strict";
import { BASE_QUEUE, bestCost, evaluateMMs, scanConfigs } from "../src/lib/queues.ts";

const bal = balance(BASE_TRANSPORT);
const no = northwest(bal);
const cm = minimumCost(bal);
const vo = vogel(bal);
const opt = modi(bal.costs, vo.allocation);

console.log("Transporte:", {
  NO: no.totalCost,
  CM: cm.totalCost,
  Vogel: vo.totalCost,
  Opt: opt.totalCost,
});

const mm2 = evaluateMMs(15, 10, 2, 40, 300, 7, 10);
const mm3 = evaluateMMs(15, 10, 3, 40, 300, 7, 10);
const mm4 = evaluateMMs(15, 10, 4, 40, 300, 7, 10);
console.log("Colas CT/h:", {
  s2: mm2.totalCost.toFixed(2),
  s3: mm3.totalCost.toFixed(2),
  s4: mm4.totalCost.toFixed(2),
});
console.log("s4 sla", mm4.slaOk);

const near = (actual, expected, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
assert.deepEqual([no.totalCost, cm.totalCost, vo.totalCost, opt.totalCost], [13000, 10700, 9400, 8750]);
assert.ok(opt.certified);
for (const [config, expected] of [[mm2, 1108.57], [mm3, 641.05], [mm4, 623.43]]) near(config.totalCost, expected);
assert.equal(evaluateMMs(15, 10, 1, 40, 300).stable, false);
assert.equal(evaluateMMs(20, 10, 2, 40, 300).stable, false);
assert.equal(bestCost(scanConfigs(BASE_QUEUE)).s, 4);
const growth = bestCost(scanConfigs({ ...BASE_QUEUE, lambda: 20 }));
assert.equal(growth.s, 5);
near(growth.totalCost, 811.94);
assert.ok(growth.slaOk);
const changed = balance({ ...BASE_TRANSPORT, costs: BASE_TRANSPORT.costs.map((row, i) => row.map((c, j) => i === 2 && j === 0 ? 9 : c)) });
const changedVo = vogel(changed);
assert.equal(changedVo.totalCost, 11300);
const changedOpt = modi(changed.costs, minimumCost(changed).allocation);
assert.ok(changedOpt.certified);
assert.equal(changedOpt.totalCost, 9800);
const degenerate = modi([[5, 1], [1, 5]], [[10, 0], [0, 10]]);
assert.ok(degenerate.certified);
assert.equal(degenerate.totalCost, 20);
console.log("Validaciones automáticas: base, crecimiento, cambio de costo y degeneración correctos.");
