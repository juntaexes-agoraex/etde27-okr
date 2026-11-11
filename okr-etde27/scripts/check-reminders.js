'use strict';
const fs          = require('fs');
const path        = require('path');
const nodemailer  = require('nodemailer');

// ── Indicadores con responsable y email confirmado ────────────────────────
// Para añadir más: copiar un bloque y rellenar id, nombre, per (días), responsable, email
const INDICADORES = [
  {
    id:          'E1-01',
    nombre:      'Nivel de satisfacción de la ciudadanía con los servicios públicos digitales',
    per:         180,   // Semestral
    responsable: 'Abel',
    email:       'abel.contreras@juntaex.es',
  },
  {
    id:          'E1-05',
    nombre:      'Puesta en marcha del nuevo Data Center (CPD) — avance en %',
    per:         365,   // Anual
    responsable: 'Carlos',
    email:       'carlos.exposito@juntaex.es',
  },
  {
    id:          'E2-05',
    nombre:      'Creación del Centro Regional de Operaciones de Ciberseguridad (SOC) — avance en %',
    per:         180,   // Semestral
    responsable: 'Carlos',
    email:       'carlos.exposito@juntaex.es',
  },
  {
    id:          'E1-07',
    nombre:      'Integración de tecnologías innovadoras para la mejora del servicio público',
    per:         180,   // Semestral
    responsable: 'Dominga',
    email:       'dominga.galan@juntaex.es',
  },
  // ── PRUEBA — eliminar tras confirmar que el email llega ──────────────────
  {
    id:          'TEST',
    nombre:      'Prueba del sistema de recordatorios automáticos OKR ETDE27',
    per:         1,     // 1 día → siempre vencido → siempre envía
    responsable: 'Sergio',
    email:       'sergio.garcia.satli@accenture.com',
  },
];

// ── Configuración ─────────────────────────────────────────────────────────
const APP_URL    = 'https://juntaexes-agoraex.github.io/etde27-okr/';
const ALERT_DAYS = 7;    // Enviar aviso cuando queden ≤7 días (1 semana antes de vencer)
const DATA_PATH  = path.join(__dirname, '..', 'data', 'actualizaciones.json');

// ── Leer datos actuales del repo ──────────────────────────────────────────
let actualizaciones = {};
try {
  actualizaciones = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
} catch {
  console.warn('⚠ No se pudo leer actualizaciones.json — todos los indicadores se tratarán como sin datos.');
}

// ── Calcular estado de cada indicador ────────────────────────────────────
const hoy = new Date();

function diasDesde(fechaStr) {
  return Math.floor((hoy - new Date(fechaStr)) / 86_400_000);
}

// Agrupar pendientes por email (Carlos recibe ambos E1-05 y E2-05 en un solo email)
const pendientesPorEmail = {};

for (const ind of INDICADORES) {
  const actual           = actualizaciones[ind.id];
  const diasTranscurridos = actual?.fecha ? diasDesde(actual.fecha) : Infinity;
  const diasRestantes    = ind.per - diasTranscurridos;

  if (diasTranscurridos < (ind.per - ALERT_DAYS)) continue;   // Aún no es momento de avisar

  const estado = diasTranscurridos >= ind.per ? 'VENCIDO' : 'PROXIMO';

  if (!pendientesPorEmail[ind.email]) {
    pendientesPorEmail[ind.email] = { nombre: ind.responsable, indicadores: [] };
  }
  pendientesPorEmail[ind.email].indicadores.push({
    id:           ind.id,
    nombre:       ind.nombre,
    estado,
    diasRestantes: Math.max(0, Math.ceil(diasRestantes)),
    ultimaFecha:  actual?.fecha ?? '—',
  });
}

if (Object.keys(pendientesPorEmail).length === 0) {
  console.log('✅ Ningún indicador necesita recordatorio esta semana.');
  process.exit(0);
}

// ── Validar configuración SMTP ────────────────────────────────────────────
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('❌ Faltan variables SMTP. Configura SMTP_HOST, SMTP_USER y SMTP_PASS en los Secrets de GitHub.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host:   SMTP_HOST,
  port:   parseInt(SMTP_PORT || '587'),
  secure: false,
  auth:   { user: SMTP_USER, pass: SMTP_PASS },
});

// ── Generar HTML del email ────────────────────────────────────────────────
function buildEmail(nombre, indicadores) {
  const filas = indicadores.map(ind => {
    const badge = ind.estado === 'VENCIDO'
      ? '<span style="background:#c0392b;color:white;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:bold">VENCIDO</span>'
      : `<span style="background:#e67e22;color:white;padding:3px 10px;border-radius:4px;font-size:12px">Vence en ${ind.diasRestantes} días</span>`;
    return `
      <tr style="border-bottom:1px solid #e8ecf0">
        <td style="padding:12px 14px;font-weight:700;color:#1a3a5c;white-space:nowrap;font-size:14px">${ind.id}</td>
        <td style="padding:12px 14px;font-size:13px;line-height:1.5">${ind.nombre}</td>
        <td style="padding:12px 14px;text-align:center">${badge}</td>
        <td style="padding:12px 14px;color:#888;font-size:13px;white-space:nowrap">${ind.ultimaFecha}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:24px;background:#eef1f5;font-family:Arial,sans-serif">
  <div style="max-width:680px;margin:0 auto">

    <div style="background:#1a3a5c;padding:24px 28px;border-radius:10px 10px 0 0">
      <p style="margin:0 0 6px;color:#8aaecc;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Junta de Extremadura · ETDE27</p>
      <h1 style="margin:0;color:white;font-size:19px;font-weight:700">Recordatorio: actualización de OKRs</h1>
    </div>

    <div style="background:white;padding:28px 28px 24px;border:1px solid #dde3ea;border-top:none;border-radius:0 0 10px 10px">
      <p style="margin-top:0;font-size:15px">Hola <strong>${nombre}</strong>,</p>
      <p style="font-size:14px;color:#444;line-height:1.6">
        Tienes ${indicadores.length === 1 ? 'el siguiente indicador' : 'los siguientes indicadores'} de la
        <strong>Estrategia de Transformación Digital de Extremadura 2027</strong>
        que ${indicadores.length === 1 ? 'requiere' : 'requieren'} actualización:
      </p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e0e6ed;border-radius:8px;overflow:hidden;margin:16px 0">
        <thead>
          <tr style="background:#f5f7fa">
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#777;border-bottom:2px solid #e0e6ed">ID</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#777;border-bottom:2px solid #e0e6ed">Indicador</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#777;border-bottom:2px solid #e0e6ed">Estado</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#777;border-bottom:2px solid #e0e6ed">Último dato</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>

      <p style="font-size:14px;color:#444">Accede a la herramienta, introduce el nuevo valor y pulsa <em>Guardar y sincronizar</em>:</p>
      <a href="${APP_URL}" style="display:inline-block;background:#1a3a5c;color:white;padding:13px 26px;border-radius:7px;text-decoration:none;font-weight:bold;font-size:14px">
        Abrir herramienta OKR →
      </a>

      <hr style="border:none;border-top:1px solid #edf0f4;margin:28px 0 18px">
      <p style="font-size:12px;color:#aaa;margin:0;line-height:1.6">
        Este mensaje se genera automáticamente cada lunes para indicadores próximos a vencer o ya vencidos.<br>
        Si no eres la persona responsable de alguno de estos indicadores, responde a este email para actualizar el listado.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Enviar un email por persona ───────────────────────────────────────────
async function main() {
  for (const [email, { nombre, indicadores }] of Object.entries(pendientesPorEmail)) {
    const hayVencidos = indicadores.some(i => i.estado === 'VENCIDO');
    const n           = indicadores.length;
    const asunto      = hayVencidos
      ? `⚠️ [OKR ETDE27] Actualización urgente — ${n} indicador${n > 1 ? 'es' : ''} vencido${n > 1 ? 's' : ''}`
      : `📅 [OKR ETDE27] Recordatorio — ${n} indicador${n > 1 ? 'es' : ''} próximo${n > 1 ? 's' : ''} a vencer`;

    await transporter.sendMail({
      from:    `"OKR ETDE27 · Junta de Extremadura" <${SMTP_USER}>`,
      to:      email,
      subject: asunto,
      html:    buildEmail(nombre, indicadores),
    });

    console.log(`✓ Email enviado a ${email} (${n} indicador${n > 1 ? 'es' : ''})`);
  }
}

main().catch(err => {
  console.error('❌ Error enviando emails:', err.message);
  process.exit(1);
});
