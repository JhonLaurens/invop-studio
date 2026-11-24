import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Example = { name: string; onSelect: () => void };
export type SavedScenarioAction = {
  id: string;
  name: string;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
};

type Props = {
  onReset: () => void;
  examples: Example[];
  saved?: SavedScenarioAction[];
  onSave?: () => void;
  onExportCsv?: () => void;
  onExportJson?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  extra?: ReactNode;
};

export function ModuleActionBar({
  onReset,
  examples,
  saved = [],
  onSave,
  onExportCsv,
  onExportJson,
  onShare,
  onPrint,
  extra,
}: Props) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const examplesMenuId = useId();
  const moreMenuId = useId();

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const secondary = [
    onExportCsv ? { label: "Exportar CSV", run: onExportCsv } : null,
    onExportJson ? { label: "JSON", run: onExportJson } : null,
    onShare ? { label: "Copiar enlace", run: onShare } : null,
    onPrint ? { label: "Imprimir", run: onPrint } : null,
  ].filter(Boolean) as { label: string; run: () => void }[];

  return (
    <div className="module-action-bar">
      {extra && <div className="module-action-extra">{extra}</div>}
      <button type="button" className="btn ghost sm action-primary" onClick={onReset}>
        Restablecer
      </button>
      <div className="action-examples-desktop"><ExamplesDropdown open={open} setOpen={setOpen} examples={examples} saved={saved} menuId={examplesMenuId} /></div>
      {onSave && (
        <button type="button" className="btn ghost sm action-primary action-save" onClick={onSave}>
          <span className="action-examples-long">Guardar escenario</span>
          <span className="action-examples-short">Guardar</span>
        </button>
      )}
      {secondary.length > 0 && (
        <div className="action-more-wrap" ref={moreRef}>
          <button
            type="button"
            className="btn ghost sm action-more"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-controls={moreMenuId}
          >
            ⋯ Más
          </button>
          {moreOpen && (
            <ul id={moreMenuId} className="action-dropdown-menu action-more-menu">
              {examples.map((ex) => (
                <li key={`example-${ex.name}`} className="action-example-mobile">
                  <button type="button" onClick={() => { ex.onSelect(); setMoreOpen(false); }}>
                    Ejemplo: {ex.name}
                  </button>
                </li>
              ))}
              {saved.map((item) => (
                <li key={`saved-mobile-${item.id}`} className="action-example-mobile">
                  <button type="button" onClick={() => { item.onSelect(); setMoreOpen(false); }}>
                    Escenario: {item.name}
                  </button>
                </li>
              ))}
              {secondary.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => {
                      item.run();
                      setMoreOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="action-bar-desktop">
        {onExportCsv && (
          <button type="button" className="btn ghost sm" onClick={onExportCsv}>
            Exportar CSV
          </button>
        )}
        {onExportJson && (
          <button type="button" className="btn ghost sm" onClick={onExportJson}>
            JSON
          </button>
        )}
        {onShare && (
          <button type="button" className="btn ghost sm" onClick={onShare}>
            Copiar enlace
          </button>
        )}
        {onPrint && (
          <button type="button" className="btn ghost sm" onClick={onPrint}>
            Imprimir
          </button>
        )}
      </div>
    </div>
  );
}

function ScenarioList({
  items,
  onDone,
}: {
  items: SavedScenarioAction[];
  onDone: () => void;
}) {
  if (!items.length) return null;
  return (
    <>
      <li className="menu-separator" role="separator">Mis escenarios</li>
      {items.map((item) => (
        <li key={item.id} className="saved-scenario">
          <button type="button" onClick={() => { item.onSelect(); onDone(); }}>
            {item.name}
          </button>
          <button type="button" aria-label={`Renombrar ${item.name}`} onClick={() => { item.onRename(); onDone(); }}>
            Renombrar
          </button>
          <button type="button" aria-label={`Eliminar ${item.name}`} onClick={() => { item.onDelete(); onDone(); }}>
            Eliminar
          </button>
        </li>
      ))}
    </>
  );
}

function ExamplesDropdown({
  open,
  setOpen,
  examples,
  saved,
  menuId,
}: {
  open: boolean;
  setOpen: (fn: (v: boolean) => boolean) => void;
  examples: Example[];
  saved: SavedScenarioAction[];
  menuId: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(() => false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(() => false);
    };
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div className="action-dropdown" ref={rootRef}>
      <button
        type="button"
        className="btn ghost sm action-examples"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className="action-examples-long">Cargar ejemplo ▾</span>
        <span className="action-examples-short">Ejemplos ▾</span>
      </button>
      {open && (
        <ul id={menuId} className="action-dropdown-menu">
          {examples.map((ex) => (
            <li key={ex.name}>
              <button
                type="button"
                onClick={() => {
                  ex.onSelect();
                  setOpen(() => false);
                }}
              >
                {ex.name}
              </button>
            </li>
          ))}
          <ScenarioList items={saved} onDone={() => setOpen(() => false)} />
        </ul>
      )}
    </div>
  );
}
