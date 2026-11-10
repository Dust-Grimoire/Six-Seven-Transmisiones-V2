import prisma from '../config/prisma.js';

export const listarFunciones = () => prisma.funcion.findMany({ orderBy: { id: 'asc' } });

export const listarClientes = () => prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });

export const buscarTransmisiones = ({ texto, estado, desde, hasta }) =>
  prisma.transmision.findMany({
    where: {
      estado,
      inicio: { gte: desde, lt: hasta },
      nombreEvento: texto ? { contains: texto, mode: 'insensitive' } : undefined,
    },
    select: {
      id: true,
      nombreEvento: true,
      recinto: true,
      comuna: true,
      inicio: true,
      fin: true,
      estado: true,
      valorTotal: true,
      cliente: { select: { nombre: true } },
    },
    orderBy: { inicio: 'desc' },
  });

export const buscarColaboradores = ({ texto }) =>
  prisma.colaborador.findMany({
    where: {
      activo: true,
      nombre: texto ? { contains: texto, mode: 'insensitive' } : undefined,
    },
    select: { id: true, nombre: true, rut: true, telefono: true },
    orderBy: { nombre: 'asc' },
  });