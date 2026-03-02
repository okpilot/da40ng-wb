export function SeesawDiagram() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 480 185" className="w-full max-w-[500px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Title */}
        <text x="240" y="20" fontSize="12" fontWeight="600" textAnchor="middle" fill="#374151">
          Same moment: lighter mass × longer arm = heavier mass × shorter arm
        </text>

        {/* Formula */}
        <text x="240" y="42" fontSize="11" textAnchor="middle" fill="#6b7280">
          30 kg × 3.0 m = 90 kg·m     |     90 kg × 1.0 m = 90 kg·m
        </text>

        {/* Beam */}
        <line x1="60" y1="130" x2="420" y2="130" stroke="#374151" strokeWidth="3" />

        {/* Fulcrum / pivot */}
        <polygon points="240,130 222,158 258,158" fill="#374151" />

        {/* Left weight (small mass, far from pivot) */}
        <rect x="65" y="100" width="50" height="30" rx="4" fill="#1d4ed8" />
        <text x="90" y="119" fontSize="11" fontWeight="600" textAnchor="middle" fill="white">30 kg</text>

        {/* Moment label left */}
        <text x="90" y="90" fontSize="11" textAnchor="middle" fill="#1d4ed8" fontWeight="600">
          Moment = 90
        </text>

        {/* Left arm dimension */}
        <line x1="90" y1="138" x2="90" y2="153" stroke="#6b7280" strokeWidth="0.8" />
        <line x1="240" y1="138" x2="240" y2="153" stroke="#6b7280" strokeWidth="0.8" />
        <line x1="90" y1="148" x2="240" y2="148" stroke="#6b7280" strokeWidth="1" markerStart="url(#arrowGrayL)" markerEnd="url(#arrowGrayR)" />
        <text x="165" y="165" fontSize="11" textAnchor="middle" fill="#6b7280" fontWeight="500">3.0 m</text>

        {/* Right weight (large mass, close to pivot) */}
        <rect x="295" y="95" width="60" height="35" rx="4" fill="#dc2626" />
        <text x="325" y="117" fontSize="11" fontWeight="600" textAnchor="middle" fill="white">90 kg</text>

        {/* Moment label right */}
        <text x="325" y="85" fontSize="11" textAnchor="middle" fill="#dc2626" fontWeight="600">
          Moment = 90
        </text>

        {/* Equal sign */}
        <text x="207" y="80" fontSize="16" fontWeight="700" textAnchor="middle" fill="#374151">
          =
        </text>

        {/* Right arm dimension */}
        <line x1="325" y1="138" x2="325" y2="153" stroke="#6b7280" strokeWidth="0.8" />
        <line x1="240" y1="148" x2="325" y2="148" stroke="#6b7280" strokeWidth="1" markerStart="url(#arrowGrayL)" markerEnd="url(#arrowGrayR)" />
        <text x="282" y="165" fontSize="11" textAnchor="middle" fill="#6b7280" fontWeight="500">1.0 m</text>

        {/* Arrow markers */}
        <defs>
          <marker id="arrowGrayL" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
            <path d="M 6 0 L 0 2 L 6 4 Z" fill="#6b7280" />
          </marker>
          <marker id="arrowGrayR" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <path d="M 0 0 L 6 2 L 0 4 Z" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
