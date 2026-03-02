import { useState, useCallback, useEffect } from 'react';
import { learnSlides } from '@/data/learnSlides';

const STORAGE_KEY = 'da40ng-learn-progress';
const STORAGE_VERSION = 2;

interface PersistedState {
  version: number;
  currentSlide: number;
  quizAnswers: Record<string, number>; // slideId → selected option index
  exerciseAnswers: Record<string, Record<string, string>>; // slideId → { fieldId: value }
  exerciseChecked: Record<string, Record<string, boolean | undefined>>; // slideId → { fieldId: isCorrect }
}

export interface LearnProgress {
  currentSlide: number;
  canAdvance: boolean;

  // Quiz state
  getQuizAnswer: (slideId: string) => number | undefined;
  setQuizAnswer: (slideId: string, optionIndex: number) => void;

  // Exercise state
  getExerciseAnswer: (slideId: string, fieldId: string) => string;
  setExerciseAnswer: (slideId: string, fieldId: string, value: string) => void;
  getExerciseChecked: (slideId: string, fieldId: string) => boolean | undefined;
  setExerciseChecked: (slideId: string, fieldId: string, correct: boolean | undefined) => void;
  isExerciseComplete: (slideId: string) => boolean;

  // Navigation
  goToSlide: (index: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
  reset: () => void;
}

const FRESH_STATE: PersistedState = {
  version: STORAGE_VERSION,
  currentSlide: 0,
  quizAnswers: {},
  exerciseAnswers: {},
  exerciseChecked: {},
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === STORAGE_VERSION) {
        const safeSlide = Number.isInteger(parsed.currentSlide)
          ? Math.min(Math.max(parsed.currentSlide, 0), learnSlides.length - 1)
          : 0;
        return {
          ...FRESH_STATE,
          ...parsed,
          currentSlide: safeSlide,
        };
      }
    }
  } catch { /* ignore */ }
  return { ...FRESH_STATE };
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useLearnProgress(): LearnProgress {
  const [state, setState] = useState<PersistedState>(loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentSlide = learnSlides[state.currentSlide];

  // Determine if the current slide allows advancing
  const canAdvance = (() => {
    if (!currentSlide) return false;
    if (currentSlide.type === 'theory' || currentSlide.type === 'interactive') return true;
    if (currentSlide.type === 'quiz') {
      return state.quizAnswers[currentSlide.id] !== undefined;
    }
    if (currentSlide.type === 'exercise') {
      const checked = state.exerciseChecked[currentSlide.id];
      if (!checked) return false;
      const content = currentSlide.content as { fields: { id: string }[] };
      return content.fields.every((f) => checked[f.id] === true);
    }
    return true;
  })();

  const getQuizAnswer = useCallback(
    (slideId: string) => state.quizAnswers[slideId],
    [state.quizAnswers],
  );

  const setQuizAnswer = useCallback((slideId: string, optionIndex: number) => {
    setState((prev) => {
      // Don't allow changing answer once selected
      if (prev.quizAnswers[slideId] !== undefined) return prev;
      return {
        ...prev,
        quizAnswers: { ...prev.quizAnswers, [slideId]: optionIndex },
      };
    });
  }, []);

  const getExerciseAnswer = useCallback(
    (slideId: string, fieldId: string) =>
      state.exerciseAnswers[slideId]?.[fieldId] ?? '',
    [state.exerciseAnswers],
  );

  const setExerciseAnswer = useCallback(
    (slideId: string, fieldId: string, value: string) => {
      setState((prev) => ({
        ...prev,
        exerciseAnswers: {
          ...prev.exerciseAnswers,
          [slideId]: {
            ...prev.exerciseAnswers[slideId],
            [fieldId]: value,
          },
        },
      }));
    },
    [],
  );

  const getExerciseChecked = useCallback(
    (slideId: string, fieldId: string) =>
      state.exerciseChecked[slideId]?.[fieldId],
    [state.exerciseChecked],
  );

  const setExerciseChecked = useCallback(
    (slideId: string, fieldId: string, correct: boolean | undefined) => {
      setState((prev) => {
        const nextForSlide = { ...(prev.exerciseChecked[slideId] ?? {}) };
        if (correct === undefined) {
          delete nextForSlide[fieldId];
        } else {
          nextForSlide[fieldId] = correct;
        }
        return {
          ...prev,
          exerciseChecked: {
            ...prev.exerciseChecked,
            [slideId]: nextForSlide,
          },
        };
      });
    },
    [],
  );

  const isExerciseComplete = useCallback(
    (slideId: string) => {
      const slide = learnSlides.find((s) => s.id === slideId);
      if (!slide || slide.type !== 'exercise') return false;
      const checked = state.exerciseChecked[slideId];
      if (!checked) return false;
      const content = slide.content as { fields: { id: string }[] };
      return content.fields.every((f) => checked[f.id] === true);
    },
    [state.exerciseChecked],
  );

  const goToSlide = useCallback((index: number) => {
    setState((prev) => {
      if (index < 0 || index >= learnSlides.length) return prev;
      return { ...prev, currentSlide: index };
    });
  }, []);

  const goToNext = useCallback(() => {
    setState((prev) => {
      if (prev.currentSlide >= learnSlides.length - 1) return prev;
      return { ...prev, currentSlide: prev.currentSlide + 1 };
    });
  }, []);

  const goToPrev = useCallback(() => {
    setState((prev) => {
      if (prev.currentSlide <= 0) return prev;
      return { ...prev, currentSlide: prev.currentSlide - 1 };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ ...FRESH_STATE });
  }, []);

  return {
    currentSlide: state.currentSlide,
    canAdvance,
    getQuizAnswer,
    setQuizAnswer,
    getExerciseAnswer,
    setExerciseAnswer,
    getExerciseChecked,
    setExerciseChecked,
    isExerciseComplete,
    goToSlide,
    goToNext,
    goToPrev,
    reset,
  };
}
