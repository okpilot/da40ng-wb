import { describe, it, expect } from 'vitest';
import { calculateLanding } from './landingCalculations';
import type { LandingInputs } from './types';

const baseInputs: LandingInputs = {
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
  slope: 0,
  wheelFairings: true,
  flap: 'LDG',
  lda: 2000,
};

function calc(overrides: Partial<LandingInputs> = {}) {
  return calculateLanding({ ...baseInputs, ...overrides });
}

// ── Derived conditions ───────────────────────────────────────────

describe('derived conditions', () => {
  it('computes PA at standard pressure', () => {
    const r = calc();
    expect(r.pressureAltitude).toBeCloseTo(0, 0);
  });

  it('computes PA with low QNH', () => {
    const r = calc({ qnh: 1005 });
    // PA = 0 + 30 × (1013 - 1005) = 240
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

  it('computes density altitude', () => {
    const r = calc({ oat: 25 });
    // DA = 0 + 120 × (25 - 15) = 1200
    expect(r.densityAltitude).toBeCloseTo(1200, 0);
  });

  it('computes headwind component', () => {
    const r = calc({ windDirection: 0, windSpeed: 20, runwayHeading: 0 });
    expect(r.headwind).toBeCloseTo(20, 0);
  });

  it('computes tailwind as negative headwind', () => {
    const r = calc({ windDirection: 180, windSpeed: 10, runwayHeading: 0 });
    expect(r.headwind).toBeCloseTo(-10, 0);
  });
});

// ── Exact table lookup ──────────────────────────────────────────

describe('exact table lookup', () => {
  it('matches LDG table at 1200 kg, SL, 10°C', () => {
    // AFM table: 1200 kg, SL, 10°C → GR=290, D50=620
    const r = calc({ mass: 1200, oat: 10 });
    expect(r.lgrr).toBeCloseTo(290, 0);
    expect(r.ldr).toBeCloseTo(620, 0);
  });

  it('matches LDG table at 1310 kg, SL, 0°C', () => {
    // AFM: 1310 kg, SL, 0°C → GR=305, D50=620
    const r = calc({ mass: 1310, oat: 0 });
    expect(r.lgrr).toBeCloseTo(305, 0);
    expect(r.ldr).toBeCloseTo(620, 0);
  });

  it('matches LDG table at 1100 kg, SL, 20°C', () => {
    // AFM: 1100 kg, SL, 20°C → GR=275, D50=630
    const r = calc({ mass: 1100, oat: 20 });
    expect(r.lgrr).toBeCloseTo(275, 0);
    expect(r.ldr).toBeCloseTo(630, 0);
  });

  it('matches LDG table at 1200 kg, 5000 ft, 20°C', () => {
    // AFM: 1200 kg, 5000 ft, 20°C → GR=370, D50=730
    const r = calc({ mass: 1200, elevation: 5000, oat: 20 });
    expect(r.lgrr).toBeCloseTo(370, 0);
    expect(r.ldr).toBeCloseTo(730, 0);
  });
});

// ── Abnormal flap lookup ────────────────────────────────────────

describe('abnormal flap lookup', () => {
  it('matches abnormal table at 1200 kg, SL, 10°C, TO flap', () => {
    // landingAbnormalTable1200: SL, 10°C → [340, 780]
    const r = calc({ mass: 1200, oat: 10, flap: 'TO' });
    expect(r.lgrr).toBeCloseTo(340, 0);
    expect(r.ldr).toBeCloseTo(780, 0);
  });

  it('returns higher distances for abnormal flap than LDG', () => {
    const ldg = calc({ mass: 1200, oat: 10 });
    const to = calc({ mass: 1200, oat: 10, flap: 'TO' });
    expect(to.ldr).toBeGreaterThan(ldg.ldr);
    expect(to.lgrr).toBeGreaterThan(ldg.lgrr);
  });

  it('preserves flap setting in result', () => {
    expect(calc({ flap: 'LDG' }).flap).toBe('LDG');
    expect(calc({ flap: 'TO' }).flap).toBe('TO');
    expect(calc({ flap: 'UP' }).flap).toBe('UP');
  });
});

// ── Weight interpolation ────────────────────────────────────────

describe('weight interpolation', () => {
  it('interpolates between 1200 kg and 1280 kg tables', () => {
    // 1240 kg = 50% between 1200 and 1280
    // SL, 0°C: 1200→[280,600], 1280→[295,610]
    // GR = lerp(280, 295, 0.5) = 287.5, D50 = lerp(600, 610, 0.5) = 605
    const r = calc({ mass: 1240, oat: 0 });
    expect(r.lgrr).toBeCloseTo(287.5, 0);
    expect(r.ldr).toBeCloseTo(605, 0);
  });

  it('clamps mass below 1100 to 1100 table', () => {
    const r1100 = calc({ mass: 1100, oat: 10 });
    const r1000 = calc({ mass: 1000, oat: 10 });
    expect(r1000.lgrr).toBeCloseTo(r1100.lgrr, 0);
    expect(r1000.ldr).toBeCloseTo(r1100.ldr, 0);
  });

  it('uses exact table at 1310 kg (no interpolation)', () => {
    const r = calc({ mass: 1310, oat: 0 });
    expect(r.interpolation.weightFraction).toBe(0);
    expect(r.interpolation.lowerWeight).toBe(1310);
  });
});

// ── PA and OAT interpolation ────────────────────────────────────

describe('PA and OAT interpolation', () => {
  it('interpolates between PA rows', () => {
    // 1200 kg, PA=500 (midpoint SL–1000), OAT=0°C
    // SL: [280, 600], 1000: [290, 610]
    // GR=285, D50=605
    const r = calc({ mass: 1200, elevation: 500, oat: 0 });
    expect(r.lgrr).toBeCloseTo(285, 0);
    expect(r.ldr).toBeCloseTo(605, 0);
  });

  it('interpolates between OAT columns', () => {
    // 1200 kg, SL, OAT=5°C (midpoint 0–10)
    // [280, 600] and [290, 620] → GR=285, D50=610
    const r = calc({ mass: 1200, oat: 5 });
    expect(r.lgrr).toBeCloseTo(285, 0);
    expect(r.ldr).toBeCloseTo(610, 0);
  });

  it('bilinear interpolation: PA and OAT simultaneously', () => {
    // 1200 kg, PA=500, OAT=5°C
    // Corner values at SL,0°C=[280,600] SL,10°C=[290,620] 1000,0°C=[290,610] 1000,10°C=[300,630]
    // GR: top=lerp(280,290,0.5)=285, bot=lerp(290,300,0.5)=295, final=lerp(285,295,0.5)=290
    // D50: top=lerp(600,620,0.5)=610, bot=lerp(610,630,0.5)=620, final=lerp(610,620,0.5)=615
    const r = calc({ mass: 1200, elevation: 500, oat: 5 });
    expect(r.lgrr).toBeCloseTo(290, 0);
    expect(r.ldr).toBeCloseTo(615, 0);
  });
});

// ── Grass correction ────────────────────────────────────────────

describe('grass correction', () => {
  it('applies ×1.30 GR for grass dry ≤5cm', () => {
    const paved = calc({ mass: 1200, oat: 10 });
    const grass = calc({ mass: 1200, oat: 10, surface: 'grass', grassLength: 'lte5cm' });
    expect(grass.lgrr).toBeCloseTo(paved.lgrr * 1.30, 0);
    // D50 = corrected GR + original air segment
    const airSegment = paved.ldr - paved.lgrr;
    expect(grass.ldr).toBeCloseTo(paved.lgrr * 1.30 + airSegment, 0);
  });

  it('applies ×1.45 GR for grass dry >5cm', () => {
    const paved = calc({ mass: 1200, oat: 10 });
    const grass = calc({ mass: 1200, oat: 10, surface: 'grass', grassLength: '5to10cm' });
    expect(grass.lgrr).toBeCloseTo(paved.lgrr * 1.45, 0);
  });

  it('applies additional ×1.15 GR for wet grass', () => {
    const paved = calc({ mass: 1200, oat: 10 });
    const grassWet = calc({
      mass: 1200, oat: 10, surface: 'grass', grassLength: 'lte5cm', rwycc: 5,
    });
    // GR = base × 1.30 × 1.15
    expect(grassWet.lgrr).toBeCloseTo(paved.lgrr * 1.30 * 1.15, 0);
  });

  it('does not apply wet correction on dry grass (RWYCC 6)', () => {
    const grassDry = calc({ mass: 1200, oat: 10, surface: 'grass', rwycc: 6 });
    const paved = calc({ mass: 1200, oat: 10 });
    expect(grassDry.lgrr).toBeCloseTo(paved.lgrr * 1.30, 0);
  });
});

// ── Slope correction ────────────────────────────────────────────

describe('slope correction', () => {
  it('applies +10%/1% GR for downhill slope', () => {
    const flat = calc({ mass: 1200, oat: 10 });
    const downhill = calc({ mass: 1200, oat: 10, slope: -2 });
    // GR × (1 + 0.10 × 2) = GR × 1.20
    expect(downhill.lgrr).toBeCloseTo(flat.lgrr * 1.20, 0);
  });

  it('does not correct for uphill slope', () => {
    const flat = calc({ mass: 1200, oat: 10 });
    const uphill = calc({ mass: 1200, oat: 10, slope: 1 });
    expect(uphill.lgrr).toBeCloseTo(flat.lgrr, 0);
    expect(uphill.ldr).toBeCloseTo(flat.ldr, 0);
  });

  it('slope affects GR only, not air segment', () => {
    const flat = calc({ mass: 1200, oat: 10 });
    const downhill = calc({ mass: 1200, oat: 10, slope: -1 });
    const flatAir = flat.ldr - flat.lgrr;
    const downhillAir = downhill.ldr - downhill.lgrr;
    expect(downhillAir).toBeCloseTo(flatAir, 0);
  });
});

// ── Wet paved correction ────────────────────────────────────────

describe('wet paved correction', () => {
  it('applies ×1.15 to both GR and D50 for paved wet', () => {
    const dry = calc({ mass: 1200, oat: 10 });
    const wet = calc({ mass: 1200, oat: 10, rwycc: 5 });
    expect(wet.lgrr).toBeCloseTo(dry.lgrr * 1.15, 0);
    expect(wet.ldr).toBeCloseTo(dry.ldr * 1.15, 0);
  });

  it('does not apply paved wet on dry surface', () => {
    const dry = calc({ mass: 1200, oat: 10, rwycc: 6 });
    const r = calc({ mass: 1200, oat: 10 });
    expect(dry.lgrr).toBeCloseTo(r.lgrr, 0);
  });
});

// ── Wind correction ─────────────────────────────────────────────

describe('wind correction', () => {
  it('reduces distances with headwind', () => {
    // 20 kt headwind: factor = 1 - 0.10 × (20/20) = 0.90
    const calm = calc({ mass: 1200, oat: 10 });
    const hw = calc({
      mass: 1200, oat: 10, windDirection: 0, windSpeed: 20, runwayHeading: 0,
    });
    expect(hw.lgrr).toBeCloseTo(calm.lgrr * 0.90, 0);
    expect(hw.ldr).toBeCloseTo(calm.ldr * 0.90, 0);
  });

  it('increases distances with tailwind', () => {
    // 3 kt tailwind: factor = 1 + 0.10 × (3/3) = 1.10
    const calm = calc({ mass: 1200, oat: 10 });
    const tw = calc({
      mass: 1200, oat: 10, windDirection: 180, windSpeed: 3, runwayHeading: 0,
    });
    expect(tw.lgrr).toBeCloseTo(calm.lgrr * 1.10, 0);
    expect(tw.ldr).toBeCloseTo(calm.ldr * 1.10, 0);
  });

  it('no wind correction with zero wind', () => {
    const r = calc({ mass: 1200, oat: 10, windSpeed: 0 });
    expect(r.corrections).toHaveLength(0);
  });
});

// ── Combined corrections ────────────────────────────────────────

describe('combined corrections', () => {
  it('applies grass + slope + wind in correct order', () => {
    const base = calc({ mass: 1200, oat: 10 });
    // grass ≤5cm × 1.30, downhill 1% × 1.10, headwind 10 kt → factor 1-0.10×(10/20)=0.95
    const combined = calc({
      mass: 1200, oat: 10, surface: 'grass', grassLength: 'lte5cm',
      slope: -1, windDirection: 0, windSpeed: 10, runwayHeading: 0,
    });
    const expectedGr = base.lgrr * 1.30 * 1.10 * 0.95;
    expect(combined.lgrr).toBeCloseTo(expectedGr, 0);
  });

  it('tracks correction steps', () => {
    const r = calc({
      mass: 1200, oat: 10, surface: 'grass', grassLength: 'lte5cm',
      slope: -1, windDirection: 0, windSpeed: 10, runwayHeading: 0,
    });
    // Three corrections: grass, slope, wind
    expect(r.corrections).toHaveLength(3);
    expect(r.corrections[0].label).toContain('Grass');
    expect(r.corrections[1].label).toContain('slope');
    expect(r.corrections[2].label).toContain('Headwind');
  });
});

// ── V-speeds ────────────────────────────────────────────────────

describe('v-speeds', () => {
  it('returns vRef 76 for LDG flap at 1200 kg', () => {
    expect(calc({ mass: 1200 }).vSpeeds.vRef).toBe(76);
  });

  it('returns vRef 77 for LDG flap at 1310 kg', () => {
    expect(calc({ mass: 1310 }).vSpeeds.vRef).toBe(77);
  });

  it('returns vRef 72 for LDG flap at 1100 kg', () => {
    expect(calc({ mass: 1100 }).vSpeeds.vRef).toBe(72);
  });

  it('returns vRef 78 for TO flap at 1200 kg', () => {
    expect(calc({ mass: 1200, flap: 'TO' }).vSpeeds.vRef).toBe(78);
  });

  it('returns vRef 82 for UP flap at 1200 kg', () => {
    expect(calc({ mass: 1200, flap: 'UP' }).vSpeeds.vRef).toBe(82);
  });

  it('interpolates vRef between weight tables', () => {
    // 1150 kg: between 1100 (72) and 1200 (76), frac = 50/100 = 0.5
    // lerp(72, 76, 0.5) = 74
    expect(calc({ mass: 1150 }).vSpeeds.vRef).toBe(74);
  });
});

// ── Go-around ROC ───────────────────────────────────────────────

describe('go-around ROC', () => {
  it('returns go-around ROC at 1200 kg, SL, 10°C', () => {
    // goAroundRocTable1200: SL, 10°C → 490
    const r = calc({ mass: 1200, oat: 10 });
    expect(r.goAround.roc).toBe(490);
    expect(r.goAround.isNa).toBe(false);
  });

  it('computes positive gradient', () => {
    const r = calc({ mass: 1200, oat: 10 });
    expect(r.goAround.gradient).toBeGreaterThan(0);
  });

  it('computes TAS from vRef and PA', () => {
    // vRef(LDG, 1200) = 76 KIAS; at SL TAS = CAS
    const r = calc({ mass: 1200, oat: 10 });
    expect(r.goAround.tas).toBeCloseTo(76, 0);
  });

  it('interpolates go-around ROC between weights', () => {
    // 1240 kg (50% between 1200 and 1280)
    // 1200: SL, 10°C → 490; 1280: SL, 10°C → 400
    // lerp(490, 400, 0.5) = 445
    const r = calc({ mass: 1240, oat: 10 });
    expect(r.goAround.roc).toBe(445);
  });

  it('returns N/A for extreme conditions', () => {
    // 1310 kg, 10000 ft, OAT=40°C → null cells in go-around table at these conditions
    const r = calc({ mass: 1310, elevation: 10000, oat: 40 });
    // At 10000 ft PA, OAT=40 is in the null region of the go-around table
    expect(r.goAround.isNa).toBe(true);
    expect(r.goAround.roc).toBe(0);
  });
});

// ── OAT clamping ────────────────────────────────────────────────

describe('OAT clamping', () => {
  it('clamps OAT below 0°C to 0°C', () => {
    const r = calc({ oat: -5 });
    expect(r.oatClamped).toBe(true);
    expect(r.clampedOat).toBe(0);
  });

  it('clamps OAT above 50°C to 50°C', () => {
    const r = calc({ oat: 55 });
    expect(r.oatClamped).toBe(true);
    expect(r.clampedOat).toBe(50);
  });

  it('does not clamp normal OAT', () => {
    const r = calc({ oat: 25 });
    expect(r.oatClamped).toBe(false);
    expect(r.clampedOat).toBe(25);
  });
});

// ── Warnings ────────────────────────────────────────────────────

describe('warnings', () => {
  it('warns when mass exceeds MTOM', () => {
    const r = calc({ mass: 1350 });
    expect(r.warnings.some((w) => w.message.includes('exceeds MTOM'))).toBe(true);
  });

  it('warns when mass below 1100 kg', () => {
    const r = calc({ mass: 1000 });
    expect(r.warnings.some((w) => w.message.includes('1100 kg'))).toBe(true);
  });

  it('warns when OAT below 0°C', () => {
    const r = calc({ oat: -5 });
    expect(r.warnings.some((w) => w.message.includes('0°C') && w.message.includes('landing'))).toBe(true);
  });

  it('warns when OAT above 50°C', () => {
    const r = calc({ oat: 55 });
    expect(r.warnings.some((w) => w.message.includes('50°C'))).toBe(true);
  });

  it('warns when PA above 10000 ft', () => {
    const r = calc({ elevation: 11000 });
    expect(r.warnings.some((w) => w.message.includes('10,000'))).toBe(true);
  });

  it('warns when LDR exceeds LDA', () => {
    const r = calc({ mass: 1310, oat: 40, elevation: 8000, lda: 100 });
    expect(r.warnings.some((w) => w.message.includes('exceeds LDA'))).toBe(true);
  });

  it('warns on N/A cells', () => {
    // 1310 kg, 10000 ft, OAT=50°C → null in landing table
    const r = calc({ mass: 1310, elevation: 10000, oat: 50 });
    expect(r.warnings.some((w) => w.message.includes('N/A'))).toBe(true);
    expect(r.lgrr).toBe(0);
    expect(r.ldr).toBe(0);
  });

  it('no warnings at normal conditions', () => {
    const r = calc();
    expect(r.warnings).toHaveLength(0);
  });
});

// ── Interpolation detail ────────────────────────────────────────

describe('interpolation detail', () => {
  it('provides weight bracket info', () => {
    const r = calc({ mass: 1240, oat: 0 });
    expect(r.interpolation.lowerWeight).toBe(1200);
    expect(r.interpolation.upperWeight).toBe(1280);
    expect(r.interpolation.weightFraction).toBeCloseTo(0.5, 2);
  });

  it('provides PA bracket info', () => {
    const r = calc({ mass: 1200, elevation: 500, oat: 0 });
    expect(r.interpolation.lowerPa).toBe(0);
    expect(r.interpolation.upperPa).toBe(1000);
    expect(r.interpolation.paFraction).toBeCloseTo(0.5, 2);
  });

  it('provides OAT bracket info', () => {
    const r = calc({ mass: 1200, oat: 5 });
    expect(r.interpolation.lowerOat).toBe(0);
    expect(r.interpolation.upperOat).toBe(10);
    expect(r.interpolation.oatFraction).toBeCloseTo(0.5, 2);
  });

  it('stores four corner cells from both weight tables', () => {
    const r = calc({ mass: 1240, elevation: 500, oat: 5 });
    expect(r.interpolation.lowerTableCells).toHaveLength(4);
    expect(r.interpolation.upperTableCells).toHaveLength(4);
  });

  it('stores base GR and D50 before corrections', () => {
    const r = calc({ mass: 1200, oat: 10 });
    // No corrections → base = final
    expect(r.interpolation.baseGr).toBeCloseTo(290, 0);
    expect(r.interpolation.baseD50).toBeCloseTo(620, 0);
  });
});
