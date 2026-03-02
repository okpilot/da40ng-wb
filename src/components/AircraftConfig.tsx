import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { da40ng } from '@/data/da40ng';
import { calculateMoment } from '@/lib/calculations';
import type { AircraftConfig as AircraftConfigType, ModificationId, TankConfig } from '@/lib/types';

interface Props {
  config: AircraftConfigType;
  onBemMassChange: (mass: number) => void;
  onBemCgChange: (cg: number) => void;
  onToggleMod: (modId: ModificationId) => void;
  onTankChange: (tank: TankConfig) => void;
}

export function AircraftConfig({
  config,
  onBemMassChange,
  onBemCgChange,
  onToggleMod,
  onTankChange,
}: Props) {
  const bemMoment = calculateMoment(config.bemMass, config.bemCg);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Aircraft Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: BEM + Tank */}
          <div className="space-y-4">
            <div className="space-y-2" data-tour="bem-inputs">
              <Label className="text-sm font-medium text-muted-foreground">
                Basic Empty Mass
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="bem-mass" className="text-xs">Mass (kg)</Label>
                  <Input
                    id="bem-mass"
                    type="number"
                    step="0.1"
                    value={config.bemMass || ''}
                    onChange={(e) => onBemMassChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="bem-cg" className="text-xs">CG (m)</Label>
                  <Input
                    id="bem-cg"
                    type="number"
                    step="0.001"
                    value={config.bemCg || ''}
                    onChange={(e) => onBemCgChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Moment (kgm)</Label>
                  <Input
                    value={bemMoment.toFixed(1)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2" data-tour="tank-config">
              <Label className="text-sm font-medium text-muted-foreground">
                Fuel Tank Configuration
              </Label>
              <ToggleGroup
                type="single"
                value={config.tankConfig}
                onValueChange={(v) => { if (v) onTankChange(v as TankConfig); }}
                className="justify-start"
              >
                <ToggleGroupItem value="standard" className="text-sm">
                  Standard (28 USG / 106 L)
                </ToggleGroupItem>
                <ToggleGroupItem value="long-range" className="text-sm">
                  Long Range (39 USG / 148 L)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Right: Modifications */}
          <div className="space-y-2" data-tour="modifications">
            <Label className="text-sm font-medium text-muted-foreground">
              Modifications
            </Label>
            <div className="space-y-2">
              {da40ng.modifications.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium">{mod.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {mod.description}
                    </span>
                  </div>
                  <Switch
                    checked={config.activeMods.has(mod.id)}
                    onCheckedChange={() => onToggleMod(mod.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
