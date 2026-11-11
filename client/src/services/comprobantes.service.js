import { apiSubir, apiDescargar } from './api.js';

export const subirComprobante = (archivo) => apiSubir('/comprobantes', archivo);

export const abrirComprobante = async (id) => {
  const archivo = await apiDescargar(`/comprobantes/${id}/archivo`);
  window.open(URL.createObjectURL(archivo), '_blank');
};