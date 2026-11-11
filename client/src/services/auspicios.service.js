import { apiFetch, conFiltros } from './api.js';

export const listarAuspiciadores = () => apiFetch('/auspicios/auspiciadores');

export const registrarAuspiciador = (datos) =>
  apiFetch('/auspicios/auspiciadores', { method: 'POST', body: datos });

export const obtenerHistorial = (id) => apiFetch(`/auspicios/auspiciadores/${id}`);

export const marcarMoroso = (id, motivo) =>
  apiFetch(`/auspicios/auspiciadores/${id}/lista-negra`, { method: 'PATCH', body: { motivo } });

export const regularizar = (id, motivo) =>
  apiFetch(`/auspicios/auspiciadores/${id}/regularizar`, { method: 'PATCH', body: { motivo } });

export const listarAcuerdos = (situacion) => apiFetch(conFiltros('/auspicios/acuerdos', { situacion }));

export const registrarAcuerdo = (datos) => apiFetch('/auspicios/acuerdos', { method: 'POST', body: datos });

export const registrarCumplimiento = (id, datos) =>
  apiFetch(`/auspicios/acuerdos/${id}/cumplimiento`, { method: 'PATCH', body: datos });