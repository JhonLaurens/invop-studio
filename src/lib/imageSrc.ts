/** Ajusta parámetros Unsplash para peso y formato moderno (auto=format → WebP/AVIF). */
export function withImageWidth(src: string, width: number, quality = 72): string {
  if (!src.includes("images.unsplash.com")) {
    return src;
  }
  const q = src.indexOf("?");
  const base = q >= 0 ? src.slice(0, q) : src;
  const params = new URLSearchParams(q >= 0 ? src.slice(q + 1) : "");
  params.set("auto", "format");
  params.set("fit", "crop");
  params.set("w", String(Math.round(width)));
  params.set("q", String(quality));
  return `${base}?${params}`;
}

export function buildResponsiveSrcSet(src: string, widths: number[], quality = 72): string {
  return widths.map((w) => `${withImageWidth(src, w, quality)} ${w}w`).join(", ");
}