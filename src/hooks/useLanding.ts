import { useCallback, useMemo } from 'react';
import type { LandingInputs, LandingResult } from '@/lib/types';
import { calculateLanding } from '@/lib/landingCalculations';
import { useLocalStorage } from './useLocalStorage';

const defaultInputs: LandingInputs = {
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
  lda: 0,
};

/**
 * Seed initial inputs from takeoff localStorage if available.
 */
function getInitialInputs(): LandingInputs {
  try {
    const stored = localStorage.getItem('da40ng-perf-landing-inputs');
    if (stored) return JSON.parse(stored) as LandingInputs;
  } catch { /* ignore */ }

  // Seed from takeoff aerodrome state
  try {
    const aerodrome = localStorage.getItem('da40ng-perf-aerodrome');
    const takeoff = localStorage.getItem('da40ng-perf-inputs');
    const base = { ...defaultInputs };

    if (takeoff) {
      const t = JSON.parse(takeoff);
      base.qnh = t.qnh ?? base.qnh;
      base.oat = t.oat ?? base.oat;
      base.wheelFairings = t.wheelFairings ?? base.wheelFairings;
      base.mass = t.mass ?? base.mass;
      base.surface = t.surface ?? base.surface;
      base.grassLength = t.grassLength ?? base.grassLength;
      base.rwycc = t.rwycc ?? base.rwycc;
      base.windDirection = t.windDirection ?? base.windDirection;
      base.windSpeed = t.windSpeed ?? base.windSpeed;
      base.runwayHeading = t.runwayHeading ?? base.runwayHeading;
      base.elevation = t.elevation ?? base.elevation;
      base.slope = t.slope ?? base.slope;
    }

    if (aerodrome) {
      const a = JSON.parse(aerodrome);
      if (a.lda) base.lda = a.lda;
    }

    return base;
  } catch { /* ignore */ }

  return defaultInputs;
}

export function useLanding() {
  const [inputs, setInputs, resetInputs] = useLocalStorage<LandingInputs>(
    'da40ng-perf-landing-inputs',
    getInitialInputs(),
  );

  const updateInput = useCallback(<K extends keyof LandingInputs>(
    key: K,
    value: LandingInputs[K],
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
          qnh: t.qnh ?? prev.qnh,
          oat: t.oat ?? prev.oat,
          wheelFairings: t.wheelFairings ?? prev.wheelFairings,
          mass: t.mass ?? prev.mass,
          surface: t.surface ?? prev.surface,
          grassLength: t.grassLength ?? prev.grassLength,
          rwycc: t.rwycc ?? prev.rwycc,
          windDirection: t.windDirection ?? prev.windDirection,
          windSpeed: t.windSpeed ?? prev.windSpeed,
          runwayHeading: t.runwayHeading ?? prev.runwayHeading,
          elevation: t.elevation ?? prev.elevation,
          slope: t.slope ?? prev.slope,
        }));
      }
    } catch { /* ignore */ }
  }, [setInputs]);

  const result: LandingResult = useMemo(
    () => calculateLanding(inputs),
    [inputs],
  );

  return { inputs, updateInput, resetInputs, syncFromTakeoff, result };
}
