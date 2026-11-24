# Verificación de correcciones R2 — Estudio IO

**Fecha:** 24-nov-2026 · Verificado en el navegador contra `AUDITORIA_UX_UI_Estudio_IO_FINAL_v2.md`. El `localStorage` del usuario se restauró al terminar.

## Resultado

| ID | Corrección declarada | Verificación | Estado |
|---|---|---|---|
| R2-01 | El enlace de salto enfoca el contenido sin cambiar la ruta | En `#/`, `#/transporte` y `#/colas`: la ruta y el título no cambian y el foco queda en `#contenido`. | ✅ |
| R2-02 | Aviso de React "setState in render" al abrir o cerrar métodos | 0 errores de consola tras abrir y cerrar los 4 métodos ×3, Expandir/Contraer todo, guardar y cargar escenario, cambiar preferencias y validar campos. | ✅ |
| R2-03 | 📚 para Referencias en pantallas estrechas | A 375 px el botón muestra "📚". | ✅ |
| R2-04 | Margen de 12 px en los textos de métodos (móvil) | A 375 px, "Cómo funciona Noroeste" y "Clic en un paso…" siguen **a 0 px** del borde del panel, y la tabla a 1 px. No se aprecia el margen. | ❌ |
| R2-05a | Mensaje de Pw | "Pw debe estar entre 0 y 100 %". | ✅ |
| R2-05b | Toast al cargar un escenario | "Escenario QA final cargado". | ✅ |
| R2-05c | COP sin decimales | Al cargar la página con COP: "COP 13.000", "COP 623/h". | ✅ (al cargar) |

## Hallazgos nuevos

**N-01 (S2) · La moneda no se actualiza en vivo en toda la página**
- Probado con una interacción real sobre el `<select>` del panel ⚙.
- Al pasar de USD a COP en Transporte, solo cambian las **4 etiquetas del gráfico** de "Comparación de costos". Siguen en USD (con 2 decimales) la tabla de comparación, los 4 párrafos de "Análisis del resultado" y los encabezados de los 4 métodos: 12 importes en total.
- Colas no cambia ningún importe hasta navegar o recargar.
- **Causa probable:** esos componentes formatean con una moneda capturada en un `useMemo` o `useCallback` sin la dependencia `currency`, o leen la preferencia fuera del contexto.
- **Aceptación:** al cambiar la moneda, 0 apariciones de la moneda anterior en `main` sin recargar.
- **Test Playwright sugerido:** cambiar el select y comprobar con `expect(page.locator('main')).not.toContainText('USD')`.

**N-02 (S3) · Separador decimal inconsistente en porcentajes**
- La columna "vs. óptimo" muestra "+48.6 %", "+22.3 %" y "+7.4 %" con **punto**, mientras el resto de la app usa coma ("7,46 %"). En la primera auditoría se veía "+48,6 %", así que es una regresión.
- **Cambio:** formatear con `Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })`.

**R2-04 (reabierto) · Margen en móvil**
- **Cambio:** a < 640 px, dentro de `.collapsible-block` / panel de método, aplicar `padding-inline: 12px` a los textos (`p`, `h3`, ayudas) y mantener `margin-inline: 0` en tablas y stepper.
- **Aceptación:** offset del texto ≥ 12 px y de la tabla ≤ 1 px respecto al panel.

## Veredicto

La entrega sigue **aprobada**: R2-01 (el obligatorio) y R2-02 están cerrados. Antes de cerrar del todo conviene corregir **N-01**, porque es visible para cualquier usuario que cambie la moneda. N-02 y R2-04 son menores.
