import { useCallback, useMemo } from 'react';
import type { CruiseInputs, CruiseResult } from '@/lib/types';
import { calculateCruise } from '@/lib/cruiseCalculations';
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

export function useCruise() {
  const [inputs, setInputs, resetInputs] = useLocalStorage<CruiseInputs>(
    'da40ng-perf-cruise-inputs',
    getInitialInputs(),
  );

  const updateInput = useCallback(<K extends keyof CruiseInputs>(
    key: K,
    value: CruiseInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, [setInputs]);

  const syncFromClimb = useCallback(() => {
    try {
      const climb = localStorage.getItem('da40ng-perf-climb-inputs');
      if (climb) {
        const c = JSON.parse(climb);
        setInputs((prev) => ({
          ...prev,
          cruiseAltitude: c.cruiseAltitude ?? prev.cruiseAltitude,
          qnh: c.qnh ?? prev.qnh,
          oat: c.oat ?? prev.oat,
          wheelFairings: c.wheelFairings ?? prev.wheelFairings,
        }));
      }
    } catch { /* ignore */ }
  }, [setInputs]);

  const result: CruiseResult = useMemo(
    () => calculateCruise(inputs),
    [inputs],
  );

  return { inputs, updateInput, resetInputs, syncFromClimb, result };
}
