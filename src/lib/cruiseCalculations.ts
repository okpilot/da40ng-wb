import type {
  CruiseInputs,
  CruiseResult,
  CruiseInterpolationDetail,
  CruiseWarning,
  CruiseIsaDev,
} from './types';
import {
  pressureAltitude,
  isaTemperature,
  isaDeviation,
  densityAltitude,
  lerp,
  findBracket,
} from './performanceCalculations';
import { cruisePerformanceTable } from '@/data/performance/cruisePerformance';

/** AFM 5.3.2: final reserve at 45% power = 4.0 USG/h */
export const RESERVE_FF_USG = 4.0;

// ── ISA deviation bracket lookup ──────────────────────────────────

const ISA_DEVS: CruiseIsaDev[] = [-10, 0, 10, 30];

function findIsaDevBracket(
  isaDev: number,
): [CruiseIsaDev, CruiseIsaDev, number] {
  if (isaDev <= ISA_DEVS[0]) return [ISA_DEVS[0], ISA_DEVS[0], 0];
  if (isaDev >= ISA_DEVS[ISA_DEVS.length - 1])
    return [ISA_DEVS[ISA_DEVS.length - 1], ISA_DEVS[ISA_DEVS.length - 1], 0];

  for (let i = 0; i < ISA_DEVS.length - 1; i++) {
    if (isaDev >= ISA_DEVS[i] && isaDev <= ISA_DEVS[i + 1]) {
      const frac = (isaDev - ISA_DEVS[i]) / (ISA_DEVS[i + 1] - ISA_DEVS[i]);
      return [ISA_DEVS[i], ISA_DEVS[i + 1], frac];
    }
  }

  return [ISA_DEVS[ISA_DEVS.length - 1], ISA_DEVS[ISA_DEVS.length - 1], 0];
}

// ── Interpolate FF/TAS at a given PA + ISA dev + power ───────────

function interpolateFfTas(
  pa: number,
  isaDev: number,
  power: CruiseInputs['power'],
  wheelFairings: boolean,
): { ff: number; tas: number } {
  const tablePas = cruisePerformanceTable.rows.map((r) => r.pressureAltitude);
  const [loPaIdx, hiPaIdx, paFrac] = findBracket(tablePas, pa);
  const loRow = cruisePerformanceTable.rows[loPaIdx];
  const hiRow = cruisePerformanceTable.rows[hiPaIdx];
  const [loIsaDev, hiIsaDev, isaFrac] = findIsaDevBracket(isaDev);

  const c00 = loRow.data[loIsaDev][power];
  const c01 = loRow.data[hiIsaDev][power];
  const c10 = hiRow.data[loIsaDev][power];
  const c11 = hiRow.data[hiIsaDev][power];

  const ffTop = lerp(c00.ff, c01.ff, isaFrac);
  const ffBot = lerp(c10.ff, c11.ff, isaFrac);
  const ff = lerp(ffTop, ffBot, paFrac);

  const tasTop = lerp(c00.tas, c01.tas, isaFrac);
  const tasBot = lerp(c10.tas, c11.tas, isaFrac);
  let tas = lerp(tasTop, tasBot, paFrac);
  if (!wheelFairings) tas *= 0.96;

  return { ff, tas };
}

// ── Main calculation ──────────────────────────────────────────────

export function calculateCruise(inputs: CruiseInputs): CruiseResult {
  const warnings: CruiseWarning[] = [];

  // Derived conditions
  const pa = pressureAltitude(inputs.cruiseAltitude, inputs.qnh);
  const isaTmp = isaTemperature(pa);
  const isaDev = isaDeviation(inputs.oat, pa);
  const da = densityAltitude(pa, inputs.oat);

  // Table PA range
  const tablePas = cruisePerformanceTable.rows.map((r) => r.pressureAltitude);
  const minPa = tablePas[0];
  const maxPa = tablePas[tablePas.length - 1];

  if (pa < minPa) {
    warnings.push({
      level: 'amber',
      message: `PA ${Math.round(pa)} ft below table minimum (${minPa} ft) — using ${minPa} ft`,
    });
  }
  if (pa > maxPa) {
    warnings.push({
      level: 'red',
      message: `PA ${Math.round(pa)} ft exceeds table maximum (${maxPa} ft)`,
    });
  }

  // ISA deviation range
  if (isaDev < ISA_DEVS[0]) {
    warnings.push({
      level: 'amber',
      message: `ISA ${isaDev > 0 ? '+' : ''}${isaDev.toFixed(0)}°C below table minimum (ISA−10) — using ISA−10`,
    });
  }
  if (isaDev > ISA_DEVS[ISA_DEVS.length - 1]) {
    warnings.push({
      level: 'red',
      message: `ISA ${isaDev > 0 ? '+' : ''}${isaDev.toFixed(0)}°C exceeds table maximum (ISA+30)`,
    });
  }

  // Find PA bracket
  const [loPaIdx, hiPaIdx, paFrac] = findBracket(tablePas, pa);
  const loRow = cruisePerformanceTable.rows[loPaIdx];
  const hiRow = cruisePerformanceTable.rows[hiPaIdx];

  // Find ISA deviation bracket
  const [loIsaDev, hiIsaDev, isaFrac] = findIsaDevBracket(isaDev);

  // Get the 4 corner values for bilinear interpolation
  const power = inputs.power;
  const c00 = loRow.data[loIsaDev][power]; // low PA, low ISA
  const c01 = loRow.data[hiIsaDev][power]; // low PA, high ISA
  const c10 = hiRow.data[loIsaDev][power]; // high PA, low ISA
  const c11 = hiRow.data[hiIsaDev][power]; // high PA, high ISA

  // Bilinear interpolation for FF
  const ffTop = lerp(c00.ff, c01.ff, isaFrac);
  const ffBot = lerp(c10.ff, c11.ff, isaFrac);
  const baseFf = lerp(ffTop, ffBot, paFrac);

  // Bilinear interpolation for TAS
  const tasTop = lerp(c00.tas, c01.tas, isaFrac);
  const tasBot = lerp(c10.tas, c11.tas, isaFrac);
  let baseTas = lerp(tasTop, tasBot, paFrac);

  // Wheel fairings correction: TAS −4% without fairings
  if (!inputs.wheelFairings) {
    baseTas *= 0.96;
  }

  // Fuel flow in litres per hour (1 USG = 3.785 litres)
  const fuelFlowLph = baseFf * 3.785;

  // Range and endurance from total usable fuel (no reserves)
  const endurance = inputs.usableFuelUsg > 0 ? inputs.usableFuelUsg / baseFf : 0;
  const range = endurance * baseTas;

  // ── Fuel planning ──────────────────────────────────────────────
  const reserveFuelUsg = (inputs.reserveMinutes / 60) * RESERVE_FF_USG;

  // Alternate fuel: interpolate at alternate altitude with same power/OAT/QNH
  let alternateFuelUsg = 0;
  let alternateTas = 0;
  let alternateFf = 0;
  if (inputs.alternateDistance > 0) {
    const altPa = pressureAltitude(inputs.alternateAltitude, inputs.qnh);
    const altIsaDev = isaDeviation(inputs.oat, altPa);
    const alt = interpolateFfTas(altPa, altIsaDev, inputs.power, inputs.wheelFairings);
    alternateTas = alt.tas;
    alternateFf = alt.ff;
    const altTime = alt.tas > 0 ? inputs.alternateDistance / alt.tas : 0;
    alternateFuelUsg = altTime * alt.ff;
  }

  const fuelAfterReserve = Math.max(0, inputs.usableFuelUsg - reserveFuelUsg);
  const tripFuel = Math.max(0, fuelAfterReserve - alternateFuelUsg);

  const enduranceWithReserve = baseFf > 0 ? fuelAfterReserve / baseFf : 0;
  const rangeWithReserve = enduranceWithReserve * baseTas;
  const enduranceWithAll = baseFf > 0 ? tripFuel / baseFf : 0;
  const rangeWithAll = enduranceWithAll * baseTas;

  // Warning if reserves exceed usable
  if (reserveFuelUsg + alternateFuelUsg > inputs.usableFuelUsg) {
    warnings.push({
      level: 'red',
      message: `Reserve + alternate fuel (${(reserveFuelUsg + alternateFuelUsg).toFixed(1)} USG) exceeds usable fuel (${inputs.usableFuelUsg} USG)`,
    });
  }

  const interpolation: CruiseInterpolationDetail = {
    lowerPa: loRow.pressureAltitude,
    upperPa: hiRow.pressureAltitude,
    paFraction: paFrac,
    lowerIsaDev: loIsaDev,
    upperIsaDev: hiIsaDev,
    isaDevFraction: isaFrac,
    corners: [c00, c01, c10, c11],
    baseFf,
    baseTas,
  };

  return {
    pressureAltitude: pa,
    isaTemperature: isaTmp,
    isaDeviation: isaDev,
    densityAltitude: da,
    tas: baseTas,
    fuelFlow: baseFf,
    fuelFlowLph,
    range,
    endurance,
    reserveFuelUsg,
    alternateFuelUsg,
    alternateTas,
    alternateFf,
    tripFuel,
    rangeWithReserve,
    enduranceWithReserve,
    rangeWithAll,
    enduranceWithAll,
    interpolation,
    warnings,
  };
}
