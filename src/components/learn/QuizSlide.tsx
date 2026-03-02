import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Slide, QuizContent } from '@/data/learnSlides';
import type { LearnProgress } from '@/hooks/useLearnProgress';

interface Props {
  slide: Slide;
  progress: LearnProgress;
}

export function QuizSlide({ slide, progress }: Props) {
  const content = slide.content as QuizContent;
  const selectedAnswer = progress.getQuizAnswer(slide.id);
  const hasAnswered = selectedAnswer !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{slide.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium leading-relaxed">
          {content.question}
        </p>

        <div className="space-y-3">
          {content.options.map((option, i) => {
            const isSelected = selectedAnswer === i;
            const showResult = hasAnswered;

            let borderColor = 'border-border hover:border-primary';
            let bgColor = '';
            if (showResult) {
              if (option.correct) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50 dark:bg-green-950/20';
              } else if (isSelected && !option.correct) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50 dark:bg-red-950/20';
              } else {
                borderColor = 'border-border opacity-50';
              }
            } else if (isSelected) {
              borderColor = 'border-primary';
              bgColor = 'bg-primary/5';
            }

            return (
              <button
                key={i}
                onClick={() => progress.setQuizAnswer(slide.id, i)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${borderColor} ${bgColor} ${
                  !hasAnswered ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm text-muted-foreground mt-0.5">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    {showResult && (isSelected || option.correct) && (
                      <div className="flex items-start gap-2 mt-2">
                        {option.correct ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {option.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
