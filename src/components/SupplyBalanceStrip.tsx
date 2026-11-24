import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { InfoTip } from "./InfoTip";

type Props = {
  totalSupply: number;
  totalDemand: number;
  balanced: boolean;
  balanceNote?: ReactNode;
};

export function SupplyBalanceStrip({ totalSupply, totalDemand, balanced, balanceNote }: Props) {
  const max = Math.max(totalSupply, totalDemand, 1);
  const supplyPct = (totalSupply / max) * 100;
  const demandPct = (totalDemand / max) * 100;
  const diff = totalSupply - totalDemand;

  return (
    <div className="balance-strip">
      <div className="balance-strip-head">
        <InfoTip label="Balance oferta y demanda">
          Los métodos exigen que la oferta total iguale la demanda total. Si sobra oferta se crea un destino ficticio; si falta, un origen ficticio.
        </InfoTip>
        <span className={`balance-strip-pill${balanced ? " ok" : ""}`}>{balanced ? "Equilibrado" : `Δ ${diff > 0 ? "+" : ""}${diff} u.`}</span>
      </div>
      <div className="balance-strip-bars">
        <div className="balance-strip-row">
          <span>Oferta total</span>
          <strong>{totalSupply}</strong>
        </div>
        <div className="balance-strip-track">
          <motion.div className="balance-strip-fill supply" animate={{ width: `${supplyPct}%` }} />
        </div>
        <div className="balance-strip-row">
          <span>Demanda total</span>
          <strong>{totalDemand}</strong>
        </div>
        <div className="balance-strip-track">
          <motion.div className="balance-strip-fill demand" animate={{ width: `${demandPct}%` }} />
        </div>
      </div>
      {balanceNote && <p className="balance-strip-note">{balanceNote}</p>}
    </div>
  );
}