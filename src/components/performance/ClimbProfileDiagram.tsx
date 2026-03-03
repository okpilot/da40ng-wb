import type { ClimbResult } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface ClimbProfileDiagramProps {
  result: ClimbResult;
}

/* ── Constants ────────────────────────────────────────────────────── */

const W = 600;
const H = 260;
const margin = { left: 60, right: 80, top: 30, bottom: 30 };
const plotW = W - margin.left - margin.right;
const plotH = H - margin.top - margin.bottom;
const FT_PER_NM = 6076.12;

/* ── Helpers ──────────────────────────────────────────────────────── */

function gradientHex(gradient: number): string {
  if (gradient < 2) return '#ef4444';
  if (gradient < 3.3) return '#f59e0b';
  return '#22c55e';
}

/* ── Sub-components ───────────────────────────────────────────────── */

function GroundBlock({ xEnd, yGround }: { xEnd: number; yGround: number }) {
  return (
    <rect
      x={margin.left}
      y={yGround}
      width={xEnd - margin.left}
      height={H - margin.bottom - yGround}
      fill="#4b5563"
      opacity={0.3}
    />
  );
}

function ClimbPath({
  x1, y1, x2, y2, color,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx={x1} cy={y1} r={4} fill={color} />
      <circle cx={x2} cy={y2} r={4} fill={color} />
    </g>
  );
}

function AltitudeLabel({
  y, label, align,
}: {
  y: number; label: string; align: 'left' | 'right';
}) {
  const x1 = margin.left;
  const x2 = W - margin.right;
  const textX = align === 'left' ? margin.left - 6 : W - margin.right + 6;
  const anchor = align === 'left' ? 'end' : 'start';

  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="4,4" />
      <text
        x={textX} y={y + 4}
        textAnchor={anchor} fontSize="10"
        fontFamily="ui-monospace, monospace" fill="#6b7280"
      >
        {label}
      </text>
    </g>
  );
}

function SegmentLabel({
  x, y, gradient, roc, vy, angle,
}: {
  x: number; y: number; gradient: number; roc: number; vy: number; angle: number;
}) {
  const color = gradientHex(gradient);
  // Offset text perpendicular to the line (above-left)
  const perpX = Math.sin(angle) * 14;
  const perpY = -Math.cos(angle) * 14;

  return (
    <g transform={`translate(${x + perpX}, ${y + perpY})`}>
      <text
        textAnchor="middle" fontSize="10"
        fontFamily="ui-monospace, monospace" fill={color} fontWeight="600"
      >
        {gradient.toFixed(1)}%
      </text>
      <text
        y={13} textAnchor="middle" fontSize="9"
        fontFamily="ui-monospace, monospace" fill="#6b7280"
      >
        {roc} fpm
      </text>
      <text
        y={24} textAnchor="middle" fontSize="9"
        fontFamily="ui-monospace, monospace" fill="#6b7280"
      >
        V_Y {vy} kt
      </text>
    </g>
  );
}

function HeightBracket({
  x, y1, y2, label,
}: {
  x: number; y1: number; y2: number; label: string;
}) {
  const tickW = 5;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#9ca3af" strokeWidth={1} />
      <line x1={x - tickW} y1={y1} x2={x} y2={y1} stroke="#9ca3af" strokeWidth={1} />
      <line x1={x - tickW} y1={y2} x2={x} y2={y2} stroke="#9ca3af" strokeWidth={1} />
      <text
        x={x + 5} y={(y1 + y2) / 2 + 4}
        textAnchor="start" fontSize="9"
        fontFamily="ui-monospace, monospace" fill="#9ca3af"
      >
        {label}
      </text>
    </g>
  );
}

function DistanceLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle" fontSize="9"
      fontFamily="ui-monospace, monospace" fill="#6b7280"
    >
      {label}
    </text>
  );
}

function PointLabel({ x, y, label, anchor }: {
  x: number; y: number; label: string; anchor: 'start' | 'end' | 'middle';
}) {
  return (
    <text
      x={x} y={y}
      textAnchor={anchor} fontSize="10"
      fontFamily="ui-monospace, monospace" fill="#6b7280" fontWeight="600"
    >
      {label}
    </text>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function ClimbProfileDiagram({ result }: ClimbProfileDiagramProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  if (hasNa) return null;

  const depPa = result.pressureAltitude;
  const frPa = result.flapRetractionPa;
  const tocPa = result.cruisePa;

  // Skip degenerate cases
  if (tocPa <= depPa) return null;
  if (frPa >= tocPa) return null;

  const toGradient = result.takeoffClimb.gradient;
  const ccGradient = result.cruiseClimbAvg.gradient;
  if (toGradient <= 0 && ccGradient <= 0) return null;

  // Heights
  const toHeight = frPa - depPa; // ft
  const ccHeight = tocPa - frPa; // ft
  const totalHeight = tocPa - depPa;

  // Horizontal distances (NM)
  const toDistNm = toGradient > 0 ? toHeight / (toGradient / 100) / FT_PER_NM : 0;
  const ccDistNm = ccGradient > 0 ? ccHeight / (ccGradient / 100) / FT_PER_NM : 0;
  const totalDistNm = toDistNm + ccDistNm;

  // Apply minimum 15% width to T/O segment
  let toFraction = totalDistNm > 0 ? toDistNm / totalDistNm : 0.15;
  if (toFraction < 0.15 && toFraction > 0) toFraction = 0.15;
  const ccFraction = 1 - toFraction;

  // X coordinates
  const xDep = margin.left;
  const xFr = margin.left + toFraction * plotW;
  const xToc = margin.left + plotW;

  // Y coordinate mapper
  const y = (pa: number) => margin.top + plotH - ((pa - depPa) / totalHeight) * plotH;

  const yDep = y(depPa);
  const yFr = y(frPa);
  const yToc = y(tocPa);

  // Line angles for label placement
  const toAngle = Math.atan2(yDep - yFr, xFr - xDep);
  const ccAngle = Math.atan2(yFr - yToc, xToc - xFr);

  // Segment midpoints
  const toMidX = (xDep + xFr) / 2;
  const toMidY = (yDep + yFr) / 2;
  const ccMidX = (xFr + xToc) / 2;
  const ccMidY = (yFr + yToc) / 2;

  // Colors
  const toColor = gradientHex(toGradient);
  const ccColor = gradientHex(ccGradient);

  // Height bracket x position
  const bracketX = W - margin.right + 8;

  return (
    <Card className="py-2">
      <CardContent>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Side-view climb profile diagram showing departure, flap retraction, and top of climb"
        >
          {/* Altitude reference lines */}
          <AltitudeLabel y={yDep} label={`${Math.round(depPa)} ft`} align="left" />
          <AltitudeLabel y={yFr} label={`${Math.round(frPa)} ft`} align="left" />
          <AltitudeLabel y={yToc} label={`${Math.round(tocPa)} ft`} align="left" />

          {/* Ground block */}
          <GroundBlock xEnd={xDep + 20} yGround={yDep} />

          {/* T/O climb path */}
          <ClimbPath x1={xDep} y1={yDep} x2={xFr} y2={yFr} color={toColor} />

          {/* Cruise climb path */}
          <ClimbPath x1={xFr} y1={yFr} x2={xToc} y2={yToc} color={ccColor} />

          {/* Segment labels */}
          <SegmentLabel
            x={toMidX} y={toMidY}
            gradient={toGradient}
            roc={result.takeoffClimb.roc}
            vy={72}
            angle={toAngle}
          />
          {/* Only show CC label if there's enough vertical space */}
          {ccFraction > 0.2 && (
            <SegmentLabel
              x={ccMidX} y={ccMidY}
              gradient={ccGradient}
              roc={result.cruiseClimbAvg.roc}
              vy={88}
              angle={ccAngle}
            />
          )}

          {/* Point labels */}
          <PointLabel x={xDep} y={yDep + 16} label="DEP" anchor="start" />
          <PointLabel x={xFr} y={yFr - 10} label="FR" anchor="middle" />
          <PointLabel x={xToc} y={yToc - 10} label="TOC" anchor="end" />

          {/* Height brackets — stacked vertically at same x */}
          {toHeight > 0 && (
            <HeightBracket x={bracketX} y1={yFr} y2={yDep} label={`${Math.round(toHeight)} ft`} />
          )}
          {ccHeight > 0 && (
            <HeightBracket x={bracketX} y1={yToc} y2={yFr} label={`${Math.round(ccHeight)} ft`} />
          )}

          {/* Distance label along bottom */}
          {result.climbSegment && (
            <DistanceLabel
              x={margin.left + plotW / 2}
              y={H - margin.bottom + 18}
              label={`Total: ${Math.round(result.climbSegment.distance)} NM`}
            />
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
