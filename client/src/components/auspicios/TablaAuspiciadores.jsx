import { useState } from 'react';
import { Button, Flex, Progress, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FormularioAuspiciador from './FormularioAuspiciador.jsx';
import HistorialAuspiciador from './HistorialAuspiciador.jsx';
import ModalMotivo from './ModalMotivo.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { useAccion } from '../../hooks/useAccion.js';
import { listarAuspiciadores, marcarMoroso, regularizar } from '../../services/auspicios.service.js';

function TablaAuspiciadores() {
  const { ejecutar, ejecutando } = useAccion();
  const { datos, cargando, recargar } = useDatos(listarAuspiciadores, []);
  const [registrando, setRegistrando] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [cambio, setCambio] = useState(null);

  const confirmarCambio = async (motivo) => {
    const accion = cambio.tipo === 'moroso' ? marcarMoroso : regularizar;
    const mensaje = cambio.tipo === 'moroso' ? 'Auspiciador marcado En Lista Negra' : 'Auspiciador regularizado';
    const resultado = await ejecutar(() => accion(cambio.auspiciador.id, motivo), mensaje);
    if (resultado) {
      setCambio(null);
      recargar();
    }
  };

  const columnas = [
    { title: 'Marca', dataIndex: 'nombre' },
    { title: 'Contacto', dataIndex: 'contacto' },
    {
      title: 'Estado',
      dataIndex: 'enListaNegra',
      render: (v) => (v ? <Tag color="red">En Lista Negra</Tag> : <Tag color="green">Habilitado</Tag>),
    },
    { title: 'Acuerdos', dataIndex: ['cumplimiento', 'total'], align: 'right' },
    { title: 'Vencidos', dataIndex: ['cumplimiento', 'vencidos'], align: 'right' },
    {
      title: 'Cumplimiento histórico',
      dataIndex: 'cumplimiento',
      render: (c) =>
        c.porcentajeCumplimiento === null ? (
          'Sin acuerdos'
        ) : (
          <Progress percent={c.porcentajeCumplimiento} size="small" status={c.vencidos > 0 ? 'exception' : 'normal'} />
        ),
    },
    {
      title: 'Acciones',
      render: (_, fila) => (
        <Space>
          <Button size="small" onClick={() => setHistorial(fila.id)}>Historial</Button>
          {fila.enListaNegra ? (
            <Button size="small" onClick={() => setCambio({ tipo: 'regularizar', auspiciador: fila })}>
              Regularizar
            </Button>
          ) : (
            <Button
              size="small"
              danger
              disabled={fila.cumplimiento.vencidos === 0}
              onClick={() => setCambio({ tipo: 'moroso', auspiciador: fila })}
            >
              Marcar como Moroso
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegistrando(true)}>
          Registrar auspiciador
        </Button>
      </Flex>
      <Table
        rowKey="id"
        size="small"
        columns={columnas}
        dataSource={datos ?? []}
        loading={cargando}
        pagination={false}
        rowClassName={(fila) => (fila.enListaNegra ? 'fila-alerta' : '')}
      />
      <FormularioAuspiciador
        abierto={registrando}
        onCerrar={() => setRegistrando(false)}
        onRegistrado={() => {
          setRegistrando(false);
          recargar();
        }}
      />
      {historial && <HistorialAuspiciador auspiciadorId={historial} onCerrar={() => setHistorial(null)} />}
      {cambio && (
        <ModalMotivo
          titulo={
            cambio.tipo === 'moroso'
              ? `Marcar a ${cambio.auspiciador.nombre} como moroso`
              : `Regularizar a ${cambio.auspiciador.nombre}`
          }
          textoBoton={cambio.tipo === 'moroso' ? 'Marcar como Moroso' : 'Regularizar'}
          ejecutando={ejecutando}
          onConfirmar={confirmarCambio}
          onCerrar={() => setCambio(null)}
        />
      )}
    </>
  );
}

export default TablaAuspiciadores;