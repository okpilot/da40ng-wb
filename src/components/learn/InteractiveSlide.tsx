import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Slide, InteractiveContent } from '@/data/learnSlides';
import { MomentCalculator } from './interactives/MomentCalculator';
import { CGCalculator } from './interactives/CGCalculator';
import { FuelConverter } from './interactives/FuelConverter';
import { CGEnvelopeExplorer } from './interactives/CGEnvelopeExplorer';

interface Props {
  slide: Slide;
}

export function InteractiveSlide({ slide }: Props) {
  const content = slide.content as InteractiveContent;

  const toolComponent = (() => {
    switch (content.tool) {
      case 'moment-calculator':
        return <MomentCalculator />;
      case 'cg-calculator':
        return <CGCalculator />;
      case 'fuel-converter':
        return <FuelConverter />;
      case 'envelope-explorer':
        return <CGEnvelopeExplorer />;
    }
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{slide.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content.description}
        </p>
        <div className="mt-4">{toolComponent}</div>
      </CardContent>
    </Card>
  );
}
