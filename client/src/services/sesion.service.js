import { apiFetch } from './api.js';

export const listarUsuariosDePrueba = () => apiFetch('/sesion/usuarios');