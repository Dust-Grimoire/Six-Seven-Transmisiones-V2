import { useState } from 'react';
import { App, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { subirComprobante } from '../services/comprobantes.service.js';

function SubirComprobante({ value, onChange, texto = 'Adjuntar comprobante' }) {
  const { message } = App.useApp();
  const [archivos, setArchivos] = useState([]);

  const cargar = async ({ file, onSuccess, onError }) => {
    try {
      const comprobante = await subirComprobante(file);
      onSuccess(comprobante);
      onChange?.(comprobante.id);
    } catch (error) {
      message.error(error.message);
      onError(error);
    }
  };

  return (
    <Upload
      accept="image/jpeg,image/png,image/webp,application/pdf"
      maxCount={1}
      customRequest={cargar}
      fileList={value ? archivos : archivos.filter((a) => a.status === 'uploading')}
      onChange={({ fileList }) => setArchivos(fileList)}
      onRemove={() => onChange?.(undefined)}
    >
      <Button icon={<UploadOutlined />}>{texto}</Button>
    </Upload>
  );
}

export default SubirComprobante;
