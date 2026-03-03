import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TakeoffResult, CorrectionStep } from '@/lib/types';

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
            <div className="text-xs text-muted-foreground">Correction Factors Applied (AFM 5.3.7)</div>

            <div className="text-sm">
              <span className="text-muted-foreground">Base from AFM table: </span>
              Ground roll {Math.round(result.interpolation.baseGr)} m, 50 ft distance {Math.round(result.interpolation.baseD50)} m
            </div>

            {result.corrections.map((step, i) => {
              const prevGr = i === 0 ? result.interpolation.baseGr : result.corrections[i - 1].grAfter;
              const prevD50 = i === 0 ? result.interpolation.baseD50 : result.corrections[i - 1].d50After;

              return (
                <CorrectionExplanation
                  key={i}
                  step={step}
                  prevGr={prevGr}
                  prevD50={prevD50}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CorrectionExplanation({ step, prevGr, prevD50 }: {
  step: CorrectionStep; prevGr: number; prevD50: number;
}) {
  const grDiff = Math.round(step.grAfter) - Math.round(prevGr);
  const d50Diff = Math.round(step.d50After) - Math.round(prevD50);

  // Build AFM reference and explanation based on the correction type
  const explanation = buildExplanation(step, prevGr, prevD50);

  return (
    <div className="text-sm space-y-0.5">
      <div>
        <span className="text-muted-foreground">{step.label}: </span>
        <span className="text-xs text-muted-foreground">{explanation.afmRule}</span>
      </div>
      <div className="pl-4 text-xs font-mono">
        {explanation.math}
      </div>
      <div className="pl-4 text-xs">
        Ground roll: {Math.round(prevGr)} {grDiff >= 0 ? '+' : ''}{grDiff} = <span className="font-mono font-medium">{Math.round(step.grAfter)} m</span>
        {' | '}
        50 ft dist: {Math.round(prevD50)} {d50Diff >= 0 ? '+' : ''}{d50Diff} = <span className="font-mono font-medium">{Math.round(step.d50After)} m</span>
      </div>
    </div>
  );
}

function buildExplanation(step: CorrectionStep, prevGr: number, prevD50: number): { afmRule: string; math: string } {
  const label = step.label;

  if (label.startsWith('Grass dry')) {
    const pct = step.factor != null ? Math.round((step.factor - 1) * 100) : 0;
    return {
      afmRule: `AFM: "${label}" — increase ground roll by ${pct}%`,
      math: `GR × ${step.factor?.toFixed(2)} = ${Math.round(prevGr)} × ${step.factor?.toFixed(2)} = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label.includes('Grass wet')) {
    return {
      afmRule: 'AFM: "Grass runway, wet" — increase dry grass ground roll by 20%',
      math: `GR × 1.20 = ${Math.round(prevGr)} × 1.20 = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label === 'Soft ground') {
    return {
      afmRule: 'AFM: "Soft ground" — increase ground roll by 50% (in addition to grass correction)',
      math: `GR × 1.50 = ${Math.round(prevGr)} × 1.50 = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label.includes('Uphill slope')) {
    return {
      afmRule: 'AFM: "Uphill slope" — increase ground roll by 15% for each 1% slope',
      math: `GR × ${step.factor?.toFixed(2)} = ${Math.round(prevGr)} × ${step.factor?.toFixed(2)} = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label.includes('Headwind')) {
    const hw = parseFloat(label.replace(/[^0-9.]/g, ''));
    return {
      afmRule: 'AFM: "Headwind" — decrease by 10% for each 12 kt (50% safety factor built in)',
      math: `Factor = 1 − 0.10 × (${hw.toFixed(1)} / 12) = ${step.factor?.toFixed(3)}. Both GR and D50 × ${step.factor?.toFixed(3)}`,
    };
  }

  if (label.includes('Tailwind')) {
    const tw = parseFloat(label.replace(/[^0-9.]/g, ''));
    return {
      afmRule: 'AFM: "Tailwind" — increase by 10% for each 2 kt (150% safety factor built in)',
      math: `Factor = 1 + 0.10 × (${tw.toFixed(1)} / 2) = ${step.factor?.toFixed(3)}. Both GR and D50 × ${step.factor?.toFixed(3)}`,
    };
  }

  if (label === 'No wheel fairings') {
    return {
      afmRule: 'AFM: "Without wheel fairings" — GR +20 m, D50 +30 m',
      math: `GR: ${Math.round(prevGr)} + 20 = ${Math.round(step.grAfter)} m. D50: ${Math.round(prevD50)} + 30 = ${Math.round(step.d50After)} m`,
    };
  }

  // Fallback
  return {
    afmRule: '',
    math: step.factor != null
      ? `× ${step.factor.toFixed(2)}`
      : `+${step.addGr} / +${step.addD50}`,
  };
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
