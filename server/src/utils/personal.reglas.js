import { seCruzan } from './fechas.js';

export const normalizarRut = (rut) => rut.replace(/\./g, '').trim().toUpperCase();

export const rutValido = (rut) => {
  const limpio = normalizarRut(rut);
  if (!/^\d{7,8}-[\dK]$/.test(limpio)) return false;
  const [cuerpo, digito] = limpio.split('-');
  let suma = 0;
  let factor = 2;
  for (const numero of [...cuerpo].reverse()) {
    suma += Number(numero) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return digito === esperado;
};

export const estaDisponible = (bloques, inicio, fin) =>
  bloques.some((bloque) => bloque.inicio <= inicio && bloque.fin >= fin);

export const evaluarCandidato = ({ transmision, bloques, otrasAsignaciones, minutosTraslado }) => {
  if (!estaDisponible(bloques, transmision.inicio, transmision.fin)) {
    return { apto: false, motivo: 'No registra disponibilidad para el horario de la transmisión' };
  }
  for (const otra of otrasAsignaciones) {
    if (seCruzan(transmision.inicio, transmision.fin, otra.inicio, otra.fin)) {
      return { apto: false, motivo: `Choque de horario con ${otra.nombreEvento}` };
    }
    if (otra.comuna !== transmision.comuna) {
      const margen = minutosTraslado * 60000;
      const desde = new Date(transmision.inicio.getTime() - margen);
      const hasta = new Date(transmision.fin.getTime() + margen);
      if (seCruzan(desde, hasta, otra.inicio, otra.fin)) {
        return { apto: false, motivo: `Tiempo de traslado insuficiente desde ${otra.nombreEvento} (${otra.comuna})` };
      }
    }
  }
  return { apto: true, motivo: null };
};

export const sumaPorcentajes = (asignaciones) =>
  asignaciones.reduce((total, asignacion) => total + asignacion.porcentajeComision, 0);

export const coberturaDeFunciones = (requerimientos, asignaciones) =>
  requerimientos.map((requerimiento) => {
    const cubiertos = asignaciones.filter((a) => a.funcionId === requerimiento.funcionId);
    return {
      funcionId: requerimiento.funcionId,
      nombre: requerimiento.funcion.nombre,
      requeridos: requerimiento.cantidad,
      confirmados: cubiertos.filter((a) => a.estado === 'CONFIRMADA').length,
      porConfirmar: cubiertos.filter((a) => a.estado === 'POR_CONFIRMAR').length,
      sinCubrir: Math.max(requerimiento.cantidad - cubiertos.length, 0),
    };
  });