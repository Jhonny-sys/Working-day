import { Router } from 'express';
import {
  asyncHandler,
  validateBody,
  validateParams,
  createInscripcionSchema,
  inscripcionIdParamSchema,
  jornadaIdParamSchema,
} from '@horary/shared';
import * as controller from '../controllers/inscripciones.controller.js';

const jornadasRouter = Router();

jornadasRouter.post(
  '/:id/inscripciones',
  validateParams(jornadaIdParamSchema),
  validateBody(createInscripcionSchema),
  asyncHandler(controller.createInscripcion)
);

jornadasRouter.get(
  '/:id/inscripciones',
  validateParams(jornadaIdParamSchema),
  asyncHandler(controller.listInscripciones)
);

const inscripcionesRouter = Router();

inscripcionesRouter.delete(
  '/:id',
  validateParams(inscripcionIdParamSchema),
  asyncHandler(controller.cancelInscripcion)
);

export default { jornadasRouter, inscripcionesRouter };
