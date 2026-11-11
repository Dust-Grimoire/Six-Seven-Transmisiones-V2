import { Table } from 'antd';
import EstadoEtiqueta from '../ui/EstadoEtiqueta.jsx';
import { fechaHora, pesos } from '../../utils/formato.js';
import { TIPOS_EVENTO } from '../../utils/etiquetas.js';

function TablaTransmisiones({ transmisiones, cargando, onSeleccionar }) {
  const columnas = [
    { title: 'Fecha', dataIndex: 'inicio', render: fechaHora, width: 150 },
    { title: 'Evento', dataIndex: 'nombreEvento' },
    { title: 'Cliente', dataIndex: ['cliente', 'nombre'] },
    { title: 'Tipo', dataIndex: 'tipoEvento', render: (valor) => TIPOS_EVENTO[valor] },
    { title: 'Recinto', dataIndex: 'recinto' },
    { title: 'Estado', dataIndex: 'estado', render: (valor) => <EstadoEtiqueta tipo="transmision" valor={valor} /> },
    { title: 'Garantía', dataIndex: 'garantia', render: (valor) => <EstadoEtiqueta tipo="garantia" valor={valor} /> },
    { title: 'Valor', dataIndex: 'valorTotal', render: pesos, align: 'right' },
  ];

  return (
    <Table
      rowKey="id"
      size="small"
      columns={columnas}
      dataSource={transmisiones}
      loading={cargando}
      pagination={false}
      locale={{ emptyText: 'No hay transmisiones registradas en el mes' }}
      onRow={(fila) => ({ onClick: () => onSeleccionar(fila.id), style: { cursor: 'pointer' } })}
    />
  );
}

export default TablaTransmisiones;