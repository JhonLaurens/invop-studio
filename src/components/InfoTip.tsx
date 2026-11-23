import { useState, type ReactNode } from "react";
import clsx from "clsx";

interface Props {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}

export function InfoTip({ label, children, side = "top" }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={clsx("info-tip", side)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen((value) => !value); }
        if (event.key === "Escape") setOpen(false);
      }}
      tabIndex={0}
      role="button"
      aria-label={typeof children === "string" ? children : label}
    >
      {label}
      <span className={clsx("info-tip-panel", open && "open")} role="tooltip">
        {children}
      </span>
    </span>
  );
}
