# Validación matemática — Estudio IO

## Alcance y resultados

- Transporte base: Noroeste 13.000, Costo Mínimo 10.700, Vogel 9.400 y MODI 8.750. Se verifican no negatividad, oferta, demanda y costo.
- Colas base: s=1 inestable; CT/h para s=2, 3 y 4 ≈ 1.108,57; 641,05 y 623,43. El mínimo en 1–5 es s=4 y cumple el SLA.
- Crecimiento λ=20, μ=10: s=2 inestable; s=5 es el menor costo entre 1–5 y cumple el SLA.
- M/M/1 potente λ=15, μ=30: W=4 s, Pw=50 %, costo 410/h; no cumple Pw≤10 %. Se comprobaron también las leyes de Little.
- Contraste externo reproducible: 700 matrices generadas de 2×2 a 6×6, con balanceo, costos y ofertas enteras; 3 soluciones iniciales y 3 ejecuciones MODI por matriz. El costo de cada resultado certificado se comparó con programación lineal HiGHS de SciPy. Resultado: 2.100 soluciones, 0 discrepancias y 0 resultados sin certificar. Se repitió con cantidades decimales y costos multiplicados por 10⁻¹⁰: 2.100 soluciones, 0 discrepancias y 0 resultados sin certificar.
- La muestra no es una demostración de corrección para todas las entradas. No se validó con este contraste independiente cada posible combinación de los tamaños máximos ni todos los casos extremos numéricos.

## Hallazgos y correcciones

1. **Certificación incorrecta con costos pequeños:** la tolerancia absoluta de MODI podía ignorar costos reducidos negativos inferiores a 10⁻⁹. Se reemplazó por una tolerancia proporcional a la escala de costos. Regresión: `[[0,0],[0,10⁻¹⁰]]` debe mejorar la asignación diagonal hasta costo cero.
2. **Ficticio por ruido decimal:** 0,1 + 0,2 frente a 0,3 generaba una reserva de aproximadamente 5,55×10⁻¹⁷. Se usa una tolerancia relativa a la precisión de coma flotante, compartida por cálculo e interfaz.
3. **Vista de servidores fuera del rango:** si la selección anterior ya no está en el rango, la vista activa vuelve a una configuración disponible. Si no hay selección explícita, sigue el mínimo económico actual.
4. **Indicadores pequeños como cero:** los indicadores y porcentajes positivos que se redondeaban a cero se presentan en notación científica. El cálculo conserva su valor.
5. **Exportación incompleta:** el CSV omitía los costos de reserva, aunque influyen en el costo total. Se añadió esa columna y se escapan nombres con comas o comillas.

## Inconsistencia en el material de referencia

En el caso T3 del documento `01_Ejercicio_Transporte.md`, se afirma que con H4=900 faltan 300 unidades. Sin embargo, 800+700+700+900=3.100, igual a la oferta 1.000+1.250+850=3.100. Por lo tanto, el caso está balanceado y no requiere origen ficticio. Para provocar un faltante de 300 manteniendo los demás datos, H4 debe ser 1.200. El documento académico no se modificó.

## Limitaciones pendientes

- El origen ficticio para demanda no cubierta se crea con costo cero; aún no se puede configurar la penalización por destino que contempla la especificación.
- La comparación independiente se ejecutó a nivel de motor matemático. Se observaron los resultados base en la interfaz, pero no se automatizaron todos los flujos visuales, temas y tamaños de pantalla.
- La validación de escenarios importados no cubre aún todas las estructuras malformadas posibles; las pruebas de esta revisión se centraron en entradas numéricas y matrices válidas.

## Reproducir

En `invop-studio`: `npm test`, `node scripts/validate.mjs` y `npm run build`. Para el contraste independiente adicional se requiere Python con NumPy y SciPy: `python scripts/audit_random.py`. En PowerShell, para la tanda decimal: `$env:AUDIT_COST_SCALE='1e-10'; $env:AUDIT_QTY_SCALE='0.1'; python scripts/audit_random.py`.
