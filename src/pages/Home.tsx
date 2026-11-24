import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { InfoTip } from "../components/InfoTip";
import { loadQueueScenario, loadTransportScenario } from "../lib/scenarioStorage";
import { BASE_QUEUE } from "../lib/queues";
import { BASE_TRANSPORT, type TransportInput } from "../lib/transport";
import type { QueueParams } from "../lib/queues";
import { OptimizedImage } from "../components/OptimizedImage";

const HERO_IMG =
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=720&q=72";

const modules = [
  {
    to: "/transporte",
    title: "Algoritmos de transporte",
    tag: "Optimización lineal",
    desc: "Esquina Noroeste, Costo Mínimo, Vogel y MODI con tablas comparativas y paso a paso.",
    metrics: ["3 métodos iniciales", "Óptimo verificado", "Balanceo ficticio"],
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=640&q=72",
    alt: "Camión de distribución en ruta — ilustración logística",
  },
  {
    to: "/colas",
    title: "Teoría de colas M/M/s",
    tag: "Optimización estocástica",
    desc: "Indicadores, costo total, cumplimiento SLA y distribución Pₙ con gráficos interactivos.",
    metrics: ["Comparativo 1–5 servidores", "s* económico", "Metas W y Pw"],
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=640&q=72",
    alt: "Equipo revisando métricas de servicio",
  },
];

function sameTransport(saved: TransportInput) {
  const base = BASE_TRANSPORT;
  return JSON.stringify(saved.originNames) === JSON.stringify(base.originNames)
    && JSON.stringify(saved.destNames) === JSON.stringify(base.destNames)
    && JSON.stringify(saved.supply) === JSON.stringify(base.supply)
    && JSON.stringify(saved.demand) === JSON.stringify(base.demand)
    && JSON.stringify(saved.costs) === JSON.stringify(base.costs)
    && JSON.stringify(saved.storageCosts ?? []) === JSON.stringify(base.storageCosts ?? []);
}

function sameQueue(saved: { p: QueueParams; cwMin: number }) {
  const base = BASE_QUEUE;
  const current = saved.p;
  return saved.cwMin === 5
    && current.lambda === base.lambda
    && current.mu === base.mu
    && current.cs === base.cs
    && current.sMin === base.sMin
    && current.sMax === base.sMax
    && current.wMaxSec === base.wMaxSec
    && current.pwMax === base.pwMax;
}

export function Home() {
  const transport = loadTransportScenario();
  const queue = loadQueueScenario();
  const hasTransport = !!transport && !sameTransport(transport);
  const hasQueue = !!queue && !sameQueue(queue);

  return (
    <div className="home">
      <motion.section className="hero card hero-split hero-compact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="kicker">Institución Universitaria ITM · Proyecto académico</p>
          <h1>Laboratorio de optimización y desarrollo operativo</h1>
          <p className="lead">
            Explora modelos de transporte y teoría de colas. Modifica los datos, comprende el procedimiento y compara
            resultados.
          </p>
          {(hasTransport || hasQueue) && (
            <div className="hero-resume-actions">
              {hasTransport && (
                <Link className="btn ghost sm hero-resume-btn" to="/transporte">
                  Retomar Transporte
                </Link>
              )}
              {hasQueue && (
                <Link className="btn ghost sm hero-resume-btn" to="/colas">
                  Retomar Colas
                </Link>
              )}
            </div>
          )}
        </div>
        <OptimizedImage
          className="hero-illustration"
          src={HERO_IMG}
          alt="Dashboard de análisis y métricas"
          width={720}
          height={450}
          aspectRatio="16 / 10"
          priority
          sizes="(min-width: 900px) 38vw, 92vw"
          widths={[400, 560, 720, 900]}
        />
      </motion.section>

      <section className="card how-to">
        <h2>
          <InfoTip label="Cómo comprobar un resultado">
            Cambia un solo dato del ejemplo base y revisa que el costo o el número de servidores se mueva en el mismo sentido. El botón Referencias, arriba, lista las fuentes de las fórmulas.
          </InfoTip>
        </h2>
        <ol className="edu-steps how-to-steps">
          <li>Abre Transporte o Colas con el ejemplo base.</li>
          <li>Cambia una oferta, una demanda o la tasa de llegadas.</li>
          <li>Lee Comparar y Análisis: la conclusión tiene que seguir a los datos nuevos.</li>
        </ol>
      </section>

      <div className="module-grid">
        {modules.map((m, i) => (
          <motion.article
            key={m.to}
            className="module-card card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            whileHover={{ y: -4 }}
          >
            <div className="module-card-media module-card-media-compact">
              <OptimizedImage
                src={m.image}
                alt={m.alt}
                width={640}
                height={280}
                aspectRatio="16 / 7"
                sizes="(min-width: 640px) 340px, 92vw"
                widths={[280, 400, 560, 640]}
              />
            </div>
            <div className="module-card-body">
              <span className="module-tag">{m.tag}</span>
              <h2>{m.title}</h2>
              <p>{m.desc}</p>
              <div className="metric-chips">
                {m.metrics.map((x) => (
                  <span key={x} className="chip metric-chip">
                    {x}
                  </span>
                ))}
              </div>
              <Link className="btn primary" to={m.to}>
                Abrir módulo →
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}