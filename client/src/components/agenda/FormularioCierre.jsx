import { useEffect, useState } from 'react';
import { Alert, Modal, Select, Switch, Table } from 'antd';
import { useAccion } from '../../hooks/useAccion.js';
import { cerrarTransmision } from '../../services/agenda.service.js';

function FormularioCierre({ transmision, abierto, onCerrar, onCerrada }) {
  const { ejecutar, ejecutando } = useAccion();
  const confirmadas = transmision.asignaciones.filter((a) => a.estado === 'CONFIRMADA');
  const [asistencias, setAsistencias] = useState({});

  useEffect(() => {
    setAsistencias(
      Object.fromEntries(confirmadas.map((a) => [a.id, { asistio: true, funcionEfectivaId: a.funcionId }])),
    );
  }, [transmision]);

  const actualizar = (id, cambios) => setAsistencias({ ...asistencias, [id]: { ...asistencias[id], ...cambios } });

  const confirmar = async () => {
    const datos = Object.entries(asistencias).map(([asignacionId, valor]) => ({ asignacionId: Number(asignacionId), ...valor }));
    const cerrada = await ejecutar(() => cerrarTransmision(transmision.id, datos), 'Transmisión cerrada como Finalizada');
    if (cerrada) onCerrada();
  };

  const columnas = [
    { title: 'Colaborador', dataIndex: ['colaborador', 'nombre'] },
    { title: 'Función asignada', dataIndex: ['funcion', 'nombre'] },
    {
      title: 'Asistió',
      render: (_, fila) => (
        <Switch
          checked={asistencias[fila.id]?.asistio}
          checkedChildren="Sí"
          unCheckedChildren="No"
          onChange={(asistio) => actualizar(fila.id, { asistio })}
        />
      ),
    },
    {
      title: 'Función cumplida',
      render: (_, fila) => (
        <Select
          style={{ width: 160 }}
          disabled={!asistencias[fila.id]?.asistio}
          value={asistencias[fila.id]?.funcionEfectivaId}
          onChange={(funcionEfectivaId) => actualizar(fila.id, { funcionEfectivaId })}
          options={fila.colaborador.funciones.map((f) => ({ value: f.funcionId, label: f.funcion.nombre }))}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Cerrar transmisión"
      open={abierto}
      width={720}
      onCancel={onCerrar}
      onOk={confirmar}
      okText="Cerrar como Finalizada"
      confirmLoading={ejecutando}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Confirme la asistencia y la función que cada colaborador cumplió. Estos datos se usan para la liquidación de comisiones."
      />
      <Table rowKey="id" size="small" columns={columnas} dataSource={confirmadas} pagination={false} locale={{ emptyText: 'No hay colaboradores confirmados' }} />
    </Modal>
  );
}

export default FormularioCierre;