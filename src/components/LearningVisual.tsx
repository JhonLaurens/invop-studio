type Props = { kind: "transport" | "queues" };

export function LearningVisual({ kind }: Props) {
  const transport = kind === "transport";

  if (transport) {
    return (
      <figure className="learning-visual learning-visual--transport" aria-labelledby="learning-visual-transport-cap">
        <div className="t-mini" role="img" aria-label="Matriz de costos entre dos orígenes y dos destinos">
          <span className="t-mini-corner">Enviar</span>
          <span className="t-mini-head t-mini-dest">Destino 1</span>
          <span className="t-mini-head t-mini-dest">Destino 2</span>
          <span className="t-mini-head t-mini-origin">Origen A</span>
          <span className="t-mini-cell">costo A→1</span>
          <span className="t-mini-cell">costo A→2</span>
          <span className="t-mini-head t-mini-origin">Origen B</span>
          <span className="t-mini-cell">costo B→1</span>
          <span className="t-mini-cell">costo B→2</span>
        </div>
        <figcaption id="learning-visual-transport-cap">
          Cada celda es el costo de mandar una unidad de ese origen a ese destino. El método elige cuánto enviar en cada una.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="learning-visual learning-visual--queues" aria-labelledby="learning-visual-queues-cap">
      <ol className="q-learn">
        <li className="learning-node learning-node-origin q-learn-node">
          <strong>1 · Llegan</strong>
          <span>Peticiones con tasa λ</span>
        </li>
        <li className="q-learn-link" aria-hidden>
          →
        </li>
        <li className="learning-node learning-node-queue q-learn-node">
          <strong>2 · Esperan</strong>
          <span>Cola si no hay servidor libre</span>
        </li>
        <li className="q-learn-link" aria-hidden>
          →
        </li>
        <li className="q-learn-servers">
          <div className="learning-node learning-node-dest q-learn-node">
            <strong>3 · Atienden</strong>
            <span>Servidor disponible</span>
          </div>
        </li>
      </ol>
      <figcaption id="learning-visual-queues-cap">
        Las peticiones llegan, esperan si hace falta y salen cuando un servidor las atiende.
      </figcaption>
    </figure>
  );
}