import { motion } from "framer-motion";
import { InfoTip } from "./InfoTip";

type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warn";
  help?: string;
};

export function KpiCard({ label, value, hint, tone = "default", help }: Props) {
  return (
    <motion.div
      className={`kpi-card tone-${tone}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <span className="kpi-label">{help ? <InfoTip label={label}>{help}</InfoTip> : label}</span>
      <strong className="kpi-value">{value}</strong>
      {hint && <span className="kpi-hint">{hint}</span>}
    </motion.div>
  );
}
