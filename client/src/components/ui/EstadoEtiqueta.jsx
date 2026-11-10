import { Tag } from 'antd';
import { ESTADOS } from '../../utils/etiquetas.js';

function EstadoEtiqueta({ tipo, valor }) {
  const [texto, color] = ESTADOS[tipo]?.[valor] ?? [valor, 'default'];
  return <Tag color={color}>{texto}</Tag>;
}

export default EstadoEtiqueta;