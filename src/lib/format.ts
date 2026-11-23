export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(n)
  .replace("US$", "$");

export const fmtNum = (n: number, d = 4) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmtPct = (n: number) => `${fmtNum(n * 100, 2)} %`;