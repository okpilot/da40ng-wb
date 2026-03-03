import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Results</CardTitle>
      </CardHeader>
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
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Departure point box */}
            <div className={`rounded-lg px-3 py-2 text-center flex flex-col justify-center ${
              isIntersection ? 'bg-amber-50 border-2 border-amber-300' : 'bg-muted'
            }`}>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Departure</div>
              <div className={`text-sm font-semibold leading-tight ${isIntersection ? 'text-amber-700' : ''}`}>
                {isIntersection ? `Int. ${departureLabel}` : 'Full length'}
              </div>
            </div>
            <ResultBox
              label="TORR"
              sublabel="Ground Roll"
              value={`${result.torr} m`}
              color={distanceColor(result.torr, inputs.tora)}
              margin={inputs.tora > 0 ? marginInfo(result.torr, inputs.tora) : null}
            />
            <ResultBox
              label="TODR"
              sublabel="Over 50 ft"
              value={`${result.todr} m`}
              color={distanceColor(result.todr, inputs.toda)}
              margin={inputs.toda > 0 ? marginInfo(result.todr, inputs.toda) : null}
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
            <div className="bg-muted rounded-lg px-2 py-2 flex items-center justify-center">
              {inputs.windSpeed > 0 ? (
                <svg viewBox="0 0 110 110" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <WindIndicator
                    cx={55} cy={35}
                    windDir={inputs.windDirection}
                    rwyHdg={inputs.runwayHeading}
                    headwind={result.headwind}
                    crosswind={result.crosswind}
                    windSpeed={inputs.windSpeed}
                  />
                </svg>
              ) : (
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</div>
                  <div className="text-sm text-muted-foreground">Calm</div>
                </div>
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
    <div className="bg-muted rounded-lg px-3 py-2 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{sublabel}</div>
      <div className={`text-xl font-mono leading-tight ${color}`}>{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      {margin && <div className={`text-[10px] font-semibold mt-0.5 ${margin.color}`}>{margin.text}</div>}
    </div>
  );
}

/**
 * Wind indicator aligned to true north.
 * North = up. Runway drawn at its true heading. Wind arrow comes FROM the
 * meteorological wind direction (i.e. 270° wind = arrow pointing from left to centre).
 */
function WindIndicator({ cx, cy, windDir, rwyHdg, windSpeed, headwind, crosswind }: {
  cx: number; cy: number; windDir: number; rwyHdg: number;
  windSpeed: number; headwind: number; crosswind: number;
}) {
  const r = 25;
  const tailwind = headwind < 0;
  const arrowColor = tailwind ? '#f59e0b' : '#3b82f6';

  // Convert bearing to SVG angle: 0°=north=up → SVG: -90° offset
  // bearing → angle from positive-x, clockwise: svgAngle = bearing - 90
  const toRad = (bearing: number) => ((bearing - 90) * Math.PI) / 180;

  // Runway endpoints (line through centre at rwyHdg)
  const rwyRad = toRad(rwyHdg);
  const rwyLen = 18;
  const rwyX1 = cx + Math.cos(rwyRad) * rwyLen;
  const rwyY1 = cy + Math.sin(rwyRad) * rwyLen;
  const rwyX2 = cx - Math.cos(rwyRad) * rwyLen;
  const rwyY2 = cy - Math.sin(rwyRad) * rwyLen;

  // Wind arrow: comes FROM windDir, so the tail is at the windDir bearing on the circle
  // and the arrow points towards the centre
  const windRad = toRad(windDir);
  const tailX = cx + Math.cos(windRad) * r;
  const tailY = cy + Math.sin(windRad) * r;
  const tipX = cx + Math.cos(windRad) * (r * 0.2);
  const tipY = cy + Math.sin(windRad) * (r * 0.2);
  // Arrowhead direction: from tail towards tip
  const aAngle = Math.atan2(tipY - tailY, tipX - tailX);

  return (
    <g>
      {/* Compass circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d1d5db" strokeWidth={1} />

      {/* Cardinal directions — N is up */}
      <text x={cx} y={cy - r - 2} textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="600">N</text>
      <text x={cx + r + 5} y={cy + 3} textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="600">E</text>
      <text x={cx} y={cy + r + 8} textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="600">S</text>
      <text x={cx - r - 5} y={cy + 3} textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="600">W</text>

      {/* Runway line — grey, at true heading */}
      <line x1={rwyX1} y1={rwyY1} x2={rwyX2} y2={rwyY2} stroke="#6b7280" strokeWidth={3} strokeLinecap="round" />

      {/* Wind arrow — from windDir towards centre */}
      <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke={arrowColor} strokeWidth={2.5} />
      <polygon
        points={`${tipX},${tipY} ${tipX + Math.cos(aAngle + Math.PI + 0.4) * 5},${tipY + Math.sin(aAngle + Math.PI + 0.4) * 5} ${tipX + Math.cos(aAngle + Math.PI - 0.4) * 5},${tipY + Math.sin(aAngle + Math.PI - 0.4) * 5}`}
        fill={arrowColor}
      />

      {/* Wind info */}
      <text x={cx} y={cy - r - 10} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="600">
        {String(Math.round(windDir)).padStart(3, '0')}°/{windSpeed} kt
      </text>
      <text x={cx} y={cy + r + 17} textAnchor="middle" fontSize="9" fill={tailwind ? '#f59e0b' : '#6b7280'} fontWeight="600">
        {tailwind ? 'Tail' : 'Head'} {Math.abs(Math.round(headwind))} kt
      </text>
      <text x={cx} y={cy + r + 28} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="500">
        Xw {Math.round(crosswind)} kt
      </text>
    </g>
  );
}
