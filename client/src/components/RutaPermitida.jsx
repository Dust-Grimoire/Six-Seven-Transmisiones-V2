import { Result, Spin } from 'antd';
import { useSesion } from '../context/SesionContext.jsx';

function RutaPermitida({ roles, children }) {
  const { usuario, error } = useSesion();

  if (error) {
    return <Result status="error" title="No fue posible conectar con el servidor" subTitle={error} />;
  }
  if (!usuario) {
    return <Spin size="large" style={{ display: 'block', marginTop: 80 }} />;
  }
  if (!roles.includes(usuario.rol)) {
    return <Result status="403" title="Sección no disponible" subTitle="Su perfil no tiene acceso a este módulo." />;
  }
  return children;
}

export default RutaPermitida;
