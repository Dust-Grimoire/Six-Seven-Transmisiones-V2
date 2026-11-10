import path from 'node:path';
import prisma from '../config/prisma.js';
import { CARPETA_SUBIDAS } from '../config/subidas.js';
import { ErrorNegocio, noEncontrado } from '../utils/errorNegocio.js';

export const registrarComprobante = (archivo, usuarioId) => {
  if (!archivo) {
    throw new ErrorNegocio(400, 'Debe adjuntar el comprobante');
  }
  return prisma.comprobante.create({
    data: {
      nombreOriginal: archivo.originalname,
      nombreArchivo: archivo.filename,
      tipoMime: archivo.mimetype,
      tamanoBytes: archivo.size,
      subidoPorId: usuarioId,
    },
  });
};

export const obtenerArchivo = async (id) => {
  const comprobante = await prisma.comprobante.findUnique({ where: { id } });
  if (!comprobante) {
    throw noEncontrado('El comprobante no existe');
  }
  return { ...comprobante, ruta: path.join(CARPETA_SUBIDAS, comprobante.nombreArchivo) };
};