import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TakeoffResult } from '@/lib/types';

interface DerivedConditionsProps {
  result: TakeoffResult;
}

export function DerivedConditions({ result }: DerivedConditionsProps) {
  const tailwind = result.headwind < 0;
  const xwExceed = result.crosswind > 25;
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Advisory Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <Item label="Press. Alt." value={`${Math.round(result.pressureAltitude)} ft`} />
          <Item label="Density Alt." value={`${Math.round(result.densityAltitude)} ft`} />
          <Item label="ISA Temp" value={`${result.isaTemperature.toFixed(1)} °C`} />
          <Item label="ISA Dev." value={`${result.isaDeviation >= 0 ? '+' : ''}${result.isaDeviation.toFixed(1)} °C`} />
          <Item
            label={tailwind ? 'Tailwind' : 'Headwind'}
            value={`${Math.abs(result.headwind).toFixed(1)} kt`}
            warn={tailwind}
          />
          <Item
            label="Crosswind"
            value={`${result.crosswind.toFixed(1)} kt`}
            warn={xwExceed}
            warnLabel={xwExceed ? '> MAX' : undefined}
          />
        </div>

        {/* Correction factors */}
        {!hasNa && result.corrections.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-1">Correction factors applied</div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
              <Item label="Base (AFM)" value={`GR ${Math.round(result.interpolation.baseGr)} / D50 ${Math.round(result.interpolation.baseD50)}`} />
              {result.corrections.map((step, i) => (
                <Item
                  key={i}
                  label={step.label}
                  value={step.factor != null ? `×${step.factor.toFixed(2)}` : `+${step.addGr} / +${step.addD50}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Item({
  label,
  value,
  warn,
  warnLabel,
}: {
  label: string;
  value: string;
  warn?: boolean;
  warnLabel?: string;
}) {
  return (
    <div className="flex justify-between items-baseline py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-medium ${warn ? 'text-amber-500' : ''}`}>
        {value}
        {warnLabel && <span className="text-[10px] ml-1">{warnLabel}</span>}
      </span>
    </div>
  );
}
