import type { QueueConfig } from "../lib/queues";
import { fmtMoney, fmtNum, fmtPct } from "../lib/format";

type Props = {
  configs: QueueConfig[];
  activeS: number;
  bestS: number | null;
  onSelect: (s: number) => void;
};

export function ServerConfigTimeline({ configs, activeS, bestS, onSelect }: Props) {
  return (
    <ol className="flow-timeline server-config-timeline" aria-label="Configuraciones por número de servidores">
      {configs.map((c) => {
        const picked = activeS === c.s;
        const isBest = bestS === c.s;
        return (
          <li key={c.s}>
            <button
              type="button"
              className={`flow-step${picked ? " active" : ""}${!c.stable ? " unstable-step" : ""}`}
              onClick={() => onSelect(c.s)}
              onMouseEnter={() => onSelect(c.s)}
            >
              <span className="flow-step-index">{c.s}</span>
              <span className="flow-step-body">
                <span className="flow-route">
                  <span className="flow-pill from">ρ {fmtNum(c.rho, 3)}</span>
                  <span className="flow-arrow">·</span>
                  <span className="flow-pill to">CT {c.stable ? fmtMoney(c.totalCost) : "—"}</span>
                  {isBest && <span className="flow-qty-badge">s*</span>}
                </span>
                <span className="flow-detail">
                  {c.stable
                    ? `W = ${fmtNum(c.wSec, 2)} s · Pw = ${fmtPct(c.pw)} · SLA ${c.slaOk ? "✓" : "✗"}`
                    : "Configuración inestable — aumentar servidores o reducir λ"}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}