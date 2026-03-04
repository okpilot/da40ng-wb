import { useCallback, useMemo } from 'react';
import type { CruiseInputs, CruiseResult, ClimbInputs, ClimbSegmentResult } from '@/lib/types';
import { calculateCruise } from '@/lib/cruiseCalculations';
import { pressureAltitude, isaTemperature } from '@/lib/performanceCalculations';
import { useLocalStorage } from './useLocalStorage';

const defaultInputs: CruiseInputs = {
  cruiseAltitude: 5000,
  qnh: 1013,
  oat: 5,
  power: 75,
  wheelFairings: true,
  usableFuelUsg: 28,
  reserveMinutes: 30,
  alternateDistance: 0,
  alternateAltitude: 3000,
  includeClimb: false,
};

/**
 * Seed initial inputs from climb/takeoff localStorage if available.
 */
function getInitialInputs(): CruiseInputs {
  try {
    const stored = localStorage.getItem('da40ng-perf-cruise-inputs');
    if (stored) return { ...defaultInputs, ...JSON.parse(stored) } as CruiseInputs;
  } catch { /* ignore */ }

  // Seed from climb inputs if available
  try {
    const climb = localStorage.getItem('da40ng-perf-climb-inputs');
    if (climb) {
      const c = JSON.parse(climb);
      return {
        ...defaultInputs,
        cruiseAltitude: c.cruiseAltitude ?? defaultInputs.cruiseAltitude,
        qnh: c.qnh ?? defaultInputs.qnh,
        oat: c.oat ?? defaultInputs.oat,
        wheelFairings: c.wheelFairings ?? defaultInputs.wheelFairings,
      };
    }
  } catch { /* ignore */ }

  // Seed from takeoff inputs
  try {
    const takeoff = localStorage.getItem('da40ng-perf-inputs');
    if (takeoff) {
      const t = JSON.parse(takeoff);
      return {
        ...defaultInputs,
        qnh: t.qnh ?? defaultInputs.qnh,
        oat: t.oat ?? defaultInputs.oat,
        wheelFairings: t.wheelFairings ?? defaultInputs.wheelFairings,
      };
    }
  } catch { /* ignore */ }

  return defaultInputs;
}

/**
 * Compute OAT at cruise altitude from climb departure conditions.
 * ISA deviation is constant throughout the atmosphere for a given day,
 * so OAT_cruise = ISA_temp(cruise_PA) + (departure_OAT − ISA_temp(departure_PA)).
 */
function oatAtCruise(climbInputs: ClimbInputs): number {
  const depPa = pressureAltitude(climbInputs.elevation, climbInputs.qnh);
  const isaDev = climbInputs.oat - isaTemperature(depPa);
  const cruisePa = pressureAltitude(climbInputs.cruiseAltitude, climbInputs.qnh);
  return Math.round((isaTemperature(cruisePa) + isaDev) * 10) / 10;
}

export function useCruise(
  climbSegment?: ClimbSegmentResult | null,
  climbInputs?: ClimbInputs,
) {
  const [storedInputs, setInputs, resetInputs] = useLocalStorage<CruiseInputs>(
    'da40ng-perf-cruise-inputs',
    getInitialInputs(),
  );

  // When climb is included, override altitude/QNH/OAT from climb tab
  const inputs: CruiseInputs = useMemo(() => {
    if (!storedInputs.includeClimb || !climbInputs) return storedInputs;
    return {
      ...storedInputs,
      cruiseAltitude: climbInputs.cruiseAltitude,
      qnh: climbInputs.qnh,
      oat: oatAtCruise(climbInputs),
    };
  }, [storedInputs, climbInputs]);

  const updateInput = useCallback(<K extends keyof CruiseInputs>(
    key: K,
    value: CruiseInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, [setInputs]);

  const climbData = useMemo(() => {
    if (!inputs.includeClimb || !climbSegment) return undefined;
    return { fuel: climbSegment.fuel, time: climbSegment.time, distance: climbSegment.distance };
  }, [inputs.includeClimb, climbSegment]);

  const result: CruiseResult = useMemo(
    () => calculateCruise(inputs, climbData),
    [inputs, climbData],
  );

  return { inputs, updateInput, resetInputs, result };
}
