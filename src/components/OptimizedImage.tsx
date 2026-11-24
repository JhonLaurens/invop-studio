import { useMemo, useState, type CSSProperties } from "react";
import { buildResponsiveSrcSet, withImageWidth } from "../lib/imageSrc";
import { LoadingSpinner } from "./LoadingSpinner";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  /** Reserva espacio (evita CLS). Ej: "16 / 10" */
  aspectRatio?: string;
  /** Hero / LCP: eager + alta prioridad */
  priority?: boolean;
  sizes?: string;
  /** Anchos para srcSet (solo Unsplash u origen compatible) */
  widths?: number[];
};

export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  aspectRatio,
  priority = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
  widths = [320, 480, 640, 800],
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const srcSet = useMemo(() => buildResponsiveSrcSet(src, widths), [src, widths]);
  const mainSrc = useMemo(() => withImageWidth(src, priority ? Math.min(width, 720) : Math.min(width, 520)), [src, width, priority]);

  const wrapStyle: CSSProperties | undefined = aspectRatio ? { aspectRatio } : undefined;

  return (
    <span
      className={`optimized-image${loaded ? " is-loaded" : ""}${error ? " has-error" : ""}${className ? ` ${className}` : ""}`}
      style={wrapStyle}
    >
      {!loaded && !error && (
        <span className="optimized-image-placeholder" aria-hidden>
          <span className="optimized-image-shimmer" />
          <LoadingSpinner size="sm" label="Cargando imagen" />
        </span>
      )}
      {error ? (
        <span className="optimized-image-fallback" role="img" aria-label={alt}>
          {alt}
        </span>
      ) : (
        <img
          className="optimized-image-img"
          src={mainSrc}
          srcSet={src.includes("images.unsplash.com") ? srcSet : undefined}
          sizes={src.includes("images.unsplash.com") ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </span>
  );
}