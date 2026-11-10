import dayjs from 'dayjs';

const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export const pesos = (valor) => formatoPesos.format(valor ?? 0);

export const fecha = (valor) => (valor ? dayjs(valor).format('DD-MM-YYYY') : '—');

export const fechaDia = (valor) => (valor ? dayjs(String(valor).slice(0, 10)).format('DD-MM-YYYY') : '—');

export const fechaHora = (valor) => (valor ? dayjs(valor).format('DD-MM-YYYY HH:mm') : '—');

export const hora = (valor) => (valor ? dayjs(valor).format('HH:mm') : '—');

export const horasDuracion = (inicio, fin) => dayjs(fin).diff(dayjs(inicio), 'minute') / 60;

export const porcentaje = (valor) => `${Number(valor ?? 0).toLocaleString('es-CL')} %`;

export const periodoActual = () => dayjs().format('YYYY-MM');