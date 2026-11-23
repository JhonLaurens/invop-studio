export interface TransportInput {
  originNames: string[];
  destNames: string[];
  costs: number[][];
  supply: number[];
  demand: number[];
  storageCosts?: number[];
}

export interface BalancedProblem {
  costs: number[][];
  supply: number[];
  demand: number[];
  originNames: string[];
  destNames: string[];
  dummyCol: boolean;
  dummyRow: boolean;
  surplus: number;
}

export interface AllocCell {
  i: number;
  j: number;
  amount: number;
}

export interface TransportStep {
  label: string;
  detail: string;
}

export interface TransportSolution {
  allocation: number[][];
  totalCost: number;
  steps: TransportStep[];
}

export interface ModiIteration {
  u: number[];
  v: number[];
  reduced: number[][];
  entering?: { i: number; j: number; rc: number };
  theta?: number;
  cost: number;
  optimal: boolean;
}

function copy2d<T>(m: T[][]): T[][] {
  return m.map((r) => [...r]);
}

export function balance(input: TransportInput): BalancedProblem {
  const supply = [...input.supply];
  const demand = [...input.demand];
  const costs = copy2d(input.costs);
  const originNames = [...input.originNames];
  const destNames = [...input.destNames];
  let dummyCol = false;
  let dummyRow = false;
  let surplus = 0;

  const sTot = supply.reduce((a, b) => a + b, 0);
  const dTot = demand.reduce((a, b) => a + b, 0);

  if (sTot > dTot) {
    surplus = sTot - dTot;
    dummyCol = true;
    destNames.push("Reserva (ficticio)");
    const stor = input.storageCosts ?? supply.map(() => 0);
    for (let i = 0; i < costs.length; i++) {
      costs[i].push(stor[i] ?? 0);
    }
    demand.push(surplus);
  } else if (dTot > sTot) {
    surplus = dTot - sTot;
    dummyRow = true;
    originNames.push("Origen ficticio");
    const row = costs[0].map(() => 0);
    costs.push(row);
    supply.push(surplus);
    demand.forEach((_, j) => {
      costs[costs.length - 1][j] = 0;
    });
  }

  return { costs, supply, demand, originNames, destNames, dummyCol, dummyRow, surplus };
}

function z(costs: number[][], alloc: number[][]) {
  let t = 0;
  for (let i = 0; i < costs.length; i++)
    for (let j = 0; j < costs[0].length; j++) t += costs[i][j] * alloc[i][j];
  return t;
}

function basics(alloc: number[][]) {
  const cells: { i: number; j: number }[] = [];
  for (let i = 0; i < alloc.length; i++)
    for (let j = 0; j < alloc[0].length; j++)
      if (alloc[i][j] > 0) cells.push({ i, j });
  return cells;
}

function ensureDegeneracy(
  costs: number[][],
  alloc: number[][],
  addZero: (i: number, j: number) => void,
) {
  const m = costs.length;
  const n = costs[0].length;
  let basicsCount = basics(alloc).length;
  if (basicsCount >= m + n - 1) return;
  for (let i = 0; i < m && basicsCount < m + n - 1; i++) {
    for (let j = 0; j < n && basicsCount < m + n - 1; j++) {
      if (alloc[i][j] === 0) {
        addZero(i, j);
        basicsCount++;
      }
    }
  }
}

export function northwest(bal: BalancedProblem): TransportSolution {
  const m = bal.costs.length;
  const n = bal.costs[0].length;
  const alloc = Array.from({ length: m }, () => Array(n).fill(0));
  const supply = [...bal.supply];
  const demand = [...bal.demand];
  const steps: TransportStep[] = [];
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    const q = Math.min(supply[i], demand[j]);
    alloc[i][j] = q;
    supply[i] -= q;
    demand[j] -= q;
    steps.push({
      label: `${bal.originNames[i]} → ${bal.destNames[j]}`,
      detail: `Asignar ${q}. Queda fila ${supply[i]}, columna ${demand[j]}.`,
    });
    if (supply[i] === 0 && demand[j] === 0) {
      j++;
    } else if (supply[i] === 0) i++;
    else j++;
  }

  ensureDegeneracy(bal.costs, alloc, () => {});
  return { allocation: alloc, totalCost: z(bal.costs, alloc), steps };
}

export function minimumCost(bal: BalancedProblem): TransportSolution {
  const m = bal.costs.length;
  const n = bal.costs[0].length;
  const alloc = Array.from({ length: m }, () => Array(n).fill(0));
  const supply = [...bal.supply];
  const demand = [...bal.demand];
  const activeR = () => supply.map((s, i) => (s > 0 ? i : -1)).filter((x) => x >= 0);
  const activeC = () => demand.map((d, j) => (d > 0 ? j : -1)).filter((x) => x >= 0);
  const steps: TransportStep[] = [];

  while (activeR().length && activeC().length) {
    const rows = activeR();
    const cols = activeC();
    let best: { i: number; j: number; c: number; qty: number } | null = null;
    for (const i of rows) {
      for (const j of cols) {
        const c = bal.costs[i][j];
        const qty = Math.min(supply[i], demand[j]);
        if (!best || c < best.c || (c === best.c && qty > best.qty)) {
          best = { i, j, c, qty };
        }
      }
    }
    if (!best) break;
    const q = Math.min(supply[best.i], demand[best.j]);
    alloc[best.i][best.j] = q;
    supply[best.i] -= q;
    demand[best.j] -= q;
    steps.push({
      label: `Celda (${bal.originNames[best.i]}, ${bal.destNames[best.j]}) costo ${best.c}`,
      detail: `Asignar ${q} unidades (mínimo costo activo).`,
    });
  }

  return { allocation: alloc, totalCost: z(bal.costs, alloc), steps };
}

function penalties(costs: number[][], activeR: number[], activeC: number[]) {
  const rowP: Record<number, number> = {};
  const colP: Record<number, number> = {};
  for (const i of activeR) {
    const vals = activeC.map((j) => costs[i][j]).sort((a, b) => a - b);
    rowP[i] = vals.length >= 2 ? vals[1] - vals[0] : vals[0] ?? 0;
  }
  for (const j of activeC) {
    const vals = activeR.map((i) => costs[i][j]).sort((a, b) => a - b);
    colP[j] = vals.length >= 2 ? vals[1] - vals[0] : vals[0] ?? 0;
  }
  return { rowP, colP };
}

export function vogel(bal: BalancedProblem): TransportSolution {
  const m = bal.costs.length;
  const n = bal.costs[0].length;
  const alloc = Array.from({ length: m }, () => Array(n).fill(0));
  const supply = [...bal.supply];
  const demand = [...bal.demand];
  const steps: TransportStep[] = [];
  let iter = 1;

  while (true) {
    const activeR = supply.map((s, i) => (s > 0 ? i : -1)).filter((x) => x >= 0);
    const activeC = demand.map((d, j) => (d > 0 ? j : -1)).filter((x) => x >= 0);
    if (!activeR.length || !activeC.length) break;

    const { rowP, colP } = penalties(bal.costs, activeR, activeC);

    const lineCandidates: {
      type: "r" | "c";
      idx: number;
      pen: number;
      minCost: number;
      maxQty: number;
    }[] = [];
    for (const i of activeR) {
      const costsInLine = activeC.map((j) => bal.costs[i][j]);
      const minCost = Math.min(...costsInLine);
      const jBest = activeC.find((j) => bal.costs[i][j] === minCost)!;
      lineCandidates.push({
        type: "r",
        idx: i,
        pen: rowP[i],
        minCost,
        maxQty: Math.min(supply[i], demand[jBest]),
      });
    }
    for (const j of activeC) {
      const costsInLine = activeR.map((i) => bal.costs[i][j]);
      const minCost = Math.min(...costsInLine);
      const iBest = activeR.find((i) => bal.costs[i][j] === minCost)!;
      lineCandidates.push({
        type: "c",
        idx: j,
        pen: colP[j],
        minCost,
        maxQty: Math.min(supply[iBest], demand[j]),
      });
    }

    lineCandidates.sort((a, b) => {
      if (b.pen !== a.pen) return b.pen - a.pen;
      if (a.minCost !== b.minCost) return a.minCost - b.minCost;
      return b.maxQty - a.maxQty;
    });
    const line = lineCandidates[0];
    if (!line) break;

    let bi = 0;
    let bj = 0;
    let bc = Infinity;
  const pickCell = (cells: { i: number; j: number }[]) => {
      for (const { i, j } of cells) {
        const c = bal.costs[i][j];
        const q = Math.min(supply[i], demand[j]);
        if (
          c < bc ||
          (c === bc &&
            q > Math.min(supply[bi], demand[bj]))
        ) {
          bc = c;
          bi = i;
          bj = j;
        }
      }
    };
    if (line.type === "r") {
      pickCell(activeC.map((j) => ({ i: line.idx, j })));
    } else {
      pickCell(activeR.map((i) => ({ i, j: line.idx })));
    }

    const q = Math.min(supply[bi], demand[bj]);
    alloc[bi][bj] += q;
    supply[bi] -= q;
    demand[bj] -= q;
    steps.push({
      label: `Iteración ${iter}: penalización máxima`,
      detail: `Línea ${line.type === "r" ? bal.originNames[line.idx] : bal.destNames[line.idx]} (pen=${line.pen}). Asignar ${q} en (${bal.originNames[bi]}, ${bal.destNames[bj]}).`,
    });
    iter++;
  }

  return { allocation: alloc, totalCost: z(bal.costs, alloc), steps };
}

function findLoop(
  basics: { i: number; j: number }[],
  enter: { i: number; j: number },
): { i: number; j: number }[] | null {
  const path: { i: number; j: number }[] = [{ i: enter.i, j: enter.j }];

  function dfs(dir: "row" | "col"): { i: number; j: number }[] | null {
    const cur = path[path.length - 1];
    if (path.length > 1 && cur.i === enter.i && cur.j === enter.j) {
      return [...path];
    }
    if (path.length > 24) return null;

    const seen = (b: { i: number; j: number }) =>
      path.some((p) => p.i === b.i && p.j === b.j);

    if (dir === "row") {
      for (const b of basics) {
        if (b.i !== cur.i || b.j === cur.j) continue;
        if (seen(b)) continue;
        path.push(b);
        const res = dfs("col");
        if (res) return res;
        path.pop();
      }
      if (cur.i === enter.i && cur.j !== enter.j && path.length > 1) {
        path.push(enter);
        return [...path];
      }
    } else {
      for (const b of basics) {
        if (b.j !== cur.j || b.i === cur.i) continue;
        if (seen(b)) continue;
        path.push(b);
        const res = dfs("row");
        if (res) return res;
        path.pop();
      }
      if (cur.j === enter.j && cur.i !== enter.i && path.length > 1) {
        path.push(enter);
        return [...path];
      }
    }
    return null;
  }

  return dfs("row");
}

export function modi(costs: number[][], start: number[][]): {
  allocation: number[][];
  iterations: ModiIteration[];
  totalCost: number;
  certified: boolean;
} {
  const alloc = copy2d(start);
  const m = costs.length;
  const n = costs[0].length;
  const iterations: ModiIteration[] = [];
  // La base es un árbol bipartito; las celdas básicas con valor cero
  // deben conservarse entre iteraciones para manejar degeneración.
  const parent = Array.from({ length: m + n }, (_, i) => i);
  const root = (x: number): number => parent[x] === x ? x : (parent[x] = root(parent[x]));
  const basic = basics(alloc);
  for (const { i, j } of basic) {
    const a = root(i), b = root(m + j);
    if (a === b) return { allocation: alloc, iterations, totalCost: z(costs, alloc), certified: false };
    parent[a] = b;
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    const a = root(i), b = root(m + j);
    if (a !== b) { basic.push({ i, j }); parent[a] = b; }
  }
  let certified = false;
  const visited = new Set<string>();

  for (let round = 0; round < 500; round++) {
    const key = basic.map(({ i, j }) => `${i},${j}`).sort().join(';');
    if (visited.has(key)) break;
    visited.add(key);

    const u = Array(m).fill(NaN);
    const v = Array(n).fill(NaN);
    const seed = basic.find((b) => b.i === 0) ? 0 : basic[0].i;
    u[seed] = 0;
    let changed = true;
    while (changed) {
      changed = false;
      for (const { i, j } of basic) {
        if (!Number.isNaN(u[i]) && Number.isNaN(v[j])) {
          v[j] = costs[i][j] - u[i];
          changed = true;
        } else if (Number.isNaN(u[i]) && !Number.isNaN(v[j])) {
          u[i] = costs[i][j] - v[j];
          changed = true;
        }
      }
    }

    const reduced = Array.from({ length: m }, () => Array(n).fill(0));
    let minRC = 0;
    let enter: { i: number; j: number } | undefined;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (basic.some((b) => b.i === i && b.j === j)) {
          reduced[i][j] = 0;
          continue;
        }
        reduced[i][j] = costs[i][j] - u[i] - v[j];
        if (reduced[i][j] < minRC - 1e-9) {
          minRC = reduced[i][j];
          enter = { i, j };
        }
      }
    }

    const costNow = z(costs, alloc);
  const optimal = enter === undefined;
    iterations.push({
      u,
      v,
      reduced: copy2d(reduced),
      entering: enter ? { i: enter.i, j: enter.j, rc: minRC } : undefined,
      cost: costNow,
      optimal,
    });

    if (optimal) { certified = true; break; }

    let loop = findLoop(basic, enter!);
    if (!loop || loop.length < 4) break;
    const last = loop[loop.length - 1];
    if (last.i === loop[0].i && last.j === loop[0].j) loop = loop.slice(0, -1);

    const signs = loop.map((_, k) => (k % 2 === 0 ? 1 : -1));
    let theta = Infinity;
    for (let k = 1; k < loop.length; k += 2) {
      const { i, j } = loop[k];
      theta = Math.min(theta, alloc[i][j]);
    }
    if (!Number.isFinite(theta) || theta === Infinity) theta = 0;

    iterations[iterations.length - 1].theta = theta;

    const leaving = loop.filter((_, k) => k % 2 === 1 && Math.abs(alloc[loop[k].i][loop[k].j] - theta) < 1e-9)
      .sort((a, b) => a.i - b.i || a.j - b.j)[0];
    if (!leaving) break;
    for (let k = 0; k < loop.length; k++) {
      const { i, j } = loop[k];
      alloc[i][j] += signs[k] * theta;
      if (alloc[i][j] < 0) alloc[i][j] = 0;
    }
    if (alloc[enter!.i][enter!.j] === 0) alloc[enter!.i][enter!.j] = theta;
    basic.splice(basic.findIndex((b) => b.i === leaving.i && b.j === leaving.j), 1);
    basic.push(enter!);
  }

  return { allocation: alloc, iterations, totalCost: z(costs, alloc), certified };
}

export const BASE_TRANSPORT: TransportInput = {
  originNames: ["Laboratorio A", "Laboratorio B", "Centro de Acopio C"],
  destNames: ["H1", "H2", "H3", "H4"],
  costs: [
    [2, 5, 3, 6],
    [4, 2, 6, 4],
    [3, 6, 6, 8],
  ],
  supply: [1000, 1250, 850],
  demand: [800, 700, 700, 600],
  storageCosts: [3, 1, 2],
};
