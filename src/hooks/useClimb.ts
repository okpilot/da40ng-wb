import { useCallback, useMemo } from 'react';
import type { ClimbInputs, ClimbResult } from '@/lib/types';
import { calculateClimb } from '@/lib/climbCalculations';
import { useLocalStorage } from './useLocalStorage';

const defaultInputs: ClimbInputs = {
  mass: 1200,
  elevation: 0,
  qnh: 1013,
  oat: 15,
  wheelFairings: true,
  flapRetractionHeight: 400,
  cruiseAltitude: 5000,
};

/**
 * Seed initial inputs from takeoff localStorage if available,
 * otherwise use defaults.
 */
function getInitialInputs(): ClimbInputs {
  // Check if climb inputs already exist
  try {
    const stored = localStorage.getItem('da40ng-perf-climb-inputs');
    if (stored) return JSON.parse(stored) as ClimbInputs;
  } catch { /* ignore */ }

  // Seed from takeoff inputs if available
  try {
    const takeoff = localStorage.getItem('da40ng-perf-inputs');
    if (takeoff) {
      const t = JSON.parse(takeoff);
      return {
        ...defaultInputs,
        mass: t.mass ?? defaultInputs.mass,
        elevation: t.elevation ?? defaultInputs.elevation,
        qnh: t.qnh ?? defaultInputs.qnh,
        oat: t.oat ?? defaultInputs.oat,
        wheelFairings: t.wheelFairings ?? defaultInputs.wheelFairings,
      };
    }
  } catch { /* ignore */ }

  return defaultInputs;
}

export function useClimb() {
  const [inputs, setInputs, resetInputs] = useLocalStorage<ClimbInputs>(
    'da40ng-perf-climb-inputs',
    getInitialInputs(),
  );

  const updateInput = useCallback(<K extends keyof ClimbInputs>(
    key: K,
    value: ClimbInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, [setInputs]);

  const syncFromTakeoff = useCallback(() => {
    try {
      const takeoff = localStorage.getItem('da40ng-perf-inputs');
      if (takeoff) {
        const t = JSON.parse(takeoff);
        setInputs((prev) => ({
          ...prev,
          mass: t.mass ?? prev.mass,
          elevation: t.elevation ?? prev.elevation,
          qnh: t.qnh ?? prev.qnh,
          oat: t.oat ?? prev.oat,
          wheelFairings: t.wheelFairings ?? prev.wheelFairings,
        }));
      }
    } catch { /* ignore */ }
  }, [setInputs]);

  const result: ClimbResult = useMemo(
    () => calculateClimb(inputs),
    [inputs],
  );

  return { inputs, updateInput, resetInputs, syncFromTakeoff, result };
}
