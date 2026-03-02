export function BalanceDiagram() {
  // Demonstrate CG = total moment / total mass
  const items = [
    { label: 'BEM', mass: 940, arm: 2.44, color: '#6b7280' },
    { label: 'Pilot', mass: 80, arm: 2.30, color: '#1d4ed8' },
    { label: 'Rear Pax', mass: 70, arm: 3.25, color: '#7c3aed' },
  ];
  const totalMass = items.reduce((s, i) => s + i.mass, 0);
  const totalMoment = items.reduce((s, i) => s + i.mass * i.arm, 0);
  const cg = totalMoment / totalMass;

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 480 200" className="w-full max-w-[480px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Title */}
        <text x="240" y="18" fontSize="11" fontWeight="600" textAnchor="middle" fill="#374151">
          CG = Total Moment ÷ Total Mass
        </text>

        {/* Number line for arms */}
        <line x1="40" y1="100" x2="440" y2="100" stroke="#e5e7eb" strokeWidth="1" />
        {[2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3].map((v) => {
          const x = 40 + ((v - 2.2) / (3.3 - 2.2)) * 400;
          return (
            <g key={v}>
              <line x1={x} y1="97" x2={x} y2="103" stroke="#9ca3af" strokeWidth="1" />
              <text x={x} y="115" fontSize="8" textAnchor="middle" fill="#9ca3af">
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}
        <text x="240" y="128" fontSize="9" textAnchor="middle" fill="#6b7280">Arm (m)</text>

        {/* Item markers */}
        {items.map((item) => {
          const x = 40 + ((item.arm - 2.2) / (3.3 - 2.2)) * 400;
          return (
            <g key={item.label}>
              <rect x={x - 22} y="55" width="44" height="22" rx="3" fill={item.color} />
              <text x={x} y="69" fontSize="8" fontWeight="600" textAnchor="middle" fill="white">
                {item.mass} kg
              </text>
              <text x={x} y="48" fontSize="8" textAnchor="middle" fill={item.color}>
                {item.label}
              </text>
              <line x1={x} y1="77" x2={x} y2="97" stroke={item.color} strokeWidth="1" strokeDasharray="2 2" />
            </g>
          );
        })}

        {/* CG marker */}
        {(() => {
          const cgX = 40 + ((cg - 2.2) / (3.3 - 2.2)) * 400;
          return (
            <g>
              <polygon points={`${cgX},100 ${cgX - 8},140 ${cgX + 8},140`} fill="#dc2626" />
              <text x={cgX} y="155" fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626">
                CG = {cg.toFixed(3)} m
              </text>
              <text x={cgX} y="170" fontSize="8" textAnchor="middle" fill="#6b7280">
                {totalMoment.toFixed(0)} ÷ {totalMass} = {cg.toFixed(3)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
