import { useState } from 'react';
import { Button, Card, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import EncabezadoPagina from '../components/ui/EncabezadoPagina.jsx';
import CalendarioTransmisiones from '../components/agenda/CalendarioTransmisiones.jsx';
import TablaTransmisiones from '../components/agenda/TablaTransmisiones.jsx';
import FormularioCotizacion from '../components/agenda/FormularioCotizacion.jsx';
import FichaTransmision from '../components/agenda/FichaTransmision.jsx';
import { useDatos } from '../hooks/useDatos.js';
import { useSesion } from '../context/SesionContext.jsx';
import { listarDelMes } from '../services/agenda.service.js';

function Agenda() {
  const { usuario } = useSesion();
  const [mes, setMes] = useState(dayjs().startOf('month'));
  const [seleccionada, setSeleccionada] = useState(null);
  const [cotizando, setCotizando] = useState(false);
  const { datos, cargando, recargar } = useDatos(() => listarDelMes(mes), [mes.valueOf()]);
  const transmisiones = datos ?? [];

  const pestanas = [
    {
      key: 'calendario',
      label: 'Calendario mensual',
      children: (
        <CalendarioTransmisiones
          mes={mes}
          transmisiones={transmisiones}
          onCambiarMes={(fecha) => setMes(fecha.startOf('month'))}
          onSeleccionar={setSeleccionada}
        />
      ),
    },
    {
      key: 'listado',
      label: `Transmisiones de ${mes.format('MMMM YYYY')}`,
      children: <TablaTransmisiones transmisiones={transmisiones} cargando={cargando} onSeleccionar={setSeleccionada} />,
    },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Agenda de transmisiones"
        descripcion="Cotizaciones, garantías, autorización a terreno y cierre de transmisiones"
        acciones={
          usuario?.rol === 'DUENO' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCotizando(true)}>
              Nueva cotización
            </Button>
          )
        }
      />
      <Card>
        <Tabs items={pestanas} />
      </Card>
      <FormularioCotizacion
        abierto={cotizando}
        onCerrar={() => setCotizando(false)}
        onRegistrada={(creada) => {
          setCotizando(false);
          setMes(dayjs(creada.inicio).startOf('month'));
          setSeleccionada(creada.id);
        }}
      />
      {seleccionada && (
        <FichaTransmision transmisionId={seleccionada} onCerrar={() => setSeleccionada(null)} onActualizada={recargar} />
      )}
    </>
  );
}

export default Agenda;