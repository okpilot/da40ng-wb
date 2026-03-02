import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { learnSlides } from '@/data/learnSlides';

interface Props {
  currentSlide: number;
  totalSlides: number;
  canAdvance: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToSlide: (index: number) => void;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  canAdvance,
  onPrev,
  onNext,
  onGoToSlide,
}: Props) {
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;

  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t gap-2">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={isFirst}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      {/* Slide selector */}
      <select
        value={currentSlide}
        onChange={(e) => onGoToSlide(Number(e.target.value))}
        className="text-xs border rounded px-2 py-1.5 bg-background text-foreground max-w-48 truncate"
      >
        {learnSlides.map((slide, i) => {
          const prefix =
            slide.type === 'quiz' ? '? '
            : slide.type === 'exercise' ? '# '
            : slide.type === 'interactive' ? '> '
            : '';
          return (
            <option key={slide.id} value={i}>
              {i + 1}. {prefix}{slide.title}
            </option>
          );
        })}
      </select>

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
