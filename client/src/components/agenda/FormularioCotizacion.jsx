import { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ResumenTarifario from './ResumenTarifario.jsx';
import { useAccion } from '../../hooks/useAccion.js';
import { listarClientes, listarFunciones } from '../../services/catalogos.service.js';
import { calcularResumenTarifario, registrarCotizacion } from '../../services/agenda.service.js';
import { TIPOS_EVENTO, TIPOS_SERVICIO, opcionesDe } from '../../utils/etiquetas.js';

const CAMPOS_PLANIFICACION = ['inicio', 'duracionHoras', 'cantidadKits', 'kitsUltimaGeneracion', 'requerimientos'];

const aPlanificacion = (valores) => ({
  inicio: valores.inicio?.toISOString(),
  duracionHoras: valores.duracionHoras,
  cantidadKits: valores.cantidadKits,
  kitsUltimaGeneracion: Boolean(valores.kitsUltimaGeneracion),
  requerimientos: (valores.requerimientos ?? []).filter((r) => r?.funcionId && r?.cantidad),
});

function FormularioCotizacion({ abierto, onCerrar, onRegistrada }) {
  const [formulario] = Form.useForm();
  const { ejecutar, ejecutando } = useAccion();
  const [funciones, setFunciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    if (abierto) {
      ejecutar(async () => {
        const [listaFunciones, listaClientes] = await Promise.all([listarFunciones(), listarClientes()]);
        setFunciones(listaFunciones);
        setClientes(listaClientes);
      });
    }
  }, [abierto]);

  const calcular = async () => {
    const valores = await formulario.validateFields(CAMPOS_PLANIFICACION);
    const calculado = await ejecutar(() => calcularResumenTarifario(aPlanificacion(valores)));
    if (calculado) setResumen(calculado);
  };

  const registrar = async (valores) => {
    const datos = {
      ...aPlanificacion(valores),
      nombreEvento: valores.nombreEvento,
      tipoEvento: valores.tipoEvento,
      tipoServicio: valores.tipoServicio,
      recinto: valores.recinto,
      comuna: valores.comuna,
      ...(clienteNuevo ? { clienteNuevo: valores.clienteNuevo } : { clienteId: valores.clienteId }),
    };
    const creada = await ejecutar(() => registrarCotizacion(datos), 'Cotización registrada en estado Cotizado');
    if (creada) {
      formulario.resetFields();
      setResumen(null);
      onRegistrada(creada);
    }
  };

  return (
    <Modal
      title="Nueva cotización de transmisión"
      open={abierto}
      width={860}
      onCancel={onCerrar}
      destroyOnHidden
      footer={[
        <Button key="calcular" onClick={calcular} loading={ejecutando}>
          Calcular resumen tarifario
        </Button>,
        <Button key="registrar" type="primary" onClick={() => formulario.submit()} loading={ejecutando} disabled={!resumen}>
          Registrar cotización
        </Button>,
      ]}
    >
      <Form
        form={formulario}
        layout="vertical"
        onFinish={registrar}
        onValuesChange={(cambios) => CAMPOS_PLANIFICACION.some((c) => c in cambios) && setResumen(null)}
        initialValues={{ duracionHoras: 2, cantidadKits: 1, kitsUltimaGeneracion: false, tipoServicio: 'BASICO', requerimientos: [{ cantidad: 1 }] }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nombreEvento" label="Nombre del evento" rules={[{ required: true, min: 3, message: 'Ingrese el nombre del evento' }]}>
              <Input maxLength={150} />
            </Form.Item>
          </Col>
          <Col span={12}>
            {clienteNuevo ? (
              <Form.Item name={['clienteNuevo', 'nombre']} label="Nuevo cliente" rules={[{ required: true, min: 3, message: 'Ingrese el nombre del cliente' }]}>
                <Input maxLength={120} />
              </Form.Item>
            ) : (
              <Form.Item name="clienteId" label="Cliente" rules={[{ required: true, message: 'Seleccione el cliente' }]}>
                <Select showSearch optionFilterProp="label" options={clientes.map((c) => ({ value: c.id, label: c.nombre }))} />
              </Form.Item>
            )}
            <Button type="link" size="small" style={{ marginTop: -16, padding: 0 }} onClick={() => setClienteNuevo(!clienteNuevo)}>
              {clienteNuevo ? 'Elegir un cliente registrado' : 'Registrar un cliente nuevo'}
            </Button>
          </Col>
          {clienteNuevo && (
            <>
              <Col span={12}>
                <Form.Item name={['clienteNuevo', 'contacto']} label="Persona de contacto">
                  <Input maxLength={120} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['clienteNuevo', 'telefono']} label="Teléfono de contacto">
                  <Input maxLength={20} />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={8}>
            <Form.Item name="tipoEvento" label="Tipo de evento" rules={[{ required: true, message: 'Seleccione el tipo de evento' }]}>
              <Select options={opcionesDe(TIPOS_EVENTO)} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tipoServicio" label="Tipo de servicio" rules={[{ required: true }]}>
              <Select options={opcionesDe(TIPOS_SERVICIO)} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="inicio" label="Fecha y hora de inicio" rules={[{ required: true, message: 'Indique la fecha y hora' }]}>
              <DatePicker showTime={{ format: 'HH:mm', minuteStep: 15 }} format="DD-MM-YYYY HH:mm" style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="recinto" label="Recinto" rules={[{ required: true, min: 3, message: 'Ingrese el recinto' }]}>
              <Input maxLength={150} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="comuna" label="Comuna" rules={[{ required: true, min: 3, message: 'Ingrese la comuna' }]}>
              <Input maxLength={80} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="duracionHoras" label="Duración planificada (horas)" rules={[{ required: true, message: 'Indique la duración' }]}>
              <InputNumber min={0.5} max={24} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="cantidadKits"
              label="Kits de inventario"
              dependencies={['tipoServicio']}
              rules={[
                { required: true, message: 'Indique la cantidad de kits' },
                ({ getFieldValue }) => ({
                  validator: (_, valor) =>
                    getFieldValue('tipoServicio') === 'BASICO' && valor !== 1
                      ? Promise.reject(new Error('Una transmisión básica utiliza un solo kit'))
                      : Promise.resolve(),
                }),
              ]}
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="kitsUltimaGeneracion" label="Kits de última generación" valuePropName="checked">
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left" plain>
          Personal requerido
        </Divider>
        <Form.List name="requerimientos">
          {(filas, { add, remove }) => (
            <>
              {filas.map(({ key, name }) => (
                <Space key={key} align="baseline" style={{ display: 'flex' }}>
                  <Form.Item name={[name, 'funcionId']} rules={[{ required: true, message: 'Seleccione la función' }]}>
                    <Select style={{ width: 220 }} placeholder="Función" options={funciones.map((f) => ({ value: f.id, label: f.nombre }))} />
                  </Form.Item>
                  <Form.Item name={[name, 'cantidad']} rules={[{ required: true, message: 'Indique la cantidad' }]}>
                    <InputNumber min={1} max={10} placeholder="Cantidad" />
                  </Form.Item>
                  {filas.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                </Space>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ cantidad: 1 })}>
                Agregar función
              </Button>
            </>
          )}
        </Form.List>
      </Form>
      {resumen && (
        <>
          <Divider orientation="left" plain>
            Resumen tarifario
          </Divider>
          <ResumenTarifario resumen={resumen} />
        </>
      )}
    </Modal>
  );
}

export default FormularioCotizacion;