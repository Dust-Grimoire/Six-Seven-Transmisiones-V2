import prisma from '../config/prisma.js';
import { ErrorNegocio } from '../utils/errorNegocio.js';

export const identificarUsuario = async (req, res, next) => {
  const id = Number(req.get('x-usuario-id'));
  if (Number.isInteger(id) && id > 0) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, rol: true, activo: true },
    });
    if (usuario?.activo) {
      req.usuario = usuario;
    }
  }
  next();
};

export const permitirRoles = (...roles) => (req, res, next) => {
  if (!req.usuario) {
    throw new ErrorNegocio(401, 'Debe seleccionar un usuario para continuar');
  }
  if (!roles.includes(req.usuario.rol)) {
    throw new ErrorNegocio(403, 'Su perfil no tiene permiso para esta acción');
  }
  next();
};