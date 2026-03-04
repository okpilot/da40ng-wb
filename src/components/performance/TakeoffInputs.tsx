import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TakeoffInputs as TakeoffInputsType, Rwycc } from '@/lib/types';

interface TakeoffInputsProps {
  inputs: TakeoffInputsType;
  onUpdate: <K extends keyof TakeoffInputsType>(key: K, value: TakeoffInputsType[K]) => void;
}

export function TakeoffInputsPanel({ inputs, onUpdate }: TakeoffInputsProps) {
  return (
    <Card className="py-3" data-tour="to-weather">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <InputField label="Wind (°T)" id="wind-dir" value={inputs.windDirection} min={0} max={360}
            onChange={(v) => onUpdate('windDirection', v)} />
          <InputField label="Wind (kt)" id="wind-spd" value={inputs.windSpeed} min={0}
            onChange={(v) => onUpdate('windSpeed', v)} />
          <InputField label="OAT (°C)" id="oat" value={inputs.oat}
            onChange={(v) => onUpdate('oat', v)} />
          <InputField label="QNH (hPa)" id="qnh" value={inputs.qnh} step={0.01}
            onChange={(v) => onUpdate('qnh', v)} />
        </div>

        {/* Runway Condition */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Runway Condition</span>
          {([
            { code: 6 as Rwycc, label: '6 — Dry' },
            { code: 5 as Rwycc, label: '5 — Wet' },
          ]).map(({ code, label }) => (
            <button
              key={code}
              type="button"
              aria-pressed={inputs.rwycc === code}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                inputs.rwycc === code
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-muted border-input'
              }`}
              onClick={() => onUpdate('rwycc', code)}
            >
              {label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InputField({ label, id, value, min, max, step, onChange }: {
  label: string; id: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ''}
        className="h-8 text-sm"
        onChange={(e) => { if (e.target.value === '') { onChange(0); return; } const n = Number(e.target.value); if (Number.isFinite(n)) onChange(n); }}
      />
    </div>
  );
}
