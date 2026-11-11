import { Badge, Calendar } from 'antd';
import dayjs from 'dayjs';
import { hora } from '../../utils/formato.js';

const COLOR_ESTADO = { COTIZADA: 'processing', AUTORIZADA: 'success', FINALIZADA: 'default' };

function CalendarioTransmisiones({ mes, transmisiones, onCambiarMes, onSeleccionar }) {
  const renderizarDia = (fecha, info) => {
    if (info.type !== 'date') return info.originNode;
    const delDia = transmisiones.filter((t) => dayjs(t.inicio).isSame(fecha, 'day'));
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {delDia.map((t) => (
          <li key={t.id} onClick={() => onSeleccionar(t.id)} style={{ cursor: 'pointer' }}>
            <Badge status={COLOR_ESTADO[t.estado]} text={`${hora(t.inicio)} ${t.nombreEvento}`} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Calendar
      value={mes.isSame(dayjs(), 'month') ? dayjs() : mes}
      cellRender={renderizarDia}
      onPanelChange={(fecha) => onCambiarMes(fecha)}
      onSelect={(fecha, { source }) => source === 'date' && !fecha.isSame(mes, 'month') && onCambiarMes(fecha)}
    />
  );
}

export default CalendarioTransmisiones;