import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { listarUsuariosDePrueba } from '../services/sesion.service.js';
import { CLAVE_USUARIO } from '../services/api.js';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState(() => Number(localStorage.getItem(CLAVE_USUARIO)) || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarUsuariosDePrueba()
      .then((lista) => {
        setUsuarios(lista);
        const guardado = Number(localStorage.getItem(CLAVE_USUARIO));
        if (!lista.some((u) => u.id === guardado) && lista.length > 0) {
          localStorage.setItem(CLAVE_USUARIO, String(lista[0].id));
          setUsuarioId(lista[0].id);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  const cambiarUsuario = useCallback((id) => {
    localStorage.setItem(CLAVE_USUARIO, String(id));
    setUsuarioId(id);
  }, []);

  const valor = useMemo(
    () => ({ usuarios, usuario: usuarios.find((u) => u.id === usuarioId) ?? null, cambiarUsuario, error }),
    [usuarios, usuarioId, cambiarUsuario, error],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export const useSesion = () => useContext(SesionContext);