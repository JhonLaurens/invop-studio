import { InfoTip } from "./InfoTip";

type Props = { kind: "transport" | "queues" };

export function ConceptGallery({ kind }: Props) {
  if (kind === "transport") {
    return (
      <div className="edu-grid">
        <article className="edu-card">
          <h3>
            <InfoTip label="Red de envío">Cada origen reparte su oferta entre destinos. Una celda es una ruta, no un depósito.</InfoTip>
          </h3>
          <div className="edu-net" role="img" aria-label="Tres orígenes envían hacia cuatro destinos">
            <div>
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
            <span aria-hidden>→</span>
            <div>
              <span>H1</span>
              <span>H2</span>
              <span>H3</span>
              <span>H4</span>
            </div>
          </div>
          <p>El ejemplo base reparte vacunas desde tres centros hacia cuatro hospitales.</p>
        </article>
        <article className="edu-card">
          <h3>
            <InfoTip label="Costo de una ruta">Z suma cantidad enviada por el costo de esa celda. Una ruta barata con poca cantidad puede costar menos que una cara muy usada.</InfoTip>
          </h3>
          <p className="edu-eq">
            <strong>Z</strong> = Σ cantidad × costo
          </p>
          <p>200 dosis a $5 aportan $1.000. 800 dosis a $2 aportan $1.600.</p>
        </article>
        <article className="edu-card">
          <h3>
            <InfoTip label="Balanceo">Si oferta y demanda no coinciden, se agrega un destino o un origen ficticio para poder aplicar los métodos.</InfoTip>
          </h3>
          <div className="edu-balance" role="img" aria-label="Oferta mayor que la demanda crea una reserva">
            <span>Oferta 3.100</span>
            <span>Demanda 2.800</span>
            <span>Reserva 300</span>
          </div>
          <p>La reserva es almacenamiento, no un hospital. Si falta oferta, el origen ficticio es demanda sin cubrir.</p>
        </article>
        <article className="edu-card">
          <h3>
            <InfoTip label="Inicial y óptimo">Noroeste, costo mínimo y Vogel construyen una solución factible. MODI decide si ya es óptima o la mejora.</InfoTip>
          </h3>
          <ol className="edu-steps">
            <li>Noroeste ignora el costo</li>
            <li>Costo mínimo toma la celda más barata</li>
            <li>Vogel mira el costo de no elegirla</li>
            <li>MODI certifica o corrige</li>
          </ol>
        </article>
      </div>
    );
  }

  return (
    <div className="edu-grid">
      <article className="edu-card">
        <h3>
          <InfoTip label="Notación M/M/s">La primera M es llegadas Poisson, la segunda es servicio exponencial y s es el número de servidores en paralelo.</InfoTip>
        </h3>
        <div className="edu-kendall" role="img" aria-label="Notación M barra M barra s">
          <span>
            <strong>M</strong>
            <small>llegan al azar</small>
          </span>
          <span aria-hidden>/</span>
          <span>
            <strong>M</strong>
            <small>servicio al azar</small>
          </span>
          <span aria-hidden>/</span>
          <span>
            <strong>s</strong>
            <small>servidores</small>
          </span>
        </div>
        <p>M/M/1, M/M/2 y M/M/3 son el mismo modelo con 1, 2 o 3 servidores.</p>
      </article>
      <article className="edu-card">
        <h3>
          <InfoTip label="Estabilidad">ρ = λ / (s·μ). Si ρ es 1 o más, llegan al menos tantas peticiones como la capacidad y la cola no se detiene.</InfoTip>
        </h3>
        <div className="edu-balance" role="img" aria-label="Quince llegadas frente a diez de capacidad con un servidor">
          <span>λ = 15</span>
          <span>1 servidor · μ = 10</span>
          <span>ρ = 1,50 inestable</span>
        </div>
        <p>En el ejemplo base, un solo servidor no da abasto. Con 2, ρ baja a 0,75.</p>
      </article>
      <article className="edu-card">
        <h3>
          <InfoTip label="Ley de Little">L = λW relaciona personas en el sistema, llegadas por unidad de tiempo y tiempo medio de permanencia. Las tres describen el mismo sistema.</InfoTip>
        </h3>
        <p className="edu-eq">
          <strong>L</strong> = <strong>λ</strong> × <strong>W</strong>
        </p>
        <p>Si hay 2 personas y llegan 15 por minuto, cada una pasa 2/15 de minuto en el sistema.</p>
      </article>
      <article className="edu-card">
        <h3>
          <InfoTip label="Dos costos">Cs × s es el costo de tener servidores encendidos. Cw × L es la penalización por el tiempo que las peticiones pasan en el sistema.</InfoTip>
        </h3>
        <div className="edu-balance" role="img" aria-label="Costo de servidores más costo de espera">
          <span>Servidores Cs × s</span>
          <span>+ espera Cw × L</span>
          <span>= costo por hora</span>
        </div>
        <p>Agregar un servidor sube la primera parte y suele bajar la segunda. Conviene mientras el ahorro sea mayor.</p>
      </article>
    </div>
  );
}
