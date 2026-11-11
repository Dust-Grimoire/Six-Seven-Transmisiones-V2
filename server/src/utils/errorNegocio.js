export class ErrorNegocio extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}

export const noEncontrado = (mensaje) => new ErrorNegocio(404, mensaje);
export const conflicto = (mensaje) => new ErrorNegocio(409, mensaje);
export const solicitudInvalida = (mensaje) => new ErrorNegocio(400, mensaje);