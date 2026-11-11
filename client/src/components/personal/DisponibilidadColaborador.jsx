import { useState } from 'react';
import { Button, DatePicker, Divider, Drawer, Form, Popconfirm, Space, Table, TimePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDatos } from '../../hooks/useDatos.js';
import { useAccion } from '../../hooks/useAccion.js';
import { eliminarDisponibilidad, listarDisponibilidad, registrarDisponibilidad } from '../../services/personal.service.js';
import { hora } from '../../utils/formato.js';

const unirFechaHora = (fecha, horario) => fecha.hour(horario.hour()).minute(horario.minute()).second(0).millisecond(0);

function DisponibilidadColaborador({ colaborador, onCerrar }) {
  const [formulario] = Form.useForm();
  const { ejecutar, ejecutando } = useAccion();
  const [semana, setSemana] = useState(dayjs().startOf('week'));
  const { datos, cargando, recargar } = useDatos(
    () => listarDisponibilidad(colaborador.id, semana, semana.add(7, 'day')),
    [colaborador.id, semana.valueOf()],
  );

  const registrar = async ({ fecha, horario }) => {
    const bloque = { inicio: unirFechaHora(fecha, horario[0]).toISOString(), fin: unirFechaHora(fecha, horario[1]).toISOString() };
    const creado = await ejecutar(() => registrarDisponibilidad(colaborador.id, bloque), 'Bloque de disponibilidad registrado');
    if (creado) {
      formulario.resetFields(['horario']);
      setSemana(fecha.startOf('week'));
      recargar();
    }
  };

  const eliminar = async (id) => {
    const resultado = await ejecutar(() => eliminarDisponibilidad(id), 'Bloque eliminado');
    if (resultado) recargar();
  };

  const columnas = [
    { title: 'Día', dataIndex: 'inicio', render: (v) => dayjs(v).format('dddd DD-MM') },
    { title: 'Desde', dataIndex: 'inicio', render: hora },
    { title: 'Hasta', dataIndex: 'fin', render: hora },
    {
      title: '',
      render: (_, fila) => (
        <Popconfirm title="¿Eliminar este bloque?" onConfirm={() => eliminar(fila.id)} okText="Eliminar" cancelText="Cancelar">
          <Button size="small" danger>Eliminar</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Drawer title={`Disponibilidad de ${colaborador.nombre}`} width={620} open onClose={onCerrar}>
      <Form form={formulario} layout="inline" onFinish={registrar} initialValues={{ fecha: dayjs() }}>
        <Form.Item name="fecha" rules={[{ required: true, message: 'Indique el día' }]}>
          <DatePicker format="DD-MM-YYYY" disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
        </Form.Item>
        <Form.Item name="horario" rules={[{ required: true, message: 'Indique el bloque horario' }]}>
          <TimePicker.RangePicker format="HH:mm" minuteStep={15} order />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={ejecutando}>Agregar bloque</Button>
      </Form>
      <Divider />
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<LeftOutlined />} onClick={() => setSemana(semana.subtract(7, 'day'))} />
        <span>{`Semana del ${semana.format('DD-MM')} al ${semana.add(6, 'day').format('DD-MM-YYYY')}`}</span>
        <Button icon={<RightOutlined />} onClick={() => setSemana(semana.add(7, 'day'))} />
      </Space>
      <Table rowKey="id" size="small" columns={columnas} dataSource={datos ?? []} loading={cargando} pagination={false} locale={{ emptyText: 'Sin bloques registrados en la semana' }} />
    </Drawer>
  );
}

export default DisponibilidadColaborador;