import prisma from '../config/prisma.js';
import { ErrorNegocio } from '../utils/errorNegocio.js';

export const obtenerParametros = async (claves) => {
  const filas = await prisma.parametro.findMany({ where: { clave: { in: claves } } });
  const valores = Object.fromEntries(filas.map((fila) => [fila.clave, fila.valor]));
  const faltantes = claves.filter((clave) => valores[clave] === undefined);
  if (faltantes.length > 0) {
    throw new ErrorNegocio(500, `Falta configurar el parámetro ${faltantes[0]}`);
  }
  return valores;
};

export const obtenerNumero = async (clave) => {
  const valores = await obtenerParametros([clave]);
  return Number(valores[clave]);
};