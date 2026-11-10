import { Select, Space, Typography } from 'antd';
import { useSesion } from '../context/SesionContext.jsx';
import { ROLES } from '../utils/etiquetas.js';

function SelectorSesion() {
  const { usuarios, usuario, cambiarUsuario } = useSesion();

  return (
    <Space>
      <Typography.Text type="secondary">Trabajando como</Typography.Text>
      <Select
        style={{ width: 260 }}
        value={usuario?.id}
        onChange={cambiarUsuario}
        options={usuarios.map((u) => ({ value: u.id, label: `${u.nombre} (${ROLES[u.rol]})` }))}
      />
    </Space>
  );
}

export default SelectorSesion;