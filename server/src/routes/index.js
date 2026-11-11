import { Router } from 'express';
import healthRoutes from './health.routes.js';
import sesionRoutes from './sesion.routes.js';
import catalogosRoutes from './catalogos.routes.js';
import comprobantesRoutes from './comprobantes.routes.js';
import agendaRoutes from './agenda.routes.js';
import personalRoutes from './personal.routes.js';
import auspiciosRoutes from './auspicios.routes.js';
import tableroRoutes from './tablero.routes.js';
import inventarioRoutes from './inventario.routes.js';
import financieroRoutes from './financiero.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/sesion', sesionRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/comprobantes', comprobantesRoutes);
router.use('/agenda', agendaRoutes);
router.use('/personal', personalRoutes);
router.use('/auspicios', auspiciosRoutes);
router.use('/tablero', tableroRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/financiero', financieroRoutes);

export default router;