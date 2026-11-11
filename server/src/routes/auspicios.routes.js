import { Router } from 'express';
import * as auspiciosController from '../controllers/auspicios.controller.js';
import { validar } from '../middlewares/validar.middleware.js';
import { permitirRoles } from '../middlewares/sesion.middleware.js';
import { idParamSchema } from '../schemas/catalogos.schema.js';
import {
  acuerdoSchema,
  auspiciadorSchema,
  cumplimientoSchema,
  filtroAcuerdosSchema,
  motivoSchema,
} from '../schemas/auspicios.schema.js';

const router = Router();
const idValido = validar(idParamSchema, 'params');

router.use(permitirRoles('DUENO'));

router.get('/auspiciadores', auspiciosController.listarAuspiciadores);
router.post('/auspiciadores', validar(auspiciadorSchema), auspiciosController.registrarAuspiciador);
router.get('/auspiciadores/:id', idValido, auspiciosController.historial);
router.patch('/auspiciadores/:id/lista-negra', idValido, validar(motivoSchema), auspiciosController.marcarMoroso);
router.patch('/auspiciadores/:id/regularizar', idValido, validar(motivoSchema), auspiciosController.regularizar);

router.get('/acuerdos', validar(filtroAcuerdosSchema, 'query'), auspiciosController.listarAcuerdos);
router.post('/acuerdos', validar(acuerdoSchema), auspiciosController.registrarAcuerdo);
router.patch('/acuerdos/:id/cumplimiento', idValido, validar(cumplimientoSchema), auspiciosController.registrarCumplimiento);

export default router;