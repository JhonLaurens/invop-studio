# Auditoría UX/UI — Estudio IO · Ronda 3 (revisión estricta)

> **Para Cursor:** revisión estricta tras aplicar v1 y v2. Criterio: un ítem solo está **APROBADO** si cumple su criterio de aceptación en **todos** los contextos: escritorio 948 px y ~1580 px, móvil 375 px, y temas **Claro, Oscuro y Sistema**. Si falla en uno, está **NO APROBADO**.
> Además de la revisión visual se corrieron chequeos automáticos en el DOM: contraste WCAG, etiquetas, tamaños de objetivo táctil, tamaño de texto, overflow, jerarquía de encabezados e IDs duplicados.
> Severidad: **S1** = dato incorrecto o funcionalidad rota · **S2** = incumple WCAG 2.2 AA o bloquea la tarea · **S3** = calidad visual o consistencia.

---

## 0. Veredicto

| Área | Resultado |
|---|---|
| Correctitud de los métodos paso a paso | ❌ **NO APROBADO**: Vogel y Costo Mínimo muestran matrices parciales vacías o incompletas (S1). |
| Accesibilidad WCAG 2.2 AA | ❌ **NO APROBADO**: 6 inputs sin etiqueta en Colas, objetivos táctiles < 24 px, contraste 1.28:1 en modo oscuro. |
| Responsive móvil | ❌ **NO APROBADO**: header de 157 px; el diagrama de flujo se desborda y se recorta. |
| Modo oscuro | ❌ **NO APROBADO**: chips `s = n` ilegibles. |
| Escritorio, tema claro | 🟡 **APROBADO CON OBSERVACIONES**. |

**Métricas automáticas actuales** (deben quedar todas en **0**):

| Métrica | Inicio | Transporte | Colas |
|---|---|---|---|
| Inputs sin etiqueta accesible | 0 | 0 | **6** |
| Objetivos interactivos < 24×24 px | 0 | **9** | **6** |
| Texto < 12 px | **9** | 0 | **1** |
| Texto SVG con altura renderizada < 9 px | 0 | **11** (móvil) | **9** |
| Contraste < 4.5:1, tema oscuro | 0 | 0 | **4** |
| `aria-expanded` sin `aria-controls` | **1** | **4** | **4** |
| Overflow horizontal a 375 px | 0 | 0 | **sí** (scrollbar visible por `.queue-system-flow`) |

---

## 1. Verificación de rondas anteriores

### ✅ Aprobados (verificados en todos los contextos)
- R2-02: botones "Retomar Transporte" y "Retomar Colas" en el hero, legibles.
- R2-03: la guía colapsable usa el mismo layout en ambos módulos (pero el diagrama interno está roto; ver R3-05).
- R2-06: el eje Y del gráfico de barras arranca en 0.
- R2-11: las acciones en móvil quedan en una sola fila con "⋯ Más", y la sub‑nav en una sola fila.
- R2-12: espaciado de las tarjetas de Inicio.
- R2-13: footer sin autores duplicados.
- T-15 MODI: muestra uᵢ, vⱼ y δᵢⱼ por iteración, y la celda entrante va resaltada. Las asignaciones finales cuadran (Z = 8.350 verificado a mano; 9 celdas básicas = m + n − 1).
- R2-01 solo en **Esquina Noroeste**: la matriz parcial incluye la columna "Reserva (ficticio)".
- R2-10 en parte: columna "Costo reserva" separada, destinos editables, botón × por fila y por columna.
- R2-05 al hacer clic: la pestaña activa y el `scroll-margin` son correctos al navegar con clic (falla en reposo; ver R3-06).
- G-04 / G-05: tooltip y series del gráfico de costos legibles en ambos temas.

### ❌ No aprobados o regresiones → pasan al backlog R3

| Ítem previo | Estado | Ver |
|---|---|---|
| R2-01 (Reserva en la matriz parcial) | Solo corregido en Noroeste; **Costo Mínimo y Vogel fallan** | R3-01, R3-02 |
| R2-04 (panel ⚙) | Sin verificación de cierre con Esc ni `role="dialog"`; mismos hallazgos | R3-10 |
| R2-07 (header móvil) | **157 px** (objetivo ≤ 104 px) | R3-07 |
| R2-08 (unidades) | Solo hay texto, **no hay selector**; "W máx (s)" sigue en segundos mientras W se muestra en min; Cw sigue en $/min | R3-04 |
| R2-09 (diagramas) | Flujo de colas diminuto y **desbordado**; nodos de Noroeste aún < 12 px | R3-03, R3-09 |
| R2-14 (anillo de foco) | El botón ⚙ conserva el anillo teal tras un clic con mouse | R3-13 |
| R2-16 (range doble) | Siguen siendo dos sliders apilados | R3-15 |
| G-11 (escala tipográfica) | 10 tamaños distintos, incluidos 10.4 px y 11.52 px | R3-12 |

---

## 2. Backlog R3 (implementar en este orden)

### S1 — Datos incorrectos o funcionalidad rota

**R3-01 · Vogel: la matriz parcial y el diagrama están vacíos en todos los pasos**
- Dónde: Transporte › Métodos › Vogel.
- Reproducir: expandir Vogel → Paso 9/9 → la matriz muestra solo "—" y el diagrama no tiene rutas. Lo mismo con "← Anterior" (Paso 8/9) y al hacer clic en el paso 3. La lista de pasos sí tiene datos (p. ej. "Asignar 500 en (Laboratorio B, H4)").
- Causa probable: los pasos de Vogel no exponen `{row, col, qty}` con la misma forma que Noroeste (el texto se arma con otra estructura), así que el reductor de la matriz parcial no encuentra celdas.
- Cambio: normalizar los pasos de **los 3 métodos** a un tipo común `Step { i: number; j: number; qty: number; note?: string; penalties?: {...} }` y usar un único `buildPartialMatrix(steps, upToIndex, balancedProblem)`.
- Aceptación: en el Paso 9/9 de Vogel la matriz coincide con la solución de Vogel (Z = 9.000) y cada fila suma su oferta.

**R3-02 · Costo Mínimo: la matriz parcial omite la columna ficticia**
- Reproducir: Costo Mínimo › Paso 9/9. Los pasos 2, 3 y 4 asignan 100 + 100 + 700 a "Reserva (ficticio)", pero esa columna aparece vacía. Laboratorio B suma 550 cuando su oferta es 1.250.
- Cambio: el mismo `buildPartialMatrix` de R3-01, construido sobre el problema **balanceado**.
- Aceptación: Origen 4 → Reserva = 100, Origen 5 → Reserva = 100, Laboratorio B → Reserva = 700; cada fila suma su oferta.
- **Test obligatorio** (Vitest): para los 3 métodos, `sum(partialMatrix(lastStep)) === totalOferta` y `partialMatrix(lastStep)` es igual a la matriz de la solución inicial.

**R3-03 · Colas: el diagrama de flujo se desborda de su tarjeta**
- Dónde: `.queue-system-flow.arch-inset` dentro de "Recomendación & flujo".
- Medición: el borde derecho del diagrama queda ~15 px fuera de la tarjeta en escritorio. A 375 px aparece desplazado a la derecha, recortado y genera scroll horizontal.
- Cambio: `width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;` en el contenedor; el SVG con `viewBox` y `width="100%"` sin ancho fijo, y quitar cualquier `margin-left` o `transform`.
- Aceptación: `flow.getBoundingClientRect().right <= card.getBoundingClientRect().right` a 375, 948 y 1580 px.

**R3-04 · Colas: unidades incoherentes (sigue abierto desde C-02 y R2-08)**
- Situación: el texto dice "Unidad de tiempo: **min** · W y Wq en min", pero el campo dice **"W máx (s)"** con valor 7, y Cw está en "$/entidad·min" mientras Cs y CT están en $/h. Además el KPI W muestra **"0,10 min"**: con 2 decimales se pierde precisión (el valor real es 6,18 s = 0,103 min).
- Cambio:
  1. `<select>` real de unidad de tiempo (s / min / h) en la cabecera del módulo, persistido.
  2. Todos los campos y encabezados se derivan de esa unidad: "W máx (min)", "Cw ($/entidad·h)" o la unidad elegida.
  3. Mostrar los tiempos con decimales adaptativos: mínimo 3 cifras significativas, o cambiar a la subunidad cuando el valor sea < 1 (mostrar "6,18 s" en lugar de "0,10 min").
- Aceptación: al cambiar la unidad, se actualizan las etiquetas, los valores, la tabla y los KPIs, y la evaluación SLA da el mismo resultado.

### S2 — Accesibilidad y bloqueo de tareas

**R3-05 · Diagrama de la guía en Transporte roto**
- Las cajas de Origen y Destino quedan pegadas y las flechas salen por fuera, a la derecha de los destinos.
- Aceptación: hay un espacio de al menos 80 px entre la columna de orígenes y la de destinos, y las flechas terminan en el borde izquierdo de cada destino.

**R3-06 · Scroll‑spy incorrecto en reposo**
- En la parte superior de Transporte (scrollY = 0) la pestaña activa es **"Comparar"** y debería ser "Datos".
- Cambio: valor inicial "Datos"; el observer selecciona la **última** sección cuyo `top <= headerH + subnavH + 8`.
- Aceptación: la pestaña correcta queda activa en scrollY = 0, a mitad de la página y al final.

**R3-07 · Header móvil**
- Mide 157 px: hay una fila solo para los botones ⚙ y tema.
- Cambio: a ≤ 640 px, poner ⚙ y tema en la **misma fila** que el logo (alineados a la derecha, 40×40 px) y el nav segmentado en la segunda fila.
- Aceptación: header ≤ 104 px a 375 px.

**R3-08 · Inputs de Colas sin etiqueta accesible (6)**
- Afecta λ, μ, Cs, Cw, W máx y Pw máx. El texto visible no está asociado al input.
- Cambio: `<label htmlFor={id}>` o `aria-labelledby` apuntando al título del campo, más `aria-describedby` para la ayuda. Los sliders deben tener `aria-label` y `aria-valuetext` con unidad.
- Aceptación: 0 inputs sin nombre accesible (axe: `label`).

**R3-09 · Contraste de los chips `s = n` en modo oscuro: 1.28:1**
- Color `rgb(0,0,0)` sobre `rgb(21,31,53)`. Solo el chip activo se ve.
- Cambio: `color: var(--text)` en `.chip` y verificar los estados hover y disabled.
- Aceptación: ≥ 4.5:1 en Claro y Oscuro.

**R3-10 · Objetivos táctiles < 24×24 px (WCAG 2.5.8)**
- Transporte: los × de eliminar origen o destino miden **22×20**.
- Colas: el "?" de ayuda mide **7×16**, y las etiquetas con tooltip (Cs, Cw, W máx, Pw máx) miden **16 px de alto**.
- Cambio: mínimo 24×24 px (ideal 32×32) usando padding o un `::before` invisible que amplíe el área.
- Aceptación: 0 elementos interactivos < 24×24 px.

**R3-11 · `aria-expanded` sin `aria-controls`**
- Afecta ⚙, "Cargar ejemplo", "⋯ Más", "Mostrar/Ocultar guía" y los acordeones de métodos.
- Cambio: añadir `aria-controls={panelId}` con un `id` único. El panel ⚙ debe ser `role="dialog"` con `aria-labelledby`, cerrar con Esc y con clic fuera, y devolver el foco al botón.
- Aceptación: 0 casos; con Esc se cierran todos los popovers y menús.

### S3 — Calidad visual y consistencia

| ID | Dónde | Problema | Cambio | Aceptación |
|---|---|---|---|---|
| R3-12 | Global | 10 tamaños de fuente: chips de Inicio a **11.52 px**, avatares a **10.4 px**, "s*" a 11.52 px. | Tokens `--fs-xs: 12px` como mínimo; reemplazar los tamaños sueltos. | 0 textos < 12 px; ≤ 7 tamaños distintos. |
| R3-13 | Header | El ⚙ y los enlaces conservan el anillo de foco tras un clic con mouse. | Anillo solo con `:focus-visible`. | Al hacer clic no aparece el anillo; con Tab sí. |
| R3-14 | Diagramas Noroeste / Costo Mín / Vogel | Nodos con texto < 9 px renderizados y nombres truncados ("Centro de Acopi…", "Reserva (fictic…"). El diagrama ocupa ~35 % del ancho y deja espacio vacío. | SVG a ancho completo de su columna; fuente ≥ 12 px; nodos con ancho calculado según el texto más largo (máx. 160 px) y `<title>` con el nombre completo. | 0 `svg text` < 9 px de alto. |
| R3-15 | Colas › Servidores | Dos sliders apilados para s mín y s máx. | Un range doble (dos thumbs en un solo track) con valores en los extremos, `role="slider"` en cada thumb. | Un solo track. |
| R3-16 | MODI › potenciales u y v | Se reparten con `justify-content: space-between`: huecos enormes y no se alinean con las columnas de la tabla δ. | Mostrar u como **columna** a la izquierda de la tabla δ y v como **fila** encima (formato de libro de texto). | uᵢ alineado con su fila y vⱼ con su columna. |
| R3-17 | MODI | No muestra el **ciclo** ni **θ** (en la v1 aparecía "θ = 50"; es una regresión). | Mostrar θ y resaltar el ciclo (+/−) en la matriz de la iteración. | Cada iteración no óptima muestra θ y el ciclo. |
| R3-18 | Tablas MODI y asignación final | La columna "Reserva (ficticio)" es ~3 veces más ancha que las demás; queda una columna vacía entre la primera columna y H1. | `table-layout: fixed`, columnas de datos del mismo ancho, ficticia en gris/itálica. | Columnas de datos ±10 % del mismo ancho. |
| R3-19 | Tarjetas de pasos de Vogel | Todos los títulos dicen "Iteración N: penalización máxima" y no muestran las fichas origen → destino como Noroeste y Costo Mínimo. | Mismo componente de paso para los 3 métodos; en Vogel, añadir una mini‑tabla de penalizaciones por fila y columna, con la máxima resaltada. | Las tarjetas son consistentes entre métodos. |
| R3-20 | Tarjetas de pasos | La flecha "→" queda sola en una línea cuando el nombre es largo. | `white-space: nowrap` en el par origen → destino, o apilar en vertical con la flecha ↓. | Sin flechas huérfanas. |
| R3-21 | Matriz de Transporte (móvil) | La leyenda del heatmap se parte ("Alto (percentiles)" en otra línea) y sus cuadros no se ven en modo oscuro; los nombres de origen se cortan con un ".." extraño. | Leyenda en una fila con swatches con borde; `text-overflow: ellipsis` limpio + `title`. | Leyenda legible en ambos temas. |
| R3-22 | Heatmap | Las filas con costos iguales (Origen 4 y 5 = 10) siguen como un bloque oscuro uniforme. | Escala por percentiles **sobre todas las celdas** (no por fila); si todos los valores son iguales, usar el color neutro medio. | Una fila con costos constantes no se ve como alerta. |
| R3-23 | Botones de acción en móvil | "Cargar ejemplo ▾" ocupa 3 líneas. | `white-space: nowrap` + "Ejemplos ▾" como etiqueta corta en móvil. | Cada botón en 1 línea. |
| R3-24 | Sub‑nav de Colas en móvil | Aparece un track de scrollbar bajo las pestañas. | `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` en la sub‑nav. | Sin track visible. |

---

## 3. Definición de "terminado" para esta ronda

Cursor debe agregar y ejecutar estas pruebas antes de dar por cerrada la ronda:

1. **Unit tests (Vitest)**: R3-01 y R3-02 (consistencia de la matriz parcial en los 3 métodos) y R3-04 (las conversiones de unidades no cambian el resultado SLA).
2. **E2E (Playwright + @axe-core/playwright)** sobre `#/`, `#/transporte` y `#/colas`, a 375×812 y 1440×900, en `data-theme=light` y `dark`:
   ```ts
   const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();
   expect(results.violations).toEqual([]);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   expect(await page.locator('.topbar').evaluate(e => e.getBoundingClientRect().height)).toBeLessThanOrEqual(104); // solo móvil
   ```
3. **Snapshot visual** (Playwright `toHaveScreenshot`) de cada sección en ambos temas, para detectar regresiones como la de la guía de Transporte.
4. Todas las métricas de la sección 0 en **0**.
