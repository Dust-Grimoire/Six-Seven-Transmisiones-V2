import { z } from 'zod';

export const filtroTransmisionesSchema = z.object({
  texto: z.string().trim().optional(),
  estado: z.enum(['COTIZADA', 'AUTORIZADA', 'FINALIZADA']).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export const filtroColaboradoresSchema = z.object({
  texto: z.string().trim().optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El identificador no es válido'),
});