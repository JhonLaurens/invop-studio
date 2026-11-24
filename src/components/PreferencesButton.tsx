import { useEffect, useId, useRef, useState } from "react";
import { usePreferences, type Currency, type Density } from "../context/PreferencesContext";

export function PreferencesButton() {
  const { prefs, setPref } = usePreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const controls = rootRef.current?.querySelectorAll<HTMLElement>("[role='dialog'] select, [role='dialog'] input, [role='dialog'] button");
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      rootRef.current?.querySelector<HTMLElement>("[role='dialog'] select, [role='dialog'] input")?.focus();
      return;
    }
    if (wasOpen.current) triggerRef.current?.focus();
  }, [open]);

  return (
    <div className="prefs-popover" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="theme-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label="Preferencias de vista"
      >
        ⚙
      </button>
      {open && (
        <div id={panelId} className="prefs-panel card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <p id={titleId} className="prefs-dialog-title">
            Preferencias
          </p>
          <label>
            Ancho
            <select value={prefs.layoutWidth} onChange={(e) => setPref("layoutWidth", e.target.value as "normal" | "wide")}>
              <option value="normal">Normal</option>
              <option value="wide">Completo</option>
            </select>
          </label>
          <label>
            Vista orígenes
            <select value={prefs.originView} onChange={(e) => setPref("originView", e.target.value as "cards" | "table")}>
              <option value="table">Tabla compacta</option>
              <option value="cards">Tarjetas</option>
            </select>
          </label>
          <label>
            Densidad
            <select value={prefs.density} onChange={(e) => setPref("density", e.target.value as Density)}>
              <option value="comfy">Cómoda</option>
              <option value="compact">Compacta</option>
            </select>
          </label>
          <label>
            Moneda
            <select value={prefs.currency} onChange={(e) => setPref("currency", e.target.value as Currency)}>
              <option value="USD">USD</option>
              <option value="COP">COP</option>
            </select>
          </label>
          <label>
            Unidad de tiempo (Colas)
            <select value={prefs.queueTimeUnit} onChange={(e) => setPref("queueTimeUnit", e.target.value as "s" | "min" | "h")}>
              <option value="s">Segundos</option>
              <option value="min">Minutos</option>
              <option value="h">Horas</option>
            </select>
          </label>
          <label>
            Decimales
            <input
              type="number"
              min={0}
              max={4}
              value={prefs.decimals}
              onChange={(e) => setPref("decimals", Math.min(4, Math.max(0, +e.target.value)))}
            />
          </label>
          <label className="prefs-check">
            <input type="checkbox" checked={prefs.showAnimations} onChange={(e) => setPref("showAnimations", e.target.checked)} />
            <span>Animaciones</span>
          </label>
          <label className="prefs-check">
            <input type="checkbox" checked={prefs.showModuleIntro} onChange={(e) => setPref("showModuleIntro", e.target.checked)} />
            <span>Mostrar guía en módulos</span>
          </label>
        </div>
      )}
    </div>
  );
}
