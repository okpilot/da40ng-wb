import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { TakeoffInputs, SurfaceType, GrassLength } from '@/lib/types';

interface AerodromeSelectorProps {
  inputs: TakeoffInputs;
  onUpdate: <K extends keyof TakeoffInputs>(key: K, value: TakeoffInputs[K]) => void;
}

function Pill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card hover:bg-muted border-input'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AerodromeSelector({ inputs, onUpdate }: AerodromeSelectorProps) {
  const [thrElev, setThrElev] = useState(0);
  const [derElev, setDerElev] = useState(0);

  const updateSlopeFromElevations = (thr: number, der: number, toraM: number) => {
    if (toraM > 0) {
      const slopePercent = ((der - thr) * 0.3048 / toraM) * 100;
      onUpdate('slope', Math.round(slopePercent * 10) / 10);
    }
  };

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Aerodrome & Runway</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Elevation + heading */}
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Aerodrome elevation (ft)" id="elev" value={inputs.elevation}
            onChange={(v) => onUpdate('elevation', v)} />
          <InputField label="Runway heading (°)" id="rwy-hdg" value={inputs.runwayHeading} min={0} max={360}
            onChange={(v) => onUpdate('runwayHeading', v)} />
        </div>

        {/* Slope from threshold elevations */}
        <div className="grid grid-cols-3 gap-3">
          <InputField label="THR elevation (ft)" id="thr-elev" value={thrElev}
            onChange={(v) => { setThrElev(v); updateSlopeFromElevations(v, derElev, inputs.tora); }} />
          <InputField label="DER elevation (ft)" id="der-elev" value={derElev}
            onChange={(v) => { setDerElev(v); updateSlopeFromElevations(thrElev, v, inputs.tora); }} />
          <Field label="Slope" value={inputs.slope === 0 ? 'Level' : `${inputs.slope > 0 ? '+' : ''}${inputs.slope.toFixed(1)}%`} />
        </div>

        {/* Surface */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Surface</span>
          {(['paved', 'grass'] as SurfaceType[]).map((s) => (
            <Pill key={s} active={inputs.surface === s}
              onClick={() => onUpdate('surface', s)}>
              {s === 'paved' ? 'Paved' : 'Grass'}
            </Pill>
          ))}
        </div>

        {/* Grass options */}
        {inputs.surface === 'grass' && (
          <div className="flex flex-wrap items-center gap-3 pl-3 border-l-2 border-muted">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Grass length</span>
              {([
                { value: 'lte5cm' as GrassLength, label: '≤ 5 cm' },
                { value: '5to10cm' as GrassLength, label: '5–10 cm' },
                { value: '25cm' as GrassLength, label: '25 cm' },
              ]).map(({ value, label }) => (
                <Pill key={value} active={inputs.grassLength === value}
                  onClick={() => onUpdate('grassLength', value)}>
                  {label}
                </Pill>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Switch id="soft-ground" className="scale-90"
                checked={inputs.softGround}
                onCheckedChange={(v) => onUpdate('softGround', v)} />
              <Label htmlFor="soft-ground" className="text-sm">Soft ground</Label>
            </div>
          </div>
        )}

        {/* Declared distances */}
        <div className="grid grid-cols-4 gap-3">
          <InputField label="TORA (m)" id="tora" value={inputs.tora} min={0}
            onChange={(v) => { onUpdate('tora', v); updateSlopeFromElevations(thrElev, derElev, v); }} />
          <InputField label="TODA (m)" id="toda" value={inputs.toda} min={0}
            onChange={(v) => onUpdate('toda', v)} />
          <InputField label="ASDA (m)" id="asda" value={inputs.asda} min={0}
            onChange={(v) => onUpdate('asda', v)} />
          <InputField label="LDA (m)" id="lda" value={inputs.lda} min={0}
            onChange={(v) => onUpdate('lda', v)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
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
        value={value}
        className="h-8 text-sm"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
