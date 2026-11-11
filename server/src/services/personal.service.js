import prisma from '../config/prisma.js';
import { obtenerNumero } from './parametros.service.js';
import { conflicto, noEncontrado, solicitudInvalida } from '../utils/errorNegocio.js';
import { coberturaDeFunciones, evaluarCandidato, sumaPorcentajes } from '../utils/personal.reglas.js';

const ACTIVAS = { in: ['POR_CONFIRMAR', 'CONFIRMADA'] };
const conFunciones = { funciones: { include: { funcion: true } } };

const buscarColaborador = async (id) => {
  const colaborador = await prisma.colaborador.findUnique({ where: { id }, include: conFunciones });
  if (!colaborador) throw noEncontrado('El colaborador no existe');
  return colaborador;
};

const buscarTransmision = async (id) => {
  const transmision = await prisma.transmision.findUnique({
    where: { id },
    include: { requerimientos: { include: { funcion: true } } },
  });
  if (!transmision) throw noEncontrado('La transmisión no existe');
  return transmision;
};

const buscarAsignacion = async (id) => {
  const asignacion = await prisma.asignacion.findUnique({ where: { id }, include: { transmision: true } });
  if (!asignacion) throw noEncontrado('La asignación no existe');
  return asignacion;
};

export const listarColaboradores = ({ incluirInactivos }) =>
  prisma.colaborador.findMany({
    where: incluirInactivos ? undefined : { activo: true },
    include: conFunciones,
    orderBy: { nombre: 'asc' },
  });

export const registrarColaborador = async ({ funcionIds, ...datos }) => {
  const existente = await prisma.colaborador.findUnique({ where: { rut: datos.rut } });
  if (existente) throw conflicto(`El colaborador con RUT ${datos.rut} ya está registrado`);
  return prisma.colaborador.create({
    data: { ...datos, funciones: { create: funcionIds.map((funcionId) => ({ funcionId })) } },
    include: conFunciones,
  });
};

export const actualizarColaborador = async (id, { funcionIds, ...datos }) => {
  await buscarColaborador(id);
  return prisma.colaborador.update({
    where: { id },
    data: {
      ...datos,
      funciones: { deleteMany: {}, create: funcionIds.map((funcionId) => ({ funcionId })) },
    },
    include: conFunciones,
  });
};

export const listarDisponibilidad = (colaboradorId, { desde, hasta }) =>
  prisma.disponibilidad.findMany({
    where: { colaboradorId, fin: { gt: desde }, inicio: { lt: hasta } },
    orderBy: { inicio: 'asc' },
  });

export const registrarDisponibilidad = async (colaboradorId, { inicio, fin }) => {
  const colaborador = await buscarColaborador(colaboradorId);
  if (!colaborador.activo) throw conflicto('El colaborador está inactivo');
  const traslapado = await prisma.disponibilidad.findFirst({
    where: { colaboradorId, inicio: { lt: fin }, fin: { gt: inicio } },
  });
  if (traslapado) throw conflicto('El bloque se cruza con otro bloque ya registrado');
  return prisma.disponibilidad.create({ data: { colaboradorId, inicio, fin } });
};

export const eliminarDisponibilidad = async (id) => {
  await prisma.disponibilidad.delete({ where: { id } });
};

export const obtenerNomina = async (transmisionId) => {
  const transmision = await buscarTransmision(transmisionId);
  const asignaciones = await prisma.asignacion.findMany({
    where: { transmisionId },
    include: { colaborador: { select: { nombre: true, telefono: true } }, funcion: true },
    orderBy: { id: 'asc' },
  });
  const activas = asignaciones.filter((a) => a.estado !== 'RECHAZADA');
  return {
    transmision,
    asignaciones,
    cobertura: coberturaDeFunciones(transmision.requerimientos, activas),
    sumaPorcentajes: sumaPorcentajes(activas),
  };
};

const evaluar = async (transmision, colaborador, minutosTraslado) => {
  const bloques = await prisma.disponibilidad.findMany({
    where: { colaboradorId: colaborador.id, inicio: { lte: transmision.inicio }, fin: { gte: transmision.fin } },
  });
  const otras = await prisma.asignacion.findMany({
    where: { colaboradorId: colaborador.id, estado: ACTIVAS, transmision: { estado: { not: 'FINALIZADA' } } },
    include: { transmision: true },
  });
  if (otras.some((a) => a.transmisionId === transmision.id)) {
    return { apto: false, motivo: 'Ya forma parte de la nómina de esta transmisión' };
  }
  return evaluarCandidato({
    transmision,
    bloques,
    otrasAsignaciones: otras.map((a) => a.transmision),
    minutosTraslado,
  });
};

export const listarCandidatos = async (transmisionId, funcionId) => {
  const transmision = await buscarTransmision(transmisionId);
  const minutosTraslado = await obtenerNumero('MINUTOS_TRASLADO');
  const colaboradores = await prisma.colaborador.findMany({
    where: { activo: true, funciones: { some: { funcionId } } },
    select: { id: true, nombre: true, telefono: true },
    orderBy: { nombre: 'asc' },
  });
  const candidatos = [];
  for (const colaborador of colaboradores) {
    candidatos.push({ ...colaborador, ...(await evaluar(transmision, colaborador, minutosTraslado)) });
  }
  return candidatos.sort((a, b) => Number(b.apto) - Number(a.apto));
};

export const asignarColaborador = async (transmisionId, { colaboradorId, funcionId }) => {
  const transmision = await buscarTransmision(transmisionId);
  if (transmision.estado === 'FINALIZADA') throw conflicto('La transmisión ya está finalizada');
  if (transmision.inicio <= new Date()) throw conflicto('La transmisión ya comenzó');
  const colaborador = await buscarColaborador(colaboradorId);
  if (!colaborador.activo) throw conflicto('El colaborador está inactivo');
  if (!colaborador.funciones.some((f) => f.funcionId === funcionId)) {
    throw conflicto(`${colaborador.nombre} no tiene habilitada esa función`);
  }
  const nomina = await obtenerNomina(transmisionId);
  const cobertura = nomina.cobertura.find((c) => c.funcionId === funcionId);
  if (!cobertura) throw conflicto('La transmisión no requiere esa función');
  if (cobertura.sinCubrir === 0) throw conflicto(`La función ${cobertura.nombre} ya está cubierta`);
  const funcion = await prisma.funcion.findUnique({ where: { id: funcionId } });
  if (nomina.sumaPorcentajes + funcion.porcentajeComision > 100) {
    throw conflicto('La suma de comisiones de la transmisión superaría el 100 %');
  }
  const evaluacion = await evaluar(transmision, colaborador, await obtenerNumero('MINUTOS_TRASLADO'));
  if (!evaluacion.apto) throw conflicto(evaluacion.motivo);
  return prisma.asignacion.create({
    data: { transmisionId, colaboradorId, funcionId, porcentajeComision: funcion.porcentajeComision },
    include: { colaborador: { select: { nombre: true, telefono: true } }, funcion: true },
  });
};

export const responderAsignacion = async (id, { estado }) => {
  const asignacion = await buscarAsignacion(id);
  if (asignacion.estado !== 'POR_CONFIRMAR') throw conflicto('La asignación ya fue respondida');
  if (asignacion.transmision.estado === 'FINALIZADA') throw conflicto('La transmisión ya está finalizada');
  return prisma.asignacion.update({ where: { id }, data: { estado, respondidoEn: new Date() } });
};

export const ajustarPorcentaje = async (id, { porcentajeComision }) => {
  const asignacion = await buscarAsignacion(id);
  if (asignacion.estado === 'RECHAZADA') throw conflicto('La asignación fue rechazada');
  const liquidada = await prisma.lineaLiquidacion.findFirst({ where: { transmisionId: asignacion.transmisionId } });
  if (liquidada) throw conflicto('La transmisión ya fue liquidada y sus porcentajes no se pueden modificar');
  const otras = await prisma.asignacion.findMany({
    where: { transmisionId: asignacion.transmisionId, estado: ACTIVAS, id: { not: id } },
  });
  if (sumaPorcentajes(otras) + porcentajeComision > 100) {
    throw conflicto('La suma de comisiones de la transmisión superaría el 100 %');
  }
  return prisma.asignacion.update({ where: { id }, data: { porcentajeComision } });
};

export const definirComision = async (funcionId, { porcentajeComision }) =>
  prisma.funcion.update({ where: { id: funcionId }, data: { porcentajeComision } });

export const listarProximasTransmisiones = () =>
  prisma.transmision.findMany({
    where: { estado: { not: 'FINALIZADA' }, inicio: { gt: new Date() } },
    select: { id: true, nombreEvento: true, inicio: true, fin: true, estado: true, comuna: true },
    orderBy: { inicio: 'asc' },
  });