# Auditoría UX/UI — Estudio IO · Ronda 5 (revisión completa estricta)

> **Para Cursor:** revisión completa desde cero en una pestaña nueva, más la re-verificación de `AUDITORIA_UX_UI_Estudio_IO_v4_estricta.md`.
>
> **Contextos probados:** escritorio a 948 px y 1366 px, móvil a 375 px (en iframe), temas Claro, Oscuro y Sistema.
>
> **Chequeos automáticos del DOM:** contraste WCAG, etiquetas, objetivos táctiles, tamaño de texto, texto SVG, contención dentro de tarjetas, overflow, encabezados, IDs duplicados y `aria-controls`. Además se validaron los cálculos a mano.
>
> **Criterio:** un ítem está APROBADO solo si cumple en todos los contextos.
>
> **Severidad:**
> - **S1:** dato incorrecto o engañoso.
> - **S2:** WCAG 2.2 AA, bloqueo de tarea o responsive.
> - **S3:** calidad visual.

---

## 0. Veredicto global

**Estado: 🟡 CASI LISTO.** Quedan **0 fallos de cálculo**, **1 fallo S1 de presentación** (unidades mezcladas), **3 S2** y **6 S3**.

| Métrica automática (objetivo 0) | Inicio | Transporte | Colas |
|---|---|---|---|
| Inputs sin nombre accesible | 0 ✅ | 0 ✅ | 0 ✅ |
| Contraste < AA (claro y oscuro) | 0 ✅ | 0 ✅ | 0 ✅ |
| Objetivos < 24×24 px | 0 ✅ | **2** (resúmenes de iteración MODI, 19–20 px de alto) | 0 ✅ |
| Texto HTML < 12 px | 0 ✅ | 0 ✅ | 0 ✅ |
| Texto SVG con altura < 9 px (375 px y escritorio) | 0 ✅ | 0 ✅ | 0 ✅ |
| Elementos fuera de su tarjeta | 0 ✅ | 0 ✅ | 0 ✅ |
| `aria-expanded` sin `aria-controls` | 0 ✅ | 0 ✅ | 0 ✅ |
| Overflow horizontal de la página | 0 ✅ | 0 ✅ | 0 ✅ |
| Tamaños de fuente distintos | 7 ✅ | 7 ✅ | 7 ✅ |
| Saltos de encabezado / IDs duplicados / un solo `h1` | ✅ | ✅ | ✅ |
| Altura del header (escritorio / móvil) | **94 / 110 px** ❌ | 94 / 110 ❌ | 94 / 110 ❌ |

---

## 1. Verificado y aprobado ✅

**Cálculos (validados a mano)**
- Matriz parcial en el Paso 9/9: la suma es **3.300** (igual a la oferta total) en Noroeste, Costo Mínimo y Vogel.
- Vogel: Z = 9.000.
- MODI: Z final = 8.350 con 9 celdas básicas (m + n − 1), θ = 50, ciclo descrito en texto y resaltado en la tabla δ.

**Colas**
- R4-01: el KPI ahora se titula "W (sistema)" y no declara una unidad distinta a la del valor.
- R4-03: el diagrama de flujo se rehízo en HTML. Es legible, queda **contenido en su tarjeta** a 375, 948 y 1366 px (margen de −17 a −25 px) y no genera scroll.

**Transporte**
- R4-04: 0 de 9 tarjetas de pasos desbordadas en los 3 métodos, en escritorio y en móvil.
- R4-06: en móvil el SVG se oculta y queda la matriz parcial; 0 textos SVG < 9 px.
- R4-08: anchos de columna MODI equilibrados.
- R4-09 en parte: Vogel muestra las penalizaciones de cada paso (fichas por fila y columna, con la máxima resaltada).

**Global**
- R4-07: avatares ≥ 12 px.
- R4-11: el panel ⚙ mueve el foco al primer control al abrir, cierra con Esc y devuelve el foco.
- R4-12: "Cargar ejemplo" se cierra con un clic fuera.
- R4-13: las acciones en móvil ya no ocupan 2 líneas ("Ejemplos", "Guardar").
- Escritorio: el header volvió a **1 fila**.
- Persistencia, unidad de tiempo, tema Sistema y moneda funcionan y se guardan.

---

## 2. Backlog R5

### S1

**R5-01 · Columnas de la tabla de Colas con unidades mezcladas y encabezado incorrecto**
- Dónde: Colas › "Indicadores por configuración", columnas Wq y W.
- Evidencia:
  - Con la unidad en **Horas**, el encabezado dice "Wq (h) | W (h)", pero las celdas muestran **"0,129 min"**, **"0,179 s"** y **"0,103 min"**. La selección de "Horas" no tiene ningún efecto visible.
  - Con la unidad en **Minutos**, la columna Wq mezcla "0,129 min", "0,016 min", **"0,179 s"** y **"0,035 s"**. No se pueden comparar los valores de un vistazo.
  - El KPI "W (sistema)" muestra "0,103 min" incluso cuando la unidad elegida es Horas.
- Regla: **una columna, una unidad**. La conversión adaptativa (cambiar a la subunidad) solo se permite en valores aislados como los KPIs, nunca dentro de una columna.
- Cambio:
  1. Usar la unidad elegida en toda la columna. Formatear con 3 cifras significativas y notación compacta cuando haga falta (p. ej. `1,72e-3`) o con un multiplicador en el encabezado: "W (×10⁻³ h)".
  2. Si se mantiene la conversión adaptativa, hacerlo **por columna**: elegir la subunidad que deje el máximo de la columna ≥ 1 y reflejarla en el encabezado ("Wq (s)").
  3. El KPI debe respetar la unidad elegida, o indicar de forma explícita que usa una unidad automática ("auto").
- Aceptación: en las 3 unidades, cada columna muestra una sola unidad y coincide con su encabezado; al elegir "Horas" algo visible cambia; el SLA sigue igual.
- Test (Vitest): `formatColumn([0.00215, 0.00027, 0.00005], 'h')` devuelve todos los valores con el mismo sufijo o sin sufijo.

### S2

**R5-02 · Altura del header**
- Medición: **94 px en escritorio** (objetivo ≤ 72) y **110 px en móvil** (objetivo ≤ 104). La causa es el bloque `.brand`, de 78 px de alto por el logo apilado.
- Cambio: logo con `height: 40px` en escritorio y 32 px en móvil; `.brand` con `align-items: center` y padding vertical de 8 px.
- Aceptación: header ≤ 72 px a ≥ 900 px y ≤ 104 px a 375 px.

**R5-03 · Barra de acciones en móvil: "⋯ Más" queda cortado**
- Evidencia: a 375 px la barra tiene scroll horizontal, el botón "⋯ Más" aparece cortado ("⋯ M") y se ve un track de scrollbar debajo. Un control de overflow escondido en otro overflow es difícil de descubrir.
- Cambio: en < 640 px, sin scroll; mostrar 2 primarias (Restablecer, Guardar) y "⋯ Más" en una fila con `flex-wrap: nowrap`; "Ejemplos" pasa dentro de "Más".
- Aceptación: todos los botones de la barra son visibles por completo a 375 px y sin scrollbar.

**R5-04 · El stepper de métodos queda tapado por la sub‑nav sticky en móvil**
- Evidencia: Transporte › Vogel a 375 px. Los controles del stepper se reparten en 3 filas y la sub‑nav sticky (Datos | Comparar | Métodos) tapa la fila del medio (Reiniciar / Paso n/N). La matriz parcial necesita scroll horizontal y el contenido útil mide **273 px** de 375 (sigue abierto desde R4-14).
- Cambio:
  - **Stepper en móvil:** una fila compacta con ◀ · "n/N" · ▶ · ⟲ (iconos de 40 px con `aria-label`), y el slider en la fila siguiente.
  - **Padding:** quitar el padding del panel interno a < 640 px (contenido ≥ 320 px de ancho).
  - **Fila sticky:** dejar sticky el bloque del stepper con un `top` igual al alto de la sub‑nav.
- Aceptación: ningún control del stepper queda bajo la sub‑nav; contenido ≥ 320 px.

### S3

| ID | Dónde | Problema | Cambio | Aceptación |
|---|---|---|---|---|
| R5-05 | Transporte › MODI | Los `summary` "Iteración n — Z = …" miden 19–20 px de alto (< 24 px). | `padding-block: 8px` en el summary (≥ 32 px de alto). | 0 objetivos < 24 px. |
| R5-06 | Header en escritorio | ⚙ y tema quedan pegados a la marca (izquierda) y el nav a la derecha: la convención es poner las utilidades al extremo derecho, y queda un vacío central grande. | Orden: marca · (espacio) · nav · ⚙ · tema. | Utilidades a la derecha del nav. |
| R5-07 | Nav en móvil | La pestaña activa es más alta que las demás y su texto queda alineado arriba (pill irregular). | Mismo alto para todos los `.nav-link` (`min-height: 40px; display: grid; place-items: center`). | Alto uniforme. |
| R5-08 | Colas › rango de servidores | Siguen siendo 2 tracks separados (ya tienen `aria-valuetext` ✅). | Un range doble en un solo track. | 1 track. |
| R5-09 | SVG de métodos (escritorio) | Los nodos siguen truncados: "Centro de Acopi…", "Reserva (fictic…" (hay `<title>`, pero el nodo no se adapta al texto). | Ancho del nodo según la etiqueta más larga (máx. 170 px) o etiqueta en 2 líneas. | 0 nodos con "…" en escritorio. |
| R5-10 | Colas › columna derecha | "Recomendación & flujo" quedó corta tras rehacer el diagrama, y deja un vacío grande frente al formulario. | Mover allí el gráfico "Costo por hora vs servidores" o los KPIs, o mantener la columna sticky y añadir una mini‑tabla con s*, s*−1 y s*+1. | Columna derecha ≥ 60 % del alto de la izquierda, o sticky visible. |

---

## 3. Historial de cierre

| Ronda | Fallos S1 | S2 | S3 |
|---|---|---|---|
| v3 | 4 | 7 | 13 |
| v4 | 3 | 3 | 8 |
| **v5** | **1** | **3** | **6** |

## 4. Definición de terminado (sin cambios)

1. **Vitest:** matriz parcial de los 3 métodos (regresión), `formatColumn` (R5-01) y SLA invariante a la unidad.
2. **Playwright + axe:** `#/`, `#/transporte` y `#/colas` × {375×812, 1366×768} × {light, dark}. Debe cumplir:
   - `violations = []`;
   - `scrollWidth ≤ innerWidth`;
   - header ≤ 72 px (escritorio) y ≤ 104 px (móvil);
   - ningún `.card *` sale de su tarjeta;
   - todas las celdas de una columna de tiempo terminan con la unidad del encabezado.
3. **`toHaveScreenshot`** por sección y tema.
