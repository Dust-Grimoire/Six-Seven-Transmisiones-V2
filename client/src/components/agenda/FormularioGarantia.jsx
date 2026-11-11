import { DatePicker, Form, InputNumber, Modal } from 'antd';
import dayjs from 'dayjs';
import SubirComprobante from '../SubirComprobante.jsx';
import { useAccion } from '../../hooks/useAccion.js';
import { registrarGarantia } from '../../services/agenda.service.js';
import { pesos } from '../../utils/formato.js';

function FormularioGarantia({ transmision, abierto, onCerrar, onRegistrada }) {
  const [formulario] = Form.useForm();
  const { ejecutar, ejecutando } = useAccion();
  const montoEsperado = transmision.garantia.monto;

  const registrar = async (valores) => {
    const datos = { ...valores, fechaPago: valores.fechaPago.format('YYYY-MM-DD') };
    const pago = await ejecutar(() => registrarGarantia(transmision.id, datos), 'Garantía registrada como Recibida');
    if (pago) onRegistrada();
  };

  return (
    <Modal
      title="Registrar garantía por adelantado"
      open={abierto}
      onCancel={onCerrar}
      onOk={() => formulario.submit()}
      okText="Registrar garantía"
      confirmLoading={ejecutando}
      destroyOnHidden
    >
      <Form
        form={formulario}
        layout="vertical"
        onFinish={registrar}
        initialValues={{ monto: montoEsperado, fechaPago: dayjs() }}
      >
        <Form.Item
          name="monto"
          label={`Monto recibido (debe ser ${pesos(montoEsperado)})`}
          rules={[
            { required: true, message: 'Ingrese el monto' },
            { validator: (_, valor) => (valor === montoEsperado ? Promise.resolve() : Promise.reject(new Error('El monto debe ser el 50 % del valor cotizado'))) },
          ]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="fechaPago" label="Fecha del pago" rules={[{ required: true, message: 'Indique la fecha del pago' }]}>
          <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} disabledDate={(d) => d.isAfter(dayjs(), 'day')} />
        </Form.Item>
        <Form.Item name="comprobanteId" label="Comprobante del pago" rules={[{ required: true, message: 'Debe adjuntar el comprobante' }]}>
          <SubirComprobante />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default FormularioGarantia;