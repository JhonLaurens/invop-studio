import { useEffect, useId, useState, type ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
};

export function CollapsibleBlock({ title, subtitle, defaultOpen = false, onToggle, children }: Props) {
  const triggerId = useId();
  const bodyId = useId();
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  };
  return (
    <div className={`collapsible-block${open ? " is-open" : ""}`}>
      <button
        id={triggerId}
        type="button"
        className="collapsible-trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className="collapsible-chevron" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
        <span className="collapsible-titles">
          <span className="collapsible-title">{title}</span>
          {subtitle && <span className="collapsible-subtitle">{subtitle}</span>}
        </span>
      </button>
      {open && (
        <div id={bodyId} className="collapsible-body">
          {children}
        </div>
      )}
    </div>
  );
}