import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClimbResult, ClimbInputs } from '@/lib/types';

interface ClimbAdvisoryDataProps {
  result: ClimbResult;
  inputs: ClimbInputs;
}

export function ClimbAdvisoryData({ result, inputs }: ClimbAdvisoryDataProps) {
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));
  const seg = result.climbSegment;
  const isaAbove = result.isaDeviation > 0;

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="text-sm">Correction Factors Applied</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasNa && (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">AFM assumes: </span>
              ISA conditions, paved/level, wheel fairings installed
            </div>

            {/* Wheel fairings */}
            <div className="text-sm space-y-0.5">
              <div>
                <span className="text-muted-foreground">Wheel fairings: </span>
                {inputs.wheelFairings ? (
                  <span>Installed — no correction</span>
                ) : (
                  <span className="text-amber-500">Not installed</span>
                )}
              </div>
              {!inputs.wheelFairings && (
                <div className="pl-4 text-xs font-mono">
                  T/O climb ROC −20 fpm (AFM 5.3.8) | Cruise climb ROC −40 fpm (AFM 5.3.9)
                </div>
              )}
            </div>

            {/* ISA correction for time/fuel/distance */}
            {seg && (
              <div className="text-sm space-y-0.5">
                <div>
                  <span className="text-muted-foreground">ISA correction (5.3.10): </span>
                  {isaAbove ? (
                    <span className="text-amber-500">
                      ISA +{result.isaDeviation.toFixed(1)}°C
                    </span>
                  ) : (
                    <span>At or below ISA — no correction</span>
                  )}
                </div>
                {isaAbove && (
                  <div className="pl-4 text-xs font-mono">
                    Time & fuel ×{seg.isaTimeFuelFactor.toFixed(3)} | Distance ×{seg.isaDistanceFactor.toFixed(3)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

