import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "../components/InfoTip";
import { LearningVisual } from "../components/LearningVisual";
import { fmtMoney, fmtNum, fmtPct } from "../lib/format";
import { BASE_QUEUE, bestCost, scanConfigs, type QueueParams } from "../lib/queues";

export function QueuesPage() {
  const [p, setP] = useState<QueueParams>(BASE_QUEUE);
  const [cwMin, setCwMin] = useState(5);

  const params = useMemo(
    () => ({ ...p, cwPerHour: cwMin * 60 }),
    [p, cwMin],
  );

  const valid = Number.isFinite(p.lambda) && p.lambda > 0 && Number.isFinite(p.mu) && p.mu > 0 &&
    Number.isFinite(p.cs) && p.cs >= 0 && Number.isFinite(cwMin) && cwMin >= 0 &&
    Number.isInteger(p.sMin) && Number.isInteger(p.sMax) && p.sMin >= 1 && p.sMax <= 100 && p.sMin <= p.sMax &&
    (p.wMaxSec === undefined || (Number.isFinite(p.wMaxSec) && p.wMaxSec >= 0)) &&
    (p.pwMax === undefined || (Number.isFinite(p.pwMax) && p.pwMax >= 0 && p.pwMax <= 100));
  const configs = useMemo(() => valid ? scanConfigs(params) : [], [params, valid]);

  const best = bestCost(configs);
  const bestSla = bestCost(configs.filter((c) => c.slaOk));
  const chartCost = configs
    .filter((c) => c.stable)
    .map((c) => ({
      s: `s=${c.s}`,
      servicio: c.serviceCost,
      espera: c.waitCost,
      total: c.totalCost,
    }));

  const pnChart = best
    ? best.pn.map((prob, n) => ({ n: `n=${n}`, prob: prob * 100 }))
    : [];

  return (
    <div className="page queues">
      <header className="page-head">
        <h1>Teoría de colas · M/M/s</h1>
        <p>Comparativo de configuraciones, costo total por hora y cumplimiento de metas SLA.</p>
        <button type="button" className="btn ghost" onClick={() => { setP({ ...BASE_QUEUE }); setCwMin(5); }}>
          Restablecer ejemplo base (λ=15, μ=10)
        </button>
        {!valid && <p className="badge warn" role="alert">Revisa los datos: tasas mayores que cero, costos y metas no negativos, Pw entre 0 y 100 %, y servidores enteros entre 1 y 100 con mínimo menor o igual al máximo.</p>}
      </header>

      <section className="card learning-panel">
        <div><p className="kicker">Para empezar</p><h2>¿Qué representa una cola?</h2><p>Las peticiones llegan a un sistema y esperan si todos los servidores están ocupados.</p><p><strong>Orden sugerido:</strong> define las tasas y los costos, elige un rango de servidores y compara el costo con las metas de servicio.</p></div>
        <LearningVisual kind="queues" />
      </section>

      <section className="grid-2">
        <section className="card panel">
          <h2>Parámetros</h2>
          <div className="param-grid">
            <label>
              <InfoTip label="λ — tasa de llegada">
                Peticiones por minuto según proceso Poisson. Define la intensidad del sistema.
              </InfoTip>
              <input
                type="number"
                value={p.lambda}
                onChange={(e) => setP({ ...p, lambda: +e.target.value })}
              />
            </label>
            <label>
              <InfoTip label="μ — tasa de servicio">
                Capacidad de cada servidor (peticiones/min). Debe compartir unidad con λ.
              </InfoTip>
              <input
                type="number"
                value={p.mu}
                onChange={(e) => setP({ ...p, mu: +e.target.value })}
              />
            </label>
            <label>
              <InfoTip label="Cs">
                Costo fijo por hora de cada servidor activo ($/h).
              </InfoTip>
              <input type="number" value={p.cs} onChange={(e) => setP({ ...p, cs: +e.target.value })} />
            </label>
            <label>
              <InfoTip label="Cw">
                Penalización por cada entidad presente en el sistema. Ejemplo: $5/min ≡ $300/h.
              </InfoTip>
              <input
                type="number"
                value={cwMin}
                onChange={(e) => setCwMin(+e.target.value)}
              />
              <span className="muted-inline">$/min → {fmtMoney(cwMin * 60)}/h por entidad en L</span>
            </label>
            <label>
              s mínimo
              <input
                type="number"
                value={p.sMin}
                onChange={(e) => setP({ ...p, sMin: +e.target.value })}
              />
            </label>
            <label>
              s máximo
              <input
                type="number"
                value={p.sMax}
                onChange={(e) => setP({ ...p, sMax: +e.target.value })}
              />
            </label>
            <label>
              <InfoTip label="W máximo (s)">
                Meta SLA: tiempo promedio en el sistema no mayor que este valor.
              </InfoTip>
              <input
                type="number"
                value={p.wMaxSec ?? ""}
                placeholder="sin meta"
                onChange={(e) =>
                  setP({ ...p, wMaxSec: e.target.value ? +e.target.value : undefined })
                }
              />
            </label>
            <label>
              <InfoTip label="Pw máximo (%)">
                Probabilidad máxima de que una llegada deba esperar.
              </InfoTip>
              <input
                type="number"
                value={p.pwMax ?? ""}
                placeholder="sin meta"
                onChange={(e) =>
                  setP({ ...p, pwMax: e.target.value ? +e.target.value : undefined })
                }
              />
            </label>
          </div>
        </section>

        <section className="card panel highlight">
          <h2>Recomendación</h2>
          {best ? (
            <>
              <p className="reco">
                Menor costo total: <strong>s = {best.s}</strong> — {fmtMoney(best.totalCost)}/h
              </p>
              <p>
                ρ = {fmtNum(best.rho, 4)} · W = {fmtNum(best.wSec, 2)} s · Pw = {fmtPct(best.pw)}
              </p>
              {best.slaOk ? (
                <span className="badge ok">Cumple metas SLA</span>
              ) : (
                <span className="badge warn">No cumple todas las metas SLA</span>
              )}
              {!best.slaOk && bestSla && <p>Menor costo que cumple las metas: <strong>s = {bestSla.s}</strong> — {fmtMoney(bestSla.totalCost)}/h.</p>}
              {!bestSla && <p>Ninguna configuración estable del rango cumple todas las metas.</p>}
            </>
          ) : !valid ? (
            <p>Corrige los parámetros para calcular la recomendación.</p>
          ) : (
            <p className="badge warn">Ninguna configuración estable en el rango.</p>
          )}
        </section>
      </section>

      <section className="card panel">
        <h2>Costo por hora vs. servidores</h2>
        <p>El eje horizontal muestra servidores y el vertical, costo por hora. Servicio y espera suman el costo total; las configuraciones inestables no se grafican.</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartCost}>
            <CartesianGrid stroke="#d5deea" strokeDasharray="4 4" />
            <XAxis dataKey="s" />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <RTooltip formatter={(v) => fmtMoney(Number(v))} />
            <Legend />
            <Line type="monotone" dataKey="servicio" stroke="#102d69" strokeWidth={2} dot />
            <Line type="monotone" dataKey="espera" stroke="#006c7c" strokeWidth={2} strokeDasharray="6 3" dot />
            <Line type="monotone" dataKey="total" stroke="#513b8b" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card panel">
        <h2>Indicadores por configuración</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>s</th>
                <th>ρ</th>
                <th>P0</th>
                <th>Pw</th>
                <th>Lq</th>
                <th>L</th>
                <th>Wq (s)</th>
                <th>W (s)</th>
                <th>CT/h</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr
                  key={c.s}
                  className={
                    !c.stable ? "unstable" : best && c.s === best.s ? "opt-row" : ""
                  }
                >
                  <td>{c.s}</td>
                  <td>{fmtNum(c.rho, 4)}</td>
                  <td>{c.stable ? fmtNum(c.p0, 4) : "—"}</td>
                  <td>{c.stable ? fmtPct(c.pw) : "—"}</td>
                  <td>{c.stable ? fmtNum(c.lq, 4) : "-"}</td>
                  <td>{c.stable ? fmtNum(c.l, 4) : "—"}</td>
                  <td>{c.stable ? fmtNum(c.wqMin * 60, 2) : "-"}</td>
                  <td>{c.stable ? fmtNum(c.wSec, 2) : "—"}</td>
                  <td>{c.stable ? fmtMoney(c.totalCost) : "Inestable"}</td>
                  <td>
                    {!c.stable ? "—" : c.slaOk ? "✓" : "✗"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {best && (
        <section className="card panel">
          <h2>Distribución Pₙ (menor costo, s={best.s})</h2>
          <p>El eje horizontal indica cuántas peticiones hay en el sistema; el vertical muestra la probabilidad de cada cantidad. Esta gráfica corresponde a la opción de menor costo del rango.</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pnChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="n" />
              <YAxis unit="%" />
              <RTooltip formatter={(v) => `${fmtNum(Number(v), 2)} %`} />
              <Line type="monotone" dataKey="prob" stroke="#102d69" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}

