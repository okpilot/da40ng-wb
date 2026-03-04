import { useCallback, useEffect, useState } from 'react';

const DEFAULT_STORAGE_KEY = 'da40ng-tour-seen';

function hasSeenTour(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markTourSeen(key: string): void {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // gracefully degrade — tour state still works in-memory
  }
}

export function useTourState(totalSteps: number, storageKey = DEFAULT_STORAGE_KEY) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Reset tour state when storageKey changes (e.g. switching tabs)
  useEffect(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, [storageKey]);

  // Auto-start on first visit
  useEffect(() => {
    if (!storageKey || totalSteps === 0) return;
    if (hasSeenTour(storageKey)) return;
    const id = setTimeout(() => {
      setCurrentStep(0);
      setIsActive(true);
    }, 600);
    return () => clearTimeout(id);
  }, [storageKey, totalSteps]);

  const stop = useCallback(() => {
    setIsActive(false);
    if (storageKey) markTourSeen(storageKey);
  }, [storageKey]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((s) => {
      if (s >= totalSteps - 1) {
        setIsActive(false);
        markTourSeen(storageKey);
        return s;
      }
      return s + 1;
    });
  }, [totalSteps, storageKey]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  return { isActive, currentStep, totalSteps, start, stop, next, prev };
}
