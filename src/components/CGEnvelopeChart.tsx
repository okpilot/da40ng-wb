import { useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { da40ng } from '@/data/da40ng';
import {
  buildEnvelopePolygon,
  getActiveFwdLimit,
  getActiveAftLimit,
  getEffectiveLimits,
  isWithinEnvelope,
} from '@/lib/calculations';
import type { AircraftConfig, CalculationResult } from '@/lib/types';

interface Props {
  config: AircraftConfig;
  result: CalculationResult;
}

// Chart layout constants
const MARGIN = { top: 20, right: 30, bottom: 45, left: 55 };
const CHART_WIDTH = 520;
const CHART_HEIGHT = 380;
const PLOT_W = CHART_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

// Axis ranges
const CG_MIN = 2.35;
const CG_MAX = 2.58;
const MASS_MIN = 900;
const MASS_MAX = 1350;

function cgToX(cg: number): number {
  return MARGIN.left + ((cg - CG_MIN) / (CG_MAX - CG_MIN)) * PLOT_W;
}

function massToY(mass: number): number {
  // Y axis inverted: higher mass = higher on chart (lower Y pixel)
  return MARGIN.top + PLOT_H - ((mass - MASS_MIN) / (MASS_MAX - MASS_MIN)) * PLOT_H;
}

function generateTicks(min: number, max: number, step: number): number[] {
  const ticks: number[] = [];
  for (let v = min; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return ticks;
}

function ConditionPoint({
  cg,
  mass,
  label,
  inEnvelope,
}: {
  cg: number;
  mass: number;
  label: string;
  inEnvelope: boolean;
}) {
  const x = cgToX(cg);
  const y = massToY(mass);
  const color = inEnvelope ? '#16a34a' : '#dc2626';

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={5}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x={x + 9}
        y={y - 9}
        fontSize={11}
        fontWeight={700}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

export function CGEnvelopeChart({ config, result }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const fwdLimit = getActiveFwdLimit(da40ng, config.activeMods);
  const aftLimit = getActiveAftLimit(da40ng, config.activeMods);
  const limits = getEffectiveLimits(da40ng, config.activeMods);

  const envelopePolygon = useMemo(
    () => buildEnvelopePolygon(fwdLimit, aftLimit),
    [fwdLimit, aftLimit],
  );

  const polygonPoints = envelopePolygon
    .map((p) => `${cgToX(p.cg)},${massToY(p.mass)}`)
    .join(' ');

  // Forward limit polyline (for the distinct stroke)
  const fwdPolyline = fwdLimit
    .map((p) => `${cgToX(p.cg)},${massToY(p.mass)}`)
    .join(' ');

  // Aft limit polyline
  const aftPolyline = aftLimit
    .map((p) => `${cgToX(p.cg)},${massToY(p.mass)}`)
    .join(' ');

  // Top edge (connecting fwd top to aft top)
  const topFwd = fwdLimit[fwdLimit.length - 1];
  const topAft = aftLimit[aftLimit.length - 1];

  // Bottom edge (connecting aft bottom to fwd bottom)
  const bottomFwd = fwdLimit[0];
  const bottomAft = aftLimit[0];

  // Only show points when something beyond BEM has been entered
  const hasLoading =
    result.zfm.mass !== config.bemMass || result.tom.mass !== result.zfm.mass;

  const conditions = hasLoading
    ? [
        { label: 'ZFM', ...result.zfm },
        ...(result.tom.mass !== result.zfm.mass
          ? [{ label: 'TOM', ...result.tom }]
          : []),
        ...(result.lm.mass !== result.tom.mass
          ? [{ label: 'LM', ...result.lm }]
          : []),
      ]
    : [];

  // Trajectory path
  const trajectoryPath =
    conditions.length >= 2
      ? conditions
          .map((c, i) => `${i === 0 ? 'M' : 'L'}${cgToX(c.cg)},${massToY(c.mass)}`)
          .join(' ')
      : '';

  // Grid
  const cgTicks = generateTicks(CG_MIN, CG_MAX, 0.025);
  const massTicks = generateTicks(MASS_MIN, MASS_MAX, 50);

  // Limit lines for MTOM, Max Landing, Max ZFM
  const limitLines: { mass: number; label: string; dash: string }[] = [
    { mass: limits.mtom, label: `MTOM ${limits.mtom}`, dash: '6 3' },
    { mass: limits.maxLanding, label: `Max Ldg ${limits.maxLanding}`, dash: '4 2' },
    { mass: limits.maxZfm, label: `Max ZFM ${limits.maxZfm}`, dash: '2 2' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">CG Envelope</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full max-w-[520px]"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {/* Grid lines */}
          {cgTicks.map((v) => (
            <line
              key={`gx-${v}`}
              x1={cgToX(v)}
              y1={MARGIN.top}
              x2={cgToX(v)}
              y2={MARGIN.top + PLOT_H}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          ))}
          {massTicks.map((v) => (
            <line
              key={`gy-${v}`}
              x1={MARGIN.left}
              y1={massToY(v)}
              x2={MARGIN.left + PLOT_W}
              y2={massToY(v)}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          ))}

          {/* Envelope fill */}
          <polygon
            points={polygonPoints}
            fill="#dbeafe"
            stroke="none"
          />

          {/* Envelope border — fwd limit (bold) */}
          <polyline
            points={fwdPolyline}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth={2}
          />

          {/* Envelope border — aft limit */}
          <polyline
            points={aftPolyline}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth={2}
          />

          {/* Top edge */}
          <line
            x1={cgToX(topFwd.cg)}
            y1={massToY(topFwd.mass)}
            x2={cgToX(topAft.cg)}
            y2={massToY(topAft.mass)}
            stroke="#1d4ed8"
            strokeWidth={2}
          />

          {/* Bottom edge */}
          <line
            x1={cgToX(bottomFwd.cg)}
            y1={massToY(bottomFwd.mass)}
            x2={cgToX(bottomAft.cg)}
            y2={massToY(bottomAft.mass)}
            stroke="#1d4ed8"
            strokeWidth={2}
          />

          {/* Fwd / Aft labels on the envelope */}
          <text
            x={cgToX(fwdLimit[0].cg) + 4}
            y={massToY(fwdLimit[0].mass) - 6}
            fontSize={9}
            fill="#1d4ed8"
            fontWeight={600}
          >
            FWD
          </text>
          <text
            x={cgToX(aftLimit[0].cg) - 22}
            y={massToY(aftLimit[0].mass) - 6}
            fontSize={9}
            fill="#1d4ed8"
            fontWeight={600}
          >
            AFT
          </text>

          {/* Mass limit reference lines */}
          {limitLines.map(({ mass, label, dash }) => (
            <g key={label}>
              <line
                x1={MARGIN.left}
                y1={massToY(mass)}
                x2={MARGIN.left + PLOT_W}
                y2={massToY(mass)}
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray={dash}
              />
              <text
                x={MARGIN.left + PLOT_W - 2}
                y={massToY(mass) - 3}
                fontSize={8}
                fill="#6b7280"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          ))}

          {/* Trajectory line */}
          {trajectoryPath && (
            <path
              d={trajectoryPath}
              fill="none"
              stroke="#6b7280"
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
          )}

          {/* Condition points */}
          {conditions.map((c) => (
            <ConditionPoint
              key={c.label}
              cg={c.cg}
              mass={c.mass}
              label={c.label}
              inEnvelope={isWithinEnvelope(c.mass, c.cg, fwdLimit, aftLimit)}
            />
          ))}

          {/* Axes */}
          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={MARGIN.top + PLOT_H}
            stroke="#374151"
            strokeWidth={1}
          />
          <line
            x1={MARGIN.left}
            y1={MARGIN.top + PLOT_H}
            x2={MARGIN.left + PLOT_W}
            y2={MARGIN.top + PLOT_H}
            stroke="#374151"
            strokeWidth={1}
          />

          {/* X axis ticks + labels */}
          {cgTicks.map((v) => (
            <g key={`xt-${v}`}>
              <line
                x1={cgToX(v)}
                y1={MARGIN.top + PLOT_H}
                x2={cgToX(v)}
                y2={MARGIN.top + PLOT_H + 5}
                stroke="#374151"
                strokeWidth={1}
              />
              <text
                x={cgToX(v)}
                y={MARGIN.top + PLOT_H + 16}
                fontSize={9}
                textAnchor="middle"
                fill="#374151"
              >
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Y axis ticks + labels */}
          {massTicks.map((v) => (
            <g key={`yt-${v}`}>
              <line
                x1={MARGIN.left - 5}
                y1={massToY(v)}
                x2={MARGIN.left}
                y2={massToY(v)}
                stroke="#374151"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={massToY(v) + 3}
                fontSize={9}
                textAnchor="end"
                fill="#374151"
              >
                {v}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={MARGIN.left + PLOT_W / 2}
            y={CHART_HEIGHT - 4}
            fontSize={11}
            textAnchor="middle"
            fill="#374151"
            fontWeight={600}
          >
            CG Position (m aft of datum)
          </text>
          <text
            x={14}
            y={MARGIN.top + PLOT_H / 2}
            fontSize={11}
            textAnchor="middle"
            fill="#374151"
            fontWeight={600}
            transform={`rotate(-90, 14, ${MARGIN.top + PLOT_H / 2})`}
          >
            Aircraft Mass (kg)
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}
