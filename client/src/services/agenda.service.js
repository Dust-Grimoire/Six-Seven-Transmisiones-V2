import { apiFetch, conFiltros } from './api.js';

export const calcularResumenTarifario = (datos) =>
  apiFetch('/agenda/resumen-tarifario', { method: 'POST', body: datos });

export const registrarCotizacion = (datos) => apiFetch('/agenda/transmisiones', { method: 'POST', body: datos });

export const listarDelMes = (mes) =>
  apiFetch(
    conFiltros('/agenda/transmisiones', {
      desde: mes.startOf('month').toISOString(),
      hasta: mes.add(1, 'month').startOf('month').toISOString(),
    }),
  );

export const obtenerFicha = (id) => apiFetch(`/agenda/transmisiones/${id}`);

export const registrarGarantia = (id, datos) =>
  apiFetch(`/agenda/transmisiones/${id}/garantia`, { method: 'POST', body: datos });

export const autorizarTransmision = (id) => apiFetch(`/agenda/transmisiones/${id}/autorizar`, { method: 'PATCH' });

export const cerrarTransmision = (id, asistencias) =>
  apiFetch(`/agenda/transmisiones/${id}/cerrar`, { method: 'PATCH', body: { asistencias } });