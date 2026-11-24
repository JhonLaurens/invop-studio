import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { AnalysisPanel } from "../components/AnalysisPanel";
import { ConceptGallery } from "../components/ConceptGallery";
import { LearningVisual } from "../components/LearningVisual";
import { PageSubnav } from "../components/PageSubnav";
import { KpiCard } from "../components/KpiCard";
import { InfoTip } from "../components/InfoTip";
import { QueueParamsArch } from "../components/QueueParamsArch";
import { QueueIntensityStrip } from "../components/QueueIntensityStrip";
import { QueueSystemFlow } from "../components/QueueSystemFlow";
import { CollapsibleIntro } from "../components/CollapsibleIntro";
import { chartTooltipContent } from "../components/ChartTooltip";
import { useTheme } from "../context/ThemeContext";
import { queueConclusions } from "../lib/conclusions";
import { fmtMoney, fmtNum, fmtPct } from "../lib/format";
import { chartMargin, chartPalette } from "../lib/chartTheme";
import { loadQueueScenario, saveQueueScenario } from "../lib/scenarioStorage";
import { BASE_QUEUE, bestCost, queueDistribution, scanConfigs, type QueueParams } from "../lib/queues";
import { ModuleActionBar } from "../components/ModuleActionBar";
import { NameDialog } from "../components/NameDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { announce } from "../components/StatusToast";
import { usePreferences } from "../context/PreferencesContext";
import { convertRateFromPerMin, fromSeconds, ratePerUnitLabel, timeUnitLabel } from "../lib/timeUnit";
import { formatTimeColumn } from "../lib/formatDuration";
import { downloadText, queueIndicatorsToCsv, queueParamsToJson } from "../lib/exportData";
import {
  deleteQueueScenario,
  listQueueScenarios,
  QUEUE_EXAMPLES,
  renameQueueScenario,
  saveQueueNamed,
} from "../lib/scenarioBook";
import { decodeScenario, encodeScenario, readHashParams, setHashScenario } from "../lib/urlScenario";
import { OptimizedImage } from "../components/OptimizedImage";

const SUBNAV = [
  { id: "section-params", label: "Parámetros" },
  { id: "section-costos", label: "Costos" },
  { id: "section-tabla", label: "Indicadores" },
  { id: "section-analisis", label: "Análisis" },
];

const EMPTY_IMG = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=360&q=72";

export function QueuesPage() {
  const { resolved } = useTheme();
  const { prefs, setPref } = usePreferences();
  const tu = prefs.queueTimeUnit;
  const tuLbl = timeUnitLabel(tu);
  const palette = chartPalette(resolved);
  const [p, setP] = useState<QueueParams>(() => {
    const fromUrl = readHashParams().d;
    if (fromUrl) {
      const decoded = decodeScenario<{ p: QueueParams; cwMin: number }>(decodeURIComponent(fromUrl));
      if (decoded) return decoded.p;
    }
    return loadQueueScenario()?.p ?? BASE_QUEUE;
  });
  const [cwMin, setCwMin] = useState(() => {
    const fromUrl = readHashParams().d;
    if (fromUrl) {
      const decoded = decodeScenario<{ p: QueueParams; cwMin: number }>(decodeURIComponent(fromUrl));
      if (decoded) return decoded.cwMin;
    }
    return loadQueueScenario()?.cwMin ?? 5;
  });
  const [bookTick, setBookTick] = useState(0);
  const [nameAsk, setNameAsk] = useState<{ mode: "save" } | { mode: "rename"; id: string; name: string } | null>(null);
  const [dropAsk, setDropAsk] = useState<{ id: string; name: string } | null>(null);
  const savedScenarios = useMemo(() => listQueueScenarios(), [bookTick]);
  const [selectedS, setSelectedS] = useState<number | null>(null);
  const [hoveredS, setHoveredS] = useState<number | null>(null);

  useEffect(() => {
    saveQueueScenario({ ...p, cwPerHour: cwMin * 60 }, cwMin);
  }, [p, cwMin]);

  const params = useMemo(() => ({ ...p, cwPerHour: cwMin * 60 }), [p, cwMin]);

  const valid =
    Number.isFinite(p.lambda) &&
    p.lambda > 0 &&
    Number.isFinite(p.mu) &&
    p.mu > 0 &&
    Number.isFinite(p.cs) &&
    p.cs >= 0 &&
    Number.isFinite(cwMin) &&
    cwMin >= 0 &&
    Number.isInteger(p.sMin) &&
    Number.isInteger(p.sMax) &&
    p.sMin >= 1 &&
    p.sMax <= 100 &&
    p.sMin <= p.sMax &&
    (p.wMaxSec === undefined || (Number.isFinite(p.wMaxSec) && p.wMaxSec >= 0)) &&
    (p.pwMax === undefined || (Number.isFinite(p.pwMax) && p.pwMax >= 0 && p.pwMax <= 100));

  const configs = useMemo(() => (valid ? scanConfigs(params) : []), [params, valid]);

  const best = bestCost(configs);
  const bestSla = bestCost(configs.filter((c) => c.slaOk));

  const activeS = selectedS !== null && configs.some((c) => c.s === selectedS) ? selectedS : best?.s ?? p.sMin;

  const focusConfig = configs.find((c) => c.s === activeS);
  const chartCost = configs
    .filter((c) => c.stable)
    .map((c) => ({
      s: `s=${c.s}`,
      servicio: c.serviceCost,
      espera: c.waitCost,
      total: c.totalCost,
    }));

  const pnChart = useMemo(() => {
    if (!best) return [];
    let acc = 0;
    const rows: { n: string; prob: number; cum: number }[] = [];
    queueDistribution(best, params.lambda, params.mu).forEach((prob, i) => {
      acc += prob;
      rows.push({ n: `n=${i}`, prob: prob * 100, cum: acc * 100 });
    });
    return rows;
  }, [best, params.lambda, params.mu]);

  const pnSum = pnChart.reduce((s, r) => s + r.prob, 0);

  const serverRange = useMemo(() => {
    const list: number[] = [];
    for (let s = p.sMin; s <= p.sMax; s++) list.push(s);
    return list;
  }, [p.sMin, p.sMax]);

  return (
    <div className="page queues">
      <header className="page-head page-head-actions">
        <div className="page-head-main">
          <h1>
            <InfoTip label="Teoría de colas · M/M/s">
              Llegadas Poisson y servicio exponencial con s servidores en paralelo. M/M/1, M/M/2 y M/M/3 son ese modelo con 1, 2 y 3 servidores.
            </InfoTip>
          </h1>
          <div className="page-head-meta">
            <p className="chart-caption">
              λ y μ en {ratePerUnitLabel(tu)} · Cs y CT en $/h · penalización Cw según unidad elegida.
            </p>
            <label className="time-unit-inline">
              <span>Unidad de tiempo</span>
              <select
                value={tu}
                aria-label="Unidad de tiempo"
                onChange={(e) => setPref("queueTimeUnit", e.target.value as "s" | "min" | "h")}
              >
                <option value="s">Segundos</option>
                <option value="min">Minutos</option>
                <option value="h">Horas</option>
              </select>
            </label>
          </div>
        </div>
        <ModuleActionBar
          onReset={() => {
            setP({ ...BASE_QUEUE });
            setCwMin(5);
            setSelectedS(null);
            setHoveredS(null);
          }}
          examples={QUEUE_EXAMPLES.map((ex) => ({
            name: ex.name,
            onSelect: () => {
              setP(ex.p);
              setCwMin(ex.cwMin);
              setSelectedS(null);
            },
          }))}
          saved={savedScenarios.map((item) => ({
            id: item.id,
            name: item.name,
            onSelect: () => {
              setP(item.data.p);
              setCwMin(item.data.cwMin);
              setSelectedS(null);
              announce(`Escenario ${item.name} cargado`);
            },
            onRename: () => setNameAsk({ mode: "rename", id: item.id, name: item.name }),
            onDelete: () => setDropAsk({ id: item.id, name: item.name }),
          }))}
          onSave={() => setNameAsk({ mode: "save" })}
          onExportCsv={() => {
            downloadText("colas.csv", queueIndicatorsToCsv(configs), "text/csv");
            announce("colas.csv descargado");
          }}
          onExportJson={() => {
            downloadText("colas.json", queueParamsToJson(params, cwMin), "application/json");
            announce("colas.json descargado");
          }}
          onShare={async () => {
            const enc = encodeScenario({ p, cwMin });
            setHashScenario("colas", enc);
            try {
              await navigator.clipboard.writeText(window.location.href);
              announce("Enlace copiado");
            } catch {
              /* ignore */
            }
          }}
          onPrint={() => window.print()}
        />
        {!valid && (
          <p className="badge warn" role="alert">
            Revisa los datos: tasas mayores que cero, costos y metas no negativos, Pw entre 0 y 100 %, y servidores enteros entre 1 y 100 con mínimo menor o igual al máximo.
          </p>
        )}
      </header>

      <PageSubnav items={SUBNAV} />

      <CollapsibleIntro storageKey="estudio-io-intro-queues">
        <div className="learning-panel-inner">
          <div>
            <p className="kicker">Para empezar</p>
            <h2>
              <InfoTip label="¿Qué representa una cola?">
                Las peticiones llegan al azar, esperan si todos los servidores están ocupados y salen al terminar un servicio también aleatorio.
              </InfoTip>
            </h2>
            <p>
              El ejemplo base es una API de imágenes: llegan 15 peticiones por minuto y cada servidor atiende 10. Un servidor cuesta $40 por hora. Cada minuto que una petición pasa en el sistema cuesta $5, es decir $300 por hora multiplicados por L. Las metas son W de hasta 7 segundos y Pw de hasta 10 %.
            </p>
          </div>
          <LearningVisual kind="queues" />
        </div>
        <ConceptGallery kind="queues" />
      </CollapsibleIntro>

      {best && (
        <section className="kpi-row" aria-label="Indicadores clave">
          <KpiCard
            label="s* económico"
            help="Cantidad de servidores con el menor costo total entre las opciones estables del rango seleccionado. Puede no cumplir las metas SLA."
            value={`s = ${best.s}`}
            hint={
              p.sMin === p.sMax
                ? `${fmtMoney(best.totalCost)}/h · solo se evalúa s = ${p.sMin}`
                : `${fmtMoney(best.totalCost)}/h · menor costo entre s = ${p.sMin} y ${p.sMax}`
            }
            tone="success"
          />
          <KpiCard
            label="Vista actual"
            help="Configuración elegida para explorar el diagrama y sus indicadores; puede ser distinta de la de menor costo."
            value={`s = ${activeS}`}
            hint={focusConfig?.stable ? fmtMoney(focusConfig.totalCost) + "/h" : "Inestable"}
          />
          <KpiCard
            label="W (sistema)"
            help="Tiempo promedio total de una entidad en el sistema: espera en cola más tiempo de servicio."
            value={`${formatTimeColumn(fromSeconds(best.wSec, tu))} ${tuLbl}`}
            hint={`referencia s* = ${best.s}`}
          />
          <KpiCard
            label="SLA (s*)"
            help="Indica si la opción de menor costo cumple los límites configurados de tiempo promedio W y probabilidad de esperar Pw."
            value={best.slaOk ? "Cumple" : "No cumple"}
            hint={best.slaOk ? "Dentro de metas" : "Revisar W o Pw máx."}
            tone={best.slaOk ? "success" : "warn"}
          />
        </section>
      )}

      <section id="section-params" className="grid-2 grid-2-balanced">
        <section className="card panel arch-panel">
          <header className="panel-title-row">
          <h2><InfoTip label="Parámetros del modelo">Ajusta las tasas, los costos, el rango de servidores y las metas para comparar escenarios M/M/s.</InfoTip></h2>
            <span className="panel-accent-line" aria-hidden />
          </header>
          {focusConfig && (
            <QueueIntensityStrip
              lambda={convertRateFromPerMin(p.lambda, tu)}
              mu={convertRateFromPerMin(p.mu, tu)}
              servers={activeS}
              rho={focusConfig.stable ? focusConfig.rho : null}
              stable={focusConfig.stable}
              unitLabel={ratePerUnitLabel(tu)}
            />
          )}
          <QueueParamsArch
            p={p}
            cwMin={cwMin}
            serverRange={serverRange}
            highlightS={activeS}
            timeUnit={tu}
            onChange={setP}
            onCwMin={setCwMin}
            onFocusS={setSelectedS}
            valid={valid}
          />
        </section>

        <section className="card panel highlight arch-panel panel-sticky">
          <header className="panel-title-row">
            <h2>
              <InfoTip label="Qué conviene">
                Primero, la cantidad de servidores más barata del rango. Después, en palabras, qué pasa con la cantidad que estás viendo: cuántas personas llegan, cuántas esperan y cuántos servidores atienden.
              </InfoTip>
            </h2>
            <span className="panel-accent-line" aria-hidden />
          </header>

          {best && (
            <motion.article className={`decision-card${best.slaOk ? "" : " warn"}`} layout>
              <p className="qs-story-kicker">La opción más barata</p>
              <p className="reco">
                Usa <strong>{best.s === 1 ? "1 servidor" : `${best.s} servidores`}</strong>. Cuesta{" "}
                <strong>{fmtMoney(best.totalCost)} por hora</strong> y{" "}
                {best.slaOk
                  ? "cumple las metas de tiempo y de probabilidad de espera."
                  : "no cumple las metas de tiempo o de probabilidad de espera."}
              </p>
              {activeS !== best.s && (
                <p className="chart-caption">
                  La lectura de abajo es de {activeS === 1 ? "1 servidor" : `${activeS} servidores`}, no de la opción más barata.
                </p>
              )}
              {bestSla && best.s !== bestSla.s && (
                <p className="chart-caption">
                  Si exiges cumplir las metas, la más barata es {bestSla.s === 1 ? "1 servidor" : `${bestSla.s} servidores`} (
                  {fmtMoney(bestSla.totalCost)} por hora, {fmtMoney(bestSla.totalCost - best.totalCost)} más).
                </p>
              )}
            </motion.article>
          )}

          {focusConfig ? (
            <QueueSystemFlow
              lambda={convertRateFromPerMin(p.lambda, tu)}
              perUnit={tu === "h" ? "por hora" : tu === "s" ? "por segundo" : "por minuto"}
              s={activeS}
              lq={focusConfig.lq}
              l={focusConfig.l}
              pw={focusConfig.pw}
              stable={focusConfig.stable}
              matchesRecommendation={best?.s === activeS}
            />
          ) : !valid ? (
            <div className="empty-state">
              <OptimizedImage src={EMPTY_IMG} alt="" width={200} height={140} aspectRatio="10 / 7" widths={[200, 320, 360]} sizes="200px" />
              <p>Corrige los parámetros para calcular la recomendación.</p>
            </div>
          ) : (
            <div className="empty-state">
              <OptimizedImage src={EMPTY_IMG} alt="" width={200} height={140} aspectRatio="10 / 7" widths={[200, 320, 360]} sizes="200px" />
              <p className="badge warn">Ninguna configuración estable en el rango (ρ ≥ 1).</p>
            </div>
          )}
        </section>
      </section>

      <section id="section-costos" className="card panel arch-panel">
        <header className="panel-title-row">
          <h2><InfoTip label="Costo por hora vs. servidores">Compara el costo de servicio, el costo de permanencia y su suma para cada cantidad estable de servidores.</InfoTip></h2>
          <span className="panel-accent-line" aria-hidden />
        </header>
        <p className="chart-caption">
          <InfoTip label="Servicio, espera y total">
            Servicio es Cs × s. Espera es Cw por hora × L. El total es la suma. Si ρ ≥ 1 la fila no entra en la gráfica porque el costo de espera no es finito.
          </InfoTip>
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartCost} margin={chartMargin}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="4 4" />
            <XAxis dataKey="s" tick={{ fill: "var(--chart-axis)" }} />
            <YAxis tickFormatter={(v) => fmtMoney(Number(v))} tick={{ fill: "var(--chart-axis)" }} />
            <RTooltip content={chartTooltipContent((v) => fmtMoney(v))} />
            <Legend wrapperStyle={{ color: "var(--chart-axis)" }} />
            <Line type="monotone" dataKey="servicio" name="Servicio" stroke={palette.lineService} strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="espera" name="Espera" stroke={palette.lineWait} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="total" name="Total" stroke={palette.lineTotal} strokeWidth={3} dot={{ r: 5 }} />
            {best && (
              <>
                <ReferenceLine x={`s=${best.s}`} stroke={palette.transportBarOpt} strokeDasharray="4 4" label="s*" />
                <ReferenceDot
                  x={`s=${best.s}`}
                  y={best.totalCost}
                  r={6}
                  fill={palette.transportBarOpt}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section id="section-tabla" className="card panel arch-panel">
        <header className="panel-title-row">
          <h2><InfoTip label="Indicadores por configuración">Cada fila resume el desempeño, el costo por hora y el cumplimiento de metas para una cantidad de servidores.</InfoTip></h2>
          <span className="panel-accent-line" aria-hidden />
        </header>
        <p className="chart-caption">Se comparan las configuraciones entre s = {p.sMin} y s = {p.sMax}. «Menor costo» señala la opción estable más económica de ese rango.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <InfoTip label="Modelo">M/M/s: llegadas Poisson, servicio exponencial y s servidores. M/M/1 es la fila de un servidor.</InfoTip>
                </th>
                <th>
                  <InfoTip label="ρ">Utilización media de los servidores. Si ρ es mayor o igual a 1, el sistema es inestable.</InfoTip>
                </th>
                <th>
                  <InfoTip label="P0">Probabilidad de que no haya entidades en el sistema.</InfoTip>
                </th>
                <th>
                  <InfoTip label="Pw">Probabilidad de que una llegada tenga que esperar antes de recibir servicio.</InfoTip>
                </th>
                <th>
                  <InfoTip label="Lq">Número promedio de entidades que esperan en la cola.</InfoTip>
                </th>
                <th>
                  <InfoTip label="L">Número promedio de entidades en el sistema: en espera y en servicio.</InfoTip>
                </th>
                <th>
                  <InfoTip label={`Wq (${tuLbl})`}>Tiempo promedio de espera en la cola, sin incluir el servicio.</InfoTip>
                </th>
                <th>
                  <InfoTip label={`W (${tuLbl})`}>Tiempo promedio en el sistema, incluyendo la espera y el servicio.</InfoTip>
                </th>
                <th><InfoTip label="CT/h">Costo total por hora: costo de servidores más costo de permanencia en el sistema.</InfoTip></th>
                <th><InfoTip label="SLA">Indica si se cumplen las metas configuradas de tiempo W y probabilidad Pw.</InfoTip></th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => {
                const isBest = best && c.s === best.s;
                const isSelected = c.s === activeS;
                const isHover = hoveredS === c.s;
                return (
                  <tr
                    key={c.s}
                    className={!c.stable ? "unstable" : isBest ? "opt-row" : isSelected ? "row-selected" : isHover ? "row-hover" : ""}
                    onClick={() => setSelectedS(c.s)}
                    onMouseEnter={() => setHoveredS(c.s)}
                    onMouseLeave={() => setHoveredS(null)}
                  >
                    <td>
                      M/M/{c.s}
                      {isBest && <span className="chip">Menor costo</span>}
                    </td>
                    <td>{fmtNum(c.rho, 4)}</td>
                    <td>{c.stable ? fmtNum(c.p0, 4) : "—"}</td>
                    <td>{c.stable ? fmtPct(c.pw) : "—"}</td>
                    <td>{c.stable ? fmtNum(c.lq, 4) : "—"}</td>
                    <td>{c.stable ? fmtNum(c.l, 4) : "—"}</td>
                    <td>{c.stable ? formatTimeColumn(fromSeconds(c.wqMin * 60, tu)) : "—"}</td>
                    <td>{c.stable ? formatTimeColumn(fromSeconds(c.wSec, tu)) : "—"}</td>
                    <td>{c.stable ? fmtMoney(c.totalCost) : "Inestable"}</td>
                    <td>
                      {!c.stable ? (
                        "—"
                      ) : (
                        <span className={`sla-cell${c.slaOk ? " ok" : " fail"}`}>
                          <span aria-hidden>{c.slaOk ? "✓" : "✗"}</span> {c.slaOk ? "Cumple" : "No cumple"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {valid && configs.length > 0 && (
        <AnalysisPanel
          title="Análisis del resultado"
          help="Interpreta el comparativo de 1, 2 y 3 servidores, el costo mínimo del rango y si esa opción cumple las metas. Usa los parámetros actuales."
          points={queueConclusions(configs, p.wMaxSec !== undefined || p.pwMax !== undefined)}
        />
      )}

      {best && (
        <section className="card panel arch-panel">
          <header className="panel-title-row">
            <h2><InfoTip label={`Distribución Pₙ (s* = ${best.s})`}>Pₙ es la probabilidad de encontrar exactamente n entidades en el sistema para la configuración de menor costo del rango. La línea muestra la probabilidad acumulada.</InfoTip></h2>
            <span className="panel-accent-line" aria-hidden />
          </header>
          <p className="chart-caption">
            Probabilidad discreta Pₙ: suma mostrada ≈ {fmtNum(pnSum, 1)} %.
            {pnSum < 99 ? " Se muestran hasta 60 estados; la probabilidad restante corresponde a estados no graficados." : " Se muestran estados hasta alcanzar el 99 %."}
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={pnChart} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
              <XAxis dataKey="n" tick={{ fill: "var(--chart-axis)" }} />
              <YAxis unit="%" tick={{ fill: "var(--chart-axis)" }} />
              <RTooltip content={chartTooltipContent((v) => `${fmtNum(v, 2)} %`)} />
              <Legend />
              <Bar dataKey="prob" name="Pₙ" fill={palette.pnBar} radius={[6, 6, 0, 0]}>
                <LabelList dataKey="prob" position="top" formatter={(v) => `${fmtNum(Number(v), 1)} %`} style={{ fontSize: 11, fill: "var(--chart-axis)" }} />
              </Bar>
              <Line type="monotone" dataKey="cum" name="P acum." stroke={palette.lineTotal} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      )}
      <NameDialog
        open={nameAsk != null}
        title={nameAsk?.mode === "rename" ? "Renombrar escenario" : "Guardar escenario"}
        initial={nameAsk?.mode === "rename" ? nameAsk.name : "Mi cola"}
        onCancel={() => setNameAsk(null)}
        onConfirm={(name) => {
          if (nameAsk?.mode === "rename") renameQueueScenario(nameAsk.id, name);
          else {
            saveQueueNamed(name, { ...p, cwPerHour: cwMin * 60 }, cwMin);
            announce(`Escenario ${name} guardado`);
          }
          setBookTick((tick) => tick + 1);
          setNameAsk(null);
        }}
      />
      <ConfirmDialog
        open={dropAsk != null}
        title="Eliminar escenario"
        message={dropAsk ? `¿Eliminar "${dropAsk.name}"?` : ""}
        onCancel={() => setDropAsk(null)}
        onConfirm={() => {
          if (dropAsk) deleteQueueScenario(dropAsk.id);
          setBookTick((tick) => tick + 1);
          setDropAsk(null);
        }}
      />
    </div>
  );
}
