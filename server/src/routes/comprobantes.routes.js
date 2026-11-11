import { Router } from 'express';
import * as comprobantesController from '../controllers/comprobantes.controller.js';
import { permitirRoles } from '../middlewares/sesion.middleware.js';
import { validar } from '../middlewares/validar.middleware.js';
import { subirComprobante } from '../config/subidas.js';
import { idParamSchema } from '../schemas/catalogos.schema.js';

const router = Router();

router.post('/', permitirRoles('CONTADOR'), subirComprobante, comprobantesController.subir);
router.get('/:id/archivo', permitirRoles('DUENO', 'CONTADOR'), validar(idParamSchema, 'params'), comprobantesController.descargar);

export default router;