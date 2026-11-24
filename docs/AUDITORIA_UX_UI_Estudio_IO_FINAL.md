# Auditoría UX/UI definitiva — Estudio IO

**Fecha:** 24-nov-2026 · **Alcance:** las 3 rutas (`#/`, `#/transporte`, `#/colas`), todos los botones, enlaces, ejemplos, menús, preferencias y ayudas, en **10 resoluciones** y **2 temas**.
**Para Cursor:** el backlog accionable está en la **sección 5**. Lo demás es evidencia.

---

## 1. Método

| Qué | Cómo |
|---|---|
| Inventario | Se listaron todos los controles visibles: 11 en Inicio, 112 en Transporte (con métodos abiertos) y 63 en Colas. |
| Prueba funcional | Se hizo clic en cada control y se verificó su efecto en el DOM. Las descargas, el portapapeles, la impresión y los diálogos nativos se interceptaron para no descargar ni imprimir nada real. |
| Cálculos | Transporte: el óptimo de los 3 ejemplos se comparó con programación lineal (`scipy.linprog`). Colas: P0, Pw, Lq, L, Wq, W y CT se recalcularon en Python para los 3 ejemplos. |
| Resoluciones | **PC:** 1920, 1440, 1280, 1024. **Tablet:** 768. **Móvil:** 414, 390, 375, 360, 320. Cada una en iframe de ancho fijo. |
| Métricas automáticas | Contraste WCAG AA, texto < 12 px, objetivos < 24 px, texto SVG < 9 px, elementos fuera de su tarjeta, controles recortados y overflow horizontal. |
| Temas | Claro y Oscuro, con el diálogo de Referencias y las ayudas abiertos. |
| Estado | El `localStorage` del usuario se respaldó antes de empezar y se **restauró** al final. Quedan sin rastros de prueba (el escenario "Prueba auditoría" se eliminó). |

---

## 2. Veredicto

**🟡 Apto con correcciones.** Los cálculos son **100 % correctos** y la accesibilidad automática está en **0 incidencias** desde 360 px en adelante. Quedan **2 fallos funcionales**, **3 de layout** y varios de pulido.

| Severidad | Cantidad |
|---|---|
| S1 — función rota o dato engañoso | **3** |
| S2 — accesibilidad o responsive | **6** |
| S3 — pulido | **9** |

---

## 3. Resultado de las pruebas funcionales

### 3.1 Global (header, navegación y diálogos)

| Control | Resultado |
|---|---|
| Nav Inicio / Transporte / Teoría de colas | ✅ Navega, `aria-current="page"` correcto. |
| Referencias (diálogo) | ✅ `role="dialog"`, `aria-modal`, foco dentro, cierra con Esc, devuelve el foco. 7 fuentes. ⚠️ Ver R-08 y R-09. |
| Preferencias ⚙ | ✅ Diálogo, Esc y foco correctos. Opciones: ✅ Ancho, ✅ Densidad, ✅ Decimales, ✅ Mostrar guía, ✅ Unidad de tiempo, ⚠️ Moneda (R-11), ❌ **Vista orígenes** (R-03). |
| Tema (Claro → Oscuro → Sistema) | ✅ Sin destello al cargar. 0 fallos de contraste en oscuro. |
| Ayudas "i" (50 en total: 1 + 18 + 31) | ✅ 50/50 abren con contenido, cierran con Esc y ninguna sale de la pantalla a 948 px. |
| Inicio: Retomar Transporte / Retomar Colas / Abrir módulo ×2 | ✅ Navegan. ⚠️ "Retomar" y "Abrir módulo" hacen lo mismo (R-14). |
| Ruta inexistente (`#/no-existe`) | ⚠️ Muestra Inicio sin aviso (R-16). |

### 3.2 Transporte

| Control | Resultado |
|---|---|
| Cargar ejemplo: Base vacunas 3×4 / Desbalance por oferta / Desbalance por demanda | ✅ Cargan y el menú se cierra. Z óptimo **8.750 / 9.100 / 8.850**, idéntico al de `linprog`. |
| Restablecer | ✅ Vuelve a 3×4 (Z = 8.750). |
| Guardar escenario | ❌ **R-01**: guarda en `localStorage`, pero **no hay forma de abrir el escenario guardado**. Además usa `window.prompt` nativo. |
| Exportar CSV | ✅ `transporte.csv` (`text/csv`) con encabezados, filas, oferta, costo de reserva y demanda. |
| JSON | ✅ `transporte.json` válido (originNames, destNames, costs, supply, demand, storageCosts). ⚠️ No existe la acción inversa de importar. |
| Copiar enlace | ✅ Al abrir el enlace en una pestaña nueva se restaura el estado (costo editado 7 → Z = 9.250 reproducido). ⚠️ Sin confirmación visual (R-10). |
| Imprimir | ✅ Llama a `window.print()`. |
| + Origen / + Destino / − Origen / − Destino | ✅ Límites: mínimo 1×1 (botón "−" deshabilitado), máximo 10 orígenes. ⚠️ "+" no se deshabilita al llegar al máximo (R-17). |
| Renombrar destino (input del encabezado) | ✅ Se refleja en los métodos. |
| × Eliminar origen / destino | ✅ Funciona con `confirm` nativo. ❌ **R-02**: la × de los orígenes queda **recortada e invisible** en todas las resoluciones. |
| Sub‑nav Datos / Comparar / Análisis / Métodos | ✅ Lleva a cada sección y marca la activa. |
| Ocultar / Mostrar guía | ✅ Cambia el texto y `aria-expanded`. |
| Expandir todo / Solo uno abierto | ✅ Funciona. ⚠️ Etiqueta confusa (R-15). |
| Stepper (×3 métodos): ← · → · ↺ · ▶ / Pausa · slider · tarjetas | ✅ "←" deshabilitado en el paso 1. Reproduce a ~1 paso/s. La pausa detiene. Las tarjetas saltan al paso. "Ocultar lista" muestra "Ver todos los pasos (7)". ⚠️ El slider es 0‑based sin `aria-valuetext` (R-06). |
| MODI: iteraciones (`details`) | ✅ Abren y cierran. θ y ciclo visibles. |
| Copiar asignación | ✅ Copia una tabla TSV correcta. ⚠️ Sin confirmación (R-10). |
| Consola | ❌ **R-05**: error de React "Cannot update a component while rendering a different component" al usar el paso a paso. |

### 3.3 Teoría de colas

| Control | Resultado |
|---|---|
| Ejemplos: API de imágenes λ=15 / Campaña λ=20 / Servidor potente μ=30 | ✅ Cargan. s* = 4 / 5 / 1 y CT coinciden con el cálculo en Python. ⚠️ El texto de "Servidor potente" es incoherente (R-04). |
| Restablecer | ✅ λ = 15, μ = 10, s* = 4, W = 0,103 min, "Cumple". |
| Guardar escenario | ❌ Mismo problema que R-01 (`prompt` nativo y sin opción de cargar). |
| Copiar enlace / Imprimir | ✅ El enlace lleva `?d=` con el estado; `print()` se llama. ⚠️ No hay Exportar CSV/JSON, a diferencia de Transporte (R-12). |
| Chips s = 1…5 | ✅ Cambian la "Vista actual". ⚠️ Sin `aria-pressed` (R-07). |
| Sliders λ y μ, rango s mín./máx., unidad (s/min/h) y modelo | ✅ Convierten sin deriva; s mín. > s máx. se corrige solo. |
| Validación (λ = −5, λ = 0, μ = 0, Cs = −10, Pw = 150 %) | ⚠️ Mensaje genérico "Revisa los datos…" **sin `aria-invalid` ni mensaje en el campo** (R-07). |
| Sistema inestable (λ = 100) | ✅ "Qué conviene" lo explica; los KPIs se ocultan. |
| Cálculos M/M/s (λ=15 μ=10; λ=20 μ=10; λ=15 μ=30) | ✅ P0, Pw, Lq, L, Wq, W y CT coinciden a 4 decimales con Python. |

---

## 4. Matriz de resoluciones (tema claro)

Columnas: **Ovf** = overflow horizontal de la página (px) · **Hdr** = alto del header (px) · **Ancho** = ancho del contenido (px) · **A11y** = contraste, texto < 12 px y objetivos < 24 px · **SVG** = textos SVG < 9 px · **Recortes** = controles recortados.

| Ancho | Ruta | Ovf | Hdr | Ancho | A11y | SVG | Recortes |
|---|---|---|---|---|---|---|---|
| 1920 / 1440 / 1280 | todas | 0 | 56 | 1140 | 0 | 0 | Transporte: **× eliminar origen** (R-02) |
| 1024 | todas | 0 | 56 | 982 | 0 | 0 | Transporte: R-02 |
| **768** | Transporte | 0 | 86 | 726 | 0 | **7** ❌ | R-02. Diagrama de métodos con texto de ~7 px (R-13) |
| 768 | Inicio / Colas | 0 | 86 | 726 | 0 | 0 | — |
| 414 / 390 / 375 | todas | 0 | 99 | 372 / 348 / 333 | 0 | 0 | R-02. Sub‑nav con pestañas fuera de vista sin indicador (R-18) |
| 360 | todas | 0 | 99 | 318 | 0 | 0 | ídem |
| **320** | **todas** | **31** ❌ | 101 | 278 | 0 | 0 | **Botón de tema fuera de pantalla**; aparece scroll horizontal (R-03b) |

En Oscuro (948 px) hay 0 incidencias en las 3 rutas, en el diálogo de Referencias y en las ayudas.

---

## 5. Backlog definitivo para Cursor

### S1 — Funcionalidad rota o dato engañoso

**R-01 · Los escenarios guardados no se pueden abrir (Transporte y Colas)**
- **Evidencia:** "Guardar escenario" escribe en `estudio-io-book-transport`, pero el escenario no aparece en "Cargar ejemplo" ni en ningún otro sitio de la UI.
- **Cambio:**
  1. Reemplazar `window.prompt` por un diálogo propio con campo de nombre.
  2. Añadir la sección **"Mis escenarios"** al menú (con separador): cargar, renombrar, eliminar.
  3. Confirmar el guardado con un toast `role="status"`.
- **Aceptación:** guardar "X", recargar la página, abrir el menú y ver "X"; al cargarla se restauran los datos.

**R-02 · Botón × de eliminar origen invisible**
- **Evidencia:** está dentro de `.sticky-col.origin-head` con `overflow: hidden`. El botón ocupa x = 164–192 y el área visible termina en x = 166. Se ve solo un "." al lado del nombre, y los nombres se recortan ("Centro de Acop").
- **Cambio:** la celda debe ser `display: grid; grid-template-columns: 1fr auto; gap: 4px; overflow: visible`, con `min-width: 168px` en la columna sticky. El nombre lleva `text-overflow: ellipsis` y `title`.
- **Aceptación:** las × de los orígenes son visibles y clicables en todas las resoluciones (0 controles "CORTADO").

**R-03 · La opción "Vista orígenes: Tarjetas" no hace nada**
- **Evidencia:** al cambiar a "Tarjetas", la matriz sigue igual y no aparece ninguna tarjeta.
- **Cambio:** implementar la vista o **quitar la opción** del panel ⚙.
- **Aceptación:** la opción tiene un efecto visible o desaparece.

**R-03b · Overflow de 31 px a 320 px (las 3 rutas)**
- **Evidencia:** el botón de tema queda fuera de la pantalla y aparece scroll horizontal.
- **Cambio:** por debajo de 360 px, "Referencias" pasa a icono (📚, con `aria-label`) o entra en el menú ⚙. "Estudio IO" en una sola línea (`white-space: nowrap`, 16 px).
- **Aceptación:** overflow 0 a 320 px.

**R-04 · Texto de análisis incoherente en el ejemplo "Servidor potente μ=30"**
- **Evidencia:** el ejemplo fija s mín. = s máx. = 1, pero "Análisis del resultado" dice **"Comparativo de 1, 2 y 3 servidores"** y el KPI muestra "menor costo entre s = 1 y 1".
- **Cambio:** el texto debe derivar de `sMin..sMax` reales. Si el rango es un único valor, decir "Solo se evalúa s = 1".
- **Sugerencia didáctica:** dejar este ejemplo en el rango 1–3. Con Cs = 110, s = 2 cumple el SLA (Pw = 10,00 %).
- **Aceptación:** el texto coincide con el rango configurado.

### S2 — Accesibilidad, calidad y responsive

| ID | Problema | Cambio | Aceptación |
|---|---|---|---|
| R-05 | Error de consola React: "Cannot update a component while rendering a different component", al usar el stepper. | Mover el `setState` del padre a un `useEffect` o a un handler. Revisar el `onStepChange` del componente de pasos. | 0 errores de consola en un recorrido completo. |
| R-06 | El slider "Ir a paso" usa 0…6 y no tiene `aria-valuetext`: un lector de pantalla anuncia "1" cuando el paso es 2. | `min=1 max=N`, o `aria-valuetext="Paso 2 de 7"`. | El valor anunciado coincide con "Paso n / N". |
| R-07 | Chips `s = n` sin `aria-pressed`. Validación de Colas sin `aria-invalid` ni mensaje por campo. | `aria-pressed` en los chips. En cada input inválido, `aria-invalid="true"` + `aria-describedby` con un mensaje específico (p. ej. "λ debe ser > 0"). | axe sin violaciones; el lector anuncia qué campo falla. |
| R-12 | Colas no tiene Exportar CSV/JSON (Transporte sí). | Añadir "Exportar CSV" (tabla de indicadores) y "JSON" (parámetros) a "Más". | Paridad de acciones entre módulos. |
| R-13 | A 768 px el diagrama SVG de métodos tiene 7 textos de ~7 px. | Aplicar entre 641 y 900 px la misma regla que en móvil (ocultar el SVG y mostrar la matriz) o escalar el SVG a ancho completo. | 0 textos SVG < 9 px a 768 px. |
| R-10 | Copiar enlace, Copiar asignación y Exportar no dan ninguna confirmación. | Toast `role="status"`: "Enlace copiado", "Asignación copiada", "transporte.csv descargado". | Mensaje visible y anunciado. |

### S3 — Pulido

| ID | Problema | Cambio |
|---|---|---|
| R-08 | Referencias: los 7 enlaces dicen "Abrir fuente" (nombre ambiguo, WCAG 2.4.4). | `aria-label="Abrir fuente: Hitchcock (1941)"` o texto visible con el autor. Indicar que abren en una pestaña nueva (↗). |
| R-09 | Enlaces DOI: los de Hitchcock (10.1002/sapm1941201224), Little (10.1287/opre.9.3.383) y Gross (10.1002/9781118625651) devolvieron error en la verificación automática, y Kendall llevó a un bloqueo anti‑bot. Puede deberse a la protección de los editores; **conviene comprobarlos a mano con un clic**. | Verificar manualmente. Si fallan, enlazar la página del editor. |
| R-11 | Moneda: USD y COP muestran el mismo símbolo "$". Además, "Decimales = 4" se aplica al dinero ("$ 8.750,0000"). | Usar `Intl.NumberFormat(..., {style:'currency', currency})` ("US$" / "COP"). El dinero siempre con 0 o 2 decimales; la preferencia de decimales solo para indicadores. |
| R-14 | "Retomar" y "Abrir módulo" hacen exactamente lo mismo. | "Retomar" solo si hay cambios respecto al ejemplo base, con el nombre del escenario; si no, ocultarlo. |
| R-15 | El botón "Expandir todo" pasa a llamarse "Solo uno abierto" (confuso). | Usar "Expandir todo" / "Contraer todo". |
| R-16 | Una ruta inexistente muestra Inicio sin aviso. El `document.title` es igual en todas las rutas y el foco no se mueve al cambiar de ruta. | Mostrar "Página no encontrada" con un enlace a Inicio. Títulos por ruta ("Transporte · Estudio IO"). Mover el foco al `h1` al navegar. Añadir un enlace "Saltar al contenido". |
| R-17 | "+ Origen" no se deshabilita al llegar a 10. | `disabled` + `title="Máximo 10 orígenes"`. |
| R-18 | Sub‑nav en ≤ 414 px: "Análisis" y "Métodos" quedan fuera de vista sin ninguna pista. | Degradado lateral (`mask-image`) que indique que hay más pestañas, o pestañas más cortas ("Comparar" → "Comp."). |
| R-19 | Delete origen/destino usa `window.confirm` nativo. | Diálogo propio coherente con el resto, o deshacer con un toast ("Origen eliminado · Deshacer"). |

---

## 6. Lo que está bien (no tocar)

- **Cálculos:** los 3 métodos iniciales, MODI y M/M/s son correctos (verificados con LP y fórmulas independientes).
- **Enlaces compartidos:** reproducen el estado exacto.
- **Accesibilidad base:** 0 problemas de contraste, texto pequeño u objetivos pequeños de 360 a 1920 px en ambos temas. Landmarks correctos (`header`, `nav` con nombre, `main` y `footer`). Diálogos accesibles.
- **Ayudas:** 50 de 50 funcionan.
- **Paso a paso:** completo en los 3 métodos.
- **Header:** de 56 px en escritorio y unidades coherentes por columna.

---

## 7. Definición de terminado

1. R-01 a R-07 cerrados y verificados en 320, 375, 768, 1366 y 1920 px, en Claro y Oscuro.
2. 0 errores de consola en un recorrido completo.
3. Suite **Playwright + axe** con las mismas métricas de la sección 4, más la prueba de abrir un escenario guardado (R-01) y la de las × visibles (R-02).
