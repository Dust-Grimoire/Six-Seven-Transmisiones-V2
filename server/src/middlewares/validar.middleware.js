import { z } from 'zod';

const MENSAJES = {
  invalid_type: (problema) => (problema.received === 'undefined' ? 'Este dato es obligatorio' : 'El dato no tiene el formato esperado'),
  too_small: (problema) => (problema.type === 'string' ? `Debe tener al menos ${problema.minimum} caracteres` : `Debe ser mayor o igual a ${problema.minimum}`),
  too_big: (problema) => (problema.type === 'string' ? `Debe tener como máximo ${problema.maximum} caracteres` : `Debe ser menor o igual a ${problema.maximum}`),
  invalid_enum_value: () => 'La opción seleccionada no es válida',
  invalid_date: () => 'La fecha no es válida',
};

z.setErrorMap((problema, contexto) => ({
  message: MENSAJES[problema.code] ? MENSAJES[problema.code](problema) : contexto.defaultError,
}));

export const validar = (esquema, origen = 'body') => (req, res, next) => {
  const resultado = esquema.safeParse(req[origen]);
  if (!resultado.success) {
    return res.status(400).json({
      error: 'Revise los datos ingresados',
      detalles: resultado.error.issues.map((problema) => ({
        campo: problema.path.join('.'),
        mensaje: problema.message,
      })),
    });
  }
  if (origen === 'query') {
    req.filtros = resultado.data;
  } else {
    req[origen] = resultado.data;
  }
  next();
};