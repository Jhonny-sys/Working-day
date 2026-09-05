import { z } from 'zod';

export const createJornadaSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  sede: z.string().trim().min(1).max(100),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
  cupoTotal: z.number().int().min(0),
  activa: z.boolean().optional().default(true),
});

export const updateJornadaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(100).optional(),
    sede: z.string().trim().min(1).max(100).optional(),
    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    cupoTotal: z.number().int().min(0).optional(),
    activa: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const listJornadasQuerySchema = z.object({
  estado: z.enum(['activa', 'inactiva']).optional(),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  filtroCupo: z.enum(['todas', 'con_cupo', 'sin_cupo']).optional(),
}).refine((data) => !data.fechaDesde || !data.fechaHasta || data.fechaDesde <= data.fechaHasta, {
  message: 'La fecha desde no puede ser posterior a la fecha hasta',
  path: ['fechaDesde'],
});

export const jornadaIdParamSchema = z.object({
  id: z.string().uuid(),
});
