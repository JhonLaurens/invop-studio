import type { ModiIteration } from "../lib/transport";
import { fmtMoney, fmtNum } from "../lib/format";
import { InfoTip } from "./InfoTip";

type Props = {
  iteration: ModiIteration;
  index: number;
  originNames: string[];
  destNames: string[];
};

export function ModiIterationPanel({ iteration, index, originNames, destNames }: Props) {
  const ent = iteration.entering;
  const loop = iteration.loop;
  const inLoop = (i: number, j: number) => loop?.some((c) => c.i === i && c.j === j) ?? false;

  return (
    <details className="modi-iteration" open={index === 0}>
      <summary>
        Iteración {index + 1} — Z = {fmtMoney(iteration.cost)}
        {iteration.optimal ? " · Óptimo" : ent ? ` · Entra (${originNames[ent.i]}, ${destNames[ent.j]}) δ=${fmtNum(ent.rc, 2)}` : ""}
        {!iteration.optimal && iteration.theta != null && ` · θ = ${fmtNum(iteration.theta, 2)}`}
      </summary>
      {loop && loop.length > 0 && (
        <p className="chart-caption modi-cycle-caption">
          Ciclo MODI:{" "}
          {loop.map((c, k) => (
            <span key={`${k}-${c.i}-${c.j}`} className="modi-cycle-node">
              ({originNames[c.i]}, {destNames[c.j]})
              {k < loop.length - 1 ? " → " : ""}
            </span>
          ))}
        </p>
      )}
      <div className="modi-tables">
        <table className="data-table modi-book-layout">
          <caption><InfoTip label="Costos reducidos δᵢⱼ con potenciales u y v">Los potenciales se calculan con las rutas básicas. Un costo reducido negativo identifica una ruta que puede disminuir el costo total.</InfoTip></caption>
          <thead>
            <tr>
              <th className="modi-corner">u \\ v</th>
              {destNames.map((d, j) => (
                <th key={d}>
                  <span className="modi-v">{fmtNum(iteration.v[j], 2)}</span>
                  <span className="modi-col-name">{d}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {iteration.reduced.map((row, i) => (
              <tr key={i}>
                <th>
                  <span className="modi-u">{fmtNum(iteration.u[i], 2)}</span>
                  <span className="modi-row-name">{originNames[i]}</span>
                </th>
                {row.map((d, j) => {
                  const isEnter = ent && ent.i === i && ent.j === j;
                  const onCycle = inLoop(i, j);
                  return (
                    <td
                      key={j}
                      className={`${isEnter ? "cell-entering" : d < 0 ? "cell-improve" : ""}${onCycle ? " cell-cycle" : ""}`}
                    >
                      {fmtNum(d, 2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
