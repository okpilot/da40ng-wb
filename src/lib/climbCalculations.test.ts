import { describe, it, expect } from 'vitest';
import { calculateClimb } from './climbCalculations';
import type { ClimbInputs } from './types';

const baseInputs: ClimbInputs = {
  mass: 1200,
  elevation: 0,
  qnh: 1013,
  oat: 15,
  wheelFairings: true,
  flapRetractionHeight: 400,
  cruiseAltitude: 5000,
};

function calc(overrides: Partial<ClimbInputs> = {}) {
  return calculateClimb({ ...baseInputs, ...overrides });
}

// ── Derived conditions ───────────────────────────────────────────

describe('derived conditions', () => {
  it('computes PA at standard pressure', () => {
    const r = calc();
    expect(r.pressureAltitude).toBeCloseTo(0, 0);
  });

  it('computes PA with low QNH', () => {
    const r = calc({ qnh: 1005 });
    expect(r.pressureAltitude).toBeCloseTo(240, 0);
  });

  it('computes ISA temperature at sea level', () => {
    const r = calc();
    expect(r.isaTemperature).toBeCloseTo(15, 1);
  });

  it('computes ISA deviation', () => {
    const r = calc({ oat: 25 });
    expect(r.isaDeviation).toBeCloseTo(10, 1);
  });

  it('computes cruise PA with QNH correction', () => {
    const r = calc({ cruiseAltitude: 5000, qnh: 1005 });
    // cruisePa = 5000 + 30 × (1013 - 1005) = 5240
    expect(r.cruisePa).toBeCloseTo(5240, 0);
  });
});

// ── Take-off climb ROC (5.3.8) ──────────────────────────────────

describe('takeoff climb ROC', () => {
  it('returns known value at exact table point (1200 kg, SL, 10°C)', () => {
    const r = calc({ mass: 1200, oat: 10 });
    // AFM table: 1200 kg, SL, 10°C = 710 ft/min
    expect(r.takeoffClimbRoc).toBe(710);
  });

  it('returns known value at exact table point (1310 kg, SL, 0°C)', () => {
    const r = calc({ mass: 1310, oat: 0 });
    // AFM table: 1310 kg, SL, 0°C = 640 ft/min
    expect(r.takeoffClimbRoc).toBe(640);
  });

  it('returns known value at 1100 kg, SL, ISA', () => {
    const r = calc({ mass: 1100, oat: 15 });
    // SL ISA is 15°C; 1100 kg table: interpolating between 10°C (800) and 20°C (795)
    // At 50% between 10 and 20: lerp(800, 795, 0.5) = 797.5 → 798
    expect(r.takeoffClimbRoc).toBe(798);
  });

  it('applies fairings penalty of -20 ft/min when no fairings', () => {
    const withFairings = calc({ mass: 1310, oat: 0 });
    const withoutFairings = calc({ mass: 1310, oat: 0, wheelFairings: false });
    expect(withFairings.takeoffClimbRoc - withoutFairings.takeoffClimbRoc).toBe(20);
  });

  it('interpolates between weight tables', () => {
    // 1240 kg is 40/80 = 50% between 1200 and 1280
    const r = calc({ mass: 1240, oat: 0 });
    // 1200 kg SL 0°C = 720, 1280 kg SL 0°C = 655
    // lerp(720, 655, 0.5) = 687.5 → 688
    expect(r.takeoffClimbRoc).toBe(688);
  });

  it('returns N/A warning for hot+high conditions', () => {
    const r = calc({ mass: 1310, elevation: 16000, oat: 50 });
    expect(r.warnings.some((w) => w.message.includes('N/A'))).toBe(true);
    expect(r.takeoffClimbRoc).toBe(0);
  });
});

// ── Cruise climb ROC (5.3.9) ─────────────────────────────────────

describe('cruise climb ROC', () => {
  it('returns known value at exact table point (1200 kg, SL, 0°C)', () => {
    const r = calc({ mass: 1200, oat: 0 });
    // AFM table: 1200 kg, SL, 0°C = 745 ft/min
    expect(r.cruiseClimbRoc).toBe(745);
  });

  it('returns known value at 1310 kg, SL, -20°C', () => {
    const r = calc({ mass: 1310, oat: -20 });
    // AFM table: 1310 kg, SL, -20°C = 665 ft/min
    expect(r.cruiseClimbRoc).toBe(665);
  });

  it('applies fairings penalty of -40 ft/min when no fairings', () => {
    const withFairings = calc({ mass: 1200, oat: 0 });
    const withoutFairings = calc({ mass: 1200, oat: 0, wheelFairings: false });
    expect(withFairings.cruiseClimbRoc - withoutFairings.cruiseClimbRoc).toBe(40);
  });
});

// ── Gradient calculation ─────────────────────────────────────────

describe('gradient', () => {
  it('computes gradient using AFM formula: ROC/TAS × 0.98', () => {
    const r = calc({ mass: 1200, oat: 15 });
    // TAS at SL = CAS × (1 + 0.02 × 0) = CAS
    // T/O climb: TAS = 72 kt at SL
    // Gradient = ROC / TAS × 0.98
    expect(r.takeoffClimbTas).toBeCloseTo(72, 0);
    const expectedGradient = (r.takeoffClimbRoc / r.takeoffClimbTas) * 0.98;
    expect(r.takeoffClimbGradient).toBeCloseTo(expectedGradient, 2);
  });

  it('TAS increases with altitude', () => {
    const rLow = calc({ elevation: 0 });
    const rHigh = calc({ elevation: 8000 });
    expect(rHigh.takeoffClimbTas).toBeGreaterThan(rLow.takeoffClimbTas);
  });
});

// ── Climb segment (5.3.10) ───────────────────────────────────────

describe('climb segment', () => {
  it('calculates time/fuel/distance for SL to 5000 ft', () => {
    const r = calc({ mass: 1200, elevation: 0, cruiseAltitude: 5000, oat: 15 });
    expect(r.climbSegment).not.toBeNull();
    const seg = r.climbSegment!;
    // From SL: departure row = 0,0,0
    // At 5000 ft: interpolated between 4000 and 6000
    expect(seg.time).toBeGreaterThan(0);
    expect(seg.fuel).toBeGreaterThan(0);
    expect(seg.distance).toBeGreaterThan(0);
  });

  it('matches AFM example: 1310 kg, 2000→16000 ft', () => {
    // AFM example on page 5-23:
    // 1310 kg, departure 2000 ft PA, cruise 16000 ft PA
    // Time: 26 - 3 = 23 min, Fuel: 3.7 - 0.4 = 3.3 USG, Distance: 43 - 5 = 38 NM
    // OAT at departure 11°C → ISA dev = 11 - (15-2×2) = 11-11 = 0 → no ISA correction
    const r = calc({
      mass: 1310,
      elevation: 2000,
      qnh: 1013,
      oat: 11,
      cruiseAltitude: 16000,
    });
    const seg = r.climbSegment!;
    expect(seg).not.toBeNull();
    expect(Math.round(seg.time)).toBe(23);
    expect(seg.fuel).toBeCloseTo(3.3, 1);
    expect(Math.round(seg.distance)).toBe(38);
  });

  it('applies ISA correction for hot conditions', () => {
    // OAT 25°C at SL → ISA dev = +10°C
    // Correction: time & fuel ×1.05, distance ×1.10
    const cool = calc({ oat: 15, cruiseAltitude: 10000 });
    const hot = calc({ oat: 25, cruiseAltitude: 10000 });
    expect(hot.climbSegment!.time).toBeGreaterThan(cool.climbSegment!.time);
    expect(hot.climbSegment!.distance).toBeGreaterThan(cool.climbSegment!.distance);
  });

  it('returns null when cruise is below departure', () => {
    const r = calc({ elevation: 5000, cruiseAltitude: 3000 });
    expect(r.climbSegment).toBeNull();
    expect(r.warnings.some((w) => w.message.includes('at or below'))).toBe(true);
  });

  it('does not apply ISA correction for cool conditions', () => {
    // OAT 0°C at SL → ISA dev = -15°C → no correction (only positive ISA dev)
    const r = calc({ oat: 0, cruiseAltitude: 10000 });
    const seg = r.climbSegment!;
    expect(seg.isaTimeFuelFactor).toBe(1);
    expect(seg.isaDistanceFactor).toBe(1);
  });
});

// ── Warnings ─────────────────────────────────────────────────────

describe('warnings', () => {
  it('warns when mass exceeds MTOM', () => {
    const r = calc({ mass: 1350 });
    expect(r.warnings.some((w) => w.message.includes('exceeds'))).toBe(true);
  });

  it('warns when OAT below -20°C', () => {
    const r = calc({ oat: -30 });
    expect(r.warnings.some((w) => w.message.includes('-20°C'))).toBe(true);
  });

  it('warns when PA exceeds 16400 ft', () => {
    const r = calc({ elevation: 17000 });
    expect(r.warnings.some((w) => w.message.includes('16,400'))).toBe(true);
  });

  it('warns on low mass', () => {
    const r = calc({ mass: 1000 });
    expect(r.warnings.some((w) => w.message.includes('1100 kg'))).toBe(true);
  });
});
