import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { REFERENCES, type ReferenceTopic } from "../data/references";

const TOPICS: ReferenceTopic[] = ["Transporte", "Colas", "Ambas"];

export function ReferencesButton() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus();
      return;
    }
    wasOpen.current = true;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>("a, button");
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
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="theme-toggle refs-trigger"
        aria-label="Referencias bibliográficas"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="refs-icon" aria-hidden>📚</span>
        <span className="refs-label">Referencias</span>
      </button>
      {open &&
        createPortal(
          <div className="refs-backdrop" onMouseDown={() => setOpen(false)}>
            <div
              ref={dialogRef}
              className="refs-dialog card"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="refs-dialog-head">
                <h2 id={titleId}>Referencias bibliográficas</h2>
                <button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
              </div>
              <p className="chart-caption">
                Fuentes usadas para las fórmulas y los algoritmos. Cada enlace abre la ficha editorial o el material abierto del curso citado.
              </p>
              {TOPICS.map((topic) => (
                <section key={topic} className="refs-group">
                  <h3>{topic}</h3>
                  <ul>
                    {REFERENCES.filter((item) => item.topic === topic).map((item) => (
                      <li key={item.id}>
                        <p>{item.citation}</p>
                        <p className="chart-caption">{item.usedFor}</p>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${item.linkLabel}, se abre en una pestaña nueva`}
                        >
                          {item.linkLabel} <span aria-hidden>↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
