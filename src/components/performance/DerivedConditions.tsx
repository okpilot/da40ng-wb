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
      <CardContent className="space-y-3">
        {/* Derived values */}
        <div className="grid grid-cols-3 gap-3">
          <DataCell label="Pressure Altitude" value={`${Math.round(result.pressureAltitude)} ft`} />
          <DataCell label="Density Altitude" value={`${Math.round(result.densityAltitude)} ft`} />
          <DataCell label="ISA Temperature" value={`${result.isaTemperature.toFixed(1)} °C`} />
          <DataCell
            label="ISA Deviation"
            value={`${result.isaDeviation >= 0 ? '+' : ''}${result.isaDeviation.toFixed(1)} °C`}
          />
          <DataCell
            label={tailwind ? 'Tailwind' : 'Headwind'}
            value={`${Math.abs(result.headwind).toFixed(1)} kt`}
            warn={tailwind}
          />
          <DataCell
            label="Crosswind"
            value={`${result.crosswind.toFixed(1)} kt`}
            warn={xwExceed}
            note={xwExceed ? 'Exceeds max demo 25 kt' : undefined}
          />
        </div>

        {/* Correction factors */}
        {!hasNa && result.corrections.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <div className="text-xs text-muted-foreground">Correction Factors Applied</div>

            {/* Base from AFM */}
            <div className="text-sm">
              <span className="text-muted-foreground">Base from AFM table: </span>
              Ground roll {Math.round(result.interpolation.baseGr)} m, 50 ft distance {Math.round(result.interpolation.baseD50)} m
            </div>

            {/* Each correction step */}
            {result.corrections.map((step, i) => {
              const prevGr = i === 0 ? result.interpolation.baseGr : result.corrections[i - 1].grAfter;
              const prevD50 = i === 0 ? result.interpolation.baseD50 : result.corrections[i - 1].d50After;
              const grDiff = Math.round(step.grAfter) - Math.round(prevGr);
              const d50Diff = Math.round(step.d50After) - Math.round(prevD50);

              return (
                <div key={i} className="text-sm">
                  <span className="text-muted-foreground">{step.label}: </span>
                  {step.factor != null ? (
                    <>factor {step.factor.toFixed(2)} applied — ground roll {grDiff >= 0 ? '+' : ''}{grDiff} m = {Math.round(step.grAfter)} m, 50 ft distance {d50Diff >= 0 ? '+' : ''}{d50Diff} m = {Math.round(step.d50After)} m</>
                  ) : (
                    <>ground roll +{step.addGr} m = {Math.round(step.grAfter)} m, 50 ft distance +{step.addD50} m = {Math.round(step.d50After)} m</>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DataCell({ label, value, warn, note }: {
  label: string; value: string; warn?: boolean; note?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-mono ${warn ? 'text-amber-500' : ''}`}>{value}</div>
      {note && <div className="text-xs text-destructive">{note}</div>}
    </div>
  );
}
