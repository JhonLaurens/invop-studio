import { motion } from "framer-motion";
import { ArchField } from "./ArchField";
import { InfoTip } from "./InfoTip";

const ICON_FACTORY = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 21V8l9-5 9 5v13H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ICON_BOX = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 8l8-4 8 4v12H4V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 4v20" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ICON_RESERVE = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 6V4h10v2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

type Props = {
  index: number;
  name: string;
  supply: number;
  storageCost: number;
  maxSupply: number;
  destNames: string[];
  costs: number[];
  onName: (v: string) => void;
  onSupply: (v: number) => void;
  onStorage: (v: number) => void;
  onCost: (destIndex: number, value: number) => void;
};

export function OriginSupplyCard({
  index,
  name,
  supply,
  storageCost,
  maxSupply,
  destNames,
  costs,
  onName,
  onSupply,
  onStorage,
  onCost,
}: Props) {
  const pct = maxSupply > 0 ? Math.min(100, (supply / maxSupply) * 100) : 0;

  return (
    <motion.article
      className="origin-arch"
      layout
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <header className="origin-arch-head">
        <span className="origin-arch-badge">Origen {index + 1}</span>
        <InfoTip label="?">Centro de abastecimiento. La oferta es inventario disponible.</InfoTip>
      </header>

      <ArchField icon={ICON_FACTORY} label="Nombre del centro">
        <input
          id={`origin-name-${index}`}
          className="input-arch"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Ej. Laboratorio A"
          aria-label={`Nombre del origen ${index + 1}`}
        />
      </ArchField>

      <div className="supply-meter" role="presentation">
        <div className="supply-meter-track">
          <motion.div
            className="supply-meter-fill"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <span className="supply-meter-caption">
          {pct.toFixed(0)}% de la mayor oferta del problema
        </span>
      </div>

      <div className="origin-arch-metrics">
        <ArchField icon={ICON_BOX} label="Oferta (unidades)">
          <input
            id={`origin-supply-${index}`}
            className="input-arch"
            type="number"
            min="0.01"
            step="any"
            value={supply}
            aria-label={`Oferta de ${name || `origen ${index + 1}`}`}
            onChange={(e) => {
              if (!Number.isFinite(e.target.valueAsNumber) || e.target.valueAsNumber <= 0) return;
              onSupply(e.target.valueAsNumber);
            }}
          />
        </ArchField>
        <ArchField
          icon={ICON_RESERVE}
          label={<InfoTip label="Costo reserva">Costo por unidad no despachada en columna ficticia.</InfoTip>}
        >
          <input
            id={`origin-storage-${index}`}
            className="input-arch"
            type="number"
            min="0"
            step="any"
            value={storageCost}
            aria-label={`Costo reserva de ${name || `origen ${index + 1}`}`}
            onChange={(e) => {
              if (!Number.isFinite(e.target.valueAsNumber) || e.target.valueAsNumber < 0) return;
              onStorage(e.target.valueAsNumber);
            }}
          />
        </ArchField>
      </div>
      <div className="card-costs">
        <p className="chart-caption">Costo por unidad hacia cada destino</p>
        {destNames.map((dest, j) => (
          <label key={dest} className="card-cost-row">
            <span>{dest}</span>
            <input
              className="input-arch"
              type="number"
              min="0"
              step="any"
              value={costs[j] ?? 0}
              aria-label={`Costo de ${name || `origen ${index + 1}`} a ${dest}`}
              onChange={(e) => {
                if (!Number.isFinite(e.target.valueAsNumber) || e.target.valueAsNumber < 0) return;
                onCost(j, e.target.valueAsNumber);
              }}
            />
          </label>
        ))}
      </div>
    </motion.article>
  );
}