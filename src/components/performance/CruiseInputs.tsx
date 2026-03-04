import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw } from 'lucide-react';
import type { CruiseInputs as CruiseInputsType, CruisePower } from '@/lib/types';

const POWER_OPTIONS: CruisePower[] = [92, 75, 60, 45];

interface CruiseInputsPanelProps {
  inputs: CruiseInputsType;
  onUpdate: <K extends keyof CruiseInputsType>(key: K, value: CruiseInputsType[K]) => void;
  onSyncFromClimb: () => void;
}

export function CruiseInputsPanel({ inputs, onUpdate, onSyncFromClimb }: CruiseInputsPanelProps) {
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
              <Label className="text-xs text-muted-foreground">Weight</Label>
              <div className="h-8 flex items-center px-3 rounded-md border bg-muted/50 text-sm font-mono w-28">
                1310 kg
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Flaps</Label>
              <div className="h-8 flex items-center px-3 rounded-md border bg-muted/50 text-sm font-mono w-28">
                UP
              </div>
            </div>
            <div className="flex items-center gap-2 h-8">
              <Switch
                id="cruise-fairings"
                checked={inputs.wheelFairings}
                onCheckedChange={(v) => onUpdate('wheelFairings', v)}
              />
              <Label htmlFor="cruise-fairings" className="text-xs">
                Wheel fairings
              </Label>
              {!inputs.wheelFairings && (
                <span className="text-[10px] text-amber-500">TAS −4%</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cruise conditions */}
      <Card className="py-3">
        <CardHeader className="pb-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Cruise Conditions</CardTitle>
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={onSyncFromClimb}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Sync from Climb
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <InputField label="Cruise Altitude (ft)" id="cruise-alt" value={inputs.cruiseAltitude}
              onChange={(v) => onUpdate('cruiseAltitude', v)} />
            <InputField label="QNH (hPa)" id="cruise-qnh" value={inputs.qnh} step={0.01}
              onChange={(v) => onUpdate('qnh', v)} />
            <InputField label="OAT (°C)" id="cruise-oat" value={inputs.oat}
              onChange={(v) => onUpdate('oat', v)} />
          </div>

          {/* Power setting */}
          <div>
            <Label className="text-xs text-muted-foreground">Power Setting</Label>
            <div className="flex gap-1.5 mt-1">
              {POWER_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdate('power', p)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    inputs.power === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Usable fuel */}
          <div className="grid grid-cols-2 gap-2">
            <InputField label="Usable Fuel (USG)" id="cruise-fuel" value={inputs.usableFuelUsg}
              onChange={(v) => onUpdate('usableFuelUsg', v)} />
            <div>
              <Label className="text-xs text-muted-foreground">Tank presets</Label>
              <div className="flex gap-1.5 mt-1">
                <button
                  onClick={() => onUpdate('usableFuelUsg', 28)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    inputs.usableFuelUsg === 28
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  Std 28
                </button>
                <button
                  onClick={() => onUpdate('usableFuelUsg', 39)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    inputs.usableFuelUsg === 39
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  LR 39
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InputField({ label, id, value, step, onChange }: {
  label: string; id: string; value: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        value={value || ''}
        className="h-8 text-sm"
        onChange={(e) => { const n = Number(e.target.value); onChange(e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
      />
    </div>
  );
}
