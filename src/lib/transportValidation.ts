import type { TransportInput } from "./transport";

export type FieldErr = { path: string; message: string };

export function validateTransportInput(input: TransportInput): FieldErr[] {
  const errs: FieldErr[] = [];
  input.supply.forEach((v, i) => {
    if (!Number.isFinite(v) || v <= 0) errs.push({ path: `supply-${i}`, message: "Oferta debe ser > 0" });
  });
  input.demand.forEach((v, j) => {
    if (!Number.isFinite(v) || v <= 0) errs.push({ path: `demand-${j}`, message: "Demanda debe ser > 0" });
  });
  input.costs.forEach((row, i) =>
    row.forEach((c, j) => {
      if (!Number.isFinite(c) || c < 0) errs.push({ path: `cost-${i}-${j}`, message: "Costo ≥ 0" });
    }),
  );
  (input.storageCosts ?? []).forEach((v, i) => {
    if (!Number.isFinite(v) || v < 0) errs.push({ path: `storage-${i}`, message: "Reserva ≥ 0" });
  });
  return errs;
}