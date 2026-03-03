import { useState } from 'react';
import { useTakeoff } from '@/hooks/useTakeoff';
import { AircraftConfigStrip } from './AircraftConfigStrip';
import { AerodromeSelector } from './AerodromeSelector';
import { TakeoffInputsPanel } from './TakeoffInputs';
import { DerivedConditions } from './DerivedConditions';
import { TakeoffResultsPanel } from './TakeoffResults';
import { RunwayDiagram } from './RunwayDiagram';
import { ShowWorking } from './ShowWorking';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function TakeoffSection() {
  const { inputs, updateInput, result } = useTakeoff();

  const [isOpen, setIsOpen] = useState(true);
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const showDiagram = inputs.tora > 0 && !hasNa;

  return (
    <section className="space-y-4">
      <button
        type="button"
        className="flex items-center gap-2 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <h2 className="text-lg font-semibold">Take-off Performance</h2>
      </button>

      {isOpen && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <AircraftConfigStrip
                mass={inputs.mass}
                onMassChange={(v) => updateInput('mass', v)}
                wheelFairings={inputs.wheelFairings}
                onWheelFairingsChange={(v) => updateInput('wheelFairings', v)}
              />
              <AerodromeSelector inputs={inputs} onUpdate={updateInput} />
            </div>
            <div className="space-y-4">
              <TakeoffInputsPanel inputs={inputs} onUpdate={updateInput} />
              <DerivedConditions result={result} />
            </div>
          </div>

          <TakeoffResultsPanel result={result} inputs={inputs} />

          {showDiagram && (
            <RunwayDiagram inputs={inputs} result={result} />
          )}

          <ShowWorking result={result} inputs={inputs} />
        </div>
      )}
    </section>
  );
}
