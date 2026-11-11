import { Router } from 'express';
import * as catalogosController from '../controllers/catalogos.controller.js';
import { validar } from '../middlewares/validar.middleware.js';
import { permitirRoles } from '../middlewares/sesion.middleware.js';
import { filtroTransmisionesSchema, filtroColaboradoresSchema } from '../schemas/catalogos.schema.js';

const router = Router();

router.use(permitirRoles('DUENO', 'CONTADOR', 'JEFE_TECNICO'));
router.get('/funciones', catalogosController.funciones);
router.get('/clientes', catalogosController.clientes);
router.get('/transmisiones', validar(filtroTransmisionesSchema, 'query'), catalogosController.transmisiones);
router.get('/colaboradores', validar(filtroColaboradoresSchema, 'query'), catalogosController.colaboradores);

export default router;