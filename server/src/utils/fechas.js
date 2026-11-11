export const rangoDelPeriodo = (periodo) => {
  const [anio, mes] = periodo.split('-').map(Number);
  return { desde: new Date(anio, mes - 1, 1), hasta: new Date(anio, mes, 1) };
};

export const periodoDe = (fecha) => {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}`;
};

export const horasEntre = (inicio, fin) => (fin.getTime() - inicio.getTime()) / 3600000;

export const seCruzan = (inicioA, finA, inicioB, finB) => inicioA < finB && inicioB < finA;