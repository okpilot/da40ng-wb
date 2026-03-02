export function AircraftSideView() {
  const stations = [
    { label: 'Front Seats', arm: 2.30, x: 160 },
    { label: 'Fuel', arm: 2.63, x: 200 },
    { label: 'Rear Seats', arm: 3.25, x: 270 },
    { label: 'Baggage', arm: 3.65, x: 320 },
    { label: 'Bag. Tube', arm: 4.32, x: 380 },
  ];

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 500 200" className="w-full max-w-[500px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Aircraft body */}
        <path
          d="M 40 85 Q 70 55 140 65 L 420 70 Q 460 73 470 80 Q 460 87 420 90 L 140 95 Q 70 105 40 85 Z"
          fill="#dbeafe"
          stroke="#1d4ed8"
          strokeWidth="1.5"
        />

        {/* Wing */}
        <path d="M 180 50 L 220 50 L 230 65 L 230 95 L 220 110 L 180 110 L 170 95 L 170 65 Z" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1" />

        {/* Propeller */}
        <line x1="38" y1="65" x2="38" y2="105" stroke="#374151" strokeWidth="2" />

        {/* Tail */}
        <path d="M 445 70 L 465 40 L 475 42 L 458 70" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1" />

        {/* Datum line */}
        <line x1="80" y1="30" x2="80" y2="170" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="80" y="25" fontSize="10" fontWeight="600" textAnchor="middle" fill="#dc2626">DATUM</text>

        {/* Station markers */}
        {stations.map((s) => (
          <g key={s.label}>
            <line x1={s.x} y1="65" x2={s.x} y2="95" stroke="#16a34a" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx={s.x} cy="80" r="3" fill="#16a34a" />
            {/* Arm line from datum */}
            <line x1="80" y1={130} x2={s.x} y2={130} stroke="#9ca3af" strokeWidth="0.5" />
            <text x={s.x} y="115" fontSize="8" textAnchor="middle" fill="#374151" fontWeight="600">
              {s.label}
            </text>
            <text x={s.x} y="145" fontSize="8" textAnchor="middle" fill="#16a34a">
              {s.arm} m
            </text>
          </g>
        ))}

        {/* Arm dimension arrow */}
        <text x="130" y="168" fontSize="9" textAnchor="middle" fill="#6b7280">
          ← arm (distance from datum) →
        </text>
      </svg>
    </div>
  );
}
