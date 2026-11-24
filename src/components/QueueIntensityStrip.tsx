import { motion } from "framer-motion";
import { InfoTip } from "./InfoTip";
import { fmtNum } from "../lib/format";

type Props = {
  lambda: number;
  mu: number;
  servers: number;
  rho: number | null;
  stable: boolean;
  unitLabel?: string;
};

export function QueueIntensityStrip({ lambda, mu, servers, rho, stable, unitLabel = "/min" }: Props) {
  const capacity = servers * mu;
  const loadPct = capacity > 0 ? Math.min(100, (lambda / capacity) * 100) : 0;
  const arrivalPct = Math.min(100, (lambda / Math.max(lambda, capacity, 1)) * 100);

  return (
    <div className="balance-strip queue-intensity">
      <div className="balance-strip-head">
        <InfoTip label={`Intensidad · ${servers === 1 ? "1 servidor" : `${servers} servidores`}`}>
          Compara las llegadas con la capacidad s·μ. ρ es llegadas divididas por esa capacidad. El sistema solo tiene indicadores finitos si ρ es menor que 1.
        </InfoTip>
        <span className={`balance-strip-pill${stable ? " ok" : ""}`}>
          {stable ? `ρ = ${fmtNum(rho ?? 0, 4)}` : "Inestable (ρ ≥ 1)"}
        </span>
      </div>
      <div className="balance-strip-bars">
        <div className="balance-strip-row">
          <span>Llegadas λ</span>
          <strong>{fmtNum(lambda, 2)} {unitLabel}</strong>
        </div>
        <div className="balance-strip-track">
          <motion.div className="balance-strip-fill demand" animate={{ width: `${arrivalPct}%` }} />
        </div>
        <div className="balance-strip-row">
          <span>Capacidad s·μ</span>
          <strong>{fmtNum(capacity, 2)} {unitLabel}</strong>
        </div>
        <div className="balance-strip-track">
          <motion.div
            className={`balance-strip-fill supply${!stable ? " overload" : ""}`}
            animate={{ width: `${loadPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}