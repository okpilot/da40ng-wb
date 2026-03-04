import type { ClimbResult, ClimbInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface ClimbProfileDiagramProps {
  result: ClimbResult;
  inputs: ClimbInputs;
}

/* ── Constants ────────────────────────────────────────────────────── */

const W = 640;
const H = 280;
const margin = { left: 120, right: 100, top: 30, bottom: 30 };
const plotW = W - margin.left - margin.right;
const plotH = H - margin.top - margin.bottom;
const FT_PER_NM = 6076.12;
const MIN_LABEL_GAP = 22;
const FONT = 'ui-monospace, monospace';
const FS = 8;

/* ── Helpers ──────────────────────────────────────────────────────── */

function gradientHex(gradient: number): string {
  if (gradient < 2) return '#ef4444';
  if (gradient < 3.3) return '#f59e0b';
  return '#22c55e';
}

function spreadLabels(positions: number[]): number[] {
  const result = [...positions];
  const indices = result.map((_, i) => i).sort((a, b) => result[a] - result[b]);
  for (let i = 1; i < indices.length; i++) {
    const prev = indices[i - 1];
    const curr = indices[i];
    if (result[curr] - result[prev] < MIN_LABEL_GAP) {
      result[curr] = result[prev] + MIN_LABEL_GAP;
    }
  }
  return result;
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
      opacity={0.25}
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
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={x1} cy={y1} r={3} fill={color} />
      <circle cx={x2} cy={y2} r={3} fill={color} />
    </g>
  );
}

function AltitudeRef({
  y, labelY, pointName, altText, paText,
}: {
  y: number; labelY: number; pointName: string; altText: string; paText: string;
}) {
  const x1 = margin.left;
  const x2 = W - margin.right;
  const textX = margin.left - 6;

  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="4,4" />
      {Math.abs(labelY - y) > 2 && (
        <line x1={textX + 2} y1={labelY} x2={x1} y2={y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="2,2" />
      )}
      <text
        x={textX} y={labelY + 3}
        textAnchor="end" fontSize={FS}
        fontFamily={FONT} fill="#6b7280"
      >
        <tspan fontWeight="700">{pointName}</tspan>
        {' '}{altText}
      </text>
      <text
        x={textX} y={labelY + 13}
        textAnchor="end" fontSize={FS}
        fontFamily={FONT} fill="#9ca3af"
      >
        ({paText})
      </text>
    </g>
  );
}

function SegmentAnnotation({
  x, y, gradient, roc, vy,
}: {
  x: number; y: number; gradient: number; roc: number; vy: number;
}) {
  const color = gradientHex(gradient);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        textAnchor="middle" fontSize={FS}
        fontFamily={FONT} fill={color} fontWeight="600"
      >
        <tspan>{gradient.toFixed(1)}%</tspan>
        <tspan fill="#6b7280" fontWeight="400"> {roc} fpm</tspan>
      </text>
      <text
        y={11} textAnchor="middle" fontSize={FS}
        fontFamily={FONT} fill="#6b7280"
      >
        Vy {vy} kt
      </text>
    </g>
  );
}

function HeightBracket({
  x, y1, y2, label,
}: {
  x: number; y1: number; y2: number; label: string;
}) {
  const tickW = 4;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#9ca3af" strokeWidth={0.75} />
      <line x1={x - tickW} y1={y1} x2={x} y2={y1} stroke="#9ca3af" strokeWidth={0.75} />
      <line x1={x - tickW} y1={y2} x2={x} y2={y2} stroke="#9ca3af" strokeWidth={0.75} />
      <text
        x={x + 4} y={(y1 + y2) / 2 + 3}
        textAnchor="start" fontSize={FS}
        fontFamily={FONT} fill="#9ca3af"
      >
        {label}
      </text>
    </g>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function ClimbProfileDiagram({ result, inputs }: ClimbProfileDiagramProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  if (hasNa) return null;

  const depPa = result.pressureAltitude;
  const frPa = result.flapRetractionPa;
  const tocPa = result.cruisePa;

  const depElev = inputs.elevation;
  const fraAlt = inputs.elevation + inputs.flapRetractionHeight;
  const tocAlt = inputs.cruiseAltitude;

  if (tocPa <= depPa) return null;
  if (frPa >= tocPa) return null;

  const toGradient = result.takeoffClimb.gradient;
  const ccGradient = result.cruiseClimbAvg.gradient;
  if (toGradient <= 0 && ccGradient <= 0) return null;

  const toHeight = frPa - depPa;
  const ccHeight = tocPa - frPa;
  const totalHeight = tocPa - depPa;

  const toDistNm = toGradient > 0 ? toHeight / (toGradient / 100) / FT_PER_NM : 0;
  const ccDistNm = ccGradient > 0 ? ccHeight / (ccGradient / 100) / FT_PER_NM : 0;
  const totalDistNm = toDistNm + ccDistNm;

  let toFraction = totalDistNm > 0 ? toDistNm / totalDistNm : 0.15;
  if (toFraction < 0.15 && toFraction > 0) toFraction = 0.15;
  const ccFraction = 1 - toFraction;

  const xDep = margin.left;
  const xFr = margin.left + toFraction * plotW;
  const xToc = margin.left + plotW;

  const yAt = (pa: number) => margin.top + plotH - ((pa - depPa) / totalHeight) * plotH;
  const yDep = yAt(depPa);
  const yFr = yAt(frPa);
  const yToc = yAt(tocPa);

  const [adjToc, adjFr, adjDep] = spreadLabels([yToc, yFr, yDep]);

  // T/O annotation: above FRA line (2 lines × 11px + 8px clearance)
  const toAnnotX = (xDep + xFr) / 2;
  const toAnnotY = yFr - 22;

  // CC annotation: perpendicular offset above cruise climb line
  const ccAngle = Math.atan2(yFr - yToc, xToc - xFr);
  const ccMidX = (xFr + xToc) / 2;
  const ccMidY = (yFr + yToc) / 2;
  const ccAnnotX = ccMidX + Math.sin(ccAngle) * 36;
  const ccAnnotY = ccMidY - Math.cos(ccAngle) * 36;

  const toColor = gradientHex(toGradient);
  const ccColor = gradientHex(ccGradient);
  const bracketX = W - margin.right + 6;

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
          <AltitudeRef
            y={yDep} labelY={adjDep}
            pointName="DEP"
            altText={`${Math.round(depElev)} ft`}
            paText={`${Math.round(depPa)} PA`}
          />
          <AltitudeRef
            y={yFr} labelY={adjFr}
            pointName="FRA"
            altText={`${Math.round(fraAlt)} ft`}
            paText={`${Math.round(frPa)} PA`}
          />
          <AltitudeRef
            y={yToc} labelY={adjToc}
            pointName="TOC"
            altText={`${Math.round(tocAlt)} ft`}
            paText={`${Math.round(tocPa)} PA`}
          />

          <GroundBlock xEnd={xDep + 16} yGround={yDep} />
          <ClimbPath x1={xDep} y1={yDep} x2={xFr} y2={yFr} color={toColor} />
          <ClimbPath x1={xFr} y1={yFr} x2={xToc} y2={yToc} color={ccColor} />

          <SegmentAnnotation
            x={toAnnotX} y={toAnnotY}
            gradient={toGradient}
            roc={result.takeoffClimb.roc}
            vy={72}
          />
          {ccFraction > 0.2 && (
            <SegmentAnnotation
              x={ccAnnotX} y={ccAnnotY}
              gradient={ccGradient}
              roc={result.cruiseClimbAvg.roc}
              vy={88}
            />
          )}

          {toHeight > 0 && (
            <HeightBracket x={bracketX} y1={yFr} y2={yDep} label={`${Math.round(toHeight)} ft`} />
          )}
          {ccHeight > 0 && (
            <HeightBracket x={bracketX} y1={yToc} y2={yFr} label={`${Math.round(ccHeight)} ft`} />
          )}

          {result.climbSegment && (
            <text
              x={margin.left + plotW / 2}
              y={H - margin.bottom + 16}
              textAnchor="middle" fontSize={FS}
              fontFamily={FONT} fill="#6b7280"
            >
              Total: {Math.round(result.climbSegment.distance)} NM
            </text>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
