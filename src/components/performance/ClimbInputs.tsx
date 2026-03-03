import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import type { ClimbInputs as ClimbInputsType } from '@/lib/types';

interface ClimbInputsPanelProps {
  inputs: ClimbInputsType;
  onUpdate: <K extends keyof ClimbInputsType>(key: K, value: ClimbInputsType[K]) => void;
  onSyncFromTakeoff: () => void;
}

export function ClimbInputsPanel({ inputs, onUpdate, onSyncFromTakeoff }: ClimbInputsPanelProps) {
  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Departure Conditions</CardTitle>
          <Button variant="outline" size="sm" className="h-6 text-xs" onClick={onSyncFromTakeoff}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Sync from Take-off
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <InputField label="Elevation (ft)" id="climb-elev" value={inputs.elevation}
            onChange={(v) => onUpdate('elevation', v)} />
          <InputField label="QNH (hPa)" id="climb-qnh" value={inputs.qnh} step={0.01}
            onChange={(v) => onUpdate('qnh', v)} />
          <InputField label="OAT (°C)" id="climb-oat" value={inputs.oat}
            onChange={(v) => onUpdate('oat', v)} />
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
        onChange={(e) => { const n = Number(e.target.value); onChange(e.target.value === '' || !Number.isFinite(n) ? 0 : n); }}
      />
    </div>
  );
}
