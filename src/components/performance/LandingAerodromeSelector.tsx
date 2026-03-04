import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, X, RefreshCw } from 'lucide-react';
import type { LandingInputs, SurfaceType, GrassLength } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const LANDING_AERODROME_KEY = 'da40ng-perf-landing-aerodrome';

interface PersistedLandingAerodrome {
  icao: string;
  designator: string;
  thrElev: number;
  endElev: number;
  lda: number;
}

function isPersistedState(value: unknown): value is PersistedLandingAerodrome {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<PersistedLandingAerodrome>;
  return (
    typeof v.icao === 'string' &&
    typeof v.designator === 'string' &&
    typeof v.thrElev === 'number' &&
    typeof v.endElev === 'number' &&
    typeof v.lda === 'number'
  );
}

function loadState(): PersistedLandingAerodrome | null {
  try {
    const raw = localStorage.getItem(LANDING_AERODROME_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isPersistedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

interface SavedLandingAerodrome {
  icao: string;
  elevation: number;
  designator: string;
  runwayHeading: number;
  thrElev: number;
  endElev: number;
  surface: SurfaceType;
  grassLength: GrassLength;
  lda: number;
}

interface LandingAerodromeSelectorProps {
  inputs: LandingInputs;
  onUpdate: <K extends keyof LandingInputs>(key: K, value: LandingInputs[K]) => void;
  onSyncFromTakeoff: () => void;
  onDesignatorChange?: (designator: string) => void;
}

function Pill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
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

export function LandingAerodromeSelector({ inputs, onUpdate, onSyncFromTakeoff, onDesignatorChange }: LandingAerodromeSelectorProps) {
  const [initial] = useState(() => loadState());

  const [thrElev, setThrElev] = useState(initial?.thrElev ?? 0);
  const [endElev, setEndElev] = useState(initial?.endElev ?? 0);
  const [lda, setLda] = useState(initial?.lda || inputs.lda);
  const [icao, setIcao] = useState(initial?.icao ?? '');
  const [designator, setDesignator] = useState(initial?.designator ?? '');

  // Saved aerodromes
  const [savedAerodromes, setSavedAerodromes] = useLocalStorage<SavedLandingAerodrome[]>('da40ng-saved-landing-aerodromes', []);
  const [showLoadList, setShowLoadList] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  // Restore parent state on mount
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current || !initial) return;
    mountedRef.current = true;
    if (initial.lda > 0) onUpdate('lda', initial.lda);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync designator to parent
  useEffect(() => {
    onDesignatorChange?.(designator);
  }, [designator, onDesignatorChange]);

  // Persist aerodrome state on every change
  useEffect(() => {
    const state: PersistedLandingAerodrome = { icao, designator, thrElev, endElev, lda };
    try {
      localStorage.setItem(LANDING_AERODROME_KEY, JSON.stringify(state));
    } catch { /* quota error */ }
  }, [icao, designator, thrElev, endElev, lda]);

  // Slope calculation: (endElev - thrElev) / LDA × 100
  useEffect(() => {
    if (lda > 0 && (thrElev !== 0 || endElev !== 0)) {
      const slopePercent = ((endElev - thrElev) / lda) * 100;
      onUpdate('slope', Math.round(slopePercent * 10) / 10);
    } else {
      onUpdate('slope', 0);
    }
  }, [thrElev, endElev, lda]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync LDA to parent
  const updateLda = (v: number) => {
    setLda(v);
    onUpdate('lda', v);
  };

  const saveKey = `${icao.trim().toUpperCase()}/${designator.trim()}`;
  const canSave = icao.trim().length > 0 && designator.trim().length > 0;
  const getSavedKey = (s: SavedLandingAerodrome) => `${s.icao.toUpperCase()}/${s.designator}`;

  const buildEntry = (): SavedLandingAerodrome => ({
    icao: icao.trim().toUpperCase(),
    elevation: inputs.elevation,
    designator: designator.trim(),
    runwayHeading: inputs.runwayHeading,
    thrElev, endElev,
    surface: inputs.surface,
    grassLength: inputs.grassLength,
    lda,
  });

  const handleSave = (force = false) => {
    if (!canSave) return;
    const exists = savedAerodromes.some((a) => getSavedKey(a) === saveKey);
    if (exists && !force) {
      setConfirmOverwrite(true);
      return;
    }
    const entry = buildEntry();
    setSavedAerodromes((prev) => [...prev.filter((a) => getSavedKey(a) !== saveKey), entry]);
    setConfirmOverwrite(false);
  };

  const handleLoad = (saved: SavedLandingAerodrome) => {
    setIcao(saved.icao);
    setDesignator(saved.designator);
    onUpdate('elevation', saved.elevation);
    onUpdate('runwayHeading', saved.runwayHeading);
    onUpdate('surface', saved.surface);
    onUpdate('grassLength', saved.grassLength);
    setThrElev(saved.thrElev);
    setEndElev(saved.endElev);
    setLda(saved.lda);
    onUpdate('lda', saved.lda);
    setShowLoadList(false);
  };

  const handleDeleteSaved = (key: string) => {
    setSavedAerodromes((prev) => prev.filter((a) => getSavedKey(a) !== key));
  };

  const handleSync = () => {
    // Sync weather/mass/surface from takeoff inputs
    onSyncFromTakeoff();

    // Sync aerodrome data from takeoff aerodrome localStorage
    try {
      const raw = localStorage.getItem('da40ng-perf-aerodrome');
      if (raw) {
        const a = JSON.parse(raw);
        if (a.icao) setIcao(a.icao);
        if (a.designator) setDesignator(a.designator);
        if (typeof a.thrElev === 'number') setThrElev(a.thrElev);
        if (typeof a.derElev === 'number') setEndElev(a.derElev);
        const ldaVal = a.fullTora ?? 0;
        if (ldaVal > 0) {
          setLda(ldaVal);
          onUpdate('lda', ldaVal);
        }
      }
    } catch { /* ignore */ }
  };

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Aerodrome & Runway</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={handleSync}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Sync from T/O
            </Button>
            {savedAerodromes.length > 0 && (
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-input text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setShowLoadList(!showLoadList)}
              >
                <FolderOpen className="h-3 w-3" /> Load
              </button>
            )}
            <button
              type="button"
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                canSave
                  ? 'border-input text-muted-foreground hover:bg-muted'
                  : 'border-input text-muted-foreground/40 cursor-not-allowed'
              }`}
              disabled={!canSave}
              onClick={() => handleSave()}
            >
              <Save className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overwrite confirmation */}
        {confirmOverwrite && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-sm">
            <span className="flex-1 text-amber-700 dark:text-amber-400">
              <span className="font-semibold">{saveKey}</span> already saved. Overwrite?
            </span>
            <button
              type="button"
              className="px-2.5 py-1 text-xs rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              onClick={() => handleSave(true)}
            >
              Overwrite
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-xs rounded-md border border-input text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setConfirmOverwrite(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Load list */}
        {showLoadList && (
          <div className="bg-muted/50 rounded-lg p-2 space-y-1">
            <div className="text-xs text-muted-foreground mb-1">Saved aerodromes</div>
            {savedAerodromes.map((saved) => {
              const key = getSavedKey(saved);
              return (
                <div key={key} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleLoad(saved)}
                  >
                    <span className="font-semibold">{key}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {saved.elevation} ft · {saved.surface} · LDA {saved.lda} m
                    </span>
                  </button>
                  <button
                    type="button"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => handleDeleteSaved(key)}
                    title="Delete"
                    aria-label={`Delete ${key}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ICAO + Elevation + Designator + Heading */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label htmlFor="ldg-icao" className="text-xs text-muted-foreground">ICAO code</Label>
            <Input
              id="ldg-icao"
              placeholder="LOAN"
              value={icao}
              maxLength={4}
              className="h-8 text-sm uppercase"
              onChange={(e) => setIcao(e.target.value.toUpperCase())}
            />
          </div>
          <InputField label="Elevation (ft)" id="ldg-elev" value={inputs.elevation}
            onChange={(v) => onUpdate('elevation', v)} />
          <div>
            <Label htmlFor="ldg-rwy-desig" className="text-xs text-muted-foreground">Runway designator</Label>
            <Input
              id="ldg-rwy-desig"
              placeholder="e.g. 27"
              value={designator}
              className="h-8 text-sm"
              onChange={(e) => setDesignator(e.target.value)}
            />
          </div>
          <InputField label="Runway heading (°T)" id="ldg-rwy-hdg" value={inputs.runwayHeading} min={0} max={360}
            onChange={(v) => onUpdate('runwayHeading', v)} />
        </div>

        {/* Slope from threshold elevations */}
        <div className="grid grid-cols-4 gap-3">
          <InputField label="THR elevation (m)" id="ldg-thr-elev" value={thrElev}
            onChange={(v) => setThrElev(v)} />
          <InputField label="End elevation (m)" id="ldg-end-elev" value={endElev}
            onChange={(v) => setEndElev(v)} />
          <InputField label="LDA (m)" id="ldg-lda" value={lda} min={0}
            onChange={updateLda} />
          <div>
            <div className="text-xs text-muted-foreground">Slope</div>
            {(thrElev !== 0 || endElev !== 0) && lda === 0 ? (
              <div className="text-xs text-amber-500 mt-1">Add LDA to calculate</div>
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
          </div>
        )}
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
        onChange={(e) => { const n = Number(e.target.value); onChange(e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
      />
    </div>
  );
}
