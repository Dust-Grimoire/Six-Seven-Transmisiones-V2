import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CARPETA_SUBIDAS = path.resolve('uploads');
const HOY = new Date();

const dia = (desplazamiento, hora = 0, minuto = 0) =>
  new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate() + desplazamiento, hora, minuto);

const periodo = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

const PDF_BASE =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n' +
  '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n';

const crearPdf = (texto) => {
  const contenido = `BT /F1 12 Tf 20 60 Td (${texto}) Tj ET`;
  return `${PDF_BASE}4 0 obj<</Length ${contenido.length}>>stream\n${contenido}\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n`;
};

const limpiar = async () => {
  const tablas = [
    'historial_lista_negra', 'acuerdos_auspicio', 'auspiciadores', 'lineas_liquidacion', 'liquidaciones',
    'pagos_starlink', 'reembolsos', 'gastos', 'detalles_salida', 'asignaciones_kit', 'movimientos_repuesto',
    'repuestos', 'bajas', 'historial_estados_equipo', 'equipos', 'kits', 'asignaciones', 'disponibilidades',
    'colaborador_funciones', 'colaboradores', 'pagos', 'requerimientos_funcion', 'transmisiones', 'funciones',
    'clientes', 'comprobantes', 'parametros', 'registros_auditoria', 'usuarios',
  ];
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tablas.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`);
  fs.rmSync(CARPETA_SUBIDAS, { recursive: true, force: true });
  fs.mkdirSync(CARPETA_SUBIDAS, { recursive: true });
};

const crearUsuarios = async () => {
  const contrasenaHash = await bcrypt.hash('Sixseven2026', 10);
  const datos = [
    { nombre: 'Rodrigo Fuentes', correo: 'dueno@sixseven.cl', rol: 'DUENO' },
    { nombre: 'Carolina Muñoz', correo: 'contador@sixseven.cl', rol: 'CONTADOR' },
    { nombre: 'Matías Rivera', correo: 'jefetecnico@sixseven.cl', rol: 'JEFE_TECNICO' },
  ];
  const usuarios = [];
  for (const dato of datos) {
    usuarios.push(await prisma.usuario.create({ data: { ...dato, contrasenaHash } }));
  }
  return usuarios;
};

const crearParametros = () =>
  prisma.parametro.createMany({
    data: [
      { clave: 'TARIFA_KIT', valor: '40000', descripcion: 'Valor cobrado por cada kit de inventario en una transmisión' },
      { clave: 'RECARGO_ULTIMA_GENERACION', valor: '15', descripcion: 'Porcentaje de recargo por cotizar kits de última generación' },
      { clave: 'HORAS_LIMITE_GARANTIA', valor: '5', descripcion: 'Duración desde la que se exige garantía por adelantado' },
      { clave: 'PORCENTAJE_GARANTIA', valor: '50', descripcion: 'Porcentaje del valor cotizado que se cobra como garantía' },
      { clave: 'MINUTOS_TRASLADO', valor: '90', descripcion: 'Minutos mínimos entre transmisiones en comunas distintas' },
      { clave: 'TARIFA_STARLINK', valor: '50000', descripcion: 'Tarifa mensual vigente de la suscripción Starlink' },
      { clave: 'DIRECCION_BODEGA', valor: 'Bodega Sixseven, Concepción', descripcion: 'Origen o destino válido de los traslados en Uber' },
    ],
  });

const crearFunciones = async () => {
  const datos = [
    { nombre: 'Cámara', tarifaHora: 8000, porcentajeComision: 12 },
    { nombre: 'Audio', tarifaHora: 6000, porcentajeComision: 8 },
    { nombre: 'Switch', tarifaHora: 9000, porcentajeComision: 12 },
    { nombre: 'Relator', tarifaHora: 7000, porcentajeComision: 8 },
    { nombre: 'Montaje', tarifaHora: 5000, porcentajeComision: 6 },
  ];
  const funciones = {};
  for (const dato of datos) {
    funciones[dato.nombre] = await prisma.funcion.create({ data: dato });
  }
  return funciones;
};

const crearClientes = async () => {
  const nombres = [
    ['Liga Regional de Fútbol Biobío', 'Jorge Sepúlveda', '+56912345001'],
    ['Instituto Profesional Ñuble', 'Andrea Lagos', '+56912345002'],
    ['Centro Cultural Penco', 'Felipe Ortiz', '+56912345003'],
    ['Corporación Eventos Andalién', 'Paula Henríquez', '+56912345004'],
  ];
  const clientes = [];
  for (const [nombre, contacto, telefono] of nombres) {
    clientes.push(await prisma.cliente.create({ data: { nombre, contacto, telefono } }));
  }
  return clientes;
};

const valorizar = (requerimientos, funciones, horas, cantidadKits, ultimaGeneracion) => {
  const personal = requerimientos.reduce(
    (total, [nombre, cantidad]) => total + funciones[nombre].tarifaHora * cantidad * horas,
    0,
  );
  const valorBase = Math.round(personal + cantidadKits * 40000);
  const recargo = ultimaGeneracion ? Math.round(valorBase * 0.15) : 0;
  return { valorBase, recargo, valorTotal: valorBase + recargo };
};

const crearTransmisiones = async (clientes, funciones, dueno) => {
  const definiciones = [
    {
      clave: 'clasico', nombreEvento: 'Clásico regional Biobío vs Ñuble', cliente: 0, tipoEvento: 'DEPORTIVO',
      tipoServicio: 'COMPLEJO', recinto: 'Estadio Municipal de Concepción', comuna: 'Concepción',
      inicio: dia(-35, 14), horas: 6, cantidadKits: 2, ultimaGeneracion: false, estado: 'FINALIZADA',
      requerimientos: [['Cámara', 2], ['Switch', 1], ['Audio', 1], ['Relator', 1]],
    },
    {
      clave: 'titulacion', nombreEvento: 'Ceremonia de titulación Ingeniería', cliente: 1, tipoEvento: 'ACADEMICO',
      tipoServicio: 'BASICO', recinto: 'Aula Magna Instituto Ñuble', comuna: 'Chillán',
      inicio: dia(-30, 11), horas: 3, cantidadKits: 1, ultimaGeneracion: false, estado: 'FINALIZADA',
      requerimientos: [['Cámara', 1]],
    },
    {
      clave: 'festival', nombreEvento: 'Festival de bandas Penco', cliente: 2, tipoEvento: 'CULTURAL',
      tipoServicio: 'COMPLEJO', recinto: 'Anfiteatro Penco', comuna: 'Penco',
      inicio: dia(-4, 16), horas: 7, cantidadKits: 2, ultimaGeneracion: false, estado: 'FINALIZADA',
      requerimientos: [['Cámara', 2], ['Switch', 1], ['Audio', 1], ['Montaje', 1]],
    },
    {
      clave: 'seminario', nombreEvento: 'Seminario de periodismo deportivo', cliente: 3, tipoEvento: 'CORPORATIVO',
      tipoServicio: 'BASICO', recinto: 'Salón Auditorio Andalién', comuna: 'Concepción',
      inicio: dia(-1, 10), horas: 3, cantidadKits: 1, ultimaGeneracion: false, estado: 'AUTORIZADA',
      requerimientos: [['Cámara', 1]],
    },
    {
      clave: 'final', nombreEvento: 'Final copa regional juvenil', cliente: 0, tipoEvento: 'DEPORTIVO',
      tipoServicio: 'COMPLEJO', recinto: 'Estadio El Morro', comuna: 'Talcahuano',
      inicio: dia(3, 15), horas: 6, cantidadKits: 2, ultimaGeneracion: true, estado: 'AUTORIZADA',
      requerimientos: [['Cámara', 3], ['Switch', 1], ['Audio', 1], ['Relator', 2]],
    },
    {
      clave: 'convencion', nombreEvento: 'Convención anual Andalién', cliente: 3, tipoEvento: 'CORPORATIVO',
      tipoServicio: 'COMPLEJO', recinto: 'Centro de Eventos Andalién', comuna: 'Concepción',
      inicio: dia(6, 9), horas: 8, cantidadKits: 2, ultimaGeneracion: false, estado: 'COTIZADA',
      requerimientos: [['Cámara', 2], ['Switch', 1], ['Audio', 1]],
    },
    {
      clave: 'charla', nombreEvento: 'Charla de innovación docente', cliente: 1, tipoEvento: 'ACADEMICO',
      tipoServicio: 'BASICO', recinto: 'Auditorio Instituto Ñuble', comuna: 'Chillán',
      inicio: dia(3, 10), horas: 2, cantidadKits: 1, ultimaGeneracion: false, estado: 'COTIZADA',
      requerimientos: [['Cámara', 1]],
    },
    {
      clave: 'amistoso', nombreEvento: 'Amistoso de exhibición Lota', cliente: 0, tipoEvento: 'DEPORTIVO',
      tipoServicio: 'BASICO', recinto: 'Estadio Federico Schwager', comuna: 'Lota',
      inicio: dia(10, 17), horas: 3, cantidadKits: 1, ultimaGeneracion: false, estado: 'AUTORIZADA',
      requerimientos: [['Cámara', 1], ['Relator', 1]],
    },
  ];
  const transmisiones = {};
  for (const def of definiciones) {
    const fin = new Date(def.inicio.getTime() + def.horas * 3600000);
    const valores = valorizar(def.requerimientos, funciones, def.horas, def.cantidadKits, def.ultimaGeneracion);
    const autorizada = def.estado !== 'COTIZADA';
    transmisiones[def.clave] = await prisma.transmision.create({
      data: {
        nombreEvento: def.nombreEvento,
        clienteId: clientes[def.cliente].id,
        tipoEvento: def.tipoEvento,
        tipoServicio: def.tipoServicio,
        recinto: def.recinto,
        comuna: def.comuna,
        inicio: def.inicio,
        fin,
        cantidadKits: def.cantidadKits,
        kitsUltimaGeneracion: def.ultimaGeneracion,
        ...valores,
        estado: def.estado,
        creadoPorId: dueno.id,
        autorizadoPorId: autorizada ? dueno.id : null,
        autorizadoEn: autorizada ? new Date(def.inicio.getTime() - 5 * 86400000) : null,
        cerradoEn: def.estado === 'FINALIZADA' ? new Date(fin.getTime() + 3600000) : null,
        creadoEn: new Date(def.inicio.getTime() - 10 * 86400000),
        requerimientos: {
          create: def.requerimientos.map(([nombre, cantidad]) => ({ funcionId: funciones[nombre].id, cantidad })),
        },
      },
    });
  }
  return transmisiones;
};

const crearColaboradores = async (funciones) => {
  const datos = [
    ['Tomás Jara', '18456789-K', ['Cámara', 'Switch']],
    ['Valentina Rojas', '19234567-7', ['Cámara', 'Audio']],
    ['Diego Contreras', '17890123-0', ['Cámara']],
    ['Camila Torres', '20123456-5', ['Audio', 'Montaje']],
    ['Benjamín Salazar', '16789012-1', ['Relator']],
    ['Francisca Vidal', '19876543-0', ['Relator', 'Cámara']],
    ['Ignacio Morales', '18765432-7', ['Switch', 'Montaje']],
    ['Antonia Pérez', '20987654-K', ['Cámara', 'Montaje']],
    ['Sebastián Castro', '17654321-3', ['Audio']],
    ['Josefa Navarro', '19543210-4', ['Cámara', 'Relator']],
  ];
  const colaboradores = {};
  let numero = 1;
  for (const [nombre, rut, nombresFunciones] of datos) {
    colaboradores[nombre] = await prisma.colaborador.create({
      data: {
        nombre,
        rut,
        telefono: `+5698765${String(numero).padStart(4, '0')}`,
        correo: `${nombre.split(' ')[0].toLowerCase()}@correo.cl`,
        funciones: { create: nombresFunciones.map((f) => ({ funcionId: funciones[f].id })) },
      },
    });
    numero += 1;
  }
  const bloques = [];
  for (const [indice, colaborador] of Object.values(colaboradores).entries()) {
    for (let d = -40; d <= 21; d += 1) {
      if (indice === 9 && d > 0) continue;
      bloques.push({ colaboradorId: colaborador.id, inicio: dia(d, 8), fin: dia(d, 23, 30) });
    }
  }
  await prisma.disponibilidad.createMany({ data: bloques });
  return colaboradores;
};

const crearAsignaciones = async (transmisiones, colaboradores, funciones) => {
  const plan = {
    clasico: [['Tomás Jara', 'Cámara'], ['Valentina Rojas', 'Cámara'], ['Ignacio Morales', 'Switch'], ['Camila Torres', 'Audio'], ['Benjamín Salazar', 'Relator']],
    titulacion: [['Diego Contreras', 'Cámara']],
    festival: [['Tomás Jara', 'Cámara'], ['Antonia Pérez', 'Cámara'], ['Ignacio Morales', 'Switch'], ['Sebastián Castro', 'Audio'], ['Camila Torres', 'Montaje']],
    final: [['Tomás Jara', 'Cámara'], ['Valentina Rojas', 'Cámara'], ['Ignacio Morales', 'Switch'], ['Benjamín Salazar', 'Relator'], ['Francisca Vidal', 'Relator']],
    seminario: [['Francisca Vidal', 'Cámara']],
    amistoso: [['Diego Contreras', 'Cámara']],
  };
  for (const [clave, filas] of Object.entries(plan)) {
    const transmision = transmisiones[clave];
    const finalizada = transmision.estado === 'FINALIZADA';
    for (const [indice, [nombre, funcion]] of filas.entries()) {
      const estado = finalizada || indice < 3 ? 'CONFIRMADA' : 'POR_CONFIRMAR';
      await prisma.asignacion.create({
        data: {
          transmisionId: transmision.id,
          colaboradorId: colaboradores[nombre].id,
          funcionId: funciones[funcion].id,
          porcentajeComision: funciones[funcion].porcentajeComision,
          estado,
          asistio: finalizada ? true : null,
          funcionEfectivaId: finalizada ? funciones[funcion].id : null,
          respondidoEn: estado === 'CONFIRMADA' ? new Date(transmision.inicio.getTime() - 2 * 86400000) : null,
        },
      });
    }
  }
};

const crearInventario = async (transmisiones, colaboradores, jefe) => {
  const kits = [];
  for (const nombre of ['Kit 1', 'Kit 2', 'Kit 3', 'Kit 4 Pro']) {
    kits.push(await prisma.kit.create({ data: { nombre } }));
  }
  const modelos = {
    CAMARA: ['Sony', 'PXW-Z190', 2400000, 'Sony', 'FX6', 5200000],
    TRIPODE: ['Manfrotto', '504X', 450000, 'Sachtler', 'Flowtech 75', 1100000],
    MICROFONO: ['Sennheiser', 'MKE 600', 280000, 'Shure', 'VP83F', 420000],
    SWITCH: ['Blackmagic', 'ATEM Mini Pro', 650000, 'Blackmagic', 'ATEM Mini Extreme', 1300000],
  };
  const equipos = {};
  let correlativo = 1;
  const crearEquipo = async (tipo, kit, ultimaGeneracion, estado = 'OPERATIVO') => {
    const [marca, modelo, valor, marcaUg, modeloUg, valorUg] = modelos[tipo];
    const equipo = await prisma.equipo.create({
      data: {
        tipo,
        marca: ultimaGeneracion ? marcaUg : marca,
        modelo: ultimaGeneracion ? modeloUg : modelo,
        numeroSerie: `SS-${tipo.slice(0, 3)}-${String(correlativo).padStart(4, '0')}`,
        fechaIngreso: dia(-400 + correlativo * 7),
        valorReposicion: ultimaGeneracion ? valorUg : valor,
        ultimaGeneracion,
        estado,
        kitId: kit ? kit.id : null,
      },
    });
    correlativo += 1;
    return equipo;
  };
  for (const [indice, kit] of kits.entries()) {
    const ultimaGeneracion = indice === 3;
    for (const tipo of ['CAMARA', 'TRIPODE', 'MICROFONO', 'SWITCH']) {
      equipos[`${kit.nombre}-${tipo}`] = await crearEquipo(tipo, kit, ultimaGeneracion);
    }
  }
  equipos.reservaCamara = await crearEquipo('CAMARA', null, false);
  equipos.reservaMicrofono = await crearEquipo('MICROFONO', null, false);
  equipos.reservaTripode = await crearEquipo('TRIPODE', null, false, 'EN_REPARACION');
  await prisma.historialEstadoEquipo.create({
    data: {
      equipoId: equipos.reservaTripode.id, estadoAnterior: 'OPERATIVO', estadoNuevo: 'EN_REPARACION',
      observacion: 'Rótula con juego, enviado a servicio técnico', usuarioId: jefe.id, fecha: dia(-8, 10),
    },
  });

  const salida = async (clave, kit, responsable, retornos) => {
    const transmision = transmisiones[clave];
    const asignacion = await prisma.asignacionKit.create({
      data: {
        transmisionId: transmision.id,
        kitId: kit.id,
        responsableId: responsable ? colaboradores[responsable].id : null,
        salidaEn: retornos ? new Date(transmision.inicio.getTime() - 3 * 3600000) : null,
        retornoEn: retornos ? new Date(transmision.fin.getTime() + 2 * 3600000) : null,
        registradoPorId: jefe.id,
      },
    });
    if (retornos) {
      const delKit = Object.entries(equipos).filter(([nombre]) => nombre.startsWith(`${kit.nombre}-`));
      await prisma.detalleSalida.createMany({
        data: delKit.map(([nombre, equipo]) => ({
          asignacionKitId: asignacion.id,
          equipoId: equipo.id,
          estadoRetorno: retornos[nombre.split('-')[1]] ?? 'RECIBIDO',
        })),
      });
    }
  };
  await salida('clasico', kits[0], 'Tomás Jara', {});
  await salida('clasico', kits[1], 'Ignacio Morales', {});
  await salida('titulacion', kits[2], 'Diego Contreras', {});
  await salida('festival', kits[0], 'Tomás Jara', {});
  await salida('festival', kits[2], 'Antonia Pérez', { CAMARA: 'PERDIDO', MICROFONO: 'DANADO' });
  await salida('seminario', kits[0], 'Francisca Vidal', {});
  await salida('final', kits[1], null, null);
  await salida('final', kits[3], null, null);

  for (const tipo of ['CAMARA', 'TRIPODE', 'MICROFONO', 'SWITCH']) {
    await prisma.equipo.update({ where: { id: equipos[`Kit 2-${tipo}`].id }, data: { estado: 'RESERVADO' } });
    await prisma.equipo.update({ where: { id: equipos[`Kit 4 Pro-${tipo}`].id }, data: { estado: 'RESERVADO' } });
  }
  await prisma.equipo.update({ where: { id: equipos['Kit 3-MICROFONO'].id }, data: { estado: 'EN_MERMA' } });
  const camaraPerdida = equipos['Kit 3-CAMARA'];
  await prisma.equipo.update({ where: { id: camaraPerdida.id }, data: { estado: 'DADO_DE_BAJA', kitId: null } });
  const baja = await prisma.baja.create({
    data: {
      equipoId: camaraPerdida.id,
      causa: 'ROBO',
      descripcion: 'Cámara sustraída desde el escenario durante el desmontaje',
      transmisionId: transmisiones.festival.id,
      kitAnteriorId: kits[2].id,
      valorPerdida: camaraPerdida.valorReposicion,
      registradoPorId: jefe.id,
      fecha: dia(-3, 12),
    },
  });
  await prisma.historialEstadoEquipo.createMany({
    data: [
      { equipoId: camaraPerdida.id, estadoAnterior: 'EN_TERRENO', estadoNuevo: 'EN_MERMA', observacion: 'No retornó del Festival de bandas Penco', usuarioId: jefe.id, fecha: dia(-3, 9) },
      { equipoId: camaraPerdida.id, estadoAnterior: 'EN_MERMA', estadoNuevo: 'DADO_DE_BAJA', observacion: 'Baja por robo', usuarioId: jefe.id, fecha: dia(-3, 12) },
      { equipoId: equipos['Kit 3-MICROFONO'].id, estadoAnterior: 'EN_TERRENO', estadoNuevo: 'EN_MERMA', observacion: 'Cápsula golpeada en el Festival de bandas Penco', usuarioId: jefe.id, fecha: dia(-3, 9) },
    ],
  });
  await prisma.registroAuditoria.create({
    data: { usuarioId: jefe.id, accion: 'BAJA_EQUIPO', entidad: 'Equipo', entidadId: camaraPerdida.id, detalle: `Baja ${baja.id} por ROBO`, ip: '127.0.0.1', fechaHora: dia(-3, 12) },
  });

  const repuestos = [
    ['Cable HDMI 10 m', 'CABLE', 12, 5],
    ['Cable XLR 15 m', 'CABLE', 20, 8],
    ['Conector BNC', 'CONECTOR', 3, 5],
    ['Batería NP-F970', 'ACCESORIO', 6, 4],
    ['Cinta gaffer', 'OTRO', 2, 3],
  ];
  for (const [nombre, tipo, stock, stockMinimo] of repuestos) {
    const repuesto = await prisma.repuesto.create({ data: { nombre, tipo, stock, stockMinimo } });
    await prisma.movimientoRepuesto.create({
      data: { repuestoId: repuesto.id, tipo: 'ENTRADA', cantidad: stock + (nombre === 'Cable HDMI 10 m' ? 2 : 0), usuarioId: jefe.id, fecha: dia(-60, 10) },
    });
    if (nombre === 'Cable HDMI 10 m') {
      await prisma.movimientoRepuesto.create({
        data: { repuestoId: repuesto.id, tipo: 'SALIDA', cantidad: 2, transmisionId: transmisiones.final.id, usuarioId: jefe.id, fecha: dia(-1, 16) },
      });
    }
  }
};

const crearComprobante = async (contador, nombre, texto) => {
  const nombreArchivo = `seed-${nombre}.pdf`;
  const contenido = crearPdf(texto);
  fs.writeFileSync(path.join(CARPETA_SUBIDAS, nombreArchivo), contenido);
  return prisma.comprobante.create({
    data: {
      nombreOriginal: `${nombre}.pdf`,
      nombreArchivo,
      tipoMime: 'application/pdf',
      tamanoBytes: Buffer.byteLength(contenido),
      subidoPorId: contador.id,
    },
  });
};

const auditar = (usuario, accion, entidad, entidadId, detalle, fechaHora) =>
  prisma.registroAuditoria.create({ data: { usuarioId: usuario.id, accion, entidad, entidadId, detalle, ip: '127.0.0.1', fechaHora } });

const crearFinanzas = async (transmisiones, colaboradores, funciones, contador) => {
  const pagar = async (clave, tipo, monto, fecha, nombre) => {
    const comprobante = await crearComprobante(contador, nombre, `Comprobante de pago por ${monto} pesos`);
    const pago = await prisma.pago.create({
      data: { transmisionId: transmisiones[clave].id, tipo, monto, fechaPago: fecha, comprobanteId: comprobante.id, registradoPorId: contador.id },
    });
    const [accion, entidad, entidadId] = tipo === 'GARANTIA'
      ? ['GARANTIA_REGISTRADA', 'Transmision', transmisiones[clave].id]
      : ['COBRO_REGISTRADO', 'Pago', pago.id];
    await auditar(contador, accion, entidad, entidadId, `${tipo === 'GARANTIA' ? 'Garantía' : 'Cobro'} de ${monto}`, fecha);
  };
  const mitad = (clave) => Math.round(transmisiones[clave].valorTotal / 2);
  await pagar('clasico', 'GARANTIA', mitad('clasico'), dia(-42), 'garantia-clasico');
  await pagar('clasico', 'COBRO', transmisiones.clasico.valorTotal - mitad('clasico'), dia(-34), 'saldo-clasico');
  await pagar('titulacion', 'COBRO', transmisiones.titulacion.valorTotal, dia(-29), 'pago-titulacion');
  await pagar('festival', 'GARANTIA', mitad('festival'), dia(-12), 'garantia-festival');
  await pagar('final', 'GARANTIA', mitad('final'), dia(-2), 'garantia-final');

  const gastos = [
    ['clasico', 'PEAJE', 'Peaje ruta 150 ida y vuelta', 3400, dia(-35)],
    ['clasico', 'COLACION', 'Colación equipo técnico', 25000, dia(-35)],
    ['festival', 'IMPREVISTO', 'Compra de extensión eléctrica', 15000, dia(-4)],
    ['festival', 'COLACION', 'Colación equipo técnico', 30000, dia(-4)],
  ];
  for (const [indice, [clave, categoria, detalle, monto, fecha]] of gastos.entries()) {
    const comprobante = await crearComprobante(contador, `gasto-${indice + 1}`, detalle);
    const gasto = await prisma.gasto.create({
      data: { transmisionId: transmisiones[clave].id, categoria, detalle, monto, fecha, comprobanteId: comprobante.id, registradoPorId: contador.id },
    });
    await auditar(contador, 'GASTO_REGISTRADO', 'Gasto', gasto.id, `${categoria} por ${monto}`, fecha);
  }

  const captura = await crearComprobante(contador, 'uber-clasico', 'Uber Bodega Sixseven a Estadio Municipal 8900');
  const reembolso = await prisma.reembolso.create({
    data: {
      transmisionId: transmisiones.clasico.id, colaboradorId: colaboradores['Tomás Jara'].id,
      origen: 'Bodega Sixseven, Concepción', destino: 'Estadio Municipal de Concepción',
      montoSolicitado: 8900, montoCaptura: 8900, capturaId: captura.id, estado: 'APROBADO',
      registradoPorId: contador.id, fecha: dia(-34, 10),
    },
  });
  const capturaFestival = await crearComprobante(contador, 'uber-festival', 'Uber Bodega Sixseven a Anfiteatro Penco 12500');
  const reembolsoFestival = await prisma.reembolso.create({
    data: {
      transmisionId: transmisiones.festival.id, colaboradorId: colaboradores['Antonia Pérez'].id,
      origen: 'Bodega Sixseven, Concepción', destino: 'Anfiteatro Penco',
      montoSolicitado: 12500, montoCaptura: 12500, capturaId: capturaFestival.id, estado: 'APROBADO',
      registradoPorId: contador.id, fecha: dia(-3, 11),
    },
  });
  const rechazado = await prisma.reembolso.create({
    data: {
      transmisionId: transmisiones.festival.id, colaboradorId: colaboradores['Sebastián Castro'].id,
      origen: 'Bodega Sixseven, Concepción', destino: 'Anfiteatro Penco',
      montoSolicitado: 14000, estado: 'RECHAZADO', motivoRechazo: 'Falta la captura de pantalla del viaje',
      registradoPorId: contador.id, fecha: dia(-3, 11, 30),
    },
  });
  for (const [registro, accion] of [[reembolso, 'REEMBOLSO_APROBADO'], [reembolsoFestival, 'REEMBOLSO_APROBADO'], [rechazado, 'REEMBOLSO_RECHAZADO']]) {
    await auditar(contador, accion, 'Reembolso', registro.id, `Monto ${registro.montoSolicitado}`, registro.fecha);
  }

  const mesAnterior = new Date(HOY.getFullYear(), HOY.getMonth() - 1, 5);
  const comprobanteStarlink = await crearComprobante(contador, 'starlink-anterior', 'Factura Starlink 50000');
  const starlink = await prisma.pagoStarlink.create({
    data: { periodo: periodo(mesAnterior), monto: 50000, fechaPago: mesAnterior, comprobanteId: comprobanteStarlink.id, registradoPorId: contador.id },
  });
  await auditar(contador, 'STARLINK_REGISTRADO', 'PagoStarlink', starlink.id, `Período ${starlink.periodo}`, mesAnterior);

  const periodoClasico = periodo(transmisiones.clasico.inicio);
  const liquidacion = await prisma.liquidacion.create({
    data: { periodo: periodoClasico, generadaPorId: contador.id, generadaEn: new Date(HOY.getFullYear(), HOY.getMonth(), 1, 10) },
  });
  const finalizadas = await prisma.transmision.findMany({
    where: { estado: 'FINALIZADA', inicio: { gte: new Date(`${periodoClasico}-01T00:00:00`) } },
    include: { asignaciones: { where: { asistio: true } } },
  });
  for (const transmision of finalizadas.filter((t) => periodo(t.inicio) === periodoClasico)) {
    for (const asignacion of transmision.asignaciones) {
      const pagada = asignacion.colaboradorId === colaboradores['Tomás Jara'].id;
      const linea = await prisma.lineaLiquidacion.create({
        data: {
          liquidacionId: liquidacion.id,
          colaboradorId: asignacion.colaboradorId,
          transmisionId: transmision.id,
          funcionId: asignacion.funcionEfectivaId,
          porcentaje: asignacion.porcentajeComision,
          baseCalculo: transmision.valorTotal,
          monto: Math.round((transmision.valorTotal * asignacion.porcentajeComision) / 100),
          estado: pagada ? 'PAGADA' : 'PENDIENTE',
          pagadaEn: pagada ? dia(-2, 12) : null,
          pagadaPorId: pagada ? contador.id : null,
        },
      });
      if (pagada) await auditar(contador, 'COMISION_PAGADA', 'LineaLiquidacion', linea.id, `Comisión de ${linea.monto}`, linea.pagadaEn);
    }
  }
  return funciones;
};

const crearAuspicios = async (transmisiones, dueno) => {
  const marcas = {};
  for (const [nombre, contacto, telefono] of [
    ['Carnicería El Novillo', 'Luis Barra', '+56922220001'],
    ['Aguas Cordillera', 'Marcela Soto', '+56922220002'],
    ['Ferretería Biobío', 'Hugo Paredes', '+56922220003'],
    ['Pizzería Don Leo', 'Leonardo Fica', '+56922220004'],
  ]) {
    marcas[nombre] = await prisma.auspiciador.create({ data: { nombre, contacto, telefono } });
  }
  const acuerdos = [
    {
      marca: 'Carnicería El Novillo', clave: 'clasico', tipoAporte: 'CANJE', glosa: 'Entrega 8 kg de carne para el asado del equipo a cambio de 3 menciones durante la transmisión',
      fechaComprometida: dia(-36), estado: 'CUMPLIDO', fechaRecepcion: dia(-36), detalleRecibido: '8 kg de carne entregados en bodega',
    },
    {
      marca: 'Ferretería Biobío', clave: 'clasico', tipoAporte: 'MONETARIO', montoComprometido: 20000,
      glosa: 'Aporte de 20.000 pesos a cambio de logo en pantalla durante el entretiempo', fechaComprometida: dia(-25),
    },
    {
      marca: 'Pizzería Don Leo', clave: 'festival', tipoAporte: 'MONETARIO', montoComprometido: 30000,
      glosa: 'Aporte de 30.000 pesos a cambio de 2 menciones del animador', fechaComprometida: dia(-5),
      estado: 'CUMPLIDO', fechaRecepcion: dia(-4), montoRecibido: 30000,
    },
    {
      marca: 'Aguas Cordillera', clave: 'final', tipoAporte: 'CANJE', glosa: 'Entrega 4 packs de agua para hidratación del equipo a cambio de mención al inicio',
      fechaComprometida: dia(2),
    },
    {
      marca: 'Pizzería Don Leo', clave: 'final', tipoAporte: 'MONETARIO', montoComprometido: 25000,
      glosa: 'Aporte de 25.000 pesos a cambio de banner en la transmisión', fechaComprometida: dia(-1),
    },
  ];
  for (const acuerdo of acuerdos) {
    const { marca, clave, ...datos } = acuerdo;
    await prisma.acuerdoAuspicio.create({
      data: { ...datos, auspiciadorId: marcas[marca].id, transmisionId: transmisiones[clave].id, registradoPorId: dueno.id },
    });
  }
  await prisma.auspiciador.update({ where: { id: marcas['Ferretería Biobío'].id }, data: { enListaNegra: true } });
  await prisma.historialListaNegra.create({
    data: {
      auspiciadorId: marcas['Ferretería Biobío'].id, accion: 'MARCADO',
      motivo: 'No pagó el aporte comprometido para el Clásico regional', usuarioId: dueno.id, fecha: dia(-20, 9),
    },
  });
};

const main = async () => {
  await limpiar();
  const [dueno, contador, jefe] = await crearUsuarios();
  await crearParametros();
  const funciones = await crearFunciones();
  const clientes = await crearClientes();
  const transmisiones = await crearTransmisiones(clientes, funciones, dueno);
  const colaboradores = await crearColaboradores(funciones);
  await crearAsignaciones(transmisiones, colaboradores, funciones);
  await crearInventario(transmisiones, colaboradores, jefe);
  await crearFinanzas(transmisiones, colaboradores, funciones, contador);
  await crearAuspicios(transmisiones, dueno);
  console.log('Datos de ejemplo cargados');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());