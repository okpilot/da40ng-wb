import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { Slide, TheoryContent } from '@/data/learnSlides';
import { SlideDiagram } from './diagrams/SlideDiagram';
import { GlossaryText } from './GlossaryText';

interface Props {
  slide: Slide;
}

export function TheorySlide({ slide }: Props) {
  const content = slide.content as TheoryContent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{slide.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed">
            <GlossaryText text={p} />
          </p>
        ))}

        {content.bullets && (
          <ul className="space-y-2 ml-1">
            {content.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary mt-1 shrink-0">&#8226;</span>
                <span><GlossaryText text={b} /></span>
              </li>
            ))}
          </ul>
        )}

        {slide.diagram !== 'none' && (
          <div className="mt-4">
            <SlideDiagram type={slide.diagram} />
          </div>
        )}

        {content.note && (
          <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <GlossaryText text={content.note} />
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
