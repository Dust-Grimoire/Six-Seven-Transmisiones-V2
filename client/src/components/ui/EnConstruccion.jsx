import { Result } from 'antd';

function EnConstruccion({ nombreModulo }) {
  return (
    <Result
      status="info"
      title={`Módulo ${nombreModulo} en construcción`}
      subTitle="Esta sección estará disponible en la próxima etapa de entrega. Mientras tanto, puede revisar los demás módulos."
    />
  );
}

export default EnConstruccion;
