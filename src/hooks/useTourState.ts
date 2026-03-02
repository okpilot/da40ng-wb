import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'da40ng-tour-seen';

function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markTourSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // gracefully degrade — tour state still works in-memory
  }
}

export function useTourState(totalSteps: number) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-start on first visit
  useEffect(() => {
    if (hasSeenTour()) return;
    const id = setTimeout(() => {
      setCurrentStep(0);
      setIsActive(true);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    markTourSeen();
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((s) => {
      if (s >= totalSteps - 1) {
        setIsActive(false);
        markTourSeen();
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
