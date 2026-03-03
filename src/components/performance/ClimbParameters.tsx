import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClimbInputs } from '@/lib/types';

interface ClimbParametersProps {
  inputs: ClimbInputs;
  onUpdate: <K extends keyof ClimbInputs>(key: K, value: ClimbInputs[K]) => void;
}

export function ClimbParameters({ inputs, onUpdate }: ClimbParametersProps) {
  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Climb Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="flap-retract" className="text-xs text-muted-foreground">Flap retraction (ft AGL)</Label>
            <Input
              id="flap-retract"
              type="number"
              min={0}
              max={5000}
              value={inputs.flapRetractionHeight || ''}
              className="h-8 text-sm"
              onChange={(e) => { const n = Number(e.target.value); onUpdate('flapRetractionHeight', e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
            />
          </div>
          <div>
            <Label htmlFor="cruise-alt" className="text-xs text-muted-foreground">Cruise altitude (ft AMSL)</Label>
            <Input
              id="cruise-alt"
              type="number"
              min={0}
              max={20000}
              value={inputs.cruiseAltitude || ''}
              className="h-8 text-sm"
              onChange={(e) => { const n = Number(e.target.value); onUpdate('cruiseAltitude', e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1.5">
          Below {inputs.flapRetractionHeight} ft AGL: Flaps T/O, 72 KIAS &middot; Above: Flaps UP, 88 KIAS
        </div>
      </CardContent>
    </Card>
  );
}
