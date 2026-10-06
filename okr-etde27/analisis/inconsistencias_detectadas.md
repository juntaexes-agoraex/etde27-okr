# Inconsistencias detectadas — ETDE27 OKR
**Análisis comparativo entre fuentes documentales**
Fecha de análisis: 2026-10-06

---

## Fuentes analizadas

| ID | Documento | Tipo | Prioridad |
|----|-----------|------|-----------|
| F1 | V-FINAL Observatorio_OKR+Detalle_Eje1.pdf | PDF extracción datos | Secundaria |
| F2 | OTID_Informe de avances_ETDE27_v00.04.pptx | PPTX informe formal | **Principal** |
| F3 | Análisis Funcional Portal Estrategia.docx | DOCX funcional | Contexto |
| F4 | okr-extremadura/OKR_PAB2627_datos.json | JSON previo | Obsoleto / errores |

**Criterio de autoridad**: Se adopta F2 (PPTX informe formal más reciente) como fuente principal para todos los valores de avance.

---

## INCONSISTENCIA 1 — Indicador mal clasificado por eje

**Indicador**: "Población con competencias digitales básicas"
**Error**: En el JSON previo (F4) figura en **Eje 1** (e1_10)
**Corrección**: Pertenece al **Eje 3, Línea L3.1** (Sociedad inclusiva) según F2 y F3
**Impacto**: Alto — afecta al recuento de indicadores por eje y al cálculo de avance de Eje 1 y Eje 3
**Estado**: ✅ Corregido en la base consolidada (ID: E3-01)

---

## INCONSISTENCIA 2 — Indicador duplicado: Mujeres STEM

**Indicador**: "Mujeres matriculadas en carreras STEM"
**Error**: En el JSON previo (F4) aparece en **Eje 3** (e3_1) y también en **Eje 4** como "Mujeres matriculadas en carreras STEM (contribución empresarial)" (e4_6) con el mismo valor (23.3%)
**Corrección**: Un único indicador en **Eje 3, Línea L3.2** según F2
**Impacto**: Medio — el Eje 4 tenía un indicador duplicado
**Estado**: ✅ Corregido — eliminado el duplicado. Eje 4 tiene 6 indicadores, no 7

---

## INCONSISTENCIA 3 — Indicador duplicado: Campañas ciberseguridad

**Error**: En el JSON previo (F4) las campañas de ciberseguridad aparecen en Eje 2 (e2_1) y también listadas en Eje 3 (e3_4) con diferente denominación ("Campañas de capacitación ciudadana en ciberseguridad")
**Corrección**: Un único indicador en **Eje 2, Línea L2.3** según F2
**Impacto**: Medio — Eje 3 tenía un indicador duplicado
**Estado**: ✅ Corregido — eliminado el duplicado. Eje 3 tiene 5 indicadores

---

## INCONSISTENCIA 4 — Valor incorrecto: Pueblos Inteligentes

**Indicador**: "Actuaciones en convocatorias para el desarrollo de pueblos inteligentes" (E2-04)
**JSON previo (F4)**: 336 actuaciones
**Informe formal (F2)**: 394 actuaciones
**Diferencia**: +58 actuaciones
**Causa probable**: El JSON previo usaba un dato de actualización anterior
**Estado**: ✅ Corregido — valor adoptado: 394 (F2, fecha 2026-01-28)

---

## INCONSISTENCIA 5 — Valor diferente: Tecnologías innovadoras

**Indicador**: "Integración de tecnologías innovadoras para la mejora del servicio público" (E1-07)
**JSON previo (F4)**: 7 actuaciones
**Informe formal (F2)**: 9 actuaciones
**Diferencia**: +2 actuaciones
**Causa probable**: Dato del JSON previo desactualizado
**Estado**: ✅ Corregido — valor adoptado: 9 (F2, fecha 2026-05-27)

---

## INCONSISTENCIA 6 — Diferencia en satisfacción ciudadana

**Indicador**: "Nivel de satisfacción de la ciudadanía" (E1-01)
**Observatorio (F1)**: base = 7.3
**Informe formal (F2)**: base = 7.4
**Diferencia**: 0.1 puntos en el valor de partida
**Causa probable**: Diferente fuente de encuesta o metodología
**Decisión**: Se adopta 7.4 de F2 (fuente oficial más reciente)
**Estado**: ✅ Documentado — base adoptada: 7.4

---

## INCONSISTENCIA 7 — Empresas con fibra: diferencia de 1pp

**Indicador**: "Empresas que tienen acceso a internet por redes de cable y fibra óptica" (E2-03)
**Observatorio (F1)**: 80%
**Informe formal (F2)**: 79%
**Diferencia**: 1pp
**Causa probable**: Redondeo diferente o metodología ligeramente distinta
**Decisión**: Se adopta 79% de F2 (fuente oficial)
**Estado**: ✅ Documentado — valor adoptado: 79%

---

## INCONSISTENCIA 8 — Viviendas con internet: discrepancia

**Indicador**: "Viviendas con conexión a internet" (E2-01)
**JSON previo (F4)**: 96.5%
**Informe formal (F2)**: 95%
**Diferencia**: 1.5pp
**Causa probable**: El JSON previo usaba dato de INE 2024; F2 usa dato de INE 2023 publicado en 2024
**Decisión**: Se adopta 95% de F2 (coherente con el objetivo que ya está cumplido)
**Estado**: ✅ Corregido — valor adoptado: 95%

---

## INCONSISTENCIA 9 — Campañas nómadas: mal ubicadas en JSON previo

**Error en F4**: Las campañas de nómadas digitales figuran en Eje 2 (e2_6) en el JSON previo
**Corrección**: Pertenecen al **Eje 3, Línea L3.1** según F2 (sociedad inclusiva, no conectividad)
**Impacto**: Medio
**Estado**: ✅ Corregido — ID: E3-05, Eje 3, L3.1

---

## INCONSISTENCIA 10 — Empleados públicos: mal ubicado en JSON previo

**Error en F4**: "Empleados públicos certificados en competencias digitales" figura en Eje 1 como e1_8 pero también aparece la posición del Laboratorio GovTechLab que es un nombre diferente al oficial (ÁgoraEX)
**Corrección**: Nombre correcto es "Laboratorio de Innovación (ÁgoraEX)" no "GovTechLab"
**Estado**: ✅ Corregido — nombre adoptado según F2

---

## RESUMEN DE CORRECCIONES

| Tipo | Cantidad |
|------|---------|
| Indicadores reubicados de eje | 2 (competencias digitales, nómadas digitales) |
| Indicadores duplicados eliminados | 2 (Mujeres STEM, Campañas ciberseguridad) |
| Valores numéricos corregidos | 4 (Pueblos Inteligentes, Tecnologías innovadoras, Viviendas internet, Empresas fibra) |
| Nombres de indicadores corregidos | 1 (GovTechLab → ÁgoraEX) |
| Bases de datos actualizadas | 1 (satisfacción ciudadana: 7.3 → 7.4) |

**Total correcciones**: 10 inconsistencias resueltas
**Distribución final de indicadores**: E1(9) + E2(8) + E3(5) + E4(6) = **28 indicadores**
