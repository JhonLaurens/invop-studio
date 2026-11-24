const PREFS_KEY = "estudio-io-prefs-v1";

export type MoneyCurrency = "USD" | "COP";

type LiveFormat = { currency: MoneyCurrency; decimals: number };

function readStoredFormat(): LiveFormat {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { currency: "USD", decimals: 2 };
    const parsed = JSON.parse(raw) as { currency?: string; decimals?: number };
    const decimals = Number(parsed.decimals);
    return {
      currency: parsed.currency === "COP" ? "COP" : "USD",
      decimals: Number.isFinite(decimals) ? Math.min(4, Math.max(0, decimals)) : 2,
    };
  } catch {
    return { currency: "USD", decimals: 2 };
  }
}

let liveFormat = readStoredFormat();

/** El contexto actualiza esto durante su render, antes de que los importes se pinten. */
export function syncFormatPrefs(next: LiveFormat) {
  const decimals = Number(next.decimals);
  liveFormat = {
    currency: next.currency === "COP" ? "COP" : "USD",
    decimals: Number.isFinite(decimals) ? Math.min(4, Math.max(0, decimals)) : 2,
  };
}

export const fmtMoney = (n: number) => {
  const currency = liveFormat.currency;
  const digits = currency === "COP" ? 0 : 2;
  const amount = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
  return `${currency} ${amount}`;
};

export function fmtScientific(n: number): string {
  const [mantissa, exponent] = n.toExponential(3).split("e");
  const superscript: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const power = String(Number(exponent)).split("").map((digit) => superscript[digit]).join("");
  return `${mantissa.replace(".", ",")} × 10${power}`;
}

export const fmtNum = (n: number, d = liveFormat.decimals) => {
  if (Number.isFinite(n) && n !== 0 && Math.abs(n) < 0.5 * 10 ** -d) return fmtScientific(n);
  return n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
};

export const fmtPct = (n: number) => `${fmtNum(n * 100, 2)} %`;

export const fmtSignedPct = (n: number) =>
  `${n > 0 ? "+" : ""}${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)} %`;
