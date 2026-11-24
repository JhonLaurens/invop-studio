type Props = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const SIZE = { sm: 22, md: 32, lg: 44 } as const;

export function LoadingSpinner({ size = "md", label = "Cargando", className = "" }: Props) {
  const px = SIZE[size];
  return (
    <span
      className={`io-spinner-wrap${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="io-spinner" style={{ width: px, height: px }} aria-hidden />
      {size !== "sm" && <span className="io-spinner-label">{label}</span>}
    </span>
  );
}