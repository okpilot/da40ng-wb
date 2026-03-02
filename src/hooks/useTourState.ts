import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'da40ng-tour-seen';

export function useTourState(totalSteps: number) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-start on first visit
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const id = setTimeout(() => {
      setCurrentStep(0);
      setIsActive(true);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((s) => {
      if (s >= totalSteps - 1) {
        setIsActive(false);
        localStorage.setItem(STORAGE_KEY, '1');
        return s;
      }
      return s + 1;
    });
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  return { isActive, currentStep, totalSteps, start, stop, next, prev };
}
