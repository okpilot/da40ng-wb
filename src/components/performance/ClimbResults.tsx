import type { ClimbResult, ClimbPointResult } from '@/lib/types';
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

interface RowData {
  label: string;
  sublabel: string;
  point: ClimbPointResult;
}

function ClimbRow({ label, sublabel, point }: RowData) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="py-1.5 pr-3">
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-[10px] text-muted-foreground">{sublabel}</div>
      </td>
      <td className="py-1.5 px-2 text-right font-mono text-xs text-muted-foreground">
        {Math.round(point.pa)}
      </td>
      <td className={`py-1.5 px-2 text-right font-mono text-sm ${rocColor(point.roc)}`}>
        {point.roc}
      </td>
      <td className={`py-1.5 px-2 text-right font-mono text-sm ${gradientColor(point.gradient)}`}>
        {point.gradient.toFixed(1)}%
      </td>
      <td className="py-1.5 pl-2 text-right font-mono text-xs text-muted-foreground">
        {point.tas.toFixed(0)}
      </td>
    </tr>
  );
}

export function ClimbResultsPanel({ result }: ClimbResultsProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const seg = result.climbSegment;

  return (
    <Card className="py-3" data-tour="cl-results">
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            {/* Left: ROC / Gradient table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-1 pr-3">Segment</th>
                    <th className="py-1 px-2 text-right">PA ft</th>
                    <th className="py-1 px-2 text-right">ROC fpm</th>
                    <th className="py-1 px-2 text-right">Gradient</th>
                    <th className="py-1 pl-2 text-right">TAS kt</th>
                  </tr>
                </thead>
                <tbody>
                  <ClimbRow
                    label="T/O Climb"
                    sublabel="Flaps T/O, Vy 72 KIAS"
                    point={result.takeoffClimb}
                  />
                  <ClimbRow
                    label="CC Start"
                    sublabel="Flaps UP, Vy 88 KIAS"
                    point={result.cruiseClimbStart}
                  />
                  <ClimbRow
                    label="CC Average"
                    sublabel=""
                    point={result.cruiseClimbAvg}
                  />
                  <ClimbRow
                    label="CC TOC"
                    sublabel=""
                    point={result.cruiseClimbToc}
                  />
                </tbody>
              </table>
            </div>

            {/* Right: Time / Fuel / Distance */}
            <div className="bg-muted rounded-lg px-5 py-3 flex flex-col justify-center min-w-[180px]">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                DEP → TOC
              </div>
              {seg ? (
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Time</span>
                    <span className="font-mono text-sm font-semibold">{Math.round(seg.time)} min</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Fuel</span>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold">{seg.fuel.toFixed(1)} USG</div>
                      <div className="text-[10px] text-muted-foreground">({(seg.fuel * 3.785).toFixed(1)} L)</div>
                    </div>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Distance</span>
                    <span className="font-mono text-sm font-semibold">{Math.round(seg.distance)} NM</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
