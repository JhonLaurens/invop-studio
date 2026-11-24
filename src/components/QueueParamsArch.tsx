import { motion } from "framer-motion";
import { ArchField } from "./ArchField";
import { InfoTip } from "./InfoTip";
import type { QueueParams } from "../lib/queues";
import { fmtMoney } from "../lib/format";
import { convertRateFromPerMin, costFromPerMinute, costToPerMinute, fromSeconds, ratePerUnitLabel, timeUnitLabel, toSeconds, type TimeUnit } from "../lib/timeUnit";

const ICON_LAMBDA = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 18V6l8 6 8-6v12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

function rateInputValue(rate: number, unit: TimeUnit): number {
  const value = convertRateFromPerMin(rate, unit);
  if (!Number.isFinite(value) || value === 0) return value;
  return Math.abs(value) < 0.0001 ? Number(value.toPrecision(3)) : Number(value.toFixed(4));
}

function rateLabel(rate: number, unit: TimeUnit): string {
  return new Intl.NumberFormat("es-CO", { maximumSignificantDigits: 4 }).format(convertRateFromPerMin(rate, unit));
}

const ICON_MU = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ICON_MONEY = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ICON_SERVER = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="4" y="4" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <rect x="4" y="14" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="8" cy="7" r="1" fill="currentColor" />
    <circle cx="8" cy="17" r="1" fill="currentColor" />
  </svg>
);

const ICON_SLA = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3l8 4v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

type Props = {
  p: QueueParams;
  cwMin: number;
  serverRange: number[];
  highlightS: number;
  timeUnit: TimeUnit;
  onChange: (next: QueueParams) => void;
  onCwMin: (v: number) => void;
  onFocusS: (s: number) => void;
  valid: boolean;
};

export function QueueParamsArch({
  p,
  cwMin,
  serverRange,
  highlightS,
  timeUnit,
  onChange,
  onCwMin,
  onFocusS,
  valid,
}: Props) {
  const cwUnit = timeUnit === "s" ? "segundo" : timeUnit === "h" ? "hora" : "minuto";
  const cwDisplayed = costFromPerMinute(cwMin, timeUnit);
  const lambdaMsg = p.lambda > 0 ? "" : "λ debe ser mayor que 0";
  const muMsg = p.mu > 0 ? "" : "μ debe ser mayor que 0";
  const csMsg = p.cs >= 0 ? "" : "Cs no puede ser negativo";
  const cwMsg = cwMin >= 0 ? "" : "Cw no puede ser negativo";
  const wMsg = p.wMaxSec == null || p.wMaxSec >= 0 ? "" : "W máximo no puede ser negativo";
  const pwMsg = p.pwMax == null || (p.pwMax >= 0 && p.pwMax <= 100) ? "" : "Pw debe estar entre 0 y 100 %";
  return (
    <div className="queue-arch-stack">
      <motion.article className="origin-arch" layout>
        <header className="origin-arch-head">
          <span className="origin-arch-badge">Tasas</span>
        </header>
        <div className="origin-arch-metrics">
          <ArchField icon={ICON_LAMBDA} label={<InfoTip label="λ">Tasa media de llegadas por unidad de tiempo. Se supone un proceso de Poisson.</InfoTip>}>
            <input
              className="input-arch"
              type="number"
              id="queue-lambda"
              aria-label={`Tasa de llegadas lambda en ${ratePerUnitLabel(timeUnit)}`}
              aria-invalid={lambdaMsg ? true : undefined}
              aria-describedby={lambdaMsg ? "queue-lambda-error" : undefined}
              value={rateInputValue(p.lambda, timeUnit)}
              onChange={(e) => {
                const display = +e.target.value;
                const perMin = timeUnit === "min" ? display : timeUnit === "h" ? display / 60 : display * 60;
                onChange({ ...p, lambda: perMin });
              }}
            />
            <input
              className="range-sync"
              type="range"
              min={convertRateFromPerMin(Math.min(1, p.lambda > 0 ? p.lambda : 1), timeUnit)}
              max={convertRateFromPerMin(Math.max(40, p.lambda), timeUnit)}
              step={timeUnit === "s" ? "any" : convertRateFromPerMin(0.5, timeUnit)}
              value={convertRateFromPerMin(p.lambda, timeUnit)}
              onChange={(e) => {
                const display = +e.target.value;
                const perMin = timeUnit === "min" ? display : timeUnit === "h" ? display / 60 : display * 60;
                onChange({ ...p, lambda: perMin });
              }}
              aria-label={`Ajustar lambda en ${ratePerUnitLabel(timeUnit)}`}
              aria-valuetext={`${rateLabel(p.lambda, timeUnit)} ${ratePerUnitLabel(timeUnit)}`}
            />
            {lambdaMsg && <p id="queue-lambda-error" className="field-msg">{lambdaMsg}</p>}
          </ArchField>
          <ArchField icon={ICON_MU} label={<InfoTip label="μ">Tasa media de atención por cada servidor y unidad de tiempo.</InfoTip>}>
            <input
              className="input-arch"
              type="number"
              id="queue-mu"
              aria-label={`Tasa de servicio mu en ${ratePerUnitLabel(timeUnit)}`}
              aria-invalid={muMsg ? true : undefined}
              aria-describedby={muMsg ? "queue-mu-error" : undefined}
              value={rateInputValue(p.mu, timeUnit)}
              onChange={(e) => {
                const display = +e.target.value;
                const perMin = timeUnit === "min" ? display : timeUnit === "h" ? display / 60 : display * 60;
                onChange({ ...p, mu: perMin });
              }}
            />
            <input
              className="range-sync"
              type="range"
              min={convertRateFromPerMin(Math.min(1, p.mu > 0 ? p.mu : 1), timeUnit)}
              max={convertRateFromPerMin(Math.max(30, p.mu), timeUnit)}
              step={timeUnit === "s" ? "any" : convertRateFromPerMin(0.5, timeUnit)}
              value={convertRateFromPerMin(p.mu, timeUnit)}
              onChange={(e) => {
                const display = +e.target.value;
                const perMin = timeUnit === "min" ? display : timeUnit === "h" ? display / 60 : display * 60;
                onChange({ ...p, mu: perMin });
              }}
              aria-label={`Ajustar mu en ${ratePerUnitLabel(timeUnit)}`}
              aria-valuetext={`${rateLabel(p.mu, timeUnit)} ${ratePerUnitLabel(timeUnit)}`}
            />
            {muMsg && <p id="queue-mu-error" className="field-msg">{muMsg}</p>}
          </ArchField>
        </div>
        <p className="chart-caption">
          Tasas λ y μ en {ratePerUnitLabel(timeUnit)} · Cs en $/servidor·h · Cw en $/entidad·{timeUnit}
        </p>
      </motion.article>

      <motion.article className="origin-arch" layout>
        <header className="origin-arch-head">
          <span className="origin-arch-badge">Modelo</span>
        </header>
        <p className="chart-caption">
          <InfoTip label="Modelo activo: M/M/s">
            M/M/1, M/M/2 y M/M/3 son este mismo modelo con s = 1, 2 o 3. No hay sala de espera limitada: M/M/s/K no se calcula aquí.
          </InfoTip>
        </p>
      </motion.article>

      <motion.article className="origin-arch" layout>
        <header className="origin-arch-head">
          <span className="origin-arch-badge">Costos</span>
        </header>
        <div className="origin-arch-metrics">
          <ArchField icon={ICON_MONEY} label={<InfoTip label="Cs">Costo por hora de cada servidor.</InfoTip>}>
            <input
              className="input-arch"
              type="number"
              id="queue-cs"
              aria-label="Costo por servidor Cs en dólares por hora"
              aria-invalid={csMsg ? true : undefined}
              aria-describedby={csMsg ? "queue-cs-error" : undefined}
              value={p.cs}
              onChange={(e) => onChange({ ...p, cs: +e.target.value })}
            />
            {csMsg && <p id="queue-cs-error" className="field-msg">{csMsg}</p>}
          </ArchField>
          <ArchField
            icon={ICON_MONEY}
            label={<InfoTip label="Cw">Penalización por entidad en el sistema ($/{timeUnit}).</InfoTip>}
            hint={`${fmtMoney(cwMin * 60)}/h equivalente`}
          >
            <input
              className="input-arch"
              type="number"
              id="queue-cw"
              aria-label={`Costo de espera Cw en dólares por entidad por ${cwUnit}`}
              aria-invalid={cwMsg ? true : undefined}
              aria-describedby={cwMsg ? "queue-cw-error" : undefined}
              value={Number(cwDisplayed.toPrecision(4))}
              onChange={(e) => onCwMin(costToPerMinute(+e.target.value, timeUnit))}
            />
            {cwMsg && <p id="queue-cw-error" className="field-msg">{cwMsg}</p>}
          </ArchField>
        </div>
      </motion.article>

      <motion.article className="origin-arch" layout>
        <header className="origin-arch-head">
          <span className="origin-arch-badge">Servidores</span>
        </header>
        <ArchField icon={ICON_SERVER} label={<InfoTip label="Rango de servidores">Define las cantidades mínima y máxima de servidores que se comparan. El mínimo costo se busca dentro de este rango.</InfoTip>}>
          <div className="dual-range-track">
            <div className="dual-range-labels">
              <strong>s mín = {p.sMin}</strong>
              <strong>s máx = {p.sMax}</strong>
            </div>
            <div className="dual-range-controls">
            <input
              className="range-sync range-min"
              type="range"
              min={1}
              max={20}
              value={p.sMin}
              onChange={(e) => onChange({ ...p, sMin: Math.min(+e.target.value, p.sMax) })}
              aria-label="s mínimo"
              aria-valuetext={`s mínimo ${p.sMin}`}
            />
            <input
              className="range-sync range-max"
              type="range"
              min={1}
              max={20}
              value={p.sMax}
              onChange={(e) => onChange({ ...p, sMax: Math.max(+e.target.value, p.sMin) })}
              aria-label="s máximo"
              aria-valuetext={`s máximo ${p.sMax}`}
            />
            </div>
          </div>
        </ArchField>
        {valid && serverRange.length > 0 && (
          <>
            <p className="chart-caption">Explora s — actualiza el diagrama y la tabla.</p>
            <div className="server-picker server-picker-arch" role="group" aria-label="Seleccionar servidores">
              {serverRange.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={highlightS === s ? "active" : ""}
                  aria-pressed={highlightS === s}
                  onClick={() => onFocusS(s)}
                >
                  s = {s}
                </button>
              ))}
            </div>
          </>
        )}
      </motion.article>

      <motion.article className="origin-arch" layout>
        <header className="origin-arch-head">
          <span className="origin-arch-badge">Metas SLA</span>
        </header>
        <div className="origin-arch-metrics">
          <ArchField
            icon={ICON_SLA}
            label={
              <InfoTip label={`W máx (${timeUnitLabel(timeUnit)})`}>Tiempo máximo promedio permitido en el sistema, incluyendo espera y atención.</InfoTip>
            }
          >
            <input
              className="input-arch"
              type="number"
              id="queue-wmax"
              aria-label={`Tiempo máximo W en ${timeUnitLabel(timeUnit)}`}
              aria-invalid={wMsg ? true : undefined}
              aria-describedby={wMsg ? "queue-wmax-error" : undefined}
              value={p.wMaxSec != null ? Number(fromSeconds(p.wMaxSec, timeUnit).toPrecision(4)) : ""}
              placeholder="Opcional"
              onChange={(e) =>
                onChange({ ...p, wMaxSec: e.target.value ? toSeconds(+e.target.value, timeUnit) : undefined })
              }
            />
            {wMsg && <p id="queue-wmax-error" className="field-msg">{wMsg}</p>}
          </ArchField>
          <ArchField icon={ICON_SLA} label={<InfoTip label="Pw máx (%)">Probabilidad máxima de esperar.</InfoTip>}>
            <input
              className="input-arch"
              type="number"
              id="queue-pwmax"
              aria-label="Probabilidad máxima de esperar Pw en porcentaje"
              aria-invalid={pwMsg ? true : undefined}
              aria-describedby={pwMsg ? "queue-pwmax-error" : undefined}
              value={p.pwMax ?? ""}
              placeholder="Opcional"
              onChange={(e) => onChange({ ...p, pwMax: e.target.value ? +e.target.value : undefined })}
            />
            {pwMsg && <p id="queue-pwmax-error" className="field-msg">{pwMsg}</p>}
          </ArchField>
        </div>
      </motion.article>
    </div>
  );
}
