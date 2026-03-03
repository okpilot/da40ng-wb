import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TakeoffResultsPanelProps {
  result: TakeoffResult;
  inputs: TakeoffInputs;
}

function distanceColor(required: number, available: number): string {
  if (available <= 0) return '';
  const ratio = required / available;
  if (ratio > 1) return 'text-destructive font-bold';
  if (ratio > 0.7) return 'text-amber-500 font-semibold';
  return 'text-green-600 font-semibold';
}

function marginText(required: number, available: number): string {
  if (available <= 0) return '';
  const margin = available - required;
  const pct = ((margin / available) * 100).toFixed(0);
  if (margin < 0) return `${margin} m`;
  return `+${margin} m (${pct}%)`;
}

export function TakeoffResultsPanel({ result, inputs }: TakeoffResultsPanelProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Results</CardTitle>
      </CardHeader>
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

        {!hasNa && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <ResultBox
              label="TORR"
              sublabel="Ground Roll"
              value={`${result.torr} m`}
              color={distanceColor(result.torr, inputs.tora)}
              note={inputs.tora > 0 ? `vs ${inputs.tora} m — ${marginText(result.torr, inputs.tora)}` : undefined}
            />
            <ResultBox
              label="TODR"
              sublabel="Over 50 ft"
              value={`${result.todr} m`}
              color={distanceColor(result.todr, inputs.toda)}
              note={inputs.toda > 0 ? `vs ${inputs.toda} m — ${marginText(result.todr, inputs.toda)}` : undefined}
            />
            <ResultBox
              label={<>V<sub>R</sub></>}
              sublabel="Rotate"
              value={`${result.vSpeeds.vR} KIAS`}
              color=""
            />
            <ResultBox
              label={<>V<sub>50</sub></>}
              sublabel="50 ft speed"
              value={`${result.vSpeeds.v50} KIAS`}
              color=""
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultBox({ label, sublabel, value, color, note }: {
  label: React.ReactNode; sublabel: string; value: string; color: string; note?: string;
}) {
  return (
    <div className="bg-muted rounded-lg px-3 py-2 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{sublabel}</div>
      <div className={`text-xl font-mono leading-tight ${color}`}>{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      {note && <div className="text-[10px] text-muted-foreground mt-0.5">{note}</div>}
    </div>
  );
}
