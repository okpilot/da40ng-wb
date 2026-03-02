import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { calculateMoment, calculateCG } from '@/lib/calculations';

interface Item {
  id: number;
  label: string;
  mass: string;
  arm: string;
}

const COLORS = ['#6b7280', '#1d4ed8', '#7c3aed', '#059669', '#d97706', '#dc2626'];

let nextId = 1;

// Animated CG shift visualisation
function CGShiftDiagram({
  items,
}: {
  items: { label: string; mass: number; arm: number; color: string }[];
}) {
  const armMin = 2.0;
  const armMax = 3.5;
  const M = { left: 30, right: 20 };
  const W = 460;
  const PW = W - M.left - M.right;

  const toX = (arm: number) => M.left + ((arm - armMin) / (armMax - armMin)) * PW;

  const totalMass = items.reduce((s, i) => s + i.mass, 0);
  const totalMoment = items.reduce((s, i) => s + i.mass * i.arm, 0);
  const cg = totalMass > 0 ? calculateCG(totalMass, totalMoment) : 0;

  // Running CG: how CG shifts as each item is added
  const cgSteps = useMemo(() => {
    const steps: { arm: number; cg: number; label: string }[] = [];
    let runMass = 0;
    let runMoment = 0;
    for (const item of items) {
      if (item.mass <= 0) continue;
      runMass += item.mass;
      runMoment += item.mass * item.arm;
      steps.push({
        arm: item.arm,
        cg: runMoment / runMass,
        label: item.label,
      });
    }
    return steps;
  }, [items]);

  return (
    <svg viewBox={`0 0 ${W} 120`} className="w-full" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Arm axis */}
      <line x1={M.left} y1="70" x2={W - M.right} y2="70" stroke="#e5e7eb" strokeWidth="1" />
      {[2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5].map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1="67" x2={toX(v)} y2="73" stroke="#9ca3af" strokeWidth="1" />
          <text x={toX(v)} y="85" fontSize="8" textAnchor="middle" fill="#9ca3af">
            {v.toFixed(1)} m
          </text>
        </g>
      ))}

      {/* Item markers */}
      {items.map((item, i) => {
        if (item.mass <= 0) return null;
        const x = toX(item.arm);
        const barH = Math.min(40, Math.max(8, (item.mass / totalMass) * 60));
        return (
          <g key={i}>
            <rect
              x={x - 14}
              y={70 - barH}
              width="28"
              height={barH}
              rx="3"
              fill={item.color}
              opacity="0.8"
            />
            <text x={x} y={70 - barH - 4} fontSize="7" textAnchor="middle" fill={item.color} fontWeight="600">
              {item.label}
            </text>
            <text x={x} y={70 - barH / 2 + 3} fontSize="7" textAnchor="middle" fill="white" fontWeight="600">
              {item.mass}kg
            </text>
          </g>
        );
      })}

      {/* CG shift trail — shows how CG moved as each item was added */}
      {cgSteps.length >= 2 && cgSteps.map((step, i) => {
        if (i === 0) return null;
        const prev = cgSteps[i - 1];
        return (
          <line
            key={`trail-${i}`}
            x1={toX(prev.cg)}
            y1="95"
            x2={toX(step.cg)}
            y2="95"
            stroke="#dc2626"
            strokeWidth="2"
            opacity="0.3"
            strokeDasharray="3 2"
          />
        );
      })}

      {/* CG marker — animated position */}
      {totalMass > 0 && (
        <g>
          <polygon
            points={`${toX(cg)},70 ${toX(cg) - 7},95 ${toX(cg) + 7},95`}
            fill="#dc2626"
          >
            <animate attributeName="opacity" from="0.5" to="1" dur="0.5s" fill="freeze" />
          </polygon>
          <text x={toX(cg)} y="108" fontSize="9" fontWeight="700" textAnchor="middle" fill="#dc2626">
            CG {cg.toFixed(3)} m
          </text>
        </g>
      )}
    </svg>
  );
}

export function CGCalculator() {
  const [items, setItems] = useState<Item[]>([
    { id: nextId++, label: 'BEM', mass: '940', arm: '2.442' },
    { id: nextId++, label: 'Front Seats', mass: '', arm: '2.30' },
    { id: nextId++, label: 'Rear Seats', mass: '', arm: '3.25' },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: nextId++, label: 'Item', mass: '', arm: '' },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: 'label' | 'mass' | 'arm', value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  // Calculate totals
  const parsed = items.map((i, idx) => ({
    label: i.label,
    mass: parseFloat(i.mass) || 0,
    arm: parseFloat(i.arm) || 0,
    color: COLORS[idx % COLORS.length],
  }));
  const totalMass = parsed.reduce((s, i) => s + i.mass, 0);
  const totalMoment = parsed.reduce(
    (s, i) => s + calculateMoment(i.mass, i.arm),
    0,
  );
  const cg = totalMass > 0 ? calculateCG(totalMass, totalMoment) : 0;

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      {/* Animated CG diagram */}
      {totalMass > 0 && (
        <div className="border rounded-lg bg-card p-2">
          <CGShiftDiagram items={parsed.filter((i) => i.mass > 0)} />
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 text-xs font-medium text-muted-foreground">
        <span>Item</span>
        <span>Mass (kg)</span>
        <span>Arm (m)</span>
        <span>Moment</span>
        <span />
      </div>

      {/* Items */}
      {items.map((item, idx) => {
        const mass = parseFloat(item.mass) || 0;
        const arm = parseFloat(item.arm) || 0;
        const moment = mass > 0 && arm > 0 ? calculateMoment(mass, arm) : 0;
        return (
          <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <Input
                value={item.label}
                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <Input
              type="number"
              step="any"
              value={item.mass}
              onChange={(e) => updateItem(item.id, 'mass', e.target.value)}
              className="h-8 text-sm"
              placeholder="0"
            />
            <Input
              type="number"
              step="any"
              value={item.arm}
              onChange={(e) => updateItem(item.id, 'arm', e.target.value)}
              className="h-8 text-sm"
              placeholder="0"
            />
            <span className="text-sm font-mono text-right">
              {moment > 0 ? moment.toFixed(1) : '—'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      })}

      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1 h-3 w-3" />
        Add Item
      </Button>

      {/* Totals */}
      <div className="border-t pt-3 mt-3">
        <div className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 items-center text-sm font-medium">
          <span>Total</span>
          <span className="font-mono">{totalMass.toFixed(1)}</span>
          <span />
          <span className="font-mono text-right">{totalMoment.toFixed(1)}</span>
          <span />
        </div>
      </div>

      {/* CG Result */}
      <div className={`p-4 rounded-lg text-center ${
        totalMass > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted border border-border'
      }`}>
        <p className="text-sm text-muted-foreground mb-1">CG = Total Moment ÷ Total Mass</p>
        <p className="text-2xl font-bold font-mono">
          {totalMass > 0 ? (
            <>
              {totalMoment.toFixed(1)} ÷ {totalMass.toFixed(1)} = <span className="text-primary">{cg.toFixed(3)} m</span>
            </>
          ) : (
            <span className="text-muted-foreground">— m</span>
          )}
        </p>
      </div>
    </div>
  );
}
