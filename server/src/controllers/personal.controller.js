import * as personalService from '../services/personal.service.js';

export const listarColaboradores = async (req, res) => {
  res.json(await personalService.listarColaboradores(req.filtros));
};

export const registrarColaborador = async (req, res) => {
  res.status(201).json(await personalService.registrarColaborador(req.body));
};

export const actualizarColaborador = async (req, res) => {
  res.json(await personalService.actualizarColaborador(req.params.id, req.body));
};

export const listarDisponibilidad = async (req, res) => {
  res.json(await personalService.listarDisponibilidad(req.params.id, req.filtros));
};

export const registrarDisponibilidad = async (req, res) => {
  res.status(201).json(await personalService.registrarDisponibilidad(req.params.id, req.body));
};

export const eliminarDisponibilidad = async (req, res) => {
  await personalService.eliminarDisponibilidad(req.params.id);
  res.status(204).end();
};

export const proximasTransmisiones = async (req, res) => {
  res.json(await personalService.listarProximasTransmisiones());
};

export const nomina = async (req, res) => {
  res.json(await personalService.obtenerNomina(req.params.id));
};

export const candidatos = async (req, res) => {
  res.json(await personalService.listarCandidatos(req.params.id, req.filtros.funcionId));
};

export const asignar = async (req, res) => {
  res.status(201).json(await personalService.asignarColaborador(req.params.id, req.body));
};

export const responder = async (req, res) => {
  res.json(await personalService.responderAsignacion(req.params.id, req.body));
};

export const ajustarPorcentaje = async (req, res) => {
  res.json(await personalService.ajustarPorcentaje(req.params.id, req.body));
};

export const definirComision = async (req, res) => {
  res.json(await personalService.definirComision(req.params.id, req.body));
};