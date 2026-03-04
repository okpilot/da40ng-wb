import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CruiseResult, CruiseInputs, ClimbSegmentResult } from '@/lib/types';
import { RESERVE_FF_USG } from '@/lib/cruiseCalculations';

interface CruiseAdvisoryDataProps {
  result: CruiseResult;
  inputs: CruiseInputs;
  onUpdate: <K extends keyof CruiseInputs>(key: K, value: CruiseInputs[K]) => void;
  climbSegment: ClimbSegmentResult | null;
}

function Pill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card hover:bg-muted border-input'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function CruiseAdvisoryData({ result, inputs, onUpdate, climbSegment }: CruiseAdvisoryDataProps) {
  return (
    <Card className="py-3" data-tour="cr-advisory">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Advisory Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Derived conditions */}
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Pressure altitude: </span>
            <span className="font-mono">{Math.round(result.pressureAltitude)} ft</span>
          </div>
          <div>
            <span className="text-muted-foreground">Density altitude: </span>
            <span className="font-mono">{Math.round(result.densityAltitude)} ft</span>
          </div>
          <div>
            <span className="text-muted-foreground">ISA temperature: </span>
            <span className="font-mono">{result.isaTemperature.toFixed(1)}&deg;C</span>
          </div>
          <div>
            <span className="text-muted-foreground">ISA deviation: </span>
            <span className={`font-mono ${result.isaDeviation > 0 ? 'text-amber-500' : ''}`}>
              {result.isaDeviation > 0 ? '+' : ''}{result.isaDeviation.toFixed(1)}&deg;C
            </span>
          </div>
        </div>

        {/* Correction factors */}
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correction Factors</h4>
          <div className="text-sm">
            <span className="text-muted-foreground">AFM assumes: </span>
            1310 kg MTOM, flaps UP, wheel fairings installed
          </div>

          <div className="text-sm space-y-0.5">
            <div>
              <span className="text-muted-foreground">Wheel fairings: </span>
              {inputs.wheelFairings ? (
                <span>Installed — no correction</span>
              ) : (
                <span className="text-amber-500">Not installed</span>
              )}
            </div>
            {!inputs.wheelFairings && (
              <div className="pl-4 text-xs font-mono">
                TAS &times;0.96 (&minus;4%) per AFM 5.3.11
              </div>
            )}
          </div>
        </div>

        {/* Climb segment */}
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Climb Segment</h4>
          <div className="flex items-center gap-2">
            <Pill active={!inputs.includeClimb} onClick={() => onUpdate('includeClimb', false)}>
              Off
            </Pill>
            <Pill active={inputs.includeClimb} onClick={() => onUpdate('includeClimb', true)}>
              On
            </Pill>
          </div>
          {inputs.includeClimb && (
            climbSegment ? (
              <div className="text-xs font-mono text-muted-foreground space-y-0.5">
                <div>Climb fuel: {climbSegment.fuel.toFixed(1)} USG ({climbSegment.time.toFixed(0)} min, {Math.round(climbSegment.distance)} NM — from Climb tab)</div>
              </div>
            ) : (
              <div className="text-xs text-amber-500">Configure Climb tab first</div>
            )
          )}
        </div>

        {/* Reserve & Alternate */}
        <div data-tour="cr-reserve" className="space-y-0">
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final Reserve</h4>
          <div className="flex items-center gap-2">
            <Pill active={inputs.reserveMinutes === 30} onClick={() => onUpdate('reserveMinutes', 30)}>
              30 min (VFR)
            </Pill>
            <Pill active={inputs.reserveMinutes === 45} onClick={() => onUpdate('reserveMinutes', 45)}>
              45 min (IFR)
            </Pill>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {result.reserveFuelUsg.toFixed(1)} USG at {RESERVE_FF_USG.toFixed(1)} USG/h (45% power)
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alternate Aerodrome</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="cruise-alt-dist" className="text-xs text-muted-foreground">Distance (NM)</Label>
              <Input
                id="cruise-alt-dist"
                type="number"
                min={0}
                value={inputs.alternateDistance || ''}
                className="h-8 text-sm"
                onChange={(e) => {
                  if (e.target.value === '') { onUpdate('alternateDistance', 0); return; }
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) onUpdate('alternateDistance', n);
                }}
              />
            </div>
            <div>
              <Label htmlFor="cruise-alt-alt" className="text-xs text-muted-foreground">Altitude (ft)</Label>
              <Input
                id="cruise-alt-alt"
                type="number"
                min={0}
                value={inputs.alternateAltitude || ''}
                className="h-8 text-sm"
                onChange={(e) => {
                  if (e.target.value === '') { onUpdate('alternateAltitude', 0); return; }
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) onUpdate('alternateAltitude', n);
                }}
              />
            </div>
          </div>
          {inputs.alternateDistance > 0 && result.alternateFuelUsg > 0 && (
            <div className="text-xs font-mono text-muted-foreground space-y-0.5">
              <div>TAS {Math.round(result.alternateTas)} kt, FF {result.alternateFf.toFixed(1)} USG/h at {inputs.alternateAltitude} ft</div>
              <div>Alternate fuel: {result.alternateFuelUsg.toFixed(1)} USG</div>
            </div>
          )}
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
