# Auditoría UX/UI — Estudio IO · Ronda 4 (revisión estricta)

> **Para Cursor:** re-verificación estricta de la ronda 3 (`AUDITORIA_UX_UI_Estudio_IO_v3_estricta.md`). Un ítem queda **APROBADO** solo si cumple su criterio en todos estos contextos: escritorio 948 px y ~1580 px, móvil 375 px, y temas Claro y Oscuro. Se repitieron los chequeos automáticos del DOM y se validaron los cálculos a mano.
> Severidad: **S1** = dato incorrecto o funcionalidad rota · **S2** = WCAG 2.2 AA o bloqueo de tarea · **S3** = calidad visual.

---

## 0. Veredicto

| Área | Ronda 3 | Ronda 4 |
|---|---|---|
| Correctitud del paso a paso (3 métodos) | ❌ | ✅ **APROBADO** |
| Accesibilidad automática (etiquetas, contraste, objetivos táctiles, `aria-controls`) | ❌ | ✅ **APROBADO** (0 incidencias en claro y oscuro) |
| Unidades en Colas | ❌ | 🟡 **PARCIAL**: el selector funciona, pero quedan 2 fallos de presentación (S1/S2) |
| Diagrama de flujo de Colas | ❌ | ❌ **NO APROBADO**: sigue desbordado (+9 px en escritorio, +23 px en móvil) |
| Responsive móvil | ❌ | 🟡 **PARCIAL**: header de 113 px (objetivo ≤ 104) y tarjetas de Vogel desbordadas |
| Calidad visual | 🟡 | 🟡 Pendientes los S3 listados abajo |

**Métricas automáticas actuales** (objetivo: todas en 0):

| Métrica | Inicio | Transporte | Colas |
|---|---|---|---|
| Inputs sin nombre accesible | 0 ✅ | 0 ✅ | 0 ✅ |
| Contraste < 4.5:1 (claro y oscuro) | 0 ✅ | 0 ✅ | 0 ✅ |
| Objetivos < 24×24 px | 0 ✅ | 0 ✅ | 0 ✅ |
| `aria-expanded` sin `aria-controls` | 0 ✅ | 0 ✅ | 0 ✅ |
| Texto HTML < 12 px | **3** (avatares a 10.4 px) | 0 ✅ | 0 ✅ |
| Texto SVG con altura < 9 px (móvil) | 0 ✅ | **11** | **9** |
| Elementos desbordados fuera de su tarjeta | 0 | **4/9** tarjetas de pasos de Vogel | **1** (`.queue-system-flow`) |
| Tamaños de fuente distintos | 9 | 8 (7 en móvil) ✅ | 8 (7 en móvil) ✅ |

---

## 1. Verificado y aprobado en esta ronda ✅

- **R3-01 Vogel:** la matriz parcial está completa en el Paso 9/9 y la suma es 3.300 (igual a la oferta total). Z = 9.000 verificado a mano: 200·3 + 100·2 + 650·6 + 500·4 + 150·6 + 700·2 = 9.000.
- **R3-02 Costo Mínimo:** incluye la columna "Reserva (ficticio)" (Laboratorio B → 700, Origen 4 y 5 → 100); suma 3.300.
- **Noroeste:** suma 3.300, rutas dibujadas en el SVG.
- **R3-04 en parte:** `<select>` real de unidad (Segundos, Minutos, Horas), persistido en las preferencias. λ se convierte bien (15/min = 900/h = 0,25/s) y el SLA da el mismo resultado ("Cumple") en las 3 unidades. Los encabezados de la tabla cambian de unidad.
- **R3-05:** diagrama de la guía corregido.
- **R3-06:** scroll‑spy correcto en reposo ("Datos"), en la mitad ("Comparar") y al final ("Métodos").
- **R3-08:** los 6 inputs de Colas tienen etiqueta; los sliders de λ y μ tienen `aria-label` y `aria-valuetext` con unidad.
- **R3-09:** contraste de los chips `s = n` corregido en oscuro.
- **R3-10:** 0 objetivos < 24 px.
- **R3-11:** 0 `aria-expanded` sin `aria-controls`. El panel ⚙ es `role="dialog"` con `aria-labelledby`, cierra con Esc y devuelve el foco al botón. Tiene las nuevas opciones (Densidad, Moneda, Unidad, Mostrar guía).
- **R3-13:** el anillo de foco del ⚙ solo aparece con `:focus-visible`.
- **R3-16:** u y v integrados como encabezados de fila y columna de la tabla δ.
- **R3-17:** vuelven θ ("θ = 50,00") y el ciclo resaltado con borde punteado.
- **R3-22:** heatmap con escala y leyenda.
- **R3-23 / R3-24:** sub‑nav en una fila sin track de scrollbar.

---

## 2. Backlog R4 (pendientes, en orden)

### S1

**R4-01 · El título del KPI de W no coincide con su valor**
- Dónde: Colas › tarjeta KPI "W".
- Evidencia: con la unidad en Minutos, el KPI dice **"W (MIN) · 6,18 s"**; en Horas, **"W (H) · 6,18 s"**.
- Cambio: quitar la unidad del título ("W (sistema)") y mostrar la unidad solo junto al valor, o bien mostrar el valor en la unidad elegida con decimales adaptativos (ver R4-02).
- Aceptación: el título y el valor nunca declaran unidades distintas.

**R4-02 · Pérdida de precisión en la tabla al cambiar de unidad**
- Evidencia (fila s = 4): en Minutos, **Wq = 0,00** (el real es 0,003 min); en Horas, **Wq = 0,00 y W = 0,00** (el real de W es 0,0017 h). Una tabla con ceros no sirve para comparar configuraciones.
- Cambio: formateador `formatTime(value, unit)` con **3 cifras significativas mínimo**: 0,00172 h → "0,00172" o "1,72·10⁻³". Opción alternativa: si el valor es < 0,01 en la unidad elegida, mostrarlo en la subunidad con sufijo ("6,18 s").
- Aceptación: en las 3 unidades ningún valor de Wq o W distinto de cero se muestra como "0,00".
- Test (Vitest): `formatTime(0.00172,'h') !== '0,00'`.

**R4-03 · El diagrama de flujo de Colas sigue desbordado (R3-03 no resuelto)**
- Medición: `.queue-system-flow` sobresale **9 px** de su tarjeta en escritorio y **23 px** a 375 px. En móvil aparece desplazado a la derecha, con mucho espacio vacío arriba y abajo, y genera una barra de scroll horizontal visible.
- Cambio (CSS exacto):
  ```css
  .queue-system-flow { box-sizing: border-box; width: 100%; max-width: 100%; margin-inline: 0; overflow: hidden; }
  .queue-system-flow svg { display: block; width: 100%; height: auto; }
  ```
  Además, quitar cualquier `margin-left`, `translate` o ancho fijo heredado de `.arch-inset`, y ajustar el `viewBox` al contenido para que no quede vacío vertical.
- Aceptación: `flow.right − card.right ≤ 0` a 375, 948 y 1580 px; sin scrollbar horizontal.

### S2

**R4-04 · Las tarjetas de pasos de Vogel se desbordan (4 de 9)**
- Evidencia: las fichas "Reserva (ficticio)" y "Centro de Acopio C → H3", y el texto "pen máx. en Origen 4 (10)", salen del borde de su tarjeta y se montan sobre la vecina (pasos 1, 2, 5 y 8). En móvil también.
- Cambio: en la tarjeta de paso, `min-width: 0` en los hijos flex y `flex-wrap: wrap` en el par origen → destino (flecha incluida en el mismo grupo que el destino). Las fichas con `max-width: 100%; overflow: hidden; text-overflow: ellipsis` y un `title` con el nombre completo. La grilla con `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`.
- Aceptación: 0 descendientes con `right > card.right` en los 3 métodos y en ambos anchos.

**R4-05 · Header**
- Móvil: **113 px** (objetivo ≤ 104).
- Escritorio a 948 px: ahora ocupa **123 px en 2 filas**, con el nav debajo de la marca, cuando en la v1 cabía en una fila de ~64 px. Además, el título del módulo ("Teoría de colas · M/M/s") se parte en 2 líneas porque la barra de acciones le quita espacio.
- Cambio:
  - **≥ 900 px:** una sola fila (marca · nav · ⚙ · tema).
  - **< 900 px:** dos filas compactas (fila 1 de 48 px, fila 2 con el nav de 44 px).
  - **Cabecera del módulo:** título en su propia fila y, debajo, la barra de acciones junto con el selector de unidad.
- Aceptación: header ≤ 72 px a ≥ 900 px y ≤ 104 px a 375 px; el título del módulo en 1 línea a 948 px.

**R4-06 · Texto SVG ilegible en móvil**
- Evidencia: 11 textos en Transporte (diagramas de métodos) y 9 en Colas (flujo) se renderizan con menos de 9 px de alto. Además siguen los nombres truncados "Centro de Acopi…" y "Reserva (fictic…" en el SVG.
- Cambio: a < 640 px, dibujar el diagrama en **vertical** (orígenes arriba, destinos abajo) o reemplazarlo por la matriz parcial, que ya está. El `font-size` del SVG debe calcularse con el factor de escala del `viewBox` para que el render sea ≥ 12 px. El ancho de los nodos se calcula según la etiqueta más larga.
- Aceptación: 0 `svg text` con altura < 9 px a 375 px.

### S3

| ID | Dónde | Problema | Cambio | Aceptación |
|---|---|---|---|---|
| R4-07 | Inicio / footer, avatares | Iniciales "JC", "JJ" y "AG" a 10.4 px. | Mínimo 12 px (avatar de 32 px). | 0 textos < 12 px. |
| R4-08 | Tablas δ de MODI | Anchos de columna desiguales: 242 / 89 / 75 / 75 / 75 / **212** px (la final ya usa `fixed` con 113 px). | Aplicar `table-layout: fixed` y el mismo ancho de columna a las tablas de iteración. | Columnas de datos dentro de ±10 %. |
| R4-09 | Vogel | Falta la **tabla de penalizaciones** por fila y columna (solo hay texto "pen máx. en …"). | Mini‑tabla con las penalizaciones del paso actual y la máxima resaltada. | Visible en cada paso. |
| R4-10 | Colas › rango de servidores | Siguen siendo 2 sliders separados; `aria-valuetext` vacío en ambos. | Range doble en un solo track; `aria-valuetext="s mínimo 1"`. | Un solo track, con `valuetext`. |
| R4-11 | Panel ⚙ | Al abrir, el foco se queda en el botón y no entra al diálogo. | Mover el foco al primer control al abrir y atrapar el foco (focus trap) mientras esté abierto. | Tab recorre solo el panel. |
| R4-12 | Menú "Cargar ejemplo" | No se cerró con un clic fuera en la prueba (`aria-expanded` siguió en `true`). Puede ser porque el listener usa `pointerdown`; verificarlo con clic real. | Cerrar con `pointerdown` fuera y con Esc (igual que el ⚙). | Clic fuera → `aria-expanded="false"`. |
| R4-13 | Barra de acciones móvil | "Guardar escenario" y "⋯ Más" ocupan 2 líneas. | Etiqueta corta "Guardar" en < 640 px; `white-space: nowrap`. | Botones de 1 línea. |
| R4-14 | Métodos en móvil | Tres niveles de tarjetas anidadas (sección › acordeón › panel) con padding acumulado: el contenido útil queda en ~240 px de 375. | En < 640 px, quitar el borde y el padding del panel interno (`padding-inline: 0`). | Contenido ≥ 320 px de ancho a 375 px. |

---

## 3. Definición de terminado (se mantiene de la ronda 3)

1. **Vitest:**
   - consistencia de la matriz parcial en los 3 métodos (ya pasa; dejarla como regresión);
   - `formatTime` (R4-02);
   - el SLA es invariante a la unidad.
2. **Playwright + axe** en `#/`, `#/transporte` y `#/colas` × {375×812, 1440×900} × {light, dark}:
   - `violations = []`;
   - `scrollWidth ≤ innerWidth`;
   - header ≤ 104 px en móvil y ≤ 72 px en escritorio;
   - aserción de contención: ningún `.card *` con `right > card.right`.
3. **`toHaveScreenshot`** por sección y por tema.
4. Todas las métricas de la sección 0 en 0.
