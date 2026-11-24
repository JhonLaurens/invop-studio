import { useEffect, useMemo, useState } from "react";
import { parseAssignQty, parseRouteFromStep } from "../lib/stepParse";
import { allocationThroughStep } from "../lib/stepReplay";

export type StepItem = {
  label: string;
  detail: string;
  rowPens?: { name: string; pen: number; picked: boolean }[];
  colPens?: { name: string; pen: number; picked: boolean }[];
};

type Edge = { from: string; to: string; qty: number; step: number };

type Props = {
  steps: StepItem[];
  originNames: string[];
  destNames: string[];
  fictitiousOrigins?: number[];
  fictitiousDests?: number[];
};

const TOP = 28;

function layoutMetrics(rows: number) {
  const rowGap = rows > 6 ? 36 : rows > 4 ? 44 : 48;
  const viewH = TOP + rows * rowGap + 28;
  return { rowGap, viewH, maxSvgPx: Math.min(340, TOP + rows * rowGap + 20) };
}

function isFictitiousName(name: string) {
  return /ficticio|reserva/i.test(name);
}

export function MethodStepFlow({ steps, originNames, destNames, fictitiousOrigins, fictitiousDests }: Props) {
  const [active, setActive] = useState(() => Math.max(0, steps.length - 1));
  const [playing, setPlaying] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(true);

  const fictitiousO = useMemo(
    () => new Set(fictitiousOrigins ?? originNames.map((n, i) => (isFictitiousName(n) ? i : -1)).filter((i) => i >= 0)),
    [fictitiousOrigins, originNames],
  );
  const fictitiousD = useMemo(
    () => new Set(fictitiousDests ?? destNames.map((n, j) => (isFictitiousName(n) ? j : -1)).filter((j) => j >= 0)),
    [fictitiousDests, destNames],
  );

  useEffect(() => {
    setActive(Math.max(0, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    if (!playing || active >= steps.length - 1) return;
    const t = window.setInterval(() => {
      setActive((a) => Math.min(steps.length - 1, a + 1));
    }, 900);
    return () => clearInterval(t);
  }, [playing, active, steps.length]);

  useEffect(() => {
    if (playing && active >= steps.length - 1) setPlaying(false);
  }, [playing, active, steps.length]);

  const edges = useMemo(() => {
    const list: Edge[] = [];
    steps.forEach((s, step) => {
      const route = parseRouteFromStep(s.label, s.detail);
      const qty = parseAssignQty(s.detail);
      if (route && qty != null) list.push({ ...route, qty, step });
    });
    return list;
  }, [steps]);

  const activeEdges = edges.filter((e) => e.step <= active);
  const rows = Math.max(originNames.length, destNames.length, 1);
  const { rowGap, viewH, maxSvgPx } = layoutMetrics(rows);
  const uid = useMemo(() => `flow-${Math.random().toString(36).slice(2, 9)}`, []);

  const partialAlloc = useMemo(
    () => allocationThroughStep(steps, active, originNames, destNames),
    [steps, active, originNames, destNames],
  );

  return (
    <div className="method-flow-stack" onKeyDown={(e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      if (e.key === "ArrowRight") { e.preventDefault(); setActive((a) => Math.min(steps.length - 1, a + 1)); }
    }}>
      <div className="step-nav step-nav-full" role="toolbar" aria-label="Navegación de pasos">
        <button type="button" className="btn ghost sm step-prev" aria-label="Paso anterior" disabled={active <= 0} onClick={() => setActive((a) => a - 1)}>
          ← <span className="step-button-text">Anterior</span>
        </button>
        <button type="button" className="btn ghost sm step-play" aria-label={playing ? "Pausar reproducción" : "Reproducir pasos"} onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸" : "▶"} <span className="step-button-text">{playing ? "Pausa" : "Reproducir"}</span>
        </button>
        <button
          type="button"
          className="btn ghost sm step-reset"
          aria-label="Reiniciar pasos"
          disabled={active <= 0 && !playing}
          onClick={() => {
            setPlaying(false);
            setActive(0);
          }}
        >
          ↺ <span className="step-button-text">Reiniciar</span>
        </button>
        <span className="step-nav-label">
          Paso {active + 1} / {steps.length}
        </span>
        <input
          className="step-slider"
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={active}
          onChange={(e) => setActive(+e.target.value)}
          aria-label="Ir a paso"
          aria-valuetext={`Paso ${active + 1} de ${steps.length}`}
        />
        <button
          type="button"
          className="btn ghost sm step-next"
          aria-label="Paso siguiente"
          disabled={active >= steps.length - 1}
          onClick={() => setActive((a) => a + 1)}
        >
          <span className="step-button-text">Siguiente</span> →
        </button>
      </div>

      <div className="method-flow-graph card arch-inset" aria-label="Diagrama interactivo de asignaciones">
        <p className="chart-caption">Clic en un paso, flechas ← → o Reproducir. Matriz parcial incluye balanceo ficticio.</p>
        <div className="method-flow-visual">
          <div className="flow-svg-wrap" style={{ maxHeight: maxSvgPx }}>
            <svg viewBox={`0 0 640 ${viewH}`} preserveAspectRatio="xMidYMid meet" className="flow-svg flow-svg-large" role="img" aria-label={`Asignaciones hasta el paso ${active + 1}`}>
            <defs>
              <marker id={`${uid}-arrow`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="var(--flow-edge-to)" />
              </marker>
              <linearGradient id={`${uid}-edge`} x1="0" x2="1">
                <stop offset="0%" stopColor="var(--flow-edge-from)" />
                <stop offset="100%" stopColor="var(--flow-edge-to)" />
              </linearGradient>
            </defs>
            {originNames.map((name, i) => (
              <g key={`o-${i}`}>
                <rect
                  x="24"
                  y={TOP + i * rowGap}
                  width="132"
                  height="44"
                  rx="10"
                  className={`flow-node origin${fictitiousO.has(i) ? " fictitious" : ""}`}
                />
                <text x="90" y={TOP + 22 + i * rowGap} textAnchor="middle" className="flow-node-text">
                  <title>{name}</title>
                  <FlowLabel name={name} x={90} />
                </text>
              </g>
            ))}
            {destNames.map((name, j) => (
              <g key={`d-${j}`}>
                <rect
                  x="478"
                  y={TOP + j * rowGap}
                  width="132"
                  height="44"
                  rx="10"
                  className={`flow-node dest${fictitiousD.has(j) ? " fictitious" : ""}`}
                />
                <text x="544" y={TOP + 22 + j * rowGap} textAnchor="middle" className="flow-node-text">
                  <title>{name}</title>
                  <FlowLabel name={name} x={544} />
                </text>
              </g>
            ))}
            {activeEdges.map((e, idx) => {
              const oi = originNames.indexOf(e.from);
              const dj = destNames.indexOf(e.to);
              if (oi < 0 || dj < 0) return null;
              const y1 = TOP + 22 + oi * rowGap;
              const y2 = TOP + 22 + dj * rowGap;
              const isLast = e.step === active;
              return (
                <g key={`${e.step}-${idx}`}>
                  <path
                    d={`M162 ${y1} C 320 ${y1}, 320 ${y2}, 470 ${y2}`}
                    fill="none"
                    stroke={`url(#${uid}-edge)`}
                    strokeWidth={isLast ? 3.5 : 2}
                    opacity={isLast ? 1 : 0.4}
                    markerEnd={`url(#${uid}-arrow)`}
                  />
                  {isLast && (
                    <text x="315" y={(y1 + y2) / 2 - 6} textAnchor="middle" className="flow-edge-qty">
                      {e.qty}
                    </text>
                  )}
                </g>
              );
            })}
            </svg>
          </div>
          <div className="step-mini-matrix table-wrap">
            <table className="data-table" aria-label={`Asignación parcial paso ${active + 1}`}>
              <thead>
                <tr>
                  <th>Origen</th>
                  {destNames.map((d, j) => (
                    <th key={d} className={fictitiousD.has(j) ? "fictitious-col" : ""}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partialAlloc.map((row, i) => (
                  <tr key={i} className={fictitiousO.has(i) ? "fictitious-row" : ""}>
                    <th>{originNames[i]}</th>
                    {row.map((v, j) => (
                      <td key={j} className={`${v > 0 ? "cell-assigned" : ""}${fictitiousD.has(j) ? " fictitious-col" : ""}`}>
                        {v > 0 ? v : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TimelineToggle open={timelineOpen} onToggle={() => setTimelineOpen((v) => !v)} count={steps.length} />

      {(timelineOpen || steps.length <= 6) && (
        <ol className="flow-timeline flow-timeline-open flow-timeline-cols">
          {steps.map((s, i) => {
            const route = parseRouteFromStep(s.label, s.detail);
            const qty = parseAssignQty(s.detail);
            const picked = active === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  className={`flow-step${picked ? " active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-current={picked ? "step" : undefined}
                >
                  <span className="flow-step-index">{i + 1}</span>
                  <span className="flow-step-body">
                    {route ? (
                      <span className="flow-route">
                        <span className="flow-pill from" title={route.from}>
                          {route.from}
                        </span>
                        <span className="flow-arrow" aria-hidden>
                          →
                        </span>
                        <span className="flow-pill to" title={route.to}>
                          {route.to}
                        </span>
                      </span>
                    ) : (
                      <strong>{s.label}</strong>
                    )}
                    {qty != null && <span className="flow-qty-badge">+{qty}</span>}
                    <span className="flow-detail">{s.detail}</span>
                    {(s.rowPens || s.colPens) && (
                      <span className="vogel-pens">
                        {s.rowPens && (
                          <span className="vogel-pens-row">
                            {s.rowPens.map((p) => (
                              <span key={`r-${p.name}`} className={p.picked ? "pen picked" : "pen"} title={p.name}>
                                {p.name}: {p.pen}
                              </span>
                            ))}
                          </span>
                        )}
                        {s.colPens && (
                          <span className="vogel-pens-row">
                            {s.colPens.map((p) => (
                              <span key={`c-${p.name}`} className={p.picked ? "pen picked" : "pen"} title={p.name}>
                                {p.name}: {p.pen}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function TimelineToggle({ open, onToggle, count }: { open: boolean; onToggle: () => void; count: number }) {
  if (count <= 6) return null;
  return (
    <button type="button" className="btn ghost sm timeline-toggle" onClick={onToggle}>
      {open ? "Ocultar lista de pasos" : `Ver todos los pasos (${count})`}
    </button>
  );
}

function FlowLabel({ name, x }: { name: string; x: number }) {
  const words = name.split(/\s+/);
  let lines = [name];
  if (name.length > 16 && words.length > 1) {
    let split = 1;
    for (let i = 2; i < words.length; i++) {
      if (Math.abs(words.slice(0, i).join(" ").length - name.length / 2) <
          Math.abs(words.slice(0, split).join(" ").length - name.length / 2)) split = i;
    }
    lines = [words.slice(0, split).join(" "), words.slice(split).join(" ")];
  }
  return <>{lines.map((line, i) => (
    <tspan key={i} x={x} dy={lines.length === 1 ? 0 : i === 0 ? "-0.45em" : "1.1em"}
      textLength={line.length > 17 ? 120 : undefined} lengthAdjust="spacingAndGlyphs">{line}</tspan>
  ))}</>;
}
