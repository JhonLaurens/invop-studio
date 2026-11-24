# Auditoría UX/UI — Estudio IO · Ronda 6 (revisión estricta)

> **Para Cursor:** re-verificación de `AUDITORIA_UX_UI_Estudio_IO_v5_estricta.md` y contraste de lo que afirma `IMPLEMENTACION_AUDITORIA.md`.
>
> **Contextos probados:**
> - Escritorio a 1366 px.
> - Móvil a 375 px (en iframe).
> - Temas Claro y Oscuro.
>
> **Chequeos automáticos del DOM:**
> - Contraste.
> - Etiquetas.
> - Objetivos táctiles.
> - Texto HTML y SVG.
> - Contención dentro de tarjetas.
> - Overflow.
> - `aria-controls`.
>
> **Pruebas funcionales:**
> - Conversión de unidades ida y vuelta.
> - Flechas del stepper.
> - Distribución Pₙ.
> - Columnas de la tabla.
>
> **Criterio:** un ítem está APROBADO solo si cumple en todos los contextos.
>
> No tengo acceso al repositorio: las afirmaciones sobre Vitest y el flujo de publicación **no se pudieron verificar** desde la UI.

---

## 0. Veredicto

**Estado: 🟡 SIN CAMBIOS RELEVANTES DESDE LA RONDA 5.** Ninguno de los 10 ítems del backlog R5 quedó cerrado por completo. Las mejoras de `IMPLEMENTACION_AUDITORIA.md` son reales, pero apuntan a otros puntos (sliders, Pₙ, flechas, foco). Además apareció **1 hallazgo nuevo** (R6-01).

| Métrica automática (objetivo 0) | Inicio | Transporte | Colas |
|---|---|---|---|
| Inputs sin nombre accesible | 0 ✅ | 0 ✅ | 0 ✅ |
| Contraste < AA (estado estable, claro y oscuro) | 0 ✅ | 0 ✅ | 0 ✅ |
| Contraste < AA **durante la carga en oscuro** | ❌ 12 | ❌ 25 | ❌ 14 (ver R6-01) |
| Objetivos < 24 px | 0 ✅ | **2** ❌ | 0 ✅ |
| Texto < 12 px / SVG < 9 px | 0 ✅ | 0 ✅ | 0 ✅ |
| Elementos fuera de su tarjeta / overflow de página | 0 ✅ | 0 ✅ | 0 ✅ |
| `aria-expanded` sin `aria-controls` | 0 ✅ | 0 ✅ | 0 ✅ |
| Header escritorio / móvil (objetivo ≤ 72 / ≤ 104 px) | **94 / 110** ❌ | 94 / 110 ❌ | 94 / 110 ❌ |

---

## 1. Verificación de lo declarado en `IMPLEMENTACION_AUDITORIA.md`

| Afirmación de Cursor | Resultado | Evidencia |
|---|---|---|
| Las escalas de los sliders de λ y μ se convierten con la unidad | ✅ Funciona | min: 1–40 · h: 60–2400 · s: 0,0167–0,667. Ida y vuelta min → s → h → s → min sin deriva (15 / 10 / 40 / 5). |
| Pₙ calcula estados hasta el 99 % o el límite de 60 y lo informa | ✅ | "suma mostrada ≈ 99,6 %. Se muestran estados hasta alcanzar el 99 %". 7 barras, todas con etiqueta. |
| Las flechas solo actúan sobre el panel con foco | ✅ | Flecha en un input de la matriz: el paso no cambia (9 → 9). Flecha con foco en "Anterior": 9 → 8. |
| Tab queda atrapado en el diálogo de preferencias y Escape lo cierra | ✅ (ya en v5) | — |
| «W (sistema)» y formato adaptativo | 🟡 | El título es correcto, pero el formato adaptativo **es la causa** de R5-01 (ver abajo). |
| Diagrama de colas adaptable | ✅ | Contenido en su tarjeta en todos los anchos. |
| Datos de penalizaciones de Vogel | ✅ | Fichas por fila y columna en cada paso. |
| Vitest en el flujo de publicación | ⚪ No verificable desde la UI | — |
| "Pendiente: Playwright/axe y capturas" | ❌ Sigue pendiente | — |

> Nota: el documento de Cursor dice "Última actualización: Ronda 3 estricta". Conviene actualizarlo para que siga la v5/v6 y no reabra ítems ya cerrados.

---

## 2. Estado del backlog R5

| ID | Estado | Evidencia R6 |
|---|---|---|
| **R5-01** (S1) Unidades mezcladas en las columnas | ❌ **SIN CAMBIOS** | Con Horas: encabezado "Wq (h)" y celdas "0,129 min · 0,016 min · **0,179 s** · **0,035 s**"; "W (h)" muestra "0,229 min…"; KPI "0,103 min". Con Minutos, la misma mezcla min/s en Wq. Solo Segundos es coherente. |
| **R5-02** (S2) Altura del header | ❌ | 94 px en escritorio y 110 px en móvil; logo apilado de 78 px. |
| **R5-03** (S2) "⋯ Más" cortado en móvil | ❌ | La barra tiene scroll horizontal (38 px en Colas, 54 px en Transporte) y "⋯ Más" queda fuera de la vista. |
| **R5-04** (S2) Stepper tapado en móvil | ❌ | Controles repartidos en **5 filas**; la sub‑nav sticky tapa "↺ Reiniciar", "Siguiente →" y "Ir a paso". Contenido útil: 273 px. |
| **R5-05** (S3) Summaries MODI < 24 px | ❌ | `summary` de 20 px y 19 px de alto. |
| **R5-06** (S3) Utilidades del header a la derecha | ❌ | ⚙ y tema siguen junto a la marca. |
| **R5-07** (S3) Alto del nav en móvil | ✅ | Los 3 `.nav-link` miden 44 px. |
| **R5-08** (S3) Range doble | ❌ | Dos tracks (top 1033 y 1072 px). |
| **R5-09** (S3) Nodos SVG truncados | ❌ | "Centro de Acopi…", "Reserva (fictic…". |
| **R5-10** (S3) Columna derecha de Colas | ✅ (vía sticky) | 282 px frente a 1317 px, pero `position: sticky`: acompaña al formulario. Se acepta. |

---

## 3. Backlog R6 (orden de ejecución)

### S1

**R5-01 (se mantiene) · Una columna, una unidad**
- Causa: el formateador adaptativo decide la unidad **por celda**. Debe decidirse **por columna**, o respetar la unidad elegida.
- Implementación sugerida:
  ```ts
  // unit: 's' | 'min' | 'h' elegido por el usuario; values en esa unidad
  function formatTimeColumn(values: (number|null)[], unit: TimeUnit) {
    return values.map(v => v == null ? '—' : formatSig(v, 3)); // 3 cifras significativas, sin sufijo
  }
  // encabezado: `Wq (${unit})`; si max(values) < 0.01 → `Wq (×10⁻³ ${unit})` y valores ×1000
  ```
- El KPI usa la unidad elegida. Si se prefiere el modo adaptativo, mostrar la etiqueta "auto" en el selector y que el encabezado refleje la subunidad de **toda** la columna.
- Aceptación: cada celda de Wq y W **no lleva sufijo** o lleva el mismo que el encabezado, en las 3 unidades; al elegir "Horas" cambia algo visible en la tabla y en el KPI.

### S2

**R6-01 (nuevo) · Destello del tema claro al cargar en modo oscuro (FOUC)**
- Evidencia: al cargar cualquier ruta con el tema Oscuro guardado, durante los primeros ~1–2 s el contraste medido baja a **1.03–1.41** en 12–25 elementos (texto claro sobre fondo claro), y luego se estabiliza en 0 incidencias.
- Causa: `index.html` no aplica `data-theme` antes del primer render (no hay script inline que lea `estudio-io-theme`).
- Cambio: script inline en el `<head>` **antes** del bundle:
  ```html
  <script>
    try {
      var t = localStorage.getItem('estudio-io-theme') || 'system';
      if (t === 'system') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
      document.documentElement.style.colorScheme = t;
    } catch (e) {}
  </script>
  ```
  Desactivar las transiciones de color durante la carga inicial (clase `.no-transitions` que se quita en `requestAnimationFrame`).
- Aceptación: medir el contraste a los 50 ms de la carga en oscuro da 0 incidencias; sin destello visible al recargar.

**R5-02 · Header.** Logo a 40 px en escritorio y 32 px en móvil; `.brand { align-items: center; padding-block: 8px }`. Aceptación: ≤ 72 px en escritorio y ≤ 104 px a 375 px.

**R5-03 · Barra de acciones en móvil.** Sin scroll horizontal. A < 640 px, visibles **Restablecer · Guardar · ⋯ Más** y "Ejemplos" dentro de "Más". Aceptación: `bar.scrollWidth === bar.clientWidth` y "⋯ Más" visible por completo.

**R5-04 · Stepper en móvil.**
- Una fila de iconos con `aria-label`: `◀ | n/N | ▶ | ⟲ | ▶︎ Reproducir`.
- Slider en una segunda fila.
- `scroll-margin-top` y `top` del stepper sticky = alto de la sub‑nav.
- Padding interno 0 a < 640 px.
- Aceptación: ≤ 2 filas de controles; ningún control queda bajo la sub‑nav; contenido ≥ 320 px.

**R6-02 (nuevo) · Valores sin formatear en los inputs al cambiar a Segundos**
- Evidencia: μ muestra **"0.16666666666666666"** en el input y en `aria-valuetext` ("0.16666666666666666 /s"); step del slider = 0.008333333333333333. Además el input usa punto decimal mientras el resto de la UI usa coma.
- Cambio: mostrar en el input `round(value, 4)` (el valor interno conserva la precisión completa); `aria-valuetext` con `Intl.NumberFormat('es-CO', { maximumSignificantDigits: 4 })`; step "redondo" por unidad (s: 0,001 · min: 0,5 · h: 30).
- Aceptación: ningún input ni `valuetext` muestra más de 4 decimales.

### S3

| ID | Cambio | Aceptación |
|---|---|---|
| R5-05 | `summary` de las iteraciones MODI con `padding-block: 8px` (≥ 32 px de alto). | 0 objetivos < 24 px. |
| R5-06 | Orden del header en escritorio: marca · nav · ⚙ · tema (utilidades al extremo derecho). | — |
| R5-08 | Range doble en un solo track con dos thumbs. | 1 track. |
| R5-09 | Ancho del nodo SVG según la etiqueta (máx. 170 px) o etiqueta en 2 líneas. | 0 nodos con "…" en escritorio. |
| R6-03 | Actualizar `IMPLEMENTACION_AUDITORIA.md` para que siga la v6 y marque los ítems cerrados. | El documento refleja la última ronda. |

---

## 4. Historial

| Ronda | S1 | S2 | S3 |
|---|---|---|---|
| v3 | 4 | 7 | 13 |
| v4 | 3 | 3 | 8 |
| v5 | 1 | 3 | 6 |
| **v6** | **1** | **5** (3 previos + 2 nuevos) | **5** |

## 5. Definición de terminado
Sin cambios respecto a la v5. Añadir:
- un test E2E que cargue `#/colas` con `localStorage['estudio-io-theme']='dark'` y mida el contraste a los 50 ms (R6-01);
- un test unitario que verifique que `formatTimeColumn` devuelve celdas sin sufijo de unidad mezclado (R5-01).
