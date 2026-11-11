import { Router } from 'express';
import * as personalController from '../controllers/personal.controller.js';
import { validar } from '../middlewares/validar.middleware.js';
import { permitirRoles } from '../middlewares/sesion.middleware.js';
import { idParamSchema } from '../schemas/catalogos.schema.js';
import {
  actualizarColaboradorSchema,
  asignacionSchema,
  bloqueSchema,
  candidatosSchema,
  colaboradorSchema,
  filtroColaboradoresSchema,
  porcentajeSchema,
  rangoSchema,
  respuestaSchema,
} from '../schemas/personal.schema.js';

const router = Router();
const idValido = validar(idParamSchema, 'params');

router.use(permitirRoles('DUENO'));
router.get('/colaboradores', validar(filtroColaboradoresSchema, 'query'), personalController.listarColaboradores);
router.post('/colaboradores', validar(colaboradorSchema), personalController.registrarColaborador);
router.put('/colaboradores/:id', idValido, validar(actualizarColaboradorSchema), personalController.actualizarColaborador);
router.get('/colaboradores/:id/disponibilidad', idValido, validar(rangoSchema, 'query'), personalController.listarDisponibilidad);
router.post('/colaboradores/:id/disponibilidad', idValido, validar(bloqueSchema), personalController.registrarDisponibilidad);
router.delete('/disponibilidad/:id', idValido, personalController.eliminarDisponibilidad);
router.get('/transmisiones', personalController.proximasTransmisiones);
router.get('/transmisiones/:id/nomina', idValido, personalController.nomina);
router.get('/transmisiones/:id/candidatos', idValido, validar(candidatosSchema, 'query'), personalController.candidatos);
router.post('/transmisiones/:id/asignaciones', idValido, validar(asignacionSchema), personalController.asignar);
router.patch('/asignaciones/:id/respuesta', idValido, validar(respuestaSchema), personalController.responder);
router.patch('/asignaciones/:id/porcentaje', idValido, validar(porcentajeSchema), personalController.ajustarPorcentaje);
router.patch('/funciones/:id/comision', idValido, validar(porcentajeSchema), personalController.definirComision);

export default router;