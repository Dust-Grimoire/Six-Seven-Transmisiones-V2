const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export const CLAVE_USUARIO = 'sixseven.usuarioId';

const cabecerasSesion = () => {
  const usuarioId = localStorage.getItem(CLAVE_USUARIO);
  return usuarioId ? { 'x-usuario-id': usuarioId } : {};
};

const leerError = async (respuesta) => {
  try {
    const cuerpo = await respuesta.json();
    const detalle = cuerpo.detalles?.map((d) => d.mensaje).join('. ');
    return detalle ? `${cuerpo.error}: ${detalle}` : cuerpo.error;
  } catch {
    return 'No fue posible comunicarse con el servidor';
  }
};

const enviar = async (ruta, opciones) => {
  const respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta));
  }
  return respuesta;
};

export const apiFetch = async (ruta, { method = 'GET', body } = {}) => {
  const respuesta = await enviar(ruta, {
    method,
    headers: { 'Content-Type': 'application/json', ...cabecerasSesion() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return respuesta.status === 204 ? null : respuesta.json();
};

export const apiSubir = async (ruta, archivo) => {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  const respuesta = await enviar(ruta, { method: 'POST', headers: cabecerasSesion(), body: formulario });
  return respuesta.json();
};

export const apiDescargar = async (ruta) => {
  const respuesta = await enviar(ruta, { headers: cabecerasSesion() });
  return respuesta.blob();
};

export const conFiltros = (ruta, filtros = {}) => {
  const parametros = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''),
  );
  const consulta = parametros.toString();
  return consulta ? `${ruta}?${consulta}` : ruta;
};