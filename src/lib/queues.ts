export interface QueueParams {
  lambda: number;
  mu: number;
  cs: number;
  cwPerHour: number;
  sMin: number;
  sMax: number;
  wMaxSec?: number;
  pwMax?: number;
}

export interface QueueConfig {
  s: number;
  stable: boolean;
  rho: number;
  p0: number;
  pw: number;
  lq: number;
  l: number;
  wqMin: number;
  wMin: number;
  wSec: number;
  serviceCost: number;
  waitCost: number;
  totalCost: number;
  slaW: boolean;
  slaPw: boolean;
  slaOk: boolean;
  pn: number[];
}

function factorial(n: number) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

export function evaluateMMs(
  lambda: number,
  mu: number,
  s: number,
  cs: number,
  cwPerHour: number,
  wMaxSec?: number,
  pwMax?: number,
): QueueConfig {
  const r = lambda / mu;
  const rho = lambda / (s * mu);

  if (rho >= 1) {
    return {
      s,
      stable: false,
      rho,
      p0: NaN,
      pw: NaN,
      lq: NaN,
      l: NaN,
      wqMin: NaN,
      wMin: NaN,
      wSec: NaN,
      serviceCost: cs * s,
      waitCost: NaN,
      totalCost: NaN,
      slaW: false,
      slaPw: false,
      slaOk: false,
      pn: [],
    };
  }

  let sum = 0;
  for (let n = 0; n < s; n++) sum += Math.pow(r, n) / factorial(n);
  const last = (Math.pow(r, s) / factorial(s)) * (1 / (1 - rho));
  const p0 = 1 / (sum + last);

  const lq = (p0 * Math.pow(r, s) * rho) / (factorial(s) * Math.pow(1 - rho, 2));
  const l = lq + r;
  const wqMin = lq / lambda;
  const wMin = wqMin + 1 / mu;
  const wSec = wMin * 60;
  const pw = ((Math.pow(r, s) / factorial(s)) * (1 / (1 - rho))) * p0;

  const serviceCost = cs * s;
  const waitCost = cwPerHour * l;
  const totalCost = serviceCost + waitCost;

  const slaW = wMaxSec === undefined ? true : wSec <= wMaxSec + 1e-9;
  const slaPw = pwMax === undefined ? true : pw <= pwMax / 100 + 1e-9;
  const slaOk = slaW && slaPw;

  const pn: number[] = [];
  for (let n = 0; n <= 6; n++) {
    if (n <= s) pn.push(p0 * (Math.pow(r, n) / factorial(n)));
    else pn.push(p0 * (Math.pow(r, n) / (factorial(s) * Math.pow(s, n - s))));
  }

  return {
    s,
    stable: true,
    rho,
    p0,
    pw,
    lq,
    l,
    wqMin,
    wMin,
    wSec,
    serviceCost,
    waitCost,
    totalCost,
    slaW,
    slaPw,
    slaOk,
    pn,
  };
}

export function scanConfigs(p: QueueParams): QueueConfig[] {
  const configs: QueueConfig[] = [];
  for (let s = p.sMin; s <= p.sMax; s++) {
    configs.push(
      evaluateMMs(p.lambda, p.mu, s, p.cs, p.cwPerHour, p.wMaxSec, p.pwMax),
    );
  }
  return configs;
}

export function bestCost(configs: QueueConfig[]) {
  const stable = configs.filter((c) => c.stable && Number.isFinite(c.totalCost));
  if (!stable.length) return null;
  return stable.reduce((a, b) => (a.totalCost < b.totalCost ? a : b));
}

/** Probabilidades consecutivas hasta cubrir el objetivo o alcanzar el límite visual. */
export function queueDistribution(config: QueueConfig, lambda: number, mu: number, maxStates = 60): number[] {
  if (!config.stable || !Number.isFinite(config.p0) || lambda <= 0 || mu <= 0) return [];
  const probabilities = [config.p0];
  let sum = config.p0;
  for (let n = 1; n < maxStates && sum < 0.99; n++) {
    const next = probabilities[n - 1] * (lambda / mu) / Math.min(n, config.s);
    probabilities.push(next);
    sum += next;
  }
  return probabilities;
}

export const BASE_QUEUE: QueueParams = {
  lambda: 15,
  mu: 10,
  cs: 40,
  cwPerHour: 300,
  sMin: 1,
  sMax: 5,
  wMaxSec: 7,
  pwMax: 10,
};
