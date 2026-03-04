import { useClimb } from '@/hooks/useClimb';
import { AircraftConfigStrip } from './AircraftConfigStrip';
import { ClimbInputsPanel } from './ClimbInputs';
import { ClimbParameters } from './ClimbParameters';
import { ClimbAdvisoryData } from './ClimbDerivedConditions';
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
            tourId="cl-aircraft-config"
          />
          <ClimbInputsPanel
            inputs={inputs}
            onUpdate={updateInput}
            onSyncFromTakeoff={syncFromTakeoff}
          />
          <ClimbParameters inputs={inputs} onUpdate={updateInput} />
        </div>
        <div className="space-y-4">
          <ClimbAdvisoryData result={result} inputs={inputs} />
        </div>
      </div>

      <ClimbResultsPanel result={result} />
      <ClimbProfileDiagram result={result} inputs={inputs} />

      <ClimbShowWorking result={result} inputs={inputs} />
    </div>
  );
}
