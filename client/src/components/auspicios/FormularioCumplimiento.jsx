import { DatePicker, Form, Input, InputNumber, Modal } from 'antd';
import dayjs from 'dayjs';
import { useAccion } from '../../hooks/useAccion.js';
import { registrarCumplimiento } from '../../services/auspicios.service.js';

function FormularioCumplimiento({ acuerdo, onCerrar, onRegistrado }) {
  const [formulario] = Form.useForm();
  const { ejecutar, ejecutando } = useAccion();
  const monetario = acuerdo.tipoAporte === 'MONETARIO';

  const registrar = async (valores) => {
    const datos = { ...valores, fechaRecepcion: valores.fechaRecepcion.format('YYYY-MM-DD') };
    const resultado = await ejecutar(() => registrarCumplimiento(acuerdo.id, datos), 'Acuerdo registrado como Cumplido');
    if (resultado) onRegistrado();
  };

  return (
    <Modal
      title={`Registrar cumplimiento de ${acuerdo.auspiciador.nombre}`}
      open
      onCancel={onCerrar}
      onOk={() => formulario.submit()}
      okText="Marcar como Cumplido"
      confirmLoading={ejecutando}
    >
      <p>{acuerdo.glosa}</p>
      <Form
        form={formulario}
        layout="vertical"
        onFinish={registrar}
        initialValues={{ fechaRecepcion: dayjs(), montoRecibido: acuerdo.montoComprometido }}
      >
        <Form.Item name="fechaRecepcion" label="Fecha de recepción" rules={[{ required: true, message: 'Indique la fecha de recepción' }]}>
          <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} disabledDate={(d) => d.isAfter(dayjs(), 'day')} />
        </Form.Item>
        {monetario ? (
          <Form.Item name="montoRecibido" label="Monto recibido" rules={[{ required: true, message: 'Indique el monto recibido' }]}>
            <InputNumber min={1} step={1000} style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          <Form.Item name="detalleRecibido" label="Detalle de lo recibido" rules={[{ required: true, message: 'Describa lo recibido en canje' }]}>
            <Input maxLength={300} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default FormularioCumplimiento;