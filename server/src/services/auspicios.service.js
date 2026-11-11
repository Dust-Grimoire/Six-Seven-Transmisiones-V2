import prisma from '../config/prisma.js';
import { conflicto, noEncontrado, solicitudInvalida } from '../utils/errorNegocio.js';
import { describirAcuerdo, estaVencido, fechaLocal, resumenCumplimiento } from '../utils/auspicios.reglas.js';

const datosTransmision = { select: { id: true, nombreEvento: true, inicio: true, estado: true } };

const buscarAuspiciador = async (id) => {
  const auspiciador = await prisma.auspiciador.findUnique({ where: { id }, include: { acuerdos: true } });
  if (!auspiciador) throw noEncontrado('El auspiciador no existe');
  return auspiciador;
};

export const listarAuspiciadores = async () => {
  const hoy = fechaLocal();
  const auspiciadores = await prisma.auspiciador.findMany({ include: { acuerdos: true }, orderBy: { nombre: 'asc' } });
  return auspiciadores.map(({ acuerdos, ...auspiciador }) => ({
    ...auspiciador,
    cumplimiento: resumenCumplimiento(acuerdos, hoy),
  }));
};

export const registrarAuspiciador = (datos) => prisma.auspiciador.create({ data: datos });

export const obtenerHistorial = async (id) => {
  const hoy = fechaLocal();
  const auspiciador = await prisma.auspiciador.findUnique({
    where: { id },
    include: {
      acuerdos: { include: { transmision: datosTransmision }, orderBy: { fechaComprometida: 'desc' } },
      historial: { include: { usuario: { select: { nombre: true } } }, orderBy: { fecha: 'desc' } },
    },
  });
  if (!auspiciador) throw noEncontrado('El auspiciador no existe');
  return {
    ...auspiciador,
    acuerdos: auspiciador.acuerdos.map((acuerdo) => describirAcuerdo(acuerdo, hoy)),
    cumplimiento: resumenCumplimiento(auspiciador.acuerdos, hoy),
  };
};

export const listarAcuerdos = async ({ situacion }) => {
  const hoy = fechaLocal();
  const acuerdos = await prisma.acuerdoAuspicio.findMany({
    include: {
      auspiciador: { select: { id: true, nombre: true, enListaNegra: true } },
      transmision: datosTransmision,
    },
    orderBy: { fechaComprometida: 'asc' },
  });
  return acuerdos
    .map((acuerdo) => describirAcuerdo(acuerdo, hoy))
    .filter((acuerdo) => !situacion || acuerdo.situacion === situacion);
};

export const registrarAcuerdo = async (datos, usuarioId) => {
  const auspiciador = await buscarAuspiciador(datos.auspiciadorId);
  if (auspiciador.enListaNegra) {
    throw conflicto(`${auspiciador.nombre} está En Lista Negra y no puede asociarse a nuevas transmisiones`);
  }
  const transmision = await prisma.transmision.findUnique({ where: { id: datos.transmisionId } });
  if (!transmision) throw noEncontrado('La transmisión no existe');
  if (transmision.estado === 'FINALIZADA') {
    throw conflicto('Los acuerdos se pactan durante la cotización o preparación de la transmisión');
  }
  return prisma.acuerdoAuspicio.create({
    data: {
      ...datos,
      montoComprometido: datos.tipoAporte === 'MONETARIO' ? datos.montoComprometido : null,
      registradoPorId: usuarioId,
    },
  });
};

export const registrarCumplimiento = async (id, datos) => {
  const acuerdo = await prisma.acuerdoAuspicio.findUnique({ where: { id } });
  if (!acuerdo) throw noEncontrado('El acuerdo no existe');
  if (acuerdo.estado !== 'PENDIENTE') throw conflicto('El acuerdo ya está registrado como Cumplido');
  if (acuerdo.tipoAporte === 'MONETARIO' && !datos.montoRecibido) {
    throw solicitudInvalida('Indique el monto recibido');
  }
  if (acuerdo.tipoAporte === 'CANJE' && !datos.detalleRecibido) {
    throw solicitudInvalida('Indique el detalle de lo recibido en canje');
  }
  return prisma.acuerdoAuspicio.update({
    where: { id },
    data: {
      estado: 'CUMPLIDO',
      fechaRecepcion: datos.fechaRecepcion,
      montoRecibido: acuerdo.tipoAporte === 'MONETARIO' ? datos.montoRecibido : null,
      detalleRecibido: datos.detalleRecibido,
    },
  });
};

export const marcarMoroso = async (id, { motivo }, usuarioId) => {
  const auspiciador = await buscarAuspiciador(id);
  if (auspiciador.enListaNegra) throw conflicto('El auspiciador ya está En Lista Negra');
  if (!auspiciador.acuerdos.some((acuerdo) => estaVencido(acuerdo, fechaLocal()))) {
    throw conflicto('Solo se puede marcar como moroso a un auspiciador con un acuerdo vencido sin cumplimiento');
  }
  return prisma.auspiciador.update({
    where: { id },
    data: { enListaNegra: true, historial: { create: { accion: 'MARCADO', motivo, usuarioId } } },
  });
};

export const regularizar = async (id, { motivo }, usuarioId) => {
  const auspiciador = await buscarAuspiciador(id);
  if (!auspiciador.enListaNegra) throw conflicto('El auspiciador no está En Lista Negra');
  if (auspiciador.acuerdos.some((acuerdo) => estaVencido(acuerdo, fechaLocal()))) {
    throw conflicto('Todos los acuerdos vencidos deben estar registrados como Cumplidos antes de regularizar');
  }
  return prisma.auspiciador.update({
    where: { id },
    data: { enListaNegra: false, historial: { create: { accion: 'REGULARIZADO', motivo, usuarioId } } },
  });
};