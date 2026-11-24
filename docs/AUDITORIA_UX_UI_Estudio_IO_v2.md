# Auditoría UX/UI — Estudio IO · Ronda 2 (re-verificación)

> **Para Cursor:** segunda revisión tras aplicar `AUDITORIA_UX_UI_Estudio_IO.md`. Sección 1 = estado de cada ítem anterior. Sección 2 = **pendientes y regresiones nuevas** (lo que hay que implementar ahora), con ID `R2-xx`, prioridad, dónde, cambio y criterio de aceptación. No tocar algoritmos salvo R2-01.
> Verificado en escritorio (948 px y ~1720 px), móvil 375 px, temas Claro / Oscuro / Sistema.

---

## 1. Estado de la ronda 1

### ✅ Resuelto (buen trabajo)
| ID | Qué se verificó |
|---|---|
| G-01 | λ, μ y "W máx (s)" se muestran correctamente (sin `uppercase` que los altere). |
| G-02 / G-03 | Logo visible en oscuro; nodos de diagramas legibles en oscuro. |
| G-04 / G-05 | Tooltip Recharts nuevo: fondo claro, marcador de color por serie, legible en ambos temas. Serie "Servicio" visible en oscuro. |
| G-07 | Sub‑nav sticky con estado activo (ver R2-05: el scroll‑spy falla en un caso). |
| G-09 | Columna derecha sticky en Colas. |
| G-13 | Ciclo de tema Claro → Oscuro → Sistema. |
| T-01 | Guía "¿Qué resuelve este módulo?" colapsable y persistida (ver R2-03: layout roto en Transporte). |
| T-02 / P-02…P-04 | Barra de acciones: Restablecer, Cargar ejemplo, Guardar escenario, Exportar CSV, JSON, Copiar enlace, Imprimir. |
| T-03 | + / − Origen y Destino (probado 5×4). |
| T-04 | 0 inputs sin etiqueta en todo el módulo. |
| T-06 / T-07 | Matriz unificada (costos + oferta + demanda) con primera columna sticky y scroll horizontal contenido. |
| T-08 | Aviso de destino ficticio dentro de la tarjeta de balance. |
| T-10 | Etiquetas de valor sobre las barras (ver R2-06: eje Y truncado). |
| T-13 / T-14 / T-17 | Stepper Anterior / Reproducir / Siguiente, matriz parcial por paso, "Expandir todo". |
| C-01 | Hover en la tabla ya **no** cambia el estado global (Vista actual se mantiene). |
| C-04 / C-05 | Sliders sincronizados para λ, μ y rango de servidores. |
| C-06 | Selector de modelo (M/M/s activo). |
| C-08 | Tarjeta "Recomendado: s = 4 · $623,43/h · Cumple SLA". |
| C-09 / C-10 / C-11 / C-12 | Tabla única sin lista duplicada, `<abbr>` en encabezados, Pₙ en barras hasta ~99 %, línea de referencia en s*. |
| P-01 / P-05 | Persistencia en `localStorage` (transport, queue, prefs, intro) y panel ⚙ de preferencias. |
| Móvil | Ya no hay desbordamiento horizontal de página en las 3 rutas (`scrollWidth ≤ innerWidth`). |

### 🟡 Parcial
| ID | Falta |
|---|---|
| C-02 | Unidades declaradas, pero **siguen mezcladas**: Cs en $/servidor·**h** y Cw en $/entidad·**min**; W en s y λ/μ en min. No hay selector global de unidad. → R2-08 |
| P-05 | Panel ⚙ sin densidad, moneda/separador ni "mostrar guía"; no cierra con Esc; checkbox desalineado. → R2-04 |
| I-04 | "Hay un escenario guardado…" es texto, no acción, y con contraste insuficiente. → R2-02 |
| T-15 | MODI: verificar que cada iteración muestre uᵢ, vⱼ, δᵢⱼ y ciclo (no se visualizó en la tabla de iteraciones). |

### 🔴 Pendiente
| ID | Estado |
|---|---|
| G-06 | Header móvil sigue en **167 px** y el nav se parte en 3 filas. → R2-07 |
| G-11 | Textos de diagrama aún < 12 px. → R2-09 |
| I-01 | Hueco grande entre título y descripción en tarjetas de Inicio. → R2-12 |
| C-07 | Diagrama de flujo de colas sigue diminuto. → R2-09 |

---

## 2. Backlog ronda 2

### P0 — bugs
| ID | Dónde | Problema | Cambio | Criterio de aceptación |
|---|---|---|---|---|
| **R2-01** | Transporte › Métodos › Esquina Noroeste (y demás métodos) – matriz parcial del paso | La matriz parcial **no incluye la columna ficticia "Reserva (ficticio)"**. Los pasos 8 y 9 asignan 100 a Reserva desde Origen 4 y 5, pero esas filas aparecen todas en "—". | Construir la matriz parcial desde el problema **balanceado** (incluye fila/columna ficticia, estilada en gris/itálica). | En el paso 9/9 se ve Origen 4 → Reserva = 100 y Origen 5 → Reserva = 100; la suma de cada fila = oferta. |
| **R2-02** | Inicio › hero, `p` "Hay un escenario guardado…" | Color `rgb(70,86,111)` sobre azul marino ≈ contraste 1.6:1 (falla AA). Además no es accionable. | Texto en `rgba(255,255,255,.85)` y convertir en botones: **"Retomar Transporte"** / **"Retomar Colas"** (solo los que tengan escenario guardado). | Contraste ≥ 4.5:1; un clic lleva al módulo con el escenario cargado. |
| **R2-03** | Transporte › bloque guía colapsable | Layout roto: el toggle "Ocultar guía ▾" ocupa media tarjeta a la izquierda (vacía) y el contenido queda comprimido a la derecha. En Colas el mismo componente sí se ve bien como barra. | Usar el **mismo** `CollapsibleIntro` que Colas: toggle como cabecera de ancho completo arriba y contenido (texto + diagrama) debajo en 2 columnas. | Transporte y Colas muestran la guía con el mismo layout. |

### P1 — usabilidad y espacio
| ID | Dónde | Problema | Cambio | Criterio |
|---|---|---|---|---|
| **R2-04** | Header › panel ⚙ `.prefs-popover` | No cierra con **Esc** ni al hacer clic fuera; sin `role="dialog"`/título; checkbox "Animaciones" centrado y la etiqueta a la derecha (desalineado). Faltan opciones. | `role="dialog" aria-labelledby`, cierre con Esc y clic fuera, foco al abrir y devolver foco al botón al cerrar. Checkbox alineado a la izquierda junto a su label. Añadir: **Densidad** (cómoda/compacta), **Moneda** (COP/USD) y **Mostrar guía en módulos**. | Esc cierra; navegación completa con teclado; nuevas opciones aplican y persisten. |
| **R2-05** | Sub‑nav sticky (ambos módulos) | 1) Scroll‑spy marca **"Comparar"** cuando se está en "Métodos de solución". 2) La sub‑nav tapa el título de la sección al navegar (falta `scroll-margin-top`). | `IntersectionObserver` con `rootMargin` = −(alto header + alto sub‑nav) y umbral por título de sección; `scroll-margin-top: calc(var(--header-h) + var(--subnav-h) + 12px)` en cada sección. | Al hacer clic en cada pestaña, el título queda visible bajo la sub‑nav y la pestaña activa coincide. |
| **R2-06** | Transporte › Comparación de costos | El eje Y empieza en **$8,1k**: en un gráfico de barras exagera las diferencias (Costo mín. parece 4× menor que Noroeste y es 17 % menor). | Barras con eje desde **0** (`domain={[0,'auto']}`). Si se quiere resaltar diferencias, añadir modo alternativo "Diferencia vs óptimo (%)" en barras horizontales. | Altura de barras proporcional al valor. |
| **R2-07** | Header móvil `.topbar` (≤ 640 px) | 167 px de alto: "Teoría de colas" cae a una tercera fila, iconos ⚙ y tema flotan. | Fila 1: logo + "Estudio IO" + ⚙ + tema (solo iconos, 40×40). Fila 2: nav como segmented control de ancho completo con 3 segmentos iguales (o hamburguesa). Ocultar subtítulo. | Header ≤ 104 px (2 filas) o ≤ 64 px con hamburguesa en 375 px. |
| **R2-08** | Colas › unidades | Cs en $/h y Cw en $/min; W en s, λ/μ en min. | Selector global **Unidad de tiempo** (s / min / h) en la barra del módulo; todas las tasas, tiempos y costos se expresan en esa unidad (conversión interna). Encabezados de tabla con unidad: "W (min)", "CT ($/h)". | Cambiar a "h" actualiza etiquetas, sliders, tabla y KPIs coherentemente. |
| **R2-09** | Diagramas SVG: Noroeste (Transporte) y Flujo (Colas) | Siguen diminutos (~110 px de ancho el de Noroeste; textos ≈ 6–8 px efectivos). En Noroeste el stepper está aislado a la derecha con un gran vacío debajo. | Layout de Métodos: **fila 1** = stepper (Anterior · Reproducir · Paso n/N · Siguiente + slider) a ancho completo; **fila 2** = diagrama (60 %) + matriz parcial (40 %); **fila 3** = lista de pasos en 2 columnas o colapsada ("Ver todos los pasos"). SVG con `viewBox` y `width:100%`, texto ≥ 12 px. Flujo de colas a ancho completo de su tarjeta. | Texto de nodos legible sin zoom; sin bloques vacíos > 30 % del alto. |
| **R2-10** | Transporte › matriz unificada | 1) La columna **Oferta** apila dos inputs (oferta y costo reserva) **sin encabezado** para el segundo. 2) Los nombres de **destinos (H1…H4) no son editables**. 3) "− Origen/− Destino" solo quita el último. 4) Inputs de celda con fondo transparente: no se percibe que son editables. | 1) Columna propia **"Costo reserva"**. 2) Encabezados de destino editables (input inline). 3) Botón "×" en cada encabezado de fila/columna (con confirmación si tiene datos). 4) Borde visible en hover/focus y cursor de texto; foco con anillo. | Cada dato tiene su columna; se puede renombrar H1 y eliminar el Origen 2 directamente. |
| **R2-11** | Móvil › barras de acción y sub‑nav | Los 5–7 botones de acción se parten en filas desalineadas a la derecha; la sub‑nav de Colas pasa "Indicadores" a otra línea; en la matriz el nombre del origen se corta ("Laborator"). | ≤ 640 px: acciones primarias (Restablecer, Guardar) visibles + menú **"⋯ Más"** para el resto; sub‑nav con `overflow-x:auto; white-space:nowrap`; primera columna de la matriz `min-width: 120px` con `text-overflow: ellipsis` + `title`. Reducir alto de fila de la matriz (hoy ~88 px) a ~48 px. | Acciones en 1 fila; sub‑nav en 1 fila; nombres completos visibles o con tooltip. |

### P2 — pulido
| ID | Dónde | Cambio |
|---|---|---|
| R2-12 | Inicio › tarjetas de módulo | Eliminar el `min-height` del título; gap uniforme 12–16 px entre título, descripción y chips. |
| R2-13 | Footer | Los autores aparecen dos veces (chips + línea de texto). Dejar solo uno. |
| R2-14 | Nav activo | El enlace activo muestra anillo de foco teal de 3 px **más** sombra tras hacer clic. Usar `:focus-visible` (solo teclado) para el outline. |
| R2-15 | Colas › tabla | Encabezados W y Wq perdieron la unidad; columna SLA: añadir icono ✓/✗ junto al texto y color semántico. |
| R2-16 | Colas › rango de servidores | Dos sliders apilados con etiquetas pequeñas arriba: unificar en un **range slider doble** con los valores en los extremos. |
| R2-17 | Pₙ | Mostrar el % sobre cada barra y la P acumulada como línea opcional. |
| R2-18 | Heatmap de la matriz | Filas con todos los costos iguales (Origen 4/5 = 10) quedan como bloque oscuro uniforme; usar escala de color por percentiles y mostrar leyenda de la escala. |

---

## 3. Orden sugerido
1. **R2-01, R2-02, R2-03** (bugs visibles).
2. **R2-05, R2-06, R2-09, R2-10** (escritorio).
3. **R2-07, R2-11** (móvil).
4. **R2-04, R2-08** (preferencias/unidades).
5. P2.

Tras cada ítem: probar 375 px / 1366 px / 1920 px en Claro, Oscuro y Sistema, y repetir `document.documentElement.scrollWidth <= innerWidth` en las 3 rutas.
