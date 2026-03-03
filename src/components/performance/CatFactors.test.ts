import { describe, it, expect } from 'vitest';
import { getCatChecks } from './CatFactors';
import type { TakeoffResult, TakeoffInputs } from '@/lib/types';

// Minimal stubs — getCatChecks only reads todr, warnings, tora, toda, asda
function stubInputs(overrides: Partial<TakeoffInputs> = {}): TakeoffInputs {
  return {
    mass: 1150, elevation: 0, qnh: 1013, oat: 15,
    windDirection: 0, windSpeed: 0, runwayHeading: 0,
    surface: 'paved', grassLength: 'lte5cm', rwycc: 6,
    softGround: false, slope: 0, wheelFairings: false,
    tora: 1200, toda: 1200, asda: 1200, lda: 1200,
    ...overrides,
  };
}

function stubResult(overrides: Partial<TakeoffResult> = {}): TakeoffResult {
  return {
    pressureAltitude: 0, densityAltitude: 0, isaTemperature: 15, isaDeviation: 0,
    headwind: 0, crosswind: 0,
    interpolation: {} as TakeoffResult['interpolation'],
    corrections: [], torr: 300, todr: 437,
    vSpeeds: { vR: 66, v50: 73 },
    warnings: [], oatClamped: false, clampedOat: 15,
    ...overrides,
  };
}

// ── No SWY/CWY — single TORA / 1.25 check ──────────────────────

describe('getCatChecks — no SWY/CWY', () => {
  const inputs = stubInputs({ tora: 1200, toda: 1200, asda: 1200 });
  const result = stubResult({ todr: 437 });
  const checks = getCatChecks(result, inputs);

  it('returns one check', () => {
    expect(checks).toHaveLength(1);
  });

  it('computes limit as floor(TORA / 1.25)', () => {
    expect(checks[0].limit).toBe(Math.floor(1200 / 1.25)); // 960
  });

  it('has correct divisor and source', () => {
    expect(checks[0].divisor).toBe(1.25);
    expect(checks[0].sourceLabel).toBe('TORA');
  });

  it('passes when TODR < limit', () => {
    expect(checks[0].todr).toBeLessThanOrEqual(checks[0].limit);
  });
});

// ── With SWY/CWY — three checks ─────────────────────────────────

describe('getCatChecks — with SWY and CWY', () => {
  const inputs = stubInputs({ tora: 1200, toda: 1300, asda: 1260 });
  const result = stubResult({ todr: 437 });
  const checks = getCatChecks(result, inputs);

  it('returns three checks', () => {
    expect(checks).toHaveLength(3);
  });

  it('first check: TORA / 1.0', () => {
    expect(checks[0].sourceLabel).toBe('TORA');
    expect(checks[0].divisor).toBe(1.0);
    expect(checks[0].limit).toBe(1200);
  });

  it('second check: TODA / 1.15', () => {
    expect(checks[1].sourceLabel).toBe('TODA');
    expect(checks[1].divisor).toBe(1.15);
    expect(checks[1].limit).toBe(Math.floor(1300 / 1.15)); // 1130
  });

  it('third check: ASDA / 1.30', () => {
    expect(checks[2].sourceLabel).toBe('ASDA');
    expect(checks[2].divisor).toBe(1.3);
    expect(checks[2].limit).toBe(Math.floor(1260 / 1.3)); // 969
  });

  it('binding constraint is ASDA / 1.30 (lowest limit)', () => {
    const binding = checks.reduce((min, c) => (c.limit < min.limit ? c : min), checks[0]);
    expect(binding.sourceLabel).toBe('ASDA');
    expect(binding.limit).toBe(Math.floor(1260 / 1.3));
  });

  it('all checks pass when TODR is well under limits', () => {
    expect(checks.every((c) => c.todr <= c.limit)).toBe(true);
  });
});

// ── Fail scenario ────────────────────────────────────────────────

describe('getCatChecks — fail scenario', () => {
  it('fails when TODR exceeds factored limit', () => {
    const inputs = stubInputs({ tora: 500, toda: 500, asda: 500 });
    const result = stubResult({ todr: 437 });
    const checks = getCatChecks(result, inputs);

    // limit = floor(500 / 1.25) = 400, TODR 437 > 400
    expect(checks[0].limit).toBe(400);
    expect(checks[0].todr).toBeGreaterThan(checks[0].limit);
  });

  it('fails only the tightest check with SWY/CWY', () => {
    const inputs = stubInputs({ tora: 1000, toda: 1100, asda: 600 });
    const result = stubResult({ todr: 500 });
    const checks = getCatChecks(result, inputs);

    // TORA/1.0 = 1000 ≥ 500 → pass
    expect(checks[0].todr <= checks[0].limit).toBe(true);
    // TODA/1.15 = floor(1100/1.15) = 956 ≥ 500 → pass
    expect(checks[1].todr <= checks[1].limit).toBe(true);
    // ASDA/1.30 = floor(600/1.3) = 461 < 500 → fail
    expect(checks[2].todr <= checks[2].limit).toBe(false);
  });
});

// ── Only CWY (TODA > TORA, ASDA == TORA) ────────────────────────

describe('getCatChecks — CWY only', () => {
  it('triggers three-check mode even with only CWY', () => {
    const inputs = stubInputs({ tora: 1200, toda: 1400, asda: 1200 });
    const result = stubResult({ todr: 437 });
    const checks = getCatChecks(result, inputs);
    expect(checks).toHaveLength(3);
  });
});
