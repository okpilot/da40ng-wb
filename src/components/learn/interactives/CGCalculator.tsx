import { useState } from 'react';
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

let nextId = 1;

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
  const parsed = items.map((i) => ({
    mass: parseFloat(i.mass) || 0,
    arm: parseFloat(i.arm) || 0,
  }));
  const totalMass = parsed.reduce((s, i) => s + i.mass, 0);
  const totalMoment = parsed.reduce(
    (s, i) => s + calculateMoment(i.mass, i.arm),
    0,
  );
  const cg = totalMass > 0 ? calculateCG(totalMass, totalMoment) : 0;

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 text-xs font-medium text-muted-foreground">
        <span>Item</span>
        <span>Mass (kg)</span>
        <span>Arm (m)</span>
        <span>Moment</span>
        <span />
      </div>

      {/* Items */}
      {items.map((item) => {
        const mass = parseFloat(item.mass) || 0;
        const arm = parseFloat(item.arm) || 0;
        const moment = mass > 0 && arm > 0 ? calculateMoment(mass, arm) : 0;
        return (
          <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 items-center">
            <Input
              value={item.label}
              onChange={(e) => updateItem(item.id, 'label', e.target.value)}
              className="h-8 text-sm"
            />
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
