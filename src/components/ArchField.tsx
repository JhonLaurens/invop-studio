import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: ReactNode;
  hint?: string;
  children: ReactNode;
};

export function ArchField({ icon, label, hint, children }: Props) {
  return (
    <div className="arch-field">
      <div className="arch-field-head">
        <span className="arch-field-icon" aria-hidden>
          {icon}
        </span>
        <span className="arch-field-label">{label}</span>
      </div>
      <div className="arch-field-control">{children}</div>
      {hint && <span className="arch-field-hint">{hint}</span>}
    </div>
  );
}