import { Router } from 'express';
import {
  asyncHandler,
  validateBody,
  validateQuery,
  validateParams,
  createJornadaSchema,
  updateJornadaSchema,
  listJornadasQuerySchema,
  jornadaIdParamSchema,
} from '@horary/shared';
import * as controller from '../controllers/jornadas.controller.js';

const router = Router();

router.get('/', validateQuery(listJornadasQuerySchema), asyncHandler(controller.listJornadas));
router.get('/:id', validateParams(jornadaIdParamSchema), asyncHandler(controller.getJornada));
router.post('/', validateBody(createJornadaSchema), asyncHandler(controller.createJornada));
router.put(
  '/:id',
  validateParams(jornadaIdParamSchema),
  validateBody(updateJornadaSchema),
  asyncHandler(controller.updateJornada)
);
router.delete(
  '/:id',
  validateParams(jornadaIdParamSchema),
  asyncHandler(controller.deleteJornada)
);

export default router;
