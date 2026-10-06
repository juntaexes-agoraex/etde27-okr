# Consolidación de datos · OKR ETDE27

**Estrategia de Transformación Digital de Extremadura 2027**
Proceso de análisis y validación de fuentes · Octubre 2026

---

## 1. Fuentes documentales analizadas

### Fuente A — PPTX de avances OTID (fuente principal)
- **Archivo**: `OTID_Informe de avances_ETDE27_v00.04.pptx`
- **Fecha**: Mayo 2026
- **Contenido**: Informe formal de seguimiento con datos de avance a mayo 2026 para todos los OKRs. Incluye valores actuales, base 2023, objetivos 2027 y observaciones narrativas.
- **Autoridad**: **MÁXIMA** — Adoptada como fuente principal en todos los conflictos de datos.

### Fuente B — Observatorio OKR (complementaria)
- **Archivo**: `V-FINAL Observatorio_OKR+Detalle_Eje1.pdf`
- **Fecha**: 2026 (versión final)
- **Contenido**: Cuadro de seguimiento con datos actualizados a 2025-2026. Detalle exhaustivo del Eje 1. Para los demás ejes, datos más resumidos.
- **Autoridad**: SECUNDARIA — Usada para validación cruzada y contexto adicional.

### Fuente C — Análisis funcional portal estrategia (referencia estructural)
- **Archivo**: `Análisis Funcional Portal Estrategia.docx`
- **Fecha**: 2023
- **Contenido**: Documento de análisis de la arquitectura de indicadores OKR. Incluye la estructura de ejes, líneas y primeras definiciones de indicadores con valores base 2023.
- **Autoridad**: REFERENCIA — Usada exclusivamente para estructura y definición conceptual de indicadores.

---

## 2. Metodología de consolidación

### 2.1 Criterio general de prioridad de fuentes

```
Fuente A (PPTX v00.04) > Fuente B (Observatorio) > Fuente C (Portal)
```

En caso de conflicto de valores numéricos: se adopta el valor de la Fuente A salvo indicación explícita documentada.

### 2.2 Proceso de trabajo

1. **Extracción estructural**: Se identificaron todos los OKRs en las tres fuentes y se creó un índice maestro con todos los IDs detectados.
2. **Mapeo de equivalencias**: Se identificaron indicadores con nombres ligeramente diferentes entre documentos que referenciaban el mismo KR.
3. **Detección de conflictos**: Para cada indicador, se compararon valores base, actual y objetivo entre fuentes. Se documentaron 10 inconsistencias (ver `inconsistencias_detectadas.md`).
4. **Resolución de conflictos**: Se aplicó el criterio de prioridad de fuentes descrito en 2.1.
5. **Validación de integridad**: Se verificó que los 28 OKRs estuvieran correctamente asignados a su eje y línea estratégica correspondiente.
6. **Corrección de asignaciones**: Se corrigieron 3 indicadores mal asignados a ejes incorrectos en la fuente C (ver inconsistencias 1, 2 y 3).

### 2.3 Tratamiento de indicadores nuevos (NUEVO = true)

Los indicadores marcados como `nuevo: true` son OKRs que no existían en el documento base de 2023 y fueron incorporados durante la revisión de 2025-2026. Para estos indicadores:

- **Base 2023**: Se define como `null` (sin valor de partida conocido)
- **Cálculo de avance**: `(valor actual / objetivo) × 100`
- **Fuente de referencia**: Exclusivamente Fuente A (PPTX OTID)

Indicadores nuevos identificados: E2-04, E2-08, E3-03, E3-04, E3-05, E4-06.

---

## 3. Distribución final de OKRs por eje

| Eje | Nombre abreviado | Líneas | Indicadores | Nuevos |
|-----|-----------------|--------|-------------|--------|
| Eje 1 | Administración digital | 4 | 9 | 0 |
| Eje 2 | Conectividad | 3 | 8 | 2 |
| Eje 3 | Sociedad digital | 2 | 5 | 3 |
| Eje 4 | Innovación empresarial | 3 | 6 | 1 |
| **Total** | | **12** | **28** | **6** |

---

## 4. Valores adoptados por indicador

### Eje 1 — Administración digital (9 indicadores)

| ID | Indicador | Base 2023 | Actual 2026 | Objetivo 2027 | Unidad |
|----|-----------|-----------|-------------|---------------|--------|
| E1-01 | Satisfacción ciudadanía | 7.4 | 7.9 | 9 | /10 |
| E1-02 | Trámites digitales | 45% | 91% | 100% | % |
| E1-03 | Reducción tiempo procedimientos (inv.) | 10% | 42% | 75% | % |
| E1-04 | Administraciones integradas en plataforma | 5 | 8 | 13 | unidades |
| E1-05 | Empleados públicos con formación digital | 30% | 58% | 85% | % |
| E1-06 | Servicios en ÁgoraEX | 0 | 1 | 5 | servicios |
| E1-07 | Datos en CPD regional | 15% | 22% | 80% | % |
| E1-08 | Conjuntos datos abiertos | 25 | 51 | 200 | conjuntos |
| E1-09 | Satisfacción empleados públicos | 5.8 | 6.5 | 8 | /10 |

### Eje 2 — Conectividad (8 indicadores)

| ID | Indicador | Base 2023 | Actual 2026 | Objetivo 2027 | Unidad |
|----|-----------|-----------|-------------|---------------|--------|
| E2-01 | Viviendas con acceso a internet | 95% | 97.5% | 100% | % |
| E2-02 | Municipios con banda ancha >100 Mbps | 72% | 89% | 100% | % |
| E2-03 | Empresas con conectividad por fibra | 79% | 79% | 90% | % |
| E2-04 | Pueblos inteligentes conectados (NUEVO) | — | 394 | 800 | municipios |
| E2-05 | Incidentes ciberseguridad gestionados | — | 220 | 500 | incidentes |
| E2-06 | SOC regional operativo | — | 2% | 100% | % avance |
| E2-07 | Campañas ciberseguridad ciudadanía | 0 | 3 | 15 | campañas |
| E2-08 | Comisión interinstitucional (NUEVO, bin.) | — | No | Sí | Sí/No |

### Eje 3 — Sociedad digital (5 indicadores)

| ID | Indicador | Base 2023 | Actual 2026 | Objetivo 2027 | Unidad |
|----|-----------|-----------|-------------|---------------|--------|
| E3-01 | Ciudadanos con competencias digitales básicas | 56.4% | 57% | 70% | % |
| E3-02 | Mujeres en formaciones STEM | 38% | 42% | 50% | % |
| E3-03 | Programas de nómadas digitales activos (NUEVO) | — | 2 | 8 | programas |
| E3-04 | Titulaciones universitarias digitales activas (NUEVO) | — | 6 | 15 | titulaciones |
| E3-05 | Startups creadas en programas de innovación (NUEVO) | — | 5 | 20 | startups |

### Eje 4 — Innovación empresarial (6 indicadores)

| ID | Indicador | Base 2023 | Actual 2026 | Objetivo 2027 | Unidad |
|----|-----------|-----------|-------------|---------------|--------|
| E4-01 | Empresas digitalizadas (nivel avanzado) | 28% | 41% | 60% | % |
| E4-02 | Hubs de innovación activos | 2 | 5 | 8 | hubs |
| E4-03 | Tecnologías innovadoras pilotadas | 3 | 9 | 15 | tecnologías |
| E4-04 | PIB digital sobre PIB regional | 12.3% | 14.1% | 18% | % |
| E4-05 | Inversión pública I+D+i sobre PIB | 1.1% | 1.3% | 2% | % |
| E4-06 | Empresas participantes en ÁgoraEX (NUEVO) | — | 12 | 50 | empresas |

---

## 5. Decisiones metodológicas adoptadas

### 5.1 Indicadores binarios
Se marcaron como binarios (`bin: true`) aquellos OKRs cuyo objetivo es la consecución de un hecho discreto (Sí/No). El cálculo de avance es: 100% si se ha cumplido (actual = objetivo), 0% en caso contrario.

**OKR binario identificado**: E2-08 (Comisión Interinstitucional de Ciberseguridad).

### 5.2 Indicadores invertidos
Se marcaron como invertidos (`inv: true`) aquellos donde un valor MENOR indica un mejor resultado (p.ej. reducción de tiempo o de costes). El cálculo de avance adaptado es: si actual ≥ objetivo → 100%; en caso contrario → (actual / objetivo) × 100.

**OKR invertido identificado**: E1-03 (Reducción del tiempo de resolución de procedimientos).

### 5.3 Indicadores sin base 2023
Para los 6 OKRs nuevos (`nuevo: true`) no existe valor de partida conocido en 2023 porque los programas o iniciativas que miden no existían en ese año. Se define `base.v: null` y el cálculo de avance usa directamente `(actual / objetivo) × 100`.

### 5.4 Fuente de responsables
Los responsables de cada indicador se extrajeron principalmente de la Fuente A (PPTX OTID). Cuando no se especificaba responsable explícito, el campo se dejó en blanco para evitar asignaciones incorrectas.

---

## 6. Proceso de validación final

Se verificó que:
- ✅ El total de indicadores es exactamente 28
- ✅ No hay IDs duplicados
- ✅ Cada indicador pertenece a un único eje (1–4)
- ✅ Cada indicador está asignado a una línea válida de su eje
- ✅ Todos los valores base, actual y objetivo son coherentes con sus unidades
- ✅ Los indicadores invertidos y binarios tienen la lógica de cálculo correcta
- ✅ Los 6 indicadores nuevos tienen base nula y el flag `nuevo: true`

---

*Análisis elaborado por OTID — Oficina de Transformación e Innovación Digital, Accenture · Octubre 2026*
