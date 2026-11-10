import * as catalogosService from '../services/catalogos.service.js';

export const funciones = async (req, res) => {
  res.json(await catalogosService.listarFunciones());
};

export const clientes = async (req, res) => {
  res.json(await catalogosService.listarClientes());
};

export const transmisiones = async (req, res) => {
  res.json(await catalogosService.buscarTransmisiones(req.filtros));
};

export const colaboradores = async (req, res) => {
  res.json(await catalogosService.buscarColaboradores(req.filtros));
};