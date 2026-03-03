import { useClimb } from '@/hooks/useClimb';
import { AircraftConfigStrip } from './AircraftConfigStrip';
import { ClimbInputsPanel } from './ClimbInputs';
import { ClimbParameters } from './ClimbParameters';
import { ClimbDerivedConditions } from './ClimbDerivedConditions';
import { ClimbResultsPanel } from './ClimbResults';
import { ClimbProfileDiagram } from './ClimbProfileDiagram';
import { ClimbShowWorking } from './ClimbShowWorking';

export function ClimbSection() {
  const { inputs, updateInput, syncFromTakeoff, result } = useClimb();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <AircraftConfigStrip
            mass={inputs.mass}
            onMassChange={(v) => updateInput('mass', v)}
            wheelFairings={inputs.wheelFairings}
            onWheelFairingsChange={(v) => updateInput('wheelFairings', v)}
            flapsLabel="T/O → UP"
            fairingsPenalty="ROC −20/−40 fpm"
          />
          <ClimbInputsPanel
            inputs={inputs}
            onUpdate={updateInput}
            onSyncFromTakeoff={syncFromTakeoff}
          />
        </div>
        <div className="space-y-4">
          <ClimbParameters inputs={inputs} onUpdate={updateInput} />
          <ClimbDerivedConditions result={result} />
        </div>
      </div>

      <ClimbResultsPanel result={result} />
      <ClimbProfileDiagram result={result} />

      <ClimbShowWorking result={result} inputs={inputs} />
    </div>
  );
}
