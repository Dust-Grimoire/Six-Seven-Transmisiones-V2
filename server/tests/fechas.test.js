import { describe, expect, it } from 'vitest';
import { horasEntre, periodoDe, rangoDelPeriodo, seCruzan } from '../src/utils/fechas.js';

describe('utilidades de fechas', () => {
  it('calcula el rango de un período mensual', () => {
    const { desde, hasta } = rangoDelPeriodo('2026-12');
    expect(desde).toEqual(new Date(2026, 11, 1));
    expect(hasta).toEqual(new Date(2027, 0, 1));
  });

  it('obtiene el período de una fecha', () => {
    expect(periodoDe(new Date(2026, 2, 15))).toBe('2026-03');
  });

  it('calcula la duración en horas', () => {
    expect(horasEntre(new Date(2026, 0, 1, 9), new Date(2026, 0, 1, 14, 30))).toBe(5.5);
  });

  it('detecta cruces de horario', () => {
    const a = [new Date(2026, 0, 1, 10), new Date(2026, 0, 1, 12)];
    expect(seCruzan(...a, new Date(2026, 0, 1, 11), new Date(2026, 0, 1, 13))).toBe(true);
    expect(seCruzan(...a, new Date(2026, 0, 1, 12), new Date(2026, 0, 1, 13))).toBe(false);
  });
});