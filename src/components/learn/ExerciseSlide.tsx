import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Lightbulb, Eye } from 'lucide-react';
import type { Slide, ExerciseContent, ExerciseField } from '@/data/learnSlides';
import type { LearnProgress } from '@/hooks/useLearnProgress';
import { GlossaryText } from './GlossaryText';

interface Props {
  slide: Slide;
  progress: LearnProgress;
}

function ExerciseFieldRow({
  field,
  slideId,
  progress,
}: {
  field: ExerciseField;
  slideId: string;
  progress: LearnProgress;
}) {
  const value = progress.getExerciseAnswer(slideId, field.id);
  const checked = progress.getExerciseChecked(slideId, field.id);

  const handleCheck = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    const correct = Math.abs(numValue - field.correctValue) <= field.tolerance;
    progress.setExerciseChecked(slideId, field.id, correct);
  };

  const handleShowAnswer = () => {
    // Round to a sensible number of decimal places based on tolerance
    const dp = field.tolerance < 0.01 ? 3 : field.tolerance < 0.1 ? 2 : 1;
    const rounded = parseFloat(field.correctValue.toFixed(dp)).toString();
    progress.setExerciseAnswer(slideId, field.id, rounded);
    progress.setExerciseChecked(slideId, field.id, true);
  };

  return (
    <div className="space-y-2 p-4 rounded-lg border bg-card">
      <Label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
      </Label>
      <div className="flex gap-2 items-center flex-wrap">
        <Input
          id={field.id}
          type="number"
          step="any"
          placeholder="Enter your answer"
          value={value}
          onChange={(e) =>
            progress.setExerciseAnswer(slideId, field.id, e.target.value)
          }
          disabled={checked === true}
          className="max-w-48"
        />
        <span className="text-sm text-muted-foreground">{field.unit}</span>
        {checked === undefined && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCheck}
              disabled={!value || isNaN(parseFloat(value))}
            >
              Check
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShowAnswer}
              className="text-muted-foreground"
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Show answer
            </Button>
          </>
        )}
        {checked === true && (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
            <span className="sr-only">Correct</span>
          </>
        )}
        {checked === false && (
          <>
            <XCircle className="h-5 w-5 text-red-600" aria-hidden />
            <span className="sr-only">Incorrect</span>
          </>
        )}
      </div>
      {checked === false && (
        <div className="flex gap-2 items-start mt-2">
          <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {field.hint}
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0 text-xs text-muted-foreground underline"
                onClick={() => {
                  progress.setExerciseAnswer(slideId, field.id, '');
                  progress.setExerciseChecked(slideId, field.id, undefined);
                }}
              >
                Try again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0 text-xs text-muted-foreground underline"
                onClick={handleShowAnswer}
              >
                Show answer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExerciseSlide({ slide, progress }: Props) {
  const content = slide.content as ExerciseContent;
  const allCorrect = progress.isExerciseComplete(slide.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{slide.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.description.split('\n').map((line, i) => (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            <GlossaryText text={line} />
          </p>
        ))}

        <div className="space-y-3 mt-4">
          {content.fields.map((field) => (
            <ExerciseFieldRow
              key={field.id}
              field={field}
              slideId={slide.id}
              progress={progress}
            />
          ))}
        </div>

        {allCorrect && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 mt-4">
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  All correct!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {content.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
