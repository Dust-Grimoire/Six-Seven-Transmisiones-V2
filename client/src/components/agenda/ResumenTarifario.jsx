import { Alert, Descriptions, Table } from 'antd';
import { pesos } from '../../utils/formato.js';

function ResumenTarifario({ resumen }) {
  const columnas = [
    { title: 'Función', dataIndex: 'nombre' },
    { title: 'Cantidad', dataIndex: 'cantidad', align: 'right' },
    { title: 'Valor hora', dataIndex: 'tarifaHora', render: pesos, align: 'right' },
    { title: 'Subtotal', dataIndex: 'subtotal', render: pesos, align: 'right' },
  ];

  return (
    <>
      <Table rowKey="nombre" size="small" columns={columnas} dataSource={resumen.detalle} pagination={false} />
      <Descriptions size="small" column={1} bordered style={{ marginTop: 12 }}>
        <Descriptions.Item label={`Personal (${resumen.horas} h)`}>{pesos(resumen.subtotalPersonal)}</Descriptions.Item>
        <Descriptions.Item label="Kits de inventario">{pesos(resumen.subtotalEquipos)}</Descriptions.Item>
        <Descriptions.Item label="Valor base">{pesos(resumen.valorBase)}</Descriptions.Item>
        <Descriptions.Item label={`Recargo última generación (${resumen.porcentajeRecargo} %)`}>
          {pesos(resumen.recargo)}
        </Descriptions.Item>
        <Descriptions.Item label="Valor total cotizado">
          <strong>{pesos(resumen.valorTotal)}</strong>
        </Descriptions.Item>
      </Descriptions>
      {resumen.requiereGarantia && (
        <Alert
          style={{ marginTop: 12 }}
          type="warning"
          showIcon
          message={`Requiere garantía por adelantado de ${pesos(resumen.montoGarantia)} antes de autorizar la salida a terreno`}
        />
      )}
    </>
  );
}

export default ResumenTarifario;