import prisma from '../config/prisma.js';
import { obtenerParametros } from './parametros.service.js';
import { registrarAuditoria } from '../utils/auditoria.js';
import { conflicto, noEncontrado, solicitudInvalida } from '../utils/errorNegocio.js';
import { horasEntre } from '../utils/fechas.js';
import {
  calcularResumenTarifario,
  estadoGarantia,
  montoGarantia,
  requiereGarantia,
  saldoPendiente,
} from '../utils/agenda.reglas.js';

const leerReglas = async () => {
  const valores = await obtenerParametros([
    'TARIFA_KIT',
    'RECARGO_ULTIMA_GENERACION',
    'HORAS_LIMITE_GARANTIA',
    'PORCENTAJE_GARANTIA',
  ]);
  return {
    tarifaKit: Number(valores.TARIFA_KIT),
    recargoUltimaGeneracion: Number(valores.RECARGO_ULTIMA_GENERACION),
    horasLimite: Number(valores.HORAS_LIMITE_GARANTIA),
    porcentajeGarantia: Number(valores.PORCENTAJE_GARANTIA),
  };
};

const situacionGarantia = (transmision, reglas) => {
  const requerida = requiereGarantia(horasEntre(transmision.inicio, transmision.fin), reglas.horasLimite);
  return {
    requerida,
    monto: requerida ? montoGarantia(transmision.valorTotal, reglas.porcentajeGarantia) : 0,
    estado: estadoGarantia(requerida, transmision.pagos),
  };
};

export const calcularResumen = async (datos) => {
  const reglas = await leerReglas();
  const funciones = await prisma.funcion.findMany({
    where: { id: { in: datos.requerimientos.map((r) => r.funcionId) } },
  });
  if (funciones.length !== new Set(datos.requerimientos.map((r) => r.funcionId)).size) {
    throw solicitudInvalida('Una de las funciones indicadas no existe');
  }
  const resumen = calcularResumenTarifario(
    {
      funciones: datos.requerimientos.map((r) => ({
        ...funciones.find((f) => f.id === r.funcionId),
        cantidad: r.cantidad,
      })),
      horas: datos.duracionHoras,
      cantidadKits: datos.cantidadKits,
      kitsUltimaGeneracion: datos.kitsUltimaGeneracion,
    },
    reglas,
  );
  const requerida = requiereGarantia(datos.duracionHoras, reglas.horasLimite);
  return {
    ...resumen,
    requiereGarantia: requerida,
    montoGarantia: requerida ? montoGarantia(resumen.valorTotal, reglas.porcentajeGarantia) : 0,
  };
};

export const registrarCotizacion = async (datos, usuarioId) => {
  if (datos.inicio <= new Date()) {
    throw solicitudInvalida('La fecha de la transmisión debe ser posterior a hoy');
  }
  const resumen = await calcularResumen(datos);
  const fin = new Date(datos.inicio.getTime() + datos.duracionHoras * 3600000);
  return prisma.transmision.create({
    data: {
      nombreEvento: datos.nombreEvento,
      cliente: datos.clienteId ? { connect: { id: datos.clienteId } } : { create: datos.clienteNuevo },
      tipoEvento: datos.tipoEvento,
      tipoServicio: datos.tipoServicio,
      recinto: datos.recinto,
      comuna: datos.comuna,
      inicio: datos.inicio,
      fin,
      cantidadKits: datos.cantidadKits,
      kitsUltimaGeneracion: datos.kitsUltimaGeneracion,
      valorBase: resumen.valorBase,
      recargo: resumen.recargo,
      valorTotal: resumen.valorTotal,
      creadoPor: { connect: { id: usuarioId } },
      requerimientos: {
        create: datos.requerimientos.map((r) => ({ funcionId: r.funcionId, cantidad: r.cantidad })),
      },
    },
  });
};

export const listarCalendario = async ({ desde, hasta }) => {
  const reglas = await leerReglas();
  const transmisiones = await prisma.transmision.findMany({
    where: { inicio: { gte: desde, lt: hasta } },
    include: { cliente: { select: { nombre: true } }, pagos: { select: { tipo: true, monto: true } } },
    orderBy: { inicio: 'asc' },
  });
  return transmisiones.map(({ pagos, ...transmision }) => ({
    ...transmision,
    garantia: situacionGarantia({ ...transmision, pagos }, reglas).estado,
  }));
};

const obtenerTransmision = async (id) => {
  const transmision = await prisma.transmision.findUnique({
    where: { id },
    include: {
      cliente: true,
      creadoPor: { select: { nombre: true } },
      autorizadoPor: { select: { nombre: true } },
      requerimientos: { include: { funcion: true } },
      pagos: { orderBy: { fechaPago: 'asc' }, include: { registradoPor: { select: { nombre: true } } } },
      asignaciones: {
        where: { estado: { not: 'RECHAZADA' } },
        include: {
          colaborador: { select: { nombre: true, funciones: { include: { funcion: true } } } },
          funcion: true,
          funcionEfectiva: true,
        },
        orderBy: { id: 'asc' },
      },
      asignacionesKit: { include: { kit: true, responsable: { select: { nombre: true } } } },
    },
  });
  if (!transmision) {
    throw noEncontrado('La transmisión no existe');
  }
  return transmision;
};

export const obtenerFicha = async (id) => {
  const reglas = await leerReglas();
  const transmision = await obtenerTransmision(id);
  return {
    ...transmision,
    duracionHoras: horasEntre(transmision.inicio, transmision.fin),
    garantia: situacionGarantia(transmision, reglas),
    saldoPendiente: saldoPendiente(transmision.valorTotal, transmision.pagos),
    retornoPendiente: transmision.asignacionesKit.some((a) => !a.retornoEn),
  };
};

export const registrarGarantia = async (id, datos, contexto) => {
  const reglas = await leerReglas();
  const transmision = await obtenerTransmision(id);
  const garantia = situacionGarantia(transmision, reglas);
  if (transmision.estado === 'FINALIZADA') {
    throw conflicto('La transmisión ya está finalizada');
  }
  if (!garantia.requerida) {
    throw conflicto(`La transmisión dura ${reglas.horasLimite} horas o menos y no requiere garantía`);
  }
  if (garantia.estado === 'RECIBIDA') {
    throw conflicto('La garantía de esta transmisión ya fue registrada');
  }
  if (datos.monto !== garantia.monto) {
    throw solicitudInvalida(`El monto de la garantía debe ser ${garantia.monto}, el ${reglas.porcentajeGarantia} % del valor cotizado`);
  }
  return prisma.$transaction(async (tx) => {
    const pago = await tx.pago.create({
      data: {
        transmisionId: id,
        tipo: 'GARANTIA',
        monto: datos.monto,
        fechaPago: datos.fechaPago,
        comprobanteId: datos.comprobanteId,
        registradoPorId: contexto.usuarioId,
      },
    });
    await registrarAuditoria(tx, contexto, 'GARANTIA_REGISTRADA', 'Transmision', id, `Garantía de ${datos.monto}`);
    return pago;
  });
};

export const autorizar = async (id, usuarioId) => {
  const reglas = await leerReglas();
  const transmision = await obtenerTransmision(id);
  if (transmision.estado !== 'COTIZADA') {
    throw conflicto('Solo se puede autorizar una transmisión en estado Cotizado');
  }
  if (situacionGarantia(transmision, reglas).estado === 'PENDIENTE') {
    throw conflicto(`Garantía pendiente: la transmisión dura más de ${reglas.horasLimite} horas y el Contador aún no registra el ${reglas.porcentajeGarantia} % por adelantado`);
  }
  return prisma.transmision.update({
    where: { id },
    data: { estado: 'AUTORIZADA', autorizadoPorId: usuarioId, autorizadoEn: new Date() },
  });
};

export const cerrar = async (id, { asistencias }) => {
  const transmision = await obtenerTransmision(id);
  if (transmision.estado !== 'AUTORIZADA') {
    throw conflicto('Solo se puede cerrar una transmisión Autorizada a Terreno');
  }
  if (transmision.fin > new Date()) {
    throw conflicto('La transmisión aún no termina');
  }
  if (transmision.asignacionesKit.some((asignacion) => !asignacion.retornoEn)) {
    throw conflicto('Falta registrar el retorno de los equipos a bodega');
  }
  const confirmadas = transmision.asignaciones.filter((a) => a.estado === 'CONFIRMADA');
  const faltantes = confirmadas.filter((a) => !asistencias.some((x) => x.asignacionId === a.id));
  if (faltantes.length > 0) {
    throw solicitudInvalida(`Falta confirmar la asistencia de ${faltantes[0].colaborador.nombre}`);
  }
  const actualizaciones = asistencias.map((registro) => {
    const asignacion = confirmadas.find((a) => a.id === registro.asignacionId);
    if (!asignacion) {
      throw solicitudInvalida('Una de las asignaciones no pertenece a la nómina confirmada');
    }
    const habilitadas = asignacion.colaborador.funciones.map((f) => f.funcionId);
    if (registro.asistio && !habilitadas.includes(registro.funcionEfectivaId)) {
      throw solicitudInvalida(`${asignacion.colaborador.nombre} no tiene habilitada la función indicada`);
    }
    return prisma.asignacion.update({
      where: { id: asignacion.id },
      data: { asistio: registro.asistio, funcionEfectivaId: registro.asistio ? registro.funcionEfectivaId : null },
    });
  });
  const [cerrada] = await prisma.$transaction([
    prisma.transmision.update({ where: { id }, data: { estado: 'FINALIZADA', cerradoEn: new Date() } }),
    ...actualizaciones,
  ]);
  return cerrada;
};