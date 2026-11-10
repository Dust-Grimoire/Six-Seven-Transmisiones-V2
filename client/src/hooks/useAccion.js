import { useState } from 'react';
import { App } from 'antd';

export function useAccion() {
  const { message } = App.useApp();
  const [ejecutando, setEjecutando] = useState(false);

  const ejecutar = async (accion, mensajeExito) => {
    setEjecutando(true);
    try {
      const resultado = await accion();
      if (mensajeExito) {
        message.success(mensajeExito);
      }
      return resultado ?? true;
    } catch (error) {
      message.error(error.message);
      return null;
    } finally {
      setEjecutando(false);
    }
  };

  return { ejecutar, ejecutando };
}