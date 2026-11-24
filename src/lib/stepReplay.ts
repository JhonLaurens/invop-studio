import type { TransportStep } from "./transport";
import { parseAssignQty, parseRouteFromStep } from "./stepParse";

export function buildPartialMatrix(
  steps: TransportStep[] | { label: string; detail: string; i?: number; j?: number; qty?: number }[],
  stepIndex: number,
  originNames: string[],
  destNames: string[],
): number[][] {
  const m = originNames.length;
  const n = destNames.length;
  const alloc = Array.from({ length: m }, () => Array(n).fill(0));
  const upto = Math.min(stepIndex, steps.length - 1);

  for (let s = 0; s <= upto; s++) {
    const step = steps[s];
    if (step.i != null && step.j != null && step.qty != null) {
      alloc[step.i][step.j] += step.qty;
      continue;
    }
    const route = parseRouteFromStep(step.label, step.detail);
    const qty = parseAssignQty(step.detail) ?? parseAssignQty(step.label);
    if (!route || qty == null) continue;
    const i = originNames.indexOf(route.from);
    const j = destNames.indexOf(route.to);
    if (i >= 0 && j >= 0) alloc[i][j] += qty;
  }
  return alloc;
}

/** @deprecated use buildPartialMatrix */
export function allocationThroughStep(
  steps: { label: string; detail: string; i?: number; j?: number; qty?: number }[],
  stepIndex: number,
  originNames: string[],
  destNames: string[],
): number[][] {
  return buildPartialMatrix(steps, stepIndex, originNames, destNames);
}