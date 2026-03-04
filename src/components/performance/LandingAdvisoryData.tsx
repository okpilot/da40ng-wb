import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LandingResult, LandingInputs, LandingCorrectionStep } from '@/lib/types';

interface LandingAdvisoryDataProps {
  result: LandingResult;
  inputs: LandingInputs;
}

export function LandingAdvisoryData({ result, inputs }: LandingAdvisoryDataProps) {
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
            <div className="text-xs text-muted-foreground">
              Correction Factors Applied (AFM {inputs.flap === 'LDG' ? '5.3.12' : '5.3.13'})
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Base from AFM table: </span>
              GR {Math.round(result.interpolation.baseGr)} m, D50 {Math.round(result.interpolation.baseD50)} m
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
  step: LandingCorrectionStep; prevGr: number; prevD50: number;
}) {
  const grDiff = Math.round(step.grAfter) - Math.round(prevGr);
  const d50Diff = Math.round(step.d50After) - Math.round(prevD50);
  const explanation = buildExplanation(step, prevGr);

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
        GR: {Math.round(prevGr)} {grDiff >= 0 ? '+' : ''}{grDiff} = <span className="font-mono font-medium">{Math.round(step.grAfter)} m</span>
        {' | '}
        D50: {Math.round(prevD50)} {d50Diff >= 0 ? '+' : ''}{d50Diff} = <span className="font-mono font-medium">{Math.round(step.d50After)} m</span>
      </div>
    </div>
  );
}

function buildExplanation(step: LandingCorrectionStep, prevGr: number): { afmRule: string; math: string } {
  const label = step.label;

  if (label.startsWith('Grass dry')) {
    const pct = step.factor != null ? Math.round((step.factor - 1) * 100) : 0;
    return {
      afmRule: `Increase ground roll by ${pct}%`,
      math: `GR × ${step.factor?.toFixed(2)} = ${Math.round(prevGr)} × ${step.factor?.toFixed(2)} = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label.includes('Grass wet')) {
    return {
      afmRule: 'Increase dry grass ground roll by 15%',
      math: `GR × 1.15 = ${Math.round(prevGr)} × 1.15 = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label.includes('Downhill slope')) {
    return {
      afmRule: 'Increase ground roll by 10% per 1% downhill slope',
      math: `GR × ${step.factor?.toFixed(2)} = ${Math.round(prevGr)} × ${step.factor?.toFixed(2)} = ${Math.round(step.grAfter)} m (air segment unchanged)`,
    };
  }

  if (label.includes('Paved wet')) {
    return {
      afmRule: 'Increase both GR and D50 by 15%',
      math: `Both × 1.15`,
    };
  }

  if (label.includes('Headwind')) {
    return {
      afmRule: 'Decrease by 10% per 20 kt (50% safety factor built in)',
      math: `Factor = ${step.factor?.toFixed(3)}. Both GR and D50 × ${step.factor?.toFixed(3)}`,
    };
  }

  if (label.includes('Tailwind')) {
    return {
      afmRule: 'Increase by 10% per 3 kt (150% safety factor built in)',
      math: `Factor = ${step.factor?.toFixed(3)}. Both GR and D50 × ${step.factor?.toFixed(3)}`,
    };
  }

  return {
    afmRule: '',
    math: step.factor != null ? `× ${step.factor.toFixed(2)}` : '',
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
