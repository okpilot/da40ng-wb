import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface RunwayDiagramProps {
  inputs: TakeoffInputs;
  result: TakeoffResult;
}

function barColor(required: number, available: number): string {
  if (available <= 0) return '#6b7280';
  const ratio = required / available;
  if (ratio > 1) return '#ef4444';
  if (ratio > 0.7) return '#f59e0b';
  return '#22c55e';
}

export function RunwayDiagram({ inputs, result }: RunwayDiagramProps) {
  const tora = inputs.tora;
  const toda = inputs.toda;
  const asda = inputs.asda;
  const stopway = Math.max(0, asda - tora);
  const clearway = Math.max(0, toda - tora);

  const maxDist = Math.max(toda, asda, result.todr, 1);

  const torrColor = barColor(result.torr, tora);
  const todrColor = barColor(result.todr, toda);

  const W = 900;
  const H = 130;
  const margin = { left: 30, right: 120 };
  const usableW = W - margin.left - margin.right;

  const x = (d: number) => margin.left + (d / maxDist) * usableW;

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
          <defs>
            <pattern id="hatch-h" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M0,8 l8,-8" stroke="#9ca3af" strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* Runway surface */}
          <rect x={x(0)} y={rwyTop} width={x(tora) - x(0)} height={rwyH} fill="#4b5563" rx={3} />

          {/* Stopway */}
          {stopway > 0 && (
            <rect x={x(tora)} y={rwyTop} width={x(tora + stopway) - x(tora)} height={rwyH} fill="#6b7280" stroke="#4b5563" strokeWidth={1} rx={2} />
          )}

          {/* Clearway */}
          {clearway > 0 && (
            <rect x={x(tora)} y={rwyTop - 10} width={x(tora + clearway) - x(tora)} height={rwyH + 20} fill="none" stroke="#4b5563" strokeWidth={2} strokeDasharray="6,4" rx={3} />
          )}

          {/* Centerline */}
          <line x1={x(0) + 8} y1={rwyTop + rwyH / 2} x2={x(tora) - 4} y2={rwyTop + rwyH / 2} stroke="#d1d5db" strokeWidth={1} strokeDasharray="12,8" />

          {/* Slope indicator */}
          {inputs.slope !== 0 && (
            <text x={x(tora / 2)} y={rwyTop - 3} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">
              {inputs.slope > 0 ? '\u2197' : '\u2198'} {Math.abs(inputs.slope).toFixed(1)}% {inputs.slope > 0 ? 'uphill' : 'downhill'}
            </text>
          )}

          {/* Feature labels */}
          {stopway > 0 && (
            <text x={(x(tora) + x(tora + stopway)) / 2} y={rwyTop + rwyH / 2 + 4} textAnchor="middle" fontSize="10" fill="white" opacity={0.7} fontWeight="600">SWY</text>
          )}
          {clearway > 0 && (
            <text x={(x(tora) + x(tora + clearway)) / 2} y={rwyTop - 13} textAnchor="middle" fontSize="9" fill="#4b5563" fontWeight="600">CWY</text>
          )}

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

          {/* THR label */}
          <text x={x(0)} y={rwyBot + 10} textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">THR</text>
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
