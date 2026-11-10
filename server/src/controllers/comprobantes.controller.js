import * as comprobantesService from '../services/comprobantes.service.js';

export const subir = async (req, res) => {
  const comprobante = await comprobantesService.registrarComprobante(req.file, req.usuario.id);
  res.status(201).json(comprobante);
};

export const descargar = async (req, res) => {
  const comprobante = await comprobantesService.obtenerArchivo(req.params.id);
  res.type(comprobante.tipoMime);
  res.sendFile(comprobante.ruta, { headers: { 'Content-Disposition': `inline; filename="${encodeURIComponent(comprobante.nombreOriginal)}"` } });
};