import { apiFetch, conFiltros } from './api.js';

export const listarColaboradores = (incluirInactivos) =>
  apiFetch(conFiltros('/personal/colaboradores', { incluirInactivos }));

export const registrarColaborador = (datos) => apiFetch('/personal/colaboradores', { method: 'POST', body: datos });

export const actualizarColaborador = (id, datos) =>
  apiFetch(`/personal/colaboradores/${id}`, { method: 'PUT', body: datos });

export const listarDisponibilidad = (id, desde, hasta) =>
  apiFetch(conFiltros(`/personal/colaboradores/${id}/disponibilidad`, { desde: desde.toISOString(), hasta: hasta.toISOString() }));

export const registrarDisponibilidad = (id, bloque) =>
  apiFetch(`/personal/colaboradores/${id}/disponibilidad`, { method: 'POST', body: bloque });

export const eliminarDisponibilidad = (id) => apiFetch(`/personal/disponibilidad/${id}`, { method: 'DELETE' });

export const listarProximasTransmisiones = () => apiFetch('/personal/transmisiones');

export const obtenerNomina = (transmisionId) => apiFetch(`/personal/transmisiones/${transmisionId}/nomina`);

export const listarCandidatos = (transmisionId, funcionId) =>
  apiFetch(conFiltros(`/personal/transmisiones/${transmisionId}/candidatos`, { funcionId }));

export const asignarColaborador = (transmisionId, datos) =>
  apiFetch(`/personal/transmisiones/${transmisionId}/asignaciones`, { method: 'POST', body: datos });

export const responderAsignacion = (id, estado) =>
  apiFetch(`/personal/asignaciones/${id}/respuesta`, { method: 'PATCH', body: { estado } });

export const ajustarPorcentaje = (id, porcentajeComision) =>
  apiFetch(`/personal/asignaciones/${id}/porcentaje`, { method: 'PATCH', body: { porcentajeComision } });

export const definirComision = (funcionId, porcentajeComision) =>
  apiFetch(`/personal/funciones/${funcionId}/comision`, { method: 'PATCH', body: { porcentajeComision } });