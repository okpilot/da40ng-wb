export function CGEffectsDiagram() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 520 200" className="w-full max-w-[520px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Forward CG side */}
        <g>
          <text x="130" y="18" fontSize="12" fontWeight="700" textAnchor="middle" fill="#1d4ed8">
            Forward CG
          </text>

          {/* Aircraft body */}
          <path d="M 30 80 Q 60 60 130 65 L 220 70 Q 240 72 240 80 Q 240 88 220 90 L 130 95 Q 60 100 30 80 Z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" />
          {/* Wing */}
          <line x1="120" y1="55" x2="120" y2="105" stroke="#1d4ed8" strokeWidth="2" />
          {/* CG marker — forward */}
          <circle cx="100" cy="80" r="6" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
          <text x="100" y="84" fontSize="8" fontWeight="700" textAnchor="middle" fill="#fff">CG</text>
          {/* Arrow showing nose-heavy tendency */}
          <path d="M 50 75 L 35 68" stroke="#dc2626" strokeWidth="2" markerEnd="url(#arrowRed)" />
        </g>

        {/* Labels for forward CG */}
        <g>
          <text x="130" y="125" fontSize="9" textAnchor="middle" fill="#374151">Heavy controls</text>
          <text x="130" y="138" fontSize="9" textAnchor="middle" fill="#374151">Higher stall speed</text>
          <text x="130" y="151" fontSize="9" textAnchor="middle" fill="#374151">More fuel burn</text>
          <text x="130" y="164" fontSize="9" textAnchor="middle" fill="#16a34a">More stable</text>
        </g>

        {/* Aft CG side */}
        <g>
          <text x="390" y="18" fontSize="12" fontWeight="700" textAnchor="middle" fill="#dc2626">
            Aft CG
          </text>

          {/* Aircraft body */}
          <path d="M 290 80 Q 320 60 390 65 L 480 70 Q 500 72 500 80 Q 500 88 480 90 L 390 95 Q 320 100 290 80 Z" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
          {/* Wing */}
          <line x1="380" y1="55" x2="380" y2="105" stroke="#dc2626" strokeWidth="2" />
          {/* CG marker — aft */}
          <circle cx="420" cy="80" r="6" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
          <text x="420" y="84" fontSize="8" fontWeight="700" textAnchor="middle" fill="#fff">CG</text>
          {/* Arrow showing tail-heavy tendency */}
          <path d="M 470 75 L 485 68" stroke="#dc2626" strokeWidth="2" markerEnd="url(#arrowRed)" />
        </g>

        {/* Labels for aft CG */}
        <g>
          <text x="390" y="125" fontSize="9" textAnchor="middle" fill="#374151">Light controls</text>
          <text x="390" y="138" fontSize="9" textAnchor="middle" fill="#374151">Lower stall speed</text>
          <text x="390" y="151" fontSize="9" textAnchor="middle" fill="#374151">Less fuel burn</text>
          <text x="390" y="164" fontSize="9" textAnchor="middle" fill="#dc2626" fontWeight="600">UNSTABLE — DANGEROUS</text>
        </g>

        {/* Center divider */}
        <line x1="260" y1="10" x2="260" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#dc2626" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
