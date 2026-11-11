import prisma from '../utils/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { evaluarCandidato, sumaPorcentajes, coberturaDeFunciones } from '../utils/personal.reglas.js';

export const listarColaboradores = async ({ incluirInactivos }) => {
  const where = incluirInactivos ? {} : { activo: true };
  return prisma.colaborador.findMany({
    where,
    include: {
      funciones: { include: { funcion: true } },
    },
    orderBy: { nombre: 'asc' },
  });
};

export const registrarColaborador = async ({ rut, correo, funcionIds, ...data }) => {
  const existenteRut = await prisma.colaborador.findUnique({ where: { rut } });
  if (existenteRut) throw new BadRequestError('Ya existe un colaborador registrado con este RUT');

  if (correo) {
    const existenteCorreo = await prisma.colaborador.findUnique({ where: { correo } });
    if (existenteCorreo) throw new BadRequestError('El correo electrónico ya está registrado');
  }

  return prisma.colaborador.create({
    data: {
      rut,
      correo,
      ...data,
      funciones: {
        create: funcionIds.map((funcionId) => ({ funcionId })),
      },
    },
    include: { funciones: { include: { funcion: true } } },
  });
};

export const actualizarColaborador = async (id, { correo, activo, funcionIds }) => {
  const colaborador = await prisma.colaborador.findUnique({ where: { id: Number(id) } });
  if (!colaborador) throw new NotFoundError('Colaborador no encontrado');

  if (correo && correo !== colaborador.correo) {
    const existente = await prisma.colaborador.findUnique({ where: { correo } });
    if (existente) throw new BadRequestError('El correo electrónico ya está en uso por otro colaborador');
  }

  return prisma.$transaction(async (tx) => {
    if (funcionIds) {
      await tx.colaboradorFuncion.deleteMany({ where: { colaboradorId: Number(id) } });
      await tx.colaboradorFuncion.createMany({
        data: funcionIds.map((funcionId) => ({ colaboradorId: Number(id), funcionId })),
      });
    }

    return tx.colaborador.update({
      where: { id: Number(id) },
      data: { correo, activo },
      include: { funciones: { include: { funcion: true } } },
    });
  });
};

export const listarDisponibilidad = async (id, { desde, hasta }) => {
  const colaborador = await prisma.colaborador.findUnique({ where: { id: Number(id) } });
  if (!colaborador) throw new NotFoundError('Colaborador no encontrado');

  const where = { colaboradorId: Number(id) };
  if (desde && hasta) {
    where.OR = [
      { inicio: { lte: hasta }, fin: { gte: desde } },
    ];
  }

  return prisma.disponibilidad.findMany({
    where,
    orderBy: { inicio: 'asc' },
  });
};

export const registrarDisponibilidad = async (id, { inicio, fin }) => {
  const colaborador = await prisma.colaborador.findUnique({ where: { id: Number(id) } });
  if (!colaborador) throw new NotFoundError('Colaborador no encontrado');

  if (new Date(fin) <= new Date(inicio)) {
    throw new BadRequestError('La fecha de término debe ser posterior a la de inicio');
  }

  return prisma.disponibilidad.create({
    data: {
      colaboradorId: Number(id),
      inicio: new Date(inicio),
      fin: new Date(fin),
    },
  });
};

export const eliminarDisponibilidad = async (id) => {
  const disponibilidad = await prisma.disponibilidad.findUnique({ where: { id: Number(id) } });
  if (!disponibilidad) throw new NotFoundError('Bloque de disponibilidad no encontrado');

  await prisma.disponibilidad.delete({ where: { id: Number(id) } });
};

export const listarProximasTransmisiones = async () => {
  const ahora = new Date();
  const transmisiones = await prisma.transmision.findMany({
    where: { inicio: { gte: ahora }, estado: 'PROGRAMADA' },
    include: {
      requerimientos: { include: { funcion: true } },
      asignaciones: true,
    },
    orderBy: { inicio: 'asc' },
  });

  return transmisiones.map((t) => ({
    ...t,
    cobertura: coberturaDeFunciones(t.requerimientos, t.asignaciones),
  }));
};

export const obtenerNomina = async (transmisionId) => {
  const transmision = await prisma.transmision.findUnique({
    where: { id: Number(transmisionId) },
    include: {
      requerimientos: { include: { funcion: true } },
      asignaciones: {
        include: {
          colaborador: true,
          funcion: true,
        },
      },
    },
  });

  if (!transmision) throw new NotFoundError('Transmisión no encontrada');

  const comisiones = await prisma.comisionTransmision.findMany({
    where: { transmisionId: Number(transmisionId) },
  });

  const totalComisiones = sumaPorcentajes(comisiones);

  return {
    transmision,
    asignaciones: transmision.asignaciones,
    cobertura: coberturaDeFunciones(transmision.requerimientos, transmision.asignaciones),
    comisiones,
    totalComisiones,
  };
};

export const listarCandidatos = async (transmisionId, funcionId) => {
  const transmision = await prisma.transmision.findUnique({
    where: { id: Number(transmisionId) },
  });
  if (!transmision) throw new NotFoundError('Transmisión no encontrada');

  const colaboradores = await prisma.colaborador.findMany({
    where: {
      activo: true,
      funciones: { some: { funcionId: Number(funcionId) } },
    },
    include: {
      disponibilidad: true,
      asignaciones: {
        include: { transmision: true },
        where: { estado: { not: 'RECHAZADA' } },
      },
    },
  });

  const configuracion = await prisma.configuracionSistema.findFirst();
  const minutosTraslado = configuracion?.minutosTraslado ?? 90;

  return colaboradores.map((colaborador) => {
    const bloques = colaborador.disponibilidad.map((d) => ({ inicio: d.inicio, fin: d.fin }));
    const otrasAsignaciones = colaborador.asignaciones.map((a) => ({
      nombreEvento: a.transmision.nombre,
      inicio: a.transmision.inicio,
      fin: a.transmision.fin,
      comuna: a.transmision.comuna,
    }));

    const evaluacion = evaluarCandidato({
      transmision: { inicio: transmision.inicio, fin: transmision.fin, comuna: transmision.comuna },
      bloques,
      otrasAsignaciones,
      minutosTraslado,
    });

    return {
      colaborador,
      ...evaluacion,
    };
  });
};

export const asignarColaborador = async (transmisionId, { colaboradorId, funcionId }) => {
  const transmision = await prisma.transmision.findUnique({ where: { id: Number(transmisionId) } });
  if (!transmision) throw new NotFoundError('Transmisión no encontrada');

  const colaborador = await prisma.colaborador.findUnique({ where: { id: Number(colaboradorId) } });
  if (!colaborador) throw new NotFoundError('Colaborador no encontrado');

  const existente = await prisma.asignacion.findFirst({
    where: { transmisionId: Number(transmisionId), colaboradorId: Number(colaboradorId) },
  });
  if (existente) throw new BadRequestError('El colaborador ya se encuentra asignado a esta transmisión');

  return prisma.asignacion.create({
    data: {
      transmisionId: Number(transmisionId),
      colaboradorId: Number(colaboradorId),
      funcionId: Number(funcionId),
      estado: 'POR_CONFIRMAR',
    },
    include: { colaborador: true, funcion: true },
  });
};

export const responderAsignacion = async (asignacionId, { estado }) => {
  const asignacion = await prisma.asignacion.findUnique({ where: { id: Number(asignacionId) } });
  if (!asignacion) throw new NotFoundError('Asignación no encontrada');

  return prisma.asignacion.update({
    where: { id: Number(asignacionId) },
    data: { estado },
    include: { colaborador: true, funcion: true },
  });
};

export const ajustarPorcentaje = async (asignacionId, { porcentajeComision }) => {
  const asignacion = await prisma.asignacion.findUnique({ where: { id: Number(asignacionId) } });
  if (!asignacion) throw new NotFoundError('Asignación no encontrada');

  return prisma.asignacion.update({
    where: { id: Number(asignacionId) },
    data: { porcentajeComision },
  });
};

export const definirComision = async (transmisionId, { colaboradorId, porcentajeComision }) => {
  const transmision = await prisma.transmision.findUnique({ where: { id: Number(transmisionId) } });
  if (!transmision) throw new NotFoundError('Transmisión no encontrada');

  const comisionesActuales = await prisma.comisionTransmision.findMany({
    where: { transmisionId: Number(transmisionId), NOT: { colaboradorId: Number(colaboradorId) } },
  });

  const totalActual = sumaPorcentajes(comisionesActuales);
  if (totalActual + porcentajeComision > 100) {
    throw new BadRequestError('La suma total de porcentajes de comisión no puede superar el 100%');
  }

  return prisma.comisionTransmision.upsert({
    where: {
      transmisionId_colaboradorId: {
        transmisionId: Number(transmisionId),
        colaboradorId: Number(colaboradorId),
      },
    },
    update: { porcentajeComision },
    create: {
      transmisionId: Number(transmisionId),
      colaboradorId: Number(colaboradorId),
      porcentajeComision,
    },
  });
};