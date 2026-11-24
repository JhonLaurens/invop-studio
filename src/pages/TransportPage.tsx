import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalysisPanel } from "../components/AnalysisPanel";
import { CollapsibleIntro } from "../components/CollapsibleIntro";
import { chartTooltipContent } from "../components/ChartTooltip";
import { ConceptGallery } from "../components/ConceptGallery";
import { LearningVisual } from "../components/LearningVisual";
import { InfoTip } from "../components/InfoTip";
import { MethodAccordionGroup } from "../components/MethodAccordionGroup";
import { MethodStepFlow } from "../components/MethodStepFlow";
import { ModiIterationPanel } from "../components/ModiIterationPanel";
import { ModuleActionBar } from "../components/ModuleActionBar";
import { NameDialog } from "../components/NameDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { announce } from "../components/StatusToast";
import { OriginSupplyCard } from "../components/OriginSupplyCard";
import { PageSubnav } from "../components/PageSubnav";
import { SupplyBalanceStrip } from "../components/SupplyBalanceStrip";
import { TransportSpreadsheet } from "../components/TransportSpreadsheet";
import { usePreferences } from "../context/PreferencesContext";
import { useTheme } from "../context/ThemeContext";
import { downloadText, transportToCsv, transportToJson } from "../lib/exportData";
import { fmtMoney, fmtSignedPct } from "../lib/format";
import { chartMargin, chartPalette } from "../lib/chartTheme";
import { loadTransportScenario, saveTransportScenario } from "../lib/scenarioStorage";
import {
  deleteTransportScenario,
  listTransportScenarios,
  renameTransportScenario,
  saveTransportNamed,
  TRANSPORT_EXAMPLES,
} from "../lib/scenarioBook";
import { decodeScenario, encodeScenario, readHashParams, setHashScenario } from "../lib/urlScenario";
import { transportConclusions } from "../lib/conclusions";
import { validateTransportInput } from "../lib/transportValidation";
import {
  addDestination,
  addOrigin,
  BASE_TRANSPORT,
  MAX_TRANSPORT_DIM,
  balance,
  minimumCost,
  modi,
  northwest,
  totalsBalanced,
  removeDestination,
  removeOrigin,
  type TransportInput,
  vogel,
} from "../lib/transport";

const SUBNAV = [
  { id: "section-datos", label: "Datos" },
  { id: "section-comparar", label: "Comparar" },
  { id: "section-analisis", label: "Análisis" },
  { id: "section-metodos", label: "Métodos" },
];

export function TransportPage() {
  const { resolved } = useTheme();
  const { prefs } = usePreferences();
  const palette = chartPalette(resolved);
  const [bookTick, setBookTick] = useState(0);
  const [nameAsk, setNameAsk] = useState<{ mode: "save" } | { mode: "rename"; id: string; name: string } | null>(null);
  const [dropAsk, setDropAsk] = useState<{ id: string; name: string } | null>(null);
  const savedScenarios = useMemo(() => listTransportScenarios(), [bookTick]);
  const [input, setInput] = useState<TransportInput>(() => {
    const fromUrl = readHashParams().d;
    if (fromUrl) {
      const decoded = decodeScenario<TransportInput>(decodeURIComponent(fromUrl));
      if (decoded) return decoded;
    }
    return loadTransportScenario() ?? BASE_TRANSPORT;
  });

  useEffect(() => {
    saveTransportScenario(input);
  }, [input]);

  const fieldErrors = useMemo(() => validateTransportInput(input), [input]);
  const hasErrors = fieldErrors.length > 0;

  const results = useMemo(() => {
    if (hasErrors) return null;
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
  }, [input, hasErrors]);

  const maxSupply = useMemo(() => Math.max(...input.supply, 1), [input.supply]);
  const totalSupply = useMemo(() => input.supply.reduce((a, b) => a + b, 0), [input.supply]);
  const totalDemand = useMemo(() => input.demand.reduce((a, b) => a + b, 0), [input.demand]);
  const supplyDemandBalanced = totalsBalanced(totalSupply, totalDemand);

  const chartData = results
    ? [
        { name: "Noroeste", costo: results.no.totalCost, key: "no" },
        { name: "Costo mín.", costo: results.cm.totalCost, key: "cm" },
        { name: "Vogel", costo: results.vo.totalCost, key: "vo" },
        {
          name: results.opt.certified ? "Óptimo" : "MODI (sin certificar)",
          costo: results.opt.totalCost,
          key: "opt",
        },
      ]
    : [];

  const optimal = results?.opt.totalCost ?? 0;
  const gap = (z: number) => (optimal > 0 ? ((z - optimal) / optimal) * 100 : 0);

  const balPreview = useMemo(() => balance(input), [input]);
  const balanceNote = balPreview.dummyCol ? (
    <>Destino ficticio &quot;{balPreview.destNames.at(-1)}&quot; con demanda {balPreview.surplus}.</>
  ) : balPreview.dummyRow ? (
    <>Origen ficticio con oferta {balPreview.surplus} (demanda no cubierta).</>
  ) : undefined;

  const flowOrigins = results ? results.bal.originNames : input.originNames;
  const flowDests = results ? results.bal.destNames : input.destNames;
  const fictitiousDestIdx = results?.bal.dummyCol ? [results.bal.destNames.length - 1] : [];
  const fictitiousOrigIdx = results?.bal.dummyRow ? [results.bal.originNames.length - 1] : [];

  const copyAllocation = async () => {
    if (!results) return;
    const header = ["Origen", ...results.bal.destNames].join("\t");
    const rows = results.opt.allocation.map((row, i) => [results.bal.originNames[i], ...row].join("\t"));
    try {
      await navigator.clipboard.writeText([header, ...rows].join("\n"));
      announce("Asignación copiada");
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const enc = encodeScenario(input);
    setHashScenario("transporte", enc);
    try {
      await navigator.clipboard.writeText(window.location.href);
      announce("Enlace copiado");
    } catch {
      /* ignore */
    }
  };

  const barColor = (key: string) => {
    if (key === "opt" && results?.opt.certified) return palette.transportBarOpt;
    if (key === "opt") return palette.transportBarMuted;
    return palette.transportBar;
  };

  const methodItems = results
    ? [
        {
          id: "no",
          title: "Esquina Noroeste",
          subtitle: fmtMoney(results.no.totalCost),
          content: (
            <>
            <p><InfoTip label="Cómo funciona Noroeste">Parte de la esquina superior izquierda y asigna lo máximo posible antes de avanzar; no considera los costos al elegir la ruta.</InfoTip></p>
            <MethodStepFlow
              steps={results.no.steps}
              originNames={flowOrigins}
              destNames={flowDests}
              fictitiousOrigins={fictitiousOrigIdx}
              fictitiousDests={fictitiousDestIdx}
            />
            </>
          ),
        },
        {
          id: "cm",
          title: "Costo Mínimo",
          subtitle: fmtMoney(results.cm.totalCost),
          content: (
            <>
            <p><InfoTip label="Cómo funciona Costo Mínimo">Elige una ruta disponible de menor costo y asigna lo máximo posible; repite hasta completar la distribución.</InfoTip></p>
            <MethodStepFlow
              steps={results.cm.steps}
              originNames={flowOrigins}
              destNames={flowDests}
              fictitiousOrigins={fictitiousOrigIdx}
              fictitiousDests={fictitiousDestIdx}
            />
            </>
          ),
        },
        {
          id: "vo",
          title: "Vogel",
          subtitle: fmtMoney(results.vo.totalCost),
          content: (
            <>
            <p><InfoTip label="Cómo funciona Vogel">Calcula penalizaciones como la diferencia entre los dos costos disponibles más bajos; prioriza la mayor penalización.</InfoTip></p>
            <MethodStepFlow
              steps={results.vo.steps}
              originNames={flowOrigins}
              destNames={flowDests}
              fictitiousOrigins={fictitiousOrigIdx}
              fictitiousDests={fictitiousDestIdx}
            />
            </>
          ),
        },
        {
          id: "modi",
          title: results.opt.certified ? "Óptimo (MODI)" : "MODI: sin certificar",
          subtitle: fmtMoney(results.opt.totalCost),
          content: (
            <>
              <p><InfoTip label="Cómo funciona MODI">Evalúa costos reducidos y, cuando encuentra una mejora, ajusta la asignación mediante un ciclo. La optimalidad solo se afirma cuando queda certificada.</InfoTip></p>
              {results.opt.iterations.map((it, i) => (
                <ModiIterationPanel
                  key={i}
                  iteration={it}
                  index={i}
                  originNames={results.bal.originNames}
                  destNames={results.bal.destNames}
                />
              ))}
              {!results.opt.certified && <p className="badge warn">Sin certificar optimalidad.</p>}
              <div className="panel-actions">
                <button type="button" className="btn ghost sm" onClick={() => void copyAllocation()}>
                  Copiar asignación
                </button>
              </div>
              <AllocationTable names={results.bal} alloc={results.opt.allocation} />
            </>
          ),
        },
      ]
  : [];

  return (
    <div className="page transport">
      <header className="page-head page-head-actions">
        <div>
          <h1>
            <InfoTip label="Algoritmos de transporte">
              Reparte la oferta de cada origen entre destinos al menor costo. Esquina Noroeste, costo mínimo y Vogel dan soluciones iniciales; MODI comprueba si ya son óptimas.
            </InfoTip>
          </h1>
          <p>Ejemplo base: vacunas de tres centros hacia cuatro hospitales. Cambia un dato y el análisis se recalcula.</p>
        </div>
        <ModuleActionBar
          onReset={() => setInput(BASE_TRANSPORT)}
          examples={TRANSPORT_EXAMPLES.map((ex) => ({
            name: ex.name,
            onSelect: () => setInput(ex.data),
          }))}
          saved={savedScenarios.map((item) => ({
            id: item.id,
            name: item.name,
            onSelect: () => {
              setInput(item.data);
              announce(`Escenario ${item.name} cargado`);
            },
            onRename: () => setNameAsk({ mode: "rename", id: item.id, name: item.name }),
            onDelete: () => setDropAsk({ id: item.id, name: item.name }),
          }))}
          onSave={() => setNameAsk({ mode: "save" })}
          onExportCsv={() => {
            downloadText("transporte.csv", transportToCsv(input), "text/csv");
            announce("transporte.csv descargado");
          }}
          onExportJson={() => {
            downloadText("transporte.json", transportToJson(input), "application/json");
            announce("transporte.json descargado");
          }}
          onShare={() => void share()}
          onPrint={() => window.print()}
        />
      </header>

      <PageSubnav items={SUBNAV} />

      <CollapsibleIntro storageKey="estudio-io-intro-transport">
        <div className="learning-panel-inner">
          <div>
            <p className="kicker">Para empezar</p>
            <h2>
              <InfoTip label="¿Qué resuelve este módulo?">
                Minimiza el costo de enviar unidades desde orígenes con oferta hasta destinos con demanda. El ejemplo cargado es la distribución semanal de vacunas.
              </InfoTip>
            </h2>
            <p>
              Tres centros tienen 1.000, 1.250 y 850 dosis. Cuatro hospitales piden 800, 700, 700 y 600. Sobran 300 dosis y guardarlas cuesta $3, $1 y $2 según el centro. Los métodos no eligen solos el almacén más barato: a veces conviene usar ese centro en una ruta real.
            </p>
          </div>
          <LearningVisual kind="transport" />
        </div>
        <ConceptGallery kind="transport" />
      </CollapsibleIntro>

      <section id="section-datos" className="card panel arch-panel">
        <header className="panel-title-row">
          <h2><InfoTip label="Datos del problema">Introduce la oferta de cada origen, la demanda de cada destino y el costo unitario de cada ruta. Si los totales difieren, se añade un origen o destino ficticio.</InfoTip></h2>
          <span className="panel-accent-line" aria-hidden />
        </header>
        {hasErrors && (
          <p className="badge warn" role="alert">
            {fieldErrors.length} celda(s) con error — corrige los valores marcados.
          </p>
        )}
        <SupplyBalanceStrip
          totalSupply={totalSupply}
          totalDemand={totalDemand}
          balanced={supplyDemandBalanced}
          balanceNote={balanceNote}
        />
        <div className="panel-actions dim-controls">
          <button
            type="button"
            className="btn ghost sm"
            disabled={input.originNames.length >= MAX_TRANSPORT_DIM}
            title={input.originNames.length >= MAX_TRANSPORT_DIM ? "Límite de 10 orígenes" : undefined}
            onClick={() => setInput(addOrigin(input))}
          >
            + Origen
          </button>
          <button
            type="button"
            className="btn ghost sm"
            disabled={input.originNames.length <= 1}
            onClick={() => setInput(removeOrigin(input, input.originNames.length - 1))}
          >
            − Origen
          </button>
          <button
            type="button"
            className="btn ghost sm"
            disabled={input.destNames.length >= MAX_TRANSPORT_DIM}
            title={input.destNames.length >= MAX_TRANSPORT_DIM ? "Límite de 10 destinos" : undefined}
            onClick={() => setInput(addDestination(input))}
          >
            + Destino
          </button>
          <button
            type="button"
            className="btn ghost sm"
            disabled={input.destNames.length <= 1}
            onClick={() => setInput(removeDestination(input, input.destNames.length - 1))}
          >
            − Destino
          </button>
        </div>
        {prefs.originView === "cards" ? (
          <div className="origin-arch-grid">
            {input.originNames.map((name, i) => (
              <OriginSupplyCard
                key={i}
                index={i}
                name={name}
                supply={input.supply[i]}
                storageCost={input.storageCosts?.[i] ?? 0}
                maxSupply={maxSupply}
                destNames={input.destNames}
                costs={input.costs[i]}
                onName={(v) => {
                  const originNames = [...input.originNames];
                  originNames[i] = v;
                  setInput({ ...input, originNames });
                }}
                onSupply={(v) => {
                  const supply = [...input.supply];
                  supply[i] = v;
                  setInput({ ...input, supply });
                }}
                onStorage={(v) => {
                  const storageCosts = [...(input.storageCosts ?? [])];
                  storageCosts[i] = v;
                  setInput({ ...input, storageCosts });
                }}
                onCost={(j, value) => {
                  const costs = input.costs.map((row) => [...row]);
                  costs[i][j] = value;
                  setInput({ ...input, costs });
                }}
              />
            ))}
          </div>
        ) : (
          <TransportSpreadsheet
            input={input}
            assignmentHint={results?.opt.allocation}
            errors={fieldErrors}
            onChange={setInput}
          />
        )}
      </section>
      <NameDialog
        open={nameAsk != null}
        title={nameAsk?.mode === "rename" ? "Renombrar escenario" : "Guardar escenario"}
        initial={nameAsk?.mode === "rename" ? nameAsk.name : "Mi transporte"}
        onCancel={() => setNameAsk(null)}
        onConfirm={(name) => {
          if (nameAsk?.mode === "rename") renameTransportScenario(nameAsk.id, name);
          else {
            saveTransportNamed(name, input);
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
          if (dropAsk) deleteTransportScenario(dropAsk.id);
          setBookTick((tick) => tick + 1);
          setDropAsk(null);
        }}
      />

      {results && (
        <section id="section-comparar" className="card panel arch-panel compare-split">
          <header className="panel-title-row">
            <h2><InfoTip label="Comparación de costos">Compara el costo total Z de las soluciones iniciales con el resultado de MODI. La diferencia frente al óptimo solo se muestra cuando este está certificado.</InfoTip></h2>
            <span className="panel-accent-line" aria-hidden />
          </header>
          <div className="compare-split-inner">
            <div className="compare-chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--chart-axis)" }} />
                  <YAxis domain={[0, "auto"]} tickFormatter={(v) => fmtMoney(Number(v))} tick={{ fill: "var(--chart-axis)" }} />
                  <Tooltip content={chartTooltipContent((v) => fmtMoney(v))} />
                  <Bar dataKey="costo" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={barColor(entry.key)} />
                    ))}
                    <LabelList
                      dataKey="costo"
                      position="top"
                      formatter={(v) => `${fmtMoney(Number(v))}`}
                      style={{ fill: "var(--chart-axis)", fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <InfoTip label="Método">Noroeste, costo mínimo y Vogel son soluciones factibles. Óptimo solo aparece cuando MODI certifica que no queda una mejora.</InfoTip>
                  </th>
                  <th><InfoTip label="Z">Costo total de transporte: suma de cada cantidad enviada multiplicada por su costo unitario.</InfoTip></th>
                  <th><InfoTip label="vs. óptimo">Porcentaje en que el costo supera el resultado óptimo certificado por MODI.</InfoTip></th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => (
                  <tr key={row.name} className={row.key === "opt" && results.opt.certified ? "opt-row" : ""}>
                    <td>{row.name}</td>
                    <td>{fmtMoney(row.costo)}</td>
                    <td>{!results.opt.certified || row.key === "opt" ? "—" : fmtSignedPct(gap(row.costo))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {results && (
        <AnalysisPanel
          title="Análisis del resultado"
          help="Lee el costo de cada método y dónde queda el sobrante o el faltante. El texto usa los datos que están cargados ahora, no una cifra fija."
          points={transportConclusions(results.bal, results.no, results.cm, results.vo, results.opt)}
        />
      )}

      {results && (
        <section id="section-metodos" className="card panel">
          <header className="panel-title-row">
            <h2><InfoTip label="Métodos de solución">Noroeste, costo mínimo y Vogel construyen soluciones iniciales. MODI evalúa mejoras y verifica la optimalidad cuando es posible.</InfoTip></h2>
            <span className="panel-accent-line" aria-hidden />
          </header>
          <MethodAccordionGroup items={methodItems} />
        </section>
      )}
    </div>
  );
}

function AllocationTable({
  names,
  alloc,
}: {
  names: { originNames: string[]; destNames: string[] };
  alloc: number[][];
}) {
  const colTotals = names.destNames.map((_, j) => alloc.reduce((s, row) => s + row[j], 0));
  const rowTotals = alloc.map((row) => row.reduce((a, b) => a + b, 0));
  return (
    <div className="table-wrap">
      <table className="data-table matrix-fixed">
        <thead>
          <tr>
            <th />
            {names.destNames.map((name) => (
              <th key={name}>{name}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {alloc.map((row, i) => (
            <tr key={i}>
              <th>{names.originNames[i]}</th>
              {row.map((v, j) => (
                <td key={j} className={v > 0 ? "cell-assigned" : ""}>
                  {v > 0 ? v : "—"}
                </td>
              ))}
              <th>{rowTotals[i]}</th>
            </tr>
          ))}
          <tr>
            <th>Total</th>
            {colTotals.map((t, j) => (
              <th key={j}>{t}</th>
            ))}
            <th />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
