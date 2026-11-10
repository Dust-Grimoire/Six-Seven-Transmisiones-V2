import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import SelectorSesion from '../SelectorSesion.jsx';

const { Header, Content } = AntLayout;

function Layout() {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <AntLayout>
        <Header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #d9e1ec' }}>
          <SelectorSesion />
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
