export function FuelDiagram() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 460 140" className="w-full max-w-[460px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Conversion chain */}
        {/* USG box */}
        <rect x="20" y="30" width="100" height="50" rx="6" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" />
        <text x="70" y="52" fontSize="11" fontWeight="700" textAnchor="middle" fill="#1d4ed8">USG</text>
        <text x="70" y="68" fontSize="9" textAnchor="middle" fill="#6b7280">US Gallons</text>

        {/* Arrow 1 */}
        <line x1="120" y1="55" x2="160" y2="55" stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrowBlk)" />
        <text x="140" y="48" fontSize="8" textAnchor="middle" fill="#374151">× 3.785</text>

        {/* Litres box */}
        <rect x="160" y="30" width="100" height="50" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <text x="210" y="52" fontSize="11" fontWeight="700" textAnchor="middle" fill="#16a34a">Litres</text>
        <text x="210" y="68" fontSize="9" textAnchor="middle" fill="#6b7280">Volume</text>

        {/* Arrow 2 */}
        <line x1="260" y1="55" x2="300" y2="55" stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrowBlk)" />
        <text x="280" y="48" fontSize="8" textAnchor="middle" fill="#374151">× 0.84</text>

        {/* kg box */}
        <rect x="300" y="30" width="100" height="50" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        <text x="350" y="52" fontSize="11" fontWeight="700" textAnchor="middle" fill="#d97706">kg</text>
        <text x="350" y="68" fontSize="9" textAnchor="middle" fill="#6b7280">Mass</text>

        {/* Example */}
        <text x="70" y="100" fontSize="9" textAnchor="middle" fill="#1d4ed8">25 USG</text>
        <text x="140" y="100" fontSize="9" textAnchor="middle" fill="#374151">→</text>
        <text x="210" y="100" fontSize="9" textAnchor="middle" fill="#16a34a">94.6 L</text>
        <text x="280" y="100" fontSize="9" textAnchor="middle" fill="#374151">→</text>
        <text x="350" y="100" fontSize="9" textAnchor="middle" fill="#d97706">79.5 kg</text>

        {/* Fuel arm note */}
        <text x="230" y="125" fontSize="9" textAnchor="middle" fill="#6b7280">
          Fuel arm: 2.63 m aft of datum (all tank types)
        </text>

        {/* Arrow marker */}
        <defs>
          <marker id="arrowBlk" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#374151" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
