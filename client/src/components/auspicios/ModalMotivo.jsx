import { Form, Input, Modal } from 'antd';

function ModalMotivo({ titulo, textoBoton, ejecutando, onConfirmar, onCerrar }) {
  const [formulario] = Form.useForm();

  return (
    <Modal
      title={titulo}
      open
      onCancel={onCerrar}
      onOk={() => formulario.submit()}
      okText={textoBoton}
      confirmLoading={ejecutando}
    >
      <Form form={formulario} layout="vertical" onFinish={({ motivo }) => onConfirmar(motivo)}>
        <Form.Item name="motivo" label="Motivo" rules={[{ required: true, min: 5, message: 'Indique el motivo' }]}>
          <Input.TextArea rows={3} maxLength={300} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalMotivo;