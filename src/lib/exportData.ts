import type { QueueConfig, QueueParams } from "./queues";
import type { TransportInput } from "./transport";

export function transportToCsv(input: TransportInput): string {
  const csvRow = (values: (string | number)[]) => values.map((value) => {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",");
  const header = csvRow(["Origen", ...input.destNames, "Oferta", "Costo de reserva"]);
  const rows = input.costs.map((row, i) =>
    csvRow([input.originNames[i], ...row, input.supply[i], input.storageCosts?.[i] ?? 0]),
  );
  const demand = csvRow(["Demanda", ...input.demand, "", ""]);
  return [header, ...rows, demand].join("\n");
}

export function transportToJson(input: TransportInput): string {
  return JSON.stringify(input, null, 2);
}

function csvRow(values: (string | number)[]) {
  return values.map((value) => {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",");
}

export function queueIndicatorsToCsv(configs: QueueConfig[]): string {
  const header = csvRow(["s", "rho", "P0", "Pw", "Lq", "L", "Wq_min", "W_min", "CT", "SLA"]);
  const rows = configs.map((config) =>
    csvRow([
      config.s,
      config.rho,
      config.stable ? config.p0 : "",
      config.stable ? config.pw : "",
      config.stable ? config.lq : "",
      config.stable ? config.l : "",
      config.stable ? config.wqMin : "",
      config.stable ? config.wMin : "",
      config.stable ? config.totalCost : "",
      !config.stable ? "inestable" : config.slaOk ? "cumple" : "no cumple",
    ]),
  );
  return [header, ...rows].join("\n");
}

export function queueParamsToJson(p: QueueParams, cwMin: number): string {
  return JSON.stringify({ ...p, cwMin }, null, 2);
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
