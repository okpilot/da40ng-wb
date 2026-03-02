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

  const armMin = 2.1;
  const armMax = 3.4;
  const ML = 40;
  const MR = 40;
  const W = 520;
  const PW = W - ML - MR;
  const toX = (arm: number) => ML + ((arm - armMin) / (armMax - armMin)) * PW;

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${W} 210`} className="w-full max-w-[520px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Title */}
        <text x={W / 2} y="20" fontSize="13" fontWeight="600" textAnchor="middle" fill="#374151">
          CG = Total Moment ÷ Total Mass
        </text>

        {/* Number line */}
        <line x1={ML} y1="105" x2={W - MR} y2="105" stroke="#d1d5db" strokeWidth="1.5" />
        {[2.2, 2.4, 2.6, 2.8, 3.0, 3.2].map((v) => {
          const x = toX(v);
          return (
            <g key={v}>
              <line x1={x} y1="100" x2={x} y2="110" stroke="#9ca3af" strokeWidth="1" />
              <text x={x} y="124" fontSize="10" textAnchor="middle" fill="#9ca3af">
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}
        <text x={W / 2} y="140" fontSize="10" textAnchor="middle" fill="#6b7280">Arm (m aft of datum)</text>

        {/* Item markers */}
        {items.map((item) => {
          const x = toX(item.arm);
          return (
            <g key={item.label}>
              <rect x={x - 22} y="55" width="44" height="26" rx="4" fill={item.color} />
              <text x={x} y="72" fontSize="9" fontWeight="600" textAnchor="middle" fill="white">
                {item.mass} kg
              </text>
              <text x={x} y="48" fontSize="10" textAnchor="middle" fill={item.color} fontWeight="600">
                {item.label}
              </text>
              <line x1={x} y1="81" x2={x} y2="102" stroke={item.color} strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
          );
        })}

        {/* CG marker */}
        {(() => {
          const cgX = toX(cg);
          return (
            <g>
              <polygon points={`${cgX},105 ${cgX - 10},148 ${cgX + 10},148`} fill="#dc2626" />
              <text x={cgX} y="166" fontSize="12" fontWeight="700" textAnchor="middle" fill="#dc2626">
                CG = {cg.toFixed(3)} m
              </text>
              <text x={cgX} y="184" fontSize="10" textAnchor="middle" fill="#6b7280">
                {totalMoment.toFixed(0)} ÷ {totalMass} = {cg.toFixed(3)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
