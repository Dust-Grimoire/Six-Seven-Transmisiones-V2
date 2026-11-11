import { useState } from 'react';
import { Button, Flex, Segmented, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SituacionAcuerdo from './SituacionAcuerdo.jsx';
import FormularioAcuerdo from './FormularioAcuerdo.jsx';
import FormularioCumplimiento from './FormularioCumplimiento.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { listarAcuerdos } from '../../services/auspicios.service.js';
import { fechaDia, pesos } from '../../utils/formato.js';
import { TIPOS_APORTE } from '../../utils/etiquetas.js';

const FILTROS = [
  { value: 'VENCIDO', label: 'Vencidos' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'CUMPLIDO', label: 'Cumplidos' },
  { value: 'TODOS', label: 'Todos' },
];

function TablaAcuerdos() {
  const [situacion, setSituacion] = useState('VENCIDO');
  const [registrando, setRegistrando] = useState(false);
  const [cumpliendo, setCumpliendo] = useState(null);
  const { datos, cargando, recargar } = useDatos(
    () => listarAcuerdos(situacion === 'TODOS' ? undefined : situacion),
    [situacion],
  );

  const alTerminar = (cerrar) => () => {
    cerrar();
    recargar();
  };

  const columnas = [
    { title: 'Auspiciador', dataIndex: ['auspiciador', 'nombre'] },
    { title: 'Transmisión', dataIndex: ['transmision', 'nombreEvento'] },
    { title: 'Tipo', dataIndex: 'tipoAporte', render: (v) => TIPOS_APORTE[v] },
    { title: 'Glosa', dataIndex: 'glosa', ellipsis: true },
    { title: 'Monto', dataIndex: 'montoComprometido', render: (v) => (v ? pesos(v) : '—'), align: 'right' },
    { title: 'Fecha comprometida', dataIndex: 'fechaComprometida', render: fechaDia },
    { title: 'Situación', width: 170, render: (_, fila) => <SituacionAcuerdo acuerdo={fila} /> },
    {
      title: '',
      width: 200,
      render: (_, fila) =>
        fila.estado === 'PENDIENTE' && (
          <Button size="small" type="primary" onClick={() => setCumpliendo(fila)}>
            Registrar cumplimiento
          </Button>
        ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" style={{ marginBottom: 12 }}>
        <Segmented options={FILTROS} value={situacion} onChange={setSituacion} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegistrando(true)}>
          Registrar acuerdo
        </Button>
      </Flex>
      <Table
        rowKey="id"
        size="small"
        columns={columnas}
        dataSource={datos ?? []}
        loading={cargando}
        pagination={{ pageSize: 15 }}
        rowClassName={(fila) => (fila.situacion === 'VENCIDO' ? 'fila-alerta' : '')}
        locale={{ emptyText: 'No hay acuerdos en esta situación' }}
      />
      <FormularioAcuerdo
        abierto={registrando}
        onCerrar={() => setRegistrando(false)}
        onRegistrado={alTerminar(() => setRegistrando(false))}
      />
      {cumpliendo && (
        <FormularioCumplimiento
          acuerdo={cumpliendo}
          onCerrar={() => setCumpliendo(null)}
          onRegistrado={alTerminar(() => setCumpliendo(null))}
        />
      )}
    </>
  );
}

export default TablaAcuerdos;