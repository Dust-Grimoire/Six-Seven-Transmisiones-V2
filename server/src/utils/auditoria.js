export const registrarAuditoria = (tx, contexto, accion, entidad, entidadId, detalle) =>
  tx.registroAuditoria.create({
    data: {
      usuarioId: contexto.usuarioId,
      ip: contexto.ip,
      accion,
      entidad,
      entidadId,
      detalle,
    },
  });

export const contextoDe = (req) => ({ usuarioId: req.usuario.id, ip: req.ip ?? 'desconocida' });