import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = ["/#/", "/#/transporte", "/#/colas"];
const widths = [1920, 1440, 1280, 1024, 768, 414, 390, 375, 360, 320];

async function prepare(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => {
    localStorage.setItem("estudio-io-theme", value);
    localStorage.setItem(
      "estudio-io-prefs-v1",
      JSON.stringify({
        layoutWidth: "normal",
        originView: "table",
        decimals: 2,
        showAnimations: false,
        density: "comfy",
        currency: "USD",
        showModuleIntro: false,
        queueTimeUnit: "min",
      }),
    );
  }, theme);
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe("auditoría UX", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const route of routes) {
      test(`axe limpio en ${route} (${theme})`, async ({ page }) => {
        await prepare(page, theme);
        await page.setViewportSize({ width: 1366, height: 900 });
        await page.goto(route);
        await page.locator("main h1").waitFor();
        const result = await new AxeBuilder({ page }).analyze();
        expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
      });
    }

    test(`referencias sin violaciones de axe (${theme})`, async ({ page }) => {
      await prepare(page, theme);
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto("/#/");
      await page.getByRole("button", { name: "Referencias bibliográficas" }).click();
      await expect(page.getByRole("dialog", { name: "Referencias bibliográficas" })).toBeVisible();
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
    });

    for (const width of widths) {
      for (const route of routes) {
        test(`sin desborde a ${width}px en ${route} (${theme})`, async ({ page }) => {
          await prepare(page, theme);
          await page.setViewportSize({ width, height: 800 });
          await page.goto(route);
          await page.locator("main h1").waitFor();
          expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

          if (width === 320) {
            const themeButton = page.getByRole("button", { name: /^Tema:/ });
            const box = await themeButton.boundingBox();
            expect(box).not.toBeNull();
            expect(box!.x).toBeGreaterThanOrEqual(0);
            expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
          }

          if (width === 768 && route === "/#/transporte") {
            await page.getByRole("button", { name: "Métodos", exact: true }).click();
            const tooSmall = await page.evaluate(() => {
              const wrap = document.querySelector(".method-flow-visual .flow-svg-wrap");
              if (!wrap || getComputedStyle(wrap).display === "none") return 0;
              return [...wrap.querySelectorAll("text")].filter((node) => {
                const size = Number.parseFloat(getComputedStyle(node).fontSize);
                return size > 0 && size < 9;
              }).length;
            });
            expect(tooSmall).toBe(0);
          }
        });
      }
    }
  }

  test("la × de un origen queda dentro de su celda", async ({ page }) => {
    await prepare(page, "light");
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/#/transporte");
    const button = page.getByRole("button", { name: /Eliminar origen/ }).first();
    const cell = page.locator("th.origin-head").first();
    await expect(button).toBeVisible();
    const buttonBox = await button.boundingBox();
    const cellBox = await cell.boundingBox();
    expect(buttonBox && cellBox).toBeTruthy();
    expect(buttonBox!.x).toBeGreaterThanOrEqual(cellBox!.x - 1);
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(cellBox!.x + cellBox!.width + 1);
  });

  test("guardar un escenario, recargar y volver a abrirlo", async ({ page }) => {
    await prepare(page, "light");
    await page.goto("/#/transporte");
    await page.evaluate(() => localStorage.removeItem("estudio-io-book-transport"));
    await page.reload();
    const origin = page.getByRole("textbox", { name: "Nombre origen 1" });
    await origin.fill("Centro X");
    await page.getByRole("button", { name: "Guardar escenario" }).click();
    const dialog = page.getByRole("dialog", { name: "Guardar escenario" });
    await dialog.getByRole("textbox", { name: "Nombre" }).fill("X");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("status")).toContainText("Escenario X guardado");
    await page.getByRole("button", { name: "Restablecer" }).click();
    await page.reload();
    await page.getByRole("button", { name: "Cargar ejemplo" }).click();
    await page.locator(".saved-scenario").getByRole("button", { name: "X", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Escenario X cargado");
    await expect(page.getByRole("textbox", { name: "Nombre origen 1" })).toHaveValue("Centro X");
  });

  test("saltar al contenido no cambia la ruta", async ({ page }) => {
    await prepare(page, "light");
    await page.goto("/#/transporte");
    await page.keyboard.press("Tab");
    await page.getByRole("link", { name: "Saltar al contenido" }).press("Enter");
    await expect(page).toHaveURL(/#\/transporte$/);
    await expect(page.locator("#contenido")).toBeFocused();
    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toHaveCount(0);
  });

  test("reproducir el paso a paso no deja el error de React", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await prepare(page, "light");
    await page.goto("/#/transporte");
    await page.getByRole("button", { name: "Métodos", exact: true }).click();
    await page.getByRole("button", { name: "Expandir todo" }).click();
    await page.getByRole("button", { name: "Contraer todo" }).click();
    const northwest = page.getByRole("button", { name: /^Esquina Noroeste/ });
    await northwest.click();
    await northwest.click();
    await page.getByRole("button", { name: "Reproducir pasos" }).click();
    await page.waitForTimeout(2500);
    expect(errors.join("\n")).not.toContain("Cannot update a component");
  });

  test("cambiar la moneda actualiza transporte y colas sin recargar", async ({ page }) => {
    await prepare(page, "light");
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/#/transporte");
    await expect(page.locator("main")).toContainText("USD");
    await page.getByRole("button", { name: "Preferencias de vista" }).click();
    await page.getByRole("combobox", { name: "Moneda" }).selectOption("COP");
    await expect(page.locator("main")).not.toContainText("USD");
    await expect(page.locator("main")).toContainText("COP");
    await expect(page.locator("main")).toContainText("+48,6 %");
    await page.getByRole("combobox", { name: "Moneda" }).selectOption("USD");
    await page.goto("/#/colas");
    await expect(page.locator("main")).toContainText("USD");
    await page.getByRole("combobox", { name: "Moneda" }).selectOption("COP");
    await expect(page.locator("main")).not.toContainText("USD");
    await expect(page.locator("main")).toContainText("COP");
  });

  test("los textos de métodos quedan separados del borde y la tabla no", async ({ page }) => {
    await prepare(page, "light");
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/#/transporte");
    await page.getByRole("button", { name: "Métodos", exact: true }).click();
    const offset = await page.evaluate(() => {
      const panel = document.querySelector("#section-metodos .collapsible-block");
      const text = [...document.querySelectorAll("#section-metodos p")].find((node) => node.textContent?.includes("Cómo funciona Noroeste"));
      const caption = [...document.querySelectorAll("#section-metodos .chart-caption")].find((node) => node.textContent?.includes("Clic en un paso"));
      const table = document.querySelector("#section-metodos .table-wrap");
      if (!panel || !text || !caption || !table) return null;
      const panelLeft = panel.getBoundingClientRect().left;
      const start = (node: Element) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().left - panelLeft;
      };
      return { text: start(text), caption: start(caption), table: table.getBoundingClientRect().left - panelLeft };
    });
    expect(offset).not.toBeNull();
    expect(offset!.text).toBeGreaterThanOrEqual(12);
    expect(offset!.caption).toBeGreaterThanOrEqual(12);
    expect(offset!.table).toBeLessThanOrEqual(1);
  });
});
