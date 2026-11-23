# Estudio IO — laboratorio local

Aplicación web local para el proyecto final de **Investigación de Operaciones** (Transporte + Teoría de colas), con diseño educativo, tooltips y gráficos de comparación.

## Requisitos

- Node.js 24 recomendado (validado con Node 24). El script numérico importa TypeScript directamente y requiere una versión de Node compatible con esta función.

## Ejecutar en local

```bash
cd invop-studio
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

## Producción local

```bash
npm run build
npm run preview
```

## Validación numérica

```bash
node scripts/validate.mjs
npm run lint
```

El script comprueba los ejemplos base, el crecimiento de la demanda, un cambio de costo y un caso degenerado. MODI avisa si no consigue certificar el resultado. El origen ficticio representa demanda no cubierta con costo cero; no es un proveedor real.

## Publicación con GitHub Pages

El proyecto es estático y no requiere cuentas de usuario ni servidor de autenticación. El flujo `.github/workflows/pages.yml` instala dependencias, valida los resultados y publica `dist` en GitHub Pages al actualizar `main`. En **Settings → Pages → Build and deployment**, selecciona **GitHub Actions** como origen. Las rutas usan `#` para que funcionen al actualizar la página en GitHub Pages.

## Módulos

| Ruta | Contenido |
|---|---|
| `/` | Inicio e integrantes |
| `/transporte` | NO, CM, Vogel, MODI, gráfico comparativo |
| `/colas` | M/M/s, costos, SLA, distribución Pₙ |

Los resultados del ejemplo base están alineados con `EntregaOperaciones/Paquete_Desarrollo`.

## Referencias de identidad visual

La interfaz toma como referencia el [manual de imagen ITM 2025](https://www.itm.edu.co/wp-content/uploads/formatos/Manual-ITM-V-2025.pdf): Montserrat y Lato, azul institucional y colores complementarios de Ingeniería. El manual contiene valores hexadecimales y RGB que no coinciden para el azul principal; se emplea el RGB indicado (1, 28, 91; `#011c5b`). El logo se incluye como archivo local; las fuentes requieren conexión y tienen alternativas locales.
