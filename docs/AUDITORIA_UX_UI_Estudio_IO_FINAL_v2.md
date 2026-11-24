# Auditoría UX/UI definitiva v2 — Estudio IO (tras ajustes)

**Fecha:** 24-nov-2026
**Alcance:** re-verificación completa de `AUDITORIA_UX_UI_Estudio_IO_FINAL.md`:
- Todos los botones, enlaces, ejemplos, menús, diálogos, preferencias y las 50 ayudas "i".
- **10 resoluciones:** 1920, 1440, 1280, 1024, 768, 414, 390, 375, 360 y 320 px.
- Temas **Claro y Oscuro**.
- Cálculos recalculados de forma independiente (`scipy.linprog` y fórmulas M/M/s en Python).

**Estado del navegador:** el `localStorage` se respaldó y se **restauró** al final. No quedan escenarios de prueba y el tema sigue siendo el del usuario (Oscuro).

---

## 1. Veredicto

### ✅ APROBADO. Lista para entrega con 1 corrección menor obligatoria (R2-01).

| | Auditoría anterior | **Ahora** |
|---|---|---|
| S1 — función rota o dato engañoso | 5 | **1** (nuevo, de una línea) |
| S2 — accesibilidad o responsive | 6 | **1** (intermitente, sin reproducir) |
| S3 — pulido | 9 | **3** |
| Cálculos verificados | ✅ | ✅ |
| Métricas automáticas (10 resoluciones × 3 rutas × 2 temas) | fallos a 320 y 768 px | **0 incidencias reales** |

---

## 2. Cierre de los hallazgos anteriores

| ID | Hallazgo | Estado | Evidencia |
|---|---|---|---|
| R-01 | Escenarios guardados sin forma de abrirse | ✅ | Diálogo propio "Guardar escenario" con el foco en el campo, y toast "Escenario … guardado". En el menú aparece **"Mis escenarios"** con Cargar, Renombrar (diálogo) y Eliminar (diálogo de confirmación). Cargar restaura los datos (costo 9 → 2). Funciona igual en Transporte y en Colas. |
| R-02 | × de eliminar origen invisible | ✅ | Botones de 28×28 px visibles y clicables (prueba con `elementFromPoint`). Nombres con "…". |
| R-03 | "Vista orígenes: Tarjetas" sin efecto | ✅ | Muestra tarjetas por origen (Nombre, Oferta, Costo reserva, costos por destino). |
| R-03b | Overflow de 31 px a 320 px | ✅ | Overflow 0. Header con iconos (☰ ⚙ ◑) que caben. |
| R-04 | Texto incoherente en "Servidor potente" | ✅ | Rango 1–3. "M/M/1 410, M/M/2 380, M/M/3 480,91" y "ahorra USD 9,09 de espera": **todo verificado en Python**. |
| R-05 | Error de React "setState in render" | 🟡 | **No reproducido** en 20+ secuencias aisladas (stepper, reproducir, acordeones, expandir/contraer, copiar, toasts, sub‑nav). Solo apareció una vez en un recorrido largo. Ver R2-02. |
| R-06 | Slider "Ir a paso" sin `valuetext` | ✅ | `aria-valuetext="Paso 5 de 7"` coincide con la UI. |
| R-07 | `aria-pressed` y validación por campo | ✅ | Los chips `s = n` tienen `aria-pressed`. Los campos inválidos llevan `aria-invalid="true"` y mensajes específicos: "λ debe ser mayor que 0", "μ debe ser mayor que 0", "Cs no puede ser negativo", "Pw está entre 0 y 100 %". |
| R-08 / R-09 | Enlaces "Abrir fuente" ambiguos y DOI fallidos | ✅ | Ahora llevan nombres accesibles ("Hitchcock (1941), se abre en una pestaña nueva") y apuntan a la página del editor (Wiley, INFORMS, Project Euclid, MIT OCW y McGraw‑Hill). |
| R-10 | Sin confirmación de acciones | ✅ | Toasts: "Enlace copiado", "transporte.csv descargado", "transporte.json descargado", "Asignación copiada", "colas.csv descargado", "colas.json descargado". |
| R-11 | Moneda sin distinción | ✅ | "USD 8.750,00" / "COP 8.750,00". El dinero ya no se ve afectado por la preferencia de decimales. |
| R-12 | Colas sin exportar | ✅ | Exportar CSV y JSON añadidos. |
| R-13 | SVG ilegible a 768 px | ✅ | 0 textos SVG < 9 px a 768 px. |
| R-14 | "Retomar" redundante | ✅ | Solo aparece cuando hay cambios ("Retomar Transporte" tras editar un costo). |
| R-15 | Etiqueta "Solo uno abierto" | ✅ | "Expandir todo" / "Contraer todo". |
| R-16 | 404, títulos, foco, enlace de salto | ✅ con **1 regresión** | "Página no encontrada · Estudio IO" con enlace a Inicio. Título por ruta ("Transporte · Estudio IO"). Foco al `h1` al navegar. Enlace "Saltar al contenido" visible con foco (blanco sobre azul marino). **Pero el enlace rompe la navegación**: ver R2-01. |
| R-17 | "+ Origen" sin límite visible | ✅ | Deshabilitado al llegar a 10, con `title="Límite de 10 orígenes"`. |
| R-18 | Sub‑nav sin indicador | ✅ | Degradado `mask-image` y scroll horizontal en móvil. |
| R-19 | `confirm` nativo | ✅ | Diálogo propio "Eliminar origen · Cancelar / Eliminar". |

---

## 3. Pruebas funcionales (resumen)

| Área | Resultado |
|---|---|
| Navegación (3 rutas + 404), `aria-current`, títulos por ruta y foco | ✅ |
| Referencias (7 enlaces), Preferencias (8 opciones), Tema (3 estados) | ✅ |
| Ayudas "i" | ✅ **50/50** abren, cierran con Esc y quedan dentro de la pantalla (también a 375 px). |
| Transporte: 3 ejemplos | ✅ Z óptimo **8.750 / 9.100 / 8.850**, igual a `linprog`. |
| Transporte: Restablecer, ± origen/destino, ×, renombrar, límites 1×1 y 10 | ✅ |
| Transporte: CSV, JSON, Copiar enlace (el enlace reproduce el estado) e Imprimir | ✅ |
| Transporte: stepper ×3 (← → ↺ ▶/Pausa, slider, tarjetas, ocultar lista), MODI (θ, ciclo, copiar) | ✅ |
| Colas: 3 ejemplos | ✅ s* = 4 / 5 / 2 y CT = 623,43 / 811,94 / 380,00, iguales al cálculo independiente. |
| Colas: chips, sliders, unidad, validación, sistema inestable, escenarios, exportación | ✅ |

## 4. Matriz de resoluciones

| Ancho | Overflow | Header | A11y (contraste, texto < 12 px, objetivos < 24 px) | Fuera de tarjeta | SVG < 9 px | Controles recortados |
|---|---|---|---|---|---|---|
| 1920 / 1440 / 1280 / 1024 | 0 | 56 | 0 | 0 | 0 | 0 |
| 768 | 0 | 86 | 0 | 0 | 0 | 0 |
| 414 / 390 / 375 / 360 | 0 | 99 | 0 | 0 | 0 | 0 |
| 320 | 0 | 101 | 0 | 0 | 0 | 0 |

> El script marcó "1 contraste bajo" en todas las resoluciones: es el enlace "Saltar al contenido" **oculto** fuera de pantalla. Visible con foco, su contraste es correcto. Es un falso positivo.
> El script también marcó el slider "Ir a paso" como recortado en ≤ 414 px, pero sus bordes coinciden exactamente con los del contenedor. Verificado visualmente: es un falso positivo.

---

## 5. Backlog final

### S1 (obligatorio antes de entregar)

**R2-01 · "Saltar al contenido" lleva a "Página no encontrada"**
- **Reproducir:** pulsar Tab al cargar la página y Enter sobre "Saltar al contenido". El hash cambia a `#contenido`, el router de hash no reconoce la ruta y muestra la 404 ("Página no encontrada · Estudio IO").
- **Cambio:** no usar `href="#contenido"` con `HashRouter`. Usar un botón o un `onClick` con `preventDefault()` que enfoque `#contenido` sin tocar la URL:
  ```tsx
  <a href="#contenido" className="skip-link"
     onClick={e => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>
    Saltar al contenido
  </a>
  // y en <main id="contenido" tabIndex={-1}>
  ```
- **Aceptación:** tras activar el enlace, la ruta no cambia y el foco queda en `main`.

### S2

**R2-02 · Error intermitente "Cannot update a component while rendering a different component"**
- Apareció una vez en la ronda anterior y una vez en esta, siempre en un recorrido largo de Transporte. **No se reprodujo** de forma aislada.
- **Cambio:** ejecutar `npm run dev` con React StrictMode y revisar la traza del error en la consola del navegador (React indica el componente). Los candidatos más probables son un `setState` del padre llamado durante el render del stepper o del sistema de toasts (p. ej. `onChange` invocado en el cuerpo del render o en un `useMemo`).
- **Aceptación:** 0 errores de consola en un recorrido completo con StrictMode.

### S3 (opcional)

| ID | Detalle | Sugerencia |
|---|---|---|
| R2-03 | En móvil, el botón de Referencias usa el icono **☰**, que por convención significa "menú". | Usar un icono de libro (📚) o la palabra "Fuentes". |
| R2-04 | En móvil (≤ 414 px) el texto del panel de métodos ("Clic en un paso…", "Cómo funciona Noroeste") queda pegado al borde por el `padding-inline: 0`. | Mantener las tablas a sangre completa, pero dar `padding-inline: 12px` a los textos. |
| R2-05 | Redacción: "Pw está entre 0 y 100 %"; COP con 2 decimales; al cargar un escenario guardado no hay toast propio (se ve el anterior). | "Pw debe estar entre 0 y 100 %"; COP con 0 decimales; toast "Escenario X cargado". |

---

## 6. Recomendación

Corregir **R2-01** (es un cambio de una línea) e investigar **R2-02** con StrictMode. Con eso la aplicación queda **lista para entrega**: los cálculos están verificados, la UI es accesible y es responsive de 320 a 1920 px en ambos temas.

Para evitar regresiones, convertir las métricas de la sección 4 en la suite **Playwright + axe** pendiente.
