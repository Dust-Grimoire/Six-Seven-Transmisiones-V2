import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import App from './App.jsx';
import { SesionProvider } from './context/SesionContext.jsx';
import { tema } from './utils/tema.js';
import './index.css';

dayjs.locale('es');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={esES} theme={tema}>
      <AntApp>
        <SesionProvider>
          <App />
        </SesionProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);