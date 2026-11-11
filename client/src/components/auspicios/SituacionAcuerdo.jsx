import EstadoEtiqueta from '../ui/EstadoEtiqueta.jsx';

function SituacionAcuerdo({ acuerdo }) {
  return (
    <>
      <EstadoEtiqueta tipo="acuerdo" valor={acuerdo.situacion} />
      {acuerdo.diasAtraso > 0 && `${acuerdo.diasAtraso} ${acuerdo.diasAtraso === 1 ? 'día' : 'días'} de atraso`}
    </>
  );
}

export default SituacionAcuerdo;