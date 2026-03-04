import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw } from 'lucide-react';
import type { LandingInputs as LandingInputsType, LandingFlap, Rwycc, GrassLength } from '@/lib/types';

interface LandingInputsPanelProps {
  inputs: LandingInputsType;
  onUpdate: <K extends keyof LandingInputsType>(key: K, value: LandingInputsType[K]) => void;
  onSyncFromTakeoff: () => void;
}

const FLAP_OPTIONS: { value: LandingFlap; label: string }[] = [
  { value: 'LDG', label: 'LDG' },
  { value: 'TO', label: 'T/O' },
  { value: 'UP', label: 'UP' },
];

export function LandingInputsPanel({ inputs, onUpdate, onSyncFromTakeoff }: LandingInputsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Aircraft config */}
      <Card className="py-3">
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
                  const n = Number(e.target.value);
                  onUpdate('mass', e.target.value === '' || !Number.isFinite(n) ? 0 : n);
                }}
              />
            </div>

            {/* Flap setting */}
            <div>
              <Label className="text-xs text-muted-foreground">Flaps</Label>
              <div className="flex gap-1.5 mt-0.5">
                {FLAP_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
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

      {/* Aerodrome / runway */}
      <Card className="py-3">
        <CardHeader className="pb-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Aerodrome & Runway</CardTitle>
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={onSyncFromTakeoff}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Sync from Take-off
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <InputField label="Elevation (ft)" id="ldg-elev" value={inputs.elevation}
              onChange={(v) => onUpdate('elevation', v)} />
            <InputField label="Rwy Heading (°T)" id="ldg-rwy-hdg" value={inputs.runwayHeading} min={0} max={360}
              onChange={(v) => onUpdate('runwayHeading', v)} />
            <InputField label="LDA (m)" id="ldg-lda" value={inputs.lda} min={0}
              onChange={(v) => onUpdate('lda', v)} />
            <InputField label="Slope (%)" id="ldg-slope" value={inputs.slope} step={0.1}
              onChange={(v) => onUpdate('slope', v)} />
          </div>

          {/* Surface */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Surface</span>
              {(['paved', 'grass'] as const).map((s) => (
                <button
                  key={s}
                  aria-pressed={inputs.surface === s}
                  className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                    inputs.surface === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted border-input'
                  }`}
                  onClick={() => onUpdate('surface', s)}
                >
                  {s === 'paved' ? 'Paved' : 'Grass'}
                </button>
              ))}
            </div>

            {inputs.surface === 'grass' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Grass length</span>
                {([
                  { value: 'lte5cm' as GrassLength, label: '≤5 cm' },
                  { value: '5to10cm' as GrassLength, label: '5–10 cm' },
                  { value: '25cm' as GrassLength, label: '25 cm' },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    aria-pressed={inputs.grassLength === value}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      inputs.grassLength === value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:bg-muted border-input'
                    }`}
                    onClick={() => onUpdate('grassLength', value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weather conditions */}
      <Card className="py-3">
        <CardHeader className="pb-0 pt-0">
          <CardTitle className="text-sm">Weather Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
    </div>
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
        onChange={(e) => { const n = Number(e.target.value); onChange(e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
      />
    </div>
  );
}
