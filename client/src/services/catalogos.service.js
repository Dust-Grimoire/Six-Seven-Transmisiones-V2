import { apiFetch, conFiltros } from './api.js';

export const listarFunciones = () => apiFetch('/catalogos/funciones');

export const listarClientes = () => apiFetch('/catalogos/clientes');

export const buscarTransmisiones = (filtros) => apiFetch(conFiltros('/catalogos/transmisiones', filtros));

export const buscarColaboradores = (filtros) => apiFetch(conFiltros('/catalogos/colaboradores', filtros));