import { Router } from 'express';
import { asyncHandler } from '@horary/shared';
import { listTiposDocumento } from '../controllers/tipos-documento.controller.js';

const router = Router();
router.get('/', asyncHandler(listTiposDocumento));

export default router;
