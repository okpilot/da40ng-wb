import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Minus, AlertTriangle } from 'lucide-react';
import { da40ng } from '@/data/da40ng';
import {
  buildEnvelopePolygon,
  isWithinEnvelope,
} from '@/lib/calculations';
import type { LearnProgress } from '@/hooks/useLearnProgress';

interface Props {
  progress: LearnProgress;
}

// Original (wrong) values
const ORIGINAL = {
  bem: { mass: 940, arm: 2.442, moment: 2295.48 },
  front: { mass: 160, arm: 2.30, moment: 368.0 },
  rear: { mass: 140, arm: 3.25, moment: 455.0 },
  baggage: { mass: 15, arm: 3.65, moment: 54.75 },
  zfm: { mass: 1255, moment: 3173.23, cg: 2.52847 },
};

// Corrected values (after offloading rear passenger)
const CORRECTED = {
  rear: { mass: 55, arm: 3.25, moment: 178.75 },
  zfm: { mass: 1170, moment: 2896.98, cg: 2.47605 },
  fuel: { mass: 79.5, arm: 2.63, moment: 209.1 },
  tom: { mass: 1249.5, moment: 3106.05, cg: 2.48585 },
  tripFuel: { mass: 38.2, arm: 2.63, moment: 100.4 },
  lm: { mass: 1211.3, moment: 3005.70, cg: 2.48130 },
};

const LIMITS = da40ng.baseLimits;

function getRevealState(progress: LearnProgress) {
  return {
    bemMoment: progress.isExerciseComplete('example-step1'),
    payloadMoments: progress.isExerciseComplete('example-step2'),
    zfmOriginal: progress.isExerciseComplete('example-step3'),
    // Granular reveal for correction step (step4)
    correctionStarted: progress.isExerciseComplete('example-step3'), // show new rear mass once original ZFM is done
    rearMomentCorrected: progress.getExerciseChecked('example-step4', 'rear-moment-corrected') === true,
    zfmCorrected: progress.isExerciseComplete('example-step4'),
    fuel: progress.isExerciseComplete('example-step5'),
    tom: progress.isExerciseComplete('example-step6'),
    lm: progress.isExerciseComplete('example-step7'),
  };
}

// ─── Mini Loading Sheet ───────────────────────────────────────

function LoadingRow({
  label,
  mass,
  arm,
  moment,
  revealed,
  isSubtotal,
  failed,
  strikethrough,
  hideMoment,
  cg,
}: {
  label: string;
  mass: number;
  arm?: number;
  moment: number;
  revealed: boolean;
  isSubtotal?: boolean;
  failed?: boolean;
  strikethrough?: boolean;
  /** For subtotal rows, show CG in the arm column */
  cg?: number;
  /** Show mass but hide moment (not yet calculated) */
  hideMoment?: boolean;
}) {
  const base = isSubtotal ? 'font-semibold' : '';
  const color = failed ? 'text-red-600 dark:text-red-400' : '';
  const bg = isSubtotal
    ? failed
      ? 'bg-red-50 dark:bg-red-950/20'
      : 'bg-muted/50'
    : '';
  const strike = strikethrough ? 'line-through opacity-40' : '';

  return (
    <tr className={`${bg} text-xs`}>
      <td className={`py-1 pr-1 pl-2 ${base} ${strike}`}>{label}</td>
      <td className={`py-1 px-1 text-right font-mono ${base} ${color} ${strike}`}>
        {revealed ? mass.toFixed(1) : '—'}
      </td>
      <td className={`py-1 px-1 text-right font-mono ${strike} ${cg != null && revealed ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
        {cg != null && revealed ? cg.toFixed(3) : arm != null ? arm.toFixed(2) : ''}
      </td>
      <td className={`py-1 px-1 text-right font-mono ${base} ${color} ${strike}`}>
        {revealed && !hideMoment ? moment.toFixed(1) : '—'}
      </td>
    </tr>
  );
}

function MiniLoadingSheet({ progress }: Props) {
  const r = getRevealState(progress);
  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm">Loading Sheet</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-muted-foreground border-b">
              <th className="py-1 pl-2 pr-1 text-left font-medium">Item</th>
              <th className="py-1 px-1 text-right font-medium">Mass</th>
              <th className="py-1 px-1 text-right font-medium">Arm</th>
              <th className="py-1 px-1 text-right font-medium">Mom.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <LoadingRow label="BEM" mass={ORIGINAL.bem.mass} arm={ORIGINAL.bem.arm} moment={ORIGINAL.bem.moment} revealed={r.bemMoment} />
            <LoadingRow label="Front Seats" mass={ORIGINAL.front.mass} arm={ORIGINAL.front.arm} moment={ORIGINAL.front.moment} revealed={r.payloadMoments} />

            {/* Rear: original → struck through once correction starts → corrected progressively */}
            <LoadingRow
              label="Rear Seats"
              mass={ORIGINAL.rear.mass}
              arm={ORIGINAL.rear.arm}
              moment={ORIGINAL.rear.moment}
              revealed={r.payloadMoments}
              strikethrough={r.correctionStarted}
            />
            {r.correctionStarted && (
              <LoadingRow
                label="Rear (corrected)"
                mass={CORRECTED.rear.mass}
                arm={CORRECTED.rear.arm}
                moment={CORRECTED.rear.moment}
                revealed
                hideMoment={!r.rearMomentCorrected}
              />
            )}

            <LoadingRow label="Baggage" mass={ORIGINAL.baggage.mass} arm={ORIGINAL.baggage.arm} moment={ORIGINAL.baggage.moment} revealed={r.payloadMoments} />

            {/* ZFM — original shown with exceedance, then struck through once correction progresses */}
            {r.zfmOriginal && (
              <LoadingRow
                label={r.correctionStarted ? 'ZFM (original)' : 'Zero Fuel Mass'}
                mass={ORIGINAL.zfm.mass}
                moment={ORIGINAL.zfm.moment}
                cg={ORIGINAL.zfm.cg}
                revealed
                isSubtotal
                failed
                strikethrough={r.correctionStarted}
              />
            )}
            {r.zfmCorrected && (
              <LoadingRow label="Zero Fuel Mass" mass={CORRECTED.zfm.mass} moment={CORRECTED.zfm.moment} cg={CORRECTED.zfm.cg} revealed isSubtotal />
            )}

            {/* Fuel */}
            {r.fuel && <LoadingRow label="Takeoff Fuel" mass={CORRECTED.fuel.mass} arm={CORRECTED.fuel.arm} moment={CORRECTED.fuel.moment} revealed />}

            {/* TOM */}
            {r.tom && (
              <LoadingRow label="Takeoff Mass" mass={CORRECTED.tom.mass} moment={CORRECTED.tom.moment} cg={CORRECTED.tom.cg} revealed isSubtotal />
            )}

            {/* Trip fuel + LM */}
            {r.lm && (
              <>
                <LoadingRow label="Trip Fuel (−)" mass={-CORRECTED.tripFuel.mass} arm={CORRECTED.tripFuel.arm} moment={-CORRECTED.tripFuel.moment} revealed />
                <LoadingRow label="Landing Mass" mass={CORRECTED.lm.mass} moment={CORRECTED.lm.moment} cg={CORRECTED.lm.cg} revealed isSubtotal />
              </>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─── Mini CG Envelope ─────────────────────────────────────────

const ENV_M = { top: 15, right: 20, bottom: 30, left: 40 };
const ENV_W = 340;
const ENV_H = 220;
const ENV_PW = ENV_W - ENV_M.left - ENV_M.right;
const ENV_PH = ENV_H - ENV_M.top - ENV_M.bottom;
const CG_MIN = 2.35;
const CG_MAX = 2.58;
const MASS_MIN = 900;
const MASS_MAX = 1350;

function toX(cg: number) { return ENV_M.left + ((cg - CG_MIN) / (CG_MAX - CG_MIN)) * ENV_PW; }
function toY(mass: number) { return ENV_M.top + ENV_PH - ((mass - MASS_MIN) / (MASS_MAX - MASS_MIN)) * ENV_PH; }

function MiniEnvelope({ progress }: Props) {
  const r = getRevealState(progress);

  const fwdLimit = da40ng.fwdCgLimit;
  const aftLimit = [
    { mass: 940, cg: 2.53 },
    { mass: 1280, cg: 2.53 },
  ];

  const polygon = useMemo(() => buildEnvelopePolygon(fwdLimit, aftLimit), [fwdLimit, aftLimit]);
  const polygonPoints = polygon.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ');

  // Points to plot — show original ZFM as red if exceeded, then corrected points as green
  type PlotPoint = { label: string; mass: number; cg: number; massLimit: number; visible: boolean };
  const points: PlotPoint[] = [];

  if (r.zfmOriginal && !r.zfmCorrected) {
    // Show original (bad) ZFM
    points.push({ label: 'ZFM', mass: ORIGINAL.zfm.mass, cg: ORIGINAL.zfm.cg, massLimit: LIMITS.maxZfm, visible: true });
  }
  if (r.zfmCorrected) {
    points.push({ label: 'ZFM', mass: CORRECTED.zfm.mass, cg: CORRECTED.zfm.cg, massLimit: LIMITS.maxZfm, visible: true });
  }
  if (r.tom) {
    points.push({ label: 'TOM', mass: CORRECTED.tom.mass, cg: CORRECTED.tom.cg, massLimit: LIMITS.mtom, visible: true });
  }
  if (r.lm) {
    points.push({ label: 'LM', mass: CORRECTED.lm.mass, cg: CORRECTED.lm.cg, massLimit: LIMITS.maxLanding, visible: true });
  }

  const visiblePoints = points.filter((p) => p.visible);
  const trajectory = visiblePoints.length >= 2
    ? visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.cg)},${toY(p.mass)}`).join(' ')
    : '';

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm">CG Envelope</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center px-2 pb-2">
        <svg
          viewBox={`0 0 ${ENV_W} ${ENV_H}`}
          className="w-full"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {/* Grid */}
          {[2.40, 2.45, 2.50, 2.55].map((v) => (
            <line key={`gx-${v}`} x1={toX(v)} y1={ENV_M.top} x2={toX(v)} y2={ENV_M.top + ENV_PH} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}
          {[1000, 1100, 1200, 1300].map((v) => (
            <line key={`gy-${v}`} x1={ENV_M.left} y1={toY(v)} x2={ENV_M.left + ENV_PW} y2={toY(v)} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}

          {/* Envelope */}
          <polygon points={polygonPoints} fill="#dbeafe" stroke="none" />
          <polyline points={fwdLimit.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth="1.5" />
          <polyline points={aftLimit.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth="1.5" />
          <line x1={toX(fwdLimit[fwdLimit.length - 1].cg)} y1={toY(fwdLimit[fwdLimit.length - 1].mass)} x2={toX(aftLimit[aftLimit.length - 1].cg)} y2={toY(aftLimit[aftLimit.length - 1].mass)} stroke="#1d4ed8" strokeWidth="1.5" />
          <line x1={toX(fwdLimit[0].cg)} y1={toY(fwdLimit[0].mass)} x2={toX(aftLimit[0].cg)} y2={toY(aftLimit[0].mass)} stroke="#1d4ed8" strokeWidth="1.5" />

          {/* Limit lines */}
          <line x1={ENV_M.left} y1={toY(1280)} x2={ENV_M.left + ENV_PW} y2={toY(1280)} stroke="#9ca3af" strokeWidth="0.8" strokeDasharray="3 2" />
          <text x={ENV_M.left + ENV_PW - 2} y={toY(1280) - 2} fontSize="8" fill="#6b7280" textAnchor="end">MTOM 1280</text>
          <line x1={ENV_M.left} y1={toY(1200)} x2={ENV_M.left + ENV_PW} y2={toY(1200)} stroke="#9ca3af" strokeWidth="0.8" strokeDasharray="2 2" />
          <text x={ENV_M.left + ENV_PW - 2} y={toY(1200) - 2} fontSize="8" fill="#6b7280" textAnchor="end">MZFM 1200</text>

          {/* Trajectory */}
          {trajectory && (
            <path d={trajectory} fill="none" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 2" />
          )}

          {/* Points */}
          {visiblePoints.map((p) => {
            const inEnv = isWithinEnvelope(p.mass, p.cg, fwdLimit, aftLimit, p.massLimit);
            const color = inEnv ? '#16a34a' : '#dc2626';
            const x = toX(p.cg);
            const y = toY(p.mass);
            return (
              <g key={p.label}>
                <circle cx={x} cy={y} r={4} fill={color} stroke="#fff" strokeWidth="1.5" />
                <text x={x + 7} y={y - 6} fontSize="9" fontWeight="700" fill={color}>
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={ENV_M.left} y1={ENV_M.top} x2={ENV_M.left} y2={ENV_M.top + ENV_PH} stroke="#374151" strokeWidth="0.8" />
          <line x1={ENV_M.left} y1={ENV_M.top + ENV_PH} x2={ENV_M.left + ENV_PW} y2={ENV_M.top + ENV_PH} stroke="#374151" strokeWidth="0.8" />

          {[2.35, 2.40, 2.45, 2.50, 2.55].map((v) => (
            <g key={`xt-${v}`}>
              <line x1={toX(v)} y1={ENV_M.top + ENV_PH} x2={toX(v)} y2={ENV_M.top + ENV_PH + 3} stroke="#374151" strokeWidth="0.8" />
              <text x={toX(v)} y={ENV_M.top + ENV_PH + 12} fontSize="8" textAnchor="middle" fill="#374151">{v.toFixed(2)}</text>
            </g>
          ))}
          {[900, 1000, 1100, 1200, 1300].map((v) => (
            <g key={`yt-${v}`}>
              <line x1={ENV_M.left - 3} y1={toY(v)} x2={ENV_M.left} y2={toY(v)} stroke="#374151" strokeWidth="0.8" />
              <text x={ENV_M.left - 5} y={toY(v) + 3} fontSize="8" textAnchor="end" fill="#374151">{v}</text>
            </g>
          ))}

          <text x={ENV_M.left + ENV_PW / 2} y={ENV_H - 2} fontSize="9" textAnchor="middle" fill="#374151">CG (m)</text>
          <text x={8} y={ENV_M.top + ENV_PH / 2} fontSize="9" textAnchor="middle" fill="#374151" transform={`rotate(-90, 8, ${ENV_M.top + ENV_PH / 2})`}>Mass (kg)</text>
        </svg>
      </CardContent>
    </Card>
  );
}

// ─── Limit Checks ─────────────────────────────────────────────

function LimitChecks({ progress }: Props) {
  const r = getRevealState(progress);

  if (!r.zfmOriginal) return null;

  const fwdLimit = da40ng.fwdCgLimit;
  const aftLimit = [{ mass: 940, cg: 2.53 }, { mass: 1280, cg: 2.53 }];

  // Before correction: show ZFM exceeded
  if (!r.zfmCorrected) {
    return (
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Limit Checks</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
            <span className="text-red-600 dark:text-red-400 font-medium">ZFM ≤ MZFM</span>
            <span className="ml-auto font-mono text-[10px] text-red-600">{ORIGINAL.zfm.mass} / {LIMITS.maxZfm} kg</span>
          </div>
          <div className="flex items-start gap-2 text-xs mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
            <span className="text-red-700 dark:text-red-300">Exceeded by {ORIGINAL.zfm.mass - LIMITS.maxZfm} kg — must correct before continuing!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // After correction: show all checks
  const checks = [
    {
      label: 'ZFM ≤ MZFM',
      value: `${CORRECTED.zfm.mass} / ${LIMITS.maxZfm} kg`,
      passed: CORRECTED.zfm.mass <= LIMITS.maxZfm,
      visible: r.zfmCorrected,
    },
    {
      label: 'TOM ≤ MTOM',
      value: `${CORRECTED.tom.mass} / ${LIMITS.mtom} kg`,
      passed: CORRECTED.tom.mass <= LIMITS.mtom,
      visible: r.tom,
    },
    {
      label: 'LM ≤ MLM',
      value: `${CORRECTED.lm.mass} / ${LIMITS.maxLanding} kg`,
      passed: CORRECTED.lm.mass <= LIMITS.maxLanding,
      visible: r.lm,
    },
    {
      label: 'ZFM CG',
      value: `${CORRECTED.zfm.cg.toFixed(3)} m`,
      passed: isWithinEnvelope(CORRECTED.zfm.mass, CORRECTED.zfm.cg, fwdLimit, aftLimit, LIMITS.maxZfm),
      visible: r.zfmCorrected,
    },
    {
      label: 'TOM CG',
      value: `${CORRECTED.tom.cg.toFixed(3)} m`,
      passed: isWithinEnvelope(CORRECTED.tom.mass, CORRECTED.tom.cg, fwdLimit, aftLimit, LIMITS.mtom),
      visible: r.tom,
    },
    {
      label: 'LM CG',
      value: `${CORRECTED.lm.cg.toFixed(3)} m`,
      passed: isWithinEnvelope(CORRECTED.lm.mass, CORRECTED.lm.cg, fwdLimit, aftLimit, LIMITS.maxLanding),
      visible: r.lm,
    },
  ];

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm">Limit Checks</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-1.5">
        {checks.map((c) =>
          c.visible ? (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              {c.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
              )}
              <span className={c.passed ? '' : 'text-red-600 dark:text-red-400 font-medium'}>
                {c.label}
              </span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {c.value}
              </span>
            </div>
          ) : (
            <div key={c.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Minus className="h-3.5 w-3.5 shrink-0" />
              <span>{c.label}</span>
            </div>
          ),
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Panel ───────────────────────────────────────────────

export function WorkedExamplePanel({ progress }: Props) {
  return (
    <div className="space-y-3 lg:sticky lg:top-6">
      <MiniLoadingSheet progress={progress} />
      <MiniEnvelope progress={progress} />
      <LimitChecks progress={progress} />
    </div>
  );
}
