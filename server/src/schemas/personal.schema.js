import { z } from 'zod';
import { normalizarRut, rutValido } from '../utils/personal.reglas.js';

const porcentaje = z.coerce.number().min(0).max(100);

export const colaboradorSchema = z.object({
  nombre: z.string().trim().min(3).max(120),
  rut: z.string().trim().refine(rutValido, 'El RUT no es válido').transform(normalizarRut),
  telefono: z.string().trim().regex(/^\+569\d{8}$/, 'El teléfono debe tener el formato +569XXXXXXXX'),
  correo: z.string().trim().email('El correo no es válido').max(120).optional().or(z.literal('').transform(() => undefined)),
  funcionIds: z.array(z.coerce.number().int().positive()).min(1, 'Debe indicar al menos una función'),
});

export const actualizarColaboradorSchema = colaboradorSchema.omit({ rut: true }).extend({ activo: z.boolean() });

export const filtroColaboradoresSchema = z.object({
  incluirInactivos: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
});

export const bloqueSchema = z
  .object({
    inicio: z.coerce.date(),
    fin: z.coerce.date(),
  })
  .refine((bloque) => bloque.fin > bloque.inicio, {
    message: 'La hora de término debe ser posterior a la de inicio',
    path: ['fin'],
  });

export const rangoSchema = z.object({
  desde: z.coerce.date(),
  hasta: z.coerce.date(),
});

export const candidatosSchema = z.object({
  funcionId: z.coerce.number().int().positive(),
});

export const asignacionSchema = z.object({
  colaboradorId: z.coerce.number().int().positive(),
  funcionId: z.coerce.number().int().positive(),
});

export const respuestaSchema = z.object({
  estado: z.enum(['CONFIRMADA', 'RECHAZADA']),
});

export const porcentajeSchema = z.object({
  porcentajeComision: porcentaje,
});