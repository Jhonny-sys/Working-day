import { Router } from 'express';
import { asyncHandler } from '@horary/shared';
import * as controller from '../controllers/metricas.controller.js';

const router = Router();

router.get('/', asyncHandler(controller.getMetricas));

export default router;
