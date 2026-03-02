export function AircraftSideView() {
  // Clean horizontal line with datum and stations marked
  // Wider viewBox and larger fonts for readability
  const datumX = 30;
  const scale = 105; // pixels per metre
  const stations = [
    { label: 'Front Seats', arm: 2.30, color: '#1d4ed8' },
    { label: 'Fuel Tanks', arm: 2.63, color: '#d97706' },
    { label: 'Rear Seats', arm: 3.25, color: '#7c3aed' },
    { label: 'Baggage', arm: 3.65, color: '#059669' },
    { label: 'Bag. Tube', arm: 4.32, color: '#6b7280', note: 'OÄM 40-164' },
  ];

  const toX = (arm: number) => datumX + arm * scale;
  const lineEnd = toX(4.7);

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 540 155" className="w-full max-w-[540px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Main horizontal axis */}
        <line x1={datumX} y1="70" x2={lineEnd} y2="70" stroke="#374151" strokeWidth="2" />

        {/* Datum marker */}
        <line x1={datumX} y1="35" x2={datumX} y2="105" stroke="#dc2626" strokeWidth="2.5" />
        <text x={datumX} y="26" fontSize="12" fontWeight="700" textAnchor="middle" fill="#dc2626">DATUM</text>
        <text x={datumX} y="118" fontSize="10" textAnchor="middle" fill="#dc2626">0.00 m</text>

        {/* Metre ticks */}
        {[1, 2, 3, 4].map((m) => (
          <g key={m}>
            <line x1={toX(m)} y1="65" x2={toX(m)} y2="75" stroke="#9ca3af" strokeWidth="1" />
            <text x={toX(m)} y="88" fontSize="9" textAnchor="middle" fill="#9ca3af">{m}.00</text>
          </g>
        ))}

        {/* Station markers — alternate above/below to avoid overlap */}
        {stations.map((s, i) => {
          const x = toX(s.arm);
          const above = i % 2 === 0;
          const labelY = above ? 42 : 100;
          const armY = above ? 55 : 113;
          const tickTop = above ? 50 : 70;
          const tickBot = above ? 70 : 90;

          return (
            <g key={s.label}>
              <line x1={x} y1={tickTop} x2={x} y2={tickBot} stroke={s.color} strokeWidth="2.5" />
              <circle cx={x} cy="70" r="4.5" fill={s.color} />
              <text x={x} y={labelY} fontSize="10" fontWeight="600" textAnchor="middle" fill={s.color}>
                {s.label}
              </text>
              <text x={x} y={armY} fontSize="10" textAnchor="middle" fill={s.color} fontWeight="500">
                {s.arm} m
              </text>
              {s.note && (
                <text x={x} y={armY + 12} fontSize="8" textAnchor="middle" fill="#9ca3af">
                  ({s.note})
                </text>
              )}
            </g>
          );
        })}

        {/* Dimension label */}
        <text x={(datumX + toX(4.32)) / 2} y="143" fontSize="10" textAnchor="middle" fill="#6b7280">
          arm = distance aft from datum (metres)
        </text>
      </svg>
    </div>
  );
}
