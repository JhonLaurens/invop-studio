import { useState, type CSSProperties } from "react";
import type { TransportInput } from "../lib/transport";
import { removeDestination, removeOrigin } from "../lib/transport";
import { costPercentileLevel } from "../lib/costHeat";
import type { FieldErr } from "../lib/transportValidation";
import { ConfirmDialog } from "./ConfirmDialog";
import { InfoTip } from "./InfoTip";

type Props = {
  input: TransportInput;
  assignmentHint?: number[][];
  errors: FieldErr[];
  onChange: (next: TransportInput) => void;
};

export function TransportSpreadsheet({ input, assignmentHint, errors, onChange }: Props) {
  const errSet = new Set(errors.map((e) => e.path));
  const errClass = (path: string) => (errSet.has(path) ? " field-error" : "");
  const [pending, setPending] = useState<{ kind: "origen" | "destino"; index: number; name: string } | null>(null);

  const askRemove = (kind: "origen" | "destino", index: number, name: string, count: number) => {
    if (count <= 1) return;
    setPending({ kind, index, name });
  };

  return (
    <div>
      <p className="heatmap-legend chart-caption" aria-hidden>
        <span className="heatmap-swatch low" /> Bajo costo
        <span className="heatmap-swatch mid" /> Medio
        <span className="heatmap-swatch high" /> Alto (percentiles)
      </p>
      <div className="table-wrap spreadsheet-wrap">
        <table className="data-table matrix-table spreadsheet-table spreadsheet-compact">
          <thead>
            <tr>
              <th className="sticky-col"><InfoTip label="Origen / destino">Cada fila es un origen y cada columna un destino. Escribe en cada celda el costo por unidad transportada.</InfoTip></th>
              {input.destNames.map((name, j) => (
                <th key={j} className="dest-head">
                  <input
                    className="compact-cell dest-name"
                    value={name}
                    title={name}
                    aria-label={`Nombre destino ${j + 1}`}
                    onChange={(e) => {
                      const destNames = [...input.destNames];
                      destNames[j] = e.target.value;
                      onChange({ ...input, destNames });
                    }}
                  />
                  {input.destNames.length > 1 && (
                    <button type="button" className="matrix-remove" onClick={() => askRemove("destino", j, name, input.destNames.length)} aria-label={`Eliminar destino ${name}`}>
                      ×
                    </button>
                  )}
                </th>
              ))}
              <th><InfoTip label="Oferta">Cantidad disponible para enviar desde cada origen.</InfoTip></th>
              <th><InfoTip label="Costo reserva">Costo por unidad de oferta que se asigna a un destino ficticio cuando hay excedente.</InfoTip></th>
            </tr>
          </thead>
          <tbody>
            {input.costs.map((row, i) => (
              <tr key={i}>
                <th className="sticky-col origin-head">
                  <input
                    className={`compact-cell origin-name${errClass(`origin-${i}`)}`}
                    value={input.originNames[i]}
                    title={input.originNames[i]}
                    aria-label={`Nombre origen ${i + 1}`}
                    onChange={(e) => {
                      const originNames = [...input.originNames];
                      originNames[i] = e.target.value;
                      onChange({ ...input, originNames });
                    }}
                  />
                  {input.originNames.length > 1 && (
                    <button
                      type="button"
                      className="matrix-remove"
                      onClick={() => askRemove("origen", i, input.originNames[i], input.originNames.length)}
                      aria-label={`Eliminar origen ${input.originNames[i]}`}
                    >
                      ×
                    </button>
                  )}
                </th>
                {row.map((cost, j) => {
                  const flatUniq = new Set(input.costs.flat()).size;
                  const level = flatUniq === 1 ? 0.2 : costPercentileLevel(cost, input.costs);
                  const assigned = assignmentHint?.[i]?.[j] ?? 0;
                  const style = {
                    background: `color-mix(in srgb, #102d69 ${8 + level * 42}%, transparent)`,
                  } as CSSProperties;
                  return (
                    <td key={j} className={`matrix-cell editable-cell${assigned > 0 ? " matrix-cell-assigned" : ""}`} style={style}>
                      <input
                        className={`compact-cell cell-edit${errClass(`cost-${i}-${j}`)}`}
                        type="number"
                        min="0"
                        step="any"
                        value={cost}
                        aria-label={`Costo ${input.originNames[i]} a ${input.destNames[j]}`}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          if (!Number.isFinite(value)) return;
                          const costs = input.costs.map((r) => [...r]);
                          costs[i][j] = value;
                          onChange({ ...input, costs });
                        }}
                      />
                    </td>
                  );
                })}
                <td>
                  <input
                    className={`compact-cell cell-edit${errClass(`supply-${i}`)}`}
                    type="number"
                    step="any"
                    value={input.supply[i]}
                    aria-label={`Oferta ${input.originNames[i]}`}
                    onChange={(e) => {
                      const supply = [...input.supply];
                      supply[i] = e.target.valueAsNumber;
                      onChange({ ...input, supply });
                    }}
                  />
                </td>
                <td>
                  <input
                    className={`compact-cell cell-edit${errClass(`storage-${i}`)}`}
                    type="number"
                    min="0"
                    step="any"
                    value={input.storageCosts?.[i] ?? 0}
                    aria-label={`Costo reserva ${input.originNames[i]}`}
                    onChange={(e) => {
                      const storageCosts = [...(input.storageCosts ?? input.supply.map(() => 0))];
                      storageCosts[i] = e.target.valueAsNumber;
                      onChange({ ...input, storageCosts });
                    }}
                  />
                </td>
              </tr>
            ))}
            <tr className="demand-row">
              <th className="sticky-col">Demanda</th>
              {input.demand.map((value, j) => (
                <td key={j}>
                  <input
                    className={`compact-cell cell-edit${errClass(`demand-${j}`)}`}
                    type="number"
                    step="any"
                    value={value}
                    aria-label={`Demanda ${input.destNames[j]}`}
                    onChange={(e) => {
                      const demand = [...input.demand];
                      demand[j] = e.target.valueAsNumber;
                      onChange({ ...input, demand });
                    }}
                  />
                </td>
              ))}
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={pending != null}
        title={pending?.kind === "destino" ? "Eliminar destino" : "Eliminar origen"}
        message={pending ? `¿Quitar ${pending.kind} "${pending.name}"?` : ""}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          onChange(pending.kind === "origen" ? removeOrigin(input, pending.index) : removeDestination(input, pending.index));
          setPending(null);
        }}
      />
    </div>
  );
}
