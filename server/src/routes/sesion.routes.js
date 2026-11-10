import { Router } from 'express';
import * as sesionController from '../controllers/sesion.controller.js';

const router = Router();

router.get('/usuarios', sesionController.listarUsuarios);
router.get('/actual', sesionController.usuarioActual);

export default router;