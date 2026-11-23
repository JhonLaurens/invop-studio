import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/transporte", label: "Transporte" },
  { to: "/colas", label: "Teoría de colas" },
];

export function Layout() {
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          {logoUnavailable ? (
            <span className="institution-fallback">ITM</span>
          ) : (
            <img className="institution-logo" src={`${import.meta.env.BASE_URL}logo-itm.png`} alt="Institución Universitaria ITM" onError={() => setLogoUnavailable(true)} />
          )}
          <div>
            <strong>Estudio IO</strong>
            <span>Investigación de Operaciones · Proyecto académico</span>
          </div>
        </div>
        <nav className="nav" aria-label="Módulos">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        Juan Pablo Correa · Jhon Dayron Jaramillo Laurens · Alexsander Gonzalez Farrayans
      </footer>
    </div>
  );
}
