import { useLanding } from '@/hooks/useLanding';
import { LandingInputsPanel } from './LandingInputs';
import { LandingResultsPanel } from './LandingResults';
import { LandingShowWorking } from './LandingShowWorking';

export function LandingSection() {
  const { inputs, updateInput, syncFromTakeoff, result } = useLanding();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LandingInputsPanel
          inputs={inputs}
          onUpdate={updateInput}
          onSyncFromTakeoff={syncFromTakeoff}
        />
        <LandingResultsPanel result={result} inputs={inputs} />
      </div>
      <LandingShowWorking result={result} inputs={inputs} />
    </div>
  );
}
