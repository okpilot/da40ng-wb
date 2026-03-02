import type { Slide } from '@/data/learnSlides';
import type { LearnProgress } from '@/hooks/useLearnProgress';
import { TheorySlide } from './TheorySlide';
import { QuizSlide } from './QuizSlide';
import { ExerciseSlide } from './ExerciseSlide';
import { InteractiveSlide } from './InteractiveSlide';

interface Props {
  slide: Slide;
  progress: LearnProgress;
}

export function SlideRenderer({ slide, progress }: Props) {
  switch (slide.type) {
    case 'theory':
      return <TheorySlide slide={slide} />;
    case 'quiz':
      return <QuizSlide slide={slide} progress={progress} />;
    case 'exercise':
      return <ExerciseSlide slide={slide} progress={progress} />;
    case 'interactive':
      return <InteractiveSlide slide={slide} />;
    default:
      return null;
  }
}
