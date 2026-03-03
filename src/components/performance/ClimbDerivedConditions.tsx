import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClimbResult } from '@/lib/types';

interface ClimbDerivedConditionsProps {
  result: ClimbResult;
}

export function ClimbDerivedConditions({ result }: ClimbDerivedConditionsProps) {
  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Derived Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <DataCell label="Pressure Altitude" value={`${Math.round(result.pressureAltitude)} ft`} />
          <DataCell label="Density Altitude" value={`${Math.round(result.densityAltitude)} ft`} />
          <DataCell label="ISA Temperature" value={`${result.isaTemperature.toFixed(1)} °C`} />
          <DataCell
            label="ISA Deviation"
            value={`${result.isaDeviation >= 0 ? '+' : ''}${result.isaDeviation.toFixed(1)} °C`}
          />
          <DataCell label="Cruise PA" value={`${Math.round(result.cruisePa)} ft`} />
        </div>
      </CardContent>
    </Card>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-mono">{value}</div>
    </div>
  );
}
