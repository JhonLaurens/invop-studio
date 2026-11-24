import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}

export function InfoTip({ label, children, side = "top" }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const wasOpen = useRef(false);
  const id = useId();
  const name = typeof label === "string" && label !== "?" ? label : "este concepto";

  const show = () => {
    window.clearTimeout(timer.current);
    window.dispatchEvent(new CustomEvent("estudio-io-help", { detail: id }));
    setOpen(true);
  };
  const closeLater = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => {
    const onOtherTip = (event: Event) => { if ((event as CustomEvent<string>).detail !== id) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const onPointer = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("estudio-io-help", onOtherTip);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("estudio-io-help", onOtherTip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [id]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      if (!anchor || !panel) return;
      const gap = 8;
      const left = Math.max(gap, Math.min(anchor.left + anchor.width / 2 - panel.width / 2, window.innerWidth - panel.width - gap));
      const above = anchor.top - panel.height - gap;
      const below = anchor.bottom + gap;
      const top = side === "bottom" && below + panel.height <= window.innerHeight - gap ? below :
        above >= gap ? above : Math.min(below, window.innerHeight - panel.height - gap);
      setPosition({ left, top: Math.max(gap, top) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, side]);

  return (
    <span className="info-tip">
      {label !== "?" && <span className="info-tip-label">{label}</span>}
      <button ref={triggerRef} type="button" className="info-tip-trigger" aria-label={`Información sobre ${name}`}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(event) => { if (event.pointerType !== "touch") show(); }}
        onPointerLeave={(event) => { if (event.pointerType !== "touch") closeLater(); }}
        onFocus={show} onBlur={closeLater}
        onPointerDown={() => { wasOpen.current = open; }}
        onClick={() => { if (wasOpen.current) setOpen(false); else show(); }}>
        <span aria-hidden="true">i</span>
      </button>
      {open && createPortal(
        <span id={id} ref={panelRef} role="tooltip" className="info-tip-panel info-tip-portal"
          style={{ left: position.left, top: position.top }} onPointerEnter={() => window.clearTimeout(timer.current)}
          onPointerLeave={closeLater}>{children}</span>, document.body,
      )}
    </span>
  );
}
