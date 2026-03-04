import type { CruiseResult, CruiseInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CruiseResultsProps {
  result: CruiseResult;
  inputs: CruiseInputs;
}

export function CruiseResultsPanel({ result, inputs }: CruiseResultsProps) {
  const hasAlternate = inputs.alternateDistance > 0;

  return (
    <Card className="py-3">
      <CardContent className="space-y-3">
        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-1">
            {result.warnings.map((w, i) => (
              <Badge
                key={i}
                variant={w.level === 'red' ? 'destructive' : 'outline'}
                className={`block w-full text-left py-1 text-xs ${
                  w.level === 'amber' ? 'border-amber-500 text-amber-500' : ''
                }`}
              >
                {w.level === 'red' ? '\u26d4' : '\u26a0\ufe0f'} {w.message}
              </Badge>
            ))}
          </div>
        )}

        {/* Results grid — horizontal like takeoff/climb */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          <ResultBox
            sublabel="True Airspeed"
            label="TAS"
            value={`${Math.round(result.tas)} kt`}
            highlight
          />
          <ResultBox
            sublabel="Fuel Flow"
            label="FF"
            value={`${result.fuelFlow.toFixed(1)} USG/h`}
            subValue={`${result.fuelFlowLph.toFixed(1)} L/h`}
          />
          <ResultBox
            sublabel="Trip Range"
            label="Range"
            value={`${Math.round(result.rangeWithAll)} NM`}
            subValue={`Total: ${Math.round(result.range)} NM`}
          />
          <ResultBox
            sublabel="Trip Endurance"
            label="Endurance"
            value={formatHoursMinutes(result.enduranceWithAll)}
            subValue={`Total: ${formatHoursMinutes(result.endurance)}`}
          />
        </div>

        {/* Fuel breakdown summary */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-muted-foreground">
          <span>Usable: {inputs.usableFuelUsg} USG</span>
          <span>Reserve: {result.reserveFuelUsg.toFixed(1)} USG ({inputs.reserveMinutes} min)</span>
          {hasAlternate && <span>Alternate: {result.alternateFuelUsg.toFixed(1)} USG</span>}
          <span>Trip fuel: {result.tripFuel.toFixed(1)} USG</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultBox({ label, sublabel, value, subValue, highlight }: {
  label: string; sublabel: string; value: string; subValue?: string; highlight?: boolean;
}) {
  return (
    <div className="bg-muted rounded-lg px-3 py-3 text-center flex flex-col items-center justify-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{sublabel}</div>
      <div className={`text-xl font-mono leading-tight mt-0.5 ${highlight ? 'text-green-600 font-semibold' : ''}`}>{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">{label}</div>
      {subValue && <div className="text-[10px] text-muted-foreground">{subValue}</div>}
    </div>
  );
}

function formatHoursMinutes(hours: number): string {
  if (hours <= 0) return '0h 00m';
  const totalMinutes = Math.floor(hours * 60 + 0.5);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes - h * 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}
