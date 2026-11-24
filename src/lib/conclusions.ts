import { fmtMoney, fmtNum } from "./format";
import type { QueueConfig } from "./queues";
import { bestCost } from "./queues";
import type { BalancedProblem } from "./transport";

type CostSolution = { totalCost: number; allocation: number[][] };

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-4;

function modelName(s: number) {
  return `M/M/${s}`;
}

export function transportConclusions(
  bal: BalancedProblem,
  no: CostSolution,
  cm: CostSolution,
  vo: CostSolution,
  opt: CostSolution & { certified: boolean },
): string[] {
  const initials = [
    { name: "Esquina Noroeste", z: no.totalCost },
    { name: "Costo mínimo", z: cm.totalCost },
    { name: "Vogel", z: vo.totalCost },
  ];
  const bestZ = Math.min(...initials.map((item) => item.z));
  const winners = initials.filter((item) => close(item.z, bestZ)).map((item) => item.name);
  const who = winners.length === 1 ? winners[0] : winners.join(" y ");
  const lines = [
    `Entre las soluciones iniciales, ${winners.length === 1 ? "la de menor costo es" : "empatan"} ${who} (${fmtMoney(bestZ)}). Esquina Noroeste no mira los costos: solo llena la tabla desde la esquina superior izquierda.`,
  ];

  if (opt.certified) {
    const saved = bestZ - opt.totalCost;
    lines.push(
      saved <= 1e-2
        ? `MODI certifica que esa solución ya es óptima. El costo es ${fmtMoney(opt.totalCost)}.`
        : `MODI mejora esa solución y certifica el óptimo en ${fmtMoney(opt.totalCost)}. El ahorro es ${fmtMoney(saved)}.`,
    );
  } else {
    lines.push(
      `MODI no certificó optimalidad. ${fmtMoney(opt.totalCost)} es un costo alcanzado, no un óptimo demostrado.`,
    );
  }

  if (bal.dummyCol) {
    const column = bal.destNames.length - 1;
    const holders = bal.originNames
      .map((name, i) => ({ name, qty: opt.allocation[i][column], unit: bal.costs[i][column] }))
      .filter((holder) => holder.qty > 1e-6);
    const cheapest = Math.min(...bal.costs.map((row) => row[column]));
    const cheapNames = bal.originNames.filter((_, i) => close(bal.costs[i][column], cheapest));
    const heldAway = holders.some((holder) => holder.unit > cheapest + 1e-6);
    const where = holders
      .map((holder) => `${holder.name} (${fmtNum(holder.qty, 0)} u. a ${fmtMoney(holder.unit)} por unidad)`)
      .join(", ");
    lines.push(
      `Sobran ${fmtNum(bal.surplus, 0)} unidades. ${opt.certified ? "La solución óptima" : "La solución de MODI"} las deja sin despachar en ${where || "ningún origen"}.`,
    );
    lines.push(
      heldAway
        ? `Ese no es el almacén más barato: ${cheapNames.join(", ")} cuesta ${fmtMoney(cheapest)} por unidad. Conviene usar el origen barato en rutas reales cuando ese ahorro supera el costo de guardar el sobrante en otro centro.`
        : "El sobrante queda en el origen de menor costo de reserva.",
    );
  } else if (bal.dummyRow) {
    const row = bal.originNames.length - 1;
    const short = bal.destNames
      .map((name, j) => ({ name, qty: opt.allocation[row][j] }))
      .filter((dest) => dest.qty > 1e-6);
    const where = short.map((dest) => `${dest.name} (${fmtNum(dest.qty, 0)} u.)`).join(", ");
    lines.push(
      `Faltan ${fmtNum(bal.surplus, 0)} unidades de oferta. El origen ficticio cubre ese faltante con costo 0, así que el modelo no penaliza dejar de atender. Destinos cubiertos por ese origen: ${where || "ninguno"}.`,
    );
  } else {
    lines.push("Oferta y demanda coinciden: no hace falta un origen ni un destino ficticio.");
  }

  return lines;
}

export function queueConclusions(configs: QueueConfig[], hasSla: boolean): string[] {
  const lines = [
    "El costo por hora suma dos partes: lo que cuestan los servidores (Cs × s) y la permanencia en el sistema (Cw por hora × L). La penalización usa L, no solo la cola Lq, porque cobra espera y servicio.",
  ];
  if (configs.length === 1) {
    lines.push(`Solo se evalúa s = ${configs[0].s}.`);
  } else if (configs.length > 1) {
    const bits = configs.map((config) =>
      config.stable
        ? `${modelName(config.s)} cuesta ${fmtMoney(config.totalCost)} por hora`
        : `${modelName(config.s)} es inestable`,
    );
    lines.push(`Comparativo de s = ${configs[0].s} a s = ${configs[configs.length - 1].s}: ${bits.join("; ")}.`);
  }

  const unstable = configs.filter((config) => !config.stable);
  if (unstable.length) {
    const names = unstable.map((config) => modelName(config.s)).join(", ");
    lines.push(
      `${names} ${unstable.length === 1 ? "no alcanza" : "no alcanzan"} a atender: ρ ≥ 1 y la cola crecería sin límite. ${unstable.length === 1 ? "Ese caso no tiene" : "Esos casos no tienen"} costo finito.`,
    );
  }

  const best = bestCost(configs);
  if (!best) {
    lines.push("En este rango no hay una configuración estable. Amplía el máximo de servidores o reduce la tasa de llegadas.");
    return lines;
  }

  lines.push(`La opción más barata del rango es ${modelName(best.s)}, con ${fmtMoney(best.totalCost)} por hora.`);
  const next = configs.find((config) => config.s === best.s + 1 && config.stable);
  if (next) {
    const extraServers = next.serviceCost - best.serviceCost;
    const savedWait = best.waitCost - next.waitCost;
    lines.push(
      `Pasar a ${modelName(next.s)} cuesta ${fmtMoney(extraServers)} más en servidores y ahorra ${fmtMoney(Math.max(0, savedWait))} de espera. El costo total queda en ${fmtMoney(next.totalCost)}, así que ese servidor de más no conviene.`,
    );
  }

  if (hasSla) {
    const bestSla = bestCost(configs.filter((config) => config.slaOk));
    if (best.slaOk) {
      lines.push(`${modelName(best.s)} también cumple las metas de tiempo W y de probabilidad de espera Pw.`);
    } else if (bestSla) {
      lines.push(
        `${modelName(best.s)} es la más barata, pero no cumple las metas. La más barata que sí cumple es ${modelName(bestSla.s)} (${fmtMoney(bestSla.totalCost)} por hora).`,
      );
    } else {
      lines.push("Ninguna configuración estable de este rango cumple las metas de W y Pw.");
    }
  }

  return lines;
}
