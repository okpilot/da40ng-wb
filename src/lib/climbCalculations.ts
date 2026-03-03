import type {
  ClimbRocTable,
  ClimbRocCell,
  ClimbRocDetail,
  ClimbProfileTable,
  ClimbProfileRow,
  ClimbSegmentResult,
  ClimbInputs,
  ClimbResult,
  ClimbWarning,
} from './types';
import {
  pressureAltitude,
  isaTemperature,
  isaDeviation,
  densityAltitude,
  clamp,
  lerp,
  findBracket,
} from './performanceCalculations';
import { takeoffClimbRocTables } from '@/data/performance/takeoffClimbRoc';
import { cruiseClimbRocTables } from '@/data/performance/cruiseClimbRoc';
import { climbProfileTables } from '@/data/performance/climbProfile';

// ── Internal helpers ──────────────────────────────────────────────

/**
 * Bilinear interpolation within a single ROC table (PA × OAT).
 * Returns ROC value or null if any corner cell is N/A.
 */
function interpolateRocInTable(
  table: ClimbRocTable,
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

  return {
    roc,
    loPa: table.pressureAltitudes[loPaIdx],
    hiPa: table.pressureAltitudes[hiPaIdx],
    paFrac,
    loOat: table.oats[loOatIdx],
    hiOat: table.oats[hiOatIdx],
    oatFrac,
  };
}

/**
 * Find the two weight tables that bracket the given mass.
 * Tables are sorted descending by weight.
 */
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

/** Approximate CAS → TAS conversion: TAS ≈ CAS × (1 + 0.02 × PA/1000) */
function casToTas(cas: number, pa: number): number {
  return cas * (1 + 0.02 * (pa / 1000));
}

/** Gradient [%] = ROC [fpm] / TAS [KTAS] × 0.98 (AFM formula) */
function calculateGradient(roc: number, tas: number): number {
  if (tas <= 0) return 0;
  return (roc / tas) * 0.98;
}

/**
 * Look up ROC from a set of weight tables with full interpolation detail.
 */
function lookupRoc(
  tables: ClimbRocTable[],
  mass: number,
  pa: number,
  oat: number,
  fairingsPenalty: number,
  hasFairings: boolean,
): { roc: number; detail: ClimbRocDetail | null; isNa: boolean } {
  const [lowerTable, upperTable, weightFrac] = findWeightBracket(tables, mass);

  const lowerResult = interpolateRocInTable(lowerTable, pa, oat);
  const upperResult = interpolateRocInTable(upperTable, pa, oat);

  if (!lowerResult || !upperResult) {
    return { roc: 0, detail: null, isNa: true };
  }

  const baseRoc = lerp(lowerResult.roc, upperResult.roc, weightFrac);
  const penalty = hasFairings ? 0 : fairingsPenalty;
  const finalRoc = baseRoc - penalty;

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
    baseRoc,
    fairingsPenalty: penalty,
    finalRoc,
  };

  return { roc: finalRoc, detail, isNa: false };
}

// ── Climb profile interpolation (5.3.10) ─────────────────────────

/**
 * Linear interpolation within a single climb profile table by PA.
 * Returns interpolated row values.
 */
function interpolateProfileInTable(
  table: ClimbProfileTable,
  pa: number,
): ClimbProfileRow | null {
  const pas = table.rows.map((r) => r.pressureAltitude);

  if (pa <= pas[0]) return { ...table.rows[0] };
  if (pa >= pas[pas.length - 1]) return { ...table.rows[pas.length - 1] };

  for (let i = 0; i < pas.length - 1; i++) {
    if (pa >= pas[i] && pa <= pas[i + 1]) {
      const frac = (pa - pas[i]) / (pas[i + 1] - pas[i]);
      const lo = table.rows[i];
      const hi = table.rows[i + 1];
      return {
        pressureAltitude: pa,
        oat: lerp(lo.oat, hi.oat, frac),
        tas: lerp(lo.tas, hi.tas, frac),
        roc: lerp(lo.roc, hi.roc, frac),
        rocMs: lerp(lo.rocMs, hi.rocMs, frac),
        time: lerp(lo.time, hi.time, frac),
        fuel: lerp(lo.fuel, hi.fuel, frac),
        distance: lerp(lo.distance, hi.distance, frac),
      };
    }
  }

  return null;
}

/**
 * Calculate climb segment using subtraction method.
 * Interpolates between weight tables, then subtracts departure from cruise.
 */
function calculateClimbSegment(
  mass: number,
  departurePa: number,
  cruisePa: number,
  isaDev: number,
): ClimbSegmentResult | null {
  const [lowerTable, upperTable, weightFrac] = findWeightBracket(climbProfileTables, mass);

  const lowerDep = interpolateProfileInTable(lowerTable, departurePa);
  const upperDep = interpolateProfileInTable(upperTable, departurePa);
  const lowerCruise = interpolateProfileInTable(lowerTable, cruisePa);
  const upperCruise = interpolateProfileInTable(upperTable, cruisePa);

  if (!lowerDep || !upperDep || !lowerCruise || !upperCruise) return null;

  // Interpolate between weight tables
  const depTime = lerp(lowerDep.time, upperDep.time, weightFrac);
  const depFuel = lerp(lowerDep.fuel, upperDep.fuel, weightFrac);
  const depDistance = lerp(lowerDep.distance, upperDep.distance, weightFrac);

  const cruiseTime = lerp(lowerCruise.time, upperCruise.time, weightFrac);
  const cruiseFuel = lerp(lowerCruise.fuel, upperCruise.fuel, weightFrac);
  const cruiseDistance = lerp(lowerCruise.distance, upperCruise.distance, weightFrac);

  // Subtraction method
  const rawTime = cruiseTime - depTime;
  const rawFuel = cruiseFuel - depFuel;
  const rawDistance = cruiseDistance - depDistance;

  // ISA correction: +5% time & fuel, +10% distance per 10°C above ISA
  const isaExcess = Math.max(0, isaDev);
  const isaTimeFuelFactor = 1 + 0.05 * (isaExcess / 10);
  const isaDistanceFactor = 1 + 0.10 * (isaExcess / 10);

  return {
    departurePa,
    cruisePa,
    departureTime: depTime,
    departureFuel: depFuel,
    departureDistance: depDistance,
    cruiseTime,
    cruiseFuel,
    cruiseDistance,
    rawTime,
    rawFuel,
    rawDistance,
    isaDev,
    isaTimeFuelFactor,
    isaDistanceFactor,
    time: rawTime * isaTimeFuelFactor,
    fuel: rawFuel * isaTimeFuelFactor,
    distance: rawDistance * isaDistanceFactor,
  };
}

// ── Main calculation ─────────────────────────────────────────────

export function calculateClimb(inputs: ClimbInputs): ClimbResult {
  const warnings: ClimbWarning[] = [];

  // Derived conditions
  const pa = pressureAltitude(inputs.elevation, inputs.qnh);
  const isaTmp = isaTemperature(pa);
  const isaDev = isaDeviation(inputs.oat, pa);
  const da = densityAltitude(pa, inputs.oat);

  // Cruise PA (same QNH correction applies)
  const cruisePa = inputs.cruiseAltitude + 30 * (1013 - inputs.qnh);

  // Clamp OAT for ROC table lookup [-20, 50]
  let clampedOat = inputs.oat;
  if (inputs.oat < -20) {
    clampedOat = -20;
    warnings.push({
      level: 'amber',
      message: 'OAT below -20°C — using -20°C table values',
    });
  }
  if (inputs.oat > 50) {
    clampedOat = 50;
    warnings.push({
      level: 'red',
      message: 'OAT exceeds table maximum (50°C) — use extreme caution',
    });
  }

  // Clamp PA for ROC table lookup [0, 16400]
  const clampedPa = clamp(pa, 0, 16400);
  if (pa < 0) {
    warnings.push({
      level: 'amber',
      message: 'Pressure altitude below 0 ft — using 0 ft table values',
    });
  }
  if (pa > 16400) {
    warnings.push({
      level: 'red',
      message: 'Pressure altitude exceeds 16,400 ft — beyond table range',
    });
  }

  // Mass warnings
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

  // T/O climb ROC (5.3.8) — Flaps T/O, 72 KIAS, fairings -20 ft/min
  const toClimb = lookupRoc(
    takeoffClimbRocTables, inputs.mass, clampedPa, clampedOat,
    20, inputs.wheelFairings,
  );

  if (toClimb.isNa) {
    warnings.push({
      level: 'red',
      message: 'T/O climb ROC: conditions outside certified envelope (N/A cells)',
    });
  }

  const toClimbTas = casToTas(72, clampedPa);
  const toClimbGradient = toClimb.roc > 0 ? calculateGradient(toClimb.roc, toClimbTas) : 0;

  // Cruise climb ROC (5.3.9) — Flaps UP, 88 KIAS, fairings -40 ft/min
  const ccClimb = lookupRoc(
    cruiseClimbRocTables, inputs.mass, clampedPa, clampedOat,
    40, inputs.wheelFairings,
  );

  if (ccClimb.isNa) {
    warnings.push({
      level: 'red',
      message: 'Cruise climb ROC: conditions outside certified envelope (N/A cells)',
    });
  }

  const ccClimbTas = casToTas(88, clampedPa);
  const ccClimbGradient = ccClimb.roc > 0 ? calculateGradient(ccClimb.roc, ccClimbTas) : 0;

  // ROC warnings
  if (toClimb.roc > 0 && toClimb.roc < 100) {
    warnings.push({
      level: 'red',
      message: `T/O climb ROC ${Math.round(toClimb.roc)} ft/min — marginal climb performance`,
    });
  } else if (toClimb.roc > 0 && toClimb.roc < 300) {
    warnings.push({
      level: 'amber',
      message: `T/O climb ROC ${Math.round(toClimb.roc)} ft/min — reduced climb performance`,
    });
  }
  if (toClimb.roc <= 0 && !toClimb.isNa) {
    warnings.push({
      level: 'red',
      message: 'T/O climb ROC is zero or negative — unable to climb',
    });
  }

  if (ccClimb.roc > 0 && ccClimb.roc < 100) {
    warnings.push({
      level: 'red',
      message: `Cruise climb ROC ${Math.round(ccClimb.roc)} ft/min — marginal climb performance`,
    });
  } else if (ccClimb.roc > 0 && ccClimb.roc < 300) {
    warnings.push({
      level: 'amber',
      message: `Cruise climb ROC ${Math.round(ccClimb.roc)} ft/min — reduced climb performance`,
    });
  }

  // Climb segment (5.3.10)
  let climbSegment: ClimbSegmentResult | null = null;
  if (cruisePa > pa) {
    const clampedCruisePa = clamp(cruisePa, 0, 16000);
    const clampedDepPa = clamp(pa, 0, 16000);
    if (cruisePa > 16000) {
      warnings.push({
        level: 'amber',
        message: 'Cruise altitude exceeds climb profile range (16,000 ft PA) — clamped',
      });
    }
    climbSegment = calculateClimbSegment(
      inputs.mass, clampedDepPa, clampedCruisePa, isaDev,
    );
  } else if (inputs.cruiseAltitude > 0 && cruisePa <= pa) {
    warnings.push({
      level: 'amber',
      message: 'Cruise altitude is at or below departure — no climb segment calculated',
    });
  }

  return {
    pressureAltitude: pa,
    densityAltitude: da,
    isaTemperature: isaTmp,
    isaDeviation: isaDev,
    cruisePa,
    takeoffClimbRoc: Math.round(toClimb.roc),
    takeoffClimbGradient: toClimbGradient,
    takeoffClimbTas: toClimbTas,
    takeoffClimbDetail: toClimb.detail,
    cruiseClimbRoc: Math.round(ccClimb.roc),
    cruiseClimbGradient: ccClimbGradient,
    cruiseClimbTas: ccClimbTas,
    cruiseClimbDetail: ccClimb.detail,
    climbSegment,
    warnings,
  };
}
