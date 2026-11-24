import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { PreferencesButton } from "./PreferencesButton";
import { ReferencesButton } from "./ReferencesButton";
import { StatusToast } from "./StatusToast";

const TITLES: Record<string, string> = {
  "/": "Inicio · Estudio IO",
  "/transporte": "Transporte · Estudio IO",
  "/colas": "Teoría de colas · Estudio IO",
};

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/transporte", label: "Transporte" },
  { to: "/colas", label: "Teoría de colas" },
];

const team = [
  { name: "Juan Pablo Correa", initials: "JC" },
  { name: "Jhon Dayron Jaramillo Laurens", initials: "JJ" },
  { name: "Alexsander Gonzalez", initials: "AG" },
];

export function Layout() {
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "";
  const firstView = useRef(true);

  useEffect(() => {
    document.title = TITLES[pathname] ?? "Página no encontrada · Estudio IO";
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const focusHeading = () => {
      const heading = document.querySelector("main h1");
      if (!(heading instanceof HTMLElement)) return false;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      return true;
    };
    if (focusHeading()) return;
    const timer = window.setTimeout(focusHeading, 400);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const skipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById("contenido");
    if (!(main instanceof HTMLElement)) return;
    main.focus();
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido" onClick={skipToContent}>Saltar al contenido</a>
      <header className="topbar">
        <div className="topbar-row topbar-row-brand">
          <div className="brand">
            {logoUnavailable ? (
              <span className="institution-fallback">ITM</span>
            ) : (
              <img
                className="institution-logo"
                src={`${import.meta.env.BASE_URL}logo-itm.png`}
                alt="Institución Universitaria ITM"
                width={88}
                height={58}
                decoding="async"
                onError={() => setLogoUnavailable(true)}
              />
            )}
            <div>
              <strong>Estudio IO</strong>
              <span className="brand-sub">Investigación de Operaciones · Proyecto académico</span>
            </div>
          </div>
          <div className="topbar-row-tools">
            <ReferencesButton />
            <PreferencesButton />
            <ThemeToggle />
          </div>
        </div>
        <nav className="nav topbar-nav" aria-label="Módulos">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="contenido" className="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={`footer${isHome ? "" : " footer-compact"}`}>
        {isHome && (
          <div className="footer-team">
            {team.map((m) => (
              <span key={m.initials} className="team-chip">
                <span className="team-avatar" aria-hidden>
                  {m.initials}
                </span>
                {m.name}
              </span>
            ))}
          </div>
        )}
        <p>{isHome ? "ITM · Investigación de Operaciones 2026-2" : "ITM · Investigación de Operaciones 2026-2"}</p>
      </footer>
      <StatusToast />
    </div>
  );
}
