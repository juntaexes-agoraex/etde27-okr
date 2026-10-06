/* ═══════════════════════════════════════════════════════════
   ETDE27 OKR — Módulo de datos
   Fuente canónica + localStorage + utilidades de cálculo
   ═══════════════════════════════════════════════════════════ */

// ── METADATOS ────────────────────────────────────────────────
const OKR_META = {
  titulo: 'ETDE27 — Estrategia de Transformación Digital de Extremadura 2027',
  version: '1.0',
  generado: '2026-10-06',
  fuentes: [
    'OTID_Informe de avances_ETDE27_v00.04.pptx (fuente principal)',
    'V-FINAL Observatorio_OKR+Detalle_Eje1.pdf',
    'Análisis Funcional Portal Estrategia.docx'
  ]
};

// ── EJES ─────────────────────────────────────────────────────
const EJES = [
  {
    id: 1, color: '#1D4ED8', colorLight: '#DBEAFE',
    nombre: 'Administración al servicio de la ciudadanía',
    descripcion: 'Impulsar una transformación profunda de la Administración extremeña hacia un modelo más cercano, ágil, eficiente e innovador, plenamente orientado a las necesidades reales de la ciudadanía y del tejido productivo.',
    lineas: [
      { id: 'L1.1', nombre: 'Administración cercana al ciudadano' },
      { id: 'L1.2', nombre: 'Administración ágil y homogénea' },
      { id: 'L1.3', nombre: 'Administración eficiente e innovadora' },
      { id: 'L1.4', nombre: 'Administración orientada al desarrollo profesional del empleado público' }
    ]
  },
  {
    id: 2, color: '#7C3AED', colorLight: '#EDE9FE',
    nombre: 'Conectividad para un territorio más inteligente y seguro',
    descripcion: 'Impulsar una Extremadura interconectada, cohesionada y resiliente mediante el fortalecimiento de las infraestructuras digitales y la conectividad.',
    lineas: [
      { id: 'L2.1', nombre: 'Territorio cohesionado y conectado' },
      { id: 'L2.2', nombre: 'Territorio inteligente' },
      { id: 'L2.3', nombre: 'Territorio ciberseguro' }
    ]
  },
  {
    id: 3, color: '#059669', colorLight: '#D1FAE5',
    nombre: 'Hacia una sociedad digital',
    descripcion: 'Desarrollar las competencias y el talento digital de la ciudadanía extremeña, promoviendo la inclusión digital y el acceso igualitario a las oportunidades de la economía digital.',
    lineas: [
      { id: 'L3.1', nombre: 'Sociedad inclusiva' },
      { id: 'L3.2', nombre: 'Talento y empleabilidad digital' }
    ]
  },
  {
    id: 4, color: '#D97706', colorLight: '#FEF3C7',
    nombre: 'Construyendo una región competitiva e innovadora',
    descripcion: 'Impulsar la digitalización del tejido empresarial extremeño y consolidar un ecosistema de innovación digital que atraiga talento e inversión.',
    lineas: [
      { id: 'L4.1', nombre: 'Tejido empresarial competitivo y digital' },
      { id: 'L4.2', nombre: 'Especialización tecnológica y ecosistemas de innovación digital' },
      { id: 'L4.3', nombre: 'Potenciación de los sectores estratégicos regionales' }
    ]
  }
];

// ── INDICADORES (base canónica, no modificar) ────────────────
const INDICADORES_ORIGINAL = [
  { id:'E1-01', eje:1, linea:'L1.1', nuevo:false, inv:false, bin:false,
    nombre:'Nivel de satisfacción de la ciudadanía con los servicios públicos digitales',
    descripcion:'Valoración media de la ciudadanía sobre la calidad percibida de los servicios digitales de la Administración extremeña.',
    unidad:'/10', base:{v:7.4,año:2023}, actual:{v:7.9,fecha:'2026-04-30'}, obj:9,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'Encuesta ciudadana sobre calidad percibida de servicios digitales. Base varía entre 7.3 y 7.4 según fuente; se adopta 7.4 del informe formal.' },

  { id:'E1-02', eje:1, linea:'L1.1', nuevo:false, inv:false, bin:false,
    nombre:'Procedimientos administrativos o trámites que pueden realizarse digitalmente',
    descripcion:'Porcentaje de procedimientos administrativos disponibles para ser tramitados íntegramente de forma digital por la ciudadanía.',
    unidad:'%', base:{v:45,año:2023}, actual:{v:91,fecha:'2026-03-25'}, obj:100,
    per:'Anual', fuente:'MTDyFP', responsable:'Secretaría General de Administración Digital',
    obs:'Incluye 543 procedimientos en TRAMITA y 47 en ARADO. Más de 1.2 millones de trámites ciudadanos realizados desde julio 2024.' },

  { id:'E1-03', eje:1, linea:'L1.2', nuevo:false, inv:true, bin:false,
    nombre:'Reducción del tiempo de resolución de los procedimientos administrativos simplificados',
    descripcion:'Porcentaje de reducción media del tiempo de resolución respecto al periodo base, tras la simplificación de los procedimientos.',
    unidad:'%', base:{v:null,año:2023}, actual:{v:45,fecha:'2026-05-05'}, obj:30,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'OBJETIVO CUMPLIDO. Reducción media del 45% vs. objetivo del 30%. Indicador invertido: mayor reducción = mayor avance. La simplificación de 455 procedimientos generó: 61% menos documentos, 36% menos datos solicitados.' },

  { id:'E1-04', eje:1, linea:'L1.2', nuevo:true, inv:false, bin:false,
    nombre:'Número de conjuntos de datos publicados en el portal de datos abiertos (datos.gob.es)',
    descripcion:'Número de conjuntos de datos oficiales de la Junta de Extremadura publicados en el portal nacional de datos abiertos.',
    unidad:'nº', base:{v:13,año:2023}, actual:{v:51,fecha:'2026-04-24'}, obj:200,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'Nuevo OKR 2026. Se han publicado 38 nuevos conjuntos de datos. Aún lejos del objetivo de 200; requiere intensificación del ritmo.' },

  { id:'E1-05', eje:1, linea:'L1.3', nuevo:false, inv:false, bin:false,
    nombre:'Puesta en marcha del nuevo Data Center (CPD) — avance en %',
    descripcion:'Porcentaje de avance en la construcción y puesta en marcha del nuevo Centro de Procesamiento de Datos corporativo.',
    unidad:'%', base:{v:5,año:2023}, actual:{v:7,fecha:'2026-01-19'}, obj:80,
    per:'Anual', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'Avance muy escaso: solo 2pp desde la base. Se han realizado actuaciones en CPDs existentes. El proyecto del nuevo CPD requiere atención urgente.' },

  { id:'E1-06', eje:1, linea:'L1.2', nuevo:false, inv:false, bin:false,
    nombre:'Número de procedimientos integrados en aplicaciones de gestión para consulta de interoperabilidad',
    descripcion:'Número de procedimientos integrados en el ecosistema de interoperabilidad para consulta automática de datos entre administraciones.',
    unidad:'nº', base:{v:22,año:2023}, actual:{v:65,fecha:'2026-03-31'}, obj:150,
    per:'Anual', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'Avance de 43 procedimientos. 250 convenios suscritos con entidades locales. Convenio con AGE para acceso a Cl@ve, @firma, Notific@.' },

  { id:'E1-07', eje:1, linea:'L1.3', nuevo:true, inv:false, bin:false,
    nombre:'Integración de tecnologías innovadoras para la mejora del servicio público',
    descripcion:'Número de actuaciones en ejecución que incorporan tecnologías innovadoras (IA, RPA, etc.) en la mejora de servicios públicos.',
    unidad:'nº', base:{v:null,año:2023}, actual:{v:9,fecha:'2026-05-27'}, obj:15,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'Nuevo OKR. 9 actuaciones en ejecución (IA, RPA). Plataforma Corporativa de IA desplegada. Pruebas de concepto RPA en trámites de alto impacto.' },

  { id:'E1-08', eje:1, linea:'L1.3', nuevo:true, inv:false, bin:false,
    nombre:'Laboratorio de Innovación (ÁgoraEX) — puesta en marcha, avance en %',
    descripcion:'Porcentaje de avance en la puesta en marcha y operatividad del Laboratorio de Innovación ÁgoraEX.',
    unidad:'%', base:{v:null,año:2023}, actual:{v:100,fecha:'2026-01-19'}, obj:100,
    per:'n/a', fuente:'Junta de Extremadura', responsable:'Secretaría General de Administración Digital',
    obs:'OBJETIVO CUMPLIDO. ÁgoraEX operativo con 2 retos completados. 38 participantes, 21 empresas, valoración media 9.2/10.' },

  { id:'E1-09', eje:1, linea:'L1.4', nuevo:false, inv:false, bin:false,
    nombre:'Porcentaje de empleados públicos certificados en alguna competencia digital',
    descripcion:'Proporción de empleados públicos de la Junta de Extremadura con alguna certificación oficial en competencias digitales.',
    unidad:'%', base:{v:15.85,año:2023}, actual:{v:31.4,fecha:'2026-05-27'}, obj:40,
    per:'Anual', fuente:'Junta de Extremadura', responsable:'Secretaría General de Función Pública',
    obs:'91 cursos impartidos, +11.000 certificaciones emitidas. Plan de Capacitación Digital del Empleado Público activo.' },

  { id:'E2-01', eje:2, linea:'L2.1', nuevo:false, inv:false, bin:false,
    nombre:'Porcentaje de viviendas con conexión a internet',
    descripcion:'Proporción de viviendas en Extremadura que disponen de conexión a internet.',
    unidad:'%', base:{v:93.3,año:2023}, actual:{v:95,fecha:'2026-01-19'}, obj:95,
    per:'Anual', fuente:'INE', responsable:'Secretaría General de Telecomunicaciones',
    obs:'OBJETIVO CUMPLIDO. Acceso a internet prácticamente universal en viviendas extremeñas.' },

  { id:'E2-02', eje:2, linea:'L2.1', nuevo:false, inv:false, bin:false,
    nombre:'Cobertura de redes móviles 5G',
    descripcion:'Porcentaje de la población de Extremadura cubierta por redes de telefonía móvil 5G.',
    unidad:'%', base:{v:76.5,año:2023}, actual:{v:88.6,fecha:'2026-01-19'}, obj:85,
    per:'Anual', fuente:'MTDyFP', responsable:'Secretaría General de Telecomunicaciones',
    obs:'OBJETIVO SUPERADO. Del 76.5% al 88.6%, por encima del objetivo del 85%. Mejora la capacidad tecnológica del territorio.' },

  { id:'E2-03', eje:2, linea:'L2.1', nuevo:false, inv:false, bin:false,
    nombre:'Empresas que tienen acceso a internet por redes de cable y fibra óptica',
    descripcion:'Porcentaje de empresas extremeñas con acceso a internet a través de redes de cable o fibra óptica.',
    unidad:'%', base:{v:78,año:2023}, actual:{v:79,fecha:'2026-01-19'}, obj:90,
    per:'Anual', fuente:'ONTSI', responsable:'Secretaría General de Telecomunicaciones',
    obs:'Progreso escaso: +1pp en 2 años, con 11pp de brecha respecto al objetivo. Requiere actuaciones específicas.' },

  { id:'E2-04', eje:2, linea:'L2.2', nuevo:false, inv:false, bin:false,
    nombre:'Actuaciones en convocatorias para el desarrollo de pueblos inteligentes',
    descripcion:'Número de actuaciones realizadas o en curso en el marco de las convocatorias de Pueblos Inteligentes.',
    unidad:'nº', base:{v:260,año:2023}, actual:{v:394,fecha:'2026-01-28'}, obj:450,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Secretaría General de Telecomunicaciones',
    obs:'Buen progreso: +134 actuaciones desde la base. Impulso destacable a la digitalización del entorno rural.' },

  { id:'E2-05', eje:2, linea:'L2.3', nuevo:false, inv:false, bin:false,
    nombre:'Creación del Centro Regional de Operaciones de Ciberseguridad (SOC) — avance en %',
    descripcion:'Porcentaje de avance en la creación y puesta en marcha del Centro Regional de Operaciones de Ciberseguridad.',
    unidad:'%', base:{v:0,año:2023}, actual:{v:2,fecha:'2026-01-28'}, obj:100,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Agencia Extremeña de Ciberseguridad',
    obs:'Avance muy incipiente (2%). El SOC es infraestructura crítica. Requiere atención prioritaria y aceleración significativa.' },

  { id:'E2-06', eje:2, linea:'L2.3', nuevo:true, inv:false, bin:false,
    nombre:'Empresas que se han beneficiado de la Plataforma de Ciberseguridad',
    descripcion:'Número de empresas extremeñas registradas y beneficiadas por los servicios de la Plataforma Regional de Ciberseguridad.',
    unidad:'nº', base:{v:0,año:2023}, actual:{v:118,fecha:'2026-04-24'}, obj:300,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Agencia Extremeña de Ciberseguridad',
    obs:'Nuevo OKR. 118 empresas registradas. Evidencia creciente concienciación y acceso a servicios de ciberseguridad.' },

  { id:'E2-07', eje:2, linea:'L2.3', nuevo:false, inv:false, bin:true,
    nombre:'Creación de la Comisión de Seguimiento Interinstitucional sobre Ciberseguridad',
    descripcion:'Constitución formal de la Comisión Interinstitucional de Seguimiento en materia de Ciberseguridad.',
    unidad:'Sí/No', base:{v:'No',año:2023}, actual:{v:'No',fecha:'2026-03-25'}, obj:'Sí',
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Agencia Extremeña de Ciberseguridad',
    obs:'No constituida. Necesaria para coordinar la respuesta institucional ante ciberincidentes.' },

  { id:'E2-08', eje:2, linea:'L2.3', nuevo:false, inv:false, bin:false,
    nombre:'Campañas de sensibilización y capacitación en materia de ciberseguridad',
    descripcion:'Número de campañas de sensibilización y capacitación realizadas en materia de ciberseguridad.',
    unidad:'nº', base:{v:null,año:2023}, actual:{v:3,fecha:'2026-01-28'}, obj:15,
    per:'Semestral', fuente:'Junta de Extremadura', responsable:'Agencia Extremeña de Ciberseguridad',
    obs:'Solo 3 de las 15 campañas previstas (20%). Ritmo insuficiente para alcanzar el objetivo en 2027.' },

  { id:'E3-01', eje:3, linea:'L3.1', nuevo:false, inv:false, bin:false,
    nombre:'Población que tiene como mínimo competencias digitales básicas',
    descripcion:'Porcentaje de la población extremeña de 16 a 74 años con al menos competencias digitales básicas según el marco DigComp.',
    unidad:'%', base:{v:59.9,año:2023}, actual:{v:60.5,fecha:'2026-01-19'}, obj:68,
    per:'Anual', fuente:'INE', responsable:'Consejería de Economía',
    obs:'Progreso muy limitado: +0.6pp en 2 años. Cambio estructural lento. Se requiere intensificar programas de alfabetización digital.' },

  { id:'E3-02', eje:3, linea:'L3.2', nuevo:false, inv:false, bin:false,
    nombre:'Egresados en especialidades tecnológicas sobre el total de egresados',
    descripcion:'Porcentaje de egresados universitarios en titulaciones tecnológicas respecto al total en Extremadura.',
    unidad:'%', base:{v:2.83,año:2023}, actual:{v:2.89,fecha:'2026-01-19'}, obj:5,
    per:'Anual', fuente:'Observatorio TIC', responsable:'Consejería de Universidad',
    obs:'Avance mínimo: +0.06pp. Brecha de 2.11pp respecto al objetivo. Necesario mayor impulso a vocaciones tecnológicas.' },

  { id:'E3-03', eje:3, linea:'L3.2', nuevo:false, inv:false, bin:false,
    nombre:'Mujeres matriculadas en carreras STEM',
    descripcion:'Porcentaje de mujeres matriculadas en carreras STEM (Ciencia, Tecnología, Ingeniería y Matemáticas) en universidades extremeñas.',
    unidad:'%', base:{v:23.2,año:2023}, actual:{v:23.3,fecha:'2026-01-19'}, obj:30,
    per:'Anual', fuente:'MICIU', responsable:'Consejería de Universidad',
    obs:'Avance prácticamente nulo (+0.1pp). Requiere políticas específicas de fomento de vocaciones STEM entre mujeres.' },

  { id:'E3-04', eje:3, linea:'L3.2', nuevo:true, inv:false, bin:false,
    nombre:'Estudiantes que eligen ingenierías informáticas como primera opción universitaria',
    descripcion:'Número de estudiantes que seleccionan en primera opción alguna ingeniería informática en universidades extremeñas.',
    unidad:'nº', base:{v:498,año:2023}, actual:{v:571,fecha:'2026-04-24'}, obj:600,
    per:'Anual', fuente:'OBIN', responsable:'Consejería de Universidad',
    obs:'Nuevo OKR. Buen avance: +73 estudiantes (71.6% de la brecha cerrada). Refleja interés creciente en titulaciones tecnológicas.' },

  { id:'E3-05', eje:3, linea:'L3.1', nuevo:false, inv:false, bin:false,
    nombre:'Campañas para la atracción de nómadas digitales en entornos rurales de Extremadura',
    descripcion:'Número de campañas o actuaciones realizadas para atraer nómadas digitales al entorno rural extremeño.',
    unidad:'nº', base:{v:null,año:2023}, actual:{v:3,fecha:'2026-05-08'}, obj:10,
    per:'Anual', fuente:'Junta de Extremadura', responsable:'Consejería de Economía',
    obs:'3 actuaciones impulsadas para atraer nómadas digitales al entorno rural, combatiendo la despoblación y reforzando la economía local.' },

  { id:'E4-01', eje:4, linea:'L4.1', nuevo:false, inv:false, bin:false,
    nombre:'Empresas con conexión de banda ancha que tienen presencia en internet',
    descripcion:'Porcentaje de empresas extremeñas con banda ancha y presencia activa en internet (web, redes sociales, etc.).',
    unidad:'%', base:{v:71,año:2023}, actual:{v:73.5,fecha:'2026-01-19'}, obj:80,
    per:'Anual', fuente:'INE', responsable:'Consejería de Economía',
    obs:'Avance de 2.5pp en 2 años sobre una brecha de 9pp. Ritmo de mejora insuficiente para alcanzar el objetivo en 2027.' },

  { id:'E4-02', eje:4, linea:'L4.1', nuevo:false, inv:false, bin:false,
    nombre:'Empresas que utilizan computación en la nube',
    descripcion:'Porcentaje de empresas extremeñas que utilizan servicios de computación en la nube (IaaS, PaaS o SaaS).',
    unidad:'%', base:{v:19.76,año:2023}, actual:{v:29.3,fecha:'2026-01-19'}, obj:30,
    per:'Anual', fuente:'INE', responsable:'Consejería de Economía',
    obs:'Muy próximo al objetivo 2027 (a solo 0.7pp). Debería alcanzarse o superarse en 2027 con el ritmo actual.' },

  { id:'E4-03', eje:4, linea:'L4.1', nuevo:false, inv:false, bin:false,
    nombre:'Empresas con más de 10 trabajadores que emplean tecnologías de Inteligencia Artificial',
    descripcion:'Porcentaje de empresas extremeñas con más de 10 empleados que utilizan tecnologías de inteligencia artificial.',
    unidad:'%', base:{v:6,año:2023}, actual:{v:15.1,fecha:'2026-01-19'}, obj:15,
    per:'Anual', fuente:'INE', responsable:'Consejería de Economía',
    obs:'OBJETIVO CUMPLIDO Y SUPERADO. Del 6% al 15.1%, superando el objetivo 2027. Salto cualitativo en madurez tecnológica.' },

  { id:'E4-04', eje:4, linea:'L4.2', nuevo:false, inv:false, bin:false,
    nombre:'Activos digitales sistematizados para la prestación de servicios de digitalización avanzada a empresas',
    descripcion:'Número de activos digitales sistematizados por el EDIH para la digitalización avanzada del tejido empresarial.',
    unidad:'nº', base:{v:271,año:2023}, actual:{v:322,fecha:'2026-01-19'}, obj:400,
    per:'Semestral', fuente:'Observatorio TIC', responsable:'EDIH Extremadura',
    obs:'Avance de 51 activos. EDIH: 45 pilotos tecnológicos y 315 evaluaciones de madurez digital. Sello europeo STEP obtenido.' },

  { id:'E4-05', eje:4, linea:'L4.3', nuevo:false, inv:false, bin:false,
    nombre:'Empresas agroindustriales que han adoptado nuevas tecnologías',
    descripcion:'Porcentaje de empresas agroindustriales extremeñas que han adoptado nuevas tecnologías digitales.',
    unidad:'%', base:{v:null,año:2023}, actual:{v:20.3,fecha:'2026-05-20'}, obj:20,
    per:'Anual', fuente:'Observatorio TIC', responsable:'Consejería de Agricultura',
    obs:'OBJETIVO CUMPLIDO. 20.3% con digitalización avanzada. Calculado con CNAEs INE 2025 (1.219 empresas; 248 con servicios).' },

  { id:'E4-06', eje:4, linea:'L4.2', nuevo:false, inv:false, bin:false,
    nombre:'Iniciativas apoyadas a través de instrumentos regionales de impulso a la Industria 4.0',
    descripcion:'Número de iniciativas empresariales apoyadas a través de instrumentos regionales de impulso a la Industria 4.0.',
    unidad:'nº', base:{v:null,año:2023}, actual:{v:65,fecha:'2026-01-19'}, obj:40,
    per:'Semestral', fuente:'Observatorio TIC', responsable:'Consejería de Economía',
    obs:'OBJETIVO SUPERADO. 65 iniciativas vs. objetivo de 40 (162.5%). Incluye 46 ayudas para digitalización industrial.' }
];

// ── ESTADO DE CÁLCULO ────────────────────────────────────────
const STATUS_CONFIG = {
  achieved: { label: 'Objetivo cumplido',  color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', cssClass: 'achieved' },
  on_track: { label: 'En seguimiento',     color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', cssClass: 'on_track' },
  at_risk:  { label: 'En riesgo',          color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', cssClass: 'at_risk'  },
  critical: { label: 'Atención urgente',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', cssClass: 'critical' }
};

function calcProg(ind) {
  if (ind.bin) return ind.actual.v === ind.obj ? 100 : 0;
  if (ind.inv) return ind.actual.v >= ind.obj ? 100 : (ind.actual.v / ind.obj) * 100;
  const a = ind.actual.v, o = ind.obj, b = ind.base.v;
  if (b !== null && b !== undefined) {
    const gap = o - b;
    if (gap <= 0) return a >= o ? 100 : 0;
    return Math.max(0, ((a - b) / gap) * 100);
  }
  return Math.min((a / o) * 100, 100);
}

function getStatus(ind) {
  const p = calcProg(ind);
  if (p >= 100) return 'achieved';
  if (p >= 60)  return 'on_track';
  if (p >= 30)  return 'at_risk';
  return 'critical';
}

// ── FORMATEO ─────────────────────────────────────────────────
function fmtNum(ind, val) {
  if (val === null || val === undefined) return '—';
  if (ind.bin) return val;
  const n = +val;
  if (ind.unidad === '/10') return n.toFixed(1) + '/10';
  if (ind.unidad === '%')   return (n % 1 === 0 ? n : n.toFixed(1)) + '%';
  if (ind.unidad === 'nº')  return n % 1 === 0 ? String(n) : n.toFixed(1);
  return n + ' ' + ind.unidad;
}

function fmtBase(ind)   { return fmtNum(ind, ind.base.v); }
function fmtActual(ind) { return fmtNum(ind, ind.actual.v); }
function fmtObj(ind)    { return ind.bin ? ind.obj : fmtNum(ind, ind.obj); }
function fmtProg(ind)   { return Math.min(Math.round(calcProg(ind)), 100) + '%'; }

function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(day)} ${meses[parseInt(m) - 1]} ${y}`;
}

function fmtVar(ind) {
  if (ind.bin) return ind.actual.v === ind.obj ? '✓ Sí' : '✗ No';
  if (ind.base.v === null || ind.base.v === undefined) return '—';
  const diff = ind.actual.v - ind.base.v;
  const sign = diff >= 0 ? '+' : '';
  if (ind.unidad === '%')   return sign + (diff % 1 === 0 ? diff : diff.toFixed(1)) + ' pp';
  if (ind.unidad === '/10') return sign + diff.toFixed(1);
  return sign + (diff % 1 === 0 ? diff : diff.toFixed(1));
}

// ── PERSISTENCIA ─────────────────────────────────────────────
const LS_KEY   = 'okr-etde27-updates';
const LS_HIST  = 'okr-etde27-history';

function loadUpdates() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
  catch { return {}; }
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HIST) || '[]'); }
  catch { return []; }
}

function applyUpdates(orig) {
  const updates = loadUpdates();
  return orig.map(base => {
    const u = updates[base.id];
    if (!u) return { ...base, _mod: false };
    return {
      ...base,
      actual: { v: u.v !== undefined ? u.v : base.actual.v, fecha: u.fecha || base.actual.fecha },
      obs: u.obs !== undefined ? u.obs : base.obs,
      _mod: true, _modAt: u._at, _prevV: u._prev
    };
  });
}

function saveUpdate(id, v, fecha, obs) {
  const updates = loadUpdates();
  const ind = DATA.find(i => i.id === id);
  if (!ind) return;
  updates[id] = { v: parseFloat(v), fecha: fecha || ind.actual.fecha, obs, _prev: ind.actual.v, _at: new Date().toISOString() };
  localStorage.setItem(LS_KEY, JSON.stringify(updates));
  // History
  const hist = loadHistory();
  hist.unshift({ id, nombre: ind.nombre, v: parseFloat(v), fecha, _prev: ind.actual.v, _at: updates[id]._at });
  if (hist.length > 200) hist.splice(200);
  localStorage.setItem(LS_HIST, JSON.stringify(hist));
  refreshData();
  toast('Indicador actualizado correctamente', 'success');
}

function resetOne(id) {
  const updates = loadUpdates();
  delete updates[id];
  localStorage.setItem(LS_KEY, JSON.stringify(updates));
  refreshData();
  toast('Valor restaurado al original');
}

function resetAll() {
  localStorage.removeItem(LS_KEY);
  refreshData();
  toast('Todos los datos restaurados a los valores originales');
}

// ── DATOS ACTIVOS ────────────────────────────────────────────
let DATA = [];
function refreshData() {
  DATA = applyUpdates(INDICADORES_ORIGINAL);
}
refreshData();

// ── ESTADÍSTICAS ─────────────────────────────────────────────
function globalStats() {
  const total = DATA.length;
  const counts = { achieved: 0, on_track: 0, at_risk: 0, critical: 0 };
  DATA.forEach(i => counts[getStatus(i)]++);
  const avgP = DATA.reduce((s, i) => s + Math.min(calcProg(i), 100), 0) / total;
  const modified = DATA.filter(i => i._mod).length;
  return { total, counts, avgP, modified };
}

function ejeStats(n) {
  const inds = DATA.filter(i => i.eje === n);
  const counts = { achieved: 0, on_track: 0, at_risk: 0, critical: 0 };
  inds.forEach(i => counts[getStatus(i)]++);
  const avg = inds.reduce((s, i) => s + Math.min(calcProg(i), 100), 0) / inds.length;
  return { inds, counts, avg };
}

function lastUpdateDate() {
  const dates = DATA.map(i => i.actual.fecha).filter(Boolean).sort();
  return dates[dates.length - 1] || null;
}

// ── EXPORT / IMPORT ──────────────────────────────────────────
function exportJSON() {
  const out = {
    exportedAt: new Date().toISOString(), source: 'OKR ETDE27',
    updates: loadUpdates(),
    snapshot: DATA.map(i => ({
      id: i.id, eje: i.eje, linea: i.linea, nombre: i.nombre,
      unidad: i.unidad, base: i.base.v, actual: i.actual.v,
      fecha: i.actual.fecha, objetivo: i.obj,
      progreso: Math.round(calcProg(i)), estado: getStatus(i), _mod: i._mod || false
    }))
  };
  downloadFile('okr-etde27-export.json', JSON.stringify(out, null, 2), 'application/json');
}

function exportCSV() {
  const cols = ['ID','Eje','Línea','Indicador','Base 2023','Valor Actual','Fecha Actual','Objetivo 2027','Avance %','Variación','Estado','Periodicidad','Fuente','Responsable'];
  const rows = DATA.map(i => [
    i.id, i.eje, i.linea, `"${i.nombre}"`,
    i.base.v !== null && i.base.v !== undefined ? i.base.v : '',
    i.actual.v, i.actual.fecha, i.obj,
    Math.round(calcProg(i)),
    i.base.v !== null && !i.bin ? (i.actual.v - i.base.v).toFixed(2) : '',
    getStatus(i), i.per, `"${i.fuente}"`, `"${i.responsable || ''}"`
  ].join(','));
  downloadFile('okr-etde27-export.csv', [cols.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8;');
}

function importJSON(jsonStr) {
  try {
    const obj = JSON.parse(jsonStr);
    if (obj.updates && typeof obj.updates === 'object') {
      localStorage.setItem(LS_KEY, JSON.stringify(obj.updates));
      refreshData();
      toast('Datos importados correctamente', 'success');
      return true;
    }
    toast('Formato JSON no reconocido. Exporta primero desde esta herramienta.', 'error');
    return false;
  } catch {
    toast('Error al leer el archivo JSON', 'error');
    return false;
  }
}

function downloadFile(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + content], { type }));
  a.download = name;
  a.click();
}

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, cls = '') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast' + (cls ? ' ' + cls : '');
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── HELPERS DE COLOR ─────────────────────────────────────────
function ejeColor(n)  { return EJES.find(e => e.id === n)?.color      || '#6B7280'; }
function ejeLight(n)  { return EJES.find(e => e.id === n)?.colorLight  || '#F3F4F6'; }
function ejeNombre(n) { return EJES.find(e => e.id === n)?.nombre      || 'Eje ' + n; }

function statusColor(st) { return STATUS_CONFIG[st]?.color || '#6B7280'; }
function statusLabel(st) { return STATUS_CONFIG[st]?.label || st; }
function statusBg(st)    { return STATUS_CONFIG[st]?.bg    || '#F3F4F6'; }
