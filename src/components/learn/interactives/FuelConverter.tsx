import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { da40ng } from '@/data/da40ng';
import { calculateMoment } from '@/lib/calculations';

type FuelUnit = 'usg' | 'litres' | 'kg';

export function FuelConverter() {
  const [inputUnit, setInputUnit] = useState<FuelUnit>('usg');
  const [inputValue, setInputValue] = useState('25');

  const val = parseFloat(inputValue) || 0;

  // Convert to all units
  let usg: number, litres: number, kg: number;
  switch (inputUnit) {
    case 'usg':
      usg = val;
      litres = val * da40ng.usgToLitres;
      kg = litres * da40ng.fuelDensity;
      break;
    case 'litres':
      litres = val;
      usg = val / da40ng.usgToLitres;
      kg = val * da40ng.fuelDensity;
      break;
    case 'kg':
      kg = val;
      litres = val / da40ng.fuelDensity;
      usg = litres / da40ng.usgToLitres;
      break;
  }

  const fuelArm = 2.63;
  const moment = calculateMoment(kg, fuelArm);

  const units: { key: FuelUnit; label: string; value: number; color: string }[] = [
    { key: 'usg', label: 'US Gallons', value: usg, color: 'text-blue-600' },
    { key: 'litres', label: 'Litres', value: litres, color: 'text-green-600' },
    { key: 'kg', label: 'Kilograms', value: kg, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label>Enter fuel quantity:</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            step="any"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="max-w-32"
          />
          <div className="flex gap-1">
            {units.map((u) => (
              <button
                key={u.key}
                onClick={() => setInputUnit(u.key)}
                aria-pressed={inputUnit === u.key}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  inputUnit === u.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:bg-accent'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {val > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {units.map((u) => (
              <div key={u.key} className={`p-3 rounded-lg border text-center ${
                inputUnit === u.key ? 'bg-primary/5 border-primary/30' : 'bg-card'
              }`}>
                <p className="text-xs text-muted-foreground">{u.label}</p>
                <p className={`text-lg font-bold font-mono ${u.color}`}>
                  {u.value.toFixed(1)}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg border bg-card text-center">
            <p className="text-xs text-muted-foreground">
              Fuel moment at arm {fuelArm} m
            </p>
            <p className="text-lg font-bold font-mono">
              {kg.toFixed(1)} × {fuelArm} = <span className="text-primary">{moment.toFixed(1)} kg·m</span>
            </p>
          </div>

          {/* Tank capacity reference */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Tank capacities (usable):</p>
            <p>Standard: {da40ng.tanks.standard.usableUsg} USG / {da40ng.tanks.standard.usableLitres} L / {da40ng.tanks.standard.usableKg} kg</p>
            <p>Long Range: {da40ng.tanks['long-range'].usableUsg} USG / {da40ng.tanks['long-range'].usableLitres} L / {da40ng.tanks['long-range'].usableKg} kg</p>
          </div>
        </>
      )}
    </div>
  );
}
