import { useCruise } from '@/hooks/useCruise';
import { CruiseInputsPanel } from './CruiseInputs';
import { CruiseAdvisoryData } from './CruiseAdvisoryData';
import { CruiseResultsPanel } from './CruiseResults';
import { CruiseShowWorking } from './CruiseShowWorking';

export function CruiseSection() {
  const { inputs, updateInput, syncFromClimb, result } = useCruise();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CruiseInputsPanel
          inputs={inputs}
          onUpdate={updateInput}
          onSyncFromClimb={syncFromClimb}
        />
        <div className="space-y-4">
          <CruiseAdvisoryData result={result} inputs={inputs} onUpdate={updateInput} />
        </div>
      </div>

      <CruiseResultsPanel result={result} inputs={inputs} />
      <CruiseShowWorking result={result} inputs={inputs} />
    </div>
  );
}
