import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { syncFormatPrefs } from "../lib/format";

export type LayoutWidth = "normal" | "wide";
export type OriginView = "cards" | "table";
export type Density = "comfy" | "compact";
export type Currency = "USD" | "COP";
export type TimeUnit = "s" | "min" | "h";

type Prefs = {
  layoutWidth: LayoutWidth;
  originView: OriginView;
  decimals: number;
  showAnimations: boolean;
  density: Density;
  currency: Currency;
  showModuleIntro: boolean;
  queueTimeUnit: TimeUnit;
};

const KEY = "estudio-io-prefs-v1";

const defaults: Prefs = {
  layoutWidth: "normal",
  originView: "table",
  decimals: 2,
  showAnimations: true,
  density: "comfy",
  currency: "USD",
  showModuleIntro: true,
  queueTimeUnit: "min",
};

const PreferencesContext = createContext<{
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return defaults;
    }
  });

  syncFormatPrefs({ currency: prefs.currency, decimals: prefs.decimals });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-layout", prefs.layoutWidth);
    document.documentElement.setAttribute("data-density", prefs.density);
    document.documentElement.setAttribute("data-currency", prefs.currency);
    if (!prefs.showAnimations) document.documentElement.setAttribute("data-reduce-animations", "1");
    else document.documentElement.removeAttribute("data-reduce-animations");
  }, [prefs]);

  return (
    <PreferencesContext.Provider
      value={{
        prefs,
        setPref: (k, v) => setPrefs((p) => ({ ...p, [k]: v })),
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences");
  return ctx;
}