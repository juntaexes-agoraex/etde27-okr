# OKR ETDE27 — Herramienta de Seguimiento Estratégico

**Estrategia de Transformación Digital de Extremadura 2027**
Versión 1.0 · OTID Accenture · Octubre 2026

---

## Cómo abrir la herramienta

1. Abre el archivo `index.html` directamente en cualquier navegador moderno (Chrome, Edge, Firefox).
2. No requiere instalación, servidor, ni conexión a internet.
3. Las librerías externas (Chart.js) se cargan desde CDN. Si no hay conexión, los gráficos no se mostrarán pero el resto de la herramienta funciona completamente.

```
okr-etde27/
└── index.html  ← Abrir este archivo
```

---

## Estructura del proyecto

```
okr-etde27/
├── index.html                  # Entrada principal de la aplicación
├── css/
│   └── styles.css              # Estilos completos del sistema de diseño
├── js/
│   ├── data.js                 # Datos OKR, lógica de cálculo, localStorage
│   ├── charts.js               # Gestión de gráficos con Chart.js
│   └── app.js                  # Router, vistas, interacción
├── data/
│   └── okr-data.json           # Base de datos consolidada (referencia)
├── presentacion/
│   └── Seguimiento_OKR_2027.pptx  # Presentación ejecutiva PowerPoint
├── analisis/
│   ├── consolidacion_datos.md       # Proceso de consolidación de fuentes
│   ├── inconsistencias_detectadas.md # Errores y diferencias entre documentos
│   └── cambios_entre_versiones.md   # Evolución de los documentos fuente
└── README.md                   # Este archivo
```

---

## Cómo navegar la herramienta

La herramienta dispone de una barra lateral con las siguientes secciones:

| Sección | Descripción |
|---------|-------------|
| **Resumen ejecutivo** | Cuadro de mando global con KPIs, semáforo y avance por eje |
| **Eje 1 – Eje 4** | Vista detallada de cada eje con sus líneas e indicadores |
| **Todos los indicadores** | Tabla completa con filtros, búsqueda y ordenación |
| **Evolución** | Visualización del progreso base → actual → objetivo |
| **Alertas** | Sistema automático de alertas por prioridad |
| **Actualización de datos** | Formulario para actualizar valores de indicadores |
| **Informe ejecutivo** | Resumen ejecutivo generado automáticamente |

---

## Cómo actualizar indicadores

1. Ve a **Actualización de datos** en el menú lateral.
2. Selecciona el indicador que deseas actualizar.
3. Introduce el nuevo valor, la fecha de actualización y observaciones.
4. Haz clic en **Guardar cambios**.

También puedes actualizar directamente desde la ficha de cualquier indicador haciendo clic en **Actualizar indicador**.

Los cambios se guardan en el navegador (localStorage) y no modifican los datos originales.

---

## Distinguir datos originales de datos actualizados

- Los indicadores con datos actualizados se marcan con una etiqueta azul **✎ Actualizado**.
- Puedes ver el dato original en el formulario de actualización.
- Para restaurar el dato original de un indicador: botón **↺ Restaurar original** en la ficha del indicador.
- Para restaurar todos los datos a los valores originales: **Actualización de datos → Restaurar todos los originales**.

---

## Cómo exportar datos

En la sección **Actualización de datos** o mediante el menú:

- **Exportar JSON**: Descarga todos los datos en formato JSON (estructura completa con estado calculado).
- **Exportar CSV**: Descarga todos los indicadores en formato CSV para Excel u otras herramientas.
- **Copia de seguridad**: El JSON exportado incluye tanto datos originales como actualizaciones realizadas.

---

## Cómo importar datos

1. Ve a **Actualización de datos**.
2. Haz clic en **Importar JSON**.
3. Selecciona un archivo JSON previamente exportado desde esta herramienta.

> **Nota**: Solo se importan las actualizaciones guardadas. Los datos originales no pueden ser reemplazados por importación.

---

## Cómo generar el informe ejecutivo

1. Ve a **Informe ejecutivo** en el menú lateral.
2. El informe se genera automáticamente con los datos actuales.
3. Para imprimir o guardar como PDF: botón **Imprimir / PDF** o `Ctrl+P`.

---

## Cómo funciona el cálculo de avance

El porcentaje de avance de cada indicador se calcula según la fórmula:

```
% Avance = (Valor actual - Base 2023) / (Objetivo 2027 - Base 2023) × 100
```

**Excepciones:**
- **Indicadores invertidos** (menor es mejor, ej. reducción de tiempo): % = valor actual / objetivo × 100 si actual ≥ objetivo → 100%
- **Indicadores sin base**: % = valor actual / objetivo × 100
- **Indicadores binarios** (Sí/No): 100% si cumplido, 0% si no

**Semáforo de estado:**

| Estado | Color | Umbral |
|--------|-------|--------|
| Objetivo cumplido | 🟢 Verde | ≥ 100% |
| En seguimiento | 🔵 Azul | ≥ 60% |
| En riesgo | 🟡 Ámbar | ≥ 30% |
| Atención urgente | 🔴 Rojo | < 30% |

---

## Requisitos técnicos

- Navegador moderno: Chrome 90+, Edge 90+, Firefox 88+, Safari 14+
- Sin instalación adicional
- Sin conexión a servidor
- Resolución recomendada: 1280px o superior

---

## Créditos y fuentes

- **Fuente principal de datos**: OTID Informe de avances ETDE27 v00.04 (mayo 2026)
- **Fuente complementaria**: Observatorio OKR Extremadura (V-FINAL, 2026)
- **Marco estratégico**: Análisis Funcional Portal Estrategia (2023)
- **Herramienta desarrollada por**: OTID — Oficina de Transformación e Innovación Digital, Accenture
