import { describe, expect, it } from 'vitest';
import {
  describirAcuerdo,
  diasDeAtraso,
  estaVencido,
  fechaLocal,
  resumenCumplimiento,
} from '../src/utils/auspicios.reglas.js';

const acuerdo = (fecha, estado = 'PENDIENTE') => ({
  fechaComprometida: new Date(`${fecha}T00:00:00Z`),
  estado,
});

const HOY = '2026-11-10';

describe('reglas de auspicios', () => {
  it('formatea la fecha local', () => {
    expect(fechaLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('considera vencido un acuerdo pendiente con fecha anterior a hoy', () => {
    expect(estaVencido(acuerdo('2026-11-09'), HOY)).toBe(true);
    expect(estaVencido(acuerdo('2026-11-10'), HOY)).toBe(false);
    expect(estaVencido(acuerdo('2026-11-01', 'CUMPLIDO'), HOY)).toBe(false);
  });

  it('calcula los días de atraso', () => {
    expect(diasDeAtraso(acuerdo('2026-10-31'), HOY)).toBe(10);
    expect(describirAcuerdo(acuerdo('2026-11-12'), HOY)).toMatchObject({
      situacion: 'PENDIENTE',
      diasAtraso: 0,
    });
  });

  it('resume el cumplimiento histórico de una marca', () => {
    const resumen = resumenCumplimiento(
      [
        acuerdo('2026-10-01', 'CUMPLIDO'),
        acuerdo('2026-10-02'),
        acuerdo('2026-12-01'),
        acuerdo('2026-09-01', 'CUMPLIDO'),
      ],
      HOY,
    );
    expect(resumen).toEqual({
      total: 4,
      cumplidos: 2,
      vencidos: 1,
      pendientes: 1,
      porcentajeCumplimiento: 50,
    });
  });
});