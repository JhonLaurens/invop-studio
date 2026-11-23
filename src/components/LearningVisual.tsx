type Props = { kind: "transport" | "queues" };

export function LearningVisual({ kind }: Props) {
  const transport = kind === "transport";
  return (
    <figure className="learning-visual" aria-label={transport ? "Esquema de distribución desde orígenes hacia destinos" : "Esquema de llegadas, cola y servidores"}>
      <svg viewBox="0 0 680 210" role="img" aria-hidden="true">
        <defs>
          <marker id={`arrow-${kind}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#00849a" /></marker>
        </defs>
        {transport ? <>
          <rect x="25" y="28" width="180" height="60" rx="12" fill="#e8effa" stroke="#102d69" strokeWidth="2" />
          <rect x="25" y="124" width="180" height="60" rx="12" fill="#e8effa" stroke="#102d69" strokeWidth="2" />
          <rect x="475" y="28" width="180" height="60" rx="12" fill="#e4f6f8" stroke="#00849a" strokeWidth="2" />
          <rect x="475" y="124" width="180" height="60" rx="12" fill="#e4f6f8" stroke="#00849a" strokeWidth="2" />
          <text x="115" y="65" textAnchor="middle">Origen A</text><text x="115" y="161" textAnchor="middle">Origen B</text>
          <text x="565" y="65" textAnchor="middle">Destino 1</text><text x="565" y="161" textAnchor="middle">Destino 2</text>
          <path d="M215 58 H465 M215 154 H465 M215 75 L465 140 M215 137 L465 70" fill="none" stroke="#00849a" strokeWidth="3" markerEnd={`url(#arrow-${kind})`} />
        </> : <>
          <rect x="25" y="72" width="150" height="68" rx="12" fill="#e8effa" stroke="#102d69" strokeWidth="2" />
          <rect x="263" y="72" width="150" height="68" rx="12" fill="#e4f6f8" stroke="#00849a" strokeWidth="2" />
          <rect x="505" y="28" width="150" height="60" rx="12" fill="#e8effa" stroke="#102d69" strokeWidth="2" />
          <rect x="505" y="124" width="150" height="60" rx="12" fill="#e8effa" stroke="#102d69" strokeWidth="2" />
          <text x="100" y="112" textAnchor="middle">Llegadas λ</text><text x="338" y="112" textAnchor="middle">Cola</text>
          <text x="580" y="65" textAnchor="middle">Servidor 1</text><text x="580" y="161" textAnchor="middle">Servidor 2</text>
          <path d="M185 106 H253 M423 96 L495 58 M423 116 L495 154" fill="none" stroke="#00849a" strokeWidth="3" markerEnd={`url(#arrow-${kind})`} />
        </>}
      </svg>
      <figcaption>{transport ? "Las rutas conectan la oferta de cada origen con la demanda de cada destino." : "Las peticiones llegan, pueden esperar y son atendidas por un servidor disponible."}</figcaption>
    </figure>
  );
}
