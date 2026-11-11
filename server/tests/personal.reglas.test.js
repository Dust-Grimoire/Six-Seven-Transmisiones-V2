import { describe, expect, it } from 'vitest';
import {
  coberturaDeFunciones,
  estaDisponible,
  evaluarCandidato,
  rutValido,
  sumaPorcentajes,
} from '../src/utils/personal.reglas.js';

const hora = (h, m = 0) => new Date(2026, 5, 6, h, m);
const transmision = { inicio: hora(15), fin: hora(18), comuna: 'Concepción' };
const bloques = [{ inicio: hora(8), fin: hora(23) }];

describe('reglas de personal', () => {
  it('valida el dígito verificador del RUT', () => {
    expect(rutValido('11.111.111-1')).toBe(true);
    expect(rutValido('18456789-k')).toBe(true);
    expect(rutValido('18456789-3')).toBe(false);
    expect(rutValido('abc')).toBe(false);
  });

  it('exige un bloque de disponibilidad que cubra toda la transmisión', () => {
    expect(estaDisponible(bloques, hora(15), hora(18))).toBe(true);
    expect(estaDisponible([{ inicio: hora(16), fin: hora(23) }], hora(15), hora(18))).toBe(false);
  });

  it('acepta a un colaborador libre y disponible', () => {
    expect(evaluarCandidato({ transmision, bloques, otrasAsignaciones: [], minutosTraslado: 90 }).apto).toBe(true);
  });

  it('rechaza choques de horario', () => {
    const otra = { nombreEvento: 'Partido', inicio: hora(17), fin: hora(20), comuna: 'Concepción' };
    const resultado = evaluarCandidato({ transmision, bloques, otrasAsignaciones: [otra], minutosTraslado: 90 });
    expect(resultado.apto).toBe(false);
    expect(resultado.motivo).toContain('Choque de horario');
  });

  it('rechaza un traslado insuficiente entre comunas distintas', () => {
    const otra = { nombreEvento: 'Charla', inicio: hora(12), fin: hora(14), comuna: 'Chillán' };
    const resultado = evaluarCandidato({ transmision, bloques, otrasAsignaciones: [otra], minutosTraslado: 90 });
    expect(resultado.motivo).toContain('traslado insuficiente');
  });

  it('permite transmisiones seguidas en la misma comuna', () => {
    const otra = { nombreEvento: 'Charla', inicio: hora(12), fin: hora(14, 30), comuna: 'Concepción' };
    expect(evaluarCandidato({ transmision, bloques, otrasAsignaciones: [otra], minutosTraslado: 90 }).apto).toBe(true);
  });

  it('suma porcentajes y calcula funciones sin cubrir', () => {
    const asignaciones = [
      { funcionId: 1, estado: 'CONFIRMADA', porcentajeComision: 12 },
      { funcionId: 1, estado: 'POR_CONFIRMAR', porcentajeComision: 12.5 },
    ];
    expect(sumaPorcentajes(asignaciones)).toBe(24.5);
    const [camara] = coberturaDeFunciones([{ funcionId: 1, cantidad: 3, funcion: { nombre: 'Cámara' } }], asignaciones);
    expect(camara).toMatchObject({ confirmados: 1, porConfirmar: 1, sinCubrir: 1 });
  });
});