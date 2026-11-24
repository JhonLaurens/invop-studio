import type { TransportInput } from "./transport";
import { BASE_TRANSPORT } from "./transport";
import type { QueueParams } from "./queues";
import { BASE_QUEUE } from "./queues";

export type SavedScenario<T> = { id: string; name: string; data: T; at: number };

const BOOK_TRANSPORT = "estudio-io-book-transport";
const BOOK_QUEUE = "estudio-io-book-queue";

function loadBook<T>(key: string): SavedScenario<T>[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedScenario<T>[]) : [];
  } catch {
    return [];
  }
}

function saveBook<T>(key: string, list: SavedScenario<T>[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const TRANSPORT_EXAMPLES: { name: string; data: TransportInput }[] = [
  { name: "Base vacunas 3×4", data: BASE_TRANSPORT },
  {
    name: "Desbalance por oferta",
    data: {
      ...BASE_TRANSPORT,
      supply: [1200, 1400, 900],
      demand: [...BASE_TRANSPORT.demand],
    },
  },
  {
    name: "Desbalance por demanda",
    data: {
      ...BASE_TRANSPORT,
      demand: [900, 900, 900, 900],
    },
  },
];

export const QUEUE_EXAMPLES: { name: string; p: QueueParams; cwMin: number }[] = [
  { name: "API de imágenes λ=15", p: BASE_QUEUE, cwMin: 5 },
  { name: "Campaña λ=20", p: { ...BASE_QUEUE, lambda: 20, sMax: 6 }, cwMin: 5 },
  { name: "Servidor potente μ=30", p: { ...BASE_QUEUE, mu: 30, cs: 110, sMin: 1, sMax: 3 }, cwMin: 5 },
];

export function listTransportScenarios() {
  return loadBook<TransportInput>(BOOK_TRANSPORT);
}

export function saveTransportNamed(name: string, data: TransportInput) {
  const list = listTransportScenarios();
  list.push({ id: crypto.randomUUID(), name, data, at: Date.now() });
  saveBook(BOOK_TRANSPORT, list);
}

export function listQueueScenarios() {
  return loadBook<{ p: QueueParams; cwMin: number }>(BOOK_QUEUE);
}

export function saveQueueNamed(name: string, p: QueueParams, cwMin: number) {
  const list = listQueueScenarios();
  list.push({ id: crypto.randomUUID(), name, data: { p, cwMin }, at: Date.now() });
  saveBook(BOOK_QUEUE, list);
}

export function renameTransportScenario(id: string, name: string) {
  saveBook(BOOK_TRANSPORT, listTransportScenarios().map((item) => (item.id === id ? { ...item, name } : item)));
}

export function deleteTransportScenario(id: string) {
  saveBook(BOOK_TRANSPORT, listTransportScenarios().filter((item) => item.id !== id));
}

export function renameQueueScenario(id: string, name: string) {
  saveBook(BOOK_QUEUE, listQueueScenarios().map((item) => (item.id === id ? { ...item, name } : item)));
}

export function deleteQueueScenario(id: string) {
  saveBook(BOOK_QUEUE, listQueueScenarios().filter((item) => item.id !== id));
}