import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TakeoffResultsPanelProps {
  result: TakeoffResult;
  inputs: TakeoffInputs;
  departureLabel: string;
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
    return { text: `INSUFFICIENT — ${Math.abs(margin)} m short`, color: 'text-destructive' };
  }
  const color = pct < 30 ? 'text-amber-500' : 'text-green-600';
  return { text: `Safety margin: ${margin} m (${pct}%)`, color };
}

export function TakeoffResultsPanel({ result, inputs, departureLabel }: TakeoffResultsPanelProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const isIntersection = departureLabel !== 'Full length';

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
            {/* Departure point box */}
            <div className={`rounded-lg px-3 py-3 text-center flex flex-col items-center justify-center ${
              isIntersection ? 'bg-amber-50 border-2 border-amber-300' : 'bg-muted'
            }`}>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Departure</div>
              <div className={`text-sm font-semibold leading-tight mt-1 ${isIntersection ? 'text-amber-700' : ''}`}>
                {isIntersection ? `Int. ${departureLabel}` : 'Full length'}
              </div>
            </div>
            <ResultBox
              label="TORR"
              sublabel="Ground Roll"
              value={`${result.torr} m`}
              color=""
            />
            <ResultBox
              label="TODR"
              sublabel="Over 50 ft"
              value={`${result.todr} m`}
              color={distanceColor(result.todr, inputs.tora)}
              margin={inputs.tora > 0 ? marginInfo(result.todr, inputs.tora) : null}
            />
            <ResultBox
              label={<>V<sub>R</sub></>}
              sublabel="Rotate"
              value={`${result.vSpeeds.vR} KIAS`}
              color=""
            />
            <ResultBox
              label={<>V<sub>50</sub></>}
              sublabel="50 ft speed"
              value={`${result.vSpeeds.v50} KIAS`}
              color=""
            />
            {/* Wind indicator */}
            <div className="bg-muted rounded-lg px-3 py-3 flex flex-col items-center justify-center">
              {inputs.windSpeed > 0 ? (
                <WindBox
                  windDir={inputs.windDirection}
                  rwyHdg={inputs.runwayHeading}
                  windSpeed={inputs.windSpeed}
                  headwind={result.headwind}
                  crosswind={result.crosswind}
                />
              ) : (
                <>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</div>
                  <div className="text-sm text-muted-foreground mt-1">Calm</div>
                </>
              )}
            </div>
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

/** Compact wind box with compass, arrow, and component text */
function WindBox({ windDir, rwyHdg, windSpeed, headwind, crosswind }: {
  windDir: number; rwyHdg: number; windSpeed: number; headwind: number; crosswind: number;
}) {
  const tailwind = headwind < 0;
  return (
    <>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</div>
      <svg viewBox="0 0 70 70" className="w-16 h-16 my-0.5">
        <WindCompass cx={35} cy={35} r={28} windDir={windDir} rwyHdg={rwyHdg} headwind={headwind} />
      </svg>
      <div className="text-[10px] font-mono text-muted-foreground">
        {String(Math.round(windDir)).padStart(3, '0')}°/{windSpeed} kt
      </div>
      <div className={`text-[10px] font-semibold ${tailwind ? 'text-amber-500' : 'text-muted-foreground'}`}>
        {tailwind ? 'Tail' : 'Head'} {Math.abs(Math.round(headwind))} kt / Xw {Math.round(crosswind)} kt
      </div>
    </>
  );
}

/** SVG compass with runway line and wind arrow */
function WindCompass({ cx, cy, r, windDir, rwyHdg, headwind }: {
  cx: number; cy: number; r: number; windDir: number; rwyHdg: number; headwind: number;
}) {
  const tailwind = headwind < 0;
  const arrowColor = tailwind ? '#f59e0b' : '#3b82f6';

  // Bearing to SVG radians (0°=north=up → subtract 90° to rotate from x-axis)
  const toRad = (bearing: number) => ((bearing - 90) * Math.PI) / 180;

  // Runway line
  const rwyRad = toRad(rwyHdg);
  const rl = r * 0.7;
  const rwyX1 = cx + Math.cos(rwyRad) * rl;
  const rwyY1 = cy + Math.sin(rwyRad) * rl;
  const rwyX2 = cx - Math.cos(rwyRad) * rl;
  const rwyY2 = cy - Math.sin(rwyRad) * rl;

  // Wind arrow: FROM windDir towards centre
  const windRad = toRad(windDir);
  const tailX = cx + Math.cos(windRad) * (r * 0.95);
  const tailY = cy + Math.sin(windRad) * (r * 0.95);
  const tipX = cx + Math.cos(windRad) * (r * 0.2);
  const tipY = cy + Math.sin(windRad) * (r * 0.2);
  const aAngle = Math.atan2(tipY - tailY, tipX - tailX);
  const hs = 6; // arrowhead size

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d1d5db" strokeWidth={1} />
      {/* Cardinal ticks */}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 4} stroke="#9ca3af" strokeWidth={1.5} />
      <line x1={cx + r} y1={cy} x2={cx + r - 4} y2={cy} stroke="#9ca3af" strokeWidth={1} />
      <line x1={cx} y1={cy + r} x2={cx} y2={cy + r - 4} stroke="#9ca3af" strokeWidth={1} />
      <line x1={cx - r} y1={cy} x2={cx - r + 4} y2={cy} stroke="#9ca3af" strokeWidth={1} />
      {/* N label */}
      <text x={cx} y={cy - r - 2} textAnchor="middle" fontSize="8" fill="#6b7280" fontWeight="700">N</text>
      {/* Runway */}
      <line x1={rwyX1} y1={rwyY1} x2={rwyX2} y2={rwyY2} stroke="#6b7280" strokeWidth={4} strokeLinecap="round" />
      {/* Wind arrow */}
      <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke={arrowColor} strokeWidth={2.5} />
      <polygon
        points={`${tipX},${tipY} ${tipX - Math.cos(aAngle) * hs + Math.sin(aAngle) * hs * 0.4},${tipY - Math.sin(aAngle) * hs - Math.cos(aAngle) * hs * 0.4} ${tipX - Math.cos(aAngle) * hs - Math.sin(aAngle) * hs * 0.4},${tipY - Math.sin(aAngle) * hs + Math.cos(aAngle) * hs * 0.4}`}
        fill={arrowColor}
      />
    </g>
  );
}
