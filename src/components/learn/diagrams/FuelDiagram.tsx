export function FuelDiagram() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 480 150" className="w-full max-w-[500px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* USG box */}
        <rect x="15" y="25" width="115" height="55" rx="8" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" />
        <text x="72" y="50" fontSize="14" fontWeight="700" textAnchor="middle" fill="#1d4ed8">USG</text>
        <text x="72" y="68" fontSize="10" textAnchor="middle" fill="#6b7280">US Gallons</text>

        {/* Arrow 1 */}
        <line x1="130" y1="52" x2="170" y2="52" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowBlk)" />
        <text x="150" y="44" fontSize="10" textAnchor="middle" fill="#374151" fontWeight="600">× 3.785</text>

        {/* Litres box */}
        <rect x="170" y="25" width="115" height="55" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <text x="228" y="50" fontSize="14" fontWeight="700" textAnchor="middle" fill="#16a34a">Litres</text>
        <text x="228" y="68" fontSize="10" textAnchor="middle" fill="#6b7280">Volume</text>

        {/* Arrow 2 */}
        <line x1="285" y1="52" x2="325" y2="52" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowBlk)" />
        <text x="305" y="44" fontSize="10" textAnchor="middle" fill="#374151" fontWeight="600">× 0.84</text>

        {/* kg box */}
        <rect x="325" y="25" width="115" height="55" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        <text x="382" y="50" fontSize="14" fontWeight="700" textAnchor="middle" fill="#d97706">kg</text>
        <text x="382" y="68" fontSize="10" textAnchor="middle" fill="#6b7280">Mass</text>

        {/* Example values */}
        <text x="72" y="105" fontSize="11" textAnchor="middle" fill="#1d4ed8" fontWeight="600">25 USG</text>
        <text x="150" y="105" fontSize="11" textAnchor="middle" fill="#374151">→</text>
        <text x="228" y="105" fontSize="11" textAnchor="middle" fill="#16a34a" fontWeight="600">94.6 L</text>
        <text x="305" y="105" fontSize="11" textAnchor="middle" fill="#374151">→</text>
        <text x="382" y="105" fontSize="11" textAnchor="middle" fill="#d97706" fontWeight="600">79.5 kg</text>

        {/* Fuel arm note */}
        <text x="240" y="135" fontSize="10" textAnchor="middle" fill="#6b7280">
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
