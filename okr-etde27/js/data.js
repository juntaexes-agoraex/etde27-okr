/* ═══════════════════════════════════════════════════════════
   ETDE27 OKR — Módulo de datos
   Fuente canónica + localStorage + utilidades de cálculo
   ═══════════════════════════════════════════════════════════ */

// ── METADATOS ────────────────────────────────────────────────
const OKR_META = {
  titulo: 'ETDE27 — Estrategia de Transformación Digital de Extremadura 2027',
  version: '2.0',
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
    unidad:'nº', base:{v:0,año:2023}, actual:{v:3,fecha:'2026-01-28'}, obj:15,
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
    unidad:'nº', base:{v:0,año:2023}, actual:{v:3,fecha:'2026-05-08'}, obj:10,
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
    unidad:'%', base:{v:0,año:2023}, actual:{v:20.3,fecha:'2026-05-20'}, obj:20,
    per:'Anual', fuente:'Observatorio TIC', responsable:'Consejería de Agricultura',
    obs:'OBJETIVO CUMPLIDO. 20.3% con digitalización avanzada. Calculado con CNAEs INE 2025 (1.219 empresas; 248 con servicios).' },

  { id:'E4-06', eje:4, linea:'L4.2', nuevo:false, inv:false, bin:false,
    nombre:'Iniciativas apoyadas a través de instrumentos regionales de impulso a la Industria 4.0',
    descripcion:'Número de iniciativas empresariales apoyadas a través de instrumentos regionales de impulso a la Industria 4.0.',
    unidad:'nº', base:{v:0,año:2023}, actual:{v:65,fecha:'2026-01-19'}, obj:40,
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
  // Umbrales configurables (v2.0). Por defecto: 100 / 60 / 30
  const t = statusThresholds();
  if (p >= t.achieved) return 'achieved';
  if (p >= t.on_track) return 'on_track';
  if (p >= t.at_risk)  return 'at_risk';
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

function saveUpdate(id, v, fecha, obs, extra = {}) {
  const updates = loadUpdates();
  const ind = DATA.find(i => i.id === id);
  if (!ind) return;
  // Indicadores binarios guardan 'Sí'/'No'; el resto, numérico
  const newV = ind.bin ? String(v) : parseFloat(v);
  updates[id] = { v: newV, fecha: fecha || ind.actual.fecha, obs, _prev: ind.actual.v, _at: new Date().toISOString() };
  localStorage.setItem(LS_KEY, JSON.stringify(updates));
  // History
  const hist = loadHistory();
  hist.unshift({ id, nombre: ind.nombre, v: newV, fecha, _prev: ind.actual.v, _at: updates[id]._at });
  if (hist.length > 200) hist.splice(200);
  localStorage.setItem(LS_HIST, JSON.stringify(hist));
  // Histórico rico (v2.0)
  try {
    if (!getHistory2(id).length && ind.actual.v !== null && ind.actual.v !== undefined) {
      // Primera actualización: se registra el valor vigente como punto de referencia (dato real, no inventado)
      addRichHistoryEntry(id, {
        v: ind.actual.v, fecha: ind.actual.fecha,
        usuario: ind._mod ? (loadConfig().usuarioActual || 'Administrador') : 'Fuente oficial',
        comentario: ind._mod ? 'Valor vigente previo (actualización local anterior)' : 'Valor de referencia del informe de avances (dato de partida de la herramienta)',
        confianza: getConfidence(id), origen: 'referencia'
      });
    }
    addRichHistoryEntry(id, {
      v: newV, fecha: fecha || ind.actual.fecha,
      comentario: extra.comentario || '',
      confianza: extra.confianza || getConfidence(id)
    });
    logAudit('Actualización de valor', `${fmtNum(ind, ind.actual.v)} → ${fmtNum(ind, newV)} (dato ${fecha || ind.actual.fecha})`, id);
  } catch (e) { console.error('Histórico v2', e); }
  refreshData();
  toast('Indicador actualizado correctamente', 'success');
  ghPush(); // publica en GitHub si hay sesión de editor activa
}

function resetOne(id) {
  const updates = loadUpdates();
  delete updates[id];
  localStorage.setItem(LS_KEY, JSON.stringify(updates));
  refreshData();
  try { logAudit('Restauración de valor original', 'Se elimina la actualización local', id); } catch (e) { console.error(e); }
  toast('Valor restaurado al original');
}

function resetAll() {
  localStorage.removeItem(LS_KEY);
  refreshData();
  try { logAudit('Restauración global', 'Todos los indicadores vuelven a sus valores originales'); } catch (e) { console.error(e); }
  toast('Todos los datos restaurados a los valores originales');
}

// ── INE AUTO-FETCH CONFIG ────────────────────────────────────
// type:'serie'     → DATOS_SERIE/{serie}?nult=1
// type:'tabla'     → DATOS_TABLA/{tabla}?nult=1, filtramos por Nombre (includes)
// type:'tabla_sum' → igual que tabla pero suma varios Nombre y devuelve el total
const INE_SERIES = {
  'E2-01': {
    type: 'serie', serie: 'DCS448',
    label: 'TIC Hogares · Extremadura · Viviendas con conexión a internet'
  },
  'E3-01': {
    type: 'tabla_sum', tabla: '76631',
    filtros: [
      { region: 'Extremadura', variable: 'Habilidades Digitales: Habilidad Básica',    sector: 'Total Personas' },
      { region: 'Extremadura', variable: 'Habilidades Digitales: Habilidad Avanzada',  sector: 'Total Personas' }
    ],
    label: 'TIC Hogares · Extremadura · Competencias digitales al menos básicas'
  },
  'E4-01': {
    type: 'serie', serie: 'DCC535',
    label: 'ETICCE · Extremadura · Empresas con sitio/página web'
  },
  'E4-02': {
    type: 'tabla', tabla: '82405',
    filter: { region: 'Extremadura', variable: ', E.1 ', sector: 'Total Empresas' },
    label: 'ETICCE · Extremadura · Cloud computing de pago · Total'
  },
  'E4-03': {
    type: 'tabla', tabla: '82404',
    filter: { region: 'Extremadura', variable: ', D.1 ', sector: 'Total Empresas' },
    label: 'ETICCE · Extremadura · Inteligencia Artificial · Total'
  }
};

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
      try { logAudit('Importación JSON', Object.keys(obj.updates).length + ' indicadores con actualizaciones'); } catch (e) { console.error(e); }
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


/* ═══════════════════════════════════════════════════════════
   v2.0 — EXTENSIONES DE DATOS
   Histórico rico · confianza · ritmo · calendario · tareas ·
   decisiones · snapshots · comentarios · evidencias · auditoría ·
   configuración · filtros guardados · destacados
   ═══════════════════════════════════════════════════════════ */

// ── UTILIDADES ───────────────────────────────────────────────
function uuid() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

function safeLoad(key, def) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return def;
    const v = JSON.parse(raw);
    return v === null || v === undefined ? def : v;
  } catch { return def; }
}

function safeSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch (e) { console.error('localStorage', key, e); toast('No se ha podido guardar en el navegador', 'error'); return false; }
}

// Fecha local a partir de 'YYYY-MM-DD' (evita desfases de zona horaria)
function parseDate(d) {
  if (!d) return null;
  if (d instanceof Date) return new Date(d.getTime());
  const [y, m, day] = String(d).slice(0, 10).split('-').map(Number);
  if (!y) return null;
  return new Date(y, (m || 1) - 1, day || 1);
}
function toISODate(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
function todayDate() { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }
function todayISO()  { return toISODate(new Date()); }
function addDaysISO(iso, n) { const d = parseDate(iso); if (!d) return null; d.setDate(d.getDate() + n); return toISODate(d); }
function daysBetween(d1, d2) { return Math.ceil((parseDate(d2) - parseDate(d1)) / 86400000); }

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Diferencia formateada con unidad (pp para porcentajes)
function fmtDiff(ind, d, withSign = true) {
  if (d === null || d === undefined || isNaN(d)) return '—';
  const sign = withSign && d > 0 ? '+' : '';
  const r = Math.abs(d % 1) < 1e-9 ? String(Math.round(d)) : (+d.toFixed(2)).toString();
  if (ind.unidad === '%')   return sign + r + ' pp';
  if (ind.unidad === '/10') return sign + d.toFixed(1);
  if (ind.unidad === 'nº')  return sign + r;
  return sign + r + ' ' + ind.unidad;
}

// Progreso que tendría el indicador con otro valor
function progForValue(ind, v) {
  return calcProg({ ...ind, actual: { ...ind.actual, v } });
}

// ── CONFIGURACIÓN ────────────────────────────────────────────
const LS_CONFIG = 'okr-etde27-config';
const CONFIG_DEFAULT = {
  fechaInicioEstrategia: '2023-01-01',
  fechaFinEstrategia: '2027-12-31',
  fechaUltimoComite: '2026-10-01',
  usuarioActual: 'Administrador',
  umbralAchieved: 100,
  umbralOnTrack: 60,
  umbralAtRisk: 30
};
let _cfgCache = null;
function loadConfig() {
  if (!_cfgCache) {
    try { _cfgCache = { ...CONFIG_DEFAULT, ...JSON.parse(localStorage.getItem(LS_CONFIG) || '{}') }; }
    catch { _cfgCache = { ...CONFIG_DEFAULT }; }
  }
  return { ..._cfgCache };
}
function saveConfig(cfg) {
  localStorage.setItem(LS_CONFIG, JSON.stringify(cfg));
  _cfgCache = null;
  _thrCache = null;
}
let _thrCache = null;
function statusThresholds() {
  if (_thrCache) return _thrCache;
  const c = loadConfig();
  const num = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  _thrCache = {
    achieved: num(c.umbralAchieved, 100),
    on_track: num(c.umbralOnTrack, 60),
    at_risk:  num(c.umbralAtRisk, 30)
  };
  return _thrCache;
}
function currentUser() { return loadConfig().usuarioActual || 'Administrador'; }

// ── AUDITORÍA ────────────────────────────────────────────────
const LS_AUDIT = 'okr-etde27-audit';
function loadAudit() { return safeLoad(LS_AUDIT, []); }
function logAudit(accion, detalle = '', indicadorId = null) {
  try {
    const a = loadAudit();
    a.unshift({ id: uuid(), fecha: new Date().toISOString(), usuario: currentUser(), accion, detalle, indicadorId });
    if (a.length > 500) a.splice(500);
    localStorage.setItem(LS_AUDIT, JSON.stringify(a));
  } catch (e) { console.error('audit', e); }
}

// ── NIVEL DE CONFIANZA ───────────────────────────────────────
const LS_CONFIDENCE = 'okr-etde27-confidence';
function loadConfidence() { try { return JSON.parse(localStorage.getItem(LS_CONFIDENCE) || '{}'); } catch { return {}; } }
function setConfidence(id, level) {
  const c = loadConfidence();
  const prev = c[id] || 'pendiente';
  c[id] = level;
  localStorage.setItem(LS_CONFIDENCE, JSON.stringify(c));
  if (prev !== level) logAudit('Nivel de confianza', `${CONFIDENCE_CONFIG[prev]?.label || prev} → ${CONFIDENCE_CONFIG[level]?.label || level}`, id);
}
function getConfidence(id) { return loadConfidence()[id] || 'pendiente'; }

const CONFIDENCE_CONFIG = {
  'validado':      { label: 'Validado',      color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  'provisional':   { label: 'Provisional',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  'pendiente':     { label: 'Pendiente',     color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  'sin_evidencia': { label: 'Sin evidencia', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
};

// ── HISTÓRICO RICO ───────────────────────────────────────────
const LS_HIST2 = 'okr-etde27-history2';
function loadHistory2() { return safeLoad(LS_HIST2, []); }
function addRichHistoryEntry(id, entry = {}) {
  const all = loadHistory2();
  all.push({
    id,
    v: entry.v,
    fecha: entry.fecha || todayISO(),
    cargadoEn: entry.cargadoEn || new Date().toISOString(),
    usuario: entry.usuario || currentUser(),
    comentario: entry.comentario || '',
    confianza: entry.confianza || getConfidence(id),
    origen: entry.origen || 'manual'
  });
  if (all.length > 3000) all.splice(0, all.length - 3000);
  safeSave(LS_HIST2, all);
}
function getHistory2(id) {
  return loadHistory2()
    .filter(h => h.id === id)
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.cargadoEn || '').localeCompare(a.cargadoEn || ''));
}

// ── RITMO NECESARIO Y VIABILIDAD ─────────────────────────────
const VIABILITY_CONFIG = {
  alineado:              { label: 'Alineado',               color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  requiere_aceleracion:  { label: 'Requiere aceleración',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  riesgo_incumplimiento: { label: 'Riesgo de incumplimiento', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  sin_datos:             { label: 'Sin datos de ritmo',     color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
};

function calcRhythm(ind) {
  if (ind.bin) return null;
  const a = +ind.actual.v, o = +ind.obj;
  if (isNaN(a) || isNaN(o)) return null;
  const p = calcProg(ind);
  if (p >= 100) return { cumplido: true };

  const MS_MES = 1000 * 60 * 60 * 24 * 30.5;
  const end = parseDate(loadConfig().fechaFinEstrategia) || new Date(2027, 11, 31);
  const mesesRestantes = Math.max(1, (end - todayDate()) / MS_MES);
  const trimestresRestantes = mesesRestantes / 3;
  // Todos los indicadores de la ETDE27 avanzan "hacia arriba" (también los invertidos,
  // que miden un % de reducción): la brecha es siempre objetivo − actual.
  const brechaRestante = o - a;
  const ritmoNecesarioTrimestre = brechaRestante / trimestresRestantes;

  // Ritmo real: 1) histórico rico si hay ≥2 registros; 2) si no, base → actual
  let ritmoRealTrimestre = null, fuenteRitmo = null;
  const hist = getHistory2(ind.id).filter(h => h.fecha && !isNaN(parseFloat(h.v)));
  if (hist.length >= 2) {
    const h1 = hist[0], h2 = hist[hist.length - 1];
    const meses = (parseDate(h1.fecha) - parseDate(h2.fecha)) / MS_MES;
    if (meses >= 0.5) {
      ritmoRealTrimestre = ((parseFloat(h1.v) - parseFloat(h2.v)) / meses) * 3;
      fuenteRitmo = 'historico';
    }
  }
  if (ritmoRealTrimestre === null && ind.base.v !== null && ind.base.v !== undefined && ind.actual.fecha) {
    const baseDate = new Date(ind.base.año || 2023, 11, 31); // base anual: se toma cierre del año
    const meses = (parseDate(ind.actual.fecha) - baseDate) / MS_MES;
    if (meses >= 1) {
      ritmoRealTrimestre = ((a - ind.base.v) / meses) * 3;
      fuenteRitmo = 'base';
    }
  }

  let viabilidad = 'sin_datos';
  if (ritmoRealTrimestre !== null) {
    if (ritmoRealTrimestre >= ritmoNecesarioTrimestre) viabilidad = 'alineado';
    else if (ritmoRealTrimestre >= ritmoNecesarioTrimestre * 0.6) viabilidad = 'requiere_aceleracion';
    else viabilidad = 'riesgo_incumplimiento';
  }
  const proyeccion = ritmoRealTrimestre !== null ? a + ritmoRealTrimestre * trimestresRestantes : null;

  return {
    cumplido: false,
    brechaRestante,
    unidad: ind.unidad,
    mesesRestantes: Math.round(mesesRestantes),
    trimestresRestantes: Math.round(trimestresRestantes * 10) / 10,
    ritmoNecesarioTrimestre,
    ritmoRealTrimestre,
    fuenteRitmo,
    proyeccion,
    viabilidad
  };
}

// ── CALENDARIO DE ACTUALIZACIONES ────────────────────────────
const PER_DAYS = { 'Mensual': 30, 'Trimestral': 90, 'Semestral': 180, 'Anual': 365 };
const UPDATE_STATUS_CONFIG = {
  vencido:   { label: 'Vencido',          color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  proximo:   { label: 'Próximo a vencer', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  al_dia:    { label: 'Al día',           color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  sin_fecha: { label: 'Sin fecha',        color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
};

// Indicadores sin periodicidad definida (p.ej. 'n/a') no generan vencimiento
function nextUpdateDate(ind) {
  if (!ind.actual.fecha) return null;
  const days = PER_DAYS[ind.per];
  if (!days) return null;
  return addDaysISO(ind.actual.fecha, days);
}
function daysToNextUpdate(ind) {
  const next = nextUpdateDate(ind);
  if (!next) return null;
  return Math.round((parseDate(next) - todayDate()) / 86400000);
}
function updateStatus(ind) {
  const diffDays = daysToNextUpdate(ind);
  if (diffDays === null) return 'sin_fecha';
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 30) return 'proximo';
  return 'al_dia';
}

// ── TAREAS ───────────────────────────────────────────────────
const LS_TASKS = 'okr-etde27-tasks';
const TASK_STATES = {
  pendiente:  { label: 'Pendiente',  color: '#6B7280' },
  en_curso:   { label: 'En curso',   color: '#2563EB' },
  bloqueada:  { label: 'Bloqueada',  color: '#DC2626' },
  completada: { label: 'Completada', color: '#059669' }
};
const PRIORITY_CONFIG = {
  alta:  { label: 'Alta',  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  media: { label: 'Media', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  baja:  { label: 'Baja',  color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }
};
function loadTasks() { const t = safeLoad(LS_TASKS, []); return Array.isArray(t) ? t : []; }
function saveTasks(arr) { return safeSave(LS_TASKS, arr); }
function addTask(t) {
  const arr = loadTasks();
  const task = {
    id: uuid(), titulo: '', indicadorId: null, responsable: '', fechaLimite: '',
    prioridad: 'media', estado: 'pendiente', comentarios: '',
    ...t, creadaEn: new Date().toISOString()
  };
  arr.push(task);
  saveTasks(arr);
  logAudit('Tarea creada', task.titulo, task.indicadorId);
  return task;
}
function updateTaskStatus(id, estado) {
  const arr = loadTasks();
  const t = arr.find(x => x.id === id);
  if (!t) return;
  const prev = t.estado;
  t.estado = estado;
  if (estado === 'completada') t.completadaEn = new Date().toISOString();
  saveTasks(arr);
  logAudit('Tarea: cambio de estado', `${t.titulo}: ${TASK_STATES[prev]?.label || prev} → ${TASK_STATES[estado]?.label || estado}`, t.indicadorId);
}
function deleteTask(id) {
  const arr = loadTasks();
  const t = arr.find(x => x.id === id);
  saveTasks(arr.filter(x => x.id !== id));
  if (t) logAudit('Tarea eliminada', t.titulo, t.indicadorId);
}
// Tareas abiertas que vencen en ≤ n días (incluye vencidas)
function tasksDueSoon(n = 7) {
  const today = todayDate();
  return loadTasks()
    .filter(t => t.estado !== 'completada' && t.fechaLimite)
    .map(t => ({ ...t, _dias: Math.round((parseDate(t.fechaLimite) - today) / 86400000) }))
    .filter(t => t._dias <= n)
    .sort((a, b) => a._dias - b._dias);
}

// ── DECISIONES REQUERIDAS ────────────────────────────────────
const LS_DECISIONS = 'okr-etde27-decisions';
const DECISION_STATES = {
  abierta:    { label: 'Abierta',    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  en_proceso: { label: 'En proceso', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  resuelta:   { label: 'Resuelta',   color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }
};
function loadDecisions() { const d = safeLoad(LS_DECISIONS, []); return Array.isArray(d) ? d : []; }
function saveDecisions(arr) { return safeSave(LS_DECISIONS, arr); }
function addDecision(d) {
  const arr = loadDecisions();
  const dec = {
    id: uuid(), problema: '', decision: '', responsable: '', fecha: '', contexto: '',
    estado: 'abierta', indicadorId: null,
    ...d, creadaEn: new Date().toISOString()
  };
  arr.push(dec);
  saveDecisions(arr);
  logAudit('Decisión registrada', dec.problema, dec.indicadorId);
  return dec;
}
function updateDecisionStatus(id, estado) {
  const arr = loadDecisions();
  const d = arr.find(x => x.id === id);
  if (!d) return;
  const prev = d.estado;
  d.estado = estado;
  if (estado === 'resuelta') d.resueltaEn = new Date().toISOString();
  saveDecisions(arr);
  logAudit('Decisión: cambio de estado', `${d.problema}: ${DECISION_STATES[prev]?.label || prev} → ${DECISION_STATES[estado]?.label || estado}`, d.indicadorId);
}
function deleteDecision(id) {
  const arr = loadDecisions();
  const d = arr.find(x => x.id === id);
  saveDecisions(arr.filter(x => x.id !== id));
  if (d) logAudit('Decisión eliminada', d.problema, d.indicadorId);
}

// ── SNAPSHOTS ────────────────────────────────────────────────
const LS_SNAPSHOTS = 'okr-etde27-snapshots';
function loadSnapshots() { const s = safeLoad(LS_SNAPSHOTS, []); return Array.isArray(s) ? s : []; }
function saveSnapshots(arr) { return safeSave(LS_SNAPSHOTS, arr); }
function stateDataFrom(list) {
  return list.map(i => ({ id: i.id, v: i.actual.v, fecha: i.actual.fecha, prog: calcProg(i), status: getStatus(i) }));
}
function currentStateData()  { return stateDataFrom(DATA); }
function originalStateData() { return stateDataFrom(INDICADORES_ORIGINAL); }
function createSnapshot(nombre, nota, esComite) {
  const arr = loadSnapshots();
  const snap = {
    id: uuid(),
    nombre: nombre || ('Snapshot ' + fmtDate(todayISO())),
    fecha: new Date().toISOString(),
    nota: nota || '',
    esComite: !!esComite,
    data: currentStateData()
  };
  arr.push(snap);
  if (!saveSnapshots(arr)) return null;
  if (snap.esComite) {
    const cfg = loadConfig();
    cfg.fechaUltimoComite = todayISO();
    saveConfig(cfg);
  }
  logAudit('Snapshot creado', snap.nombre + (snap.esComite ? ' (comité)' : ''));
  return snap;
}
function deleteSnapshot(id) {
  const arr = loadSnapshots();
  const s = arr.find(x => x.id === id);
  saveSnapshots(arr.filter(x => x.id !== id));
  if (s) logAudit('Snapshot eliminado', s.nombre);
}
function sortedSnapshots() {
  return loadSnapshots().slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}
// Último snapshot marcado como comité; si no hay, el más reciente
function getLastComiteSnapshot() {
  const s = sortedSnapshots();
  return s.find(x => x.esComite) || s[0] || null;
}
function snapshotStats(snap) {
  const d = snap.data || [];
  const counts = { achieved: 0, on_track: 0, at_risk: 0, critical: 0 };
  d.forEach(x => { if (counts[x.status] !== undefined) counts[x.status]++; });
  const avgP = d.length ? d.reduce((s, x) => s + Math.min(x.prog || 0, 100), 0) / d.length : 0;
  return { counts, avgP, total: d.length };
}

// Compara dos estados (arrays {id,v,fecha,prog,status})
function compareStates(dataA, dataB) {
  const mapA = Object.fromEntries((dataA || []).map(x => [x.id, x]));
  const mapB = Object.fromEntries((dataB || []).map(x => [x.id, x]));
  const STO = { critical: 0, at_risk: 1, on_track: 2, achieved: 3 };
  return DATA.map(ind => {
    const a = mapA[ind.id] || null, b = mapB[ind.id] || null;
    const changed = !!(a && b && (String(a.v) !== String(b.v) || a.fecha !== b.fecha));
    const dProg = a && b ? Math.min(b.prog, 100) - Math.min(a.prog, 100) : 0;
    const dRaw  = a && b ? b.prog - a.prog : 0;
    const deltaV = a && b && !ind.bin && !isNaN(parseFloat(a.v)) && !isNaN(parseFloat(b.v)) ? parseFloat(b.v) - parseFloat(a.v) : null;
    const mejora  = !!(a && b) && (dRaw > 0.05 || (ind.bin && String(a.v) !== String(b.v) && String(b.v) === String(ind.obj)));
    const empeora = !!(a && b) && (dRaw < -0.05 || (ind.bin && String(a.v) !== String(b.v) && String(a.v) === String(ind.obj)));
    const cambiaEstado = !!(a && b && a.status !== b.status);
    const alcanza = !!(a && b && a.status !== 'achieved' && b.status === 'achieved');
    const dirEstado = cambiaEstado ? Math.sign(STO[b.status] - STO[a.status]) : 0;
    return { ind, a, b, changed, deltaV, dProg, mejora, empeora, cambiaEstado, alcanza, dirEstado };
  });
}

// ── COMENTARIOS ──────────────────────────────────────────────
const LS_COMMENTS = 'okr-etde27-comments';
function loadComments() { const c = safeLoad(LS_COMMENTS, []); return Array.isArray(c) ? c : []; }
function getComments(indId) {
  return loadComments().filter(c => c.indId === indId).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}
function addComment(indId, texto) {
  const arr = loadComments();
  arr.push({ id: uuid(), indId, texto, fecha: new Date().toISOString(), usuario: currentUser() });
  safeSave(LS_COMMENTS, arr);
  logAudit('Comentario añadido', texto.substring(0, 80), indId);
}
function deleteComment(id) {
  const arr = loadComments();
  const c = arr.find(x => x.id === id);
  safeSave(LS_COMMENTS, arr.filter(x => x.id !== id));
  if (c) logAudit('Comentario eliminado', c.texto.substring(0, 80), c.indId);
}

// ── EVIDENCIAS ───────────────────────────────────────────────
const LS_EVIDENCES = 'okr-etde27-evidences';
function loadEvidences() { const e = safeLoad(LS_EVIDENCES, []); return Array.isArray(e) ? e : []; }
function getEvidences(indId) {
  return loadEvidences().filter(e => e.indId === indId).sort((a, b) => (b.creadaEn || '').localeCompare(a.creadaEn || ''));
}
function addEvidence(indId, ev) {
  const arr = loadEvidences();
  const item = { id: uuid(), indId, fuente: '', nombre: '', url: '', referencia: '', nota: '', ...ev, creadaEn: new Date().toISOString(), usuario: currentUser() };
  arr.push(item);
  safeSave(LS_EVIDENCES, arr);
  logAudit('Evidencia añadida', item.nombre || item.fuente, indId);
}
function deleteEvidence(id) {
  const arr = loadEvidences();
  const e = arr.find(x => x.id === id);
  safeSave(LS_EVIDENCES, arr.filter(x => x.id !== id));
  if (e) logAudit('Evidencia eliminada', e.nombre || e.fuente, e.indId);
}
// Solo se enlazan URLs http(s)
function safeUrl(u) {
  const s = String(u || '').trim();
  return /^https?:\/\//i.test(s) ? s : '';
}

// ── FILTROS GUARDADOS ────────────────────────────────────────
const LS_SAVEDFILTERS = 'okr-etde27-savedfilters';
function loadSavedFilters() { const f = safeLoad(LS_SAVEDFILTERS, []); return Array.isArray(f) ? f : []; }
function saveSavedFilters(arr) { return safeSave(LS_SAVEDFILTERS, arr); }

// ── INDICADORES DESTACADOS ───────────────────────────────────
const LS_HIGHLIGHTS = 'okr-etde27-highlights';
function loadHighlights() { const h = safeLoad(LS_HIGHLIGHTS, []); return Array.isArray(h) ? h : []; }
function saveHighlights(arr) { return safeSave(LS_HIGHLIGHTS, arr); }

// ── COPIA DE SEGURIDAD COMPLETA ──────────────────────────────
const LS_ALL_KEYS = [
  LS_KEY, LS_HIST, LS_HIST2, LS_SNAPSHOTS, LS_TASKS, LS_DECISIONS, LS_COMMENTS,
  LS_EVIDENCES, LS_AUDIT, LS_CONFIG, LS_CONFIDENCE, LS_SAVEDFILTERS, LS_HIGHLIGHTS
];
function exportBackup() {
  const out = { source: 'OKR ETDE27', tipo: 'backup-completo', version: OKR_META.version, exportedAt: new Date().toISOString(), data: {} };
  LS_ALL_KEYS.forEach(k => {
    const raw = localStorage.getItem(k);
    if (raw !== null) { try { out.data[k] = JSON.parse(raw); } catch { /* clave corrupta: se omite */ } }
  });
  downloadFile('okr-etde27-backup-' + todayISO() + '.json', JSON.stringify(out, null, 2), 'application/json');
  logAudit('Copia de seguridad exportada', Object.keys(out.data).length + ' claves');
}
function importBackup(jsonStr) {
  try {
    const obj = JSON.parse(jsonStr);
    if (!obj || obj.tipo !== 'backup-completo' || typeof obj.data !== 'object') {
      toast('El archivo no es una copia de seguridad completa de esta herramienta', 'error');
      return false;
    }
    let n = 0;
    Object.entries(obj.data).forEach(([k, v]) => {
      if (LS_ALL_KEYS.includes(k)) { localStorage.setItem(k, JSON.stringify(v)); n++; }
    });
    _cfgCache = null; _thrCache = null;
    refreshData();
    logAudit('Copia de seguridad restaurada', n + ' claves');
    toast('Copia de seguridad restaurada (' + n + ' bloques de datos)', 'success');
    return true;
  } catch {
    toast('Error al leer la copia de seguridad', 'error');
    return false;
  }
}

// ════════════════════════════════════════════════════════════════
// SINCRONIZACIÓN GITHUB
// Configurar estos valores tras crear el repositorio
// ════════════════════════════════════════════════════════════════
const GH = {
  owner:    'juntaexes-agoraex',
  repo:     'etde27-okr',
  branch:   'main',
  dataPath: 'data/actualizaciones.json',
  pin:      'ETDE2027',
  _pat:     '',          // No se guarda en código — se lee de localStorage tras login
};

// Estado de la sincronización
let ghStatus = 'init'; // 'init' | 'synced' | 'offline' | 'error' | 'syncing' | 'disabled'
let ghEditorMode = false;

const LS_PAT = 'okr-etde27-pat';
function ghGetPat()    { return GH._pat || localStorage.getItem(LS_PAT) || ''; }
function ghSavePat(p)  { localStorage.setItem(LS_PAT, p); GH._pat = p; }
function ghClearPat()  { localStorage.removeItem(LS_PAT); GH._pat = ''; }
function ghConfigured(){ return !!(GH.owner && GH.repo && ghGetPat()); }

function ghRawUrl() {
  return `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/${GH.dataPath}`;
}

// Cargar datos remotos al iniciar — fusiona con localStorage (remoto gana en caso de conflicto por fecha)
async function ghLoad() {
  if (!GH.owner || !GH.repo) { ghStatus = 'disabled'; ghUpdateBadge(); return; }
  ghStatus = 'syncing'; ghUpdateBadge();
  try {
    const r = await fetch(ghRawUrl() + '?t=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const remote = await r.json();
    // Fusión: para cada indicador, gana el más reciente por _at
    const local = loadUpdates();
    const merged = { ...local };
    Object.entries(remote).forEach(([id, ru]) => {
      const lu = local[id];
      if (!lu || !lu._at || (ru._at && ru._at > lu._at)) merged[id] = ru;
    });
    localStorage.setItem(LS_KEY, JSON.stringify(merged));
    _cfgCache = null; refreshData();
    ghStatus = 'synced';
  } catch (e) {
    console.warn('GitHub load:', e.message);
    ghStatus = 'offline';
  }
  ghUpdateBadge();
}

// Publicar actualizaciones en GitHub tras cada guardado
async function ghPush() {
  if (!ghConfigured() || !ghEditorMode) return;
  ghStatus = 'syncing'; ghUpdateBadge();
  try {
    const updates = loadUpdates();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(updates, null, 2))));
    const headers = {
      'Authorization': 'token ' + ghGetPat(),
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
    // Obtener SHA actual del archivo
    let sha = null;
    try {
      const getR = await fetch(
        `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.dataPath}`,
        { headers }
      );
      if (getR.ok) sha = (await getR.json()).sha;
    } catch { /* archivo nuevo */ }
    // Escribir
    const cfg = loadConfig();
    const body = {
      message: `Actualización ${todayISO()} · ${cfg.usuarioActual || 'Editor'}`,
      content, branch: GH.branch
    };
    if (sha) body.sha = sha;
    const putR = await fetch(
      `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.dataPath}`,
      { method: 'PUT', headers, body: JSON.stringify(body) }
    );
    if (!putR.ok) throw new Error('PUT ' + putR.status);
    ghStatus = 'synced';
    logAudit('Sincronización GitHub', 'Cambios publicados en el repositorio');
  } catch (e) {
    console.error('GitHub push:', e.message);
    ghStatus = 'error';
    toast('No se pudo sincronizar con GitHub. Los cambios están guardados localmente.', 'error');
  }
  ghUpdateBadge();
}

function ghCheckPin(pin) {
  if (pin === GH.pin) {
    ghEditorMode = true;
    ghUpdateBadge();
    return true;
  }
  return false;
}

function ghLock() {
  ghEditorMode = false;
  ghUpdateBadge();
}

function ghUpdateBadge() {
  const el = document.getElementById('gh-sync-badge');
  if (!el) return;
  if (ghStatus === 'disabled' || !GH.owner) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'flex';
  const configs = {
    init:     { icon: '⏳', label: 'Iniciando…',      cls: 'sync-loading' },
    syncing:  { icon: '⏳', label: 'Sincronizando…',  cls: 'sync-loading' },
    synced:   { icon: '🟢', label: 'Sincronizado',    cls: 'sync-ok'      },
    offline:  { icon: '⚫', label: 'Sin conexión',    cls: 'sync-off'     },
    error:    { icon: '🔴', label: 'Error de sync',   cls: 'sync-error'   },
    disabled: { icon: '',   label: '',                cls: ''              },
  };
  const c = configs[ghStatus] || configs.offline;
  el.className = 'gh-sync-badge ' + c.cls;
  el.innerHTML = `<span>${c.icon}</span><span>${c.label}</span>` +
    (ghEditorMode
      ? `<span class="sync-editor-tag">✎ Editor</span><button class="sync-login-btn" onclick="ghLock()" style="margin-left:.3rem">🔒</button>`
      : `<button class="sync-login-btn" onclick="openPinModal()">🔑 Editar</button>`);
}
