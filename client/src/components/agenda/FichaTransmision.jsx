import { useState } from 'react';
import { Alert, Button, Descriptions, Divider, Drawer, Popconfirm, Space, Spin, Table } from 'antd';
import EstadoEtiqueta from '../ui/EstadoEtiqueta.jsx';
import FormularioGarantia from './FormularioGarantia.jsx';
import FormularioCierre from './FormularioCierre.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { useAccion } from '../../hooks/useAccion.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { autorizarTransmision, obtenerFicha } from '../../services/agenda.service.js';
import { abrirComprobante } from '../../services/comprobantes.service.js';
import { fecha, fechaDia, fechaHora, pesos } from '../../utils/formato.js';
import { TIPOS_EVENTO, TIPOS_SERVICIO } from '../../utils/etiquetas.js';

function FichaTransmision({ transmisionId, onCerrar, onActualizada }) {
  const { usuario } = useSesion();
  const { ejecutar, ejecutando } = useAccion();
  const { datos: ficha, cargando, recargar } = useDatos(() => obtenerFicha(transmisionId), [transmisionId]);
  const [modal, setModal] = useState(null);

  const esDueno = usuario?.rol === 'DUENO';
  const esContador = usuario?.rol === 'CONTADOR';

  const refrescar = () => {
    setModal(null);
    recargar();
    onActualizada();
  };

  const autorizar = async () => {
    const resultado = await ejecutar(() => autorizarTransmision(transmisionId), 'Transmisión Autorizada a Terreno');
    if (resultado) refrescar();
  };

  const acciones = ficha && (
    <Space>
      {esContador && ficha.garantia.estado === 'PENDIENTE' && ficha.estado !== 'FINALIZADA' && (
        <Button onClick={() => setModal('garantia')}>Registrar garantía</Button>
      )}
      {esDueno && ficha.estado === 'COTIZADA' && (
        <Popconfirm title="¿Aprobar la cotización y autorizar la salida a terreno?" onConfirm={autorizar} okText="Autorizar" cancelText="Cancelar">
          <Button type="primary" loading={ejecutando}>
            Autorizar
          </Button>
        </Popconfirm>
      )}
      {esDueno && ficha.estado === 'AUTORIZADA' && (
        <Button type="primary" onClick={() => setModal('cierre')}>
          Cerrar transmisión
        </Button>
      )}
    </Space>
  );

  return (
    <Drawer title={ficha?.nombreEvento ?? 'Transmisión'} width={760} open onClose={onCerrar} extra={acciones}>
      {cargando || !ficha ? (
        <Spin />
      ) : (
        <>
          {ficha.estado === 'COTIZADA' && ficha.garantia.estado === 'PENDIENTE' && (
            <Alert type="error" showIcon style={{ marginBottom: 16 }} message={`Garantía pendiente: se requiere ${pesos(ficha.garantia.monto)} antes de autorizar`} />
          )}
          <Descriptions size="small" bordered column={2}>
            <Descriptions.Item label="Estado">
              <EstadoEtiqueta tipo="transmision" valor={ficha.estado} />
            </Descriptions.Item>
            <Descriptions.Item label="Garantía">
              <EstadoEtiqueta tipo="garantia" valor={ficha.garantia.estado} />
            </Descriptions.Item>
            <Descriptions.Item label="Cliente">{ficha.cliente.nombre}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{`${TIPOS_EVENTO[ficha.tipoEvento]} · ${TIPOS_SERVICIO[ficha.tipoServicio]}`}</Descriptions.Item>
            <Descriptions.Item label="Inicio">{fechaHora(ficha.inicio)}</Descriptions.Item>
            <Descriptions.Item label="Duración">{`${ficha.duracionHoras} horas`}</Descriptions.Item>
            <Descriptions.Item label="Recinto" span={2}>{`${ficha.recinto}, ${ficha.comuna}`}</Descriptions.Item>
            <Descriptions.Item label="Kits cotizados">
              {`${ficha.cantidadKits}${ficha.kitsUltimaGeneracion ? ' de última generación' : ''}`}
            </Descriptions.Item>
            <Descriptions.Item label="Personal requerido">
              {ficha.requerimientos.map((r) => `${r.cantidad} ${r.funcion.nombre}`).join(', ')}
            </Descriptions.Item>
            <Descriptions.Item label="Valor base">{pesos(ficha.valorBase)}</Descriptions.Item>
            <Descriptions.Item label="Recargo">{pesos(ficha.recargo)}</Descriptions.Item>
            <Descriptions.Item label="Valor total">{pesos(ficha.valorTotal)}</Descriptions.Item>
            <Descriptions.Item label="Saldo por cobrar">{pesos(ficha.saldoPendiente)}</Descriptions.Item>
            <Descriptions.Item label="Cotizado por">{`${ficha.creadoPor.nombre}, ${fecha(ficha.creadoEn)}`}</Descriptions.Item>
            <Descriptions.Item label="Autorizado por">
              {ficha.autorizadoPor ? `${ficha.autorizadoPor.nombre}, ${fecha(ficha.autorizadoEn)}` : '—'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" plain>Cobros registrados</Divider>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={ficha.pagos}
            locale={{ emptyText: 'Sin cobros registrados' }}
            columns={[
              { title: 'Tipo', dataIndex: 'tipo', render: (t) => (t === 'GARANTIA' ? 'Garantía' : 'Cobro') },
              { title: 'Fecha', dataIndex: 'fechaPago', render: fechaDia },
              { title: 'Monto', dataIndex: 'monto', render: pesos, align: 'right' },
              { title: 'Registrado por', dataIndex: ['registradoPor', 'nombre'] },
              { title: 'Comprobante', render: (_, p) => <Button type="link" size="small" onClick={() => ejecutar(() => abrirComprobante(p.comprobanteId))}>Ver</Button> },
            ]}
          />

          <Divider orientation="left" plain>Nómina</Divider>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={ficha.asignaciones}
            locale={{ emptyText: 'Sin colaboradores asignados' }}
            columns={[
              { title: 'Colaborador', dataIndex: ['colaborador', 'nombre'] },
              { title: 'Función', dataIndex: ['funcion', 'nombre'] },
              { title: 'Estado', dataIndex: 'estado', render: (v) => <EstadoEtiqueta tipo="asignacion" valor={v} /> },
              { title: 'Asistencia', render: (_, a) => (a.asistio === null ? '—' : a.asistio ? `Sí, ${a.funcionEfectiva?.nombre}` : 'No') },
            ]}
          />

          <Divider orientation="left" plain>Kits asignados</Divider>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={ficha.asignacionesKit}
            locale={{ emptyText: 'Sin kits asignados' }}
            columns={[
              { title: 'Kit', dataIndex: ['kit', 'nombre'] },
              { title: 'Responsable', dataIndex: ['responsable', 'nombre'], render: (v) => v ?? '—' },
              { title: 'Salida', dataIndex: 'salidaEn', render: fechaHora },
              { title: 'Retorno', dataIndex: 'retornoEn', render: fechaHora },
            ]}
          />

          {modal === 'garantia' && (
            <FormularioGarantia transmision={ficha} abierto onCerrar={() => setModal(null)} onRegistrada={refrescar} />
          )}
          {modal === 'cierre' && (
            <FormularioCierre transmision={ficha} abierto onCerrar={() => setModal(null)} onCerrada={refrescar} />
          )}
        </>
      )}
    </Drawer>
  );
}

export default FichaTransmision;