import type {
  LandingTable,
  LandingCell,
  LandingInputs,
  LandingResult,
  LandingCorrectionStep,
  LandingInterpolationDetail,
  LandingVSpeeds,
  LandingWarning,
  GoAroundDetail,
  GoAroundRocTable,
  ClimbRocDetail,
} from './types';
import {
  pressureAltitude,
  isaTemperature,
  isaDeviation,
  densityAltitude,
  windComponents,
  clamp,
  lerp,
  findBracket,
} from './performanceCalculations';
import { landingLdgTables } from '@/data/performance/landingDistance';
import { landingAbnormalTables } from '@/data/performance/landingDistanceAbnormal';
import { goAroundRocTables } from '@/data/performance/goAroundRoc';

// ── Table interpolation ──────────────────────────────────────────

function interpolateInLandingTable(
  table: LandingTable,
  pa: number,
  oat: number,
): { gr: number; d50: number; cells: LandingCell[]; lowerPaIdx: number; upperPaIdx: number; paFrac: number; lowerOatIdx: number; upperOatIdx: number; oatFrac: number } | null {
  const [loPa, hiPa, paFrac] = findBracket(table.pressureAltitudes, pa);
  const [loOat, hiOat, oatFrac] = findBracket(table.oats, oat);

  const c00 = table.rows[loPa][loOat];
  const c01 = table.rows[loPa][hiOat];
  const c10 = table.rows[hiPa][loOat];
  const c11 = table.rows[hiPa][hiOat];
  const cells = [c00, c01, c10, c11];

  if (!c00 || !c01 || !c10 || !c11) return null;

  const grTop = lerp(c00[0], c01[0], oatFrac);
  const grBot = lerp(c10[0], c11[0], oatFrac);
  const gr = lerp(grTop, grBot, paFrac);

  const d50Top = lerp(c00[1], c01[1], oatFrac);
  const d50Bot = lerp(c10[1], c11[1], oatFrac);
  const d50 = lerp(d50Top, d50Bot, paFrac);

  return { gr, d50, cells, lowerPaIdx: loPa, upperPaIdx: hiPa, paFrac, lowerOatIdx: loOat, upperOatIdx: hiOat, oatFrac };
}

function findWeightBracket<T extends { weight: number }>(
  tables: T[],
  mass: number,
): [T, T, number] {
  const effectiveMass = Math.max(mass, tables[tables.length - 1].weight);
  const clampedMass = Math.min(effectiveMass, tables[0].weight);

  const exact = tables.find((t) => t.weight === clampedMass);
  if (exact) return [exact, exact, 0];

  for (let i = 0; i < tables.length - 1; i++) {
    const upper = tables[i];
    const lower = tables[i + 1];
    if (clampedMass > lower.weight && clampedMass < upper.weight) {
      const frac = (clampedMass - lower.weight) / (upper.weight - lower.weight);
      return [lower, upper, frac];
    }
  }

  const last = tables[tables.length - 1];
  return [last, last, 0];
}

// ── V-speeds ─────────────────────────────────────────────────────

const VREF_LDG_TABLE: { weight: number; vRef: number }[] = [
  { weight: 1310, vRef: 77 },
  { weight: 1280, vRef: 77 },
  { weight: 1200, vRef: 76 },
  { weight: 1100, vRef: 72 },
];

const VREF_TO_TABLE: { weight: number; vRef: number }[] = [
  { weight: 1310, vRef: 78 },
  { weight: 1280, vRef: 78 },
  { weight: 1200, vRef: 78 },
  { weight: 1100, vRef: 74 },
];

const VREF_UP_TABLE: { weight: number; vRef: number }[] = [
  { weight: 1310, vRef: 83 },
  { weight: 1280, vRef: 83 },
  { weight: 1200, vRef: 82 },
  { weight: 1100, vRef: 78 },
];

function interpolateVRef(table: { weight: number; vRef: number }[], mass: number): number {
  const clamped = clamp(mass, 1100, 1310);
  for (let i = 0; i < table.length - 1; i++) {
    const upper = table[i];
    const lower = table[i + 1];
    if (clamped >= lower.weight && clamped <= upper.weight) {
      const frac = (clamped - lower.weight) / (upper.weight - lower.weight);
      return Math.round(lerp(lower.vRef, upper.vRef, frac));
    }
  }
  return table[table.length - 1].vRef;
}

// ── Go-around ROC ────────────────────────────────────────────────

function interpolateRocInTable(
  table: GoAroundRocTable,
  pa: number,
  oat: number,
): { roc: number; loPa: number; hiPa: number; paFrac: number; loOat: number; hiOat: number; oatFrac: number } | null {
  const [loPaIdx, hiPaIdx, paFrac] = findBracket(table.pressureAltitudes, pa);
  const [loOatIdx, hiOatIdx, oatFrac] = findBracket(table.oats, oat);

  const c00 = table.rows[loPaIdx][loOatIdx];
  const c01 = table.rows[loPaIdx][hiOatIdx];
  const c10 = table.rows[hiPaIdx][loOatIdx];
  const c11 = table.rows[hiPaIdx][hiOatIdx];

  if (c00 === null || c01 === null || c10 === null || c11 === null) return null;

  const top = lerp(c00, c01, oatFrac);
  const bot = lerp(c10, c11, oatFrac);
  const roc = lerp(top, bot, paFrac);

  return { roc, loPa: table.pressureAltitudes[loPaIdx], hiPa: table.pressureAltitudes[hiPaIdx], paFrac, loOat: table.oats[loOatIdx], hiOat: table.oats[hiOatIdx], oatFrac };
}

/** Approximate CAS → TAS conversion */
function casToTas(cas: number, pa: number): number {
  return cas * (1 + 0.02 * (pa / 1000));
}

function lookupGoAroundRoc(
  mass: number,
  pa: number,
  oat: number,
): GoAroundDetail {
  const [lowerTable, upperTable, weightFrac] = findWeightBracket(goAroundRocTables, mass);

  const lowerResult = interpolateRocInTable(lowerTable, pa, oat);
  const upperResult = interpolateRocInTable(upperTable, pa, oat);

  if (!lowerResult || !upperResult) {
    return { roc: 0, gradient: 0, tas: 0, isNa: true, detail: null };
  }

  const roc = lerp(lowerResult.roc, upperResult.roc, weightFrac);

  // Go-around vRef for this weight
  const vRef = interpolateVRef(VREF_LDG_TABLE, mass);
  const tas = casToTas(vRef, pa);
  const gradient = tas > 0 ? (roc / tas) * 0.98 : 0;

  const detail: ClimbRocDetail = {
    lowerWeight: lowerTable.weight,
    upperWeight: upperTable.weight,
    weightFraction: weightFrac,
    lowerPa: lowerResult.loPa,
    upperPa: lowerResult.hiPa,
    paFraction: lowerResult.paFrac,
    lowerOat: lowerResult.loOat,
    upperOat: lowerResult.hiOat,
    oatFraction: lowerResult.oatFrac,
    lowerTableRoc: lowerResult.roc,
    upperTableRoc: upperResult.roc,
    baseRoc: roc,
    fairingsPenalty: 0,
    finalRoc: roc,
  };

  return { roc: Math.round(roc), gradient, tas, isNa: false, detail };
}

// ── Corrections ──────────────────────────────────────────────────

function applyLandingCorrections(
  baseGr: number,
  baseD50: number,
  inputs: LandingInputs,
  headwind: number,
): { corrections: LandingCorrectionStep[]; finalGr: number; finalD50: number } {
  const corrections: LandingCorrectionStep[] = [];
  let gr = baseGr;
  let d50 = baseD50;

  const airSegment = baseD50 - baseGr;

  // 1. Surface corrections
  if (inputs.surface === 'grass') {
    // Dry grass factor
    let grassFactor: number;
    let grassLabel: string;
    if (inputs.grassLength === 'lte5cm') {
      grassFactor = 1.30;
      grassLabel = 'Grass dry ≤5 cm';
    } else {
      // 5to10cm or 25cm
      grassFactor = 1.45;
      grassLabel = 'Grass dry >5 cm';
    }

    gr = gr * grassFactor;
    corrections.push({
      label: grassLabel,
      factor: grassFactor,
      addGr: 0, addD50: 0,
      grAfter: gr, d50After: gr + airSegment,
    });

    // Wet/soft grass: additional ×1.15
    if (inputs.rwycc === 5) {
      gr = gr * 1.15;
      corrections.push({
        label: 'Grass wet/soft (RWYCC 5)',
        factor: 1.15,
        addGr: 0, addD50: 0,
        grAfter: gr, d50After: gr + airSegment,
      });
    }
  }

  // 2. Slope correction (GR only) — downhill increases landing roll
  if (inputs.slope < 0) {
    const slopePct = Math.abs(inputs.slope);
    const slopeFactor = 1 + 0.10 * slopePct;
    gr = gr * slopeFactor;
    corrections.push({
      label: `Downhill slope ${slopePct.toFixed(1)}%`,
      factor: slopeFactor,
      addGr: 0, addD50: 0,
      grAfter: gr, d50After: gr + airSegment,
    });
  }

  // 3. Reconstruct D50 after GR-only corrections
  d50 = gr + airSegment;

  // 4. Paved wet (both GR and D50)
  if (inputs.surface === 'paved' && inputs.rwycc === 5) {
    const wetFactor = 1.15;
    gr = gr * wetFactor;
    d50 = d50 * wetFactor;
    corrections.push({
      label: 'Paved wet (RWYCC 5)',
      factor: wetFactor,
      addGr: 0, addD50: 0,
      grAfter: gr, d50After: d50,
    });
  }

  // 5. Wind correction (both GR and D50)
  if (Math.abs(headwind) >= 0.1) {
    let windFactor: number;
    let windLabel: string;
    if (headwind > 0) {
      // Headwind: decrease by 10% per 20 kt
      windFactor = 1 - 0.10 * (headwind / 20);
      windLabel = `Headwind ${headwind.toFixed(1)} kt`;
    } else {
      // Tailwind: increase by 10% per 3 kt
      windFactor = 1 + 0.10 * (Math.abs(headwind) / 3);
      windLabel = `Tailwind ${Math.abs(headwind).toFixed(1)} kt`;
    }
    windFactor = Math.max(windFactor, 0.1);
    gr = gr * windFactor;
    d50 = d50 * windFactor;
    corrections.push({
      label: windLabel,
      factor: windFactor,
      addGr: 0, addD50: 0,
      grAfter: gr, d50After: d50,
    });
  }

  return { corrections, finalGr: gr, finalD50: d50 };
}

// ── Main calculation ─────────────────────────────────────────────

export function calculateLanding(inputs: LandingInputs): LandingResult {
  const warnings: LandingWarning[] = [];

  // Select tables based on flap setting
  const tables = inputs.flap === 'LDG' ? landingLdgTables : landingAbnormalTables;

  // Derived conditions
  const pa = pressureAltitude(inputs.elevation, inputs.qnh);
  const isaTmp = isaTemperature(pa);
  const isaDev = isaDeviation(inputs.oat, pa);
  const da = densityAltitude(pa, inputs.oat);
  const wind = windComponents(inputs.windDirection, inputs.windSpeed, inputs.runwayHeading);

  // Clamp OAT to table range [0, 50]
  let clampedOat = inputs.oat;
  let oatClamped = false;
  if (inputs.oat < 0) {
    clampedOat = 0;
    oatClamped = true;
    warnings.push({ level: 'amber', message: 'OAT below 0°C — using 0°C table values' });
  }
  if (inputs.oat > 50) {
    clampedOat = 50;
    oatClamped = true;
    warnings.push({ level: 'red', message: 'OAT exceeds table maximum (50°C)' });
  }

  // PA warnings
  if (pa < 0) {
    warnings.push({ level: 'amber', message: 'Pressure altitude below 0 ft — using 0 ft' });
  }
  if (pa > 10000) {
    warnings.push({ level: 'red', message: 'PA exceeds 10,000 ft — beyond table range' });
  }

  // Mass warnings
  if (inputs.mass < 1100) {
    warnings.push({ level: 'amber', message: 'Mass below 1100 kg — using 1100 kg table' });
  }
  if (inputs.mass > 1310) {
    warnings.push({ level: 'red', message: 'Mass exceeds MTOM (1310 kg)' });
  }

  // Weight bracket interpolation
  const [lowerTable, upperTable, weightFrac] = findWeightBracket(tables, inputs.mass);

  const lowerResult = interpolateInLandingTable(lowerTable, clamp(pa, 0, 10000), clampedOat);
  const upperResult = interpolateInLandingTable(upperTable, clamp(pa, 0, 10000), clampedOat);

  // Handle N/A cells
  if (!lowerResult || !upperResult) {
    warnings.push({ level: 'red', message: 'Conditions outside certified envelope (N/A cells)' });
    const goAround = lookupGoAroundRoc(inputs.mass, clamp(pa, 0, 10000), clampedOat);
    const vRef = getVRef(inputs);
    return {
      pressureAltitude: pa, densityAltitude: da, isaTemperature: isaTmp, isaDeviation: isaDev,
      headwind: wind.headwind, crosswind: wind.crosswind,
      interpolation: emptyInterpolation(lowerTable, upperTable, weightFrac),
      corrections: [], lgrr: 0, ldr: 0,
      vSpeeds: { vRef }, goAround, warnings,
      flap: inputs.flap, oatClamped, clampedOat,
    };
  }

  // Interpolate between weight tables
  const baseGr = lerp(lowerResult.gr, upperResult.gr, weightFrac);
  const baseD50 = lerp(lowerResult.d50, upperResult.d50, weightFrac);

  const interpolation: LandingInterpolationDetail = {
    lowerWeight: lowerTable.weight,
    upperWeight: upperTable.weight,
    weightFraction: weightFrac,
    lowerPa: lowerTable.pressureAltitudes[lowerResult.lowerPaIdx],
    upperPa: lowerTable.pressureAltitudes[lowerResult.upperPaIdx],
    paFraction: lowerResult.paFrac,
    lowerOat: lowerTable.oats[lowerResult.lowerOatIdx],
    upperOat: lowerTable.oats[lowerResult.upperOatIdx],
    oatFraction: lowerResult.oatFrac,
    lowerTableCells: lowerResult.cells,
    upperTableCells: upperResult.cells,
    lowerTableGr: lowerResult.gr,
    lowerTableD50: lowerResult.d50,
    upperTableGr: upperResult.gr,
    upperTableD50: upperResult.d50,
    baseGr,
    baseD50,
  };

  // Apply corrections
  const { corrections, finalGr, finalD50 } = applyLandingCorrections(
    baseGr, baseD50, inputs, wind.headwind,
  );

  // V-speeds
  const vRef = getVRef(inputs);
  const vSpeeds: LandingVSpeeds = { vRef };

  // Go-around
  const goAround = lookupGoAroundRoc(inputs.mass, clamp(pa, 0, 10000), clampedOat);

  // LDA warning
  if (inputs.lda > 0 && finalD50 > inputs.lda) {
    warnings.push({
      level: 'red',
      message: `Landing distance ${Math.round(finalD50)}m exceeds LDA ${Math.round(inputs.lda)}m`,
    });
  }

  return {
    pressureAltitude: pa,
    densityAltitude: da,
    isaTemperature: isaTmp,
    isaDeviation: isaDev,
    headwind: wind.headwind,
    crosswind: wind.crosswind,
    interpolation,
    corrections,
    lgrr: finalGr,
    ldr: finalD50,
    vSpeeds,
    goAround,
    warnings,
    flap: inputs.flap,
    oatClamped,
    clampedOat,
  };
}

function getVRef(inputs: LandingInputs): number {
  switch (inputs.flap) {
    case 'LDG': return interpolateVRef(VREF_LDG_TABLE, inputs.mass);
    case 'TO': return interpolateVRef(VREF_TO_TABLE, inputs.mass);
    case 'UP': return interpolateVRef(VREF_UP_TABLE, inputs.mass);
  }
}

function emptyInterpolation(
  lowerTable: LandingTable,
  upperTable: LandingTable,
  weightFrac: number,
): LandingInterpolationDetail {
  return {
    lowerWeight: lowerTable.weight,
    upperWeight: upperTable.weight,
    weightFraction: weightFrac,
    lowerPa: 0, upperPa: 0, paFraction: 0,
    lowerOat: 0, upperOat: 0, oatFraction: 0,
    lowerTableCells: [], upperTableCells: [],
    lowerTableGr: 0, lowerTableD50: 0,
    upperTableGr: 0, upperTableD50: 0,
    baseGr: 0, baseD50: 0,
  };
}
