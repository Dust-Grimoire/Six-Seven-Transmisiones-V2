import { Descriptions, Divider, Drawer, Spin, Table, Tag, Timeline } from 'antd';
import SituacionAcuerdo from './SituacionAcuerdo.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { obtenerHistorial } from '../../services/auspicios.service.js';
import { fechaDia, fechaHora, pesos } from '../../utils/formato.js';
import { TIPOS_APORTE } from '../../utils/etiquetas.js';

function HistorialAuspiciador({ auspiciadorId, onCerrar }) {
  const { datos: ficha, cargando } = useDatos(() => obtenerHistorial(auspiciadorId), [auspiciadorId]);

  const columnas = [
    { title: 'Transmisión', dataIndex: ['transmision', 'nombreEvento'] },
    { title: 'Tipo', dataIndex: 'tipoAporte', render: (v) => TIPOS_APORTE[v] },
    {
      title: 'Comprometido',
      render: (_, a) => (a.tipoAporte === 'MONETARIO' ? pesos(a.montoComprometido) : 'Canje'),
    },
    { title: 'Fecha comprometida', dataIndex: 'fechaComprometida', render: fechaDia },
    { title: 'Situación', render: (_, a) => <SituacionAcuerdo acuerdo={a} /> },
    {
      title: 'Recibido',
      render: (_, a) =>
        a.estado === 'CUMPLIDO'
          ? `${fechaDia(a.fechaRecepcion)} ${a.montoRecibido ? pesos(a.montoRecibido) : a.detalleRecibido}`
          : '—',
    },
  ];

  return (
    <Drawer title={ficha?.nombre ?? 'Auspiciador'} width={860} open onClose={onCerrar}>
      {cargando || !ficha ? (
        <Spin />
      ) : (
        <>
          <Descriptions size="small" bordered column={3}>
            <Descriptions.Item label="Estado">
              {ficha.enListaNegra ? <Tag color="red">En Lista Negra</Tag> : <Tag color="green">Habilitado</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Contacto">{ficha.contacto ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{ficha.telefono ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Acuerdos">{ficha.cumplimiento.total}</Descriptions.Item>
            <Descriptions.Item label="Cumplidos">{ficha.cumplimiento.cumplidos}</Descriptions.Item>
            <Descriptions.Item label="Vencidos">{ficha.cumplimiento.vencidos}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" plain>Acuerdos</Divider>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            columns={columnas}
            dataSource={ficha.acuerdos}
            expandable={{ expandedRowRender: (a) => a.glosa }}
          />

          <Divider orientation="left" plain>Antecedentes de lista negra</Divider>
          <Timeline
            items={ficha.historial.map((h) => ({
              color: h.accion === 'MARCADO' ? 'red' : 'green',
              children: `${fechaHora(h.fecha)} · ${h.accion === 'MARCADO' ? 'Marcado como moroso' : 'Regularizado'} por ${h.usuario.nombre}: ${h.motivo}`,
            }))}
          />
          {ficha.historial.length === 0 && 'Sin antecedentes'}
        </>
      )}
    </Drawer>
  );
}

export default HistorialAuspiciador;