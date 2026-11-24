import { fmtNum, fmtPct } from "../lib/format";

type Props = {
  lambda: number;
  perUnit: string;
  s: number;
  lq: number;
  l: number;
  pw: number;
  stable: boolean;
  matchesRecommendation: boolean;
};

export function QueueSystemFlow({
  lambda,
  perUnit,
  s,
  lq,
  l,
  pw,
  stable,
  matchesRecommendation,
}: Props) {
  const servers = s === 1 ? "1 servidor" : `${s} servidores`;

  return (
    <div className="qs-story">
      <p className="qs-story-kicker">
        {matchesRecommendation ? "Así se lee esa opción" : "Lo que estás viendo ahora"}
      </p>
      <p className="qs-story-lead">
        {stable ? (
          <>
            Con <strong>{servers}</strong> el sistema alcanza a atender: la cola no crece sin límite.
          </>
        ) : (
          <>
            Con <strong>{servers}</strong> llegan más personas de las que se pueden atender. La cola crece sin límite.
          </>
        )}
      </p>
      <ol className="qs-story-steps">
        <li>
          <span className="qs-step-k">Llegan</span>
          <span className="qs-step-body">
            <strong>{fmtNum(lambda, 1)}</strong>
            <span>personas {perUnit}</span>
          </span>
        </li>
        <li>
          <span className="qs-step-k">Esperan</span>
          <span className="qs-step-body">
            <strong>{stable ? fmtNum(lq, 2) : "—"}</strong>
            <span>personas en la cola, en promedio</span>
            <span className="qs-step-note">
              {stable ? `El ${fmtPct(pw)} tiene que esperar antes de ser atendido.` : "No se puede calcular si la cola no se estabiliza."}
            </span>
          </span>
        </li>
        <li>
          <span className="qs-step-k">Atienden</span>
          <span className="qs-step-body">
            <strong>{s}</strong>
            <span>{s === 1 ? "servidor trabajando" : "servidores trabajando"}</span>
            <span className="qs-step-note">
              {stable
                ? `En todo el sistema hay ${fmtNum(l, 2)} personas en promedio (cola más servicio).`
                : "Los indicadores del sistema no tienen valor finito."}
            </span>
          </span>
        </li>
      </ol>
    </div>
  );
}
