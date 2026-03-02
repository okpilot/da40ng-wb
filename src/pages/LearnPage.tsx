import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, RotateCcw } from 'lucide-react';
import { learnSlides } from '@/data/learnSlides';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { SlideRenderer } from '@/components/learn/SlideRenderer';
import { SlideNavigation } from '@/components/learn/SlideNavigation';
import { WorkedExamplePanel } from '@/components/learn/WorkedExamplePanel';

export function LearnPage() {
  const progress = useLearnProgress();
  const slide = learnSlides[progress.currentSlide];
  const sections = [...new Set(learnSlides.map((s) => s.section))];
  const currentSectionIndex = sections.indexOf(slide.section);
  const isWorkedExample = slide.section === 'Worked Example';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className={`${isWorkedExample ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 py-4 flex items-center justify-between`}>
          <div>
            <h1 className="text-xl font-bold">Learn Mass & Balance</h1>
            <p className="text-sm text-muted-foreground">
              Section {currentSectionIndex + 1}: {slide.section}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={progress.reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className={`${isWorkedExample ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 py-6`}>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Slide {progress.currentSlide + 1} of {learnSlides.length}</span>
            <span>{Math.round(((progress.currentSlide + 1) / learnSlides.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${((progress.currentSlide + 1) / learnSlides.length) * 100}%` }}
            />
          </div>
          {/* Section markers */}
          <div className="flex gap-1 mt-2">
            {sections.map((section, i) => (
              <div
                key={section}
                className={`h-1 flex-1 rounded-full ${
                  i < currentSectionIndex
                    ? 'bg-primary'
                    : i === currentSectionIndex
                      ? 'bg-primary/50'
                      : 'bg-muted'
                }`}
                title={section}
              />
            ))}
          </div>
        </div>

        {/* Slide content — two-column during worked example */}
        {isWorkedExample ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div>
              <SlideRenderer slide={slide} progress={progress} />
              <SlideNavigation
                currentSlide={progress.currentSlide}
                totalSlides={learnSlides.length}
                canAdvance={progress.canAdvance}
                onPrev={progress.goToPrev}
                onNext={progress.goToNext}
                onGoToSlide={progress.goToSlide}
              />
            </div>
            <WorkedExamplePanel progress={progress} />
          </div>
        ) : (
          <>
            <SlideRenderer slide={slide} progress={progress} />
            <SlideNavigation
              currentSlide={progress.currentSlide}
              totalSlides={learnSlides.length}
              canAdvance={progress.canAdvance}
              onPrev={progress.goToPrev}
              onNext={progress.goToNext}
              onGoToSlide={progress.goToSlide}
            />
          </>
        )}

        <footer className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground space-y-2 pb-4">
          <p>
            For training purposes only. This module is not a substitute for official flight training or AFM documentation.
            Always verify all data with the Aircraft Flight Manual for your specific aircraft.
          </p>
          <p>
            Oleksandr Konovalov bears no legal responsibility for the use of this training module or the calculator.
            The pilot-in-command is solely responsible for verifying mass and balance before every flight.
          </p>
        </footer>
      </main>
    </div>
  );
}
