# Auditoría UX/UI — Estudio IO (Laboratorio local)

> **Para Cursor:** este documento es un backlog de mejoras ejecutable. Cada ítem tiene **ID**, **prioridad**, **dónde** (ruta + clase CSS/componente observado), **problema**, **cambio propuesto** y **criterio de aceptación**. Aplica por prioridad (P0 → P1 → P2). No cambies la lógica de cálculo (transporte/MODI, M/M/s) salvo donde se indique.
>
> Stack detectado: React + Vite (`localhost:5173`), router por hash (`#/`, `#/transporte`, `#/colas`), gráficos con **Recharts**, tema guardado en `localStorage["estudio-io-theme"]`.
> Revisado en: escritorio 948 px y ~1700 px, móvil 375 px, tema claro y oscuro.

---

## 0. Resumen ejecutivo

### Lo bueno ✅
- Identidad visual coherente (azul ITM, tipografía con buena jerarquía, tarjetas limpias, sombras suaves).
- Bloque **"Para empezar / ¿Qué resuelve este módulo?"** con diagrama: excelente onboarding pedagógico.
- **Skeleton de carga** en módulos lazy: buena percepción de rendimiento.
- Transporte: **balance oferta ↔ demanda** visual, **mapa de calor** de costos con asignación MODI, gráfico comparativo con el óptimo resaltado en verde, tabla "vs. óptimo" en %.
- Paso a paso de **Esquina Noroeste** interactivo (hover/selección resalta rutas) e iteraciones MODI con etiquetas de variable entrante y θ.
- Colas: **KPIs arriba** (s*, W, Pw, SLA), tabla comparativa por `s` con fila inestable marcada, s* destacado, metas SLA parametrizables.
- Botón **"Restablecer ejemplo base"** en cada módulo, **"Copiar tabla al portapapeles"**, tooltips de ayuda (`info-tip`), modo oscuro disponible.
- Los inputs de la matriz de costos sí tienen `aria-label` ("Costo Laboratorio A a H1") y los acordeones usan `aria-expanded`.

### Lo malo ❌ (top 10)
1. **Bug de etiquetas griegas**: `text-transform: uppercase` convierte **μ → "M"** y **λ → "Λ"**; y **"(s)" segundos → "(S)"**, que se confunde con *s = servidores*.
2. **Modo oscuro roto en diagramas**: nodos SVG con fondo claro y texto casi blanco (ilegibles); logo ITM invisible; serie "servicio" y su leyenda invisibles en el gráfico.
3. **Tooltip de Recharts** ilegible en claro: texto azul marino/morado sobre fondo azul oscuro.
4. **El hover cambia el estado global** en Colas: pasar el cursor por una fila/tarjeta cambia "Intensidad del sistema · s" y el diagrama de flujo, quedando inconsistente con los KPIs (s = 4 vs s = 5).
5. **Desbordamiento horizontal en móvil** (Transporte: 520 px en viewport de 375) por `.info-tip-panel` y `.matrix-table`.
6. **Espacio desperdiciado**: en ambos módulos la columna derecha (matriz / recomendación) es mucho más corta que la izquierda (formularios) → gran bloque vacío.
7. **Sub‑navegación** (Datos / Comparar / Métodos; Parámetros / Costos / Indicadores) no es sticky ni marca la sección activa.
8. **Sin parametrización de dimensión**: Transporte está fijo en 3×4 (no se pueden agregar/quitar orígenes o destinos). No hay persistencia de escenarios ni exportación.
9. **Scroll anidado** (lista de pasos Noroeste, lista "Indicadores por configuración") con scrollbar blanca nativa; duplica información de la tabla.
10. **Distribución Pₙ** (discreta) se dibuja como línea suavizada; debería ser barras.

---

## 1. Global (layout, header, tema, sistema de diseño)

| ID | Prio | Dónde | Problema | Cambio propuesto | Criterio de aceptación |
|---|---|---|---|---|---|
| G-01 | P0 | Todas las etiquetas de campo (`.arch-field-label`, etiquetas en mayúsculas) | `text-transform: uppercase` altera símbolos: μ→M, λ→Λ, "s"→"S". | Quitar `uppercase` de etiquetas que contengan símbolos/unidades. Opción: envolver el símbolo en `<span class="sym">` con `text-transform:none` o usar `font-variant: small-caps` solo en el texto. | Se lee "λ", "μ", "W máx (s)", "Pw máx (%)" exactamente. |
| G-02 | P0 | Header `.topbar .brand` en tema oscuro | Logo ITM (azul oscuro) invisible sobre fondo oscuro. | Usar versión blanca/monocroma del logo en dark (`<picture>` o `filter: brightness(0) invert(1)` en `[data-theme=dark] .brand img`). | Logo visible con contraste ≥ 3:1 en ambos temas. |
| G-03 | P0 | Diagramas SVG `.flow-node` (Inicio de Transporte y Colas, flujo de colas, Noroeste) | En dark: fondo de nodo claro + texto claro = ilegible. | Definir tokens `--node-bg`, `--node-border`, `--node-text` y redefinirlos en dark; el SVG debe usar `fill: var(--node-bg)` y `fill: var(--node-text)` para `<text>`. | Todos los nodos legibles (contraste texto ≥ 4.5:1) en claro y oscuro. |
| G-04 | P0 | Tooltip Recharts (`.recharts-default-tooltip`) | Fondo azul oscuro con textos de serie en colores oscuros → ilegible. | Crear `<ChartTooltip />` personalizado compartido: fondo `var(--surface)`, borde, texto `var(--text)`, y un punto de color por serie (el color va en el marcador, no en el texto). | Tooltip legible en ambos temas; mismo componente en todos los gráficos. |
| G-05 | P1 | Paleta de series de gráficos | "servicio" usa azul marino casi igual al fondo oscuro; leyenda invisible. | Tokens `--chart-1..--chart-5` con variantes dark; validar contraste ≥ 3:1 contra el fondo de la tarjeta. | Las 3 series de costos distinguibles en ambos temas (y no solo por color: usar estilo de línea distinto + marcador). |
| G-06 | P1 | Header en móvil (≤ 480 px) | Ocupa ~190 px: el subtítulo hace 2 líneas, el nav se parte en 2 filas y el botón de tema flota. | En ≤ 640 px: ocultar subtítulo, logo más pequeño, nav como **segmented control** horizontal con scroll o menú hamburguesa; botón de tema solo icono. | Header ≤ 64 px de alto en 375 px. |
| G-07 | P1 | Sub‑nav `.page-subnav-link` | No es sticky ni indica la sección activa; se pierde al hacer scroll. | Hacerla `position: sticky; top: <alto header>` y usar `IntersectionObserver` para marcar activa (`aria-current="true"`). Scroll suave con `scroll-margin-top`. | Al hacer scroll, la sub‑nav permanece visible y resalta la sección actual. |
| G-08 | P1 | Contenedor principal | En pantallas anchas (≥ 1600 px) el contenido queda en una columna central estrecha (~1150 px) con mucho vacío lateral. | `max-width` configurable: 1200 px por defecto, opción "ancho completo" (ver P-05). En ≥ 1440 px permitir layout de 3 columnas en Colas (Parámetros | Recomendación | KPIs/Gráfico). | Mejor uso del ancho sin romper legibilidad. |
| G-09 | P1 | Grids de 2 columnas (Datos/Demandas; Parámetros/Recomendación) | Columna derecha corta → bloque vacío grande. | Hacer la columna derecha **sticky** (`align-self: start; position: sticky; top: …`) para que acompañe el scroll del formulario, o redistribuir contenido (mover gráfico/KPIs a la derecha). | No queda un rectángulo vacío > 30 % del alto de la tarjeta. |
| G-10 | P2 | Scrollbars internas | Scrollbar nativa blanca en dark dentro de listas. | `scrollbar-color` y `::-webkit-scrollbar` con tokens del tema, o eliminar el scroll anidado (ver T-08, C-07). | Sin scrollbars blancas en dark. |
| G-11 | P2 | Tipografía | 9 tamaños distintos (11, 11.52, 12, 14, 16, 17.6, 21.6, 24, 28.44 px). Textos de 11 px en diagramas/ayudas. | Escala tipográfica de 6 pasos en tokens (`--fs-xs 12`, `sm 14`, `base 16`, `lg 20`, `xl 24`, `2xl 30`). Mínimo 12 px. | Solo tokens de la escala; nada < 12 px. |
| G-12 | P2 | Footer | Chips de autores repetidos en cada página consumen alto. | Mantener en Inicio; en módulos, footer de una línea compacta. | Footer ≤ 48 px en módulos. |
| G-13 | P2 | Tema | Solo claro/oscuro manual. | Opción "Sistema" (`prefers-color-scheme`) además de claro/oscuro. | Respeta el tema del SO por defecto. |

---

## 2. Módulo Inicio (`#/`)

| ID | Prio | Problema | Cambio propuesto | Criterio |
|---|---|---|---|---|
| I-01 | P1 | Tarjetas de módulo: hueco grande entre título y descripción (alto fijo del título). | Quitar `min-height` del título o usar `gap` consistente (16 px). | Espaciado uniforme título → descripción. |
| I-02 | P1 | Imágenes de tarjeta muy altas; el CTA queda bajo el pliegue en 948×583. | Imagen con `aspect-ratio: 16/7` y `object-fit: cover`; o imagen lateral en desktop. | Ambos CTA "Abrir módulo" visibles sin scroll en 1366×768. |
| I-03 | P2 | Hero ocupa casi todo el primer viewport; la foto del hero no aporta información. | Reducir padding del hero ~30 %; opcional: reemplazar foto por mini‑preview real de la app (captura de un gráfico). | Hero ≤ 55 % del alto del viewport. |
| I-04 | P2 | No hay acceso rápido a "continuar donde lo dejé". | Si existe escenario guardado (ver P-02), mostrar "Retomar último escenario". | — |
| I-05 | P2 | Bullets de las tarjetas pequeños y grises. | Convertirlos en chips/etiquetas con icono. | — |

---

## 3. Módulo Transporte (`#/transporte`)

### 3.1 Encabezado y "Para empezar"
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| T-01 | P1 | El bloque "¿Qué resuelve este módulo?" ocupa ~300 px cada vez que se entra. | Hacerlo **colapsable** y recordar el estado (`localStorage`, con try/catch). Por defecto abierto solo la primera visita. | Tras cerrarlo, no reaparece expandido. |
| T-02 | P2 | "Restablecer ejemplo base" está suelto encima de la sub‑nav. | Agrupar en una **barra de acciones** del módulo: Restablecer · Cargar ejemplo ▾ · Guardar · Exportar · Compartir. | Acciones en una sola fila alineada a la derecha del título. |

### 3.2 Datos del problema / Demandas y costos
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| T-03 | P0 | Dimensión fija 3 orígenes × 4 destinos. | Botones **"+ Origen"**, **"+ Destino"** y "×" para eliminar (mín. 1×1, máx. sugerido 10×10). Recalcular todo reactivamente. | Se puede crear un problema 2×2 y uno 5×6 sin errores. |
| T-04 | P0 | Inputs de nombre/oferta/costo reserva de cada origen **sin `<label>` asociado** (accesibilidad). | Asociar `<label htmlFor>` o `aria-label` ("Oferta Laboratorio A"). | axe/Lighthouse sin errores "Form elements must have labels". |
| T-05 | P1 | Cada origen es una tarjeta alta (~170 px): nombre + barra + oferta + costo reserva → mucho scroll. | **Vista compacta tipo tabla** editable: fila por origen (Nombre · Oferta · Costo reserva · % barra inline). Toggle "Tarjetas / Tabla". | Los 3 orígenes caben en ≤ 220 px de alto en modo tabla. |
| T-06 | P1 | Oferta/costos se editan en un sitio y la demanda en otro (matriz derecha). | Unificar en **una sola matriz editable** estilo hoja de cálculo: filas = orígenes (con columna Oferta al final), columnas = destinos (con fila Demanda al final). Mantener mapa de calor. Navegación con Tab/Enter/flechas. | Todo el problema se edita en una sola tabla. |
| T-07 | P1 | Matriz en móvil: desborda (468 px) y primera columna no fija. | `overflow-x:auto` en un wrapper propio + `position: sticky; left:0` en la primera columna; o transponer a vista por origen en ≤ 480 px. | `document.documentElement.scrollWidth === innerWidth` en 375 px. |
| T-08 | P2 | Mensaje "Destino ficticio 'Reserva (ficticio)' con demanda 300" aparece al final de la columna, lejos del balance. | Mostrarlo **dentro** de la tarjeta "Balance oferta ↔ demanda" junto al badge Δ +300. | El aviso de balanceo está junto al indicador Δ. |
| T-09 | P2 | Validación: solo un texto genérico "Las demandas deben ser positivas…". | Validación inline por celda (borde rojo + mensaje), deshabilitar cálculo si hay errores y resumen de errores arriba. | Ingresar `-5` marca la celda específica. |

### 3.3 Comparación de costos
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| T-10 | P1 | El eje Y empieza en 0 → diferencias entre métodos poco visibles; sin etiquetas de valor. | Etiquetas de valor sobre cada barra (`LabelList`) y diferencia vs. óptimo ("+48,6 %"). | Se leen Z y % sin hover. |
| T-11 | P2 | Gráfico y tabla dicen lo mismo, apilados verticalmente. | En ≥ 1024 px poner gráfico y tabla **lado a lado**. | Sección ≤ 60 % del alto actual. |

### 3.4 Métodos (Noroeste, Costo Mínimo, Vogel, MODI)
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| T-12 | P0 | Diagrama Noroeste: nombres truncados ("Laboratorio…"), nodo H4 cortado, rutas no visibles en estado inicial y etiqueta "800" flotante. | SVG con `viewBox` calculado según nº de nodos, texto con `<title>` para nombre completo, altura dinámica; dibujar rutas acumuladas hasta el paso seleccionado. | Todos los nodos completos y visibles; ruta del paso activo resaltada. |
| T-13 | P1 | Lista de pasos con scroll interno (scroll anidado, scrollbar blanca). | Quitar altura fija; usar **stepper** con botones ◀ Paso anterior / Siguiente ▶ / ▶ Reproducir y slider de pasos; teclado ←/→. | Sin scroll anidado; se navega por pasos con teclado. |
| T-14 | P1 | Mostrar la **matriz de asignación del paso actual** (no solo el diagrama). | Mini‑tabla del estado tras el paso N (asignaciones, ofertas/demandas restantes tachadas). | Ver matriz en cada paso. |
| T-15 | P1 | MODI: iteraciones solo como texto; no se ven u/v ni costos reducidos. | Al expandir una iteración: tabla con uᵢ, vⱼ, δᵢⱼ por celda (resaltar la entrante) y el ciclo de ajuste dibujado. | Cada iteración muestra u, v, δ y ciclo. |
| T-16 | P2 | Tabla de asignación final: ceros por todas partes + badge "asignado" repetido. | Mostrar "—" o vacío en 0; resaltar celda asignada con fondo en lugar de badge; fila/columna de totales. | Tabla escaneable de un vistazo. |
| T-17 | P2 | Acordeones: Noroeste y MODI abiertos, Costo Mín. y Vogel cerrados (inconsistente). | Todos cerrados excepto el seleccionado; opción "Expandir todo". Añadir `aria-controls`. | Comportamiento consistente. |
| T-18 | P2 | Costo Mínimo y Vogel sin el mismo detalle (verificar). | Mismo patrón de stepper para los 3 métodos iniciales; en Vogel mostrar penalizaciones por fila/columna. | Los 3 métodos tienen paso a paso equivalente. |

---

## 4. Módulo Teoría de colas (`#/colas`)

### 4.1 KPIs y parámetros
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| C-01 | P0 | **Hover cambia el estado global**: al pasar el cursor por filas/tarjetas cambia "Intensidad del sistema · s" y el diagrama (s = 5) mientras KPIs dicen s = 4. | Separar `hoveredS` (solo resalta visualmente) de `selectedS` (cambia con clic o chips `s=…`). El panel "Intensidad" y el flujo usan `selectedS`. | Mover el mouse no cambia ningún valor; solo el clic. |
| C-02 | P0 | Unidades mezcladas: λ, μ en /min; W en **s**; Cs/Cw ¿por hora o por min?; "$300,00/h equivalente". | Selector global de **unidad de tiempo** (s / min / h) y mostrar unidades en cada etiqueta: "λ (llegadas/min)", "Cs ($/servidor·h)". Convertir internamente a una base. | Todas las magnitudes con unidad visible y coherente. |
| C-03 | P1 | KPI "s* económico" y "SLA" no indican a qué `s` se refieren cuando el usuario explora otra. | KPI con subtítulo "para s = X" y estado comparativo (s seleccionado vs s*). | Siempre claro a qué configuración refiere cada KPI. |
| C-04 | P1 | Tasas como inputs numéricos puros. | Input + **slider** sincronizado para λ, μ, Cs, Cw; validación ρ < 1 con aviso en vivo. | Se puede explorar arrastrando. |
| C-05 | P1 | Rango s mín/máx en inputs y chips `s=1…5` duplican función. | Un **range slider doble** (s mín–máx) + chips para seleccionar. Límite máx configurable (p.ej. 1–20). | — |
| C-06 | P2 | Solo modelo M/M/s. | Preparar selector de modelo (M/M/1, M/M/s, M/M/s/K, M/M/1/K) — al menos estructura UI. | — |

### 4.2 Recomendación & flujo
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| C-07 | P1 | Diagrama de flujo diminuto (texto ~8 px tras escalar), mucho vacío alrededor. | SVG responsivo a ancho completo de la tarjeta, texto ≥ 12 px, animación opcional de llegadas. Mover KPIs/recomendación al lado. | Texto del diagrama legible sin zoom. |
| C-08 | P2 | Recomendación es texto plano. | Tarjeta de decisión: "Recomendado: s = 4 · $623,43/h · Cumple SLA" + "Alternativa: s = 5 (+$29/h, Pw 2 %)". | — |

### 4.3 Gráficos e indicadores
| ID | Prio | Problema | Cambio | Criterio |
|---|---|---|---|---|
| C-09 | P1 | "Indicadores por configuración": lista de tarjetas con scroll interno **+** tabla con los mismos datos. | Eliminar la lista; dejar solo la tabla con fila s* resaltada, fila seleccionada y columna SLA con iconos ✓/✗ con texto accesible. | Sin duplicación ni scroll anidado. |
| C-10 | P1 | Tabla: encabezados crípticos (P0, Lq, L, Wq). | `<abbr title>` / tooltip con la definición; opción de mostrar/ocultar columnas. | Hover en "Lq" explica "Longitud media de la cola". |
| C-11 | P1 | Distribución Pₙ (discreta) como línea suavizada y cortada en n=6. | `BarChart`; n máximo configurable o hasta P acumulada ≥ 99 %; línea de P acumulada opcional. | Barras por n; suma visible. |
| C-12 | P2 | Gráfico de costos: no marca s* ni la meta. | `ReferenceLine` vertical en s* y `ReferenceDot` en el mínimo; zona sombreada de configuraciones que no cumplen SLA. | s* visible en el gráfico. |
| C-13 | P2 | Encabezado "Indicadores por configuración" desalineado (padding distinto al resto de tarjetas). | Unificar padding de `card` (24 px). | Alineado con las demás secciones. |

---

## 5. Parametrización y personalización (transversal)

| ID | Prio | Funcionalidad | Detalle |
|---|---|---|---|
| P-01 | P0 | **Persistencia del escenario** | Hoy solo se guarda el tema. Guardar datos de cada módulo en `localStorage` (con try/catch y versión de esquema). Al recargar no se pierde nada. |
| P-02 | P1 | **Escenarios guardados** | Guardar/renombrar/duplicar/eliminar escenarios ("Vacunas 3×4", "Call center"). Selector en la barra de acciones. |
| P-03 | P1 | **Compartir por URL** | Serializar el escenario (comprimido, p.ej. `lz-string`) en el hash: `#/transporte?d=…`. Botón "Copiar enlace". |
| P-04 | P1 | **Importar/Exportar** | Importar CSV/JSON de matriz de costos; exportar resultados a CSV/XLSX y "Imprimir/PDF" con hoja de estilos `@media print`. |
| P-05 | P2 | **Preferencias de vista** | Panel ⚙️: densidad (cómoda/compacta), decimales (0–4), separador decimal/moneda (COP, USD), ancho de contenido (normal/completo), mostrar/ocultar bloque "Para empezar", animaciones on/off (respetar `prefers-reduced-motion`). |
| P-06 | P2 | **Ejemplos precargados** | Menú "Cargar ejemplo" con 3–4 casos (balanceado, desbalanceado por oferta, por demanda, degenerado). |

---

## 6. Responsive (breakpoints propuestos)

- **≤ 480 px**: header compacto (G-06); todas las grillas a 1 columna; matriz con primera columna sticky o vista transpuesta (T-07); sub‑nav sticky con scroll horizontal; botones a ancho completo; info‑tips como bottom‑sheet en vez de popover (hoy `.info-tip-panel` desborda a 520 px).
- **481–1023 px**: 1 columna para formulario + resultados; gráficos a ancho completo.
- **≥ 1024 px**: 2 columnas con columna de resultados sticky (G-09).
- **≥ 1440 px**: 3 columnas opcionales en Colas; gráfico + tabla lado a lado en Transporte (T-11).
- Prueba obligatoria: en 375 px `document.documentElement.scrollWidth <= window.innerWidth` en las 3 rutas.
- Áreas táctiles ≥ 44×44 px (chips `s=…`, "?" de ayuda, botones de acordeón).

---

## 7. Accesibilidad

- [ ] Labels asociados en todos los inputs (T-04).
- [ ] Sub‑nav con `aria-current`; acordeones con `aria-controls`.
- [ ] Botones "?" de ayuda con `aria-label` descriptivo y tooltip accesible por teclado (focus + Esc para cerrar).
- [ ] Estados no transmitidos solo por color (SLA ✓/✗ con texto, series de gráfico con estilos de línea distintos).
- [ ] Contraste AA en ambos temas (texto ≥ 4.5:1, elementos gráficos ≥ 3:1).
- [ ] Foco visible (`:focus-visible`) consistente.
- [ ] Gráficos con resumen textual (`aria-label`/`<figcaption>`) y tabla equivalente.
- [ ] `prefers-reduced-motion` para animaciones de pasos/flujo.

---

## 8. Plan de ejecución sugerido para Cursor

1. **Sprint 1 – P0 (bugs visibles):** G-01, G-02, G-03, G-04, C-01, C-02, T-03, T-04, T-12, P-01, desbordamiento móvil (T-07 + `.info-tip-panel`).
2. **Sprint 2 – P1 (uso del espacio y flujo):** G-05…G-09, T-01, T-05, T-06, T-10, T-13…T-15, C-03…C-05, C-07, C-09…C-11, P-02…P-04.
3. **Sprint 3 – P2 (pulido y personalización):** resto de ítems P2 y panel de preferencias P-05/P-06.

**Reglas para Cursor al implementar**
- Centralizar colores, espaciados y tamaños en tokens CSS (`:root` + `[data-theme="dark"]`); prohibido hex suelto en componentes y en SVG.
- Crear componentes compartidos: `ChartTooltip`, `StatCard`, `Stepper`, `EditableMatrix`, `ActionBar`, `CollapsibleIntro`.
- No modificar los algoritmos; solo la capa de presentación y estado (salvo C-01 y C-02).
- Tras cada ítem, verificar en 375 px, 1366 px y 1920 px, en tema claro y oscuro.
