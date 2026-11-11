import { describe, expect, it } from 'vitest';
import {
  calcularResumenTarifario,
  estadoGarantia,
  montoGarantia,
  requiereGarantia,
  saldoPendiente,
} from '../src/utils/agenda.reglas.js';

const tarifas = { tarifaKit: 40000, recargoUltimaGeneracion: 15 };

describe('reglas de la agenda', () => {
  it('calcula el resumen tarifario de una transmisión básica', () => {
    const resumen = calcularResumenTarifario(
      { funciones: [{ nombre: 'Cámara', tarifaHora: 8000, cantidad: 1 }], horas: 2, cantidadKits: 1, kitsUltimaGeneracion: false },
      tarifas,
    );
    expect(resumen.subtotalPersonal).toBe(16000);
    expect(resumen.subtotalEquipos).toBe(40000);
    expect(resumen.recargo).toBe(0);
    expect(resumen.valorTotal).toBe(56000);
  });

  it('aplica el recargo por kits de última generación sobre el valor base', () => {
    const resumen = calcularResumenTarifario(
      { funciones: [{ nombre: 'Cámara', tarifaHora: 8000, cantidad: 2 }], horas: 5, cantidadKits: 2, kitsUltimaGeneracion: true },
      tarifas,
    );
    expect(resumen.valorBase).toBe(160000);
    expect(resumen.recargo).toBe(24000);
    expect(resumen.valorTotal).toBe(184000);
  });

  it('exige garantía solo sobre las 5 horas', () => {
    expect(requiereGarantia(5, 5)).toBe(false);
    expect(requiereGarantia(5.5, 5)).toBe(true);
  });

  it('calcula la garantía del 50 % y el saldo pendiente', () => {
    expect(montoGarantia(358001, 50)).toBe(179001);
    expect(saldoPendiente(100000, [{ monto: 50000 }, { monto: 20000 }])).toBe(30000);
  });

  it('informa el estado de la garantía', () => {
    expect(estadoGarantia(false, [])).toBe('NO_REQUERIDA');
    expect(estadoGarantia(true, [])).toBe('PENDIENTE');
    expect(estadoGarantia(true, [{ tipo: 'GARANTIA', monto: 1 }])).toBe('RECIBIDA');
  });
});