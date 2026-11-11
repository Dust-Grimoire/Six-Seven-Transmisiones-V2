import { z } from 'zod';

const requerimientoSchema = z.object({
  funcionId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().min(1).max(10),
});

const planificacionSchema = z.object({
  inicio: z.coerce.date(),
  duracionHoras: z.coerce.number().min(0.5).max(24),
  cantidadKits: z.coerce.number().int().min(1).max(10),
  kitsUltimaGeneracion: z.boolean().default(false),
  requerimientos: z.array(requerimientoSchema).min(1, 'Debe indicar al menos una función de personal'),
});

export const resumenTarifarioSchema = planificacionSchema;

export const cotizacionSchema = planificacionSchema
  .extend({
    nombreEvento: z.string().trim().min(3).max(150),
    clienteId: z.coerce.number().int().positive().optional(),
    clienteNuevo: z
      .object({
        nombre: z.string().trim().min(3).max(120),
        contacto: z.string().trim().max(120).optional(),
        telefono: z.string().trim().max(20).optional(),
      })
      .optional(),
    tipoEvento: z.enum(['DEPORTIVO', 'ACADEMICO', 'CULTURAL', 'CORPORATIVO']),
    tipoServicio: z.enum(['BASICO', 'COMPLEJO']),
    recinto: z.string().trim().min(3).max(150),
    comuna: z.string().trim().min(3).max(80),
  })
  .refine((datos) => Boolean(datos.clienteId) !== Boolean(datos.clienteNuevo), {
    message: 'Seleccione un cliente existente o registre uno nuevo',
    path: ['clienteId'],
  })
  .refine((datos) => datos.tipoServicio === 'COMPLEJO' || datos.cantidadKits === 1, {
    message: 'Una transmisión básica utiliza un solo kit',
    path: ['cantidadKits'],
  });

export const filtroCalendarioSchema = z.object({
  desde: z.coerce.date(),
  hasta: z.coerce.date(),
});

export const garantiaSchema = z.object({
  monto: z.coerce.number().int().positive(),
  fechaPago: z.coerce.date(),
  comprobanteId: z.coerce.number().int().positive({ message: 'Debe adjuntar el comprobante' }),
});

export const cierreSchema = z.object({
  asistencias: z.array(
    z.object({
      asignacionId: z.coerce.number().int().positive(),
      asistio: z.boolean(),
      funcionEfectivaId: z.coerce.number().int().positive().nullable().optional(),
    }),
  ),
});