import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "../components/InfoTip";
import { LearningVisual } from "../components/LearningVisual";
import { fmtMoney } from "../lib/format";
import {
  BASE_TRANSPORT,
  balance,
  minimumCost,
  modi,
  northwest,
  type TransportInput,
  vogel,
} from "../lib/transport";

export function TransportPage() {
  const [input, setInput] = useState<TransportInput>(BASE_TRANSPORT);

  const results = useMemo(() => {
    const bal = balance(input);
    const no = northwest(bal);
    const cm = minimumCost(bal);
    const vo = vogel(bal);
    const bestStart =
      vo.totalCost <= cm.totalCost && vo.totalCost <= no.totalCost
        ? vo.allocation
        : cm.totalCost <= no.totalCost
          ? cm.allocation
          : no.allocation;
    const opt = modi(bal.costs, bestStart);
    return { bal, no, cm, vo, opt };
  }, [input]);

  const chartData = [
    { name: "Noroeste", costo: results.no.totalCost },
    { name: "Costo mín.", costo: results.cm.totalCost },
    { name: "Vogel", costo: results.vo.totalCost },
    { name: results.opt.certified ? "Óptimo" : "MODI (sin certificar)", costo: results.opt.totalCost },
  ];

  const optimal = results.opt.totalCost;
  const gap = (z: number) =>
    optimal > 0 ? ((z - optimal) / optimal) * 100 : 0;

  return (
    <div className="page transport">
      <header className="page-head">
        <h1>Algoritmos de transporte</h1>
        <p>
          Define ofertas, demandas y costos. El balanceo agrega un destino u origen ficticio cuando
          hace falta.
        </p>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setInput(BASE_TRANSPORT)}
        >
          Restablecer ejemplo base (vacunas 3×4)
        </button>
      </header>

      <section className="card learning-panel">
        <div><p className="kicker">Para empezar</p><h2>¿Qué resuelve este módulo?</h2><p>Distribuye unidades entre lugares de origen y destinos para comparar el costo de distintas alternativas.</p><p><strong>Orden sugerido:</strong> ingresa los datos, revisa el balance y compara los métodos. Después consulta las iteraciones y la asignación final.</p></div>
        <LearningVisual kind="transport" />
      </section>

      <section className="grid-2">
        <Panel title="Datos del problema">
          <div className="field-grid">
            {input.originNames.map((name, i) => (
              <div key={i} className="origin-block">
                <InfoTip label={`Origen ${i + 1}`}>
                  Centro de abastecimiento i. La oferta es el inventario disponible en la semana.
                </InfoTip>
                <input
                  value={name}
                  onChange={(e) => {
                    const originNames = [...input.originNames];
                    originNames[i] = e.target.value;
                    setInput({ ...input, originNames });
                  }}
                />
                <label>
                  Oferta
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={input.supply[i]}
                    onChange={(e) => {
                      if (!Number.isFinite(e.target.valueAsNumber) || e.target.valueAsNumber <= 0) return;
                      const supply = [...input.supply];
                      supply[i] = +e.target.value;
                      setInput({ ...input, supply });
                    }}
                  />
                </label>
                <label>
                  <InfoTip label="Costo reserva">
                    Costo por unidad no despachada (columna ficticia al balancear excedente).
                  </InfoTip>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={input.storageCosts?.[i] ?? 0}
                    onChange={(e) => {
                      if (!Number.isFinite(e.target.valueAsNumber) || e.target.valueAsNumber < 0) return;
                      const storageCosts = [...(input.storageCosts ?? [])];
                      storageCosts[i] = +e.target.value;
                      setInput({ ...input, storageCosts });
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
          <p className="balance-note">
            {results.bal.dummyCol && (
              <>
                Destino ficticio &quot;{results.bal.destNames.at(-1)}&quot; con demanda{" "}
                {results.bal.surplus} (excedente de oferta).
              </>
            )}
            {results.bal.dummyRow && <>Origen ficticio con oferta {results.bal.surplus} y costo cero: representa demanda no cubierta, no un abastecimiento real.</>}
            {!results.bal.dummyCol && !results.bal.dummyRow && <>Problema balanceado.</>}
          </p>
        </Panel>

        <Panel title="Demandas y costos de transporte">
          <div className="table-wrap"><table className="data-table matrix-table">
            <thead><tr><th>Origen / destino</th>{input.destNames.map((name) => <th key={name}>{name}</th>)}</tr></thead>
            <tbody>
              {input.costs.map((row, i) => <tr key={i}><th>{input.originNames[i]}</th>{row.map((cost, j) => <td key={j}>
                <input aria-label={`Costo ${input.originNames[i]} a ${input.destNames[j]}`} type="number" min="0" step="any" value={cost}
                  onChange={(e) => { const value = e.target.valueAsNumber; if (!Number.isFinite(value) || value < 0) return; const costs = input.costs.map((r) => [...r]); costs[i][j] = value; setInput({ ...input, costs }); }} />
              </td>)}</tr>)}
              <tr><th>Demanda</th>{input.demand.map((value, j) => <td key={j}>
                <input aria-label={`Demanda ${input.destNames[j]}`} type="number" min="0.01" step="any" value={value}
                  onChange={(e) => { const v = e.target.valueAsNumber; if (!Number.isFinite(v) || v <= 0) return; const demand = [...input.demand]; demand[j] = v; setInput({ ...input, demand }); }} />
              </td>)}</tr>
            </tbody>
          </table></div>
          <p className="balance-note">Las demandas deben ser positivas y los costos no negativos.</p>
        </Panel>

        <Panel title="Comparación de costos">
          <p>La altura de cada barra muestra el costo total: una barra más baja representa menor costo. Compara los resultados en la tabla y verifica si MODI certificó el óptimo.</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5deea" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={(v) => fmtMoney(Number(v))} />
              <Bar dataKey="costo" fill="#102d69" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <table className="data-table">
            <thead>
              <tr>
                <th>Método</th>
                <th>Z</th>
                <th>vs. óptimo</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.name} className={row.name === "Óptimo" ? "opt-row" : ""}>
                  <td>{row.name}</td>
                  <td>{fmtMoney(row.costo)}</td>
                  <td>{!results.opt.certified || row.name === "Óptimo" ? "-" : `+${gap(row.costo).toFixed(1)} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      <section className="tabs card">
        <MethodBlock title="Esquina Noroeste" cost={results.no.totalCost} steps={results.no.steps} />
        <MethodBlock title="Costo Mínimo" cost={results.cm.totalCost} steps={results.cm.steps} />
        <MethodBlock title="Vogel" cost={results.vo.totalCost} steps={results.vo.steps} />
        <div className="method-block">
          <h3>
            {results.opt.certified ? "Óptimo (MODI)" : "MODI: solución sin certificar"} - {fmtMoney(results.opt.totalCost)}
            <InfoTip label="?">Potenciales u,v, costos reducidos y mejoras por circuitos cerrados.</InfoTip>
          </h3>
          {results.opt.iterations.map((it, i) => (
            <div key={i} className="step-card">
              <strong>Iteración {i + 1}</strong> — Z = {fmtMoney(it.cost)}
              {it.optimal ? (
                <span className="badge ok">Solución óptima (todos los δ ≥ 0)</span>
              ) : (
                <span className="badge warn">
                  Entra {results.bal.originNames[it.entering!.i]} → {results.bal.destNames[it.entering!.j]} con δ = {it.entering?.rc}; θ = {it.theta ?? "no calculado"}
                </span>
              )}
            </div>
          ))}
          {!results.opt.certified && <p className="badge warn" role="alert">No fue posible verificar la optimalidad. No interpretes este costo como óptimo.</p>}
          <h4>Asignación final MODI</h4>
          <p>Cada celda muestra cuántas unidades se asignan del origen de la fila al destino de la columna. La reserva ficticia representa excedente; un origen ficticio representa faltante.</p>
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>Origen / destino</th>{results.bal.destNames.map((name, j) => <th key={j}>{name}</th>)}</tr></thead>
            <tbody>{results.opt.allocation.map((row, i) => <tr key={i}><th>{results.bal.originNames[i]}</th>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
          </table></div>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="card panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function MethodBlock({
  title,
  cost,
  steps,
}: {
  title: string;
  cost: number;
  steps: { label: string; detail: string }[];
}) {
  return (
    <div className="method-block">
      <h3>
        {title} — {fmtMoney(cost)}
      </h3>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i} title={s.detail}>
            <strong>{s.label}</strong>
            <span>{s.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
