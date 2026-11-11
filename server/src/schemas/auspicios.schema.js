import { z } from 'zod';

const telefono = z
  .string()
  .trim()
  .regex(/^\+569\d{8}$/, 'El teléfono debe tener el formato +569XXXXXXXX');

export const auspiciadorSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  contacto: z.string().trim().max(120).optional(),
  telefono: telefono.optional().or(z.literal('').transform(() => undefined)),
});

export const acuerdoSchema = z
  .object({
    auspiciadorId: z.coerce.number().int().positive(),
    transmisionId: z.coerce.number().int().positive(),
    glosa: z.string().trim().min(10, 'La glosa debe describir lo que ofrece cada parte').max(1000),
    tipoAporte: z.enum(['MONETARIO', 'CANJE']),
    montoComprometido: z.coerce.number().int().positive().optional(),
    fechaComprometida: z.coerce.date(),
  })
  .refine((datos) => datos.tipoAporte === 'CANJE' || datos.montoComprometido, {
    message: 'Indique el monto comprometido del aporte monetario',
    path: ['montoComprometido'],
  });

export const cumplimientoSchema = z.object({
  fechaRecepcion: z.coerce.date(),
  montoRecibido: z.coerce.number().int().positive().optional(),
  detalleRecibido: z.string().trim().max(300).optional(),
});

export const motivoSchema = z.object({
  motivo: z.string().trim().min(5, 'Indique el motivo').max(300),
});

export const filtroAcuerdosSchema = z.object({
  situacion: z.enum(['PENDIENTE', 'VENCIDO', 'CUMPLIDO']).optional(),
});