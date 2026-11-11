import { useEffect, useState } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Radio, Select } from 'antd';
import { useAccion } from '../../hooks/useAccion.js';
import { buscarTransmisiones } from '../../services/catalogos.service.js';
import { listarAuspiciadores, registrarAcuerdo } from '../../services/auspicios.service.js';
import { fecha } from '../../utils/formato.js';
import { TIPOS_APORTE, opcionesDe } from '../../utils/etiquetas.js';

function FormularioAcuerdo({ abierto, onCerrar, onRegistrado }) {
  const [formulario] = Form.useForm();
  const { ejecutar, ejecutando } = useAccion();
  const [auspiciadores, setAuspiciadores] = useState([]);
  const [transmisiones, setTransmisiones] = useState([]);
  const tipoAporte = Form.useWatch('tipoAporte', formulario);

  useEffect(() => {
    if (!abierto) return;
    ejecutar(async () => {
      const [marcas, lista] = await Promise.all([listarAuspiciadores(), buscarTransmisiones({})]);
      setAuspiciadores(marcas);
      setTransmisiones(lista.filter((t) => t.estado !== 'FINALIZADA'));
    });
  }, [abierto]);

  const registrar = async (valores) => {
    const datos = { ...valores, fechaComprometida: valores.fechaComprometida.format('YYYY-MM-DD') };
    const creado = await ejecutar(() => registrarAcuerdo(datos), 'Acuerdo registrado en estado Pendiente');
    if (creado) {
      formulario.resetFields();
      onRegistrado();
    }
  };

  return (
    <Modal
      title="Registrar acuerdo de auspicio o canje"
      open={abierto}
      width={640}
      onCancel={onCerrar}
      onOk={() => formulario.submit()}
      okText="Registrar acuerdo"
      confirmLoading={ejecutando}
    >
      <Form form={formulario} layout="vertical" onFinish={registrar} initialValues={{ tipoAporte: 'MONETARIO' }}>
        <Form.Item name="auspiciadorId" label="Auspiciador" rules={[{ required: true, message: 'Seleccione el auspiciador' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={auspiciadores.map((a) => ({
              value: a.id,
              label: a.enListaNegra ? `${a.nombre} (En Lista Negra)` : a.nombre,
              disabled: a.enListaNegra,
            }))}
          />
        </Form.Item>
        <Form.Item name="transmisionId" label="Transmisión" rules={[{ required: true, message: 'Seleccione la transmisión' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={transmisiones.map((t) => ({ value: t.id, label: `${fecha(t.inicio)} · ${t.nombreEvento}` }))}
          />
        </Form.Item>
        <Form.Item name="tipoAporte" label="Tipo de aporte">
          <Radio.Group options={opcionesDe(TIPOS_APORTE)} optionType="button" />
        </Form.Item>
        {tipoAporte === 'MONETARIO' && (
          <Form.Item name="montoComprometido" label="Monto comprometido" rules={[{ required: true, message: 'Indique el monto' }]}>
            <InputNumber min={1} step={1000} style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item
          name="glosa"
          label="Glosa del acuerdo (qué ofrece cada parte)"
          rules={[{ required: true, min: 10, message: 'Describa lo que ofrece cada parte' }]}
        >
          <Input.TextArea rows={3} maxLength={1000} />
        </Form.Item>
        <Form.Item
          name="fechaComprometida"
          label="Fecha comprometida de pago o entrega"
          rules={[{ required: true, message: 'Indique la fecha comprometida' }]}
        >
          <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default FormularioAcuerdo;