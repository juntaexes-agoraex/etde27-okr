/* ═══════════════════════════════════════════════════════════
   ETDE27 OKR — Módulo principal de aplicación
   Router + vistas + interacción
   ═══════════════════════════════════════════════════════════ */

// ── ESTADO DE NAVEGACIÓN ─────────────────────────────────────
let currentView = 'dashboard';
let tableSort   = { col: 'id', dir: 1 };
let tableFilters = { search: '', eje: '', linea: '', status: '', per: '', responsable: '', soloRiesgo: false, soloSinDatos: false };
let modalEditId = null;

// ── ROUTER ───────────────────────────────────────────────────
function navigate(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#sidebar a[data-view]').forEach(a => {
    a.classList.toggle('active', a.dataset.view === view);
  });
  const viewEl = document.getElementById('v-' + view);
  if (viewEl) viewEl.classList.add('active');

  destroyAllCharts();

  switch (view) {
    case 'dashboard':   renderDashboard();  break;
    case 'eje-1':       renderEje(1);       break;
    case 'eje-2':       renderEje(2);       break;
    case 'eje-3':       renderEje(3);       break;
    case 'eje-4':       renderEje(4);       break;
    case 'indicadores': renderTabla();      break;
    case 'evolucion':   renderEvolucion();  break;
    case 'alertas':     renderAlertas();    break;
    case 'actualizar':  renderActualizar(); break;
    case 'informe':     renderInforme();    break;
  }
}

// ── TEMPLATE HELPERS ─────────────────────────────────────────
function badge(st) {
  const s = STATUS_CONFIG[st];
  return `<span class="badge badge-${st}">${s.label}</span>`;
}

function progBar(ind, h = 'pb-8') {
  const p = Math.min(calcProg(ind), 100);
  const st = getStatus(ind);
  return `<div class="pb-wrap ${h}"><div class="pb-fill pb-${st}" style="width:${p}%"></div></div>`;
}

function ejePill(n) {
  return `<span class="td-eje" style="color:${ejeColor(n)};font-size:.72rem">
    <span class="dot" style="width:8px;height:8px;border-radius:50%;background:${ejeColor(n)};display:inline-block"></span>
    Eje ${n}
  </span>`;
}

function indCard(ind, colorAccent = null) {
  const st = getStatus(ind);
  const sc = STATUS_CONFIG[st];
  const p  = Math.min(calcProg(ind), 100);
  const ac = colorAccent || sc.color;
  return `
  <div class="ind-card">
    <div class="ind-card-hd">
      <div class="ind-card-name">
        ${ind.nombre}
        <small>
          ${ind.nuevo ? '<span class="badge badge-nuevo">NUEVO</span>' : ''}
          ${ind._mod  ? '<span class="badge badge-updated">✎ Actualizado</span>' : ''}
        </small>
      </div>
      ${badge(st)}
    </div>
    <div style="margin:.5rem 0">${progBar(ind)}</div>
    <div style="font-size:.72rem;font-weight:700;color:${sc.color};margin-bottom:.65rem">${Math.round(p)}% del objetivo alcanzado</div>
    <div class="ind-vals">
      <div class="ind-val">
        <div class="ind-val-label">Partida</div>
        <div class="ind-val-num">${fmtBase(ind)}</div>
        <div class="ind-val-date">${ind.base.año || '—'}</div>
      </div>
      <div class="ind-val" style="border-color:${sc.border};background:${sc.bg}">
        <div class="ind-val-label">Actual</div>
        <div class="ind-val-num" style="color:${sc.color}">${fmtActual(ind)}</div>
        <div class="ind-val-date">${fmtDate(ind.actual.fecha)}</div>
      </div>
      <div class="ind-val">
        <div class="ind-val-label">Objetivo 2027</div>
        <div class="ind-val-num">${fmtObj(ind)}</div>
        <div class="ind-val-date">Meta</div>
      </div>
      <div class="ind-val">
        <div class="ind-val-label">Variación</div>
        <div class="ind-val-num" style="color:${fmtVar(ind).startsWith('+') ? '#059669' : fmtVar(ind) === '—' ? '#94A3B8' : '#DC2626'}">${fmtVar(ind)}</div>
        <div class="ind-val-date">vs. base</div>
      </div>
    </div>
    <div class="ind-meta">
      <span class="ind-meta-item">📅 ${fmtDate(ind.actual.fecha)}</span>
      <span class="ind-meta-sep">·</span>
      <span class="ind-meta-item">🔄 ${ind.per}</span>
      <span class="ind-meta-sep">·</span>
      <span class="ind-meta-item">📌 ${ind.fuente}</span>
      <span class="ind-meta-sep">·</span>
      <span class="ind-meta-item">${ind.linea}</span>
      ${ind.responsable ? `<span class="ind-meta-sep">·</span><span class="ind-meta-item">👤 ${ind.responsable}</span>` : ''}
    </div>
    ${ind.obs ? `<div class="ind-obs">${ind.obs}</div>` : ''}
    <div class="ind-actions">
      <button class="btn btn-ghost btn-sm" onclick="openModal('${ind.id}')">✎ Actualizar indicador</button>
      ${ind._mod ? `<button class="btn btn-sm" style="background:var(--crit-lt);color:var(--crit);border:1px solid var(--crit-bd)" onclick="resetOne('${ind.id}');navigate(currentView)">↺ Restaurar original</button>` : ''}
    </div>
  </div>`;
}

// ── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
  const el = document.getElementById('v-dashboard-inner');
  if (!el) return;
  const gs = globalStats();
  const last = lastUpdateDate();

  // KPIs
  const kpiHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-val" style="color:#2563EB">${Math.round(gs.avgP)}%</div>
        <div class="kpi-label">Avance global</div><div class="kpi-sub">Media de ${gs.total} indicadores</div></div>
      <div class="kpi"><div class="kpi-val">${gs.total}</div>
        <div class="kpi-label">Total indicadores</div><div class="kpi-sub">4 ejes estratégicos</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#059669">${gs.counts.achieved}</div>
        <div class="kpi-label">Objetivos cumplidos</div><div class="kpi-sub">Alcanzan o superan obj. 2027</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#2563EB">${gs.counts.on_track}</div>
        <div class="kpi-label">En seguimiento</div><div class="kpi-sub">Evolución alineada con meta</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#D97706">${gs.counts.at_risk}</div>
        <div class="kpi-label">En riesgo</div><div class="kpi-sub">Desviación moderada — foco</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#DC2626">${gs.counts.critical}</div>
        <div class="kpi-label">Atención urgente</div><div class="kpi-sub">Desviación significativa</div></div>
      <div class="kpi"><div class="kpi-val">${gs.counts.achieved + gs.counts.on_track}</div>
        <div class="kpi-label">Estado favorable</div><div class="kpi-sub">Cumplidos + en seguimiento</div></div>
      <div class="kpi"><div class="kpi-val">${gs.modified}</div>
        <div class="kpi-label">Actualizados localmente</div><div class="kpi-sub">Editados en esta sesión</div></div>
    </div>`;

  // Semáforo
  const semHTML = `
    <div class="card card-p">
      <div class="flex items-center justify-between flex-wrap gap-sm" style="margin-bottom:.75rem">
        <div class="card-header-title">Semáforo de estado</div>
        <div class="sem-legend">
          <div class="sem-item"><div class="sem-dot" style="background:#059669"></div> Cumplido ≥ 100%</div>
          <div class="sem-item"><div class="sem-dot" style="background:#2563EB"></div> En seguimiento ≥ 60%</div>
          <div class="sem-item"><div class="sem-dot" style="background:#D97706"></div> En riesgo ≥ 30%</div>
          <div class="sem-item"><div class="sem-dot" style="background:#DC2626"></div> Urgente &lt; 30%</div>
        </div>
      </div>
      <div style="font-size:.72rem;color:var(--muted)">
        Fórmula: (Valor actual − Base 2023) / (Objetivo 2027 − Base 2023) × 100. Para indicadores sin base: Valor actual / Objetivo × 100.
        Indicadores invertidos (mejor = menor): Valor actual / Objetivo × 100 si actual ≥ objetivo → 100%.
      </div>
    </div>`;

  // Ejes
  const ejesHTML = `
    <div class="eje-grid">
      ${EJES.map(e => {
        const s = ejeStats(e.id);
        const p = Math.round(s.avg);
        return `
          <div class="eje-card" data-eje="${e.id}" onclick="navigate('eje-${e.id}')">
            <div class="eje-card-num">Eje ${e.id}</div>
            <div class="eje-card-name">${e.nombre}</div>
            <div class="eje-card-pct">${p}%</div>
            <div style="margin:.4rem 0 .6rem">${progBar({actual:{v:p},obj:100,base:{v:0},bin:false,inv:false,unidad:'%'})}</div>
            <div class="eje-card-stats">
              <span class="eje-stat es-a">✓ ${s.counts.achieved}</span>
              <span class="eje-stat es-g">→ ${s.counts.on_track}</span>
              <span class="eje-stat es-y">! ${s.counts.at_risk}</span>
              <span class="eje-stat es-r">!! ${s.counts.critical}</span>
            </div>
            <div class="eje-card-meta">${s.inds.length} indicadores · ${e.lineas.length} líneas</div>
            <div class="eje-card-link">Ver detalle →</div>
          </div>`;
      }).join('')}
    </div>`;

  // Charts
  const chartsHTML = `
    <div class="charts-grid">
      <div class="card card-p">
        <div class="chart-title">Distribución por estado (${gs.total} indicadores)</div>
        <div class="chart-h"><canvas id="ch-donut"></canvas></div>
      </div>
      <div class="card card-p">
        <div class="chart-title">Avance medio por eje estratégico (%)</div>
        <div class="chart-h"><canvas id="ch-ejes"></canvas></div>
      </div>
    </div>
    <div class="charts-grid">
      <div class="card card-p">
        <div class="chart-title">Indicadores por estado y eje</div>
        <div class="chart-h"><canvas id="ch-stacked"></canvas></div>
      </div>
      <div class="card card-p">
        <div class="chart-title">Cobertura estratégica por eje (radar)</div>
        <div class="chart-h"><canvas id="ch-radar"></canvas></div>
      </div>
    </div>`;

  el.innerHTML = `<div class="section-gap">${kpiHTML}${semHTML}${ejesHTML}${chartsHTML}</div>`;

  // Actualizar cabecera
  const pillEl = document.getElementById('pill-last-update');
  if (pillEl) pillEl.textContent = 'Últ. actualización: ' + (fmtDate(last) || '—');
  const pillTotal = document.getElementById('pill-total');
  if (pillTotal) pillTotal.textContent = gs.total + ' indicadores';

  setTimeout(() => {
    renderDonut('ch-donut', gs.counts);
    renderEjesBar('ch-ejes');
    renderIndCountBar('ch-stacked');
    renderRadar('ch-radar');
  }, 80);
}

// ── EJE VIEW ─────────────────────────────────────────────────
function renderEje(n) {
  const el = document.getElementById(`v-eje-${n}-inner`);
  if (!el) return;
  const eje   = EJES.find(e => e.id === n);
  const s     = ejeStats(n);
  const p     = Math.round(s.avg);
  const color = ejeColor(n);

  const header = `
    <div class="card card-p">
      <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:${color};margin-bottom:.3rem">EJE ESTRATÉGICO ${n}</div>
      <div style="font-size:1.15rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.5rem">${eje.nombre}</div>
      <div style="font-size:.82rem;color:var(--ink2);line-height:1.65;max-width:760px;margin-bottom:1rem">${eje.descripcion}</div>
      <div class="flex flex-wrap gap-md items-center">
        <div style="text-align:center;padding:.5rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:8px">
          <div style="font-size:1.5rem;font-weight:800;color:${color}">${p}%</div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">Avance</div>
        </div>
        <div style="text-align:center;padding:.5rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:8px">
          <div style="font-size:1.5rem;font-weight:800">${s.inds.length}</div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">Indicadores</div>
        </div>
        <div style="text-align:center;padding:.5rem 1rem;background:var(--achieved-lt);border:1px solid var(--achieved-bd);border-radius:8px">
          <div style="font-size:1.5rem;font-weight:800;color:var(--achieved)">${s.counts.achieved}</div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">Cumplidos</div>
        </div>
        <div style="text-align:center;padding:.5rem 1rem;background:var(--track-lt);border:1px solid var(--track-bd);border-radius:8px">
          <div style="font-size:1.5rem;font-weight:800;color:var(--track)">${s.counts.on_track}</div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">Seguimiento</div>
        </div>
        <div style="text-align:center;padding:.5rem 1rem;background:var(--risk-lt);border:1px solid var(--risk-bd);border-radius:8px">
          <div style="font-size:1.5rem;font-weight:800;color:var(--risk)">${s.counts.at_risk}</div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">En riesgo</div>
        </div>
        <div style="text-align:center;padding:.5rem 1rem;background:var(--crit-lt);border:1px solid var(--crit-bd);border-radius:8px">
          <div style="font-size:1.5rem;font-weight:800;color:var(--crit)">${s.counts.critical}</div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">Urgente</div>
        </div>
      </div>
    </div>`;

  const lineasHTML = eje.lineas.map(l => {
    const linds = s.inds.filter(i => i.linea === l.id);
    if (!linds.length) return '';
    const lc = { achieved:0, on_track:0, at_risk:0, critical:0 };
    linds.forEach(i => lc[getStatus(i)]++);
    return `
      <div class="linea-block">
        <div class="linea-hd open" onclick="toggleLinea(this)">
          <div class="flex items-center gap-sm flex-wrap flex-1">
            <span class="linea-id">${l.id}</span>
            <span class="linea-title">${l.nombre}</span>
          </div>
          <div class="linea-hd-right">
            <span class="eje-stat es-a">${lc.achieved}</span>
            <span class="eje-stat es-g">${lc.on_track}</span>
            <span class="eje-stat es-y">${lc.at_risk}</span>
            <span class="eje-stat es-r">${lc.critical}</span>
            <span class="linea-arrow">▾</span>
          </div>
        </div>
        <div class="linea-body">
          ${linds.map(i => indCard(i, color)).join('')}
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `<div class="section-gap">${header}${lineasHTML}</div>`;
}

function toggleLinea(hd) {
  const body = hd.nextElementSibling;
  body.classList.toggle('collapsed');
  const arrow = hd.querySelector('.linea-arrow');
  if (arrow) arrow.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
  hd.classList.toggle('open', !body.classList.contains('collapsed'));
}

// ── TABLA GENERAL ────────────────────────────────────────────
function renderTabla() {
  const el = document.getElementById('v-indicadores-inner');
  if (!el) return;

  // Opciones de filtro
  const ejeOpts   = EJES.map(e => `<option value="${e.id}">Eje ${e.id} — ${e.nombre.split(' ').slice(0,3).join(' ')}</option>`).join('');
  const lineaOpts  = EJES.flatMap(e => e.lineas).map(l => `<option value="${l.id}">${l.id} — ${l.nombre}</option>`).join('');
  const statusOpts = Object.entries(STATUS_CONFIG).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');
  const perOpts    = [...new Set(INDICADORES_ORIGINAL.map(i => i.per))].map(p => `<option value="${p}">${p}</option>`).join('');
  const respOpts   = [...new Set(INDICADORES_ORIGINAL.map(i => i.responsable).filter(Boolean))].map(r => `<option value="${r}">${r}</option>`).join('');

  el.innerHTML = `
    <div class="card" style="overflow:hidden">
      <div class="table-toolbar">
        <div class="search-wrap">
          <input type="text" id="tbl-q" placeholder="Buscar indicador..." value="${tableFilters.search}" oninput="tblFilter('search',this.value)">
        </div>
        <div class="toolbar-sep"></div>
        <select class="filter-sel" onchange="tblFilter('eje',this.value)">
          <option value="">Todos los ejes</option>${ejeOpts}
        </select>
        <select class="filter-sel" onchange="tblFilter('linea',this.value)">
          <option value="">Todas las líneas</option>${lineaOpts}
        </select>
        <select class="filter-sel" onchange="tblFilter('status',this.value)">
          <option value="">Todos los estados</option>${statusOpts}
        </select>
        <select class="filter-sel" onchange="tblFilter('per',this.value)">
          <option value="">Todas las periodicidades</option>${perOpts}
        </select>
        <select class="filter-sel" onchange="tblFilter('responsable',this.value)">
          <option value="">Todos los responsables</option>${respOpts}
        </select>
        <div class="toolbar-sep"></div>
        <label style="font-size:.75rem;color:var(--ink2);display:flex;align-items:center;gap:.35rem;cursor:pointer">
          <input type="checkbox" ${tableFilters.soloRiesgo ? 'checked' : ''} onchange="tblFilter('soloRiesgo',this.checked)"> Solo en riesgo/urgente
        </label>
        <label style="font-size:.75rem;color:var(--ink2);display:flex;align-items:center;gap:.35rem;cursor:pointer">
          <input type="checkbox" ${tableFilters.soloSinDatos ? 'checked' : ''} onchange="tblFilter('soloSinDatos',this.checked)"> Sin base
        </label>
        <button class="btn btn-ghost btn-sm" onclick="clearTblFilters()">✕ Limpiar</button>
        <div class="toolbar-count" id="tbl-count"></div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th onclick="tblSort('id')">ID <span class="th-sort" id="ts-id"></span></th>
            <th onclick="tblSort('eje')">Eje <span class="th-sort" id="ts-eje"></span></th>
            <th onclick="tblSort('nombre')" style="min-width:240px">Indicador <span class="th-sort" id="ts-nombre"></span></th>
            <th onclick="tblSort('base')">Base 2023 <span class="th-sort" id="ts-base"></span></th>
            <th onclick="tblSort('actual')">Actual <span class="th-sort" id="ts-actual"></span></th>
            <th onclick="tblSort('var')">Variación <span class="th-sort" id="ts-var"></span></th>
            <th onclick="tblSort('obj')">Obj. 2027 <span class="th-sort" id="ts-obj"></span></th>
            <th onclick="tblSort('prog')" style="min-width:130px">Avance % <span class="th-sort" id="ts-prog"></span></th>
            <th onclick="tblSort('status')">Estado <span class="th-sort" id="ts-status"></span></th>
            <th onclick="tblSort('fecha')">Actualización <span class="th-sort" id="ts-fecha"></span></th>
            <th>Periodicidad</th>
            <th>Responsable</th>
            <th style="width:60px"></th>
          </tr></thead>
          <tbody id="tbl-body"></tbody>
        </table>
      </div>
    </div>`;

  // Restaurar valores de filtros
  const q = document.getElementById('tbl-q');
  if (q) q.value = tableFilters.search;

  applyTblFilters();
}

function applyTblFilters() {
  let rows = [...DATA];
  const f = tableFilters;
  if (f.search)     rows = rows.filter(i => i.nombre.toLowerCase().includes(f.search.toLowerCase()) || i.id.toLowerCase().includes(f.search.toLowerCase()));
  if (f.eje)        rows = rows.filter(i => String(i.eje) === String(f.eje));
  if (f.linea)      rows = rows.filter(i => i.linea === f.linea);
  if (f.status)     rows = rows.filter(i => getStatus(i) === f.status);
  if (f.per)        rows = rows.filter(i => i.per === f.per);
  if (f.responsable)rows = rows.filter(i => i.responsable === f.responsable);
  if (f.soloRiesgo) rows = rows.filter(i => ['at_risk','critical'].includes(getStatus(i)));
  if (f.soloSinDatos) rows = rows.filter(i => i.base.v === null || i.base.v === undefined);

  const STO = { achieved:0, on_track:1, at_risk:2, critical:3 };
  rows.sort((a, b) => {
    let va, vb;
    const dir = tableSort.dir;
    switch (tableSort.col) {
      case 'id':     va = a.id; vb = b.id; break;
      case 'eje':    va = a.eje; vb = b.eje; break;
      case 'nombre': va = a.nombre; vb = b.nombre; break;
      case 'base':   va = a.base.v ?? -Infinity; vb = b.base.v ?? -Infinity; break;
      case 'actual': va = a.bin ? 0 : +a.actual.v; vb = b.bin ? 0 : +b.actual.v; break;
      case 'obj':    va = a.bin ? 0 : +a.obj; vb = b.bin ? 0 : +b.obj; break;
      case 'prog':   va = calcProg(a); vb = calcProg(b); break;
      case 'status': va = STO[getStatus(a)]; vb = STO[getStatus(b)]; break;
      case 'fecha':  va = a.actual.fecha || ''; vb = b.actual.fecha || ''; break;
      case 'var':    va = (a.base.v != null && !a.bin) ? a.actual.v - a.base.v : 0;
                     vb = (b.base.v != null && !b.bin) ? b.actual.v - b.base.v : 0; break;
      default: return 0;
    }
    if (typeof va === 'string') return dir * va.localeCompare(vb);
    return dir * (va - vb);
  });

  // Update sort icons
  ['id','eje','nombre','base','actual','obj','prog','status','fecha','var'].forEach(k => {
    const el = document.getElementById('ts-' + k);
    if (el) el.textContent = tableSort.col === k ? (tableSort.dir === 1 ? '↑' : '↓') : '';
  });

  const tbody = document.getElementById('tbl-body');
  if (!tbody) return;
  tbody.innerHTML = rows.map(i => {
    const st = getStatus(i);
    const p  = Math.min(calcProg(i), 100);
    const sc = STATUS_CONFIG[st];
    return `<tr>
      <td class="td-id">${i.id}</td>
      <td>${ejePill(i.eje)}</td>
      <td>
        <div class="td-name">${i.nombre}${i.nuevo?'<span class="badge badge-nuevo" style="margin-left:.3rem;font-size:.58rem">N</span>':''}${i._mod?'<span class="badge badge-updated" style="margin-left:.3rem;font-size:.58rem">✎</span>':''}</div>
        <div class="td-linea">${i.linea}</div>
      </td>
      <td class="td-num">${fmtBase(i)}</td>
      <td class="td-num" style="color:${sc.color};font-weight:700">${fmtActual(i)}</td>
      <td class="td-num" style="color:${fmtVar(i).startsWith('+') ? 'var(--achieved)' : fmtVar(i) === '—' ? 'var(--muted)' : 'var(--crit)'}">${fmtVar(i)}</td>
      <td class="td-num">${fmtObj(i)}</td>
      <td class="td-prog">
        <div class="prog-cell">
          <div style="flex:1">${progBar(i,'pb-6')}</div>
          <span class="prog-pct">${Math.round(p)}%</span>
        </div>
      </td>
      <td>${badge(st)}</td>
      <td style="font-size:.74rem;white-space:nowrap;color:var(--muted)">${fmtDate(i.actual.fecha)}</td>
      <td style="font-size:.73rem;color:var(--ink3);white-space:nowrap">${i.per}</td>
      <td style="font-size:.72rem;color:var(--ink3);max-width:140px">${i.responsable || '—'}</td>
      <td class="td-actions"><button class="tbl-btn" onclick="openModal('${i.id}')">✎</button></td>
    </tr>`;
  }).join('');

  const cnt = document.getElementById('tbl-count');
  if (cnt) cnt.textContent = `${rows.length} de ${DATA.length} indicadores`;
}

function tblSort(col) {
  if (tableSort.col === col) tableSort.dir *= -1;
  else { tableSort.col = col; tableSort.dir = 1; }
  applyTblFilters();
}

function tblFilter(key, val) {
  tableFilters[key] = val;
  applyTblFilters();
}

function clearTblFilters() {
  tableFilters = { search: '', eje: '', linea: '', status: '', per: '', responsable: '', soloRiesgo: false, soloSinDatos: false };
  renderTabla();
}

// ── EVOLUCIÓN ────────────────────────────────────────────────
function renderEvolucion() {
  const el = document.getElementById('v-evolucion-inner');
  if (!el) return;

  const intro = `
    <div class="card card-p" style="font-size:.8rem;color:var(--ink2)">
      La barra muestra el progreso desde la base 2023 hasta el objetivo 2027, con el valor actual de 2026.
      <strong>Gris claro</strong>: base de partida. <strong>Color</strong>: valor actual. <strong>Línea vertical</strong>: objetivo 2027.
      No se muestran series históricas inventadas; únicamente base → actual → objetivo.
    </div>`;

  const ejesHTML = EJES.map(e => {
    const inds = DATA.filter(i => i.eje === e.id);
    return `
      <div>
        <div style="font-size:.82rem;font-weight:700;color:${e.color};margin-bottom:.5rem;padding-left:.25rem">
          EJE ${e.id} · ${e.nombre}
        </div>
        <div class="evol-grid">
          ${inds.map(i => evolItem(i, e.color)).join('')}
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `<div class="section-gap">${intro}${ejesHTML}</div>`;
}

function evolItem(i, color) {
  if (i.bin) {
    return `
      <div class="evol-item">
        <div class="evol-name">${i.nombre}</div>
        <div style="display:flex;align-items:center;gap:.5rem">
          ${badge(getStatus(i))}
          <span style="font-size:.75rem;color:var(--ink3)">Indicador binario · Actual: <strong>${i.actual.v}</strong> → Objetivo: <strong>${i.obj}</strong></span>
        </div>
      </div>`;
  }
  const a = +i.actual.v, o = +i.obj;
  const b = i.base.v !== null && i.base.v !== undefined ? +i.base.v : null;
  const hasBase = b !== null;
  const st = getStatus(i);
  const sc = STATUS_CONFIG[st];
  const minV = hasBase ? Math.min(b, a, o) : Math.min(a, o) * 0.9;
  const maxV = Math.max(hasBase ? Math.max(b, a, o) : Math.max(a, o), o) * 1.05;
  const range = maxV - minV || 1;
  const clamp = v => Math.max(0, Math.min(((v - minV) / range) * 100, 100));
  const aPct = clamp(i.inv ? (a >= o ? 100 : (a / o) * 100) : a);
  const bPct = hasBase ? clamp(b) : 0;
  const oPct = clamp(o);

  return `
    <div class="evol-item">
      <div class="evol-name">${i.nombre}</div>
      <div class="evol-track">
        ${hasBase ? `<div class="evol-base-fill" style="width:${bPct}%"></div>` : ''}
        <div class="evol-fill pb-${st}" style="width:${aPct}%;border-radius:99px">
          <span>${fmtActual(i)}</span>
        </div>
        <div class="evol-target-line" style="left:${oPct}%"></div>
      </div>
      <div class="evol-labels">
        <span>${hasBase ? fmtBase(i) + ' (base ' + i.base.año + ')' : '—'}</span>
        <span>🎯 ${fmtObj(i)} (2027)</span>
      </div>
      <div class="evol-numbers">
        ${hasBase ? `Base: <strong>${fmtBase(i)}</strong> · ` : ''}
        Actual: <strong style="color:${sc.color}">${fmtActual(i)}</strong> ·
        Objetivo: <strong>${fmtObj(i)}</strong> ·
        Avance: <strong>${fmtProg(i)}</strong>
        ${!i.bin && b !== null ? ` · Variación: <strong style="color:${fmtVar(i).startsWith('+')?'var(--achieved)':'var(--crit)'}">${fmtVar(i)}</strong>` : ''}
      </div>
    </div>`;
}

// ── ALERTAS ──────────────────────────────────────────────────
function renderAlertas() {
  const el = document.getElementById('v-alertas-inner');
  if (!el) return;

  const critical = DATA.filter(i => getStatus(i) === 'critical');
  const atRisk   = DATA.filter(i => getStatus(i) === 'at_risk');
  const onTrack  = DATA.filter(i => getStatus(i) === 'on_track');
  const achieved = DATA.filter(i => getStatus(i) === 'achieved');
  const nuevos   = DATA.filter(i => i.nuevo);
  const sinBase  = DATA.filter(i => (i.base.v === null || i.base.v === undefined) && !i.bin && !i.nuevo);

  const grp = (title, dotColor, items, showProg = true) => {
    if (!items.length) return `
      <div class="alert-group">
        <div class="alert-group-hd" style="color:${dotColor}">
          <div class="alert-group-dot" style="background:${dotColor}"></div>
          ${title} (0)
        </div>
        <div class="empty" style="padding:.75rem"><div class="empty-msg">Sin indicadores en esta categoría</div></div>
      </div>`;
    return `
      <div class="alert-group">
        <div class="alert-group-hd" style="color:${dotColor}">
          <div class="alert-group-dot" style="background:${dotColor}"></div>
          ${title} (${items.length})
        </div>
        ${items.map(i => {
          const st = getStatus(i);
          const sc = STATUS_CONFIG[st];
          const p  = Math.min(calcProg(i), 100);
          return `
            <div class="alert-item">
              <div class="alert-dot" style="background:${dotColor}"></div>
              <div>
                <div class="alert-name">${i.nombre}</div>
                <div class="alert-meta">
                  Eje ${i.eje} · ${i.linea} · Actual: <strong>${fmtActual(i)}</strong> → Objetivo: <strong>${fmtObj(i)}</strong> · ${fmtDate(i.actual.fecha)}
                  ${i.obs ? `<br><em style="font-size:.7rem">${i.obs.substring(0, 120)}${i.obs.length > 120 ? '...' : ''}</em>` : ''}
                </div>
              </div>
              ${showProg ? `
                <div class="alert-pct">
                  <div class="alert-pct-val" style="color:${sc.color}">${Math.round(p)}%</div>
                  <div class="alert-pct-label">del objetivo</div>
                </div>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  };

  el.innerHTML = `
    <div class="section-gap">
      ${grp('CRÍTICO — Atención urgente (< 30%)', '#DC2626', critical)}
      ${grp('EN RIESGO — Seguimiento reforzado (30–60%)', '#D97706', atRisk)}
      ${grp('EN SEGUIMIENTO — Evolución favorable (60–100%)', '#2563EB', onTrack)}
      ${grp('LOGROS — Objetivos alcanzados', '#059669', achieved, false)}
      ${nuevos.length ? grp('INFORMATIVOS — Nuevos OKRs incorporados en 2026', '#0369A1', nuevos, true) : ''}
      ${sinBase.length ? grp('SIN BASE — Indicadores sin situación de partida registrada', '#6B7280', sinBase, true) : ''}
    </div>`;
}

// ── ACTUALIZAR DATOS ─────────────────────────────────────────
function renderActualizar() {
  const el = document.getElementById('v-actualizar-inner');
  if (!el) return;
  const modified = DATA.filter(i => i._mod);

  el.innerHTML = `
    <div class="section-gap">
      ${modified.length ? `
        <div class="card card-p">
          <div style="font-size:.82rem;font-weight:700;margin-bottom:.75rem;color:var(--track)">✎ Indicadores con datos actualizados localmente (${modified.length})</div>
          <div class="update-list">
            ${modified.map(i => `
              <div class="update-item modified">
                <div class="update-item-info">
                  <div class="update-item-name">${i.nombre}</div>
                  <div class="update-item-meta">Eje ${i.eje} · ${i.linea} · Actualizado: ${i._modAt ? new Date(i._modAt).toLocaleString('es-ES') : '—'}</div>
                </div>
                <div class="update-item-actions">
                  <span class="badge badge-updated">Valor: ${fmtActual(i)}</span>
                  <button class="btn btn-ghost btn-sm" onclick="openModal('${i.id}')">✎ Editar</button>
                  <button class="btn btn-sm" style="background:var(--crit-lt);color:var(--crit);border:1px solid var(--crit-bd)" onclick="resetOne('${i.id}');navigate('actualizar')">↺</button>
                </div>
              </div>`).join('')}
          </div>
          <div style="margin-top:.75rem;display:flex;gap:.5rem">
            <button class="btn btn-danger btn-sm" onclick="if(confirm('¿Restaurar TODOS los indicadores a sus valores originales?')){resetAll();navigate('actualizar')}">↺ Restaurar todos los originales</button>
          </div>
        </div>` : ''}
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">Todos los indicadores (${DATA.length})</div>
          <div class="flex gap-sm">
            <button class="btn btn-ghost btn-sm" onclick="exportJSON()">⬇ Exportar JSON</button>
            <button class="btn btn-ghost btn-sm" onclick="exportCSV()">⬇ Exportar CSV</button>
            <button class="btn btn-ghost btn-sm" onclick="triggerImport()">⬆ Importar JSON</button>
            <input type="file" id="import-file" accept=".json" style="display:none" onchange="handleImport(event)">
          </div>
        </div>
        <div class="update-list" style="padding:.5rem">
          ${DATA.map(i => `
            <div class="update-item ${i._mod ? 'modified' : ''}">
              <div class="update-item-info">
                <div class="update-item-name">${i.nombre}${i._mod ? '<span class="badge badge-updated" style="margin-left:.4rem">✎</span>' : ''}</div>
                <div class="update-item-meta">Eje ${i.eje} · ${i.linea} · ${fmtActual(i)} → Obj: ${fmtObj(i)} · ${Math.round(calcProg(i))}%</div>
              </div>
              <div class="update-item-actions">
                ${badge(getStatus(i))}
                <button class="btn btn-ghost btn-sm" onclick="openModal('${i.id}')">✎ Actualizar</button>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function triggerImport() {
  document.getElementById('import-file')?.click();
}
function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = ev => { if (importJSON(ev.target.result)) navigate('actualizar'); };
  r.readAsText(file);
  e.target.value = '';
}

// ── INFORME EJECUTIVO ────────────────────────────────────────
function renderInforme() {
  const el = document.getElementById('v-informe-inner');
  if (!el) return;
  const gs = globalStats();
  const last = lastUpdateDate();
  const logros  = DATA.filter(i => getStatus(i) === 'achieved');
  const urgente = DATA.filter(i => getStatus(i) === 'critical');
  const riesgo  = DATA.filter(i => getStatus(i) === 'at_risk');

  const ejeRowsHTML = EJES.map(e => {
    const s = ejeStats(e.id);
    const p = Math.round(s.avg);
    return `
      <div class="report-eje-bar">
        <div class="reb-name" style="color:${e.color}">Eje ${e.id} · ${e.nombre.split(' ').slice(0,3).join(' ')}</div>
        <div class="reb-pb"><div class="pb-wrap pb-10"><div class="pb-fill" style="width:${p}%;background:${e.color}"></div></div></div>
        <div class="reb-pct" style="color:${e.color}">${p}%</div>
      </div>
      <div style="font-size:.72rem;color:var(--muted);margin-bottom:.5rem;padding-left:220px">
        ✓ ${s.counts.achieved} cumplidos · → ${s.counts.on_track} en seguimiento · ! ${s.counts.at_risk} en riesgo · !! ${s.counts.critical} urgentes
      </div>`;
  }).join('');

  const topEje = EJES.reduce((best, e) => ejeStats(e.id).avg > ejeStats(best.id).avg ? e : best, EJES[0]);
  const lowEje = EJES.reduce((worst, e) => ejeStats(e.id).avg < ejeStats(worst.id).avg ? e : worst, EJES[0]);

  el.innerHTML = `
    <div class="flex items-center gap-sm" style="margin-bottom:1.25rem">
      <button class="btn btn-primary" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
      <button class="btn btn-ghost" onclick="exportJSON()">⬇ Exportar JSON</button>
      <button class="btn btn-ghost" onclick="exportCSV()">⬇ Exportar CSV</button>
    </div>
    <div class="report-paper">
      <div class="report-logo">Junta de Extremadura · OTID — Oficina de Transformación e Innovación Digital · Accenture</div>
      <div class="report-title">Informe de Seguimiento OKR</div>
      <div class="report-subtitle">Estrategia de Transformación Digital de Extremadura 2027 (ETDE27)</div>
      <div class="report-date">
        Datos actualizados a: ${fmtDate(last)} · Informe generado el ${new Date().toLocaleDateString('es-ES', {day:'numeric',month:'long',year:'numeric'})}
      </div>
      <div class="report-divider"></div>

      <div class="report-kpis">
        <div class="rk"><div class="rk-val" style="color:#2563EB">${Math.round(gs.avgP)}%</div><div class="rk-label">Avance global</div></div>
        <div class="rk"><div class="rk-val">${gs.total}</div><div class="rk-label">Indicadores</div></div>
        <div class="rk"><div class="rk-val" style="color:#059669">${gs.counts.achieved}</div><div class="rk-label">Cumplidos</div></div>
        <div class="rk"><div class="rk-val" style="color:#2563EB">${gs.counts.on_track}</div><div class="rk-label">En seguimiento</div></div>
        <div class="rk"><div class="rk-val" style="color:#D97706">${gs.counts.at_risk}</div><div class="rk-label">En riesgo</div></div>
        <div class="rk"><div class="rk-val" style="color:#DC2626">${gs.counts.critical}</div><div class="rk-label">Urgente</div></div>
      </div>

      <div class="report-section">
        <h2>Situación general</h2>
        <p>A ${fmtDate(last)}, la ETDE27 presenta un avance global del <strong>${Math.round(gs.avgP)}%</strong> sobre el conjunto de sus ${gs.total} indicadores de impacto estratégico. <strong>${gs.counts.achieved} indicadores</strong> han alcanzado o superado el objetivo 2027, ${gs.counts.on_track} evolucionan favorablemente, ${gs.counts.at_risk} presentan desviaciones moderadas que requieren seguimiento reforzado y ${gs.counts.critical} requieren acción inmediata. El eje con mayor avance es el <strong>Eje ${topEje.id} (${Math.round(ejeStats(topEje.id).avg)}%)</strong>, mientras que el eje que presenta mayores retos es el <strong>Eje ${lowEje.id} (${Math.round(ejeStats(lowEje.id).avg)}%)</strong>.</p>
      </div>

      <div class="report-section">
        <h2>Avance por eje estratégico</h2>
        ${ejeRowsHTML}
      </div>

      <div class="report-section">
        <h2>Principales logros ✅ (${logros.length})</h2>
        <ul class="report-ul">
          ${logros.map(i => `<li><strong>${i.nombre}</strong> (Eje ${i.eje}) — Valor actual: ${fmtActual(i)} · Objetivo: ${fmtObj(i)} · Avance: ${fmtProg(i)}</li>`).join('')}
        </ul>
      </div>

      <div class="report-section">
        <h2>Indicadores que requieren atención urgente 🔴 (${urgente.length})</h2>
        <ul class="report-ul">
          ${urgente.map(i => `<li><strong>${i.nombre}</strong> (Eje ${i.eje}) — Avance: ${Math.round(calcProg(i))}% · Actual: ${fmtActual(i)} · Objetivo: ${fmtObj(i)}</li>`).join('')}
        </ul>
      </div>

      ${riesgo.length ? `
      <div class="report-section">
        <h2>Indicadores en riesgo 🟡 (${riesgo.length})</h2>
        <ul class="report-ul">
          ${riesgo.map(i => `<li><strong>${i.nombre}</strong> (Eje ${i.eje}) — Avance: ${Math.round(calcProg(i))}% · Actual: ${fmtActual(i)} · Objetivo: ${fmtObj(i)}</li>`).join('')}
        </ul>
      </div>` : ''}

      <div class="report-section">
        <h2>Prioridades para el próximo periodo</h2>
        <ul class="report-ul">
          <li>Acelerar la creación del SOC (Centro Regional de Ciberseguridad): avance actual del 2% frente a objetivo del 100%.</li>
          <li>Impulsar la constitución de la Comisión Interinstitucional de Ciberseguridad, aún no constituida.</li>
          <li>Intensificar la publicación de conjuntos de datos abiertos: 51 de 200 objetivo (25.5% de avance).</li>
          <li>Reforzar programas de competencias digitales ciudadanas: solo +0.6pp de mejora en 2 años.</li>
          <li>Acelerar la construcción del nuevo CPD: avance del 7% sobre objetivo del 80%.</li>
          <li>Incrementar el ritmo de campañas de ciberseguridad: 3 de 15 completadas (20%).</li>
          <li>Consolidar la conectividad empresarial por fibra: estancamiento desde el 78% de base.</li>
          <li>Mantener el impulso en el Eje 4 (Innovación empresarial), donde el 50% de los indicadores ya han alcanzado el objetivo 2027.</li>
        </ul>
      </div>
    </div>`;
}

// ── MODAL DE ACTUALIZACIÓN ───────────────────────────────────
function openModal(id) {
  modalEditId = id;
  const i = DATA.find(x => x.id === id);
  if (!i) return;
  const doc = document.getElementById('modal-body');
  doc.innerHTML = `
    <div class="info-row">
      <div>
        <div style="font-size:.8rem;font-weight:700">${i.nombre}</div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:.1rem">Eje ${i.eje} · ${i.linea} · ${i.unidad} · ${i.fuente}</div>
      </div>
      ${i._mod ? '<span class="badge badge-updated">Actualizado</span>' : '<span style="font-size:.68rem;background:#FFF7ED;color:#C2410C;border:1px solid #FED7AA;border-radius:4px;padding:.15rem .5rem">Dato original</span>'}
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem;padding:.65rem .75rem;background:var(--surface);border:1px solid var(--border);border-radius:6px">
      <span style="font-size:.78rem">Base: <strong>${fmtBase(i)}</strong></span>
      <span style="color:var(--muted)">→</span>
      <span style="font-size:.78rem">Actual: <strong style="color:${STATUS_CONFIG[getStatus(i)].color}">${fmtActual(i)}</strong></span>
      <span style="color:var(--muted)">→</span>
      <span style="font-size:.78rem">Objetivo: <strong>${fmtObj(i)}</strong></span>
      <span style="font-size:.78rem">· Avance actual: <strong>${fmtProg(i)}</strong></span>
    </div>
    ${i.bin ? `
      <div style="padding:.75rem;background:var(--risk-lt);border:1px solid var(--risk-bd);border-radius:6px;font-size:.82rem;color:var(--risk)">
        ℹ️ Este es un indicador binario (Sí/No). Su actualización requiere intervención directa del responsable.
      </div>` : `
      <div class="form-group">
        <label class="form-label">Nuevo valor actual (${i.unidad})</label>
        <input type="number" class="form-input" id="m-val" value="${i.actual.v}" step="${i.unidad === '/10' ? '.1' : '1'}" min="0">
        <div class="form-hint">Valor anterior: ${fmtActual(i)} · Objetivo 2027: ${fmtObj(i)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha del valor</label>
        <input type="date" class="form-input" id="m-fecha" value="${i.actual.fecha || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Observaciones</label>
        <textarea class="form-input" id="m-obs">${i.obs || ''}</textarea>
      </div>`}
  `;
  document.getElementById('modal-save-btn').style.display = i.bin ? 'none' : '';
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  modalEditId = null;
}

function saveModal() {
  if (!modalEditId) return;
  const i = DATA.find(x => x.id === modalEditId);
  if (!i || i.bin) { closeModal(); return; }
  const v     = document.getElementById('m-val')?.value;
  const fecha = document.getElementById('m-fecha')?.value;
  const obs   = document.getElementById('m-obs')?.value;
  if (!v) { toast('Introduce un valor', 'error'); return; }
  saveUpdate(modalEditId, v, fecha, obs);
  closeModal();
  navigate(currentView);
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar nav
  document.querySelectorAll('#sidebar a[data-view]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigate(a.dataset.view); });
  });

  // Modal overlay click
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Pills iniciales
  const gs = globalStats();
  const last = lastUpdateDate();
  const pillUpdate = document.getElementById('pill-last-update');
  const pillTotal  = document.getElementById('pill-total');
  if (pillUpdate) pillUpdate.textContent = 'Últ. actualización: ' + (fmtDate(last) || '—');
  if (pillTotal)  pillTotal.textContent  = gs.total + ' indicadores';

  // Vista inicial
  navigate('dashboard');
});
