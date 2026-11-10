import { describe, expect, it } from 'vitest';
import { fechaDia, horasDuracion, pesos } from './formato.js';

describe('formato de datos', () => {
  it('muestra montos en pesos chilenos sin decimales', () => {
    expect(pesos(1250000).replace(/\s/g, '')).toBe('$1.250.000');
  });

  it('muestra las fechas sin hora tal como se guardaron, sin desfase de zona horaria', () => {
    expect(fechaDia('2026-11-01T00:00:00.000Z')).toBe('01-11-2026');
  });

  it('calcula la duración de una transmisión en horas', () => {
    expect(horasDuracion('2026-11-10T10:00:00', '2026-11-10T15:30:00')).toBe(5.5);
  });
});