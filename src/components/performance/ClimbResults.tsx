import type { ClimbResult } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClimbResultsProps {
  result: ClimbResult;
}

function rocColor(roc: number): string {
  if (roc < 100) return 'text-destructive font-bold';
  if (roc < 300) return 'text-amber-500 font-semibold';
  return 'text-green-600 font-semibold';
}

function gradientColor(gradient: number): string {
  if (gradient < 2) return 'text-destructive font-bold';
  if (gradient < 3.3) return 'text-amber-500 font-semibold';
  return 'text-green-600 font-semibold';
}

export function ClimbResultsPanel({ result }: ClimbResultsProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const seg = result.climbSegment;

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

        {!hasNa && (
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-3 items-stretch">
            <ResultBox
              label="T/O Climb ROC"
              sublabel="Flaps T/O 72kt"
              value={`${result.takeoffClimbRoc} fpm`}
              color={rocColor(result.takeoffClimbRoc)}
            />
            <ResultBox
              label="T/O Gradient"
              sublabel="at dep PA"
              value={`${result.takeoffClimbGradient.toFixed(1)}%`}
              color={gradientColor(result.takeoffClimbGradient)}
            />
            <ResultBox
              label="Cruise Climb ROC"
              sublabel="Flaps UP 88kt"
              value={`${result.cruiseClimbRoc} fpm`}
              color={rocColor(result.cruiseClimbRoc)}
            />
            <ResultBox
              label="Cruise Gradient"
              sublabel="at dep PA"
              value={`${result.cruiseClimbGradient.toFixed(1)}%`}
              color={gradientColor(result.cruiseClimbGradient)}
            />
            {seg ? (
              <>
                <ResultBox
                  label="Time"
                  sublabel={`→ FL${String(Math.round(result.cruisePa / 100)).padStart(3, '0')}`}
                  value={`${Math.round(seg.time)} min`}
                  color=""
                />
                <ResultBox
                  label="Fuel"
                  sublabel={`(${(seg.fuel * 3.785).toFixed(1)} L)`}
                  value={`${seg.fuel.toFixed(1)} USG`}
                  color=""
                />
                <ResultBox
                  label="Distance"
                  sublabel=""
                  value={`${Math.round(seg.distance)} NM`}
                  color=""
                />
              </>
            ) : (
              <>
                <ResultBox label="Time" sublabel="" value="—" color="text-muted-foreground" />
                <ResultBox label="Fuel" sublabel="" value="—" color="text-muted-foreground" />
                <ResultBox label="Distance" sublabel="" value="—" color="text-muted-foreground" />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultBox({ label, sublabel, value, color }: {
  label: string; sublabel: string; value: string; color: string;
}) {
  return (
    <div className="bg-muted rounded-lg px-3 py-3 text-center flex flex-col items-center justify-center">
      {sublabel && <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{sublabel}</div>}
      <div className={`text-xl font-mono leading-tight mt-0.5 ${color}`}>{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
