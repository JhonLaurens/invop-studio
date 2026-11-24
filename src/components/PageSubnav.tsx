import { useEffect, useRef, useState } from "react";

type Item = { id: string; label: string };

function syncLayoutOffsets() {
  const header = document.querySelector(".topbar")?.getBoundingClientRect().height ?? 72;
  const subnav = document.querySelector(".page-subnav")?.getBoundingClientRect().height ?? 48;
  document.documentElement.style.setProperty("--header-h", `${Math.round(header)}px`);
  document.documentElement.style.setProperty("--subnav-h", `${Math.round(subnav)}px`);
  return header + subnav + 8;
}

function pickActiveSection(ids: string[], offset: number): string {
  const sections = ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el != null);
  if (!sections.length) return ids[0] ?? "";
  let active = sections[0].id;
  for (const s of sections) {
    const top = s.getBoundingClientRect().top;
    if (top <= offset + 4) active = s.id;
  }
  return active;
}

export function PageSubnav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [fade, setFade] = useState({ left: false, right: false });
  const navRef = useRef<HTMLElement>(null);
  const topOffsetRef = useRef(84);

  useEffect(() => {
    const ids = items.map((i) => i.id);
    const update = () => {
      topOffsetRef.current = syncLayoutOffsets();
      setActive(pickActiveSection(ids, topOffsetRef.current));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    const topbar = document.querySelector(".topbar");
    if (topbar) ro.observe(topbar);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [items]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const measure = () => {
      setFade({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [items]);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      ref={navRef}
      className={`page-subnav${fade.left ? " fade-left" : ""}${fade.right ? " fade-right" : ""}`}
      aria-label="Secciones de la página"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`page-subnav-link${active === item.id ? " active" : ""}`}
          onClick={() => jump(item.id)}
          aria-current={active === item.id ? "true" : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}