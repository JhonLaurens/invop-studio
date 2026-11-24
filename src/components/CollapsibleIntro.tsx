import { useId, useState, type ReactNode } from "react";
import { usePreferences } from "../context/PreferencesContext";

const STORAGE_KEY = "estudio-io-intro-collapsed";

type Props = { storageKey?: string; children: ReactNode };

export function CollapsibleIntro({ storageKey = STORAGE_KEY, children }: Props) {
  const { prefs } = usePreferences();
  const bodyId = useId();
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== "1";
    } catch {
      return true;
    }
  });

  if (!prefs.showModuleIntro) return null;

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem(storageKey, next ? "0" : "1");
      } catch {
        /* ignorar */
      }
      return next;
    });
  };

  return (
    <section className={`card intro-collapsible${open ? " open" : ""}`}>
      <button
        type="button"
        className="intro-collapsible-trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span>{open ? "Ocultar guía" : "Mostrar guía · ¿Qué resuelve este módulo?"}</span>
        <span aria-hidden>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div id={bodyId} className="intro-collapsible-body">
          {children}
        </div>
      )}
    </section>
  );
}