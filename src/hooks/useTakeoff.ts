import { useCallback, useMemo, useState } from 'react';
import type { TakeoffInputs, TakeoffResult } from '@/lib/types';
import { calculateTakeoff } from '@/lib/performanceCalculations';

const defaultInputs: TakeoffInputs = {
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
  tora: 0,
  toda: 0,
  asda: 0,
  lda: 0,
};

export function useTakeoff() {
  const [inputs, setInputs] = useState<TakeoffInputs>(defaultInputs);

  const updateInput = useCallback(<K extends keyof TakeoffInputs>(
    key: K,
    value: TakeoffInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const result: TakeoffResult = useMemo(
    () => calculateTakeoff(inputs),
    [inputs],
  );

  return { inputs, updateInput, result };
}
