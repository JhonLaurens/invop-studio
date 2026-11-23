import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const modules = [
  {
    to: "/transporte",
    title: "Algoritmos de transporte",
    tag: "Optimización lineal",
    desc: "Esquina Noroeste, Costo Mínimo, Vogel y MODI con tablas comparativas y paso a paso.",
    metrics: ["3 métodos iniciales", "Óptimo verificado", "Balanceo ficticio"],
  },
  {
    to: "/colas",
    title: "Teoría de colas M/M/s",
    tag: "Optimización estocástica",
    desc: "Indicadores, costo total, cumplimiento SLA y distribución Pₙ con gráficos interactivos.",
    metrics: ["Comparativo 1–5 servidores", "s* económico", "Metas W y Pw"],
  },
];

export function Home() {
  return (
    <div className="home">
      <motion.section
        className="hero card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="kicker">Institución Universitaria ITM · Proyecto académico</p>
        <h1>Laboratorio de optimización y desarrollo operativo</h1>
        <p className="lead">
          Explora modelos de transporte y teoría de colas. Modifica los datos, comprende el
          procedimiento y compara los resultados para tomar mejores decisiones.
        </p>
      </motion.section>

      <div className="module-grid">
        {modules.map((m, i) => (
          <motion.article
            key={m.to}
            className="module-card card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
          >
            <span className="module-tag">{m.tag}</span>
            <h2>{m.title}</h2>
            <p>{m.desc}</p>
            <ul>
              {m.metrics.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <Link className="btn primary" to={m.to}>
              Abrir módulo
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
