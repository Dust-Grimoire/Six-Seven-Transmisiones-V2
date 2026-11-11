import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { ErrorNegocio } from '../utils/errorNegocio.js';

export const CARPETA_SUBIDAS = path.resolve('uploads');

fs.mkdirSync(CARPETA_SUBIDAS, { recursive: true });

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const almacenamiento = multer.diskStorage({
  destination: CARPETA_SUBIDAS,
  filename: (req, archivo, cb) => {
    cb(null, `${crypto.randomUUID()}${path.extname(archivo.originalname).toLowerCase()}`);
  },
});

export const subirComprobante = multer({
  storage: almacenamiento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, archivo, cb) => {
    if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
      cb(null, true);
    } else {
      cb(new ErrorNegocio(400, 'El comprobante debe ser una imagen (JPG, PNG, WEBP) o un PDF'));
    }
  },
}).single('archivo');