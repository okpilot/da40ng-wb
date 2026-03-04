import { useState } from 'react';
import { useLanding } from '@/hooks/useLanding';
import { LandingConfigPanel, LandingWeatherPanel } from './LandingInputs';
import { LandingAerodromeSelector } from './LandingAerodromeSelector';
import { LandingAdvisoryData } from './LandingAdvisoryData';
import { LandingResultsPanel } from './LandingResults';
import { LandingRunwayDiagram } from './LandingRunwayDiagram';
import { LandingShowWorking } from './LandingShowWorking';

export function LandingSection() {
  const { inputs, updateInput, syncFromTakeoff, result } = useLanding();
  const [designator, setDesignator] = useState('');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Aircraft config + Aerodrome/Runway + Weather */}
        <div className="space-y-4">
          <LandingConfigPanel inputs={inputs} onUpdate={updateInput} />
          <LandingAerodromeSelector
            inputs={inputs}
            onUpdate={updateInput}
            onSyncFromTakeoff={syncFromTakeoff}
            onDesignatorChange={setDesignator}
          />
          <LandingWeatherPanel inputs={inputs} onUpdate={updateInput} />
        </div>
        {/* Right: Advisory */}
        <div className="space-y-4">
          <LandingAdvisoryData result={result} inputs={inputs} />
        </div>
      </div>

      <LandingResultsPanel result={result} inputs={inputs} />
      <LandingRunwayDiagram result={result} inputs={inputs} designator={designator} />
      <LandingShowWorking result={result} inputs={inputs} />
    </div>
  );
}
