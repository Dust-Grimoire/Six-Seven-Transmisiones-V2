import * as sesionService from '../services/sesion.service.js';

export const listarUsuarios = async (req, res) => {
  res.json(await sesionService.listarUsuariosActivos());
};

export const usuarioActual = (req, res) => {
  res.json(req.usuario ?? null);
};