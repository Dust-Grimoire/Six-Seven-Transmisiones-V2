import * as agendaService from '../services/agenda.service.js';
import { contextoDe } from '../utils/auditoria.js';

export const resumenTarifario = async (req, res) => {
  res.json(await agendaService.calcularResumen(req.body));
};

export const crearCotizacion = async (req, res) => {
  res.status(201).json(await agendaService.registrarCotizacion(req.body, req.usuario.id));
};

export const calendario = async (req, res) => {
  res.json(await agendaService.listarCalendario(req.filtros));
};

export const ficha = async (req, res) => {
  res.json(await agendaService.obtenerFicha(req.params.id));
};

export const registrarGarantia = async (req, res) => {
  res.status(201).json(await agendaService.registrarGarantia(req.params.id, req.body, contextoDe(req)));
};

export const autorizar = async (req, res) => {
  res.json(await agendaService.autorizar(req.params.id, req.usuario.id));
};

export const cerrar = async (req, res) => {
  res.json(await agendaService.cerrar(req.params.id, req.body));
};