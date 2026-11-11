import { Card, Tabs } from 'antd';
import EncabezadoPagina from '../components/ui/EncabezadoPagina.jsx';
import TablaAcuerdos from '../components/auspicios/TablaAcuerdos.jsx';
import TablaAuspiciadores from '../components/auspicios/TablaAuspiciadores.jsx';

function Auspicios() {
  const pestanas = [
    { key: 'acuerdos', label: 'Acuerdos', children: <TablaAcuerdos /> },
    { key: 'auspiciadores', label: 'Auspiciadores', children: <TablaAuspiciadores /> },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Auspicios y canjes"
        descripcion="Acuerdos comerciales, cobros vencidos y control de morosidad de las marcas"
      />
      <Card>
        <Tabs items={pestanas} destroyOnHidden />
      </Card>
    </>
  );
}

export default Auspicios;