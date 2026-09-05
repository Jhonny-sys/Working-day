import { z } from 'zod';

export const createInscripcionSchema = z.object({
  nombreCompleto: z.string().trim().min(1).max(100),
  tipoDocumento: z.string().trim().min(1).max(100),
  numeroDocumento: z.string().trim().regex(/^\d+$/, 'El número de documento solo puede contener números').max(100),
  correo: z.string().trim().email().max(100),
});

export const inscripcionIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const jornadaIdParamSchema = z.object({
  id: z.string().uuid(),
});
