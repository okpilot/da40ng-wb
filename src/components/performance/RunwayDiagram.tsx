import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface RunwayDiagramProps {
  inputs: TakeoffInputs;
  result: TakeoffResult;
  departureLabel: string;
  fullRunwayTora: number;
  runwayDesignator: string;
}

function barColor(required: number, available: number): string {
  if (available <= 0) return '#6b7280';
  const ratio = required / available;
  if (ratio > 1) return '#ef4444';
  if (ratio > 0.7) return '#f59e0b';
  return '#22c55e';
}

export function RunwayDiagram({ inputs, result, departureLabel, fullRunwayTora, runwayDesignator }: RunwayDiagramProps) {
  const tora = inputs.tora;
  const toda = inputs.toda;
  const asda = inputs.asda;
  const isIntersection = departureLabel !== 'Full length';

  // For intersection: show full runway with greyed portion behind the intersection point
  const rwyLength = isIntersection && fullRunwayTora > tora ? fullRunwayTora : tora;
  const behindDist = isIntersection && fullRunwayTora > tora ? fullRunwayTora - tora : 0;

  const stopway = Math.max(0, asda - tora);
  const clearway = Math.max(0, toda - tora);

  // maxDist accounts for full runway + clearway/stopway
  const maxDist = Math.max(
    behindDist + tora,
    behindDist + toda,
    behindDist + asda,
    behindDist + result.torr,
    behindDist + result.todr,
    rwyLength,
    1,
  );

  const torrColor = barColor(result.torr, tora);
  const todrColor = barColor(result.todr, toda);

  const W = 900;
  const H = 130;
  const margin = { left: 30, right: 120 };
  const usableW = W - margin.left - margin.right;

  // x(0) = start of available runway (intersection point or threshold)
  // For intersection, the greyed portion is to the left
  const x = (d: number) => margin.left + ((behindDist + d) / maxDist) * usableW;
  const xAbs = (d: number) => margin.left + (d / maxDist) * usableW;

  const rwyTop = 42;
  const rwyH = 26;
  const rwyBot = rwyTop + rwyH;

  const declY = rwyBot + 14;
  const declGap = 14;

  const reqY = rwyTop - 10;
  const reqGap = 14;

  return (
    <Card className="py-2">
      <CardContent>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Horizontal runway diagram">

          {/* Full runway surface */}
          <rect x={xAbs(0)} y={rwyTop} width={xAbs(rwyLength) - xAbs(0)} height={rwyH} fill="#4b5563" rx={3} />

          {/* Greyed-out portion behind intersection */}
          {behindDist > 0 && (
            <rect x={xAbs(0)} y={rwyTop} width={xAbs(behindDist) - xAbs(0)} height={rwyH} fill="rgba(0,0,0,0.35)" rx={3} />
          )}

          {/* Stopway */}
          {stopway > 0 && (
            <rect x={x(tora)} y={rwyTop} width={x(tora + stopway) - x(tora)} height={rwyH} fill="#6b7280" stroke="#4b5563" strokeWidth={1} rx={2} />
          )}

          {/* Clearway */}
          {clearway > 0 && (
            <rect x={x(tora)} y={rwyTop - 6} width={x(tora + clearway) - x(tora)} height={rwyH + 12} fill="none" stroke="#4b5563" strokeWidth={2} strokeDasharray="6,4" rx={3} />
          )}

          {/* Threshold zebra stripes (at the actual runway start, not intersection) */}
          {(() => {
            const zebraX = xAbs(0) + 3;
            const zebraWidth = Math.min(18, (xAbs(rwyLength) - xAbs(0)) * 0.025);
            const stripeCount = 6;
            const stripeH = (rwyH - 4) / (stripeCount * 2 - 1);
            return (
              <g>
                {Array.from({ length: stripeCount }).map((_, i) => (
                  <rect
                    key={i}
                    x={zebraX}
                    y={rwyTop + 2 + i * stripeH * 2}
                    width={zebraWidth}
                    height={stripeH}
                    fill="#d1d5db"
                    rx={1}
                  />
                ))}
              </g>
            );
          })()}

          {/* Runway designator — rotated 90° clockwise, after threshold zebra */}
          {runwayDesignator && (() => {
            const zebraWidth = Math.min(18, (xAbs(rwyLength) - xAbs(0)) * 0.025);
            const desigX = xAbs(0) + zebraWidth + 14;
            const desigY = rwyTop + rwyH / 2;
            return (
              <text x={desigX} y={desigY} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#d1d5db" fontWeight="700" letterSpacing="2"
                transform={`rotate(90, ${desigX}, ${desigY})`}>
                {runwayDesignator}
              </text>
            );
          })()}

          {/* DER zebra stripes (at the far end of the runway) */}
          {(() => {
            const rwyEnd = xAbs(rwyLength);
            const zebraWidth = Math.min(18, (xAbs(rwyLength) - xAbs(0)) * 0.025);
            const stripeCount = 6;
            const stripeH = (rwyH - 4) / (stripeCount * 2 - 1);
            return (
              <g>
                {Array.from({ length: stripeCount }).map((_, i) => (
                  <rect
                    key={i}
                    x={rwyEnd - zebraWidth - 3}
                    y={rwyTop + 2 + i * stripeH * 2}
                    width={zebraWidth}
                    height={stripeH}
                    fill="#d1d5db"
                    rx={1}
                  />
                ))}
              </g>
            );
          })()}

          {/* Intersection marker line */}
          {behindDist > 0 && (
            <g>
              <line x1={x(0)} y1={rwyTop - 4} x2={x(0)} y2={rwyBot + 4} stroke="#f59e0b" strokeWidth={2.5} />
              <text x={x(0) - 6} y={rwyTop + rwyH / 2 + 4} textAnchor="end" fontSize="10" fill="#f59e0b" fontWeight="700">
                {departureLabel}
              </text>
            </g>
          )}

          {/* Centerline — clear of zebra thresholds and designator */}
          {(() => {
            const zebraWidth = Math.min(18, (xAbs(rwyLength) - xAbs(0)) * 0.025);
            const desigSpace = runwayDesignator ? 30 : 0;
            const clStart = x(0) + (behindDist > 0 ? 4 : zebraWidth + desigSpace + 8);
            const clEnd = xAbs(rwyLength) - zebraWidth - 8;
            return <line x1={clStart} y1={rwyTop + rwyH / 2} x2={clEnd} y2={rwyTop + rwyH / 2} stroke="#d1d5db" strokeWidth={1} strokeDasharray="12,8" />;
          })()}

          {/* Slope indicator — outside runway, past stopway/clearway */}
          {inputs.slope !== 0 && (() => {
            const farthest = Math.max(xAbs(rwyLength), x(tora + stopway), x(tora + clearway));
            return (
              <text x={farthest + 8} y={rwyTop + rwyH / 2 + 4} textAnchor="start" fontSize="10" fill="#6b7280" fontWeight="600">
                Slope {Math.abs(inputs.slope).toFixed(1)}% {inputs.slope > 0 ? 'uphill' : 'downhill'}
              </text>
            );
          })()}

          {/* Feature labels */}
          {stopway > 0 && (
            <text x={(x(tora) + x(tora + stopway)) / 2} y={rwyTop + rwyH / 2 + 4} textAnchor="middle" fontSize="10" fill="white" opacity={0.7} fontWeight="600">SWY</text>
          )}
          {clearway > 0 && (
            <text x={(x(tora) + x(tora + clearway)) / 2} y={rwyTop - 13} textAnchor="middle" fontSize="9" fill="#4b5563" fontWeight="600">CWY</text>
          )}

          {/* Departure label for full length — background box to cover centerline */}
          {!isIntersection && (() => {
            const tx = x(tora / 2);
            const ty = rwyTop + rwyH / 2;
            return (
              <g>
                <rect x={tx - 40} y={ty - 7} width={80} height={14} fill="#4b5563" rx={2} />
                <text x={tx} y={ty + 4} textAnchor="middle" fontSize="11" fill="#e5e7eb" fontWeight="700">
                  FULL LENGTH
                </text>
              </g>
            );
          })()}

          {/* DECLARED DISTANCES — below runway */}
          <DimLineH y={declY} x1={x(0)} x2={x(tora)} label="TORA" value={`${tora} m`} color="#3b82f6" />
          <DimLineH y={declY + declGap} x1={x(0)} x2={x(toda)} label="TODA" value={`${toda} m`} color="#8b5cf6" />
          <DimLineH y={declY + declGap * 2} x1={x(0)} x2={x(asda)} label="ASDA" value={`${asda} m`} color="#06b6d4" />

          {/* REQUIRED DISTANCES — above runway */}
          {result.torr > 0 && (
            <DimLineH y={reqY} x1={x(0)} x2={x(result.torr)} label="TORR" value={`${result.torr} m`} color={torrColor} />
          )}
          {result.todr > 0 && (
            <DimLineH y={reqY - reqGap} x1={x(0)} x2={x(result.todr)} label="TODR" value={`${result.todr} m`} color={todrColor} />
          )}

          {/* 50ft marker */}
          {result.todr > 0 && (
            <g transform={`translate(${x(result.todr)}, ${reqY - reqGap - 8})`}>
              <polygon points="0,0 -4,-7 4,-7" fill="#f59e0b" />
              <text x={0} y={-10} textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="600">50 ft</text>
            </g>
          )}

        </svg>
      </CardContent>
    </Card>
  );
}

function DimLineH({ y, x1, x2, label, value, color }: {
  y: number; x1: number; x2: number; label: string; value: string; color: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={2} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={color} strokeWidth={2} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={color} strokeWidth={2} />
      <text x={x2 + 6} y={y + 4} textAnchor="start" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="700" fill={color}>
        {label} {value}
      </text>
    </g>
  );
}
