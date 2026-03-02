import type { DiagramType } from '@/data/learnSlides';
import { CGEffectsDiagram } from './CGEffectsDiagram';
import { AircraftSideView } from './AircraftSideView';
import { SeesawDiagram } from './SeesawDiagram';
import { BalanceDiagram } from './BalanceDiagram';
import { EnvelopeDiagram } from './EnvelopeDiagram';
import { FuelDiagram } from './FuelDiagram';

interface Props {
  type: DiagramType;
}

export function SlideDiagram({ type }: Props) {
  switch (type) {
    case 'cg-effects':
      return <CGEffectsDiagram />;
    case 'aircraft-side-view':
      return <AircraftSideView />;
    case 'seesaw':
      return <SeesawDiagram />;
    case 'balance':
      return <BalanceDiagram />;
    case 'envelope':
      return <EnvelopeDiagram />;
    case 'fuel':
      return <FuelDiagram />;
    default:
      return null;
  }
}
