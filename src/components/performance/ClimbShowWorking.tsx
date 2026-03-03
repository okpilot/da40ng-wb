import { useState } from 'react';
import type { ClimbResult, ClimbInputs, ClimbRocDetail } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ClimbShowWorkingProps {
  result: ClimbResult;
  inputs: ClimbInputs;
}

export function ClimbShowWorking({ result, inputs }: ClimbShowWorkingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  if (hasNa) return null;

  return (
    <Card>
      <button
        type="button"
        className="w-full px-6 py-4 flex items-center gap-2 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-semibold text-sm">Calculation Breakdown</span>
        <span className="text-xs text-muted-foreground ml-2">Step-by-step climb calculations</span>
      </button>

      {isOpen && (
        <CardContent className="space-y-6 pt-0">
          <BaseConditions inputs={inputs} />
          <StepByStep result={result} inputs={inputs} />
          <RocWalkthrough
            title="3. Take-Off Climb ROC (AFM 5.3.8)"
            subtitle="Flaps T/O, V_Y 72 KIAS, Power 92%"
            detail={result.takeoffClimbDetail}
            cas={72}
            fairingsLabel="20 ft/min"
            roc={result.takeoffClimbRoc}
            gradient={result.takeoffClimbGradient}
            tas={result.takeoffClimbTas}
          />
          <RocWalkthrough
            title="4. Cruise Climb ROC (AFM 5.3.9)"
            subtitle="Flaps UP, V_Y 88 KIAS, Power 92%"
            detail={result.cruiseClimbDetail}
            cas={88}
            fairingsLabel="40 ft/min"
            roc={result.cruiseClimbRoc}
            gradient={result.cruiseClimbGradient}
            tas={result.cruiseClimbTas}
          />
          {result.climbSegment && (
            <ClimbSegmentWalkthrough result={result} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold border-b pb-1 mb-3">{children}</h4>;
}

function BaseConditions({ inputs }: { inputs: ClimbInputs }) {
  return (
    <div>
      <SectionTitle>1. Base Conditions</SectionTitle>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between bg-muted rounded px-3 py-1.5">
          <span className="text-muted-foreground">AFM assumes</span>
          <span className="font-mono">ISA conditions, paved/level, wheel fairings installed</span>
        </div>
        <div className="flex justify-between bg-muted rounded px-3 py-1.5">
          <span className="text-muted-foreground">Wheel fairings</span>
          <span className={`font-mono ${!inputs.wheelFairings ? 'text-amber-500' : ''}`}>
            {inputs.wheelFairings ? 'Installed' : 'Not installed (ROC penalty applied)'}
          </span>
        </div>
      </div>
    </div>
  );
}

function StepByStep({ result, inputs }: { result: ClimbResult; inputs: ClimbInputs }) {
  const pa = result.pressureAltitude;
  const steps = [
    {
      num: 1,
      title: 'Pressure Altitude',
      formula: 'PA = elevation + 30 × (1013 − QNH)',
      calc: `PA = ${inputs.elevation} + 30 × (1013 − ${inputs.qnh}) = ${Math.round(pa)} ft`,
    },
    {
      num: 2,
      title: 'ISA Temperature',
      formula: 'T_ISA = 15 − 2 × (PA / 1000)',
      calc: `T_ISA = 15 − 2 × (${Math.round(pa)} / 1000) = ${result.isaTemperature.toFixed(1)} °C`,
    },
    {
      num: 3,
      title: 'ISA Deviation',
      formula: 'ISA dev = OAT − T_ISA',
      calc: `ISA dev = ${inputs.oat} − ${result.isaTemperature.toFixed(1)} = ${result.isaDeviation >= 0 ? '+' : ''}${result.isaDeviation.toFixed(1)} °C`,
    },
    {
      num: 4,
      title: 'Density Altitude',
      formula: 'DA = PA + 120 × (OAT − T_ISA)',
      calc: `DA = ${Math.round(pa)} + 120 × (${inputs.oat} − ${result.isaTemperature.toFixed(1)}) = ${Math.round(result.densityAltitude)} ft`,
    },
    {
      num: 5,
      title: 'Cruise Pressure Altitude',
      formula: 'Cruise PA = cruise alt + 30 × (1013 − QNH)',
      calc: `Cruise PA = ${inputs.cruiseAltitude} + 30 × (1013 − ${inputs.qnh}) = ${Math.round(result.cruisePa)} ft`,
    },
  ];

  return (
    <div>
      <SectionTitle>2. Step-by-Step Calculation</SectionTitle>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.num} className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">Step {step.num}: {step.title}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{step.formula}</div>
            <div className="text-sm font-mono mt-1">{step.calc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RocWalkthrough({ title, subtitle, detail, cas, fairingsLabel, roc, gradient, tas }: {
  title: string; subtitle: string; detail: ClimbRocDetail | null;
  cas: number; fairingsLabel: string; roc: number; gradient: number; tas: number;
}) {
  if (!detail) return null;
  const sameTable = detail.lowerWeight === detail.upperWeight;

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">{subtitle}</div>
      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Within {detail.lowerWeight} kg table
          </div>
          <div className="text-sm font-mono mt-1">
            Bilinear: PA {detail.lowerPa}–{detail.upperPa} ft ({(detail.paFraction * 100).toFixed(0)}%), OAT {detail.lowerOat}–{detail.upperOat}°C ({(detail.oatFraction * 100).toFixed(0)}%)
          </div>
          <div className="text-sm font-mono">
            ROC = {detail.lowerTableRoc.toFixed(0)} ft/min
          </div>
        </div>

        {!sameTable && (
          <>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs font-semibold text-muted-foreground">
                Within {detail.upperWeight} kg table
              </div>
              <div className="text-sm font-mono mt-1">
                ROC = {detail.upperTableRoc.toFixed(0)} ft/min
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs font-semibold text-muted-foreground">Weight interpolation</div>
              <div className="text-sm font-mono mt-1">
                {(detail.weightFraction * 100).toFixed(0)}% between {detail.lowerWeight} kg and {detail.upperWeight} kg
              </div>
              <div className="text-sm font-mono">
                Base ROC = {detail.baseRoc.toFixed(0)} ft/min
              </div>
            </div>
          </>
        )}

        {detail.fairingsPenalty > 0 && (
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">Fairings penalty</div>
            <div className="text-sm font-mono mt-1">
              ROC = {detail.baseRoc.toFixed(0)} − {detail.fairingsPenalty} = {detail.finalRoc.toFixed(0)} ft/min
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Without wheel fairings: ROC decreased by {fairingsLabel}
            </div>
          </div>
        )}

        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Gradient calculation</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            TAS = CAS × (1 + 0.02 × PA/1000) = {cas} × (1 + 0.02 × {Math.round(detail.lowerPa)}/1000) = {tas.toFixed(1)} kt
          </div>
          <div className="text-sm font-mono mt-1">
            Gradient = ROC / TAS × 0.98 = {roc} / {tas.toFixed(1)} × 0.98 = {gradient.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function ClimbSegmentWalkthrough({ result }: { result: ClimbResult }) {
  const seg = result.climbSegment!;

  return (
    <div>
      <SectionTitle>5. Time, Fuel & Distance to Climb (AFM 5.3.10)</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">Flaps UP, V_Y 88 KIAS, Power 92% — subtraction method</div>
      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Departure PA: {Math.round(seg.departurePa)} ft (cumulative from SL)
          </div>
          <div className="text-sm font-mono mt-1">
            Time: {seg.departureTime.toFixed(1)} min, Fuel: {seg.departureFuel.toFixed(2)} USG, Distance: {seg.departureDistance.toFixed(1)} NM
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Cruise PA: {Math.round(seg.cruisePa)} ft (cumulative from SL)
          </div>
          <div className="text-sm font-mono mt-1">
            Time: {seg.cruiseTime.toFixed(1)} min, Fuel: {seg.cruiseFuel.toFixed(2)} USG, Distance: {seg.cruiseDistance.toFixed(1)} NM
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Subtraction</div>
          <div className="text-sm font-mono mt-1">
            Time: {seg.cruiseTime.toFixed(1)} − {seg.departureTime.toFixed(1)} = {seg.rawTime.toFixed(1)} min
          </div>
          <div className="text-sm font-mono">
            Fuel: {seg.cruiseFuel.toFixed(2)} − {seg.departureFuel.toFixed(2)} = {seg.rawFuel.toFixed(2)} USG
          </div>
          <div className="text-sm font-mono">
            Distance: {seg.cruiseDistance.toFixed(1)} − {seg.departureDistance.toFixed(1)} = {seg.rawDistance.toFixed(1)} NM
          </div>
        </div>

        {seg.isaDev > 0 && (
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">ISA correction (ISA +{seg.isaDev.toFixed(1)}°C)</div>
            <div className="text-xs text-muted-foreground mt-1">
              Add 5% to time & fuel, 10% to distance for each 10°C above ISA
            </div>
            <div className="text-sm font-mono mt-1">
              Time & Fuel factor: ×{seg.isaTimeFuelFactor.toFixed(3)} | Distance factor: ×{seg.isaDistanceFactor.toFixed(3)}
            </div>
            <div className="text-sm font-mono">
              Time: {seg.rawTime.toFixed(1)} × {seg.isaTimeFuelFactor.toFixed(3)} = {seg.time.toFixed(1)} min
            </div>
            <div className="text-sm font-mono">
              Fuel: {seg.rawFuel.toFixed(2)} × {seg.isaTimeFuelFactor.toFixed(3)} = {seg.fuel.toFixed(2)} USG
            </div>
            <div className="text-sm font-mono">
              Distance: {seg.rawDistance.toFixed(1)} × {seg.isaDistanceFactor.toFixed(3)} = {seg.distance.toFixed(1)} NM
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm font-mono bg-primary/10 rounded px-3 py-2 font-bold">
          <span>Final</span>
          <span>
            {Math.round(seg.time)} min | {seg.fuel.toFixed(1)} USG | {Math.round(seg.distance)} NM
          </span>
        </div>
      </div>
    </div>
  );
}
