import { useCallback, useEffect, useState } from 'react';
import { App } from 'antd';

export function useDatos(cargar, dependencias = []) {
  const { message } = App.useApp();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await cargar());
    } catch (error) {
      message.error(error.message);
    } finally {
      setCargando(false);
    }
  }, dependencias);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, cargando, recargar };
}