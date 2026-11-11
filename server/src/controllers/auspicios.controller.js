import * as auspiciosService from '../services/auspicios.service.js';

export const listarAuspiciadores = async (req, res) => {
  res.json(await auspiciosService.listarAuspiciadores());
};

export const registrarAuspiciador = async (req, res) => {
  res.status(201).json(await auspiciosService.registrarAuspiciador(req.body));
};

export const historial = async (req, res) => {
  res.json(await auspiciosService.obtenerHistorial(req.params.id));
};

export const listarAcuerdos = async (req, res) => {
  res.json(await auspiciosService.listarAcuerdos(req.filtros));
};

export const registrarAcuerdo = async (req, res) => {
  res.status(201).json(await auspiciosService.registrarAcuerdo(req.body, req.usuario.id));
};

export const registrarCumplimiento = async (req, res) => {
  res.json(await auspiciosService.registrarCumplimiento(req.params.id, req.body));
};

export const marcarMoroso = async (req, res) => {
  res.json(await auspiciosService.marcarMoroso(req.params.id, req.body, req.usuario.id));
};

export const regularizar = async (req, res) => {
  res.json(await auspiciosService.regularizar(req.params.id, req.body, req.usuario.id));
};