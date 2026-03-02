import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  currentSlide: number;
  totalSlides: number;
  canAdvance: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  canAdvance,
  onPrev,
  onNext,
}: Props) {
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;

  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={isFirst}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      {isLast ? (
        <Button asChild>
          <Link to="/">
            Go to Calculator
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button onClick={onNext} disabled={!canAdvance}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
