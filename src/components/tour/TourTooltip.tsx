import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TourPlacement } from '@/data/tourSteps';
import type { SpotlightRect } from './useSpotlightPosition';

const MAX_WIDTH = 320;
const GAP = 12;
const VIEWPORT_PAD = 12;

interface Props {
  title: string;
  content: string;
  placement: TourPlacement;
  spotlightRect: SpotlightRect;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function computePosition(
  placement: TourPlacement,
  rect: SpotlightRect,
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top: number;
  let left: number;

  switch (placement) {
    case 'bottom':
      top = rect.top + rect.height + GAP;
      left = rect.left + rect.width / 2 - MAX_WIDTH / 2;
      break;
    case 'top':
      top = rect.top - GAP;
      left = rect.left + rect.width / 2 - MAX_WIDTH / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2;
      left = rect.left - MAX_WIDTH - GAP;
      break;
    case 'right':
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + GAP;
      break;
  }

  // Clamp to viewport
  left = Math.max(VIEWPORT_PAD, Math.min(left, vw - MAX_WIDTH - VIEWPORT_PAD));
  top = Math.max(VIEWPORT_PAD, Math.min(top, vh - 200));

  return { top, left };
}

export function TourTooltip({
  title,
  content,
  placement,
  spotlightRect,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: Props) {
  const pos = computePosition(placement, spotlightRect);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <Card
      className="fixed shadow-lg gap-0 py-0 border-primary/20"
      style={{
        top: pos.top,
        left: pos.left,
        maxWidth: MAX_WIDTH,
        zIndex: 60,
      }}
    >
      <CardHeader className="pb-1 pt-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2 pt-1">
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
      <CardFooter className="pb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {stepIndex + 1} of {totalSteps}
        </span>
        <div className="flex gap-1.5">
          {!isFirst && (
            <Button variant="ghost" size="sm" onClick={onPrev}>
              Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={onNext}>
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
