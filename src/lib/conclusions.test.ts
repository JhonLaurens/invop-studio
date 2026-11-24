import { describe, expect, it } from "vitest";
import { queueConclusions, transportConclusions } from "./conclusions";
import { BASE_QUEUE, scanConfigs } from "./queues";
import { BASE_TRANSPORT, balance, minimumCost, modi, northwest, vogel } from "./transport";

describe("conclusiones del ejemplo base", () => {
  it("deja el sobrante de vacunas en C y no lo trata como el almacén más barato", () => {
    const bal = balance(BASE_TRANSPORT);
    const no = northwest(bal);
    const cm = minimumCost(bal);
    const vo = vogel(bal);
    const opt = modi(bal.costs, vo.allocation);
    const text = transportConclusions(bal, no, cm, vo, opt).join(" ");

    expect(opt.certified).toBe(true);
    expect(opt.totalCost).toBe(8750);
    expect(text).toContain("Centro de Acopio C");
    expect(text).toContain("no es el almacén más barato");
    expect(text).toContain("Laboratorio B");
  });

  it("marca M/M/1 inestable y recomienda M/M/4 con las metas", () => {
    const text = queueConclusions(scanConfigs(BASE_QUEUE), true).join(" ");
    expect(text).toContain("M/M/1 es inestable");
    expect(text).toContain("M/M/4");
    expect(text).toContain("cumple las metas");
    expect(text).toContain("no solo la cola Lq");
    expect(text).toContain("Comparativo de s = 1 a s = 5");
  });

  it("nombra el rango real y un único servidor cuando no hay comparación", () => {
    const only = scanConfigs({ ...BASE_QUEUE, sMin: 1, sMax: 1 });
    expect(queueConclusions(only, true).join(" ")).toContain("Solo se evalúa s = 1");

    const powerful = scanConfigs({ ...BASE_QUEUE, mu: 30, cs: 110, sMin: 1, sMax: 3 });
    const text = queueConclusions(powerful, true).join(" ");
    expect(text).toContain("Comparativo de s = 1 a s = 3");
    expect(text).toContain("La opción más barata del rango es M/M/2");
  });
});
