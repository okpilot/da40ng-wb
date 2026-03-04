import { useClimb } from '@/hooks/useClimb';
import { useCruise } from '@/hooks/useCruise';
import { CruiseInputsPanel } from './CruiseInputs';
import { CruiseAdvisoryData } from './CruiseAdvisoryData';
import { CruiseResultsPanel } from './CruiseResults';
import { CruiseShowWorking } from './CruiseShowWorking';

export function CruiseSection() {
  const { inputs: climbInputs, result: climbResult } = useClimb();
  const climbSegment = climbResult.climbSegment;
  const { inputs, updateInput, result } = useCruise(climbSegment, climbInputs);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CruiseInputsPanel
          inputs={inputs}
          onUpdate={updateInput}
        />
        <div className="space-y-4">
          <CruiseAdvisoryData
            result={result}
            inputs={inputs}
            onUpdate={updateInput}
            climbSegment={climbSegment}
          />
        </div>
      </div>

      <CruiseResultsPanel result={result} inputs={inputs} />
      <CruiseShowWorking result={result} inputs={inputs} climbSegment={climbSegment} />
    </div>
  );
}
