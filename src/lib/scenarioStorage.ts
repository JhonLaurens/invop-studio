import type { QueueParams } from "./queues";
import type { TransportInput } from "./transport";

const VERSION = 1;
const KEY_TRANSPORT = "estudio-io-transport-v1";
const KEY_QUEUE = "estudio-io-queue-v1";
const KEY_CW = "estudio-io-cwmin-v1";

type TransportSnap = { v: number; data: TransportInput };
type QueueSnap = { v: number; p: Omit<QueueParams, "cwPerHour">; cwMin: number };

export function loadTransportScenario(): TransportInput | null {
  try {
    const raw = localStorage.getItem(KEY_TRANSPORT);
    if (!raw) return null;
    const snap = JSON.parse(raw) as TransportSnap;
    if (snap.v !== VERSION || !snap.data?.costs?.length) return null;
    return snap.data;
  } catch {
    return null;
  }
}

export function saveTransportScenario(data: TransportInput) {
  try {
    const snap: TransportSnap = { v: VERSION, data };
    localStorage.setItem(KEY_TRANSPORT, JSON.stringify(snap));
  } catch {
    /* quota / modo privado */
  }
}

export function loadQueueScenario(): { p: QueueParams; cwMin: number } | null {
  try {
    const raw = localStorage.getItem(KEY_QUEUE);
    const cwRaw = localStorage.getItem(KEY_CW);
    if (!raw) return null;
    const snap = JSON.parse(raw) as QueueSnap;
    if (snap.v !== VERSION) return null;
    const cwMin = cwRaw ? Number(cwRaw) : snap.cwMin;
    return {
      p: { ...snap.p, cwPerHour: (Number.isFinite(cwMin) ? cwMin : 5) * 60 },
      cwMin: Number.isFinite(cwMin) ? cwMin : 5,
    };
  } catch {
    return null;
  }
}

export function saveQueueScenario(p: QueueParams, cwMin: number) {
  try {
    const { cwPerHour: _drop, ...rest } = p;
    const snap: QueueSnap = { v: VERSION, p: rest, cwMin };
    localStorage.setItem(KEY_QUEUE, JSON.stringify(snap));
    localStorage.setItem(KEY_CW, String(cwMin));
  } catch {
    /* ignorar */
  }
}