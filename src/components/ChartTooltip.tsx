type PayloadItem = { name?: string; value?: number | string; color?: string };

type TooltipLike = {
  active?: boolean;
  payload?: readonly PayloadItem[];
  label?: string | number;
};

type Props = TooltipLike & {
  formatter?: (value: number) => string;
  labelFormatter?: (label: string | number) => string;
};

export function ChartTooltip({ active, payload, label, formatter, labelFormatter }: Props) {
  if (!active || !payload?.length) return null;
  const title = labelFormatter && label != null ? labelFormatter(label) : label;
  return (
    <div className="chart-tooltip" role="status">
      {title != null && title !== "" && <p className="chart-tooltip-title">{title}</p>}
      <ul className="chart-tooltip-list">
        {payload.map((entry, i) => (
          <li key={i}>
            <span className="chart-tooltip-dot" style={{ background: entry.color ?? "var(--teal)" }} aria-hidden />
            <span className="chart-tooltip-name">{entry.name}</span>
            <strong className="chart-tooltip-value">
              {formatter && typeof entry.value === "number" ? formatter(entry.value) : String(entry.value ?? "")}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function chartTooltipContent(formatter?: (v: number) => string, labelFormatter?: (l: string | number) => string) {
  return function Content(props: unknown) {
    const p = props as TooltipLike;
    return <ChartTooltip {...p} formatter={formatter} labelFormatter={labelFormatter} />;
  };
}