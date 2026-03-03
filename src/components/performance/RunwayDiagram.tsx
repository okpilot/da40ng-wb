import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import type { CatCheck } from './CatFactors';
import { Card, CardContent } from '@/components/ui/card';

/* ── Shared layout computation ──────────────────────────────────── */

interface RunwayLayout {
  W: number;
  H: number;
  margin: { left: number; right: number };
  usableW: number;
  rwyTop: number;
  rwyH: number;
  rwyBot: number;
  rwyLength: number;
  behindDist: number;
  stopway: number;
  clearway: number;
  isIntersection: boolean;
  maxDist: number;
  /** Map a distance from threshold to x coordinate */
  x: (d: number) => number;
  /** Map an absolute distance (including behind-intersection) to x coordinate */
  xAbs: (d: number) => number;
}

function computeLayout(
  inputs: TakeoffInputs,
  result: TakeoffResult,
  departureLabel: string,
  fullRunwayTora: number,
  height: number,
): RunwayLayout {
  const tora = inputs.tora;
  const toda = inputs.toda;
  const asda = inputs.asda;
  const isIntersection = departureLabel !== 'Full length';

  const rwyLength = isIntersection && fullRunwayTora > tora ? fullRunwayTora : tora;
  const behindDist = isIntersection && fullRunwayTora > tora ? fullRunwayTora - tora : 0;

  const stopway = Math.max(0, asda - tora);
  const clearway = Math.max(0, toda - tora);

  const maxDist = Math.max(
    behindDist + tora,
    behindDist + toda,
    behindDist + asda,
    behindDist + result.torr,
    behindDist + result.todr,
    rwyLength,
    1,
  );

  const W = 900;
  const margin = { left: 30, right: 120 };
  const usableW = W - margin.left - margin.right;

  const rwyTop = 42;
  const rwyH = 26;

  const x = (d: number) => margin.left + ((behindDist + d) / maxDist) * usableW;
  const xAbs = (d: number) => margin.left + (d / maxDist) * usableW;

  return {
    W, H: height, margin, usableW,
    rwyTop, rwyH, rwyBot: rwyTop + rwyH,
    rwyLength, behindDist, stopway, clearway,
    isIntersection, maxDist, x, xAbs,
  };
}

/* ── Shared runway body (physical surface + markings) ───────────── */

interface RunwayBodyProps {
  layout: RunwayLayout;
  inputs: TakeoffInputs;
  runwayDesignator: string;
  departureLabel: string;
}

function RunwayBody({ layout, inputs, runwayDesignator, departureLabel }: RunwayBodyProps) {
  const { x, xAbs, rwyLength, behindDist, stopway, clearway, rwyTop, rwyH, rwyBot, isIntersection } = layout;
  const tora = inputs.tora;

  return (
    <g>
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

      {/* Threshold zebra stripes */}
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

      {/* Runway designator */}
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

      {/* DER zebra stripes */}
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

      {/* Centerline */}
      {(() => {
        const zebraWidth = Math.min(18, (xAbs(rwyLength) - xAbs(0)) * 0.025);
        const desigSpace = runwayDesignator ? 30 : 0;
        const clStart = x(0) + (behindDist > 0 ? 4 : zebraWidth + desigSpace + 8);
        const clEnd = xAbs(rwyLength) - zebraWidth - 8;
        return <line x1={clStart} y1={rwyTop + rwyH / 2} x2={clEnd} y2={rwyTop + rwyH / 2} stroke="#d1d5db" strokeWidth={1} strokeDasharray="12,8" />;
      })()}

      {/* Slope indicator */}
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

      {/* Departure label for full length */}
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
    </g>
  );
}

/* ── Dimension line helper ──────────────────────────────────────── */

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

/* ── NCO Runway Diagram (declared distances) ────────────────────── */

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
  const layout = computeLayout(inputs, result, departureLabel, fullRunwayTora, 130);
  const { x, rwyBot } = layout;

  const todrColor = barColor(result.todr, inputs.tora);
  const declY = rwyBot + 14;
  const declGap = 14;
  const reqY = layout.rwyTop - 10;
  const reqGap = 14;

  return (
    <Card className="py-2">
      <CardContent>
        <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Horizontal runway diagram">
          <RunwayBody layout={layout} inputs={inputs} runwayDesignator={runwayDesignator} departureLabel={departureLabel} />

          {/* DECLARED DISTANCES — below runway */}
          <DimLineH y={declY} x1={x(0)} x2={x(inputs.tora)} label="TORA" value={`${inputs.tora} m · binding`} color="#3b82f6" />
          <DimLineH y={declY + declGap} x1={x(0)} x2={x(inputs.toda)} label="TODA" value={`${inputs.toda} m · SA`} color="#9ca3af" />
          <DimLineH y={declY + declGap * 2} x1={x(0)} x2={x(inputs.asda)} label="ASDA" value={`${inputs.asda} m · SA`} color="#9ca3af" />

          {/* REQUIRED DISTANCES — above runway */}
          {result.torr > 0 && (
            <DimLineH y={reqY} x1={x(0)} x2={x(result.torr)} label="TORR" value={`${result.torr} m · SA`} color="#9ca3af" />
          )}
          {result.todr > 0 && (
            <DimLineH y={reqY - reqGap} x1={x(0)} x2={x(result.todr)} label="TODR" value={`${result.todr} m`} color={todrColor} />
          )}

          {/* TODR vertical drop line onto runway */}
          {result.todr > 0 && (
            <line x1={x(result.todr)} y1={reqY - reqGap} x2={x(result.todr)} y2={layout.rwyBot} stroke={todrColor} strokeWidth={1.5} strokeDasharray="4,3" />
          )}

          {/* TORA binding vertical line onto runway */}
          {inputs.tora > 0 && (
            <line x1={x(inputs.tora)} y1={declY} x2={x(inputs.tora)} y2={layout.rwyTop} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" />
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

/* ── Part CAT Runway Diagram (factored limits) ──────────────────── */

const LIMIT_COLORS: Record<string, string> = {
  TORA: '#3b82f6',
  TODA: '#8b5cf6',
  ASDA: '#06b6d4',
};

interface CatRunwayDiagramProps {
  inputs: TakeoffInputs;
  result: TakeoffResult;
  departureLabel: string;
  fullRunwayTora: number;
  runwayDesignator: string;
  checks: CatCheck[];
}

export function CatRunwayDiagram({ inputs, result, departureLabel, fullRunwayTora, runwayDesignator, checks }: CatRunwayDiagramProps) {
  if (checks.length === 0) return null;

  const todr = checks[0].todr;
  const limits = checks.map((c) => ({
    label: c.label,
    value: c.limit,
    color: LIMIT_COLORS[c.sourceLabel] ?? '#6b7280',
  }));
  const binding = limits.reduce((min, l) => (l.value < min.value ? l : min), limits[0]);

  // Height adapts: runway body + TODR above + limit lines below
  const limGap = 14;
  const H = 130 + (limits.length - 1) * limGap;

  const layout = computeLayout(inputs, result, departureLabel, fullRunwayTora, H);
  const { x, rwyBot, rwyTop } = layout;

  const todrColor = barColor(todr, binding.value);

  const reqY = rwyTop - 10;
  const limY = rwyBot + 14;

  return (
    <svg viewBox={`0 0 ${layout.W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Part CAT factored-limit diagram">
      <RunwayBody layout={layout} inputs={inputs} runwayDesignator={runwayDesignator} departureLabel={departureLabel} />

      {/* TORR + TODR — above runway */}
      {result.torr > 0 && (
        <DimLineH y={reqY} x1={x(0)} x2={x(result.torr)} label="TORR" value={`${result.torr} m · SA`} color="#9ca3af" />
      )}
      {todr > 0 && (
        <DimLineH y={reqY - 14} x1={x(0)} x2={x(todr)} label="TODR" value={`${todr} m`} color={todrColor} />
      )}

      {/* TODR vertical drop line onto runway */}
      {todr > 0 && (
        <line x1={x(todr)} y1={reqY - 14} x2={x(todr)} y2={rwyBot} stroke={todrColor} strokeWidth={1.5} strokeDasharray="4,3" />
      )}

      {/* 50ft marker */}
      {todr > 0 && (
        <g transform={`translate(${x(todr)}, ${reqY - 14 - 8})`}>
          <polygon points="0,0 -4,-7 4,-7" fill="#f59e0b" />
          <text x={0} y={-10} textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="600">50 ft</text>
        </g>
      )}

      {/* Binding limit vertical line onto runway — originates from the binding row */}
      {binding.value > 0 && (() => {
        const bindIdx = limits.findIndex(l => l.value === binding.value);
        return (
          <line x1={x(binding.value)} y1={limY + bindIdx * limGap} x2={x(binding.value)} y2={rwyTop} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" />
        );
      })()}

      {/* Factored limits — below runway */}
      {limits.map((lim, i) => {
        const isBind = lim.value === binding.value;
        return (
          <DimLineH
            key={lim.label}
            y={limY + i * limGap}
            x1={x(0)}
            x2={x(lim.value)}
            label={lim.label}
            value={`= ${lim.value} m${isBind ? ' ◂ binding' : ''}`}
            color={lim.color}
            bold={isBind}
          />
        );
      })}
    </svg>
  );
}
