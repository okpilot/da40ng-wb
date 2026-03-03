import type {
  TakeoffCell,
  TakeoffTable,
  TakeoffInputs,
  TakeoffResult,
  CorrectionStep,
  InterpolationDetail,
  VSpeeds,
  TakeoffWarning,
} from './types';
import { takeoffTables } from '@/data/performance/takeoffDistance';

// ── Atmospheric calculations ───────────────────────────────────────

export function pressureAltitude(elevation: number, qnh: number): number {
  return elevation + 30 * (1013 - qnh);
}

export function isaTemperature(pa: number): number {
  return 15 - 2 * (pa / 1000);
}

export function isaDeviation(oat: number, pa: number): number {
  return oat - isaTemperature(pa);
}

export function densityAltitude(pa: number, oat: number): number {
  return pa + 120 * (oat - isaTemperature(pa));
}

// ── Wind calculations ──────────────────────────────────────────────

export function windComponents(
  windDir: number,
  windSpeed: number,
  rwyHdg: number,
): { headwind: number; crosswind: number } {
  const diff = ((windDir - rwyHdg) * Math.PI) / 180;
  const headwind = windSpeed * Math.cos(diff);
  const crosswind = Math.abs(windSpeed * Math.sin(diff));
  return { headwind, crosswind };
}

// ── Table interpolation ────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Find the two indices that bracket `value` in `arr`.
 * Returns [lowerIdx, upperIdx, fraction].
 * Clamps to array bounds.
 */
function findBracket(
  arr: number[],
  value: number,
): [number, number, number] {
  if (value <= arr[0]) return [0, 0, 0];
  if (value >= arr[arr.length - 1]) return [arr.length - 1, arr.length - 1, 0];

  for (let i = 0; i < arr.length - 1; i++) {
    if (value >= arr[i] && value <= arr[i + 1]) {
      const frac = (value - arr[i]) / (arr[i + 1] - arr[i]);
      return [i, i + 1, frac];
    }
  }
  return [arr.length - 1, arr.length - 1, 0];
}

/**
 * Bilinear interpolation within a single weight table.
 * Returns [groundRoll, dist50ft] or null if any required cell is N/A.
 */
function interpolateInTable(
  table: TakeoffTable,
  pa: number,
  oat: number,
): { gr: number; d50: number; cells: TakeoffCell[]; lowerPaIdx: number; upperPaIdx: number; paFrac: number; lowerOatIdx: number; upperOatIdx: number; oatFrac: number } | null {
  const [loPa, hiPa, paFrac] = findBracket(table.pressureAltitudes, pa);
  const [loOat, hiOat, oatFrac] = findBracket(table.oats, oat);

  // Collect the 4 cells
  const c00 = table.rows[loPa][loOat];
  const c01 = table.rows[loPa][hiOat];
  const c10 = table.rows[hiPa][loOat];
  const c11 = table.rows[hiPa][hiOat];
  const cells = [c00, c01, c10, c11];

  // If any cell is N/A, we can't interpolate
  if (!c00 || !c01 || !c10 || !c11) return null;

  // Bilinear interpolation for ground roll
  const grTop = lerp(c00[0], c01[0], oatFrac);
  const grBot = lerp(c10[0], c11[0], oatFrac);
  const gr = lerp(grTop, grBot, paFrac);

  // Bilinear interpolation for 50ft distance
  const d50Top = lerp(c00[1], c01[1], oatFrac);
  const d50Bot = lerp(c10[1], c11[1], oatFrac);
  const d50 = lerp(d50Top, d50Bot, paFrac);

  return {
    gr, d50, cells,
    lowerPaIdx: loPa, upperPaIdx: hiPa, paFrac,
    lowerOatIdx: loOat, upperOatIdx: hiOat, oatFrac,
  };
}

/**
 * Find the two weight tables that bracket the given mass.
 * Tables are sorted descending by weight [1310, 1280, 1200, 1100].
 * For mass below 1100 kg, use 1100 kg table (AFM 5.2).
 */
function findWeightBracket(
  mass: number,
): [TakeoffTable, TakeoffTable, number] {
  const tables = takeoffTables;
  const effectiveMass = Math.max(mass, tables[tables.length - 1].weight);
  const clampedMass = Math.min(effectiveMass, tables[0].weight);

  // Exact match — no interpolation needed
  const exact = tables.find((t) => t.weight === clampedMass);
  if (exact) return [exact, exact, 0];

  // Find bracket (tables are descending)
  for (let i = 0; i < tables.length - 1; i++) {
    const upper = tables[i];
    const lower = tables[i + 1];
    if (clampedMass > lower.weight && clampedMass < upper.weight) {
      const frac = (clampedMass - lower.weight) / (upper.weight - lower.weight);
      return [lower, upper, frac];
    }
  }

  // Fallback
  const last = tables[tables.length - 1];
  return [last, last, 0];
}

// ── V-speeds interpolation ─────────────────────────────────────────

const VSPEED_TABLE: { weight: number; vR: number; v50: number }[] = [
  { weight: 1310, vR: 67, v50: 72 },
  { weight: 1280, vR: 67, v50: 72 },
  { weight: 1200, vR: 65, v50: 70 },
  { weight: 1100, vR: 61, v50: 67 },
];

export function interpolateVSpeeds(mass: number): VSpeeds {
  const clamped = clamp(mass, 1100, 1310);

  // Find bracket (descending)
  for (let i = 0; i < VSPEED_TABLE.length - 1; i++) {
    const upper = VSPEED_TABLE[i];
    const lower = VSPEED_TABLE[i + 1];
    if (clamped >= lower.weight && clamped <= upper.weight) {
      const frac = (clamped - lower.weight) / (upper.weight - lower.weight);
      return {
        vR: Math.round(lerp(lower.vR, upper.vR, frac)),
        v50: Math.round(lerp(lower.v50, upper.v50, frac)),
      };
    }
  }

  return { vR: VSPEED_TABLE[VSPEED_TABLE.length - 1].vR, v50: VSPEED_TABLE[VSPEED_TABLE.length - 1].v50 };
}

// ── Correction factors ─────────────────────────────────────────────

function applyCorrections(
  baseGr: number,
  baseD50: number,
  inputs: TakeoffInputs,
  headwind: number,
): { corrections: CorrectionStep[]; finalGr: number; finalD50: number } {
  const corrections: CorrectionStep[] = [];
  let gr = baseGr;
  let d50 = baseD50;

  // Store the original air segment (unaffected by surface/slope corrections)
  const airSegment = baseD50 - baseGr;

  // 1. Surface corrections (ground roll only)
  if (inputs.surface === 'grass' && inputs.rwycc >= 5) {
    // Dry grass factor based on length
    let grassFactor: number;
    let grassLabel: string;
    switch (inputs.grassLength) {
      case 'lte5cm':
        grassFactor = 1.10;
        grassLabel = 'Grass dry ≤5 cm';
        break;
      case '5to10cm':
        grassFactor = 1.30;
        grassLabel = 'Grass dry 5–10 cm';
        break;
      case '25cm':
        grassFactor = 1.45;
        grassLabel = 'Grass dry 25 cm';
        break;
    }

    gr = gr * grassFactor;
    corrections.push({
      label: grassLabel,
      factor: grassFactor,
      addGr: 0,
      addD50: 0,
      grAfter: gr,
      d50After: gr + airSegment,
    });

    // Wet grass: additional ×1.20 on the dry grass result
    if (inputs.rwycc === 5) {
      gr = gr * 1.20;
      corrections.push({
        label: 'Grass wet (RWYCC 5)',
        factor: 1.20,
        addGr: 0,
        addD50: 0,
        grAfter: gr,
        d50After: gr + airSegment,
      });
    }

    // Soft ground: additional ×1.50 on top
    if (inputs.softGround) {
      gr = gr * 1.50;
      corrections.push({
        label: 'Soft ground',
        factor: 1.50,
        addGr: 0,
        addD50: 0,
        grAfter: gr,
        d50After: gr + airSegment,
      });
    }
  } else if (inputs.surface === 'paved' && inputs.rwycc === 5) {
    // Wet paved: no AFM correction, but advisory shown via warnings
  }

  // 2. Slope correction (ground roll only)
  if (inputs.slope !== 0) {
    // Positive slope = uphill = increases ground roll
    // We only correct for uphill (positive) per AFM
    if (inputs.slope > 0) {
      const slopeFactor = 1 + 0.15 * inputs.slope;
      gr = gr * slopeFactor;
      corrections.push({
        label: `Uphill slope ${inputs.slope.toFixed(1)}%`,
        factor: slopeFactor,
        addGr: 0,
        addD50: 0,
        grAfter: gr,
        d50After: gr + airSegment,
      });
    }
    // Downhill: no correction (conservative — AFM doesn't give downhill credit for T/O)
  }

  // 3. Reconstruct 50ft distance after surface/slope corrections
  d50 = gr + airSegment;

  // 4. Wind correction (both GR and D50)
  if (Math.abs(headwind) >= 0.1) {
    let windFactor: number;
    let windLabel: string;
    if (headwind > 0) {
      // Headwind: decrease by 10% per 12 kt (50% safety already built in)
      windFactor = 1 - 0.10 * (headwind / 12);
      windLabel = `Headwind ${headwind.toFixed(1)} kt`;
    } else {
      // Tailwind: increase by 10% per 2 kt (150% safety already built in)
      windFactor = 1 + 0.10 * (Math.abs(headwind) / 2);
      windLabel = `Tailwind ${Math.abs(headwind).toFixed(1)} kt`;
    }
    // Wind factor cannot go below 0
    windFactor = Math.max(0, windFactor);
    gr = gr * windFactor;
    d50 = d50 * windFactor;
    corrections.push({
      label: windLabel,
      factor: windFactor,
      addGr: 0,
      addD50: 0,
      grAfter: gr,
      d50After: d50,
    });
  }

  // 5. Fairings correction (absolute additions)
  if (!inputs.wheelFairings) {
    gr += 20;
    d50 += 30;
    corrections.push({
      label: 'No wheel fairings',
      factor: null,
      addGr: 20,
      addD50: 30,
      grAfter: gr,
      d50After: d50,
    });
  }

  return { corrections, finalGr: gr, finalD50: d50 };
}

// ── Main calculation ───────────────────────────────────────────────

export function calculateTakeoff(inputs: TakeoffInputs): TakeoffResult {
  const warnings: TakeoffWarning[] = [];

  // Derived conditions
  const pa = pressureAltitude(inputs.elevation, inputs.qnh);
  const isaTmp = isaTemperature(pa);
  const isaDev = isaDeviation(inputs.oat, pa);
  const da = densityAltitude(pa, inputs.oat);
  const { headwind, crosswind } = windComponents(
    inputs.windDirection,
    inputs.windSpeed,
    inputs.runwayHeading,
  );

  // Clamp OAT for table lookup
  let oatClamped = false;
  let clampedOat = inputs.oat;
  if (inputs.oat < 0) {
    clampedOat = 0;
    oatClamped = true;
    warnings.push({
      level: 'amber',
      message: 'OAT below 0°C — using 0°C table values (AFM 5.2)',
    });
  }
  if (inputs.oat > 50) {
    clampedOat = 50;
    oatClamped = true;
    warnings.push({
      level: 'red',
      message: 'OAT exceeds table maximum (50°C) — use extreme caution',
    });
  }

  // Clamp PA for table lookup
  const clampedPa = clamp(pa, 0, 10000);
  if (pa < 0) {
    warnings.push({
      level: 'amber',
      message: 'Pressure altitude below 0 ft — using 0 ft table values (AFM 5.2)',
    });
  }
  if (pa > 10000) {
    warnings.push({
      level: 'red',
      message: 'Pressure altitude exceeds 10,000 ft — beyond table range',
    });
  }

  // Mass clamping
  if (inputs.mass < 1100) {
    warnings.push({
      level: 'amber',
      message: 'Mass below 1100 kg — using 1100 kg table values (AFM 5.2)',
    });
  }

  if (inputs.mass > 1310) {
    warnings.push({
      level: 'red',
      message: 'Mass exceeds maximum take-off mass (1310 kg)',
    });
  }

  // RWYCC warnings
  if (inputs.rwycc <= 4) {
    warnings.push({
      level: 'red',
      message: 'DA40 NG — do not operate on contaminated runways (RWYCC ≤ 4)',
    });
  }

  if (inputs.surface === 'paved' && inputs.rwycc === 5) {
    warnings.push({
      level: 'amber',
      message: 'No AFM data for wet paved take-off — exercise caution',
    });
  }

  // Crosswind limit check
  if (crosswind > 25) {
    warnings.push({
      level: 'red',
      message: `Crosswind ${crosswind.toFixed(0)} kt exceeds max demonstrated (25 kt)`,
    });
  }

  // Find weight bracket and interpolate
  const [lowerTable, upperTable, weightFrac] = findWeightBracket(inputs.mass);

  const lowerResult = interpolateInTable(lowerTable, clampedPa, clampedOat);
  const upperResult = interpolateInTable(upperTable, clampedPa, clampedOat);

  // Handle N/A cells
  if (!lowerResult || !upperResult) {
    warnings.push({
      level: 'red',
      message: 'Required AFM table cells are N/A — conditions outside certified envelope',
    });

    // Return a result with zeroes but with warnings
    return {
      pressureAltitude: pa,
      densityAltitude: da,
      isaTemperature: isaTmp,
      isaDeviation: isaDev,
      headwind,
      crosswind,
      interpolation: {
        lowerWeight: lowerTable.weight,
        upperWeight: upperTable.weight,
        weightFraction: weightFrac,
        lowerPa: 0, upperPa: 0, paFraction: 0,
        lowerOat: 0, upperOat: 0, oatFraction: 0,
        lowerTableCells: [null, null, null, null],
        upperTableCells: [null, null, null, null],
        lowerTableGr: 0, lowerTableD50: 0,
        upperTableGr: 0, upperTableD50: 0,
        baseGr: 0, baseD50: 0,
      },
      corrections: [],
      torr: 0,
      todr: 0,
      vSpeeds: interpolateVSpeeds(inputs.mass),
      warnings,
      oatClamped,
      clampedOat,
    };
  }

  // Interpolate between weight tables
  const baseGr = lerp(lowerResult.gr, upperResult.gr, weightFrac);
  const baseD50 = lerp(lowerResult.d50, upperResult.d50, weightFrac);

  const interpolation: InterpolationDetail = {
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
  const { corrections, finalGr, finalD50 } = applyCorrections(
    baseGr, baseD50, inputs, headwind,
  );

  // TORR/TODR vs available
  if (inputs.tora > 0 && finalGr > inputs.tora) {
    warnings.push({
      level: 'red',
      message: `TORR (${Math.round(finalGr)} m) exceeds TORA (${inputs.tora} m)`,
    });
  }
  if (inputs.tora > 0 && finalD50 > inputs.tora) {
    warnings.push({
      level: 'red',
      message: `TODR (${Math.round(finalD50)} m) exceeds TORA (${inputs.tora} m) — AFM 5.3.7`,
    });
  }
  if (inputs.toda > 0 && finalD50 > inputs.toda) {
    warnings.push({
      level: 'red',
      message: `TODR (${Math.round(finalD50)} m) exceeds TODA (${inputs.toda} m)`,
    });
  }

  return {
    pressureAltitude: pa,
    densityAltitude: da,
    isaTemperature: isaTmp,
    isaDeviation: isaDev,
    headwind,
    crosswind,
    interpolation,
    corrections,
    torr: Math.round(finalGr),
    todr: Math.round(finalD50),
    vSpeeds: interpolateVSpeeds(inputs.mass),
    warnings,
    oatClamped,
    clampedOat,
  };
}
