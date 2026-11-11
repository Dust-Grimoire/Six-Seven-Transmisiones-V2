const MS_DIA = 86400000;

export const fechaLocal = (fecha = new Date()) => {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

const soloFecha = (fecha) => fecha.toISOString().slice(0, 10);

export const estaVencido = (acuerdo, hoy) =>
  acuerdo.estado === 'PENDIENTE' && soloFecha(acuerdo.fechaComprometida) < hoy;

export const diasDeAtraso = (acuerdo, hoy) =>
  estaVencido(acuerdo, hoy)
    ? Math.round((Date.parse(hoy) - Date.parse(soloFecha(acuerdo.fechaComprometida))) / MS_DIA)
    : 0;

export const describirAcuerdo = (acuerdo, hoy) => ({
  ...acuerdo,
  situacion: estaVencido(acuerdo, hoy) ? 'VENCIDO' : acuerdo.estado,
  diasAtraso: diasDeAtraso(acuerdo, hoy),
});

export const resumenCumplimiento = (acuerdos, hoy) => {
  const cumplidos = acuerdos.filter((a) => a.estado === 'CUMPLIDO').length;
  const vencidos = acuerdos.filter((a) => estaVencido(a, hoy)).length;
  return {
    total: acuerdos.length,
    cumplidos,
    vencidos,
    pendientes: acuerdos.length - cumplidos - vencidos,
    porcentajeCumplimiento:
      acuerdos.length === 0 ? null : Math.round((cumplidos / acuerdos.length) * 100),
  };
};