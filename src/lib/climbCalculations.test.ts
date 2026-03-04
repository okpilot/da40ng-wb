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

  it('computes flap retraction PA', () => {
    const r = calc({ elevation: 500, qnh: 1013, flapRetractionHeight: 400 });
    // PA = 500, flapRetractionPa = 500 + 400 = 900
    expect(r.flapRetractionPa).toBeCloseTo(900, 0);
  });

  it('flap retraction PA includes QNH correction', () => {
    const r = calc({ elevation: 0, qnh: 1005, flapRetractionHeight: 400 });
    // PA = 240, flapRetractionPa = 240 + 400 = 640
    expect(r.flapRetractionPa).toBeCloseTo(640, 0);
  });
});

// ── Take-off climb ROC (5.3.8) ──────────────────────────────────

describe('takeoff climb ROC', () => {
  it('is evaluated at flap retraction PA, not departure PA', () => {
    // With flapRetractionHeight=0, T/O climb is at departure PA (SL)
    const atDep = calc({ flapRetractionHeight: 0 });
    // With flapRetractionHeight=4000, T/O climb is at 4000 ft PA
    const atFr = calc({ flapRetractionHeight: 4000 });
    // Higher PA → lower ROC
    expect(atFr.takeoffClimb.roc).toBeLessThan(atDep.takeoffClimb.roc);
    // Verify the PA stored matches
    expect(atDep.takeoffClimb.pa).toBeCloseTo(0, 0);
    expect(atFr.takeoffClimb.pa).toBeCloseTo(4000, 0);
  });

  it('returns known value at exact table point (1200 kg, SL, 10°C) with flapRetraction=0', () => {
    const r = calc({ mass: 1200, oat: 10, flapRetractionHeight: 0 });
    // AFM table: 1200 kg, SL, 10°C = 710 ft/min
    expect(r.takeoffClimb.roc).toBe(710);
  });

  it('returns known value at exact table point (1310 kg, SL, 0°C) with flapRetraction=0', () => {
    const r = calc({ mass: 1310, oat: 0, flapRetractionHeight: 0 });
    // AFM table: 1310 kg, SL, 0°C = 640 ft/min
    expect(r.takeoffClimb.roc).toBe(640);
  });

  it('returns known value at 1100 kg, SL, ISA with flapRetraction=0', () => {
    const r = calc({ mass: 1100, oat: 15, flapRetractionHeight: 0 });
    // SL ISA is 15°C; 1100 kg table: interpolating between 10°C (800) and 20°C (795)
    // At 50% between 10 and 20: lerp(800, 795, 0.5) = 797.5 → 798
    expect(r.takeoffClimb.roc).toBe(798);
  });

  it('applies fairings penalty of -20 ft/min when no fairings', () => {
    const withFairings = calc({ mass: 1310, oat: 0, flapRetractionHeight: 0 });
    const withoutFairings = calc({ mass: 1310, oat: 0, wheelFairings: false, flapRetractionHeight: 0 });
    expect(withFairings.takeoffClimb.roc - withoutFairings.takeoffClimb.roc).toBe(20);
  });

  it('interpolates between weight tables', () => {
    // 1240 kg is 40/80 = 50% between 1200 and 1280
    const r = calc({ mass: 1240, oat: 0, flapRetractionHeight: 0 });
    // 1200 kg SL 0°C = 720, 1280 kg SL 0°C = 655
    // lerp(720, 655, 0.5) = 687.5 → 688
    expect(r.takeoffClimb.roc).toBe(688);
  });

  it('returns N/A warning for hot+high conditions', () => {
    const r = calc({ mass: 1310, elevation: 16000, oat: 50 });
    expect(r.warnings.some((w) => w.message.includes('N/A'))).toBe(true);
    expect(r.takeoffClimb.roc).toBe(0);
  });
});

// ── Cruise climb ROC (5.3.9) ─────────────────────────────────────

describe('cruise climb ROC', () => {
  it('start is at flap retraction PA', () => {
    const r = calc({ flapRetractionHeight: 400 });
    expect(r.cruiseClimbStart.pa).toBeCloseTo(400, 0);
  });

  it('TOC is at cruise PA', () => {
    const r = calc({ cruiseAltitude: 10000, qnh: 1013 });
    expect(r.cruiseClimbToc.pa).toBeCloseTo(10000, 0);
  });

  it('returns known value at exact table point (1200 kg, SL, 0°C) with flapRetraction=0', () => {
    const r = calc({ mass: 1200, oat: 0, flapRetractionHeight: 0 });
    // AFM table: 1200 kg, SL, 0°C = 745 ft/min
    expect(r.cruiseClimbStart.roc).toBe(745);
  });

  it('returns known value at 1310 kg, SL, -20°C with flapRetraction=0', () => {
    const r = calc({ mass: 1310, oat: -20, flapRetractionHeight: 0 });
    // AFM table: 1310 kg, SL, -20°C = 665 ft/min
    expect(r.cruiseClimbStart.roc).toBe(665);
  });

  it('applies fairings penalty of -40 ft/min when no fairings', () => {
    const withFairings = calc({ mass: 1200, oat: 0, flapRetractionHeight: 0 });
    const withoutFairings = calc({ mass: 1200, oat: 0, wheelFairings: false, flapRetractionHeight: 0 });
    expect(withFairings.cruiseClimbStart.roc - withoutFairings.cruiseClimbStart.roc).toBe(40);
  });

  it('TOC ROC is lower than start ROC at higher altitude', () => {
    const r = calc({ elevation: 0, cruiseAltitude: 10000, flapRetractionHeight: 0 });
    expect(r.cruiseClimbToc.roc).toBeLessThan(r.cruiseClimbStart.roc);
  });
});

// ── Average cruise climb ────────────────────────────────────────

describe('cruise climb average', () => {
  it('average ROC = (start + TOC) / 2', () => {
    const r = calc({ elevation: 0, cruiseAltitude: 10000, flapRetractionHeight: 0 });
    const expectedAvgRoc = Math.round((r.cruiseClimbStart.roc + r.cruiseClimbToc.roc) / 2);
    expect(r.cruiseClimbAvg.roc).toBe(expectedAvgRoc);
  });

  it('average PA = (flapRetractionPa + cruisePa) / 2', () => {
    const r = calc({ elevation: 0, qnh: 1013, cruiseAltitude: 10000, flapRetractionHeight: 400 });
    expect(r.cruiseClimbAvg.pa).toBeCloseTo((400 + 10000) / 2, 0);
  });

  it('average gradient = avg ROC / avg TAS × 0.98 (not average of two gradients)', () => {
    const r = calc({ elevation: 0, cruiseAltitude: 10000, flapRetractionHeight: 0 });
    const avgRoc = (r.cruiseClimbStart.roc + r.cruiseClimbToc.roc) / 2;
    const avgTas = (r.cruiseClimbStart.tas + r.cruiseClimbToc.tas) / 2;
    const expectedGradient = (avgRoc / avgTas) * 0.98;
    expect(r.cruiseClimbAvg.gradient).toBeCloseTo(expectedGradient, 2);
  });

  it('average is N/A if either start or TOC is N/A', () => {
    // Very high cruise altitude to trigger N/A at TOC
    const r = calc({ mass: 1310, elevation: 0, cruiseAltitude: 16400, oat: 50 });
    if (r.cruiseClimbToc.isNa || r.cruiseClimbStart.isNa) {
      expect(r.cruiseClimbAvg.isNa).toBe(true);
    }
  });
});

// ── Gradient calculation ─────────────────────────────────────────

describe('gradient', () => {
  it('computes gradient using AFM formula: ROC/TAS × 0.98', () => {
    const r = calc({ mass: 1200, oat: 15, flapRetractionHeight: 0 });
    // TAS at SL = CAS × (1 + 0.02 × 0) = CAS
    // T/O climb: TAS = 72 kt at SL
    // Gradient = ROC / TAS × 0.98
    expect(r.takeoffClimb.tas).toBeCloseTo(72, 0);
    const expectedGradient = (r.takeoffClimb.roc / r.takeoffClimb.tas) * 0.98;
    expect(r.takeoffClimb.gradient).toBeCloseTo(expectedGradient, 2);
  });

  it('TAS increases with altitude', () => {
    const rLow = calc({ elevation: 0, flapRetractionHeight: 0 });
    const rHigh = calc({ elevation: 8000, flapRetractionHeight: 0 });
    expect(rHigh.takeoffClimb.tas).toBeGreaterThan(rLow.takeoffClimb.tas);
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
