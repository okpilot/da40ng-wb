import type { CruiseResult } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CruiseResultsProps {
  result: CruiseResult;
}

export function CruiseResultsPanel({ result }: CruiseResultsProps) {
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

        {/* Results grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ResultCell
            label="TAS"
            value={`${Math.round(result.tas)}`}
            unit="kt"
            highlight
          />
          <ResultCell
            label="Fuel Flow"
            value={result.fuelFlow.toFixed(1)}
            unit="USG/h"
            subValue={`${result.fuelFlowLph.toFixed(1)} L/h`}
          />
          <ResultCell
            label="Range"
            value={`${Math.round(result.range)}`}
            unit="NM"
          />
          <ResultCell
            label="Endurance"
            value={formatHoursMinutes(result.endurance)}
            unit=""
            subValue={`${result.endurance.toFixed(1)} h`}
          />
        </div>

        {/* Derived conditions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t">
          <div>PA: <span className="font-mono">{Math.round(result.pressureAltitude)} ft</span></div>
          <div>DA: <span className="font-mono">{Math.round(result.densityAltitude)} ft</span></div>
          <div>ISA: <span className="font-mono">{result.isaTemperature.toFixed(1)}°C</span></div>
          <div>ISA dev: <span className={`font-mono ${result.isaDeviation > 0 ? 'text-amber-500' : ''}`}>
            {result.isaDeviation > 0 ? '+' : ''}{result.isaDeviation.toFixed(1)}°C
          </span></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultCell({ label, value, unit, subValue, highlight }: {
  label: string; value: string; unit: string; subValue?: string; highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`font-mono text-xl font-bold ${highlight ? 'text-green-600' : ''}`}>
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
      {subValue && (
        <div className="text-[10px] text-muted-foreground">{subValue}</div>
      )}
    </div>
  );
}

function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}
