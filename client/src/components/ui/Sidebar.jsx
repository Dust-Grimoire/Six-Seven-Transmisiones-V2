import { Layout, Menu, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../../context/SesionContext.jsx';
import { modulosDelRol } from '../../utils/modulos.js';

function Sidebar() {
  const { usuario } = useSesion();
  const navegar = useNavigate();
  const { pathname } = useLocation();

  const items = modulosDelRol(usuario?.rol).map(({ ruta, etiqueta, Icono }) => ({
    key: ruta,
    icon: <Icono />,
    label: etiqueta,
  }));

  return (
    <Layout.Sider width={230} breakpoint="lg" collapsedWidth={0}>
      <Typography.Title level={4} style={{ color: '#ffffff', padding: '20px 24px 8px', margin: 0 }}>
        Sixseven
      </Typography.Title>
      <Typography.Text style={{ color: '#9fb3cc', padding: '0 24px', display: 'block', marginBottom: 16 }}>
        Transmisiones
      </Typography.Text>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[`/${pathname.split('/')[1]}`]}
        items={items}
        onClick={({ key }) => navegar(key)}
      />
    </Layout.Sider>
  );
}

export default Sidebar;
