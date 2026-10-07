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

  try {
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
      // v2.0
      case 'comite':      renderComite();      break;
      case 'calendario':  renderCalendario();  break;
      case 'tareas':      renderTareas();      break;
      case 'decisiones':  renderDecisiones();  break;
      case 'snapshots':   renderSnapshots();   break;
      case 'comparar':    renderComparar();    break;
      case 'config':      renderConfig();      break;
      case 'metodologia': break; // contenido estático
    }
  } catch (e) {
    console.error('Error al renderizar la vista', view, e);
    toast('Error al mostrar la vista. Revisa la consola.', 'error');
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
  <div class="ind-card" id="card-${ind.id}">
    <div class="ind-card-hd">
      <div class="ind-card-name">
        <span class="ind-link" onclick="openFicha('${ind.id}')" title="Abrir ficha 360°">${ind.nombre}</span>
        <small>
          <span class="ind-code">${ind.id}</span>
          ${ind.nuevo ? '<span class="badge badge-nuevo">NUEVO</span>' : ''}
          ${ind._mod  ? '<span class="badge badge-updated">✎ Actualizado</span>' : ''}
          ${updBadge(updateStatus(ind))}
        </small>
      </div>
      <div class="badge-stack">${badge(st)}${confBadge(ind.id)}</div>
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
      <button class="btn btn-ghost btn-sm" onclick="openFicha('${ind.id}','historico')">🕘 Histórico</button>
      <button class="btn btn-ghost btn-sm" onclick="quickTask('${ind.id}')">＋ Tarea</button>
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
  const thr = statusThresholds();
  const semHTML = `
    <div class="card card-p">
      <div class="flex items-center justify-between flex-wrap gap-sm" style="margin-bottom:.75rem">
        <div class="card-header-title">Semáforo de estado</div>
        <div class="sem-legend">
          <div class="sem-item"><div class="sem-dot" style="background:#059669"></div> Cumplido ≥ ${thr.achieved}%</div>
          <div class="sem-item"><div class="sem-dot" style="background:#2563EB"></div> En seguimiento ≥ ${thr.on_track}%</div>
          <div class="sem-item"><div class="sem-dot" style="background:#D97706"></div> En riesgo ≥ ${thr.at_risk}%</div>
          <div class="sem-item"><div class="sem-dot" style="background:#DC2626"></div> Urgente &lt; ${thr.at_risk}%</div>
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

  // v2.0 — Qué ha cambiado + destacados
  let changesHTML = '', highlightsHTML = '';
  try { changesHTML = changesBlockHTML(); } catch (e) { console.error('changesBlock', e); }
  try { highlightsHTML = highlightsBlockHTML(); } catch (e) { console.error('highlights', e); }

  el.innerHTML = `<div class="section-gap">${kpiHTML}${semHTML}${ejesHTML}${changesHTML}${highlightsHTML}${chartsHTML}</div>`;

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

  // Opciones de filtro (marcando la opción activa, para poder aplicar filtros guardados)
  const sel = (v, cur) => String(v) === String(cur) ? ' selected' : '';
  const f0 = tableFilters;
  const ejeOpts   = EJES.map(e => `<option value="${e.id}"${sel(e.id, f0.eje)}>Eje ${e.id} — ${e.nombre.split(' ').slice(0,3).join(' ')}</option>`).join('');
  const lineaOpts  = EJES.flatMap(e => e.lineas).map(l => `<option value="${l.id}"${sel(l.id, f0.linea)}>${l.id} — ${l.nombre}</option>`).join('');
  const statusOpts = Object.entries(STATUS_CONFIG).map(([k,v]) => `<option value="${k}"${sel(k, f0.status)}>${v.label}</option>`).join('');
  const perOpts    = [...new Set(INDICADORES_ORIGINAL.map(i => i.per))].map(p => `<option value="${p}"${sel(p, f0.per)}>${p}</option>`).join('');
  const respOpts   = [...new Set(INDICADORES_ORIGINAL.map(i => i.responsable).filter(Boolean))].map(r => `<option value="${r}"${sel(r, f0.responsable)}>${r}</option>`).join('');

  el.innerHTML = `
    <div class="card" style="overflow:hidden">
      ${savedFiltersBarHTML()}
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
        <div class="td-name ind-link" onclick="openFicha('${i.id}')" title="Abrir ficha 360°">${i.nombre}${i.nuevo?'<span class="badge badge-nuevo" style="margin-left:.3rem;font-size:.58rem">N</span>':''}${i._mod?'<span class="badge badge-updated" style="margin-left:.3rem;font-size:.58rem">✎</span>':''}</div>
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
      <td><div class="badge-stack">${badge(st)}${confBadge(i.id)}</div></td>
      <td style="font-size:.74rem;white-space:nowrap;color:var(--muted)">${fmtDate(i.actual.fecha)}</td>
      <td style="font-size:.73rem;color:var(--ink3);white-space:nowrap">${i.per}</td>
      <td style="font-size:.72rem;color:var(--ink3);max-width:140px">${i.responsable || '—'}</td>
      <td class="td-actions"><button class="tbl-btn" onclick="openModal('${i.id}')" title="Abrir ficha 360°">✎</button></td>
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

  const t = statusThresholds();
  const pr = i => Math.round(Math.min(calcProg(i), 100));
  const R = (i, reason) => ({ i, reason });

  // RESULTADO
  const critical = DATA.filter(i => getStatus(i) === 'critical')
    .map(i => R(i, `Avance del ${pr(i)}%, por debajo del umbral de riesgo (${t.at_risk}%).`));
  const atRisk = DATA.filter(i => getStatus(i) === 'at_risk')
    .map(i => R(i, `Avance del ${pr(i)}%, entre el ${t.at_risk}% y el ${t.on_track}%: desviación moderada.`));
  const onTrack = DATA.filter(i => getStatus(i) === 'on_track')
    .map(i => R(i, `Avance del ${pr(i)}%, por encima del ${t.on_track}% y aún sin alcanzar el objetivo.`));
  const estancados = [];
  // POSITIVO
  const achieved = DATA.filter(i => getStatus(i) === 'achieved')
    .map(i => R(i, `Valor ${fmtActual(i)} frente a objetivo ${fmtObj(i)}: meta 2027 alcanzada.`));
  const mejoras = [];
  DATA.forEach(i => {
    const h = getHistory2(i.id);
    if (h.length >= 3 && !i.bin) {
      const last3 = h.slice(0, 3).map(x => String(x.v));
      if (last3.every(v => v === last3[0])) {
        estancados.push(R(i, `Los últimos ${3} registros del histórico mantienen el mismo valor (${fmtNum(i, h[0].v)}).`));
      }
    }
    if (h.length >= 2) {
      const pLast = progForValue(i, i.bin ? h[0].v : parseFloat(h[0].v));
      const pPrev = progForValue(i, i.bin ? h[1].v : parseFloat(h[1].v));
      if (!isNaN(pLast) && !isNaN(pPrev) && pLast - pPrev > 10) {
        mejoras.push(R(i, `El avance sube ${Math.round(pLast - pPrev)} puntos entre los dos últimos registros (${fmtNum(i, h[1].v)} → ${fmtNum(i, h[0].v)}).`));
      }
    }
  });
  // TIEMPO
  const vencidos = DATA.filter(i => updateStatus(i) === 'vencido')
    .sort((a, b) => daysToNextUpdate(a) - daysToNextUpdate(b))
    .map(i => R(i, `Dato de ${fmtDate(i.actual.fecha)} con periodicidad ${i.per.toLowerCase()}: actualización prevista el ${fmtDate(nextUpdateDate(i))} (hace ${Math.abs(daysToNextUpdate(i))} días).`));
  const proximos = DATA.filter(i => { const d = daysToNextUpdate(i); return d !== null && d >= 0 && d <= 15; })
    .sort((a, b) => daysToNextUpdate(a) - daysToNextUpdate(b))
    .map(i => R(i, `Próxima actualización prevista el ${fmtDate(nextUpdateDate(i))} (en ${daysToNextUpdate(i)} días).`));
  // CALIDAD
  const sinFuente = DATA.filter(i => !i.fuente || !String(i.fuente).trim())
    .map(i => R(i, 'No tiene fuente de información asignada.'));
  const sinEvid = DATA.filter(i => getConfidence(i.id) === 'sin_evidencia')
    .map(i => R(i, `Marcado como «sin evidencia»: el valor ${fmtActual(i)} no tiene soporte documental.`));
  const pendientes = DATA.filter(i => getConfidence(i.id) === 'pendiente');
  const sinBase = DATA.filter(i => (i.base.v === null || i.base.v === undefined) && !i.bin && !i.nuevo)
    .map(i => R(i, 'Sin valor de partida 2023: el avance se mide directamente contra el objetivo.'));
  // INFORMATIVO
  const nuevos = DATA.filter(i => i.nuevo).map(i => R(i, 'OKR incorporado en la revisión de 2026.'));

  const grp = (title, dotColor, items, showProg = true, anchor = '') => {
    if (!items.length) return `
      <div class="alert-group"${anchor ? ` id="${anchor}"` : ''}>
        <div class="alert-group-hd" style="color:${dotColor}">
          <div class="alert-group-dot" style="background:${dotColor}"></div>
          ${title} (0)
        </div>
        <div class="empty" style="padding:.75rem"><div class="empty-msg">Sin indicadores en esta categoría</div></div>
      </div>`;
    return `
      <div class="alert-group"${anchor ? ` id="${anchor}"` : ''}>
        <div class="alert-group-hd" style="color:${dotColor}">
          <div class="alert-group-dot" style="background:${dotColor}"></div>
          ${title} (${items.length})
        </div>
        ${items.map(({ i, reason }) => {
          const st = getStatus(i);
          const sc = STATUS_CONFIG[st];
          const p  = Math.min(calcProg(i), 100);
          return `
            <div class="alert-item">
              <div class="alert-dot" style="background:${dotColor}"></div>
              <div>
                <div class="alert-name ind-link" onclick="openFicha('${i.id}')">${i.nombre}</div>
                ${reason ? `<div class="alert-reason">${reason}</div>` : ''}
                <div class="alert-meta">
                  ${i.id} · Eje ${i.eje} · ${i.linea} · Actual: <strong>${fmtActual(i)}</strong> → Objetivo: <strong>${fmtObj(i)}</strong> · ${fmtDate(i.actual.fecha)}
                  ${i.obs ? `<br><em style="font-size:.7rem">${esc(i.obs.substring(0, 120))}${i.obs.length > 120 ? '...' : ''}</em>` : ''}
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
  const cat = (name, desc) => `<div class="alert-cat"><span>${name}</span><small>${desc}</small></div>`;

  const summary = [
    { k: 'al-critical', n: critical.length, l: 'Urgentes', c: '#DC2626' },
    { k: 'al-atrisk',   n: atRisk.length,   l: 'En riesgo', c: '#D97706' },
    { k: 'al-vencidos', n: vencidos.length, l: 'Datos vencidos', c: '#DC2626' },
    { k: 'al-proximos', n: proximos.length, l: 'Vencen ≤ 15 días', c: '#D97706' },
    { k: 'al-sinevid',  n: sinEvid.length,  l: 'Sin evidencia', c: '#DC2626' },
    { k: 'al-achieved', n: achieved.length, l: 'Logros', c: '#059669' }
  ];

  el.innerHTML = `
    <div class="section-gap">
      <div class="alert-summary">
        ${summary.map(s => `<a class="alert-sum-item" href="#" onclick="document.getElementById('${s.k}')?.scrollIntoView({behavior:'smooth'});return false">
          <span class="alert-sum-n" style="color:${s.c}">${s.n}</span><span class="alert-sum-l">${s.l}</span></a>`).join('')}
      </div>

      <div>
        ${cat('Resultado', 'Avance respecto a la meta 2027')}
        ${grp(`CRÍTICO — Atención urgente (< ${t.at_risk}%)`, '#DC2626', critical, true, 'al-critical')}
        ${grp(`EN RIESGO — Seguimiento reforzado (${t.at_risk}–${t.on_track}%)`, '#D97706', atRisk, true, 'al-atrisk')}
        ${grp('ESTANCADOS — Sin variación en los últimos registros', '#9A3412', estancados)}
        ${grp(`EN SEGUIMIENTO — Evolución favorable (${t.on_track}–${t.achieved}%)`, '#2563EB', onTrack)}
      </div>

      <div>
        ${cat('Tiempo', 'Vigencia de los datos según su periodicidad')}
        ${grp('DATOS VENCIDOS — Actualización prevista ya superada', '#DC2626', vencidos, true, 'al-vencidos')}
        ${grp('PRÓXIMOS A VENCER — En los próximos 15 días', '#D97706', proximos, true, 'al-proximos')}
      </div>

      <div>
        ${cat('Calidad', 'Solidez y trazabilidad del dato')}
        ${grp('SIN FUENTE — Indicadores sin fuente de información', '#DC2626', sinFuente)}
        ${grp('SIN EVIDENCIA — Valor sin soporte documental', '#DC2626', sinEvid, true, 'al-sinevid')}
        <div class="alert-group">
          <div class="alert-group-hd" style="color:#6B7280">
            <div class="alert-group-dot" style="background:#6B7280"></div>
            CONFIANZA PENDIENTE — Calidad del dato aún no revisada (${pendientes.length})
          </div>
          ${pendientes.length ? `
            <div class="alert-reason" style="margin:.25rem 0 .5rem">Nivel de confianza por defecto: revisa cada dato en su ficha 360° (pestaña Seguimiento) y márcalo como validado, provisional o sin evidencia.</div>
            <div class="chip-list">${pendientes.map(i => `<span class="chip" onclick="openFicha('${i.id}','seguimiento')" title="${esc(i.nombre)}">${i.id}</span>`).join('')}</div>`
          : `<div class="empty" style="padding:.75rem"><div class="empty-msg">Todos los indicadores tienen el nivel de confianza revisado</div></div>`}
        </div>
        ${sinBase.length ? grp('SIN BASE — Indicadores sin situación de partida registrada', '#6B7280', sinBase, true) : ''}
      </div>

      <div>
        ${cat('Positivo', 'Logros y mejoras recientes')}
        ${grp('LOGROS — Objetivos alcanzados', '#059669', achieved, false, 'al-achieved')}
        ${grp('MEJORA SIGNIFICATIVA — Más de 10 puntos de avance en el último registro', '#059669', mejoras)}
      </div>

      ${nuevos.length ? `<div>
        ${cat('Informativo', 'Cambios en el cuadro de mando')}
        ${grp('INFORMATIVOS — Nuevos OKRs incorporados en 2026', '#0369A1', nuevos, true)}
      </div>` : ''}
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
                  <button class="btn btn-ghost btn-sm" onclick="openFicha('${i.id}','actualizar')">✎ Editar</button>
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
                ${badge(getStatus(i))}${confBadge(i.id)}${updBadge(updateStatus(i))}
                <button class="btn btn-ghost btn-sm" onclick="openFicha('${i.id}','actualizar')">✎ Actualizar</button>
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

      ${informeGestionHTML()}

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
// v2.0: el modal de actualización se sustituye por la Ficha 360° (ver más abajo).
// openModal se mantiene como punto de entrada para no romper ninguna llamada existente.
function openModal(id) {
  openFicha(id, 'situacion');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal-box')?.classList.remove('ficha');
  destroyChart('ch-ficha-hist');
  modalEditId = null;
  const wasDirty = fichaState.dirty;
  fichaState = { id: null, tab: 'situacion', dirty: false };
  // Si en la ficha se cambiaron confianza/comentarios/evidencias, refrescar la vista de fondo
  if (wasDirty) navigate(currentView);
}

function saveModal() {
  try {
    if (!modalEditId) return;
    const i = DATA.find(x => x.id === modalEditId);
    if (!i) { closeModal(); return; }
    const v      = document.getElementById('m-val')?.value;
    const fecha  = document.getElementById('m-fecha')?.value;
    const obs    = document.getElementById('m-obs')?.value;
    const coment = (document.getElementById('m-coment')?.value || '').trim();
    const conf   = document.getElementById('m-conf')?.value;
    if (v === undefined || v === null || String(v).trim() === '') { toast('Introduce un valor', 'error'); return; }
    if (!i.bin && isNaN(parseFloat(v))) { toast('El valor debe ser numérico', 'error'); return; }
    if (fecha && fecha > todayISO()) { toast('La fecha del dato no puede ser posterior a hoy', 'error'); return; }
    const id = modalEditId;
    saveUpdate(id, v, fecha, obs, { comentario: coment, confianza: conf });
    // Después de guardar: el registro de referencia conserva la confianza previa
    if (conf && CONFIDENCE_CONFIG[conf]) setConfidence(id, conf);
    fichaState.dirty = false;
    closeModal();
    navigate(currentView);
  } catch (e) {
    console.error('saveModal', e);
    toast('No se ha podido guardar la actualización', 'error');
  }
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

  // Buscador global (v2.0)
  const sInput = document.getElementById('search-input');
  if (sInput) {
    sInput.addEventListener('input', e => doSearch(e.target.value));
    sInput.addEventListener('keydown', searchKeyNav);
  }

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


/* ═══════════════════════════════════════════════════════════
   v2.0 — NUEVAS VISTAS Y COMPONENTES
   ═══════════════════════════════════════════════════════════ */

// ── HELPERS v2 ───────────────────────────────────────────────
function confBadge(id) {
  const lvl = getConfidence(id);
  const c = CONFIDENCE_CONFIG[lvl] || CONFIDENCE_CONFIG.pendiente;
  return `<span class="conf-badge conf-${lvl}" title="Nivel de confianza del dato">◉ ${c.label}</span>`;
}

// compact=true: solo muestra el badge cuando hay algo que vigilar (vencido / próximo)
function updBadge(st, compact = true) {
  if (compact && (st === 'al_dia' || st === 'sin_fecha')) return '';
  const c = UPDATE_STATUS_CONFIG[st] || UPDATE_STATUS_CONFIG.sin_fecha;
  return `<span class="upd-badge upd-${st}" title="Estado de actualización del dato">${st === 'vencido' ? '⏰ ' : ''}${c.label}</span>`;
}

function viabBadge(v) {
  const c = VIABILITY_CONFIG[v] || VIABILITY_CONFIG.sin_datos;
  return `<span class="viab-badge viab-${v}">${c.label.toUpperCase()}</span>`;
}

function prioBadge(p) {
  const c = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.media;
  return `<span class="prio-badge prio-${p}">${c.label}</span>`;
}

function indById(id) { return id ? DATA.find(x => x.id === id) || null : null; }

function indOptions(selected = '') {
  return `<option value="">— Sin indicador vinculado —</option>` + EJES.map(e => `
    <optgroup label="Eje ${e.id} · ${e.nombre}">
      ${DATA.filter(i => i.eje === e.id).map(i => `<option value="${i.id}"${i.id === selected ? ' selected' : ''}>${i.id} · ${i.nombre.length > 70 ? i.nombre.substring(0, 70) + '…' : i.nombre}</option>`).join('')}
    </optgroup>`).join('');
}

function respDatalist(id) {
  const resp = [...new Set(INDICADORES_ORIGINAL.map(i => i.responsable).filter(Boolean))];
  return `<datalist id="${id}">${resp.map(r => `<option value="${esc(r)}">`).join('')}</datalist>`;
}

function indLinkHTML(i) {
  return `<span class="ind-link" onclick="openFicha('${i.id}')">${i.id} · ${i.nombre}</span>`;
}

function isModalOpen() { return document.getElementById('modal-overlay')?.classList.contains('open'); }

// Ir a la tarjeta del indicador en su eje y resaltarla
function goToIndicator(id) {
  const i = indById(id);
  if (!i) return;
  if (isModalOpen()) closeModal();
  if (isComiteOpen()) toggleComiteMode(false);
  navigate('eje-' + i.eje);
  setTimeout(() => {
    const c = document.getElementById('card-' + id);
    if (c) {
      c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      c.classList.add('flash');
      setTimeout(() => c.classList.remove('flash'), 2200);
    }
  }, 60);
}

function emptyBox(msg, icon = '') {
  return `<div class="empty" style="padding:1.25rem">${icon ? `<div class="empty-icon" style="font-size:1.6rem">${icon}</div>` : ''}<div class="empty-msg">${msg}</div></div>`;
}

// ═══ F1 · FICHA 360° ═════════════════════════════════════════
let fichaState = { id: null, tab: 'situacion', dirty: false };
const FICHA_TABS = [
  ['situacion',   'Situación'],
  ['historico',   'Histórico'],
  ['seguimiento', 'Seguimiento'],
  ['evidencias',  'Evidencias'],
  ['actualizar',  'Actualizar']
];

function openFicha(id, tab = 'situacion') {
  try {
    const i = indById(id);
    if (!i) return;
    const keepDirty = fichaState.id === id && fichaState.dirty;
    destroyChart('ch-ficha-hist');
    modalEditId = id;
    fichaState = { id, tab, dirty: keepDirty };
    document.getElementById('modal-heading').innerHTML = `<span class="ficha-hd-code">${i.id}</span> Ficha 360° del indicador`;
    document.getElementById('modal-box')?.classList.add('ficha');
    document.getElementById('modal-body').innerHTML = fichaHTML(i);
    document.getElementById('modal-overlay').classList.add('open');
    setFichaTab(tab);
  } catch (e) {
    console.error('openFicha', e);
    toast('Error al abrir la ficha del indicador', 'error');
  }
}

function setFichaTab(tab) {
  fichaState.tab = tab;
  document.querySelectorAll('#modal-body .ficha-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('#modal-body .ficha-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) saveBtn.style.display = tab === 'actualizar' ? '' : 'none';
  if (tab === 'historico') {
    const i = indById(fichaState.id);
    if (i) setTimeout(() => { try { renderFichaHistChart(i); } catch (e) { console.error('chart ficha', e); } }, 30);
  }
}

function refreshFicha(tab) {
  fichaState.dirty = true;
  openFicha(fichaState.id, tab || fichaState.tab);
}

function fichaMetrics(i) {
  const p = calcProg(i);
  const hasBase = !i.bin && i.base.v !== null && i.base.v !== undefined;
  const a = +i.actual.v, o = +i.obj, b = hasBase ? +i.base.v : null;
  const dif = hasBase ? a - b : null;
  const brecha = i.bin ? null : o - a;
  const cerrada = hasBase && (o - b) !== 0 ? Math.round(((a - b) / (o - b)) * 100) : null;
  return { p, hasBase, dif, brecha, cerrada };
}

function fichaHTML(i) {
  const st = getStatus(i);
  const counts = { historico: getHistory2(i.id).length, seguimiento: getComments(i.id).length, evidencias: getEvidences(i.id).length };
  return `
    <div class="ficha-title">
      <div class="ficha-name">${i.nombre}</div>
      <div class="ficha-badges">
        ${badge(st)}${confBadge(i.id)}${updBadge(updateStatus(i), false)}
        ${i.nuevo ? '<span class="badge badge-nuevo">NUEVO</span>' : ''}
        ${i._mod ? '<span class="badge badge-updated">✎ Actualizado localmente</span>' : '<span class="badge badge-orig">Dato original</span>'}
        ${loadHighlights().includes(i.id) ? '<span class="badge badge-hl">★ Destacado</span>' : ''}
      </div>
    </div>
    <div class="ficha-tabs" role="tablist">
      ${FICHA_TABS.map(([k, l]) => `<div class="ficha-tab" role="tab" data-tab="${k}" onclick="setFichaTab('${k}')">${l}${counts[k] ? ` <span class="ficha-tab-n">${counts[k]}</span>` : ''}</div>`).join('')}
    </div>
    <div class="ficha-panel" data-panel="situacion">${fichaSituacion(i)}</div>
    <div class="ficha-panel" data-panel="historico">${fichaHistorico(i)}</div>
    <div class="ficha-panel" data-panel="seguimiento">${fichaSeguimiento(i)}</div>
    <div class="ficha-panel" data-panel="evidencias">${fichaEvidencias(i)}</div>
    <div class="ficha-panel" data-panel="actualizar">${fichaActualizar(i)}</div>`;
}

function fichaSituacion(i) {
  const st = getStatus(i), sc = STATUS_CONFIG[st];
  const eje = EJES.find(e => e.id === i.eje);
  const linea = eje?.lineas.find(l => l.id === i.linea);
  const m = fichaMetrics(i);
  const tipo = i.bin ? 'Binario (Sí/No)' : i.inv ? 'Invertido (% de reducción)' : m.hasBase ? 'Estándar (base → objetivo)' : 'Sin base (actual / objetivo)';
  const ident = [
    ['Código', `<strong>${i.id}</strong>`],
    ['Eje', `<span style="color:${ejeColor(i.eje)};font-weight:700">Eje ${i.eje}</span> · ${eje?.nombre || ''}`],
    ['Línea', `${i.linea} · ${linea?.nombre || ''}`],
    ['Unidad', i.unidad],
    ['Fuente', i.fuente || '<span style="color:var(--crit)">Sin fuente</span>'],
    ['Periodicidad', i.per],
    ['Responsable', i.responsable || '—'],
    ['Tipo de cálculo', tipo]
  ];

  let brechaTxt, brechaSub;
  if (i.bin) { brechaTxt = String(i.actual.v) === String(i.obj) ? 'Ninguna' : `Pendiente «${i.obj}»`; brechaSub = 'Indicador binario'; }
  else if (m.brecha <= 0) { brechaTxt = fmtDiff(i, 0, false); brechaSub = m.brecha < 0 ? `Objetivo superado en ${fmtDiff(i, -m.brecha, false)}` : 'Objetivo alcanzado'; }
  else { brechaTxt = fmtDiff(i, m.brecha, false); brechaSub = `Hasta ${fmtObj(i)}`; }

  const metric = (k, v, sub, color = '') => `
    <div class="fm"><div class="fm-k">${k}</div><div class="fm-v"${color ? ` style="color:${color}"` : ''}>${v}</div><div class="fm-sub">${sub}</div></div>`;

  const metricsHTML = `
    <div class="ficha-metrics">
      ${metric('Diferencia desde base', m.hasBase ? fmtDiff(i, m.dif) : '—', m.hasBase ? `${fmtBase(i)} → ${fmtActual(i)}` : (i.bin ? 'Indicador binario' : 'Indicador sin base'), m.hasBase ? (m.dif > 0 ? 'var(--achieved)' : m.dif < 0 ? 'var(--crit)' : '') : '')}
      ${metric('Brecha restante', brechaTxt, brechaSub)}
      ${metric('% brecha cerrada', m.cerrada !== null ? m.cerrada + '%' : '—', m.cerrada !== null ? 'Desde la base 2023' : 'Requiere valor base')}
      ${metric('Avance', Math.round(m.p) + '%', badge(st), sc.color)}
    </div>`;

  // Ritmo
  let ritmoHTML = '';
  const r = calcRhythm(i);
  if (r && r.cumplido) {
    ritmoHTML = `<div class="ficha-block"><div class="ficha-block-hd">Ritmo hacia 2027</div><div class="ficha-ok">✅ Objetivo 2027 alcanzado</div></div>`;
  } else if (r) {
    const fuente = r.fuenteRitmo === 'historico' ? 'según histórico registrado' : r.fuenteRitmo === 'base' ? 'estimado base → actual' : '';
    ritmoHTML = `
      <div class="ficha-block">
        <div class="ficha-block-hd">Ritmo hacia ${fmtDate(loadConfig().fechaFinEstrategia)} <span style="margin-left:auto">${viabBadge(r.viabilidad)}</span></div>
        <div class="ficha-rhythm">
          <div><div class="fm-k">Brecha restante</div><div class="fr-v">${fmtDiff(i, r.brechaRestante, false)}</div></div>
          <div><div class="fm-k">Meses hasta fin</div><div class="fr-v">${r.mesesRestantes}</div><div class="fm-sub">≈ ${String(r.trimestresRestantes).replace('.', ',')} trimestres</div></div>
          <div><div class="fm-k">Ritmo necesario</div><div class="fr-v">${fmtDiff(i, r.ritmoNecesarioTrimestre, false)}</div><div class="fm-sub">por trimestre</div></div>
          <div><div class="fm-k">Ritmo real</div><div class="fr-v">${r.ritmoRealTrimestre !== null ? fmtDiff(i, r.ritmoRealTrimestre) : '—'}</div><div class="fm-sub">${r.ritmoRealTrimestre !== null ? 'por trimestre · ' + fuente : 'sin datos suficientes'}</div></div>
          <div><div class="fm-k">Proyección a fin</div><div class="fr-v">${r.proyeccion !== null ? fmtNum(i, Math.round(r.proyeccion * 100) / 100) : '—'}</div><div class="fm-sub">${r.proyeccion !== null ? 'si se mantiene el ritmo real' : 'sin ritmo real'}</div></div>
        </div>
        <div class="ficha-note">${
          r.viabilidad === 'alineado' ? 'El ritmo observado es suficiente para alcanzar el objetivo en plazo.' :
          r.viabilidad === 'requiere_aceleracion' ? 'El ritmo observado cubre al menos el 60% del necesario: hay que acelerar para llegar en plazo.' :
          r.viabilidad === 'riesgo_incumplimiento' ? 'El ritmo observado es inferior al 60% del necesario: el objetivo no se alcanzará sin un cambio sustancial.' :
          'No hay base ni histórico suficiente para estimar el ritmo real. Se calculará a partir del segundo registro en el histórico.'}</div>
      </div>`;
  }

  return `
    <div class="ficha-block">
      <div class="ficha-block-hd">Identificación</div>
      <div class="ficha-desc">${i.descripcion || ''}</div>
      <div class="ficha-ident">${ident.map(([k, v]) => `<div><div class="fm-k">${k}</div><div class="fi-v">${v}</div></div>`).join('')}</div>
    </div>
    <div class="ficha-block">
      <div class="ficha-block-hd">Base → Actual → Objetivo</div>
      <div class="ficha-bao">
        <div class="bao-box">
          <div class="fm-k">Base ${i.base.año || ''}</div>
          <div class="bao-v">${fmtBase(i)}</div>
          <div class="bao-pct">0%</div>
          <div class="pb-wrap pb-6"><div class="pb-fill" style="width:0"></div></div>
          <div class="fm-sub">${m.hasBase ? 'Punto de partida' : 'Sin base registrada'}</div>
        </div>
        <div class="bao-arrow">→</div>
        <div class="bao-box" style="border-color:${sc.border};background:${sc.bg}">
          <div class="fm-k">Actual</div>
          <div class="bao-v" style="color:${sc.color}">${fmtActual(i)}</div>
          <div class="bao-pct" style="color:${sc.color}">${Math.round(m.p)}%</div>
          ${progBar(i, 'pb-6')}
          <div class="fm-sub">${fmtDate(i.actual.fecha)}</div>
        </div>
        <div class="bao-arrow">→</div>
        <div class="bao-box">
          <div class="fm-k">Objetivo 2027</div>
          <div class="bao-v">${fmtObj(i)}</div>
          <div class="bao-pct">100%</div>
          <div class="pb-wrap pb-6"><div class="pb-fill pb-achieved" style="width:100%"></div></div>
          <div class="fm-sub">Meta</div>
        </div>
      </div>
    </div>
    ${metricsHTML}
    ${ritmoHTML}
    ${i.obs ? `<div class="ficha-block"><div class="ficha-block-hd">Observaciones</div><div class="ind-obs" style="margin-top:0">${esc(i.obs)}</div></div>` : ''}`;
}

function fichaHistorico(i) {
  const h = getHistory2(i.id);
  if (!h.length) {
    return `<div class="ficha-empty">Sin historial disponible. Al actualizar el indicador, los valores quedarán registrados automáticamente.</div>`;
  }
  const rows = h.map((e, idx) => {
    const prev = h[idx + 1];
    let varTxt = '<span class="txt-flat">—</span>';
    if (prev) {
      if (i.bin) varTxt = String(prev.v) === String(e.v) ? '<span class="txt-flat">→ Sin cambio</span>' : `<span class="${String(e.v) === String(i.obj) ? 'txt-up' : 'txt-down'}">${esc(prev.v)} → ${esc(e.v)}</span>`;
      else {
        const d = parseFloat(e.v) - parseFloat(prev.v);
        varTxt = `<span class="${d > 0 ? 'txt-up' : d < 0 ? 'txt-down' : 'txt-flat'}">${d > 0 ? '↑' : d < 0 ? '↓' : '→'} ${fmtDiff(i, d)}</span>`;
      }
    }
    const cc = CONFIDENCE_CONFIG[e.confianza];
    return `<tr>
      <td style="white-space:nowrap">${fmtDate(e.fecha)}</td>
      <td class="td-num">${fmtNum(i, e.v)}</td>
      <td style="white-space:nowrap">${varTxt}</td>
      <td style="white-space:nowrap;color:var(--muted)">${fmtDateTime(e.cargadoEn)}</td>
      <td>${esc(e.usuario)}</td>
      <td>${esc(e.comentario) || '<span style="color:var(--muted)">—</span>'}${cc ? ` <span class="conf-badge conf-${e.confianza}">${cc.label}</span>` : ''}</td>
    </tr>`;
  }).join('');
  const chart = h.length >= 2 && !i.bin ? `<div class="ficha-chart"><canvas id="ch-ficha-hist"></canvas></div>` : '';
  return `
    ${chart}
    <div class="table-wrap">
      <table class="data-table ficha-table">
        <thead><tr><th>Fecha dato</th><th>Valor</th><th>Variación vs anterior</th><th>Cargado en</th><th>Usuario</th><th>Comentario</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="ficha-note">${h.length} registro${h.length === 1 ? '' : 's'}. El primer registro de cada indicador corresponde al valor vigente antes de su primera actualización en esta herramienta.</div>`;
}

function renderFichaHistChart(i) {
  destroyChart('ch-ficha-hist');
  const ctx = document.getElementById('ch-ficha-hist');
  if (!ctx || typeof Chart === 'undefined') return;
  const h = getHistory2(i.id).filter(x => !isNaN(parseFloat(x.v))).slice().reverse();
  if (h.length < 2) return;
  CHART_REGISTRY['ch-ficha-hist'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: h.map(x => fmtDate(x.fecha)),
      datasets: [
        { label: 'Valor registrado', data: h.map(x => parseFloat(x.v)), borderColor: ejeColor(i.eje), backgroundColor: ejeColor(i.eje), tension: .25, pointRadius: 4, borderWidth: 2 },
        { label: 'Objetivo 2027', data: h.map(() => +i.obj), borderColor: '#94A3B8', borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 10 } } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } } }
    }
  });
}

function fichaSeguimiento(i) {
  const next = nextUpdateDate(i);
  const d = daysToNextUpdate(i);
  const us = updateStatus(i);
  const desde = i.actual.fecha ? daysBetween(i.actual.fecha, todayISO()) : null;
  const usc = UPDATE_STATUS_CONFIG[us];
  const usTxt = us === 'vencido' ? `Vencido hace ${Math.abs(d)} días` : us === 'proximo' ? (d === 0 ? 'Vence hoy' : `Vence en ${d} días`) : us === 'al_dia' ? `Faltan ${d} días` : (PER_DAYS[i.per] ? 'Sin fecha de dato' : `Periodicidad «${i.per}»: sin vencimiento`);
  const cur = getConfidence(i.id);
  const comments = getComments(i.id);
  const tasks = loadTasks().filter(t => t.indicadorId === i.id);
  const decs = loadDecisions().filter(x => x.indicadorId === i.id);

  return `
    <div class="ficha-metrics">
      <div class="fm"><div class="fm-k">Fecha último dato</div><div class="fm-v">${fmtDate(i.actual.fecha)}</div><div class="fm-sub">${i.per}</div></div>
      <div class="fm"><div class="fm-k">Próxima actualización prevista</div><div class="fm-v">${next ? fmtDate(next) : '—'}</div><div class="fm-sub">${PER_DAYS[i.per] ? `+${PER_DAYS[i.per]} días desde el último dato` : 'Sin periodicidad definida'}</div></div>
      <div class="fm"><div class="fm-k">Días desde última actualización</div><div class="fm-v">${desde !== null ? desde : '—'}</div><div class="fm-sub">días naturales</div></div>
      <div class="fm" style="border-color:${usc.border};background:${usc.bg}"><div class="fm-k">Estado de actualización</div><div class="fm-v" style="color:${usc.color}">${usc.label.toUpperCase()}</div><div class="fm-sub">${usTxt}</div></div>
    </div>

    <div class="ficha-block">
      <div class="ficha-block-hd">Nivel de confianza del dato</div>
      <div class="conf-opts">
        ${Object.entries(CONFIDENCE_CONFIG).map(([k, c]) => `
          <button class="conf-opt${cur === k ? ' active' : ''}" style="--cc:${c.color};--cbg:${c.bg};--cbd:${c.border}" onclick="fichaSetConfidence('${i.id}','${k}')">${cur === k ? '● ' : '○ '}${c.label}</button>`).join('')}
      </div>
      <div class="ficha-note">Se guarda al pulsar. Consulta el significado de cada nivel en <a href="#" onclick="closeModal();navigate('metodologia');return false">Metodología</a>.</div>
    </div>

    <div class="ficha-block">
      <div class="ficha-block-hd">Comentarios de seguimiento (${comments.length})</div>
      ${comments.length ? `<div class="comment-list">${comments.map(c => `
        <div class="comment">
          <div class="comment-hd"><strong>${esc(c.usuario)}</strong> · ${fmtDateTime(c.fecha)}
            <button class="icon-btn" title="Eliminar comentario" onclick="fichaDelComment('${c.id}')">✕</button></div>
          <div class="comment-txt">${esc(c.texto)}</div>
        </div>`).join('')}</div>` : '<div class="ficha-note" style="margin-top:0">Aún no hay comentarios para este indicador.</div>'}
      <div class="form-group" style="margin:.75rem 0 .5rem">
        <textarea class="form-input" id="f-com" placeholder="Añade un comentario de seguimiento (contexto, incidencias, próximos pasos...)"></textarea>
      </div>
      <button class="btn btn-primary btn-sm" onclick="fichaAddComment('${i.id}')">💬 Guardar comentario</button>
    </div>

    <div class="ficha-block">
      <div class="ficha-block-hd">Gestión vinculada
        <span style="margin-left:auto"><button class="btn btn-ghost btn-sm" onclick="quickTask('${i.id}')">＋ Crear tarea</button></span></div>
      <div class="ficha-linked">
        <div>
          <div class="fm-k">Tareas (${tasks.length})</div>
          ${tasks.length ? tasks.map(t => `<div class="linked-item"><span class="task-state-dot" style="background:${TASK_STATES[t.estado]?.color}"></span>${esc(t.titulo)} <span class="linked-meta">${TASK_STATES[t.estado]?.label || t.estado}${t.fechaLimite ? ' · ' + fmtDate(t.fechaLimite) : ''}</span></div>`).join('') : '<div class="linked-meta">Sin tareas vinculadas</div>'}
        </div>
        <div>
          <div class="fm-k">Decisiones (${decs.length})</div>
          ${decs.length ? decs.map(x => `<div class="linked-item"><span class="task-state-dot" style="background:${DECISION_STATES[x.estado]?.color}"></span>${esc(x.problema)} <span class="linked-meta">${DECISION_STATES[x.estado]?.label || x.estado}</span></div>`).join('') : '<div class="linked-meta">Sin decisiones vinculadas</div>'}
        </div>
      </div>
    </div>`;
}

function fichaEvidencias(i) {
  const evs = getEvidences(i.id);
  return `
    ${evs.length ? `<div class="ev-list">${evs.map(e => {
      const u = safeUrl(e.url);
      return `
      <div class="ev-item">
        <div class="ev-main">
          <div class="ev-name">📄 ${u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(e.nombre || u)}</a>` : esc(e.nombre || '(sin nombre)')}</div>
          <div class="ev-meta">
            ${e.fuente ? `<span>Fuente: <strong>${esc(e.fuente)}</strong></span>` : ''}
            ${e.referencia ? `<span>Ref.: ${esc(e.referencia)}</span>` : ''}
            ${u ? `<span class="ev-url">${esc(u)}</span>` : ''}
            <span>Añadida ${fmtDateTime(e.creadaEn)}${e.usuario ? ' · ' + esc(e.usuario) : ''}</span>
          </div>
          ${e.nota ? `<div class="ev-nota">${esc(e.nota)}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="fichaDelEvidence('${e.id}')">🗑 Eliminar</button>
      </div>`;
    }).join('')}</div>` : `<div class="ficha-empty">No hay evidencias registradas. Añade la fuente documental que respalda el valor del indicador.</div>`}

    <div class="ficha-block">
      <div class="ficha-block-hd">Añadir evidencia</div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Fuente</label><input class="form-input" id="f-ev-fuente" placeholder="p. ej. ${esc(i.fuente || 'INE')}"></div>
        <div class="form-group"><label class="form-label">Documento / nombre *</label><input class="form-input" id="f-ev-nombre" placeholder="p. ej. Informe de avances ETDE27 v00.04"></div>
        <div class="form-group"><label class="form-label">URL (opcional)</label><input class="form-input" id="f-ev-url" placeholder="https://..."></div>
        <div class="form-group"><label class="form-label">Referencia</label><input class="form-input" id="f-ev-ref" placeholder="p. ej. diapositiva 12, tabla 3"></div>
      </div>
      <div class="form-group"><label class="form-label">Nota</label><textarea class="form-input" id="f-ev-nota" placeholder="Qué acredita esta evidencia"></textarea></div>
      <button class="btn btn-primary btn-sm" onclick="fichaAddEvidence('${i.id}')">＋ Añadir evidencia</button>
    </div>`;
}

function fichaActualizar(i) {
  const cur = getConfidence(i.id);
  const valField = i.bin
    ? `<select class="form-input" id="m-val">
         <option value="Sí"${String(i.actual.v) === 'Sí' ? ' selected' : ''}>Sí</option>
         <option value="No"${String(i.actual.v) === 'No' ? ' selected' : ''}>No</option>
       </select>`
    : `<input type="number" class="form-input" id="m-val" value="${i.actual.v}" step="any" min="0">`;
  return `
    <div class="ficha-bao-mini">
      <span>Base: <strong>${fmtBase(i)}</strong></span><span class="metodo-arrow">→</span>
      <span>Actual: <strong style="color:${STATUS_CONFIG[getStatus(i)].color}">${fmtActual(i)}</strong></span><span class="metodo-arrow">→</span>
      <span>Objetivo: <strong>${fmtObj(i)}</strong></span>
      <span>· Avance actual: <strong>${fmtProg(i)}</strong></span>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Nuevo valor actual (${i.unidad})</label>
        ${valField}
        <div class="form-hint">Valor vigente: ${fmtActual(i)} · Objetivo 2027: ${fmtObj(i)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha del dato</label>
        <div class="flex gap-sm">
          <input type="date" class="form-input" id="m-fecha" value="${i.actual.fecha || ''}" max="${todayISO()}">
          <button class="btn btn-ghost btn-sm" type="button" onclick="document.getElementById('m-fecha').value='${todayISO()}'">Hoy</button>
        </div>
        <div class="form-hint">Fecha a la que se refiere el dato (no la de carga). Determina el calendario de actualizaciones.</div>
      </div>
      <div class="form-group">
        <label class="form-label">Confianza del dato</label>
        <select class="form-input" id="m-conf">
          ${Object.entries(CONFIDENCE_CONFIG).map(([k, c]) => `<option value="${k}"${cur === k ? ' selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Comentario de la actualización</label>
        <input type="text" class="form-input" id="m-coment" placeholder="p. ej. Dato del informe semestral de la SGAD">
        <div class="form-hint">Queda registrado en el histórico junto al usuario «${esc(currentUser())}».</div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Observaciones del indicador</label>
      <textarea class="form-input" id="m-obs">${esc(i.obs || '')}</textarea>
    </div>
    <div class="ficha-actions-row">
      <button class="btn btn-ghost btn-sm" onclick="exportFichaTxt('${i.id}')">⬇ Exportar ficha (.txt)</button>
      ${i._mod ? `<button class="btn btn-danger btn-sm" onclick="if(confirm('¿Restaurar el valor original de este indicador?')){resetOne('${i.id}');fichaState.dirty=false;closeModal();navigate(currentView)}">↺ Restaurar original</button>` : ''}
      <span class="ficha-note" style="margin:0 0 0 auto">Pulsa «Guardar cambios» para registrar la actualización.</span>
    </div>`;
}

function fichaSetConfidence(id, lvl) {
  try { setConfidence(id, lvl); toast('Nivel de confianza: ' + CONFIDENCE_CONFIG[lvl].label, 'success'); refreshFicha('seguimiento'); }
  catch (e) { console.error(e); toast('No se ha podido guardar', 'error'); }
}
function fichaAddComment(id) {
  const t = (document.getElementById('f-com')?.value || '').trim();
  if (!t) { toast('Escribe un comentario', 'error'); return; }
  addComment(id, t);
  toast('Comentario guardado', 'success');
  refreshFicha('seguimiento');
}
function fichaDelComment(cid) {
  if (!confirm('¿Eliminar este comentario?')) return;
  deleteComment(cid);
  refreshFicha('seguimiento');
}
function fichaAddEvidence(id) {
  const g = k => (document.getElementById(k)?.value || '').trim();
  const ev = { fuente: g('f-ev-fuente'), nombre: g('f-ev-nombre'), url: g('f-ev-url'), referencia: g('f-ev-ref'), nota: g('f-ev-nota') };
  if (!ev.nombre) { toast('Indica el nombre del documento', 'error'); return; }
  if (ev.url && !safeUrl(ev.url)) { toast('La URL debe empezar por http:// o https://', 'error'); return; }
  addEvidence(id, ev);
  toast('Evidencia añadida', 'success');
  refreshFicha('evidencias');
}
function fichaDelEvidence(eid) {
  if (!confirm('¿Eliminar esta evidencia?')) return;
  deleteEvidence(eid);
  refreshFicha('evidencias');
}

function exportFichaTxt(id) {
  const i = indById(id);
  if (!i) return;
  const eje = EJES.find(e => e.id === i.eje);
  const linea = eje?.lineas.find(l => l.id === i.linea);
  const m = fichaMetrics(i);
  const r = calcRhythm(i);
  const h = getHistory2(i.id), com = getComments(i.id), ev = getEvidences(i.id);
  const L = [];
  const sep = '─'.repeat(64);
  L.push(`FICHA 360° DEL INDICADOR ${i.id}`, i.nombre, `ETDE27 · Generada el ${fmtDateTime(new Date().toISOString())} por ${currentUser()}`, sep);
  L.push('IDENTIFICACIÓN',
    `Eje:           ${i.eje} · ${eje?.nombre || ''}`,
    `Línea:         ${i.linea} · ${linea?.nombre || ''}`,
    `Descripción:   ${i.descripcion || ''}`,
    `Unidad:        ${i.unidad}`,
    `Fuente:        ${i.fuente || '—'}`,
    `Periodicidad:  ${i.per}`,
    `Responsable:   ${i.responsable || '—'}`, sep);
  L.push('SITUACIÓN',
    `Base ${i.base.año || ''}:     ${fmtBase(i)}`,
    `Actual:        ${fmtActual(i)} (${fmtDate(i.actual.fecha)})${i._mod ? ' · actualizado localmente' : ''}`,
    `Objetivo 2027: ${fmtObj(i)}`,
    `Avance:        ${Math.round(m.p)}% · ${statusLabel(getStatus(i))}`,
    `Confianza:     ${CONFIDENCE_CONFIG[getConfidence(i.id)].label}`,
    `Dif. desde base:   ${m.hasBase ? fmtDiff(i, m.dif) : '—'}`,
    `Brecha restante:   ${m.brecha === null ? '—' : fmtDiff(i, Math.max(0, m.brecha), false)}`,
    `% brecha cerrada:  ${m.cerrada !== null ? m.cerrada + '%' : '—'}`, sep);
  if (r) {
    L.push('RITMO');
    if (r.cumplido) L.push('Objetivo 2027 alcanzado');
    else L.push(
      `Meses hasta fin:        ${r.mesesRestantes}`,
      `Ritmo necesario/trim.:  ${fmtDiff(i, r.ritmoNecesarioTrimestre, false)}`,
      `Ritmo real/trim.:       ${r.ritmoRealTrimestre !== null ? fmtDiff(i, r.ritmoRealTrimestre) + (r.fuenteRitmo === 'base' ? ' (estimado base → actual)' : ' (histórico)') : '—'}`,
      `Viabilidad:             ${VIABILITY_CONFIG[r.viabilidad].label}`);
    L.push(sep);
  }
  const next = nextUpdateDate(i);
  L.push('SEGUIMIENTO',
    `Próxima actualización:  ${next ? fmtDate(next) : '—'}`,
    `Estado actualización:   ${UPDATE_STATUS_CONFIG[updateStatus(i)].label}`, sep);
  if (i.obs) L.push('OBSERVACIONES', i.obs, sep);
  L.push(`HISTÓRICO (${h.length})`);
  h.forEach(e => L.push(`  ${fmtDate(e.fecha)}  ${fmtNum(i, e.v)}  · ${e.usuario}${e.comentario ? ' · ' + e.comentario : ''}`));
  if (!h.length) L.push('  Sin historial');
  L.push(sep, `COMENTARIOS (${com.length})`);
  com.forEach(c => L.push(`  ${fmtDateTime(c.fecha)} · ${c.usuario}: ${c.texto}`));
  if (!com.length) L.push('  Sin comentarios');
  L.push(sep, `EVIDENCIAS (${ev.length})`);
  ev.forEach(e => L.push(`  ${e.nombre}${e.fuente ? ' · ' + e.fuente : ''}${e.referencia ? ' · ref. ' + e.referencia : ''}${e.url ? ' · ' + e.url : ''}${e.nota ? '\n    ' + e.nota : ''}`));
  if (!ev.length) L.push('  Sin evidencias');
  downloadFile(`ficha-${i.id}.txt`, L.join('\n'), 'text/plain;charset=utf-8;');
  logAudit('Ficha exportada', 'Exportación .txt', i.id);
}

// ═══ F9 · BUSCADOR GLOBAL Ctrl+K ═════════════════════════════
let searchIdx = 0;
let searchResults = [];

function openSearch() {
  document.getElementById('search-overlay').style.display = 'flex';
  document.getElementById('search-input').value = '';
  document.getElementById('search-input').focus();
  document.getElementById('search-results').innerHTML = '';
  searchResults = []; searchIdx = 0;
}
function closeSearch() {
  const o = document.getElementById('search-overlay');
  if (o) o.style.display = 'none';
}
function isSearchOpen() {
  const o = document.getElementById('search-overlay');
  return o && o.style.display !== 'none';
}
function doSearch(q) {
  try {
    const el = document.getElementById('search-results');
    if (!q.trim()) { el.innerHTML = ''; searchResults = []; return; }
    const ql = q.toLowerCase().trim();
    searchResults = DATA.filter(i =>
      i.nombre.toLowerCase().includes(ql) ||
      i.id.toLowerCase().includes(ql) ||
      String(i.eje).includes(ql) ||
      ('eje ' + i.eje).includes(ql) ||
      i.linea.toLowerCase().includes(ql) ||
      (i.responsable || '').toLowerCase().includes(ql) ||
      i.fuente.toLowerCase().includes(ql)
    ).slice(0, 8);
    searchIdx = 0;
    if (!searchResults.length) { el.innerHTML = '<div class="search-empty">Sin resultados</div>'; return; }
    el.innerHTML = searchResults.map((i, n) => {
      const st = getStatus(i);
      const sc = STATUS_CONFIG[st];
      return `<div class="search-result-item${n === 0 ? ' active' : ''}" data-idx="${n}" onclick="closeSearch();goToIndicator('${i.id}')">
        <div class="sri-top"><div class="sri-id">${i.id}</div>
          <button class="btn btn-ghost btn-sm sri-btn" onclick="event.stopPropagation();closeSearch();openFicha('${i.id}')">Ficha 360°</button></div>
        <div class="sri-name">${i.nombre}</div>
        <div class="sri-meta">Eje ${i.eje} · ${i.linea} · <span style="color:${sc.color}">${sc.label}</span> · ${Math.round(calcProg(i))}%${i.responsable ? ' · ' + i.responsable : ''}</div>
      </div>`;
    }).join('');
  } catch (e) { console.error('doSearch', e); }
}
function searchKeyNav(e) {
  const items = document.querySelectorAll('#search-results .search-result-item');
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!items.length) return;
    e.preventDefault();
    searchIdx = (searchIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach((it, n) => it.classList.toggle('active', n === searchIdx));
    items[searchIdx].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    const r = searchResults[searchIdx];
    if (r) { e.preventDefault(); closeSearch(); goToIndicator(r.id); }
  }
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openSearch(); return; }
  if (e.key === 'Escape') {
    if (isSearchOpen()) { closeSearch(); return; }
    if (isModalOpen()) { closeModal(); return; }
    if (isComiteOpen()) { toggleComiteMode(false); return; }
  }
});

// ═══ F3 · CALENDARIO ═════════════════════════════════════════
let calFilter = { estado: 'todos', eje: '' };

function calDaysText(i, st, d) {
  if (st === 'vencido') return `Vencido hace ${Math.abs(d)} día${Math.abs(d) === 1 ? '' : 's'}`;
  if (st === 'proximo') return d === 0 ? 'Vence hoy' : `Vence en ${d} día${d === 1 ? '' : 's'}`;
  if (st === 'al_dia')  return `En ${d} días`;
  return PER_DAYS[i.per] ? 'Sin fecha de dato' : 'Sin periodicidad';
}

function renderCalendario() {
  const el = document.getElementById('v-calendario-inner');
  if (!el) return;
  const all = DATA.map(i => ({ i, st: updateStatus(i), next: nextUpdateDate(i), d: daysToNextUpdate(i) }));
  const cnt = { vencido: 0, proximo: 0, al_dia: 0, sin_fecha: 0 };
  all.forEach(x => cnt[x.st]++);

  let rows = all;
  if (calFilter.eje) rows = rows.filter(x => String(x.i.eje) === String(calFilter.eje));
  if (calFilter.estado !== 'todos') rows = rows.filter(x => x.st === calFilter.estado);

  // Carga prevista por mes (próximos 6 meses)
  const months = [];
  const t = todayDate();
  for (let k = 0; k < 6; k++) {
    const dt = new Date(t.getFullYear(), t.getMonth() + k, 1);
    const key = toISODate(dt).slice(0, 7);
    months.push({ key, label: dt.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }), n: all.filter(x => x.next && x.next.slice(0, 7) === key).length });
  }
  const maxM = Math.max(1, ...months.map(m => m.n));

  const chips = [['todos', 'Todos', DATA.length], ['vencido', 'Vencidos', cnt.vencido], ['proximo', 'Próximos 30d', cnt.proximo], ['al_dia', 'Al día', cnt.al_dia], ['sin_fecha', 'Sin fecha', cnt.sin_fecha]];

  const groupHTML = st => {
    const g = rows.filter(x => x.st === st).sort((a, b) => (a.d ?? 99999) - (b.d ?? 99999));
    if (!g.length) return '';
    const c = UPDATE_STATUS_CONFIG[st];
    return `
      <div class="cal-group">
        <div class="alert-group-hd" style="color:${c.color}"><div class="alert-group-dot" style="background:${c.color}"></div>${c.label} (${g.length})</div>
        <div class="cal-grid">
          ${g.map(({ i, st, next, d }) => `
            <div class="cal-card" style="border-left-color:${c.color}">
              <div class="cal-days" style="color:${c.color}">${calDaysText(i, st, d)}</div>
              <div class="cal-name ind-link" onclick="openFicha('${i.id}','seguimiento')">${i.nombre}</div>
              <div class="cal-meta">${ejePill(i.eje)} <span>${i.id}</span> <span>· ${i.per}</span></div>
              <div class="cal-dates">
                <div><span class="fm-k">Último dato</span><br>${fmtDate(i.actual.fecha)}</div>
                <div><span class="fm-k">Fecha esperada</span><br><strong>${next ? fmtDate(next) : '—'}</strong></div>
              </div>
              <div class="cal-resp">👤 ${i.responsable || '—'}</div>
              <div class="cal-actions">
                <button class="btn btn-ghost btn-sm" onclick="openFicha('${i.id}','actualizar')">✎ Actualizar</button>
                ${badge(getStatus(i))}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  };

  el.innerHTML = `
    <div class="section-gap">
      <div class="cal-banner">
        <span><strong style="color:#DC2626">${cnt.vencido}</strong> vencidos</span><span class="ind-meta-sep">·</span>
        <span><strong style="color:#D97706">${cnt.proximo}</strong> próximos (&lt;30 días)</span><span class="ind-meta-sep">·</span>
        <span><strong style="color:#059669">${cnt.al_dia}</strong> al día</span><span class="ind-meta-sep">·</span>
        <span><strong style="color:#6B7280">${cnt.sin_fecha}</strong> sin fecha</span>
        <span class="cal-banner-today">Hoy: ${fmtDate(todayISO())}</span>
      </div>
      <div class="card card-p">
        <div class="chart-title" style="margin-bottom:.6rem">Actualizaciones previstas por mes (próximos 6 meses)</div>
        <div class="cal-months">
          ${months.map(m => `<div class="cal-month"><div class="cal-month-bar"><div style="height:${(m.n / maxM) * 100}%"></div></div><div class="cal-month-n">${m.n}</div><div class="cal-month-l">${m.label}</div></div>`).join('')}
        </div>
      </div>
      <div class="filter-bar">
        ${chips.map(([k, l, n]) => `<button class="fchip${calFilter.estado === k ? ' active' : ''}" onclick="calFilter.estado='${k}';renderCalendario()">${l} <span>${n}</span></button>`).join('')}
        <div class="toolbar-sep"></div>
        <select class="filter-sel" onchange="calFilter.eje=this.value;renderCalendario()">
          <option value="">Todos los ejes</option>
          ${EJES.map(e => `<option value="${e.id}"${String(calFilter.eje) === String(e.id) ? ' selected' : ''}>Eje ${e.id} — ${e.nombre.split(' ').slice(0, 3).join(' ')}</option>`).join('')}
        </select>
        <div class="toolbar-count">${rows.length} indicadores</div>
      </div>
      ${rows.length ? ['vencido', 'proximo', 'al_dia', 'sin_fecha'].map(groupHTML).join('') : emptyBox('Ningún indicador coincide con los filtros', '📅')}
    </div>`;
}

// ═══ F4 · TAREAS ═════════════════════════════════════════════
let taskPrefill = null;

function quickTask(indId) {
  taskPrefill = indId;
  if (isModalOpen()) closeModal();
  if (isComiteOpen()) toggleComiteMode(false);
  navigate('tareas');
  setTimeout(() => document.getElementById('t-titulo')?.focus(), 60);
}

function renderTareas() {
  const el = document.getElementById('v-tareas-inner');
  if (!el) return;
  const tasks = loadTasks();
  const today = todayISO();
  const PRI = { alta: 0, media: 1, baja: 2 };
  const open = tasks.filter(t => t.estado !== 'completada');
  const overdue = open.filter(t => t.fechaLimite && t.fechaLimite < today);
  const pre = taskPrefill; taskPrefill = null;

  const col = st => {
    const list = tasks.filter(t => t.estado === st)
      .sort((a, b) => (PRI[a.prioridad] - PRI[b.prioridad]) || (a.fechaLimite || '9999').localeCompare(b.fechaLimite || '9999'));
    const c = TASK_STATES[st];
    return `
      <div class="kanban-col">
        <div class="kanban-hd" style="border-top-color:${c.color}"><span>${c.label}</span><span class="kanban-n">${list.length}</span></div>
        <div class="kanban-body">
          ${list.length ? list.map(t => {
            const ind = indById(t.indicadorId);
            const late = t.estado !== 'completada' && t.fechaLimite && t.fechaLimite < today;
            return `
              <div class="task-card prio-l-${t.prioridad}">
                <div class="task-top">${prioBadge(t.prioridad)}${late ? '<span class="task-late">⏰ Vencida</span>' : ''}</div>
                <div class="task-title">${esc(t.titulo)}</div>
                ${ind ? `<div class="task-ind">${indLinkHTML(ind)}</div>` : ''}
                <div class="task-meta">👤 ${esc(t.responsable) || 'Sin responsable'}<br>📅 ${t.fechaLimite ? fmtDate(t.fechaLimite) : 'Sin fecha límite'}</div>
                ${t.comentarios ? `<div class="task-com">${esc(t.comentarios)}</div>` : ''}
                <div class="task-actions">
                  <select class="filter-sel" onchange="setTaskStatus('${t.id}',this.value)" title="Cambiar estado">
                    ${Object.entries(TASK_STATES).map(([k, s]) => `<option value="${k}"${k === t.estado ? ' selected' : ''}>${s.label}</option>`).join('')}
                  </select>
                  <button class="icon-btn" title="Eliminar tarea" onclick="removeTask('${t.id}')">🗑</button>
                </div>
              </div>`;
          }).join('') : '<div class="kanban-empty">Sin tareas</div>'}
        </div>
      </div>`;
  };

  el.innerHTML = `
    <div class="section-gap">
      <div class="card card-p">
        <div class="card-header-title" style="margin-bottom:.75rem">＋ Nueva tarea</div>
        <div class="form-grid-3">
          <div class="form-group span-2"><label class="form-label">Título *</label><input class="form-input" id="t-titulo" placeholder="p. ej. Solicitar dato actualizado de cobertura 5G al MTDyFP"></div>
          <div class="form-group"><label class="form-label">Prioridad</label>
            <select class="form-input" id="t-prioridad"><option value="alta">Alta</option><option value="media" selected>Media</option><option value="baja">Baja</option></select></div>
          <div class="form-group span-2"><label class="form-label">Indicador vinculado</label><select class="form-input" id="t-ind">${indOptions(pre || '')}</select></div>
          <div class="form-group"><label class="form-label">Fecha límite</label><input type="date" class="form-input" id="t-fecha"></div>
          <div class="form-group"><label class="form-label">Responsable</label><input class="form-input" id="t-resp" list="dl-resp-t" placeholder="Nombre o unidad" value="${pre ? esc(indById(pre)?.responsable || '') : ''}">${respDatalist('dl-resp-t')}</div>
          <div class="form-group span-2"><label class="form-label">Comentarios</label><input class="form-input" id="t-com" placeholder="Contexto o detalle de la tarea"></div>
        </div>
        <button class="btn btn-primary" onclick="createTaskFromForm()">＋ Crear tarea</button>
      </div>
      <div class="filter-bar">
        <span class="text-sm"><strong>${tasks.length}</strong> tareas · <strong>${open.length}</strong> abiertas · <strong style="color:var(--crit)">${overdue.length}</strong> vencidas · <strong>${tasksDueSoon(7).filter(t => t._dias >= 0).length}</strong> vencen en 7 días</span>
      </div>
      <div class="kanban">${['pendiente', 'en_curso', 'bloqueada', 'completada'].map(col).join('')}</div>
    </div>`;
}

function createTaskFromForm() {
  const g = id => (document.getElementById(id)?.value || '').trim();
  const titulo = g('t-titulo');
  if (!titulo) { toast('El título de la tarea es obligatorio', 'error'); document.getElementById('t-titulo')?.focus(); return; }
  addTask({ titulo, indicadorId: g('t-ind') || null, responsable: g('t-resp'), fechaLimite: g('t-fecha'), prioridad: g('t-prioridad') || 'media', comentarios: g('t-com') });
  toast('Tarea creada', 'success');
  renderTareas();
}
function setTaskStatus(id, estado) { updateTaskStatus(id, estado); toast('Tarea: ' + TASK_STATES[estado].label, 'success'); renderTareas(); }
function removeTask(id) { if (!confirm('¿Eliminar esta tarea?')) return; deleteTask(id); renderTareas(); }

// ═══ F5 · DECISIONES ═════════════════════════════════════════
function renderDecisiones() {
  const el = document.getElementById('v-decisiones-inner');
  if (!el) return;
  const decs = loadDecisions();
  const today = todayISO();

  const group = st => {
    const list = decs.filter(d => d.estado === st).sort((a, b) => (a.fecha || '9999').localeCompare(b.fecha || '9999'));
    const c = DECISION_STATES[st];
    const title = { abierta: 'Abiertas', en_proceso: 'En proceso', resuelta: 'Resueltas' }[st];
    const emptyTxt = { abierta: 'Sin decisiones abiertas', en_proceso: 'Sin decisiones en proceso', resuelta: 'Sin decisiones resueltas' }[st];
    return `
      <div class="alert-group">
        <div class="alert-group-hd" style="color:${c.color}"><div class="alert-group-dot" style="background:${c.color}"></div>${title} (${list.length})</div>
        ${list.length ? list.map(d => {
          const ind = indById(d.indicadorId);
          const late = d.estado !== 'resuelta' && d.fecha && d.fecha < today;
          return `
            <div class="dec-item" style="border-left-color:${c.color}">
              <div class="dec-main">
                <div class="dec-problem">${esc(d.problema)}</div>
                ${d.decision ? `<div class="dec-decision"><span class="fm-k">Decisión requerida</span><br>${esc(d.decision)}</div>` : ''}
                ${d.contexto ? `<div class="dec-context">${esc(d.contexto)}</div>` : ''}
                <div class="dec-meta">
                  <span>👤 ${esc(d.responsable) || 'Sin responsable'}</span>
                  <span>📅 ${d.fecha ? fmtDate(d.fecha) : 'Sin fecha'}${late ? ' <strong style="color:var(--crit)">· fuera de plazo</strong>' : ''}</span>
                  ${ind ? `<span>🔗 ${indLinkHTML(ind)}</span>` : ''}
                  <span>Registrada ${fmtDateTime(d.creadaEn)}</span>
                </div>
              </div>
              <div class="dec-actions">
                <select class="filter-sel" onchange="setDecisionStatus('${d.id}',this.value)">
                  ${Object.entries(DECISION_STATES).map(([k, s]) => `<option value="${k}"${k === d.estado ? ' selected' : ''}>${s.label}</option>`).join('')}
                </select>
                <button class="icon-btn" title="Eliminar decisión" onclick="removeDecision('${d.id}')">🗑</button>
              </div>
            </div>`;
        }).join('') : `<div class="empty" style="padding:.75rem"><div class="empty-msg">${emptyTxt}</div></div>`}
      </div>`;
  };

  el.innerHTML = `
    <div class="section-gap">
      <div class="card card-p">
        <div class="card-header-title" style="margin-bottom:.75rem">＋ Nueva decisión requerida</div>
        <div class="form-grid-3">
          <div class="form-group span-3"><label class="form-label">Problema *</label><input class="form-input" id="d-problema" placeholder="p. ej. El nuevo CPD acumula 2 años sin avance significativo"></div>
          <div class="form-group span-3"><label class="form-label">Decisión requerida *</label><input class="form-input" id="d-decision" placeholder="p. ej. Aprobar la reprogramación presupuestaria del proyecto"></div>
          <div class="form-group"><label class="form-label">Responsable</label><input class="form-input" id="d-resp" list="dl-resp-d" placeholder="Quién debe decidir">${respDatalist('dl-resp-d')}</div>
          <div class="form-group"><label class="form-label">Fecha límite</label><input type="date" class="form-input" id="d-fecha"></div>
          <div class="form-group"><label class="form-label">Indicador vinculado</label><select class="form-input" id="d-ind">${indOptions('')}</select></div>
          <div class="form-group span-3"><label class="form-label">Contexto</label><textarea class="form-input" id="d-contexto" placeholder="Antecedentes, alternativas, impacto en el objetivo..."></textarea></div>
        </div>
        <button class="btn btn-primary" onclick="createDecisionFromForm()">＋ Registrar decisión</button>
      </div>
      ${group('abierta')}
      ${group('en_proceso')}
      ${group('resuelta')}
    </div>`;
}

function createDecisionFromForm() {
  const g = id => (document.getElementById(id)?.value || '').trim();
  const problema = g('d-problema'), decision = g('d-decision');
  if (!problema) { toast('Describe el problema', 'error'); document.getElementById('d-problema')?.focus(); return; }
  if (!decision) { toast('Indica la decisión requerida', 'error'); document.getElementById('d-decision')?.focus(); return; }
  addDecision({ problema, decision, responsable: g('d-resp'), fecha: g('d-fecha'), contexto: g('d-contexto'), indicadorId: g('d-ind') || null });
  toast('Decisión registrada', 'success');
  renderDecisiones();
}
function setDecisionStatus(id, estado) { updateDecisionStatus(id, estado); toast('Decisión: ' + DECISION_STATES[estado].label, 'success'); renderDecisiones(); }
function removeDecision(id) { if (!confirm('¿Eliminar esta decisión?')) return; deleteDecision(id); renderDecisiones(); }

// ═══ F6 · SNAPSHOTS ══════════════════════════════════════════
function renderSnapshots() {
  const el = document.getElementById('v-snapshots-inner');
  if (!el) return;
  const snaps = sortedSnapshots();
  const lastC = snaps.find(s => s.esComite);

  el.innerHTML = `
    <div class="section-gap">
      <div class="card card-p">
        <div class="card-header-title" style="margin-bottom:.75rem">📷 Crear snapshot del estado actual</div>
        <div class="form-grid-3">
          <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="s-nombre" placeholder="Snapshot ${fmtDate(todayISO())}"></div>
          <div class="form-group span-2"><label class="form-label">Nota</label><input class="form-input" id="s-nota" placeholder="p. ej. Estado presentado en el comité de octubre"></div>
        </div>
        <label class="check-row"><input type="checkbox" id="s-comite"> Marcar como <strong>último comité</strong> (será la referencia de «Qué ha cambiado»)</label>
        <div style="margin-top:.75rem"><button class="btn btn-primary" onclick="createSnapshotFromForm()">📷 Crear snapshot del estado actual</button></div>
        <div class="form-hint" style="margin-top:.5rem">Se guardan valor, fecha, avance y estado de los ${DATA.length} indicadores en este momento.</div>
      </div>
      ${snaps.length ? `
        <div class="snap-list">
          ${snaps.map(s => {
            const st = snapshotStats(s);
            return `
              <div class="snap-item">
                <div class="snap-main">
                  <div class="snap-name">${esc(s.nombre)}
                    ${s.esComite ? (lastC && lastC.id === s.id ? '<span class="badge badge-comite">★ Último comité</span>' : '<span class="badge badge-comite-old">Comité</span>') : ''}</div>
                  <div class="snap-date">${fmtDateTime(s.fecha)}</div>
                  ${s.nota ? `<div class="snap-nota">${esc(s.nota)}</div>` : ''}
                  <div class="snap-stats">
                    <span>Avance <strong>${Math.round(st.avgP)}%</strong></span>
                    <span class="eje-stat es-a">✓ ${st.counts.achieved}</span>
                    <span class="eje-stat es-g">→ ${st.counts.on_track}</span>
                    <span class="eje-stat es-y">! ${st.counts.at_risk}</span>
                    <span class="eje-stat es-r">!! ${st.counts.critical}</span>
                    <span class="text-xs text-muted">${st.total} indicadores</span>
                  </div>
                </div>
                <div class="snap-actions">
                  <button class="btn btn-ghost btn-sm" onclick="compareWithCurrent('${s.id}')">⇄ Comparar con actual</button>
                  ${!s.esComite ? `<button class="btn btn-ghost btn-sm" onclick="markSnapshotComite('${s.id}')">★ Marcar como comité</button>` : ''}
                  <button class="btn btn-danger btn-sm" onclick="removeSnapshot('${s.id}')">🗑 Eliminar</button>
                </div>
              </div>`;
          }).join('')}
        </div>` : `<div class="card">${emptyBox('Aún no hay snapshots. Crea el primero para poder comparar la evolución entre comités.', '📷')}</div>`}
    </div>`;
}

function createSnapshotFromForm() {
  const nombre = (document.getElementById('s-nombre')?.value || '').trim();
  const nota = (document.getElementById('s-nota')?.value || '').trim();
  const esComite = !!document.getElementById('s-comite')?.checked;
  const s = createSnapshot(nombre, nota, esComite);
  if (s) { toast('Snapshot creado: ' + s.nombre, 'success'); renderSnapshots(); }
}
function markSnapshotComite(id) {
  const arr = loadSnapshots();
  const s = arr.find(x => x.id === id);
  if (!s) return;
  s.esComite = true;
  saveSnapshots(arr);
  logAudit('Snapshot marcado como comité', s.nombre);
  toast('Snapshot marcado como comité', 'success');
  renderSnapshots();
}
function removeSnapshot(id) {
  if (!confirm('¿Eliminar este snapshot? No se puede deshacer.')) return;
  deleteSnapshot(id);
  if (compareState.a === id) compareState.a = null;
  if (compareState.b === id) compareState.b = 'actual';
  renderSnapshots();
}
function compareWithCurrent(id) {
  compareState = { a: id, b: 'actual', filter: 'todos' };
  if (isComiteOpen()) toggleComiteMode(false);
  navigate('comparar');
}

// ═══ F6 · COMPARAR ═══════════════════════════════════════════
let compareState = { a: null, b: 'actual', filter: 'todos' };

function stateByKey(key) {
  if (key === 'actual')   return { key, nombre: 'Estado actual', data: currentStateData() };
  if (key === 'original') return { key, nombre: 'Datos originales (informe de avances)', data: originalStateData() };
  const s = loadSnapshots().find(x => x.id === key);
  return s ? { key, nombre: s.nombre + ' · ' + fmtDateTime(s.fecha), data: s.data } : null;
}

function renderComparar() {
  const el = document.getElementById('v-comparar-inner');
  if (!el) return;
  const snaps = sortedSnapshots();
  if (!compareState.a || !stateByKey(compareState.a)) {
    const lc = getLastComiteSnapshot();
    compareState.a = lc ? lc.id : 'original';
  }
  if (!stateByKey(compareState.b)) compareState.b = 'actual';
  const A = stateByKey(compareState.a), B = stateByKey(compareState.b);

  const opts = cur => `
    ${snaps.length ? `<optgroup label="Snapshots">${snaps.map(s => `<option value="${s.id}"${s.id === cur ? ' selected' : ''}>${esc(s.nombre)} · ${fmtDate(s.fecha.slice(0, 10))}${s.esComite ? ' (comité)' : ''}</option>`).join('')}</optgroup>` : ''}
    <optgroup label="Referencias">
      <option value="original"${cur === 'original' ? ' selected' : ''}>Datos originales (informe de avances)</option>
      <option value="actual"${cur === 'actual' ? ' selected' : ''}>Estado actual</option>
    </optgroup>`;

  const rows = compareStates(A.data, B.data);
  const nUpd = rows.filter(r => r.changed).length;
  const nMej = rows.filter(r => r.mejora).length;
  const nEmp = rows.filter(r => r.empeora).length;
  const nEst = rows.filter(r => r.cambiaEstado).length;
  const nAlc = rows.filter(r => r.alcanza).length;

  const F = compareState.filter;
  let view = rows;
  if (F === 'cambian')  view = rows.filter(r => r.changed || r.cambiaEstado);
  if (F === 'mejoran')  view = rows.filter(r => r.mejora);
  if (F === 'empeoran') view = rows.filter(r => r.empeora);
  if (F === 'estado')   view = rows.filter(r => r.cambiaEstado);

  const chips = [['todos', 'Todos', rows.length], ['cambian', 'Solo cambian', rows.filter(r => r.changed || r.cambiaEstado).length], ['mejoran', 'Mejoran', nMej], ['empeoran', 'Empeoran', nEmp], ['estado', 'Cambian estado', nEst]];

  const valCell = (ind, s) => s ? `<div class="td-num">${fmtNum(ind, s.v)}</div><div class="td-linea">${fmtDate(s.fecha)}</div>` : '<span class="text-muted">—</span>';

  el.innerHTML = `
    <div class="section-gap">
      <div class="card card-p">
        <div class="cmp-selectors">
          <div class="form-group" style="margin:0;flex:1"><label class="form-label">Estado A (referencia)</label>
            <select class="form-input" onchange="compareState.a=this.value;renderComparar()">${opts(compareState.a)}</select></div>
          <button class="btn btn-ghost" style="align-self:flex-end" title="Intercambiar A y B" onclick="const t=compareState.a;compareState.a=compareState.b;compareState.b=t;renderComparar()">⇄</button>
          <div class="form-group" style="margin:0;flex:1"><label class="form-label">Estado B (comparado)</label>
            <select class="form-input" onchange="compareState.b=this.value;renderComparar()">${opts(compareState.b)}</select></div>
        </div>
        ${!snaps.length ? `<div class="form-hint" style="margin-top:.6rem">No hay snapshots todavía: se compara con los datos originales del informe. <a href="#" onclick="navigate('snapshots');return false">Crear snapshot →</a></div>` : ''}
        ${compareState.a === compareState.b ? '<div class="form-hint" style="margin-top:.6rem;color:var(--risk)">A y B son el mismo estado: no habrá diferencias.</div>' : ''}
      </div>

      <div class="cmp-summary">
        <div><strong>${nUpd}</strong> actualizados</div>
        <div style="color:var(--achieved)"><strong>${nMej}</strong> mejoran</div>
        <div style="color:var(--crit)"><strong>${nEmp}</strong> empeoran</div>
        <div style="color:var(--track)"><strong>${nEst}</strong> cambian estado</div>
        <div style="color:var(--achieved)"><strong>${nAlc}</strong> alcanzan objetivo</div>
      </div>

      <div class="card" style="overflow:hidden">
        <div class="table-toolbar">
          ${chips.map(([k, l, n]) => `<button class="fchip${F === k ? ' active' : ''}" onclick="compareState.filter='${k}';renderComparar()">${l} <span>${n}</span></button>`).join('')}
          <div class="toolbar-count">${view.length} de ${rows.length} indicadores</div>
        </div>
        <div class="table-wrap">
          <table class="data-table cmp-table">
            <thead><tr>
              <th>ID</th><th style="min-width:220px">Indicador</th><th>Valor A</th><th>Valor B</th><th>Diferencia</th><th>Estado A</th><th>Estado B</th><th>Cambio de estado</th>
            </tr></thead>
            <tbody>
              ${view.length ? view.map(r => {
                const ind = r.ind;
                const cls = r.mejora ? 'cmp-up' : r.empeora ? 'cmp-down' : 'cmp-flat';
                let diff = '<span class="txt-flat">—</span>';
                if (r.a && r.b) {
                  const arrow = r.mejora ? '↑' : r.empeora ? '↓' : '→';
                  if (ind.bin) diff = String(r.a.v) === String(r.b.v) ? '<span class="txt-flat">→ Sin cambio</span>' : `<span class="${r.mejora ? 'txt-up' : 'txt-down'}">${arrow} ${esc(r.a.v)} → ${esc(r.b.v)}</span>`;
                  else if (r.deltaV !== null) diff = `<span class="${r.mejora ? 'txt-up' : r.empeora ? 'txt-down' : 'txt-flat'}">${arrow} ${Math.abs(r.deltaV) < 1e-9 ? 'Sin cambio' : fmtDiff(ind, r.deltaV)}</span>${Math.abs(r.dProg) >= 0.5 ? `<div class="td-linea">${r.dProg > 0 ? '+' : ''}${Math.round(r.dProg)} pts de avance</div>` : ''}`;
                }
                const est = r.cambiaEstado ? `<span class="${r.dirEstado > 0 ? 'txt-up' : 'txt-down'}">${r.dirEstado > 0 ? '▲ Mejora' : '▼ Empeora'}</span>${r.alcanza ? '<div class="td-linea" style="color:var(--achieved)">🎯 Alcanza objetivo</div>' : ''}` : '<span class="txt-flat">Sin cambio</span>';
                return `<tr class="${cls}">
                  <td class="td-id">${ind.id}</td>
                  <td><div class="td-name ind-link" onclick="openFicha('${ind.id}')">${ind.nombre}</div><div class="td-linea">Eje ${ind.eje} · ${ind.linea}</div></td>
                  <td>${valCell(ind, r.a)}</td>
                  <td>${valCell(ind, r.b)}</td>
                  <td style="white-space:nowrap">${diff}</td>
                  <td>${r.a ? badge(r.a.status) : '—'}</td>
                  <td>${r.b ? badge(r.b.status) : '—'}</td>
                  <td style="white-space:nowrap">${est}</td>
                </tr>`;
              }).join('') : `<tr><td colspan="8">${emptyBox('Ningún indicador cumple el filtro seleccionado')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
      <div class="form-hint">A: <strong>${esc(A.nombre)}</strong> · B: <strong>${esc(B.nombre)}</strong>. «Mejora» y «empeora» se determinan por la variación del avance (%), lo que respeta indicadores invertidos y binarios.</div>
    </div>`;
}

// ═══ F13 · QUÉ HA CAMBIADO ═══════════════════════════════════
function changesSummary(snap) {
  const rows = compareStates(snap.data, currentStateData());
  return {
    rows,
    upd: rows.filter(r => r.changed),
    mej: rows.filter(r => r.mejora),
    emp: rows.filter(r => r.empeora),
    est: rows.filter(r => r.cambiaEstado),
    alc: rows.filter(r => r.alcanza)
  };
}

function changesBlockHTML(big = false) {
  const snap = getLastComiteSnapshot();
  if (!snap) {
    return `
      <div class="card card-p changes-block">
        <div class="card-header-title">Qué ha cambiado</div>
        <div class="changes-empty">
          ℹ️ Todavía no hay snapshots registrados. Crea un snapshot (idealmente al cerrar cada comité) y aquí verás qué indicadores se han actualizado, mejorado o empeorado desde entonces.
          <button class="btn btn-ghost btn-sm" onclick="if(isComiteOpen())toggleComiteMode(false);navigate('snapshots')">📷 Crear snapshot</button>
        </div>
      </div>`;
  }
  const s = changesSummary(snap);
  const list = s.rows.filter(r => r.changed || r.cambiaEstado)
    .sort((a, b) => Math.abs(b.dProg) - Math.abs(a.dProg)).slice(0, big ? 12 : 8);
  const tile = (n, l, c) => `<div class="ch-tile"><div class="ch-n" style="color:${c}">${n}</div><div class="ch-l">${l}</div></div>`;
  return `
    <div class="card card-p changes-block${big ? ' changes-big' : ''}">
      <div class="flex items-center justify-between flex-wrap gap-sm" style="margin-bottom:.75rem">
        <div class="card-header-title">Qué ha cambiado desde «${esc(snap.nombre)}» <span class="text-xs text-muted" style="font-weight:500">· ${fmtDateTime(snap.fecha)}</span>
          ${snap.esComite ? '<span class="badge badge-comite" style="margin-left:.35rem">★ Último comité</span>' : '<span class="badge badge-comite-old" style="margin-left:.35rem">Último snapshot</span>'}</div>
        <button class="btn btn-ghost btn-sm" onclick="compareWithCurrent('${snap.id}')">Ver comparación completa →</button>
      </div>
      <div class="ch-tiles">
        ${tile(s.upd.length, 'Actualizados', 'var(--ink)')}
        ${tile(s.mej.length, 'Mejoran', 'var(--achieved)')}
        ${tile(s.emp.length, 'Empeoran', 'var(--crit)')}
        ${tile(s.est.length, 'Cambian estado', 'var(--track)')}
        ${tile(s.alc.length, 'Alcanzan objetivo', 'var(--achieved)')}
      </div>
      ${list.length ? `<div class="ch-list">${list.map(r => `
        <div class="ch-row">
          <span class="ch-arrow ${r.mejora ? 'txt-up' : r.empeora ? 'txt-down' : 'txt-flat'}">${r.mejora ? '↑' : r.empeora ? '↓' : '→'}</span>
          <span class="ch-name ind-link" onclick="openFicha('${r.ind.id}')">${r.ind.id} · ${r.ind.nombre}</span>
          <span class="ch-vals">${fmtNum(r.ind, r.a.v)} → <strong>${fmtNum(r.ind, r.b.v)}</strong></span>
          <span class="ch-st">${r.cambiaEstado ? `${badge(r.a.status)} → ${badge(r.b.status)}` : badge(r.b.status)}</span>
        </div>`).join('')}</div>`
      : '<div class="changes-empty">Sin cambios en los indicadores desde este snapshot.</div>'}
    </div>`;
}

// ═══ F17 · INDICADORES DESTACADOS ════════════════════════════
function highlightsBlockHTML() {
  const ids = loadHighlights();
  const inds = DATA.filter(i => ids.includes(i.id));
  if (!inds.length) return '';
  return `
    <div class="card card-p">
      <div class="flex items-center justify-between" style="margin-bottom:.75rem">
        <div class="card-header-title">★ Indicadores estratégicos destacados (${inds.length})</div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('config');setTimeout(()=>document.getElementById('cfg-highlights')?.scrollIntoView({behavior:'smooth'}),80)">Editar selección</button>
      </div>
      <div class="hl-grid">
        ${inds.map(i => {
          const st = getStatus(i), sc = STATUS_CONFIG[st];
          return `
            <div class="hl-card" onclick="openFicha('${i.id}')" style="border-top-color:${ejeColor(i.eje)}">
              <div class="hl-top"><span class="hl-id">${i.id}</span>${badge(st)}</div>
              <div class="hl-name">${i.nombre}</div>
              ${progBar(i, 'pb-6')}
              <div class="hl-foot"><strong style="color:${sc.color}">${Math.round(Math.min(calcProg(i), 100))}%</strong><span>${fmtActual(i)} / ${fmtObj(i)}</span></div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ═══ BLOQUES COMPARTIDOS: comité / informe ═══════════════════
function indLiHTML(i, extra = '') {
  return `<li><span class="ind-link" onclick="openFicha('${i.id}')"><strong>${i.nombre}</strong></span> (${i.id} · Eje ${i.eje}) — Actual: ${fmtActual(i)} · Objetivo: ${fmtObj(i)} · Avance: ${fmtProg(i)}${extra}</li>`;
}

function decisionesAbiertasHTML() {
  const decs = loadDecisions().filter(d => d.estado === 'abierta').sort((a, b) => (a.fecha || '9999').localeCompare(b.fecha || '9999'));
  const enProc = loadDecisions().filter(d => d.estado === 'en_proceso').length;
  if (!decs.length) return `<p class="cm-empty">No hay decisiones abiertas registradas.${enProc ? ` (${enProc} en proceso)` : ''}</p>`;
  return `<ul class="report-ul">${decs.map(d => {
    const ind = indById(d.indicadorId);
    const late = d.fecha && d.fecha < todayISO();
    return `<li><strong>${esc(d.problema)}</strong>${d.decision ? ` — Decisión: ${esc(d.decision)}` : ''}
      <span class="text-xs text-muted"> · ${esc(d.responsable) || 'Sin responsable'} · ${d.fecha ? fmtDate(d.fecha) : 'sin fecha'}${late ? ' <strong style="color:var(--crit)">(fuera de plazo)</strong>' : ''}${ind ? ' · ' + ind.id : ''}</span></li>`;
  }).join('')}</ul>${enProc ? `<p class="cm-empty">Además, ${enProc} decisión${enProc === 1 ? '' : 'es'} en proceso.</p>` : ''}`;
}

function tareasProximasHTML(n = 7) {
  const ts = tasksDueSoon(n);
  if (!ts.length) return `<p class="cm-empty">No hay tareas abiertas que venzan en los próximos ${n} días.</p>`;
  return `<ul class="report-ul">${ts.map(t => {
    const ind = indById(t.indicadorId);
    const when = t._dias < 0 ? `<strong style="color:var(--crit)">vencida hace ${-t._dias} días</strong>` : t._dias === 0 ? '<strong style="color:var(--risk)">vence hoy</strong>' : `vence en ${t._dias} días`;
    return `<li>${prioBadge(t.prioridad)} <strong>${esc(t.titulo)}</strong> <span class="text-xs text-muted">· ${esc(t.responsable) || 'Sin responsable'} · ${fmtDate(t.fechaLimite)} · ${when} · ${TASK_STATES[t.estado]?.label}${ind ? ' · ' + ind.id : ''}</span></li>`;
  }).join('')}</ul>`;
}

function vencidosHTML() {
  const v = DATA.filter(i => updateStatus(i) === 'vencido').sort((a, b) => daysToNextUpdate(a) - daysToNextUpdate(b));
  if (!v.length) return '<p class="cm-empty">Todos los indicadores con periodicidad tienen su dato vigente.</p>';
  return `<ul class="report-ul">${v.map(i => `<li><span class="ind-link" onclick="openFicha('${i.id}','actualizar')"><strong>${i.nombre}</strong></span> (${i.id}) — Último dato ${fmtDate(i.actual.fecha)} · ${i.per} · previsto ${fmtDate(nextUpdateDate(i))} · <strong style="color:var(--crit)">vencido hace ${Math.abs(daysToNextUpdate(i))} días</strong> · ${i.responsable || ''}</li>`).join('')}</ul>`;
}

function proximosVencHTML(n = 30) {
  const v = DATA.filter(i => { const d = daysToNextUpdate(i); return d !== null && d >= 0 && d <= n; }).sort((a, b) => daysToNextUpdate(a) - daysToNextUpdate(b));
  if (!v.length) return `<p class="cm-empty">No hay actualizaciones previstas en los próximos ${n} días.</p>`;
  return `<ul class="report-ul">${v.map(i => `<li><span class="ind-link" onclick="openFicha('${i.id}','seguimiento')"><strong>${i.nombre}</strong></span> (${i.id}) — Prevista ${fmtDate(nextUpdateDate(i))} · en ${daysToNextUpdate(i)} días · ${i.responsable || ''}</li>`).join('')}</ul>`;
}

// ═══ F18 · INFORME — secciones de gestión ════════════════════
function informeGestionHTML() {
  try {
    const nDec = loadDecisions().filter(d => d.estado === 'abierta').length;
    const nTask = tasksDueSoon(7).length;
    const nVenc = DATA.filter(i => updateStatus(i) === 'vencido').length;
    return `
      <div class="report-section">
        <h2>Decisiones requeridas pendientes ⚡ (${nDec})</h2>
        ${decisionesAbiertasHTML()}
      </div>
      <div class="report-section">
        <h2>Tareas próximas a vencer — 7 días ✅ (${nTask})</h2>
        ${tareasProximasHTML(7)}
      </div>
      <div class="report-section">
        <h2>Indicadores con datos vencidos ⏰ (${nVenc})</h2>
        ${vencidosHTML()}
      </div>`;
  } catch (e) { console.error('informeGestion', e); return ''; }
}

// ═══ F7 · MODO COMITÉ ════════════════════════════════════════
function isComiteOpen() {
  const o = document.getElementById('comite-overlay');
  return !!o && o.style.display !== 'none';
}

function toggleComiteMode(force) {
  const o = document.getElementById('comite-overlay');
  if (!o) return;
  const open = typeof force === 'boolean' ? force : !isComiteOpen();
  if (!open) {
    o.style.display = 'none';
    o.innerHTML = '';
    document.body.classList.remove('no-scroll');
    return;
  }
  try {
    o.innerHTML = comiteOverlayHTML();
    o.style.display = 'block';
    o.scrollTop = 0;
    document.body.classList.add('no-scroll');
  } catch (e) {
    console.error('Modo comité', e);
    o.style.display = 'none';
    toast('No se ha podido abrir el modo comité', 'error');
  }
}

function comiteOverlayHTML() {
  const gs = globalStats();
  const last = lastUpdateDate();
  const logros = DATA.filter(i => getStatus(i) === 'achieved');
  const atencion = DATA.filter(i => ['critical', 'at_risk'].includes(getStatus(i)))
    .sort((a, b) => calcProg(a) - calcProg(b));
  const kpi = (v, l, c = 'var(--ink)') => `<div class="kpi comite-kpi"><div class="comite-kpi-val" style="color:${c}">${v}</div><div class="kpi-label">${l}</div></div>`;
  const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return `
    <div class="comite-header">
      <div>
        <div class="comite-h-title">ETDE27 — Comité de Seguimiento</div>
        <div class="comite-h-sub">${fechaHoy} · Datos actualizados a ${fmtDate(last)} · ${gs.total} indicadores</div>
      </div>
      <button class="comite-close" onclick="toggleComiteMode(false)" title="Salir (Esc)">✕</button>
    </div>
    <div class="comite-content">
      <div class="kpi-grid comite-kpis">
        ${kpi(Math.round(gs.avgP) + '%', 'Avance global', '#2563EB')}
        ${kpi(gs.counts.achieved, 'Objetivos cumplidos', '#059669')}
        ${kpi(gs.counts.on_track, 'En seguimiento', '#2563EB')}
        ${kpi(gs.counts.at_risk, 'En riesgo', '#D97706')}
        ${kpi(gs.counts.critical, 'Atención urgente', '#DC2626')}
        ${kpi(DATA.filter(i => updateStatus(i) === 'vencido').length, 'Datos vencidos', '#9A3412')}
      </div>

      <div class="eje-grid comite-ejes">
        ${EJES.map(e => {
          const s = ejeStats(e.id);
          const p = Math.round(s.avg);
          return `
            <div class="eje-card" data-eje="${e.id}" onclick="toggleComiteMode(false);navigate('eje-${e.id}')">
              <div class="eje-card-num">Eje ${e.id}</div>
              <div class="eje-card-name">${e.nombre}</div>
              <div class="eje-card-pct">${p}%</div>
              <div style="margin:.5rem 0 .7rem"><div class="pb-wrap pb-10"><div class="pb-fill" style="width:${p}%;background:${e.color}"></div></div></div>
              <div class="eje-card-stats">
                <span class="eje-stat es-a">✓ ${s.counts.achieved} cumplidos</span>
                <span class="eje-stat es-g">→ ${s.counts.on_track}</span>
                <span class="eje-stat es-y">! ${s.counts.at_risk}</span>
                <span class="eje-stat es-r">!! ${s.counts.critical}</span>
              </div>
              <div class="eje-card-meta">${s.inds.length} indicadores</div>
            </div>`;
        }).join('')}
      </div>

      ${changesBlockHTML(true)}

      <div class="grid-2">
        <div class="card card-p comite-panel">
          <div class="comite-panel-hd" style="color:var(--achieved)">✅ Principales logros (${logros.length})</div>
          ${logros.length ? logros.map(i => `
            <div class="comite-row ind-link" onclick="openFicha('${i.id}')">
              <div class="comite-row-name">${i.nombre}</div>
              <div class="comite-row-meta">Eje ${i.eje} · ${fmtActual(i)} / obj. ${fmtObj(i)}</div>
            </div>`).join('') : '<p class="cm-empty">Ningún objetivo alcanzado todavía.</p>'}
        </div>
        <div class="card card-p comite-panel">
          <div class="comite-panel-hd" style="color:var(--crit)">⚑ Requiere atención (${atencion.length})</div>
          ${atencion.length ? atencion.map(i => {
            const st = getStatus(i);
            const r = calcRhythm(i);
            return `
            <div class="comite-row ind-link" onclick="openFicha('${i.id}')">
              <div class="comite-row-name">${i.nombre}</div>
              <div class="comite-row-meta"><strong style="color:${statusColor(st)}">${Math.round(calcProg(i))}%</strong> · ${statusLabel(st)} · Eje ${i.eje} · ${fmtActual(i)} / obj. ${fmtObj(i)}${r && !r.cumplido ? ' · ' + viabBadge(r.viabilidad) : ''}</div>
            </div>`;
          }).join('') : '<p class="cm-empty">Ningún indicador en riesgo o urgente.</p>'}
        </div>
      </div>

      <div class="grid-2">
        <div class="card card-p comite-panel">
          <div class="comite-panel-hd" style="color:var(--crit)">⚡ Decisiones pendientes</div>
          ${decisionesAbiertasHTML()}
        </div>
        <div class="card card-p comite-panel">
          <div class="comite-panel-hd" style="color:#9A3412">⏰ Datos vencidos</div>
          ${vencidosHTML()}
        </div>
      </div>
    </div>`;
}

// ═══ F8 · PREPARAR COMITÉ ════════════════════════════════════
function renderComite() {
  const el = document.getElementById('v-comite-inner');
  if (!el) return;
  const gs = globalStats();
  const cfg = loadConfig();
  const dates = DATA.map(i => i.actual.fecha).filter(Boolean).sort();
  const masReciente = dates[dates.length - 1], masAntiguo = dates[0];
  const logros = DATA.filter(i => getStatus(i) === 'achieved');
  const urgentes = DATA.filter(i => getStatus(i) === 'critical').sort((a, b) => calcProg(a) - calcProg(b));
  const nVenc = DATA.filter(i => updateStatus(i) === 'vencido').length;
  const lastSnap = getLastComiteSnapshot();
  const sec = (n, title, body) => `<div class="report-section"><h2><span class="metodo-n">${n}</span> ${title}</h2>${body}</div>`;

  el.innerHTML = `
    <div class="report-paper">
      <div class="report-logo">Junta de Extremadura · OTID · Dossier de preparación de comité</div>
      <div class="report-title">Preparación del Comité de Seguimiento ETDE27</div>
      <div class="report-date">Generado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} por ${esc(cfg.usuarioActual)} · Último comité: ${fmtDate(cfg.fechaUltimoComite)}</div>
      <div class="report-divider"></div>

      ${sec(1, 'Estado de actualización', `
        <div class="report-kpis">
          <div class="rk"><div class="rk-val" style="font-size:1.15rem">${fmtDate(masReciente)}</div><div class="rk-label">Dato más reciente</div></div>
          <div class="rk"><div class="rk-val" style="font-size:1.15rem">${fmtDate(masAntiguo)}</div><div class="rk-label">Dato más antiguo</div></div>
          <div class="rk"><div class="rk-val" style="color:#DC2626">${nVenc}</div><div class="rk-label">Datos vencidos</div></div>
          <div class="rk"><div class="rk-val">${gs.modified}</div><div class="rk-label">Actualizados localmente</div></div>
          <div class="rk"><div class="rk-val">${DATA.filter(i => getConfidence(i.id) === 'validado').length}</div><div class="rk-label">Datos validados</div></div>
        </div>`)}

      ${sec(2, 'Avance global y por eje', `
        <p>Avance global: <strong>${Math.round(gs.avgP)}%</strong> · ${gs.counts.achieved} cumplidos · ${gs.counts.on_track} en seguimiento · ${gs.counts.at_risk} en riesgo · ${gs.counts.critical} urgentes.</p>
        ${EJES.map(e => { const s = ejeStats(e.id); const p = Math.round(s.avg); return `
          <div class="report-eje-bar">
            <div class="reb-name" style="color:${e.color}">Eje ${e.id} · ${e.nombre.split(' ').slice(0, 3).join(' ')}</div>
            <div class="reb-pb"><div class="pb-wrap pb-10"><div class="pb-fill" style="width:${p}%;background:${e.color}"></div></div></div>
            <div class="reb-pct" style="color:${e.color}">${p}%</div>
          </div>`; }).join('')}`)}

      ${sec(3, 'Cambios desde el último comité', lastSnap ? changesBlockHTML() : `<p class="cm-empty">No hay snapshot de comité registrado. Usa «📷 Registrar snapshot de comité» al cerrar este comité para poder medir los cambios en el siguiente.</p>`)}

      ${sec(4, `Logros (${logros.length})`, logros.length ? `<ul class="report-ul">${logros.map(i => indLiHTML(i)).join('')}</ul>` : '<p class="cm-empty">Ningún objetivo alcanzado todavía.</p>')}

      ${sec(5, `Atención urgente (${urgentes.length})`, urgentes.length ? `<ul class="report-ul">${urgentes.map(i => {
        const r = calcRhythm(i);
        return indLiHTML(i, r && !r.cumplido ? ` · Ritmo necesario: ${fmtDiff(i, r.ritmoNecesarioTrimestre, false)}/trim. · ${viabBadge(r.viabilidad)}` : '');
      }).join('')}</ul>` : '<p class="cm-empty">Ningún indicador en estado urgente.</p>')}

      ${sec(6, 'Decisiones pendientes', decisionesAbiertasHTML())}
      ${sec(7, 'Tareas próximas a vencer (7 días)', tareasProximasHTML(7))}
      ${sec(8, `Datos vencidos (${nVenc})`, vencidosHTML())}
      ${sec(9, 'Próximos vencimientos (30 días)', proximosVencHTML(30))}
    </div>`;
}

function comiteSnapshotPrompt() {
  const nombre = prompt('Nombre del snapshot de comité:', 'Comité ' + fmtDate(todayISO()));
  if (nombre === null) return;
  const s = createSnapshot(nombre.trim() || ('Comité ' + fmtDate(todayISO())), 'Registrado desde «Preparar comité»', true);
  if (s) { toast('Snapshot de comité registrado', 'success'); navigate(currentView); }
}

// ═══ F15 · FILTROS GUARDADOS ═════════════════════════════════
function defaultTableFilters() {
  return { search: '', eje: '', linea: '', status: '', per: '', responsable: '', soloRiesgo: false, soloSinDatos: false };
}
function filtersKey(f) {
  const d = { ...defaultTableFilters(), ...f };
  return JSON.stringify(Object.keys(d).sort().map(k => [k, d[k]]));
}

function savedFiltersBarHTML() {
  const list = loadSavedFilters();
  const curKey = filtersKey(tableFilters);
  return `
    <div class="sf-bar">
      <span class="sf-label">Filtros guardados</span>
      ${list.length ? list.map(f => `
        <span class="sf-chip${filtersKey(f.filters) === curKey ? ' active' : ''}">
          <span class="sf-chip-name" onclick="applySavedFilter('${f.id}')" title="Aplicar filtro">${esc(f.nombre)}</span>
          <button class="sf-chip-x" onclick="deleteSavedFilter('${f.id}')" title="Eliminar filtro guardado">×</button>
        </span>`).join('') : '<span class="sf-empty">Ninguno todavía: combina filtros abajo y guárdalos para reutilizarlos.</span>'}
      <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="saveCurrentFilters()">💾 Guardar filtros actuales</button>
    </div>`;
}

function saveCurrentFilters() {
  if (filtersKey(tableFilters) === filtersKey(defaultTableFilters())) { toast('No hay filtros activos que guardar', 'error'); return; }
  const nombre = prompt('Nombre para este filtro:');
  if (nombre === null) return;
  if (!nombre.trim()) { toast('Indica un nombre', 'error'); return; }
  const list = loadSavedFilters();
  list.push({ id: uuid(), nombre: nombre.trim(), filters: { ...tableFilters }, sort: { ...tableSort }, creadoEn: new Date().toISOString() });
  saveSavedFilters(list);
  toast('Filtro guardado: ' + nombre.trim(), 'success');
  renderTabla();
}
function applySavedFilter(id) {
  const f = loadSavedFilters().find(x => x.id === id);
  if (!f) return;
  tableFilters = { ...defaultTableFilters(), ...f.filters };
  if (f.sort && f.sort.col) tableSort = { ...f.sort };
  renderTabla();
}
function deleteSavedFilter(id) {
  const list = loadSavedFilters();
  const f = list.find(x => x.id === id);
  if (!f || !confirm(`¿Eliminar el filtro guardado «${f.nombre}»?`)) return;
  saveSavedFilters(list.filter(x => x.id !== id));
  renderTabla();
}

// ═══ F14 · CONFIGURACIÓN ═════════════════════════════════════
function renderConfig() {
  const el = document.getElementById('v-config-inner');
  if (!el) return;
  const c = loadConfig();
  const hl = loadHighlights();
  const audit = loadAudit();
  const counts = [
    ['Registros de histórico', loadHistory2().length],
    ['Snapshots', loadSnapshots().length],
    ['Tareas', loadTasks().length],
    ['Decisiones', loadDecisions().length],
    ['Comentarios', loadComments().length],
    ['Evidencias', loadEvidences().length],
    ['Filtros guardados', loadSavedFilters().length],
    ['Entradas de auditoría', audit.length]
  ];

  el.innerHTML = `
    <div class="section-gap">
      <div class="card card-p">
        <div class="card-header-title" style="margin-bottom:.9rem">Parámetros generales</div>
        <div class="form-grid-3">
          <div class="form-group"><label class="form-label">Inicio de la estrategia</label><input type="date" class="form-input" id="cfg-ini" value="${esc(c.fechaInicioEstrategia)}"></div>
          <div class="form-group"><label class="form-label">Fin de la estrategia</label><input type="date" class="form-input" id="cfg-fin" value="${esc(c.fechaFinEstrategia)}"><div class="form-hint">Horizonte para el ritmo necesario y la proyección</div></div>
          <div class="form-group"><label class="form-label">Fecha del último comité</label><input type="date" class="form-input" id="cfg-comite" value="${esc(c.fechaUltimoComite)}"><div class="form-hint">Se actualiza al registrar un snapshot de comité</div></div>
          <div class="form-group"><label class="form-label">Usuario actual</label><input class="form-input" id="cfg-user" value="${esc(c.usuarioActual)}"><div class="form-hint">Firma el histórico, comentarios y auditoría</div></div>
        </div>
        <div class="card-header-title" style="margin:.5rem 0 .75rem">Umbrales del semáforo (% de avance)</div>
        <div class="form-grid-3">
          <div class="form-group"><label class="form-label"><span class="sem-dot" style="background:#059669;display:inline-block"></span> Objetivo cumplido ≥</label><input type="number" class="form-input" id="cfg-ach" value="${esc(c.umbralAchieved)}" min="1" max="200" step="any"></div>
          <div class="form-group"><label class="form-label"><span class="sem-dot" style="background:#2563EB;display:inline-block"></span> En seguimiento ≥</label><input type="number" class="form-input" id="cfg-ont" value="${esc(c.umbralOnTrack)}" min="1" max="200" step="any"></div>
          <div class="form-group"><label class="form-label"><span class="sem-dot" style="background:#D97706;display:inline-block"></span> En riesgo ≥ <span class="text-muted">(por debajo: urgente)</span></label><input type="number" class="form-input" id="cfg-risk" value="${esc(c.umbralAtRisk)}" min="0" max="200" step="any"></div>
        </div>
        <div class="flex gap-sm">
          <button class="btn btn-primary" onclick="saveConfigFromForm()">💾 Guardar configuración</button>
          <button class="btn btn-ghost" onclick="resetConfigDefaults()">↺ Valores por defecto</button>
        </div>
      </div>

      <div class="card card-p" id="cfg-highlights">
        <div class="flex items-center justify-between flex-wrap gap-sm" style="margin-bottom:.4rem">
          <div class="card-header-title">★ Indicadores destacados para dirección (${hl.length})</div>
          ${hl.length ? '<button class="btn btn-ghost btn-sm" onclick="clearHighlights()">Quitar todos</button>' : ''}
        </div>
        <div class="form-hint" style="margin-bottom:.75rem">Los indicadores marcados aparecen en el bloque «Indicadores estratégicos destacados» del resumen ejecutivo. Se guarda al marcar.</div>
        <div class="hl-config">
          ${EJES.map(e => `
            <div class="hl-config-eje">
              <div class="hl-config-hd" style="color:${e.color}">Eje ${e.id} · ${e.nombre}</div>
              ${DATA.filter(i => i.eje === e.id).map(i => `
                <label class="check-row">
                  <input type="checkbox" ${hl.includes(i.id) ? 'checked' : ''} onchange="toggleHighlight('${i.id}',this.checked)">
                  <span><strong>${i.id}</strong> · ${i.nombre}</span>
                </label>`).join('')}
            </div>`).join('')}
        </div>
      </div>

      <div class="card card-p">
        <div class="card-header-title" style="margin-bottom:.75rem">Datos de la herramienta</div>
        <div class="cfg-counts">${counts.map(([l, n]) => `<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div>
        <div class="flex gap-sm flex-wrap" style="margin-top:.9rem">
          <button class="btn btn-ghost btn-sm" onclick="exportBackup()">⬇ Exportar copia de seguridad completa</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('backup-file').click()">⬆ Restaurar copia de seguridad</button>
          <input type="file" id="backup-file" accept=".json" style="display:none" onchange="handleBackupImport(event)">
          <button class="btn btn-ghost btn-sm" onclick="exportAuditCSV()">⬇ Exportar auditoría (CSV)</button>
        </div>
        <div class="form-hint" style="margin-top:.5rem">La copia completa incluye actualizaciones, histórico, snapshots, tareas, decisiones, comentarios, evidencias, confianza, configuración, filtros y destacados. Todo se almacena solo en este navegador.</div>
      </div>

      <div class="card" style="overflow:hidden">
        <div class="card-header"><div class="card-header-title">Registro de auditoría (últimas ${Math.min(audit.length, 100)} de ${audit.length})</div></div>
        ${audit.length ? `
          <div class="table-wrap" style="max-height:420px;overflow-y:auto">
            <table class="data-table">
              <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Indicador</th><th>Detalle</th></tr></thead>
              <tbody>${audit.slice(0, 100).map(a => `
                <tr>
                  <td style="white-space:nowrap;color:var(--muted)">${fmtDateTime(a.fecha)}</td>
                  <td>${esc(a.usuario)}</td>
                  <td style="font-weight:600">${esc(a.accion)}</td>
                  <td>${a.indicadorId ? `<span class="ind-link" onclick="openFicha('${esc(a.indicadorId)}')">${esc(a.indicadorId)}</span>` : '—'}</td>
                  <td style="color:var(--ink3)">${esc(a.detalle)}</td>
                </tr>`).join('')}</tbody>
            </table>
          </div>` : emptyBox('Sin actividad registrada todavía')}
      </div>
    </div>`;
}

function saveConfigFromForm() {
  const g = id => (document.getElementById(id)?.value || '').trim();
  const cfg = {
    ...loadConfig(),
    fechaInicioEstrategia: g('cfg-ini'),
    fechaFinEstrategia: g('cfg-fin'),
    fechaUltimoComite: g('cfg-comite'),
    usuarioActual: g('cfg-user') || 'Administrador',
    umbralAchieved: parseFloat(g('cfg-ach')),
    umbralOnTrack: parseFloat(g('cfg-ont')),
    umbralAtRisk: parseFloat(g('cfg-risk'))
  };
  if (!cfg.fechaInicioEstrategia || !cfg.fechaFinEstrategia) { toast('Indica las fechas de inicio y fin de la estrategia', 'error'); return; }
  if (cfg.fechaInicioEstrategia >= cfg.fechaFinEstrategia) { toast('La fecha de fin debe ser posterior a la de inicio', 'error'); return; }
  if ([cfg.umbralAchieved, cfg.umbralOnTrack, cfg.umbralAtRisk].some(isNaN)) { toast('Los umbrales deben ser numéricos', 'error'); return; }
  if (!(cfg.umbralAchieved > cfg.umbralOnTrack && cfg.umbralOnTrack > cfg.umbralAtRisk && cfg.umbralAtRisk >= 0)) {
    toast('Los umbrales deben cumplir: cumplido > seguimiento > riesgo ≥ 0', 'error'); return;
  }
  const prev = loadConfig();
  saveConfig(cfg);
  const changed = Object.keys(cfg).filter(k => String(cfg[k]) !== String(prev[k]));
  logAudit('Configuración guardada', changed.length ? changed.join(', ') : 'sin cambios');
  toast('Configuración guardada', 'success');
  renderConfig();
}
function resetConfigDefaults() {
  if (!confirm('¿Restablecer la configuración a los valores por defecto?')) return;
  saveConfig({ ...CONFIG_DEFAULT });
  logAudit('Configuración restablecida', 'Valores por defecto');
  toast('Configuración restablecida', 'success');
  renderConfig();
}
function toggleHighlight(id, on) {
  let hl = loadHighlights();
  hl = on ? [...new Set([...hl, id])] : hl.filter(x => x !== id);
  saveHighlights(hl);
  logAudit(on ? 'Indicador destacado' : 'Indicador ya no destacado', '', id);
  const hd = document.querySelector('#cfg-highlights .card-header-title');
  if (hd) hd.textContent = `★ Indicadores destacados para dirección (${hl.length})`;
}
function clearHighlights() {
  if (!confirm('¿Quitar todos los indicadores destacados?')) return;
  saveHighlights([]);
  logAudit('Destacados vaciados');
  renderConfig();
}
function handleBackupImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!confirm('Restaurar la copia sustituirá los datos actuales de la herramienta en este navegador. ¿Continuar?')) { e.target.value = ''; return; }
  const r = new FileReader();
  r.onload = ev => { if (importBackup(ev.target.result)) navigate('config'); };
  r.readAsText(file);
  e.target.value = '';
}
function exportAuditCSV() {
  const a = loadAudit();
  if (!a.length) { toast('No hay registros de auditoría', 'error'); return; }
  const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const rows = a.map(x => [q(x.fecha), q(x.usuario), q(x.accion), q(x.indicadorId || ''), q(x.detalle)].join(','));
  downloadFile('okr-etde27-auditoria.csv', ['Fecha,Usuario,Acción,Indicador,Detalle', ...rows].join('\n'), 'text/csv;charset=utf-8;');
}
