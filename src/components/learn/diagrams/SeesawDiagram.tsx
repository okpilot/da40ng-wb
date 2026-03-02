export function SeesawDiagram() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 460 180" className="w-full max-w-[460px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Fulcrum / pivot */}
        <polygon points="230,140 215,160 245,160" fill="#374151" />

        {/* Beam */}
        <line x1="60" y1="130" x2="400" y2="130" stroke="#374151" strokeWidth="3" />

        {/* Left weight (small mass, far from pivot) */}
        <rect x="70" y="105" width="40" height="25" rx="3" fill="#1d4ed8" />
        <text x="90" y="121" fontSize="10" fontWeight="600" textAnchor="middle" fill="white">30 kg</text>

        {/* Left arm label */}
        <line x1="90" y1="140" x2="90" y2="155" stroke="#6b7280" strokeWidth="0.5" />
        <line x1="230" y1="140" x2="230" y2="155" stroke="#6b7280" strokeWidth="0.5" />
        <line x1="90" y1="150" x2="230" y2="150" stroke="#6b7280" strokeWidth="1" markerStart="url(#arrowGrayL)" markerEnd="url(#arrowGrayR)" />
        <text x="160" y="164" fontSize="9" textAnchor="middle" fill="#6b7280">3.0 m</text>

        {/* Right weight (large mass, close to pivot) */}
        <rect x="290" y="100" width="50" height="30" rx="3" fill="#dc2626" />
        <text x="315" y="119" fontSize="10" fontWeight="600" textAnchor="middle" fill="white">90 kg</text>

        {/* Right arm label */}
        <line x1="315" y1="140" x2="315" y2="155" stroke="#6b7280" strokeWidth="0.5" />
        <line x1="230" y1="150" x2="315" y2="150" stroke="#6b7280" strokeWidth="1" markerStart="url(#arrowGrayL)" markerEnd="url(#arrowGrayR)" />
        <text x="272" y="164" fontSize="9" textAnchor="middle" fill="#6b7280">1.0 m</text>

        {/* Moment labels */}
        <text x="90" y="96" fontSize="10" textAnchor="middle" fill="#1d4ed8" fontWeight="600">
          Moment = 90
        </text>
        <text x="315" y="91" fontSize="10" textAnchor="middle" fill="#dc2626" fontWeight="600">
          Moment = 90
        </text>

        {/* Equal sign */}
        <text x="200" y="80" fontSize="14" fontWeight="700" textAnchor="middle" fill="#374151">
          =
        </text>

        {/* Title */}
        <text x="230" y="20" fontSize="11" fontWeight="600" textAnchor="middle" fill="#374151">
          Same moment: lighter weight × longer arm = heavier weight × shorter arm
        </text>

        {/* Formula */}
        <text x="230" y="40" fontSize="10" textAnchor="middle" fill="#6b7280">
          30 kg × 3.0 m = 90 kg·m     |     90 kg × 1.0 m = 90 kg·m
        </text>

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
