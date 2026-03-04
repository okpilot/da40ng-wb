import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { LandingInputs as LandingInputsType, LandingFlap, Rwycc } from '@/lib/types';

type OnUpdate = <K extends keyof LandingInputsType>(key: K, value: LandingInputsType[K]) => void;

const FLAP_OPTIONS: { value: LandingFlap; label: string }[] = [
  { value: 'LDG', label: 'LDG' },
  { value: 'TO', label: 'T/O' },
  { value: 'UP', label: 'UP' },
];

// ── Left column: Aircraft Configuration ──────────────────────────

interface LandingConfigPanelProps {
  inputs: LandingInputsType;
  onUpdate: OnUpdate;
}

export function LandingConfigPanel({ inputs, onUpdate }: LandingConfigPanelProps) {
  return (
    <Card className="py-3" data-tour="ld-aircraft-config">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Aircraft Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="ldg-mass" className="text-xs text-muted-foreground">Landing Mass (kg)</Label>
            <Input
              id="ldg-mass"
              type="number"
              min={800}
              max={1310}
              value={inputs.mass || ''}
              className="h-8 text-sm w-28"
              onChange={(e) => {
                if (e.target.value === '') { onUpdate('mass', 0); return; }
                const n = Number(e.target.value);
                if (Number.isFinite(n)) onUpdate('mass', n);
              }}
            />
          </div>

          {/* Flap setting */}
          <div>
            <Label className="text-xs text-muted-foreground">Flaps</Label>
            <div className="flex gap-1.5 mt-0.5">
              {FLAP_OPTIONS.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={inputs.flap === value}
                  onClick={() => onUpdate('flap', value)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    inputs.flap === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Wheel fairings */}
          <div className="flex items-center gap-2 h-8">
            <Switch
              id="ldg-fairings"
              checked={inputs.wheelFairings}
              onCheckedChange={(v) => onUpdate('wheelFairings', v)}
            />
            <Label htmlFor="ldg-fairings" className="text-xs">Wheel fairings</Label>
          </div>
        </div>
        {inputs.flap !== 'LDG' && (
          <div className="mt-2 text-xs text-amber-500 font-medium">
            Abnormal flap — using AFM 5.3.13 tables
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Right column: Weather Conditions ─────────────────────────────

interface LandingWeatherPanelProps {
  inputs: LandingInputsType;
  onUpdate: OnUpdate;
}

export function LandingWeatherPanel({ inputs, onUpdate }: LandingWeatherPanelProps) {
  return (
    <Card className="py-3" data-tour="ld-weather">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Wind (°T)" id="ldg-wind-dir" value={inputs.windDirection} min={0} max={360}
            onChange={(v) => onUpdate('windDirection', v)} />
          <InputField label="Wind (kt)" id="ldg-wind-spd" value={inputs.windSpeed} min={0}
            onChange={(v) => onUpdate('windSpeed', v)} />
          <InputField label="OAT (°C)" id="ldg-oat" value={inputs.oat}
            onChange={(v) => onUpdate('oat', v)} />
          <InputField label="QNH (hPa)" id="ldg-qnh" value={inputs.qnh} step={0.01}
            onChange={(v) => onUpdate('qnh', v)} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Runway Condition</span>
          {([
            { code: 6 as Rwycc, label: '6 — Dry' },
            { code: 5 as Rwycc, label: '5 — Wet' },
          ]).map(({ code, label }) => (
            <button
              type="button"
              key={code}
              aria-pressed={inputs.rwycc === code}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
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

// ── Shared ───────────────────────────────────────────────────────

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
