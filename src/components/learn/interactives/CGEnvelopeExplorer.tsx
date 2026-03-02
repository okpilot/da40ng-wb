import { useState, useCallback, useRef } from 'react';
import { da40ng } from '@/data/da40ng';
import {
  buildEnvelopePolygon,
  interpolateLimit,
  isWithinEnvelope,
} from '@/lib/calculations';

// Chart constants
const M = { top: 20, right: 30, bottom: 45, left: 55 };
const W = 480;
const H = 340;
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

const cgMin = 2.35;
const cgMax = 2.58;
const massMin = 900;
const massMax = 1350;

function toX(cg: number) { return M.left + ((cg - cgMin) / (cgMax - cgMin)) * PW; }
function toY(mass: number) { return M.top + PH - ((mass - massMin) / (massMax - massMin)) * PH; }
function fromX(x: number) { return cgMin + ((x - M.left) / PW) * (cgMax - cgMin); }
function fromY(y: number) { return massMin + ((M.top + PH - y) / PH) * (massMax - massMin); }

export function CGEnvelopeExplorer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [point, setPoint] = useState({ cg: 2.47, mass: 1100 });

  const fwdLimit = da40ng.fwdCgLimit;
  const aftLimit = [
    { mass: 940, cg: 2.53 },
    { mass: 1280, cg: 2.53 },
  ];
  const polygon = buildEnvelopePolygon(fwdLimit, aftLimit);
  const polygonPoints = polygon.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ');

  const within = isWithinEnvelope(point.mass, point.cg, fwdLimit, aftLimit, 1280);
  const fwdCg = interpolateLimit(point.mass, fwdLimit);
  const aftCg = 2.53;

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const cg = Math.max(cgMin, Math.min(cgMax, fromX(x)));
      const mass = Math.max(massMin, Math.min(massMax, fromY(y)));
      setPoint({ cg, mass });
    },
    [],
  );

  const px = toX(point.cg);
  const py = toY(point.mass);

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[480px] cursor-crosshair"
          style={{ fontFamily: 'system-ui, sans-serif' }}
          onClick={handleSvgClick}
        >
          {/* Grid */}
          {[2.35, 2.40, 2.45, 2.50, 2.55].map((v) => (
            <line key={`gx-${v}`} x1={toX(v)} y1={M.top} x2={toX(v)} y2={M.top + PH} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}
          {[900, 1000, 1100, 1200, 1300].map((v) => (
            <line key={`gy-${v}`} x1={M.left} y1={toY(v)} x2={M.left + PW} y2={toY(v)} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}

          {/* Envelope */}
          <polygon points={polygonPoints} fill="#dbeafe" stroke="none" />
          <polyline points={fwdLimit.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth="2" />
          <polyline points={aftLimit.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth="2" />
          <line x1={toX(fwdLimit[fwdLimit.length - 1].cg)} y1={toY(fwdLimit[fwdLimit.length - 1].mass)} x2={toX(aftLimit[aftLimit.length - 1].cg)} y2={toY(aftLimit[aftLimit.length - 1].mass)} stroke="#1d4ed8" strokeWidth="2" />
          <line x1={toX(fwdLimit[0].cg)} y1={toY(fwdLimit[0].mass)} x2={toX(aftLimit[0].cg)} y2={toY(aftLimit[0].mass)} stroke="#1d4ed8" strokeWidth="2" />

          {/* MTOM line */}
          <line x1={M.left} y1={toY(1280)} x2={M.left + PW} y2={toY(1280)} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 2" />
          <text x={M.left + PW - 2} y={toY(1280) - 3} fontSize="8" fill="#6b7280" textAnchor="end">MTOM 1280</text>

          {/* Crosshairs */}
          <line x1={px} y1={M.top} x2={px} y2={M.top + PH} stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={M.left} y1={py} x2={M.left + PW} y2={py} stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Point */}
          <circle cx={px} cy={py} r={7} fill={within ? '#16a34a' : '#dc2626'} stroke="#fff" strokeWidth="2" />

          {/* Axes */}
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#374151" strokeWidth="1" />
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#374151" strokeWidth="1" />

          {/* X ticks */}
          {[2.35, 2.40, 2.45, 2.50, 2.55].map((v) => (
            <g key={`xt-${v}`}>
              <line x1={toX(v)} y1={M.top + PH} x2={toX(v)} y2={M.top + PH + 5} stroke="#374151" strokeWidth="1" />
              <text x={toX(v)} y={M.top + PH + 15} fontSize="9" textAnchor="middle" fill="#374151">{v.toFixed(2)}</text>
            </g>
          ))}

          {/* Y ticks */}
          {[900, 1000, 1100, 1200, 1300].map((v) => (
            <g key={`yt-${v}`}>
              <line x1={M.left - 5} y1={toY(v)} x2={M.left} y2={toY(v)} stroke="#374151" strokeWidth="1" />
              <text x={M.left - 7} y={toY(v) + 3} fontSize="9" textAnchor="end" fill="#374151">{v}</text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={M.left + PW / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="#374151" fontWeight="600">CG Position (m)</text>
          <text x={14} y={M.top + PH / 2} fontSize="10" textAnchor="middle" fill="#374151" fontWeight="600" transform={`rotate(-90, 14, ${M.top + PH / 2})`}>Mass (kg)</text>

          {/* Click hint */}
          <text x={M.left + PW / 2} y={M.top + 12} fontSize="9" textAnchor="middle" fill="#9ca3af">Click anywhere to move the point</text>
        </svg>
      </div>

      {/* Status panel */}
      <div className={`p-4 rounded-lg border ${
        within ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Mass</p>
            <p className="font-mono font-medium">{point.mass.toFixed(0)} kg</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CG</p>
            <p className="font-mono font-medium">{point.cg.toFixed(3)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fwd limit at this mass</p>
            <p className="font-mono font-medium">{fwdCg.toFixed(3)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Aft limit</p>
            <p className="font-mono font-medium">{aftCg.toFixed(3)} m</p>
          </div>
        </div>
        <p className={`text-sm font-medium mt-2 ${within ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
          {within
            ? 'Within limits'
            : point.mass > 1280
              ? 'Outside limits — mass exceeds MTOM'
              : point.mass < 940
                ? 'Outside limits — mass below minimum'
                : point.cg < fwdCg
                  ? 'Outside limits — CG too far forward'
                  : point.cg > aftCg
                    ? 'Outside limits — CG too far aft'
                    : 'Outside limits'
          }
        </p>
      </div>
    </div>
  );
}
