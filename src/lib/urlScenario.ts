export function encodeScenario(data: unknown): string {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeScenario<T>(encoded: string): T | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function readHashParams(): Record<string, string> {
  const hash = window.location.hash;
  const q = hash.indexOf("?");
  if (q < 0) return {};
  const params = new URLSearchParams(hash.slice(q + 1));
  const out: Record<string, string> = {};
  params.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

export function setHashScenario(module: "transporte" | "colas", encoded: string) {
  const base = `#/${module}`;
  window.location.hash = `${base}?d=${encodeURIComponent(encoded)}`;
}