import { Router } from 'express';
import * as personalController from '../controllers/personal.controller.js';

const router = Router();

router.get('/colaboradores', personalController.listarColaboradores);
router.post('/colaboradores', personalController.registrarColaborador);
router.put('/colaboradores/:id', personalController.actualizarColaborador);

router.get('/colaboradores/:id/disponibilidad', personalController.listarDisponibilidad);
router.post('/colaboradores/:id/disponibilidad', personalController.registrarDisponibilidad);
router.delete('/disponibilidad/:id', personalController.eliminarDisponibilidad);

router.get('/transmisiones/proximas', personalController.proximasTransmisiones);
router.get('/transmisiones/:id/nomina', personalController.nomina);
router.get('/transmisiones/:id/candidatos', personalController.candidatos);
router.post('/transmisiones/:id/asignaciones', personalController.asignar);
router.post('/transmisiones/:id/comisiones', personalController.definirComision);

router.patch('/asignaciones/:id/respuesta', personalController.responder);
router.patch('/asignaciones/:id/porcentaje', personalController.ajustarPorcentaje);

export default router;