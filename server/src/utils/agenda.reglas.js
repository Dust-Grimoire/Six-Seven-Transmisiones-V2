export const calcularResumenTarifario = ({ funciones, horas, cantidadKits, kitsUltimaGeneracion }, tarifas) => {
  const detalle = funciones.map(({ nombre, tarifaHora, cantidad }) => ({
    nombre,
    cantidad,
    tarifaHora,
    subtotal: Math.round(tarifaHora * cantidad * horas),
  }));
  const subtotalPersonal = detalle.reduce((total, linea) => total + linea.subtotal, 0);
  const subtotalEquipos = cantidadKits * tarifas.tarifaKit;
  const valorBase = subtotalPersonal + subtotalEquipos;
  const recargo = kitsUltimaGeneracion ? Math.round((valorBase * tarifas.recargoUltimaGeneracion) / 100) : 0;
  return {
    horas,
    detalle,
    subtotalPersonal,
    subtotalEquipos,
    valorBase,
    porcentajeRecargo: kitsUltimaGeneracion ? tarifas.recargoUltimaGeneracion : 0,
    recargo,
    valorTotal: valorBase + recargo,
  };
};

export const requiereGarantia = (horas, horasLimite) => horas > horasLimite;

export const montoGarantia = (valorTotal, porcentaje) => Math.round((valorTotal * porcentaje) / 100);

export const estadoGarantia = (requerida, pagos) => {
  if (!requerida) return 'NO_REQUERIDA';
  return pagos.some((pago) => pago.tipo === 'GARANTIA') ? 'RECIBIDA' : 'PENDIENTE';
};

export const saldoPendiente = (valorTotal, pagos) =>
  valorTotal - pagos.reduce((total, pago) => total + pago.monto, 0);