import { useState } from 'react';
import { useTakeoff } from '@/hooks/useTakeoff';
import { AircraftConfigStrip } from './AircraftConfigStrip';
import { AerodromeSelector } from './AerodromeSelector';
import { TakeoffInputsPanel } from './TakeoffInputs';
import { DerivedConditions } from './DerivedConditions';
import { TakeoffResultsPanel } from './TakeoffResults';
import { RunwayDiagram } from './RunwayDiagram';
import { ShowWorking } from './ShowWorking';
import { CatFactors } from './CatFactors';

export function TakeoffSection() {
  const { inputs, updateInput, resetInputs, result } = useTakeoff();

  const [departureLabel, setDepartureLabel] = useState('Full length');
  const [fullRunwayTora, setFullRunwayTora] = useState(0);
  const [runwayDesignator, setRunwayDesignator] = useState('');
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const showDiagram = inputs.tora > 0 && !hasNa;

  const handleDepartureChange = (label: string, fullTora: number) => {
    setDepartureLabel(label);
    setFullRunwayTora(fullTora);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <AircraftConfigStrip
            mass={inputs.mass}
            onMassChange={(v) => updateInput('mass', v)}
            wheelFairings={inputs.wheelFairings}
            onWheelFairingsChange={(v) => updateInput('wheelFairings', v)}
          />
          <AerodromeSelector
            inputs={inputs}
            onUpdate={updateInput}
            onDepartureChange={handleDepartureChange}
            onDesignatorChange={setRunwayDesignator}
          />
        </div>
        <div className="space-y-4">
          <TakeoffInputsPanel inputs={inputs} onUpdate={updateInput} />
          <DerivedConditions result={result} />
        </div>
      </div>

      <TakeoffResultsPanel result={result} inputs={inputs} departureLabel={departureLabel} />

      {showDiagram && (
        <RunwayDiagram
          inputs={inputs}
          result={result}
          departureLabel={departureLabel}
          fullRunwayTora={fullRunwayTora}
          runwayDesignator={runwayDesignator}
        />
      )}

      <CatFactors
        result={result}
        inputs={inputs}
        departureLabel={departureLabel}
        fullRunwayTora={fullRunwayTora}
        runwayDesignator={runwayDesignator}
      />

      <ShowWorking result={result} inputs={inputs} />
    </div>
  );
}
