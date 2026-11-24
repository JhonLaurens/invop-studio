import { LoadingSpinner } from "./LoadingSpinner";

export function PageSkeleton({ title }: { title: string }) {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label={`Cargando ${title}`}>
      <div className="page-skeleton-head">
        <LoadingSpinner size="md" label={`Cargando ${title}…`} />
      </div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line w-80" />
      <div className="grid-2" style={{ marginTop: "1rem" }}>
        <div className="card panel skeleton-panel">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line w-70" />
          <div className="skeleton skeleton-input" />
          <div className="skeleton skeleton-input" />
        </div>
        <div className="card panel skeleton-panel">
          <div className="skeleton skeleton-chart" />
        </div>
      </div>
    </div>
  );
}