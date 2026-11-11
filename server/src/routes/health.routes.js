import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ estado: 'ok', servicio: 'sixseven-api', fecha: new Date().toISOString() });
});

export default router;