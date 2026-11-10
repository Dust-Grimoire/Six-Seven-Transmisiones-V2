import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/ui/Layout.jsx';
import RutaPermitida from './components/RutaPermitida.jsx';
import { MODULOS } from './utils/modulos.js';
import Tablero from './pages/Tablero.jsx';
import Agenda from './pages/Agenda.jsx';
import Personal from './pages/Personal.jsx';
import Inventario from './pages/Inventario.jsx';
import Financiero from './pages/Financiero.jsx';
import Auspicios from './pages/Auspicios.jsx';
import Usuarios from './pages/Usuarios.jsx';

const PAGINAS = {
  '/tablero': Tablero,
  '/agenda': Agenda,
  '/personal': Personal,
  '/inventario': Inventario,
  '/financiero': Financiero,
  '/auspicios': Auspicios,
  '/usuarios': Usuarios,
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tablero" replace />} />
          {MODULOS.map(({ ruta, roles }) => {
            const Pagina = PAGINAS[ruta];
            return (
              <Route
                key={ruta}
                path={ruta}
                element={
                  <RutaPermitida roles={roles}>
                    <Pagina />
                  </RutaPermitida>
                }
              />
            );
          })}
          <Route path="*" element={<Navigate to="/tablero" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
