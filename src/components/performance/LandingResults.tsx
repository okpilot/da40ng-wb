import type { LandingResult, LandingInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LandingResultsProps {
  result: LandingResult;
  inputs: LandingInputs;
}

function distanceColor(required: number, available: number): string {
  if (available <= 0) return '';
  const ratio = required / available;
  if (ratio > 1) return 'text-destructive font-bold';
  if (ratio > 0.7) return 'text-amber-500 font-semibold';
  return 'text-green-600 font-semibold';
}

function marginInfo(required: number, available: number): { text: string; color: string } | null {
  if (available <= 0) return null;
  const margin = available - required;
  const pct = Math.round((margin / available) * 100);
  if (margin < 0) {
    return { text: `INSUFFICIENT — ${Math.abs(Math.round(margin))} m short`, color: 'text-destructive' };
  }
  const color = pct < 30 ? 'text-amber-500' : 'text-green-600';
  return { text: `Margin: ${Math.round(margin)} m (${pct}%)`, color };
}

function rocColor(roc: number): string {
  if (roc === 0) return 'text-destructive font-bold';
  if (roc < 200) return 'text-amber-500 font-semibold';
  return 'text-green-600 font-semibold';
}

export function LandingResultsPanel({ result, inputs }: LandingResultsProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const ldr = Math.round(result.ldr);
  const lgrr = Math.round(result.lgrr);

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
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
            <ResultBox
              label="LR"
              sublabel="Landing Roll"
              value={`${lgrr} m`}
              color=""
            />
            <ResultBox
              label="LDR"
              sublabel="Over 50 ft"
              value={`${ldr} m`}
              color={distanceColor(ldr, inputs.lda)}
              margin={inputs.lda > 0 ? marginInfo(ldr, inputs.lda) : null}
            />
            <ResultBox
              label={<>V<sub>Ref</sub></>}
              sublabel={`Flaps ${result.flap}`}
              value={`${result.vSpeeds.vRef} KIAS`}
              color=""
            />
            {/* Go-around ROC */}
            {result.goAround.isNa ? (
              <ResultBox
                label="Go-Around"
                sublabel="ROC"
                value="N/A"
                color="text-destructive font-bold"
              />
            ) : (
              <ResultBox
                label="Go-Around"
                sublabel="ROC"
                value={`${result.goAround.roc} fpm`}
                color={rocColor(result.goAround.roc)}
              />
            )}
            {/* Go-around gradient */}
            {!result.goAround.isNa && (
              <ResultBox
                label="GA Gradient"
                sublabel="AFM 5.3.14"
                value={`${result.goAround.gradient.toFixed(1)}%`}
                color={result.goAround.gradient < 3.3 ? 'text-amber-500 font-semibold' : 'text-green-600 font-semibold'}
              />
            )}
            {/* Wind */}
            <WindBox
              windDir={inputs.windDirection}
              windSpeed={inputs.windSpeed}
              rwyHdg={inputs.runwayHeading}
              headwind={result.headwind}
              crosswind={result.crosswind}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultBox({ label, sublabel, value, color, margin }: {
  label: React.ReactNode; sublabel: string; value: string; color: string;
  margin?: { text: string; color: string } | null;
}) {
  return (
    <div className="bg-muted rounded-lg px-3 py-3 text-center flex flex-col items-center justify-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{sublabel}</div>
      <div className={`text-xl font-mono leading-tight mt-0.5 ${color}`}>{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">{label}</div>
      {margin && <div className={`text-[10px] font-semibold mt-0.5 ${margin.color}`}>{margin.text}</div>}
    </div>
  );
}

function WindBox({ windDir, windSpeed, rwyHdg, headwind, crosswind }: {
  windDir: number; windSpeed: number; rwyHdg: number; headwind: number; crosswind: number;
}) {
  if (windSpeed === 0) {
    return (
      <div className="bg-muted rounded-lg px-3 py-3 text-center flex flex-col items-center justify-center">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</div>
        <div className="text-sm text-muted-foreground mt-1">Calm</div>
      </div>
    );
  }

  const tailwind = headwind < 0;

  return (
    <div className="bg-muted rounded-lg px-3 py-3 text-center flex flex-col items-center justify-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</div>
      <svg viewBox="0 0 60 60" className="w-12 h-12 my-0.5">
        <WindCompass cx={30} cy={30} r={24} windDir={windDir} rwyHdg={rwyHdg} headwind={headwind} />
      </svg>
      <div className="text-[10px] font-mono text-muted-foreground">
        {String(Math.round(windDir)).padStart(3, '0')}°/{windSpeed} kt
      </div>
      <div className={`text-[10px] font-semibold ${tailwind ? 'text-amber-500' : 'text-muted-foreground'}`}>
        {tailwind ? 'Tail' : 'Head'} {Math.abs(Math.round(headwind))} / Xw {Math.round(crosswind)} kt
      </div>
    </div>
  );
}

function WindCompass({ cx, cy, r, windDir, rwyHdg, headwind }: {
  cx: number; cy: number; r: number; windDir: number; rwyHdg: number; headwind: number;
}) {
  const arrowColor = headwind < 0 ? '#f59e0b' : '#3b82f6';
  const toRad = (bearing: number) => ((bearing - 90) * Math.PI) / 180;

  const rwyRad = toRad(rwyHdg);
  const rl = r * 0.7;
  const rwyX1 = cx + Math.cos(rwyRad) * rl;
  const rwyY1 = cy + Math.sin(rwyRad) * rl;
  const rwyX2 = cx - Math.cos(rwyRad) * rl;
  const rwyY2 = cy - Math.sin(rwyRad) * rl;

  const windRad = toRad(windDir);
  const tailX = cx + Math.cos(windRad) * (r * 0.95);
  const tailY = cy + Math.sin(windRad) * (r * 0.95);
  const tipX = cx + Math.cos(windRad) * (r * 0.2);
  const tipY = cy + Math.sin(windRad) * (r * 0.2);
  const aAngle = Math.atan2(tipY - tailY, tipX - tailX);
  const hs = 5;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d1d5db" strokeWidth={1} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 3} stroke="#9ca3af" strokeWidth={1.5} />
      <text x={cx} y={cy - r - 1} textAnchor="middle" fontSize="7" fill="#6b7280" fontWeight="700">N</text>
      <line x1={rwyX1} y1={rwyY1} x2={rwyX2} y2={rwyY2} stroke="#6b7280" strokeWidth={3} strokeLinecap="round" />
      <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke={arrowColor} strokeWidth={2} />
      <polygon
        points={`${tipX},${tipY} ${tipX - Math.cos(aAngle) * hs + Math.sin(aAngle) * hs * 0.4},${tipY - Math.sin(aAngle) * hs - Math.cos(aAngle) * hs * 0.4} ${tipX - Math.cos(aAngle) * hs - Math.sin(aAngle) * hs * 0.4},${tipY - Math.sin(aAngle) * hs + Math.cos(aAngle) * hs * 0.4}`}
        fill={arrowColor}
      />
    </g>
  );
}
