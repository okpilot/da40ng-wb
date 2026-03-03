import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import type { TakeoffInputs, SurfaceType, GrassLength } from '@/lib/types';

interface AerodromeSelectorProps {
  inputs: TakeoffInputs;
  onUpdate: <K extends keyof TakeoffInputs>(key: K, value: TakeoffInputs[K]) => void;
  onDepartureChange: (label: string, fullTora: number) => void;
}

interface IntersectionEntry {
  id: number;
  name: string;
  tora: number;
  toda: number;
  asda: number;
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

let nextIntId = 1;

export function AerodromeSelector({ inputs, onUpdate, onDepartureChange }: AerodromeSelectorProps) {
  const [thrElev, setThrElev] = useState(0);
  const [derElev, setDerElev] = useState(0);
  const [fullTora, setFullTora] = useState(0);
  const [fullToda, setFullToda] = useState(0);
  const [fullAsda, setFullAsda] = useState(0);
  const [intersections, setIntersections] = useState<IntersectionEntry[]>([]);
  const [activeIntId, setActiveIntId] = useState<number | null>(null); // null = full length

  // Reactively calculate slope whenever THR, DER, or TORA changes
  useEffect(() => {
    const tora = activeIntId === null ? fullTora : inputs.tora;
    if (fullTora > 0 && (thrElev !== 0 || derElev !== 0)) {
      const slopePercent = ((derElev - thrElev) / fullTora) * 100;
      onUpdate('slope', Math.round(slopePercent * 10) / 10);
    } else if (thrElev === 0 && derElev === 0) {
      onUpdate('slope', 0);
    }
  }, [thrElev, derElev, fullTora]);

  const selectFullLength = () => {
    setActiveIntId(null);
    onUpdate('tora', fullTora);
    onUpdate('toda', fullToda);
    onUpdate('asda', fullAsda);
    onDepartureChange('Full length', fullTora);
  };

  const selectIntersection = (int: IntersectionEntry) => {
    setActiveIntId(int.id);
    onUpdate('tora', int.tora);
    onUpdate('toda', int.toda);
    onUpdate('asda', int.asda);
    onDepartureChange(int.name || 'Intersection', fullTora);
  };

  const addIntersection = () => {
    const id = nextIntId++;
    setIntersections((prev) => [...prev, { id, name: '', tora: 0, toda: 0, asda: 0 }]);
    // Don't auto-select — let user fill in values first
  };

  const updateIntersection = (id: number, field: keyof IntersectionEntry, value: string | number) => {
    setIntersections((prev) => prev.map((int) =>
      int.id === id ? { ...int, [field]: value } : int,
    ));
    // If this intersection is active, update the calculation inputs
    if (activeIntId === id && field !== 'name') {
      const key = field as 'tora' | 'toda' | 'asda';
      onUpdate(key, value as number);
    }
  };

  const removeIntersection = (id: number) => {
    setIntersections((prev) => prev.filter((int) => int.id !== id));
    if (activeIntId === id) {
      selectFullLength();
    }
  };

  const updateFullLength = (field: 'tora' | 'toda' | 'asda', value: number) => {
    if (field === 'tora') setFullTora(value);
    if (field === 'toda') setFullToda(value);
    if (field === 'asda') setFullAsda(value);
    // If full length is active, update calculation inputs
    if (activeIntId === null) {
      onUpdate(field, value);
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
          <InputField label="Runway heading (°T)" id="rwy-hdg" value={inputs.runwayHeading} min={0} max={360}
            onChange={(v) => onUpdate('runwayHeading', v)} />
        </div>

        {/* Slope from threshold elevations */}
        <div className="grid grid-cols-3 gap-3">
          <InputField label="THR elevation (m)" id="thr-elev" value={thrElev}
            onChange={(v) => setThrElev(v)} />
          <InputField label="DER elevation (m)" id="der-elev" value={derElev}
            onChange={(v) => setDerElev(v)} />
          <div>
            <div className="text-xs text-muted-foreground">Slope</div>
            {(thrElev !== 0 || derElev !== 0) && fullTora === 0 ? (
              <div className="text-xs text-amber-500 mt-1">Add TORA to calculate</div>
            ) : (
              <div className="text-sm font-medium">
                {inputs.slope === 0 ? 'Level' : `${inputs.slope > 0 ? '+' : ''}${inputs.slope.toFixed(1)}%`}
              </div>
            )}
          </div>
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

        {/* Declared distances — full length */}
        <div className="grid grid-cols-3 gap-3">
          <InputField label="TORA (m)" id="tora-full" value={fullTora} min={0}
            onChange={(v) => updateFullLength('tora', v)} />
          <InputField label="TODA (m)" id="toda-full" value={fullToda} min={0}
            onChange={(v) => updateFullLength('toda', v)} />
          <InputField label="ASDA (m)" id="asda-full" value={fullAsda} min={0}
            onChange={(v) => updateFullLength('asda', v)} />
        </div>

        {/* Departure point selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Departure</span>
          <Pill active={activeIntId === null} onClick={selectFullLength}>
            Full length
          </Pill>
          {intersections.map((int) => (
            <Pill key={int.id} active={activeIntId === int.id}
              onClick={() => selectIntersection(int)}>
              {int.name || 'TWY ?'}
            </Pill>
          ))}
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-dashed border-input text-muted-foreground hover:bg-muted transition-colors"
            onClick={addIntersection}
          >
            <Plus className="h-3 w-3" /> Add intersection
          </button>
        </div>

        {/* Intersection entries */}
        {intersections.map((int) => (
          <div key={int.id} className="grid grid-cols-[80px_1fr_1fr_1fr_auto] gap-2 items-end pl-3 border-l-2 border-muted">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={int.name}
                placeholder="TWY G"
                className="h-8 text-sm"
                onChange={(e) => updateIntersection(int.id, 'name', e.target.value)}
              />
            </div>
            <InputField label="TORA (m)" id={`tora-int-${int.id}`} value={int.tora} min={0}
              onChange={(v) => updateIntersection(int.id, 'tora', v)} />
            <InputField label="TODA (m)" id={`toda-int-${int.id}`} value={int.toda} min={0}
              onChange={(v) => updateIntersection(int.id, 'toda', v)} />
            <InputField label="ASDA (m)" id={`asda-int-${int.id}`} value={int.asda} min={0}
              onChange={(v) => updateIntersection(int.id, 'asda', v)} />
            <button
              type="button"
              className="h-8 w-8 flex items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => removeIntersection(int.id)}
              title="Remove intersection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
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
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </div>
  );
}
