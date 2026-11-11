import { useState } from 'react';
import { Button, Checkbox, Flex, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FormularioColaborador from './FormularioColaborador.jsx';
import DisponibilidadColaborador from './DisponibilidadColaborador.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { listarColaboradores } from '../../services/personal.service.js';

function TablaColaboradores() {
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [edicion, setEdicion] = useState({ abierto: false, colaborador: null });
  const [disponibilidad, setDisponibilidad] = useState(null);
  const { datos, cargando, recargar } = useDatos(() => listarColaboradores(incluirInactivos), [incluirInactivos]);

  const columnas = [
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'RUT', dataIndex: 'rut' },
    { title: 'Teléfono', dataIndex: 'telefono' },
    { title: 'Funciones', dataIndex: 'funciones', render: (lista) => lista.map((f) => <Tag key={f.funcionId}>{f.funcion.nombre}</Tag>) },
    { title: 'Estado', dataIndex: 'activo', render: (activo) => (activo ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>) },
    {
      title: 'Acciones',
      render: (_, fila) => (
        <Space>
          <Button size="small" onClick={() => setEdicion({ abierto: true, colaborador: fila })}>Editar</Button>
          <Button size="small" disabled={!fila.activo} onClick={() => setDisponibilidad(fila)}>Disponibilidad</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" style={{ marginBottom: 12 }}>
        <Checkbox checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)}>
          Mostrar colaboradores inactivos
        </Checkbox>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEdicion({ abierto: true, colaborador: null })}>
          Registrar colaborador
        </Button>
      </Flex>
      <Table rowKey="id" size="small" columns={columnas} dataSource={datos ?? []} loading={cargando} pagination={{ pageSize: 15 }} />
      <FormularioColaborador
        abierto={edicion.abierto}
        colaborador={edicion.colaborador}
        onCerrar={() => setEdicion({ abierto: false, colaborador: null })}
        onGuardado={() => {
          setEdicion({ abierto: false, colaborador: null });
          recargar();
        }}
      />
      {disponibilidad && <DisponibilidadColaborador colaborador={disponibilidad} onCerrar={() => setDisponibilidad(null)} />}
    </>
  );
}

export default TablaColaboradores;