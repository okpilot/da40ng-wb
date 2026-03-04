import { describe, it, expect } from 'vitest';
import { calculateCruise } from './cruiseCalculations';
import type { CruiseInputs } from './types';

const baseInputs: CruiseInputs = {
  cruiseAltitude: 6000,
  qnh: 1013,
  oat: 3, // ISA at 6000 ft
  power: 75,
  wheelFairings: true,
  usableFuelUsg: 28,
  reserveMinutes: 30,
  alternateDistance: 0,
  alternateAltitude: 3000,
};

function calc(overrides: Partial<CruiseInputs> = {}) {
  return calculateCruise({ ...baseInputs, ...overrides });
}

// ── Derived conditions ───────────────────────────────────────────

describe('derived conditions', () => {
  it('computes PA at standard pressure', () => {
    const r = calc();
    expect(r.pressureAltitude).toBeCloseTo(6000, 0);
  });

  it('computes PA with low QNH', () => {
    const r = calc({ qnh: 1005 });
    // PA = 6000 + 30 × (1013 - 1005) = 6240
    expect(r.pressureAltitude).toBeCloseTo(6240, 0);
  });

  it('computes ISA temperature at 6000 ft', () => {
    const r = calc();
    // ISA = 15 - 2 × 6 = 3°C
    expect(r.isaTemperature).toBeCloseTo(3, 1);
  });

  it('computes zero ISA deviation at ISA conditions', () => {
    const r = calc();
    expect(r.isaDeviation).toBeCloseTo(0, 1);
  });

  it('computes positive ISA deviation', () => {
    const r = calc({ oat: 13 });
    expect(r.isaDeviation).toBeCloseTo(10, 1);
  });

  it('computes density altitude', () => {
    const r = calc({ oat: 13 });
    // DA = 6000 + 120 × (13 - 3) = 7200
    expect(r.densityAltitude).toBeCloseTo(7200, 0);
  });
});

// ── Table lookup at exact conditions ─────────────────────────────

describe('exact table lookup', () => {
  it('matches table at PA 6000, ISA, 75%', () => {
    // AFM: PA 6000, ISA, 75% → ff=6.6, TAS=129
    const r = calc();
    expect(r.fuelFlow).toBeCloseTo(6.6, 1);
    expect(r.tas).toBeCloseTo(129, 0);
  });

  it('matches table at PA 6000, ISA, 92%', () => {
    // AFM: PA 6000, ISA, 92% → ff=8.3, TAS=141
    const r = calc({ power: 92 });
    expect(r.fuelFlow).toBeCloseTo(8.3, 1);
    expect(r.tas).toBeCloseTo(141, 0);
  });

  it('matches table at PA 6000, ISA, 60%', () => {
    // AFM: PA 6000, ISA, 60% → ff=5.1, TAS=116
    const r = calc({ power: 60 });
    expect(r.fuelFlow).toBeCloseTo(5.1, 1);
    expect(r.tas).toBeCloseTo(116, 0);
  });

  it('matches table at PA 6000, ISA, 45%', () => {
    // AFM: PA 6000, ISA, 45% → ff=4.0, TAS=98
    const r = calc({ power: 45 });
    expect(r.fuelFlow).toBeCloseTo(4.0, 1);
    expect(r.tas).toBeCloseTo(98, 0);
  });

  it('matches table at PA 10000, ISA+10, 75%', () => {
    // PA 10000, ISA+10 → ff=6.6, TAS=135
    // ISA at 10000 = 15 - 20 = -5. OAT for ISA+10 = -5+10 = 5
    const r = calc({ cruiseAltitude: 10000, oat: 5, power: 75 });
    expect(r.fuelFlow).toBeCloseTo(6.6, 1);
    expect(r.tas).toBeCloseTo(135, 0);
  });
});

// ── Interpolation ────────────────────────────────────────────────

describe('interpolation', () => {
  it('interpolates between PA levels', () => {
    // PA 7000 (midpoint of 6000–8000), ISA
    // ISA at 7000 = 15 - 14 = 1. OAT = 1 for ISA deviation 0.
    // 75%: PA 6000 → TAS=129, PA 8000 → TAS=131 → midpoint ≈ 130
    const r = calc({ cruiseAltitude: 7000, oat: 1, power: 75 });
    expect(r.tas).toBeCloseTo(130, 0);
    expect(r.fuelFlow).toBeCloseTo(6.6, 1);
  });

  it('interpolates between ISA deviations', () => {
    // PA 6000, ISA+5 (midpoint of ISA and ISA+10)
    // ISA at 6000 = 3. OAT = 3+5 = 8.
    // 75%: ISA → TAS=129, ISA+10 → TAS=130 → midpoint ≈ 129.5
    const r = calc({ oat: 8, power: 75 });
    expect(r.tas).toBeCloseTo(129.5, 0);
  });

  it('provides interpolation details', () => {
    const r = calc({ cruiseAltitude: 7000, oat: 1, power: 75 });
    expect(r.interpolation).not.toBeNull();
    expect(r.interpolation!.lowerPa).toBe(6000);
    expect(r.interpolation!.upperPa).toBe(8000);
    expect(r.interpolation!.paFraction).toBeCloseTo(0.5, 2);
    // ISA dev = 0 falls on [-10, 0] bracket with frac=1.0
    expect(r.interpolation!.lowerIsaDev).toBe(-10);
    expect(r.interpolation!.upperIsaDev).toBe(0);
    expect(r.interpolation!.isaDevFraction).toBeCloseTo(1.0, 2);
  });
});

// ── Wheel fairings correction ────────────────────────────────────

describe('wheel fairings', () => {
  it('applies -4% TAS without fairings', () => {
    const withFairings = calc();
    const withoutFairings = calc({ wheelFairings: false });
    expect(withoutFairings.tas).toBeCloseTo(withFairings.tas * 0.96, 1);
  });

  it('does not affect fuel flow', () => {
    const withFairings = calc();
    const withoutFairings = calc({ wheelFairings: false });
    expect(withoutFairings.fuelFlow).toBeCloseTo(withFairings.fuelFlow, 2);
  });
});

// ── Range and endurance ──────────────────────────────────────────

describe('range and endurance', () => {
  it('computes endurance from usable fuel', () => {
    // ff=6.6 USG/h, usable=28 USG → endurance = 28/6.6 ≈ 4.24 h
    const r = calc();
    expect(r.endurance).toBeCloseTo(28 / 6.6, 2);
  });

  it('computes range from endurance × TAS', () => {
    const r = calc();
    const expectedEndurance = 28 / r.fuelFlow;
    expect(r.range).toBeCloseTo(expectedEndurance * r.tas, 0);
  });

  it('uses long-range tank fuel quantity', () => {
    const r = calc({ usableFuelUsg: 39 });
    expect(r.endurance).toBeCloseTo(39 / 6.6, 2);
  });

  it('computes fuel flow in LPH', () => {
    const r = calc();
    expect(r.fuelFlowLph).toBeCloseTo(6.6 * 3.785, 1);
  });
});

// ── Clamping and warnings ────────────────────────────────────────

describe('warnings', () => {
  it('warns when PA below table range', () => {
    const r = calc({ cruiseAltitude: 500, qnh: 1013, oat: 14 });
    expect(r.warnings.some((w) => w.message.includes('below table minimum'))).toBe(true);
  });

  it('warns when PA above table range', () => {
    const r = calc({ cruiseAltitude: 18000 });
    expect(r.warnings.some((w) => w.message.includes('exceeds table maximum'))).toBe(true);
  });

  it('warns when ISA deviation below range', () => {
    // ISA at 6000 = 3. OAT = -20 → ISA dev = -23
    const r = calc({ oat: -20 });
    expect(r.warnings.some((w) => w.message.includes('below table minimum'))).toBe(true);
  });

  it('warns when ISA deviation above range', () => {
    // ISA at 6000 = 3. OAT = 40 → ISA dev = +37
    const r = calc({ oat: 40 });
    expect(r.warnings.some((w) => w.message.includes('exceeds table maximum'))).toBe(true);
  });

  it('no warnings at normal conditions', () => {
    const r = calc();
    expect(r.warnings).toHaveLength(0);
  });
});

// ── ISA+30 power-limited values ──────────────────────────────────

describe('power-limited conditions', () => {
  it('returns reduced ff at ISA+30 high altitude', () => {
    // PA 14000, ISA+30: 92% → ff=7.6 (not 8.4)
    // ISA at 14000 = 15-28 = -13. OAT for ISA+30 = -13+30 = 17.
    const r = calc({ cruiseAltitude: 14000, oat: 17, power: 92 });
    expect(r.fuelFlow).toBeCloseTo(7.6, 1);
    expect(r.tas).toBeCloseTo(149, 0);
  });

  it('75% still achievable at PA 14000 ISA+30', () => {
    const r = calc({ cruiseAltitude: 14000, oat: 17, power: 75 });
    expect(r.fuelFlow).toBeCloseTo(6.6, 1);
    expect(r.tas).toBeCloseTo(142, 0);
  });
});

// ── Fuel planning: reserves and alternate ────────────────────────

describe('fuel planning — reserves', () => {
  it('computes 30-min VFR reserve fuel', () => {
    const r = calc({ reserveMinutes: 30 });
    // 30/60 × 4.0 = 2.0 USG
    expect(r.reserveFuelUsg).toBeCloseTo(2.0, 2);
  });

  it('computes 45-min IFR reserve fuel', () => {
    const r = calc({ reserveMinutes: 45 });
    // 45/60 × 4.0 = 3.0 USG
    expect(r.reserveFuelUsg).toBeCloseTo(3.0, 2);
  });

  it('computes trip fuel as usable minus reserve', () => {
    const r = calc({ reserveMinutes: 30 });
    // 28 - 2.0 - 0 (no alternate) = 26.0
    expect(r.tripFuel).toBeCloseTo(26.0, 1);
  });

  it('computes range with reserve', () => {
    const r = calc({ reserveMinutes: 30 });
    // fuelAfterReserve = 26 USG, endurance = 26/6.6, range = endurance × TAS
    const expectedEndurance = 26 / r.fuelFlow;
    expect(r.rangeWithReserve).toBeCloseTo(expectedEndurance * r.tas, 0);
    expect(r.rangeWithAll).toBeCloseTo(r.rangeWithReserve, 0); // no alternate
  });

  it('range with reserve is less than total range', () => {
    const r = calc({ reserveMinutes: 30 });
    expect(r.rangeWithAll).toBeLessThan(r.range);
  });
});

describe('fuel planning — alternate', () => {
  it('computes alternate fuel for a known distance', () => {
    // 50 NM at 3000 ft altitude, 75% power
    const r = calc({ alternateDistance: 50, alternateAltitude: 3000 });
    expect(r.alternateFuelUsg).toBeGreaterThan(0);
    expect(r.alternateTas).toBeGreaterThan(0);
    expect(r.alternateFf).toBeGreaterThan(0);
    // altTime = 50/TAS, altFuel = altTime × FF
    const expectedTime = 50 / r.alternateTas;
    expect(r.alternateFuelUsg).toBeCloseTo(expectedTime * r.alternateFf, 2);
  });

  it('zero alternate distance = zero alternate fuel', () => {
    const r = calc({ alternateDistance: 0 });
    expect(r.alternateFuelUsg).toBe(0);
    expect(r.alternateTas).toBe(0);
    expect(r.alternateFf).toBe(0);
  });

  it('trip fuel accounts for both reserve and alternate', () => {
    const r = calc({ reserveMinutes: 30, alternateDistance: 50, alternateAltitude: 3000 });
    // trip = max(0, 28 - 2.0 - alternateFuel)
    expect(r.tripFuel).toBeCloseTo(Math.max(0, 28 - 2.0 - r.alternateFuelUsg), 1);
  });

  it('warns when reserves exceed usable fuel', () => {
    // 45 min reserve = 3.0 USG, alternate ~2 USG, usable = 4 USG → should warn
    const r = calc({ usableFuelUsg: 4, reserveMinutes: 45, alternateDistance: 50, alternateAltitude: 3000 });
    expect(r.warnings.some((w) => w.message.includes('exceeds usable fuel'))).toBe(true);
    expect(r.warnings.some((w) => w.level === 'red')).toBe(true);
  });

  it('no warning when fuel is sufficient', () => {
    const r = calc({ reserveMinutes: 30, alternateDistance: 50 });
    expect(r.warnings.some((w) => w.message.includes('exceeds usable fuel'))).toBe(false);
  });
});
