import prisma from '../config/prisma.js';

export const listarUsuariosActivos = () =>
  prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, rol: true },
    orderBy: { id: 'asc' },
  });