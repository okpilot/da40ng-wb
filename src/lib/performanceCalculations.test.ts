import { describe, it, expect } from 'vitest';
import {
  pressureAltitude,
  isaTemperature,
  isaDeviation,
  densityAltitude,
  windComponents,
  interpolateVSpeeds,
  calculateTakeoff,
} from './performanceCalculations';
import type { TakeoffInputs } from './types';

// ── Atmospheric calculations ───────────────────────────────────────

describe('pressureAltitude', () => {
  it('returns elevation when QNH is standard', () => {
    expect(pressureAltitude(1000, 1013)).toBeCloseTo(1000, 0);
  });

  it('increases PA when QNH is below standard', () => {
    // QNH 1005 → PA = 1000 + 30 × (1013 - 1005) = 1000 + 240 = 1240
    expect(pressureAltitude(1000, 1005)).toBeCloseTo(1240, 0);
  });

  it('decreases PA when QNH is above standard', () => {
    // QNH 1020 → PA = 1000 + 30 × (1013 - 1020) = 1000 - 210 = 790
    expect(pressureAltitude(1000, 1020)).toBeCloseTo(790, 0);
  });

  it('works at sea level', () => {
    expect(pressureAltitude(0, 1013)).toBeCloseTo(0, 0);
  });
});

describe('isaTemperature', () => {
  it('returns 15°C at sea level', () => {
    expect(isaTemperature(0)).toBeCloseTo(15, 1);
  });

  it('returns 13°C at 1000 ft', () => {
    expect(isaTemperature(1000)).toBeCloseTo(13, 1);
  });

  it('returns 5°C at 5000 ft', () => {
    expect(isaTemperature(5000)).toBeCloseTo(5, 1);
  });

  it('returns -5°C at 10000 ft', () => {
    expect(isaTemperature(10000)).toBeCloseTo(-5, 1);
  });
});

describe('isaDeviation', () => {
  it('returns 0 for ISA conditions at sea level', () => {
    expect(isaDeviation(15, 0)).toBeCloseTo(0, 1);
  });

  it('positive deviation when hotter than ISA', () => {
    expect(isaDeviation(25, 0)).toBeCloseTo(10, 1);
  });

  it('negative deviation when colder than ISA', () => {
    expect(isaDeviation(5, 0)).toBeCloseTo(-10, 1);
  });
});

describe('densityAltitude', () => {
  it('equals PA at ISA conditions', () => {
    // At sea level, ISA = 15°C, so DA = 0 + 120 × (15 - 15) = 0
    expect(densityAltitude(0, 15)).toBeCloseTo(0, 0);
  });

  it('increases with temperature above ISA', () => {
    // PA = 0, OAT = 30°C → DA = 0 + 120 × (30 - 15) = 1800
    expect(densityAltitude(0, 30)).toBeCloseTo(1800, 0);
  });

  it('decreases with temperature below ISA', () => {
    // PA = 0, OAT = 0°C → DA = 0 + 120 × (0 - 15) = -1800
    expect(densityAltitude(0, 0)).toBeCloseTo(-1800, 0);
  });
});

// ── Wind calculations ──────────────────────────────────────────────

describe('windComponents', () => {
  it('pure headwind when wind equals runway heading', () => {
    const { headwind, crosswind } = windComponents(360, 20, 360);
    expect(headwind).toBeCloseTo(20, 1);
    expect(crosswind).toBeCloseTo(0, 1);
  });

  it('pure tailwind when wind is 180° off', () => {
    const { headwind, crosswind } = windComponents(180, 20, 360);
    expect(headwind).toBeCloseTo(-20, 1);
    expect(crosswind).toBeCloseTo(0, 0);
  });

  it('pure crosswind when wind is 90° off', () => {
    const { headwind, crosswind } = windComponents(90, 20, 360);
    expect(headwind).toBeCloseTo(0, 0);
    expect(crosswind).toBeCloseTo(20, 1);
  });

  it('calculates correct components for 45° offset', () => {
    const { headwind, crosswind } = windComponents(45, 20, 360);
    expect(headwind).toBeCloseTo(20 * Math.cos(45 * Math.PI / 180), 1);
    expect(crosswind).toBeCloseTo(20 * Math.sin(45 * Math.PI / 180), 1);
  });

  it('returns zero for calm wind', () => {
    const { headwind, crosswind } = windComponents(0, 0, 90);
    expect(headwind).toBeCloseTo(0, 1);
    expect(crosswind).toBeCloseTo(0, 1);
  });
});

// ── V-speeds ───────────────────────────────────────────────────────

describe('interpolateVSpeeds', () => {
  it('returns exact values at table weights', () => {
    expect(interpolateVSpeeds(1310)).toEqual({ vR: 67, v50: 72 });
    expect(interpolateVSpeeds(1280)).toEqual({ vR: 67, v50: 72 });
    expect(interpolateVSpeeds(1200)).toEqual({ vR: 65, v50: 70 });
    expect(interpolateVSpeeds(1100)).toEqual({ vR: 61, v50: 67 });
  });

  it('interpolates between table weights', () => {
    // Midpoint between 1200 (vR=65) and 1100 (vR=61) → vR ≈ 63
    const speeds = interpolateVSpeeds(1150);
    expect(speeds.vR).toBe(63);
    expect(speeds.v50).toBe(69); // midpoint 70 and 67, rounded
  });

  it('clamps below 1100 kg', () => {
    expect(interpolateVSpeeds(900)).toEqual({ vR: 61, v50: 67 });
  });

  it('clamps above 1310 kg', () => {
    expect(interpolateVSpeeds(1400)).toEqual({ vR: 67, v50: 72 });
  });
});

// ── Full calculation ───────────────────────────────────────────────

function makeInputs(overrides: Partial<TakeoffInputs> = {}): TakeoffInputs {
  return {
    mass: 1200,
    elevation: 0,
    qnh: 1013,
    oat: 15,
    windDirection: 0,
    windSpeed: 0,
    runwayHeading: 0,
    surface: 'paved',
    grassLength: 'lte5cm',
    rwycc: 6,
    softGround: false,
    slope: 0,
    wheelFairings: true,
    tora: 1200,
    toda: 1200,
    asda: 1200,
    lda: 1200,
    ...overrides,
  };
}

describe('calculateTakeoff', () => {
  describe('exact table lookups (no interpolation needed)', () => {
    it('returns exact AFM value for 1200 kg, SL, 0°C', () => {
      // 1200 kg table, SL row, 0°C col: GR=325, D50=490
      const result = calculateTakeoff(makeInputs({ mass: 1200, oat: 0 }));
      expect(result.torr).toBe(325);
      expect(result.todr).toBe(490);
    });

    it('returns exact AFM value for 1310 kg, SL, 0°C', () => {
      // 1310 kg table, SL row, 0°C col: GR=365, D50=550
      const result = calculateTakeoff(makeInputs({ mass: 1310, oat: 0 }));
      expect(result.torr).toBe(365);
      expect(result.todr).toBe(550);
    });

    it('returns exact AFM value for 1100 kg, SL, 0°C', () => {
      // 1100 kg table, SL row, 0°C col: GR=280, D50=430
      const result = calculateTakeoff(makeInputs({ mass: 1100, oat: 0 }));
      expect(result.torr).toBe(280);
      expect(result.todr).toBe(430);
    });

    it('returns exact AFM value for 1280 kg, 4000ft, 30°C', () => {
      // 1280 kg table, 4000ft row, 30°C col: GR=585, D50=830
      const result = calculateTakeoff(makeInputs({
        mass: 1280, elevation: 4000, qnh: 1013, oat: 30,
      }));
      expect(result.torr).toBe(585);
      expect(result.todr).toBe(830);
    });

    it('returns exact AFM value for 1200 kg, 3000ft, 20°C', () => {
      // 1200 kg table, 3000ft row, 20°C col: GR=445, D50=650
      const result = calculateTakeoff(makeInputs({
        mass: 1200, elevation: 3000, qnh: 1013, oat: 20,
      }));
      expect(result.torr).toBe(445);
      expect(result.todr).toBe(650);
    });
  });

  describe('OAT interpolation at exact weight and PA', () => {
    it('interpolates between OAT columns for 1200 kg at SL, 15°C', () => {
      // 1200 kg, SL: 10°C→GR=345,D50=520. 20°C→GR=365,D50=540.
      // 15°C is midpoint: GR=355, D50=530
      const result = calculateTakeoff(makeInputs({ mass: 1200, oat: 15 }));
      expect(result.torr).toBe(355);
      expect(result.todr).toBe(530);
    });
  });

  describe('weight interpolation', () => {
    it('interpolates between 1200 and 1280 kg tables', () => {
      // At SL, 0°C: 1200kg→GR=325, 1280kg→GR=365. Mass 1240 is 50% between.
      // Expected GR = 345
      const result = calculateTakeoff(makeInputs({ mass: 1240, oat: 0 }));
      expect(result.torr).toBe(345);
    });
  });

  describe('OAT clamping', () => {
    it('clamps OAT below 0°C to 0°C with warning', () => {
      const result = calculateTakeoff(makeInputs({ oat: -10 }));
      expect(result.oatClamped).toBe(true);
      expect(result.clampedOat).toBe(0);
      expect(result.warnings.some(w => w.message.includes('0°C'))).toBe(true);
      expect(result.clampedOat).toBe(0);
    });

    it('warns for OAT above 50°C', () => {
      const result = calculateTakeoff(makeInputs({ oat: 55 }));
      expect(result.oatClamped).toBe(true);
      expect(result.warnings.some(w => w.message.includes('50°C'))).toBe(true);
      expect(result.clampedOat).toBe(50);
    });
  });

  describe('mass clamping', () => {
    it('warns for mass below 1100 kg', () => {
      const result = calculateTakeoff(makeInputs({ mass: 900 }));
      expect(result.warnings.some(w => w.message.includes('1100 kg'))).toBe(true);
      // Should still produce valid results (uses 1100 kg table)
      expect(result.torr).toBeGreaterThan(0);
      // Should produce same result as 1100 kg
      const ref = calculateTakeoff(makeInputs({ mass: 1100 }));
      expect(result.torr).toBe(ref.torr);
      expect(result.todr).toBe(ref.todr);
    });
  });

  describe('correction factors', () => {
    const baseInputs = makeInputs({ mass: 1200, oat: 15 });
    const baseResult = calculateTakeoff(baseInputs);

    it('grass dry ≤5cm increases ground roll by ~10%', () => {
      const result = calculateTakeoff(makeInputs({
        ...baseInputs, surface: 'grass', grassLength: 'lte5cm',
      }));
      // GR should be ~10% higher, D50 increases by the GR increase only
      expect(result.torr).toBeGreaterThan(baseResult.torr * 1.05);
      expect(result.torr).toBeLessThan(baseResult.torr * 1.15);
    });

    it('wet grass adds ×1.20 on top of dry grass factor', () => {
      const dryResult = calculateTakeoff(makeInputs({
        ...baseInputs, surface: 'grass', grassLength: 'lte5cm', rwycc: 6,
      }));
      const wetResult = calculateTakeoff(makeInputs({
        ...baseInputs, surface: 'grass', grassLength: 'lte5cm', rwycc: 5,
      }));
      // Wet should be ~20% more than dry grass
      expect(wetResult.torr).toBeGreaterThan(dryResult.torr * 1.15);
      expect(wetResult.torr).toBeLessThan(dryResult.torr * 1.25);
    });

    it('headwind decreases distances', () => {
      const result = calculateTakeoff(makeInputs({
        ...baseInputs, windDirection: 0, windSpeed: 12, runwayHeading: 0,
      }));
      expect(result.torr).toBeLessThan(baseResult.torr);
      expect(result.todr).toBeLessThan(baseResult.todr);
    });

    it('tailwind increases distances', () => {
      const result = calculateTakeoff(makeInputs({
        ...baseInputs, windDirection: 180, windSpeed: 5, runwayHeading: 0,
      }));
      expect(result.torr).toBeGreaterThan(baseResult.torr);
      expect(result.todr).toBeGreaterThan(baseResult.todr);
    });

    it('uphill slope increases ground roll', () => {
      const result = calculateTakeoff(makeInputs({
        ...baseInputs, slope: 2.0,
      }));
      // Slope 2% → factor 1 + 0.15 × 2 = 1.30
      expect(result.torr).toBeGreaterThan(baseResult.torr * 1.25);
      expect(result.torr).toBeLessThan(baseResult.torr * 1.35);
    });

    it('no fairings adds 20m GR and 30m D50', () => {
      const result = calculateTakeoff(makeInputs({
        ...baseInputs, wheelFairings: false,
      }));
      expect(result.torr).toBe(baseResult.torr + 20);
      expect(result.todr).toBe(baseResult.todr + 30);
    });
  });

  describe('derived conditions', () => {
    it('calculates correct pressure altitude', () => {
      const result = calculateTakeoff(makeInputs({ elevation: 896, qnh: 1005 }));
      // PA = 896 + 30 × (1013 - 1005) = 896 + 240 = 1136
      expect(result.pressureAltitude).toBeCloseTo(1136, 0);
    });

    it('calculates correct wind components', () => {
      const result = calculateTakeoff(makeInputs({
        windDirection: 270, windSpeed: 10, runwayHeading: 360,
      }));
      // 270° wind on RWY 360 → 90° off → pure crosswind
      expect(result.headwind).toBeCloseTo(0, 0);
      expect(result.crosswind).toBeCloseTo(10, 0);
    });
  });

  describe('warnings', () => {
    it('warns when TORR exceeds TORA', () => {
      const result = calculateTakeoff(makeInputs({
        mass: 1310, oat: 40, elevation: 5000, qnh: 1013, tora: 300,
      }));
      expect(result.warnings.some(w => w.message.includes('TORR') && w.message.includes('TORA'))).toBe(true);
    });

    it('warns about wet paved with no AFM data', () => {
      const result = calculateTakeoff(makeInputs({ surface: 'paved', rwycc: 5 }));
      expect(result.warnings.some(w => w.message.includes('wet paved'))).toBe(true);
    });

    it('warns when crosswind exceeds max demonstrated', () => {
      const result = calculateTakeoff(makeInputs({
        windDirection: 90, windSpeed: 30, runwayHeading: 0,
      }));
      expect(result.warnings.some(w => w.message.includes('Crosswind') && w.message.includes('25'))).toBe(true);
    });
  });

  describe('N/A cells', () => {
    it('returns warning when table cells are N/A', () => {
      // At 10000 ft PA, 50°C, all tables have N/A
      const result = calculateTakeoff(makeInputs({
        elevation: 10000, qnh: 1013, oat: 50,
      }));
      expect(result.warnings.some(w => w.message.includes('N/A'))).toBe(true);
      expect(result.torr).toBe(0);
      expect(result.todr).toBe(0);
    });
  });

  describe('high altitude performance', () => {
    it('produces longer distances at high altitude', () => {
      const slResult = calculateTakeoff(makeInputs({ elevation: 0, oat: 15 }));
      const hiResult = calculateTakeoff(makeInputs({ elevation: 5000, oat: 15 }));
      expect(hiResult.torr).toBeGreaterThan(slResult.torr);
      expect(hiResult.todr).toBeGreaterThan(slResult.todr);
    });

    it('produces longer distances at high temperature', () => {
      const coolResult = calculateTakeoff(makeInputs({ oat: 0 }));
      const hotResult = calculateTakeoff(makeInputs({ oat: 40 }));
      expect(hotResult.torr).toBeGreaterThan(coolResult.torr);
      expect(hotResult.todr).toBeGreaterThan(coolResult.todr);
    });
  });
});
