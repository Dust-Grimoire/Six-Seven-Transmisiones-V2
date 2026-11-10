import express from 'express';
import cors from 'cors';
import rutas from './routes/index.js';
import { identificarUsuario } from './middlewares/sesion.middleware.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.middleware.js';

const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use('/api', identificarUsuario, rutas);
app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;