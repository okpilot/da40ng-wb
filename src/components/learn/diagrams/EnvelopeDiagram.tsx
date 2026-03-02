import { da40ng } from '@/data/da40ng';
import { buildEnvelopePolygon } from '@/lib/calculations';

// Simplified static version of the CG envelope for teaching
export function EnvelopeDiagram() {
  const fwdLimit = da40ng.fwdCgLimit;
  const aftLimit = [
    { mass: 940, cg: 2.53 },
    { mass: 1280, cg: 2.53 },
  ];
  const polygon = buildEnvelopePolygon(fwdLimit, aftLimit);

  // Chart constants (matching main chart)
  const M = { top: 20, right: 20, bottom: 35, left: 45 };
  const W = 400;
  const H = 250;
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;

  const cgMin = 2.35;
  const cgMax = 2.58;
  const massMin = 900;
  const massMax = 1350;

  const toX = (cg: number) => M.left + ((cg - cgMin) / (cgMax - cgMin)) * PW;
  const toY = (mass: number) => M.top + PH - ((mass - massMin) / (massMax - massMin)) * PH;

  const polygonPoints = polygon.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[400px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Grid */}
        {[2.35, 2.40, 2.45, 2.50, 2.55].map((v) => (
          <line key={`gx-${v}`} x1={toX(v)} y1={M.top} x2={toX(v)} y2={M.top + PH} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}
        {[900, 1000, 1100, 1200, 1300].map((v) => (
          <line key={`gy-${v}`} x1={M.left} y1={toY(v)} x2={M.left + PW} y2={toY(v)} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}

        {/* Envelope fill */}
        <polygon points={polygonPoints} fill="#dbeafe" stroke="none" />

        {/* Fwd limit */}
        <polyline
          points={fwdLimit.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ')}
          fill="none" stroke="#1d4ed8" strokeWidth="2"
        />

        {/* Aft limit */}
        <polyline
          points={aftLimit.map((p) => `${toX(p.cg)},${toY(p.mass)}`).join(' ')}
          fill="none" stroke="#1d4ed8" strokeWidth="2"
        />

        {/* Top & bottom edges */}
        <line x1={toX(fwdLimit[fwdLimit.length - 1].cg)} y1={toY(fwdLimit[fwdLimit.length - 1].mass)} x2={toX(aftLimit[aftLimit.length - 1].cg)} y2={toY(aftLimit[aftLimit.length - 1].mass)} stroke="#1d4ed8" strokeWidth="2" />
        <line x1={toX(fwdLimit[0].cg)} y1={toY(fwdLimit[0].mass)} x2={toX(aftLimit[0].cg)} y2={toY(aftLimit[0].mass)} stroke="#1d4ed8" strokeWidth="2" />

        {/* Labels */}
        <text x={toX(2.40) + 4} y={toY(960)} fontSize="9" fill="#1d4ed8" fontWeight="600">FWD</text>
        <text x={toX(2.53) - 20} y={toY(960)} fontSize="9" fill="#1d4ed8" fontWeight="600">AFT</text>

        {/* "Safe zone" label */}
        <text x={toX(2.465)} y={toY(1100)} fontSize="11" textAnchor="middle" fill="#1d4ed8" fontWeight="600" opacity="0.5">
          SAFE
        </text>

        {/* MTOM line */}
        <line x1={M.left} y1={toY(1280)} x2={M.left + PW} y2={toY(1280)} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 2" />
        <text x={M.left + PW - 2} y={toY(1280) - 3} fontSize="9" fill="#6b7280" textAnchor="end">MTOM 1280</text>

        {/* Axes */}
        <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#374151" strokeWidth="1" />
        <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#374151" strokeWidth="1" />

        {/* X ticks */}
        {[2.35, 2.40, 2.45, 2.50, 2.55].map((v) => (
          <g key={`xt-${v}`}>
            <line x1={toX(v)} y1={M.top + PH} x2={toX(v)} y2={M.top + PH + 4} stroke="#374151" strokeWidth="1" />
            <text x={toX(v)} y={M.top + PH + 14} fontSize="9" textAnchor="middle" fill="#374151">{v.toFixed(2)}</text>
          </g>
        ))}

        {/* Y ticks */}
        {[900, 1000, 1100, 1200, 1300].map((v) => (
          <g key={`yt-${v}`}>
            <line x1={M.left - 4} y1={toY(v)} x2={M.left} y2={toY(v)} stroke="#374151" strokeWidth="1" />
            <text x={M.left - 6} y={toY(v) + 3} fontSize="9" textAnchor="end" fill="#374151">{v}</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={M.left + PW / 2} y={H - 2} fontSize="9" textAnchor="middle" fill="#374151">CG (m)</text>
        <text x={10} y={M.top + PH / 2} fontSize="9" textAnchor="middle" fill="#374151" transform={`rotate(-90, 10, ${M.top + PH / 2})`}>Mass (kg)</text>
      </svg>
    </div>
  );
}
