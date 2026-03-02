import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateMoment } from '@/lib/calculations';

export function MomentCalculator() {
  const [mass, setMass] = useState('');
  const [arm, setArm] = useState('');

  const massNum = parseFloat(mass);
  const armNum = parseFloat(arm);
  const hasValues = !isNaN(massNum) && !isNaN(armNum) && massNum > 0 && armNum > 0;
  const moment = hasValues ? calculateMoment(massNum, armNum) : 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mc-mass">Mass (kg)</Label>
          <Input
            id="mc-mass"
            type="number"
            step="any"
            min="0"
            placeholder="e.g. 80"
            value={mass}
            onChange={(e) => setMass(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mc-arm">Arm (m)</Label>
          <Input
            id="mc-arm"
            type="number"
            step="any"
            min="0"
            placeholder="e.g. 2.30"
            value={arm}
            onChange={(e) => setArm(e.target.value)}
          />
        </div>
      </div>

      <div className={`p-4 rounded-lg text-center transition-colors ${
        hasValues ? 'bg-primary/10 border border-primary/20' : 'bg-muted border border-border'
      }`}>
        <p className="text-sm text-muted-foreground mb-1">Moment = Mass × Arm</p>
        <p className="text-2xl font-bold font-mono">
          {hasValues ? (
            <>
              {massNum} × {armNum} = <span className="text-primary">{moment.toFixed(1)} kg·m</span>
            </>
          ) : (
            <span className="text-muted-foreground">— kg·m</span>
          )}
        </p>
      </div>

      {/* Presets for DA40 stations */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Try a DA40 NG station:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Front Seats', arm: '2.30' },
            { label: 'Fuel', arm: '2.63' },
            { label: 'Rear Seats', arm: '3.25' },
            { label: 'Baggage', arm: '3.65' },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setArm(s.arm)}
              className="text-xs px-2 py-1 rounded border bg-card hover:bg-accent transition-colors"
            >
              {s.label} ({s.arm} m)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
