export const ROLES = {
  DUENO: 'Dueño',
  CONTADOR: 'Contador',
  JEFE_TECNICO: 'Jefe Técnico',
};

export const ESTADOS = {
  transmision: {
    COTIZADA: ['Cotizado', 'blue'],
    AUTORIZADA: ['Autorizado a Terreno', 'green'],
    FINALIZADA: ['Finalizada', 'default'],
  },
  asignacion: {
    POR_CONFIRMAR: ['Por Confirmar', 'gold'],
    CONFIRMADA: ['Confirmada', 'green'],
    RECHAZADA: ['Rechazada', 'red'],
  },
  equipo: {
    OPERATIVO: ['Operativo', 'green'],
    EN_REPARACION: ['En Reparación', 'gold'],
    RESERVADO: ['Reservado', 'blue'],
    EN_TERRENO: ['En Terreno', 'geekblue'],
    EN_MERMA: ['Equipo en merma', 'volcano'],
    DADO_DE_BAJA: ['Dado de Baja', 'red'],
  },
  retorno: {
    RECIBIDO: ['Recibido', 'green'],
    DANADO: ['Dañado', 'volcano'],
    PERDIDO: ['Perdido', 'red'],
  },
  reembolso: {
    APROBADO: ['Aprobado', 'green'],
    RECHAZADO: ['Rechazado', 'red'],
  },
  linea: {
    PENDIENTE: ['Pendiente', 'gold'],
    PAGADA: ['Pagado', 'green'],
  },
  acuerdo: {
    PENDIENTE: ['Pendiente', 'gold'],
    CUMPLIDO: ['Cumplido', 'green'],
    VENCIDO: ['Vencido', 'red'],
  },
  garantia: {
    NO_REQUERIDA: ['No requiere garantía', 'default'],
    PENDIENTE: ['Garantía pendiente', 'red'],
    RECIBIDA: ['Garantía recibida', 'green'],
  },
};

export const TIPOS_EVENTO = {
  DEPORTIVO: 'Deportivo',
  ACADEMICO: 'Académico',
  CULTURAL: 'Cultural',
  CORPORATIVO: 'Corporativo',
};

export const TIPOS_SERVICIO = {
  BASICO: 'Básico',
  COMPLEJO: 'Complejo',
};

export const TIPOS_EQUIPO = {
  CAMARA: 'Cámara',
  TRIPODE: 'Trípode',
  MICROFONO: 'Micrófono',
  SWITCH: 'Consola de switch',
  OTRO: 'Otro',
};

export const CAUSAS_BAJA = {
  DANO: 'Daño',
  ROBO: 'Robo',
  EXTRAVIO: 'Extravío',
};

export const TIPOS_REPUESTO = {
  CABLE: 'Cable',
  CONECTOR: 'Conector',
  ACCESORIO: 'Accesorio',
  OTRO: 'Otro',
};

export const CATEGORIAS_GASTO = {
  PEAJE: 'Peaje',
  COLACION: 'Colación',
  IMPREVISTO: 'Imprevisto',
};

export const TIPOS_APORTE = {
  MONETARIO: 'Monetario',
  CANJE: 'Canje',
};

export const opcionesDe = (mapa) => Object.entries(mapa).map(([value, label]) => ({ value, label }));