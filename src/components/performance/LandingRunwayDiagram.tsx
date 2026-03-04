import type { LandingResult, LandingInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

/* ── Layout computation ───────────────────────────────────────── */

interface LandingLayout {
  W: number;
  H: number;
  margin: { left: number; right: number };
  usableW: number;
  rwyTop: number;
  rwyH: number;
  rwyBot: number;
  rwyLength: number;
  maxDist: number;
  x: (d: number) => number;
}

function computeLayout(lda: number, ldr: number, lgrr: number): LandingLayout {
  const rwyLength = lda;
  const maxDist = Math.max(rwyLength, ldr, lgrr, 1);

  const W = 900;
  const H = 110;
  const margin = { left: 30, right: 120 };
  const usableW = W - margin.left - margin.right;

  const rwyTop = 42;
  const rwyH = 26;

  const x = (d: number) => margin.left + (d / maxDist) * usableW;

  return {
    W, H, margin, usableW,
    rwyTop, rwyH, rwyBot: rwyTop + rwyH,
    rwyLength, maxDist, x,
  };
}

/* ── Bar colour (same logic as takeoff) ────────────────────────── */

function barColor(required: number, available: number): string {
  if (available <= 0) return '#6b7280';
  const ratio = required / available;
  if (ratio > 1) return '#ef4444';
  if (ratio > 0.7) return '#f59e0b';
  return '#22c55e';
}

/* ── Dimension line helper ─────────────────────────────────────── */

function DimLineH({ y, x1, x2, label, value, color, bold }: {
  y: number; x1: number; x2: number; label: string; value: string; color: string; bold?: boolean;
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={bold ? 2.5 : 2} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={color} strokeWidth={bold ? 2.5 : 2} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={color} strokeWidth={bold ? 2.5 : 2} />
      <text x={x2 + 6} y={y + 4} textAnchor="start" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="700" fill={color}>
        {label} {value}
      </text>
    </g>
  );
}

/* ── Landing Runway Diagram ────────────────────────────────────── */

interface LandingRunwayDiagramProps {
  result: LandingResult;
  inputs: LandingInputs;
  designator?: string;
}

export function LandingRunwayDiagram({ result, inputs, designator }: LandingRunwayDiagramProps) {
  const lda = inputs.lda;
  if (lda <= 0) return null;

  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  if (hasNa) return null;

  const ldr = Math.round(result.ldr);
  const lgrr = Math.round(result.lgrr);

  const layout = computeLayout(lda, ldr, lgrr);
  const { x, rwyTop, rwyH, rwyBot } = layout;

  const ldrColor = barColor(ldr, lda);

  const declY = rwyBot + 14;
  const reqY = rwyTop - 10;
  const reqGap = 14;

  return (
    <Card className="py-2" data-tour="ld-runway-diagram">
      <CardContent>
        <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Landing runway diagram">
          {/* Runway surface */}
          <rect x={x(0)} y={rwyTop} width={x(lda) - x(0)} height={rwyH} fill="#4b5563" rx={3} />

          {/* Threshold zebra stripes (approach end — left side for landing) */}
          {(() => {
            const zebraX = x(0) + 3;
            const zebraWidth = Math.min(18, (x(lda) - x(0)) * 0.025);
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

          {/* End zebra stripes */}
          {(() => {
            const rwyEnd = x(lda);
            const zebraWidth = Math.min(18, (x(lda) - x(0)) * 0.025);
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

          {/* Centerline */}
          {(() => {
            const zebraWidth = Math.min(18, (x(lda) - x(0)) * 0.025);
            const clStart = x(0) + zebraWidth + 8;
            const clEnd = x(lda) - zebraWidth - 8;
            return <line x1={clStart} y1={rwyTop + rwyH / 2} x2={clEnd} y2={rwyTop + rwyH / 2} stroke="#d1d5db" strokeWidth={1} strokeDasharray="12,8" />;
          })()}

          {/* Runway designator at approach end */}
          {designator && (() => {
            const zebraWidth = Math.min(18, (x(lda) - x(0)) * 0.025);
            const desigX = x(0) + zebraWidth + 14;
            const desigY = rwyTop + rwyH / 2;
            return (
              <text
                x={desigX}
                y={desigY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="700"
                fill="#d1d5db"
                letterSpacing="2"
                transform={`rotate(90, ${desigX}, ${desigY})`}
              >
                {designator}
              </text>
            );
          })()}

          {/* Slope indicator */}
          {inputs.slope !== 0 && (
            <text x={x(lda) + 8} y={rwyTop + rwyH / 2 + 4} textAnchor="start" fontSize="10" fill="#6b7280" fontWeight="600">
              Slope {Math.abs(inputs.slope).toFixed(1)}% {inputs.slope > 0 ? 'uphill' : 'downhill'}
            </text>
          )}

          {/* DECLARED DISTANCE — below runway */}
          <DimLineH y={declY} x1={x(0)} x2={x(lda)} label="LDA" value={`${lda} m`} color="#3b82f6" bold />

          {/* LDA binding vertical line onto runway */}
          <line x1={x(lda)} y1={declY} x2={x(lda)} y2={rwyTop} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" />

          {/* REQUIRED DISTANCES — above runway */}
          {lgrr > 0 && (
            <DimLineH y={reqY} x1={x(ldr - lgrr)} x2={x(ldr)} label="LR" value={`${lgrr} m`} color="#9ca3af" />
          )}
          {ldr > 0 && (
            <DimLineH y={reqY - reqGap} x1={x(0)} x2={x(ldr)} label="LDR" value={`${ldr} m`} color={ldrColor} />
          )}

          {/* LDR vertical drop line onto runway */}
          {ldr > 0 && (
            <line x1={x(ldr)} y1={reqY - reqGap} x2={x(ldr)} y2={rwyBot} stroke={ldrColor} strokeWidth={1.5} strokeDasharray="4,3" />
          )}

          {/* 50ft marker (approach end) */}
          {ldr > 0 && (
            <g transform={`translate(${x(0)}, ${reqY - reqGap - 8})`}>
              <polygon points="0,0 -4,-7 4,-7" fill="#f59e0b" />
              <text x={0} y={-10} textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="600">50 ft</text>
            </g>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
