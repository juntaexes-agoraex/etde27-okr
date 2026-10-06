/* ═══════════════════════════════════════════════════════════
   ETDE27 OKR — Módulo de gráficos (Chart.js)
   ═══════════════════════════════════════════════════════════ */

const CHART_REGISTRY = {};

function destroyChart(id) {
  if (CHART_REGISTRY[id]) {
    CHART_REGISTRY[id].destroy();
    delete CHART_REGISTRY[id];
  }
}

function destroyAllCharts() {
  Object.keys(CHART_REGISTRY).forEach(destroyChart);
}

// ── DONUT: distribución de estados ───────────────────────────
function renderDonut(canvasId, counts) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  CHART_REGISTRY[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Objetivo cumplido', 'En seguimiento', 'En riesgo', 'Atención urgente'],
      datasets: [{
        data: [counts.achieved, counts.on_track, counts.at_risk, counts.critical],
        backgroundColor: ['#059669', '#2563EB', '#D97706', '#DC2626'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, padding: 12, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} indicadores`
          }
        }
      }
    }
  });
}

// ── BAR HORIZONTAL: avance por eje ───────────────────────────
function renderEjesBar(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const avances = EJES.map(e => Math.round(ejeStats(e.id).avg));
  CHART_REGISTRY[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: EJES.map(e => 'Eje ' + e.id),
      datasets: [{
        data: avances,
        backgroundColor: EJES.map(e => e.color),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` Avance: ${ctx.raw}%` }
        }
      },
      scales: {
        x: {
          min: 0, max: 100,
          grid: { color: '#F1F5F9' },
          ticks: { callback: v => v + '%', font: { size: 11 } }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' } }
        }
      }
    }
  });
}

// ── RADAR: cobertura por eje ──────────────────────────────────
function renderRadar(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  CHART_REGISTRY[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: EJES.map(e => e.nombre.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        label: 'Avance 2026',
        data: EJES.map(e => Math.round(ejeStats(e.id).avg)),
        backgroundColor: 'rgba(37,99,235,.1)',
        borderColor: '#2563EB',
        pointBackgroundColor: '#2563EB',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { callback: v => v + '%', font: { size: 10 } },
          grid: { color: '#E2E8F0' },
          angleLines: { color: '#E2E8F0' }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// ── BAR: indicadores por eje (conteo) ────────────────────────
function renderIndCountBar(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const stackData = EJES.map(e => {
    const st = ejeStats(e.id);
    return st.counts;
  });
  CHART_REGISTRY[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: EJES.map(e => 'Eje ' + e.id),
      datasets: [
        { label: 'Cumplidos',       data: stackData.map(s => s.achieved), backgroundColor: '#059669', borderRadius: 0 },
        { label: 'En seguimiento',  data: stackData.map(s => s.on_track), backgroundColor: '#2563EB', borderRadius: 0 },
        { label: 'En riesgo',       data: stackData.map(s => s.at_risk),  backgroundColor: '#D97706', borderRadius: 0 },
        { label: 'Urgente',         data: stackData.map(s => s.critical), backgroundColor: '#DC2626', borderRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 10, boxWidth: 10 } }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { stacked: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1, font: { size: 11 } } }
      }
    }
  });
}

// ── GAUGE (simulado con donut) ────────────────────────────────
function renderGauge(canvasId, pct, color) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const val = Math.min(Math.round(pct), 100);
  CHART_REGISTRY[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [val, 100 - val],
        backgroundColor: [color, '#E2E8F0'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '78%',
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });
}
