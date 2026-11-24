import { useTheme } from "../context/ThemeContext";

const labels = { light: "Claro", dark: "Oscuro", system: "Sistema" } as const;

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  return (
    <button type="button" className="theme-toggle" onClick={cycle} aria-label={`Tema: ${labels[theme]}`} title={`Tema: ${labels[theme]}`}>
      <span className="theme-toggle-icon" aria-hidden>
        {theme === "dark" ? "◑" : theme === "system" ? "◎" : "◐"}
      </span>
      <span className="theme-toggle-label">{labels[theme]}</span>
    </button>
  );
}