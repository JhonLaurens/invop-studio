# Auditoría UX/UI — Estudio IO · Ronda 7 (validación de cambios R6)

> **Para Cursor:** validación medida de cada afirmación de `IMPLEMENTACION_AUDITORIA.md` (sección "Revisión de la ronda 6").
>
> **Contextos:**
> - Escritorio a 948 px.
> - Móvil a 375 px y 320 px (iframes de ancho fijo).
> - Temas Claro y Oscuro.
> - Carga en frío con el tema Oscuro guardado.
>
> **Criterio:** APROBADO solo con medición.
>
> **Nota de método:** en la ronda 6 algunos iframes "móviles" se encogieron por debajo de 375 px por el layout flex del contenedor. En esta ronda se fijó `flex: none`. Los valores de abajo son los correctos.

---

## 0. Veredicto

**Estado: ✅ casi cerrado.** Queda **1 S2 de datos** (Cw y W máx no siguen la unidad) y **2 S2 de responsive**. El resto está aprobado.

| Métrica automática (objetivo 0) | Inicio | Transporte | Colas |
|---|---|---|---|
| Inputs sin nombre, contraste < AA, objetivos < 24 px, texto < 12 px, SVG < 9 px, fuera de tarjeta, overflow, `aria-controls` (claro y oscuro, 948 px) | **0 ✅** | **0 ✅** | **0 ✅** |
| Contraste durante la carga en oscuro (muestras de 150 a 1.600 ms) | 0 ✅ | 0 ✅ | 0 ✅ |
| Header escritorio (≤ 72 px) | **56 ✅** | 56 ✅ | 56 ✅ |
| Header móvil 375 px (≤ 104 px) | **99–101 ✅** | 99–101 ✅ | 99–101 ✅ |
| Tamaños de fuente distintos | ≤ 7 ✅ | ≤ 7 ✅ | ≤ 7 ✅ |

---

## 1. Validación de cada afirmación

| Afirmación de Cursor | Veredicto | Evidencia medida |
|---|---|---|
| **R5-01:** W y Wq en la unidad del encabezado, hasta 4 cifras significativas; KPI en la unidad elegida | ✅ **APROBADO** | **min:** Wq = 0,1286 · 0,01579 · 0,002983 · 0,0005754; KPI "0,103 min". **h:** W = 0,00381 · 0,00193 · 0,001716 · 0,001676; KPI "0,001716 h". **s:** W = 13,71 · 6,947 · 6,179 · 6,035; KPI "6,179 s". Sin sufijos mezclados. SLA = "Cumple", s* = 4 y CT/h idénticos en las 3 unidades. |
| **R6-01:** tema aplicado desde el `<head>` | ✅ **APROBADO** | Script inline presente. En la carga en frío en oscuro, `data-theme="dark"` desde la primera muestra (47–132 ms); contraste con 0 incidencias en todas las muestras. Sin destello. |
| **R5-02:** altura del header | ✅ | 56 px en escritorio; 99–101 px a 375 px. Logo de 40 px. |
| **R5-06:** orden del header | ✅ | Marca · nav (centro) · ⚙ (x = 789) · tema (x = 835) a la derecha. |
| **R5-03:** Ejemplos dentro de "Más" en móvil | ✅ | La barra a 375 px muestra Restablecer · Guardar · ⋯ Más, sin scroll ni cortes. El menú "Más" contiene "Ejemplo: Base λ=15, μ=10", "Ejemplo: Alta carga", "Copiar enlace" e "Imprimir". |
| **R5-04:** stepper compacto | 🟡 **PARCIAL** | A 375 px: **2 filas** (← · Paso n/N · → · ↺ · ▶ y slider), botones de 40×32 px con `aria-label`, ninguno fuera del panel ✅. Pero el contenido útil sigue en **273 px** (objetivo ≥ 320) y **a 320 px se cortan 3 controles** (← y ▶ recortados, slider desbordado). Ver R7-02. |
| **R5-05:** tamaño mínimo de los desplegables MODI | ✅ | `summary` ≥ 54 px en móvil y 0 objetivos < 24 px en escritorio. |
| **R6-02:** λ y μ con precisión reducida | 🟡 **PARCIAL** | λ y μ ✅ (μ en s = "0.1667"; valuetext "0,1667 /s"). Fallos: **W máx** muestra "0.11666666666666667" (min) y "0.0019444444444444444" (h), como Cursor mismo reconoce; el **step** del slider en s sigue en 0.008333333333333333. Ver R7-01. |
| Apellido en el pie | ✅ | "Jhon Dayron Jaramillo Laurens". |
| Pendientes reconocidos (range doble, SVG largos, Playwright/axe) | ⏳ Siguen pendientes | Coincide con la medición. |

---

## 2. Backlog R7 (final)

### S2

**R7-01 · Campos de Colas que no siguen la unidad o no se formatean**
1. **W máx (SLA):** muestra "0.11666666666666667" en min y "0.0019444444444444444" en h.
   - Cambio: mostrar `round(v, 4 cifras significativas)` y guardar el valor interno sin redondear, igual que λ y μ.
2. **Cw — la unidad no es coherente:**
   - **En Horas:** el valor (300) y el `aria-label` ("…por hora") son correctos, pero el **texto visible** sigue diciendo "Penalización por entidad en el sistema **($/min)**. $ 300,00/h equivalente".
   - **En Segundos:** Cw **se queda en 5 $/min** (no se convierte a $/s) y el `aria-label` dice "por minuto", mientras el resto de la UI está en segundos.
   - Cambio: que el texto visible derive de la misma unidad que el `aria-label`. Para Segundos, convertir a $/s (5 $/min → 0,08333 $/s) o declarar en la cabecera que "Cw se expresa en $/min cuando la unidad es s".
   - La coherencia es obligatoria: el helper, el `aria-label`, el valor y el texto de la cabecera ("penalización Cw según unidad elegida") deben decir lo mismo.
3. **Step del slider en Segundos:** 0.008333333333333333. Usar un step redondo (0,005 o 0,001).
- Aceptación: en las 3 unidades ningún input muestra más de 4 cifras significativas, y el texto visible de Cw coincide con su `aria-label` y su valor.

**R7-02 · Ancho útil de Métodos en móvil**
- **375 px:** el panel de método mide **273 px** por el padding de tres contenedores anidados (sección › acordeón › panel).
- **320 px** (iPhone SE): el stepper se corta (3 controles fuera del panel) y la sub‑nav corta "Métodos".
- Cambio:
  ```css
  @media (max-width: 640px) {
    .methods-section, .method-accordion, .method-panel { padding-inline: 0; border-inline: 0; }
    .method-panel { margin-inline: -12px; }       /* opcional: ganar el padding del card */
    .stepper { display: grid; grid-template-columns: auto 1fr auto auto auto; gap: 6px; }
    .stepper .step-label { min-width: 0; text-align: center; }
    .page-subnav { overflow-x: auto; scroll-snap-type: x mandatory; }
  }
  ```
- Aceptación: a 375 px el panel mide ≥ 320 px; a 320 px hay 0 controles fuera del panel y las 3 pestañas son visibles o desplazables con indicador.

### S3 (pendientes reconocidos)

| ID | Estado |
|---|---|
| R5-08 Range doble en un solo track | Pendiente |
| R5-09 Nodos SVG truncados ("Centro de Acopi…") | Pendiente |
| R7-03 Legibilidad de valores muy pequeños | **Nuevo, opcional.** En Horas, Wq = "0,00000959" es difícil de leer. Sugerencia: si el máximo de la columna es < 0,01, usar un multiplicador en el encabezado ("Wq (×10⁻³ h)"). |
| DoD | Playwright + axe + `toHaveScreenshot` siguen sin implementarse. |

---

## 3. Historial

| Ronda | S1 | S2 | S3 |
|---|---|---|---|
| v3 | 4 | 7 | 13 |
| v4 | 3 | 3 | 8 |
| v5 | 1 | 3 | 6 |
| v6 | 1 | 5 | 5 |
| **v7** | **0** | **2** | **3** |

**Siguiente paso recomendado:** cerrar R7-01 y R7-02. Después, implementar la suite Playwright + axe del DoD para que estas métricas queden como regresión automática y no dependan de auditorías manuales.
