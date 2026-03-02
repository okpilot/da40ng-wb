export function CGEffectsDiagram() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 500 160" className="w-full max-w-[500px]" style={{ fontFamily: 'system-ui, sans-serif' }}>

        {/* Datum */}
        <text x="50" y="20" fontSize="12" fontWeight="700" textAnchor="middle" fill="#374151">DATUM</text>
        <line x1="50" y1="28" x2="50" y2="72" stroke="#374151" strokeWidth="2.5" />

        {/* Horizontal axis — along the bottom edge of the zones */}
        <line x1="50" y1="68" x2="450" y2="68" stroke="#374151" strokeWidth="2" />

        {/* Forward danger zone */}
        <rect x="50" y="32" width="110" height="36" fill="#fecaca" rx="3" opacity="0.5" />
        <text x="105" y="56" fontSize="11" textAnchor="middle" fill="#dc2626" fontWeight="700">FWD LIMIT</text>

        {/* Safe zone */}
        <rect x="160" y="32" width="180" height="36" fill="#bbf7d0" rx="3" opacity="0.5" />
        <text x="250" y="56" fontSize="12" textAnchor="middle" fill="#16a34a" fontWeight="700">SAFE CG RANGE</text>

        {/* Aft danger zone */}
        <rect x="340" y="32" width="110" height="36" fill="#fecaca" rx="3" opacity="0.5" />
        <text x="395" y="56" fontSize="11" textAnchor="middle" fill="#dc2626" fontWeight="700">AFT LIMIT</text>

        {/* Limit markers */}
        <line x1="160" y1="28" x2="160" y2="72" stroke="#dc2626" strokeWidth="2" />
        <line x1="340" y1="28" x2="340" y2="72" stroke="#dc2626" strokeWidth="2" />

        {/* Forward danger labels */}
        <text x="105" y="90" fontSize="9" textAnchor="middle" fill="#991b1b" fontWeight="600">DANGEROUS:</text>
        <text x="105" y="105" fontSize="10" textAnchor="middle" fill="#dc2626">Cannot flare</text>
        <text x="105" y="120" fontSize="10" textAnchor="middle" fill="#dc2626">High stall speed</text>
        <text x="105" y="135" fontSize="10" textAnchor="middle" fill="#dc2626">Nose-heavy</text>

        {/* Aft danger labels */}
        <text x="395" y="90" fontSize="9" textAnchor="middle" fill="#991b1b" fontWeight="600">DANGEROUS:</text>
        <text x="395" y="105" fontSize="10" textAnchor="middle" fill="#dc2626">Unstable pitch</text>
        <text x="395" y="118" fontSize="10" textAnchor="middle" fill="#dc2626">Unrecoverable stall</text>
        <text x="395" y="133" fontSize="10" textAnchor="middle" fill="#dc2626">Tail-heavy</text>
      </svg>
    </div>
  );
}
