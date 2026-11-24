import { LoadingSpinner } from "./LoadingSpinner";

type Props = { title: string };

export function RouteLoader({ title }: Props) {
  return (
    <div className="route-loader" role="status" aria-busy="true" aria-label={`Cargando módulo ${title}`}>
      <LoadingSpinner size="lg" label={`Cargando ${title}…`} />
      <p className="route-loader-hint">Preparando tablas y gráficos</p>
    </div>
  );
}