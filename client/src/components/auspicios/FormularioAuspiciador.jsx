import { Form, Input, Modal } from 'antd';
import { useAccion } from '../../hooks/useAccion.js';
import { registrarAuspiciador } from '../../services/auspicios.service.js';

function FormularioAuspiciador({ abierto, onCerrar, onRegistrado }) {
  const [formulario] = Form.useForm();
  const { ejecutar, ejecutando } = useAccion();

  const registrar = async (valores) => {
    const creado = await ejecutar(() => registrarAuspiciador(valores), 'Auspiciador registrado');
    if (creado) {
      formulario.resetFields();
      onRegistrado();
    }
  };

  return (
    <Modal
      title="Registrar auspiciador"
      open={abierto}
      onCancel={onCerrar}
      onOk={() => formulario.submit()}
      okText="Registrar"
      confirmLoading={ejecutando}
    >
      <Form form={formulario} layout="vertical" onFinish={registrar}>
        <Form.Item name="nombre" label="Nombre de la marca" rules={[{ required: true, min: 2, message: 'Ingrese el nombre de la marca' }]}>
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="contacto" label="Persona de contacto">
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="telefono" label="Teléfono" rules={[{ pattern: /^\+569\d{8}$/, message: 'Formato +569XXXXXXXX' }]}>
          <Input maxLength={12} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default FormularioAuspiciador;