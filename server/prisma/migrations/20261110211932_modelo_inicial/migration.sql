-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DUENO', 'CONTADOR', 'JEFE_TECNICO');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('DEPORTIVO', 'ACADEMICO', 'CULTURAL', 'CORPORATIVO');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('BASICO', 'COMPLEJO');

-- CreateEnum
CREATE TYPE "EstadoTransmision" AS ENUM ('COTIZADA', 'AUTORIZADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('GARANTIA', 'COBRO');

-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('POR_CONFIRMAR', 'CONFIRMADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoEquipo" AS ENUM ('CAMARA', 'TRIPODE', 'MICROFONO', 'SWITCH', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('OPERATIVO', 'EN_REPARACION', 'RESERVADO', 'EN_TERRENO', 'EN_MERMA', 'DADO_DE_BAJA');

-- CreateEnum
CREATE TYPE "CausaBaja" AS ENUM ('DANO', 'ROBO', 'EXTRAVIO');

-- CreateEnum
CREATE TYPE "EstadoRetorno" AS ENUM ('RECIBIDO', 'DANADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "TipoRepuesto" AS ENUM ('CABLE', 'CONECTOR', 'ACCESORIO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('PEAJE', 'COLACION', 'IMPREVISTO');

-- CreateEnum
CREATE TYPE "EstadoReembolso" AS ENUM ('APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoLinea" AS ENUM ('PENDIENTE', 'PAGADA');

-- CreateEnum
CREATE TYPE "TipoAporte" AS ENUM ('MONETARIO', 'CANJE');

-- CreateEnum
CREATE TYPE "EstadoAcuerdo" AS ENUM ('PENDIENTE', 'CUMPLIDO');

-- CreateEnum
CREATE TYPE "AccionListaNegra" AS ENUM ('MARCADO', 'REGULARIZADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(120) NOT NULL,
    "contrasenaHash" VARCHAR(100) NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_auditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" VARCHAR(60) NOT NULL,
    "entidad" VARCHAR(60) NOT NULL,
    "entidadId" INTEGER NOT NULL,
    "detalle" TEXT,
    "ip" VARCHAR(64) NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros" (
    "clave" VARCHAR(60) NOT NULL,
    "valor" VARCHAR(200) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,

    CONSTRAINT "parametros_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "comprobantes" (
    "id" SERIAL NOT NULL,
    "nombreOriginal" VARCHAR(200) NOT NULL,
    "nombreArchivo" VARCHAR(200) NOT NULL,
    "tipoMime" VARCHAR(100) NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "subidoPorId" INTEGER NOT NULL,
    "subidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "contacto" VARCHAR(120),
    "telefono" VARCHAR(20),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funciones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "tarifaHora" INTEGER NOT NULL,
    "porcentajeComision" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "funciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transmisiones" (
    "id" SERIAL NOT NULL,
    "nombreEvento" VARCHAR(150) NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tipoEvento" "TipoEvento" NOT NULL,
    "tipoServicio" "TipoServicio" NOT NULL,
    "recinto" VARCHAR(150) NOT NULL,
    "comuna" VARCHAR(80) NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "cantidadKits" INTEGER NOT NULL,
    "kitsUltimaGeneracion" BOOLEAN NOT NULL DEFAULT false,
    "valorBase" INTEGER NOT NULL,
    "recargo" INTEGER NOT NULL,
    "valorTotal" INTEGER NOT NULL,
    "estado" "EstadoTransmision" NOT NULL DEFAULT 'COTIZADA',
    "creadoPorId" INTEGER NOT NULL,
    "autorizadoPorId" INTEGER,
    "autorizadoEn" TIMESTAMP(3),
    "cerradoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transmisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requerimientos_funcion" (
    "transmisionId" INTEGER NOT NULL,
    "funcionId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "requerimientos_funcion_pkey" PRIMARY KEY ("transmisionId","funcionId")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "monto" INTEGER NOT NULL,
    "fechaPago" DATE NOT NULL,
    "comprobanteId" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "correo" VARCHAR(120),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaborador_funciones" (
    "colaboradorId" INTEGER NOT NULL,
    "funcionId" INTEGER NOT NULL,

    CONSTRAINT "colaborador_funciones_pkey" PRIMARY KEY ("colaboradorId","funcionId")
);

-- CreateTable
CREATE TABLE "disponibilidades" (
    "id" SERIAL NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" SERIAL NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    "funcionId" INTEGER NOT NULL,
    "porcentajeComision" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoAsignacion" NOT NULL DEFAULT 'POR_CONFIRMAR',
    "asistio" BOOLEAN,
    "funcionEfectivaId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEn" TIMESTAMP(3),

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoEquipo" NOT NULL,
    "marca" VARCHAR(60) NOT NULL,
    "modelo" VARCHAR(80) NOT NULL,
    "numeroSerie" VARCHAR(60) NOT NULL,
    "fechaIngreso" DATE NOT NULL,
    "valorReposicion" INTEGER NOT NULL,
    "ultimaGeneracion" BOOLEAN NOT NULL DEFAULT false,
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'OPERATIVO',
    "kitId" INTEGER,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados_equipo" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "estadoAnterior" "EstadoEquipo" NOT NULL,
    "estadoNuevo" "EstadoEquipo" NOT NULL,
    "observacion" VARCHAR(300) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bajas" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "causa" "CausaBaja" NOT NULL,
    "descripcion" VARCHAR(300) NOT NULL,
    "transmisionId" INTEGER,
    "kitAnteriorId" INTEGER,
    "valorPerdida" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bajas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" "TipoRepuesto" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_repuesto" (
    "id" SERIAL NOT NULL,
    "repuestoId" INTEGER NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "transmisionId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_kit" (
    "id" SERIAL NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "kitId" INTEGER NOT NULL,
    "responsableId" INTEGER,
    "salidaEn" TIMESTAMP(3),
    "retornoEn" TIMESTAMP(3),
    "registradoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_kit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_salida" (
    "asignacionKitId" INTEGER NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "estadoRetorno" "EstadoRetorno",

    CONSTRAINT "detalles_salida_pkey" PRIMARY KEY ("asignacionKitId","equipoId")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "detalle" VARCHAR(200) NOT NULL,
    "monto" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "comprobanteId" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reembolsos" (
    "id" SERIAL NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    "origen" VARCHAR(150) NOT NULL,
    "destino" VARCHAR(150) NOT NULL,
    "montoSolicitado" INTEGER NOT NULL,
    "montoCaptura" INTEGER,
    "capturaId" INTEGER,
    "estado" "EstadoReembolso" NOT NULL,
    "motivoRechazo" VARCHAR(300),
    "registradoPorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reembolsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_starlink" (
    "id" SERIAL NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "monto" INTEGER NOT NULL,
    "fechaPago" DATE NOT NULL,
    "comprobanteId" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_starlink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidaciones" (
    "id" SERIAL NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "generadaPorId" INTEGER NOT NULL,
    "generadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_liquidacion" (
    "id" SERIAL NOT NULL,
    "liquidacionId" INTEGER NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "funcionId" INTEGER NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "baseCalculo" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "estado" "EstadoLinea" NOT NULL DEFAULT 'PENDIENTE',
    "pagadaEn" TIMESTAMP(3),
    "pagadaPorId" INTEGER,

    CONSTRAINT "lineas_liquidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auspiciadores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "contacto" VARCHAR(120),
    "telefono" VARCHAR(20),
    "enListaNegra" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auspiciadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acuerdos_auspicio" (
    "id" SERIAL NOT NULL,
    "auspiciadorId" INTEGER NOT NULL,
    "transmisionId" INTEGER NOT NULL,
    "glosa" TEXT NOT NULL,
    "tipoAporte" "TipoAporte" NOT NULL,
    "montoComprometido" INTEGER,
    "fechaComprometida" DATE NOT NULL,
    "estado" "EstadoAcuerdo" NOT NULL DEFAULT 'PENDIENTE',
    "fechaRecepcion" DATE,
    "montoRecibido" INTEGER,
    "detalleRecibido" VARCHAR(300),
    "registradoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acuerdos_auspicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_lista_negra" (
    "id" SERIAL NOT NULL,
    "auspiciadorId" INTEGER NOT NULL,
    "accion" "AccionListaNegra" NOT NULL,
    "motivo" VARCHAR(300) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_lista_negra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "registros_auditoria_entidad_entidadId_idx" ON "registros_auditoria"("entidad", "entidadId");

-- CreateIndex
CREATE UNIQUE INDEX "comprobantes_nombreArchivo_key" ON "comprobantes"("nombreArchivo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_nombre_key" ON "clientes"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "funciones_nombre_key" ON "funciones"("nombre");

-- CreateIndex
CREATE INDEX "transmisiones_inicio_idx" ON "transmisiones"("inicio");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_comprobanteId_key" ON "pagos"("comprobanteId");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_rut_key" ON "colaboradores"("rut");

-- CreateIndex
CREATE INDEX "disponibilidades_colaboradorId_inicio_idx" ON "disponibilidades"("colaboradorId", "inicio");

-- CreateIndex
CREATE INDEX "asignaciones_colaboradorId_idx" ON "asignaciones"("colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "kits_nombre_key" ON "kits"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_numeroSerie_key" ON "equipos"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "bajas_equipoId_key" ON "bajas"("equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "repuestos_nombre_key" ON "repuestos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_kit_transmisionId_kitId_key" ON "asignaciones_kit"("transmisionId", "kitId");

-- CreateIndex
CREATE UNIQUE INDEX "gastos_comprobanteId_key" ON "gastos"("comprobanteId");

-- CreateIndex
CREATE UNIQUE INDEX "reembolsos_capturaId_key" ON "reembolsos"("capturaId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_starlink_periodo_key" ON "pagos_starlink"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_starlink_comprobanteId_key" ON "pagos_starlink"("comprobanteId");

-- CreateIndex
CREATE UNIQUE INDEX "liquidaciones_periodo_key" ON "liquidaciones"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "auspiciadores_nombre_key" ON "auspiciadores"("nombre");

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transmisiones" ADD CONSTRAINT "transmisiones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transmisiones" ADD CONSTRAINT "transmisiones_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transmisiones" ADD CONSTRAINT "transmisiones_autorizadoPorId_fkey" FOREIGN KEY ("autorizadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_funcion" ADD CONSTRAINT "requerimientos_funcion_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_funcion" ADD CONSTRAINT "requerimientos_funcion_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "comprobantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador_funciones" ADD CONSTRAINT "colaborador_funciones_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador_funciones" ADD CONSTRAINT "colaborador_funciones_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_funcionEfectivaId_fkey" FOREIGN KEY ("funcionEfectivaId") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_equipo" ADD CONSTRAINT "historial_estados_equipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_equipo" ADD CONSTRAINT "historial_estados_equipo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas" ADD CONSTRAINT "bajas_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas" ADD CONSTRAINT "bajas_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas" ADD CONSTRAINT "bajas_kitAnteriorId_fkey" FOREIGN KEY ("kitAnteriorId") REFERENCES "kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas" ADD CONSTRAINT "bajas_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_repuesto" ADD CONSTRAINT "movimientos_repuesto_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "repuestos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_repuesto" ADD CONSTRAINT "movimientos_repuesto_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_repuesto" ADD CONSTRAINT "movimientos_repuesto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_kit" ADD CONSTRAINT "asignaciones_kit_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_kit" ADD CONSTRAINT "asignaciones_kit_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_kit" ADD CONSTRAINT "asignaciones_kit_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_kit" ADD CONSTRAINT "asignaciones_kit_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_salida" ADD CONSTRAINT "detalles_salida_asignacionKitId_fkey" FOREIGN KEY ("asignacionKitId") REFERENCES "asignaciones_kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_salida" ADD CONSTRAINT "detalles_salida_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "comprobantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_capturaId_fkey" FOREIGN KEY ("capturaId") REFERENCES "comprobantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_starlink" ADD CONSTRAINT "pagos_starlink_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "comprobantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_starlink" ADD CONSTRAINT "pagos_starlink_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_generadaPorId_fkey" FOREIGN KEY ("generadaPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_liquidacion" ADD CONSTRAINT "lineas_liquidacion_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "liquidaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_liquidacion" ADD CONSTRAINT "lineas_liquidacion_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_liquidacion" ADD CONSTRAINT "lineas_liquidacion_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_liquidacion" ADD CONSTRAINT "lineas_liquidacion_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_liquidacion" ADD CONSTRAINT "lineas_liquidacion_pagadaPorId_fkey" FOREIGN KEY ("pagadaPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acuerdos_auspicio" ADD CONSTRAINT "acuerdos_auspicio_auspiciadorId_fkey" FOREIGN KEY ("auspiciadorId") REFERENCES "auspiciadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acuerdos_auspicio" ADD CONSTRAINT "acuerdos_auspicio_transmisionId_fkey" FOREIGN KEY ("transmisionId") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acuerdos_auspicio" ADD CONSTRAINT "acuerdos_auspicio_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_lista_negra" ADD CONSTRAINT "historial_lista_negra_auspiciadorId_fkey" FOREIGN KEY ("auspiciadorId") REFERENCES "auspiciadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_lista_negra" ADD CONSTRAINT "historial_lista_negra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
