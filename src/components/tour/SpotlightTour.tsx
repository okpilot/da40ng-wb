import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TourStep } from '@/data/tourSteps';
import { useSpotlightPosition } from './useSpotlightPosition';
import { TourTooltip } from './TourTooltip';

interface Props {
  steps: TourStep[];
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
}

export function SpotlightTour({
  steps,
  isActive,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onStop,
}: Props) {
  const step = isActive ? steps[currentStep] : null;
  const rect = useSpotlightPosition(step?.target ?? null);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onStop();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, onNext, onPrev, onStop]);

  if (!isActive || !step || !rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // SVG path: full viewport rectangle with a cutout over the target
  const cutout = `
    M 0 0 H ${vw} V ${vh} H 0 Z
    M ${rect.left} ${rect.top}
    h ${rect.width}
    v ${rect.height}
    h -${rect.width}
    Z
  `;

  return createPortal(
    <>
      {/* SVG overlay with cutout */}
      <svg
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 50, width: vw, height: vh }}
        aria-hidden="true"
      >
        <path
          d={cutout}
          fillRule="evenodd"
          className="fill-black/50"
          style={{ pointerEvents: 'auto', cursor: 'default' }}
          onClick={onStop}
        />
      </svg>

      {/* Tooltip */}
      <TourTooltip
        title={step.title}
        content={step.content}
        placement={step.placement}
        spotlightRect={rect}
        stepIndex={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onStop}
      />
    </>,
    document.body,
  );
}
