import { Router } from 'express';
import * as agendaController from '../controllers/agenda.controller.js';
import { validar } from '../middlewares/validar.middleware.js';
import { permitirRoles } from '../middlewares/sesion.middleware.js';
import { idParamSchema } from '../schemas/catalogos.schema.js';
import {
  cierreSchema,
  cotizacionSchema,
  filtroCalendarioSchema,
  garantiaSchema,
  resumenTarifarioSchema,
} from '../schemas/agenda.schema.js';

const router = Router();
const dueno = permitirRoles('DUENO');
const idValido = validar(idParamSchema, 'params');

router.post('/resumen-tarifario', dueno, validar(resumenTarifarioSchema), agendaController.resumenTarifario);
router.post('/transmisiones', dueno, validar(cotizacionSchema), agendaController.crearCotizacion);
router.get('/transmisiones', permitirRoles('DUENO', 'CONTADOR'), validar(filtroCalendarioSchema, 'query'), agendaController.calendario);
router.get('/transmisiones/:id', permitirRoles('DUENO', 'CONTADOR'), idValido, agendaController.ficha);
router.post('/transmisiones/:id/garantia', permitirRoles('CONTADOR'), idValido, validar(garantiaSchema), agendaController.registrarGarantia);
router.patch('/transmisiones/:id/autorizar', dueno, idValido, agendaController.autorizar);
router.patch('/transmisiones/:id/cerrar', dueno, idValido, validar(cierreSchema), agendaController.cerrar);

export default router;