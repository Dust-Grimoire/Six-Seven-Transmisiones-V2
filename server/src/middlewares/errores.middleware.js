import { Prisma } from '@prisma/client';
import multer from 'multer';
import { ErrorNegocio } from '../utils/errorNegocio.js';

const MENSAJES_PRISMA = {
  P2002: [409, 'Ya existe un registro con esos datos'],
  P2003: [400, 'El registro relacionado no existe'],
  P2025: [404, 'El registro solicitado no existe'],
};

export const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ error: 'La sección solicitada no existe' });
};

export const manejarErrores = (err, req, res, next) => {
  if (err instanceof ErrorNegocio) {
    return res.status(err.estado).json({ error: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && MENSAJES_PRISMA[err.code]) {
    const [estado, mensaje] = MENSAJES_PRISMA[err.code];
    return res.status(estado).json({ error: mensaje });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'El comprobante supera los 5 MB permitidos' });
  }
  console.error(err);
  res.status(500).json({ error: 'No fue posible completar la operación. Intente nuevamente' });
};