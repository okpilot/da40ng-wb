import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AircraftConfigStripProps {
  mass: number;
  onMassChange: (value: number) => void;
  wheelFairings: boolean;
  onWheelFairingsChange: (value: boolean) => void;
  flapsLabel?: string;
  fairingsPenalty?: string;
}

export function AircraftConfigStrip({
  mass,
  onMassChange,
  wheelFairings,
  onWheelFairingsChange,
  flapsLabel = 'Take-off',
  fairingsPenalty = 'GR +20, D50 +30',
}: AircraftConfigStripProps) {
  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Aircraft Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          {/* TOM */}
          <div>
            <Label htmlFor="mass" className="text-xs text-muted-foreground">TOM (kg)</Label>
            <Input
              id="mass"
              type="number"
              min={800}
              max={1310}
              value={mass}
              className="h-8 text-sm w-28"
              onChange={(e) => { const n = Number(e.target.value); onMassChange(e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
            />
          </div>

          {/* Flap setting */}
          <div>
            <Label className="text-xs text-muted-foreground">Flaps</Label>
            <div className="h-8 flex items-center px-3 rounded-md border bg-muted/50 text-sm font-mono w-28">
              {flapsLabel}
            </div>
          </div>

          {/* Wheel fairings */}
          <div className="flex items-center gap-2 h-8">
            <Switch
              id="wheel-fairings"
              checked={wheelFairings}
              onCheckedChange={onWheelFairingsChange}
            />
            <Label htmlFor="wheel-fairings" className="text-xs">
              Wheel fairings
            </Label>
            {!wheelFairings && (
              <span className="text-[10px] text-amber-500">{fairingsPenalty}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
