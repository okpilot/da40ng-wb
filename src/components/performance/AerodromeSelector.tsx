import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Save, FolderOpen } from 'lucide-react';
import type { TakeoffInputs, SurfaceType, GrassLength } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AerodromeSelectorProps {
  inputs: TakeoffInputs;
  onUpdate: <K extends keyof TakeoffInputs>(key: K, value: TakeoffInputs[K]) => void;
  onDepartureChange: (label: string, fullTora: number) => void;
  onDesignatorChange: (designator: string) => void;
}

interface IntersectionEntry {
  id: number;
  name: string;
  tora: number;
  toda: number;
  asda: number;
}

interface SavedAerodrome {
  name: string;
  elevation: number;
  designator: string;
  runwayHeading: number;
  thrElev: number;
  derElev: number;
  surface: SurfaceType;
  grassLength: GrassLength;
  fullTora: number;
  fullToda: number;
  fullAsda: number;
  intersections: Omit<IntersectionEntry, 'id'>[];
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

export function AerodromeSelector({ inputs, onUpdate, onDepartureChange, onDesignatorChange }: AerodromeSelectorProps) {
  const [thrElev, setThrElev] = useState(0);
  const [derElev, setDerElev] = useState(0);
  const [fullTora, setFullTora] = useState(inputs.tora);
  const [fullToda, setFullToda] = useState(inputs.toda);
  const [fullAsda, setFullAsda] = useState(inputs.asda);
  const [designator, setDesignator] = useState('');
  const [intersections, setIntersections] = useState<IntersectionEntry[]>([]);
  const [activeIntId, setActiveIntId] = useState<number | null>(null);

  // Saved aerodromes
  const [savedAerodromes, setSavedAerodromes] = useLocalStorage<SavedAerodrome[]>('da40ng-saved-aerodromes', []);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showLoadList, setShowLoadList] = useState(false);

  // Slope calculation
  useEffect(() => {
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
  };

  const updateIntersection = (id: number, field: keyof IntersectionEntry, value: string | number) => {
    setIntersections((prev) => prev.map((int) =>
      int.id === id ? { ...int, [field]: value } : int,
    ));
    if (activeIntId === id && field !== 'name') {
      onUpdate(field as 'tora' | 'toda' | 'asda', value as number);
    }
  };

  const removeIntersection = (id: number) => {
    setIntersections((prev) => prev.filter((int) => int.id !== id));
    if (activeIntId === id) selectFullLength();
  };

  const updateFullLength = (field: 'tora' | 'toda' | 'asda', value: number) => {
    if (field === 'tora') setFullTora(value);
    if (field === 'toda') setFullToda(value);
    if (field === 'asda') setFullAsda(value);
    if (activeIntId === null) onUpdate(field, value);
  };

  // Save current config
  const handleSave = () => {
    if (!saveName.trim()) return;
    const entry: SavedAerodrome = {
      name: saveName.trim(),
      elevation: inputs.elevation,
      designator,
      runwayHeading: inputs.runwayHeading,
      thrElev, derElev,
      surface: inputs.surface,
      grassLength: inputs.grassLength,
      fullTora, fullToda, fullAsda,
      intersections: intersections.map(({ name, tora, toda, asda }) => ({ name, tora, toda, asda })),
    };
    setSavedAerodromes((prev) => [...prev.filter((a) => a.name !== entry.name), entry]);
    setSaveName('');
    setShowSaveInput(false);
  };

  // Load a saved config
  const handleLoad = (saved: SavedAerodrome) => {
    onUpdate('elevation', saved.elevation);
    setDesignator(saved.designator || '');
    onDesignatorChange(saved.designator || '');
    onUpdate('runwayHeading', saved.runwayHeading);
    onUpdate('surface', saved.surface);
    onUpdate('grassLength', saved.grassLength);
    setThrElev(saved.thrElev);
    setDerElev(saved.derElev);
    setFullTora(saved.fullTora);
    setFullToda(saved.fullToda);
    setFullAsda(saved.fullAsda);
    onUpdate('tora', saved.fullTora);
    onUpdate('toda', saved.fullToda);
    onUpdate('asda', saved.fullAsda);
    const loaded = saved.intersections.map((int) => ({ ...int, id: nextIntId++ }));
    setIntersections(loaded);
    setActiveIntId(null);
    onDepartureChange('Full length', saved.fullTora);
    setShowLoadList(false);
  };

  const handleDeleteSaved = (name: string) => {
    setSavedAerodromes((prev) => prev.filter((a) => a.name !== name));
  };

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Aerodrome & Runway</CardTitle>
          <div className="flex gap-1">
            {savedAerodromes.length > 0 && (
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-input text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => { setShowLoadList(!showLoadList); setShowSaveInput(false); }}
              >
                <FolderOpen className="h-3 w-3" /> Load
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-input text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => { setShowSaveInput(!showSaveInput); setShowLoadList(false); }}
            >
              <Save className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Save input */}
        {showSaveInput && (
          <div className="flex gap-2 items-end bg-muted/50 rounded-lg p-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Save as</Label>
              <Input
                placeholder="e.g. LOAN RWY 09"
                value={saveName}
                className="h-8 text-sm"
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <button
              type="button"
              className="h-8 px-3 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        )}

        {/* Load list */}
        {showLoadList && (
          <div className="bg-muted/50 rounded-lg p-2 space-y-1">
            <div className="text-xs text-muted-foreground mb-1">Saved aerodromes</div>
            {savedAerodromes.map((saved) => (
              <div key={saved.name} className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                  onClick={() => handleLoad(saved)}
                >
                  <span className="font-semibold">{saved.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    {saved.elevation} ft · {String(saved.runwayHeading).padStart(3, '0')}° · {saved.surface} · TORA {saved.fullTora} m
                  </span>
                </button>
                <button
                  type="button"
                  className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => handleDeleteSaved(saved.name)}
                  title="Delete"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Elevation + designator + heading */}
        <div className="grid grid-cols-3 gap-3">
          <InputField label="Aerodrome elevation (ft)" id="elev" value={inputs.elevation}
            onChange={(v) => onUpdate('elevation', v)} />
          <div>
            <Label htmlFor="rwy-desig" className="text-xs text-muted-foreground">Runway designator</Label>
            <Input
              id="rwy-desig"
              placeholder="e.g. 09"
              value={designator}
              className="h-8 text-sm"
              onChange={(e) => { setDesignator(e.target.value); onDesignatorChange(e.target.value); }}
            />
          </div>
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

        {/* Declared distances */}
        <div className="grid grid-cols-3 gap-3">
          <InputField label="TORA (m)" id="tora-full" value={fullTora} min={0}
            onChange={(v) => updateFullLength('tora', v)} />
          <InputField label="TODA (m)" id="toda-full" value={fullToda} min={0}
            onChange={(v) => updateFullLength('toda', v)} />
          <InputField label="ASDA (m)" id="asda-full" value={fullAsda} min={0}
            onChange={(v) => updateFullLength('asda', v)} />
        </div>

        {/* Departure selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Departure</span>
          <Pill active={activeIntId === null} onClick={selectFullLength}>Full length</Pill>
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
              title="Remove"
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
        onChange={(e) => { const n = Number(e.target.value); onChange(e.target.value === '' || isNaN(n) ? 0 : n); }}
      />
    </div>
  );
}
