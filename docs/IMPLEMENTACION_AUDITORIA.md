# Estado de implementación — Auditoría UX/UI

Auditoría final aprobada; R2-01…R2-05, N-01 y N-02 cerrados.

## Revisión de la ronda 7

- **R7-01:** Cw se convierte y etiqueta según segundos, minutos u horas; W máx se muestra con cuatro cifras significativas conservando el valor interno. En segundos los deslizadores admiten cualquier paso para evitar que el navegador redondee la posición a un valor diferente.
- **R7-02:** se redujo el padding anidado de Métodos en móvil y se ajustó la grilla de navegación. Pendiente medir los criterios de 320 y 375 px en un navegador.
- **R5-08 / R5-09:** el rango de servidores usa un carril con dos controles accesibles, y los nombres de nodos SVG se distribuyen en líneas sin puntos suspensivos. Pendiente verificar interacción táctil y etiquetas largas en las dimensiones de la auditoría.
- **R7-03:** los tiempos inferiores a 0,0001 se representan con cuatro cifras significativas en notación científica, conservando la unidad del encabezado y el valor de cálculo.
- Pendientes: suite Playwright/axe y capturas comparativas; las mediciones de la auditoría v7 describen la versión revisada en ese momento y no prueban estos últimos cambios.

## Revisión de la ronda 6

Se contrastó el informe R6 con el código vigente y se aplicaron los siguientes cambios, sujetos a la verificación visual integral indicada abajo:

- **R5-01:** W y Wq se muestran en la unidad del encabezado con hasta cuatro cifras significativas; el KPI W usa la unidad elegida. Comprobado en la aplicación al alternar entre minutos y horas.
- **R6-01:** el tema guardado o del sistema se aplica desde el `<head>`, antes de cargar React. Falta medir el contraste durante la carga en los dispositivos indicados.
- **R5-02 / R5-03 / R5-04 / R5-05 / R5-06:** ajustes de tamaño y orden del encabezado, opciones de ejemplos dentro de Más en móvil, controles compactos del paso a paso y tamaño mínimo de los desplegables MODI. Falta comprobar las medidas y el comportamiento en todas las resoluciones.
- **R6-02:** λ y μ se presentan con precisión reducida en los campos y textos accesibles, sin redondear el valor interno. El campo SLA aún puede mostrar más decimales al convertir unidades.
- Se completó el apellido de Jhon Dayron Jaramillo Laurens en el pie de página.

Siguen pendientes el control de rango doble en un solo carril, las etiquetas SVG extensas, la revisión de contraste inicial y las pruebas Playwright/axe y capturas en todos los contextos de R6. No se considera cerrado un criterio visual sin medirlo.

## Revisión posterior a la ronda 4

La ronda 4 es una fotografía anterior a varios cambios de Cursor: el código actual ya incluye el título «W (sistema)», formato adaptativo de tiempos, distribución adaptable del diagrama de colas, estilos para móvil y datos de penalizaciones de Vogel. Su presencia no sustituye una nueva comprobación visual en todos los tamaños y temas.

Correcciones adicionales aplicadas:

- Las escalas de los deslizadores de llegadas y servicio se convierten con la unidad elegida; sus límites se amplían si el dato introducido está fuera del rango inicial.
- El gráfico Pₙ calcula estados sucesivos hasta alcanzar el 99 % o un límite de 60. Si alcanza el límite primero, informa explícitamente de la probabilidad no graficada.
- Las flechas de los métodos de transporte actúan únicamente sobre el panel que tiene el foco, sin interferir con campos de entrada.
- El diálogo de preferencias mantiene la navegación Tab dentro de sus controles y conserva el cierre con Escape.
- El flujo de publicación ejecuta también las pruebas de Vitest.

Pendiente: repetir las pruebas visuales y de accesibilidad del backlog R4 en escritorio y móvil, en temas claro y oscuro. La existencia de reglas CSS no demuestra por sí sola que se cumplan todas las métricas. También quedan pendientes las pruebas automatizadas Playwright/axe y capturas comparativas.

El historial inicial corresponde a la **Ronda 3 estricta** (`docs/AUDITORIA_UX_UI_Estudio_IO_v3_estricta.md`); el estado más reciente figura arriba.

## Ronda 3 — avances principales

| ID | Estado |
|---|---|
| **R3-01 / R3-02** | Pasos con índices `i,j,qty`; `buildPartialMatrix`; Vogel/CM con etiquetas `→`; **Vitest** (3 tests OK). |
| **R3-03** | Contenedor flujo colas: `max-width:100%`, `overflow:hidden`. |
| **R3-04** | Selector de unidad en cabecera Colas; W máx y KPIs con `formatDuration`; Cw según unidad. |
| **R3-05** | Guía transporte: columnas con hueco ≥80 px y flechas acotadas. |
| **R3-06** | Scroll-spy por posición de sección (inicio = Datos). |
| **R3-07** | Header en 2 filas (marca+herramientas / nav). |
| **R3-08** | `aria-label` en inputs λ, μ, Cs, Cw, W máx, Pw máx. |
| **R3-09** | Chips `s=n`: color `var(--ink)`; activo legible en oscuro. |
| **R3-10 / R3-11** | × matriz 28px; InfoTip área ≥24px; `aria-controls` en menús/guía/prefs. |
| **R3-16 / R3-17** | MODI: tabla u/v alineada; θ y ciclo visibles. |
| **R3-18 / R3-20 / R3-21 / R3-22 / R3-23 / R3-24** | Parcial: tablas fijas, nowrap en rutas, heatmap neutro uniforme, Ejemplos▾ móvil, subnav sin scrollbar visible. |

## Pendiente explícito (v3)

- **R3-14**: tipografía SVG métodos ≥12 px, ancho completo.
- **R3-15**: range doble verdadero (un track, dos thumbs).
- **R3-19**: mini-tabla penalizaciones Vogel en pasos.
- **Playwright + axe** y snapshots (sección 3 del v3).
- Re-verificación manual métricas tabla §0 en los 6 contextos.

## Tests

```bash
npm test          # Vitest: matriz parcial 3 métodos
npm run build
node scripts/validate.mjs
```

## Historial

- Ronda 1: `AUDITORIA_UX_UI_Estudio_IO.md`
- Ronda 2: `AUDITORIA_UX_UI_Estudio_IO_v2.md`
