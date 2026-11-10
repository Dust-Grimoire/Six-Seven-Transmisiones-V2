export const COLORES = {
  primario: '#1d4f91',
  barraLateral: '#0f2a4a',
  fondo: '#f0f3f8',
  exito: '#237804',
  alerta: '#ad6800',
  peligro: '#a8071a',
};

export const tema = {
  token: {
    colorPrimary: COLORES.primario,
    colorSuccess: COLORES.exito,
    colorWarning: COLORES.alerta,
    colorError: COLORES.peligro,
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: { siderBg: COLORES.barraLateral, headerBg: '#ffffff', bodyBg: COLORES.fondo },
    Menu: { darkItemBg: COLORES.barraLateral, darkItemSelectedBg: COLORES.primario },
    Table: { headerBg: '#e6edf7', cellPaddingBlockSM: 6 },
  },
};