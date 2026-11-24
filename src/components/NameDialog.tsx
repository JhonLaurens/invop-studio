import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  initial?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
};

export function NameDialog({ open, title, initial = "", confirmLabel = "Guardar", onCancel, onConfirm }: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>("input, button");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return createPortal(
    <div className="refs-backdrop" onMouseDown={onCancel}>
      <form
        ref={dialogRef}
        className="refs-dialog card name-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          const name = inputRef.current?.value.trim() ?? "";
          if (name) onConfirm(name);
        }}
      >
        <h2 id={titleId}>{title}</h2>
        <label>
          Nombre
          <input ref={inputRef} defaultValue={initial} required maxLength={80} />
        </label>
        <div className="name-dialog-actions">
          <button type="button" className="btn ghost sm" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn primary sm">
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
