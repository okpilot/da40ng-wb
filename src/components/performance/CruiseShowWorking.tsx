import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CruiseResult, CruiseInputs } from '@/lib/types';

interface CruiseShowWorkingProps {
  result: CruiseResult;
  inputs: CruiseInputs;
}

export function CruiseShowWorking({ result, inputs }: CruiseShowWorkingProps) {
  const [open, setOpen] = useState(false);
  const interp = result.interpolation;

  return (
    <Card className="py-3">
      <CardHeader className="pb-0 pt-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="w-full text-left"
        >
          <CardTitle className="text-sm flex items-center gap-1">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Calculation Breakdown
          </CardTitle>
        </button>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 pt-3">
          {/* Derived conditions */}
          <section>
            <SectionTitle>Derived Conditions</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs font-mono">
              <Step label="Cruise altitude" value={`${inputs.cruiseAltitude} ft`} />
              <Step label="QNH" value={`${inputs.qnh} hPa`} />
              <Step label="Pressure altitude" value={`${inputs.cruiseAltitude} + 30 × (1013 − ${inputs.qnh}) = ${Math.round(result.pressureAltitude)} ft`} />
              <Step label="ISA temperature" value={`15 − 2 × (${Math.round(result.pressureAltitude)}/1000) = ${result.isaTemperature.toFixed(1)}°C`} />
              <Step label="ISA deviation" value={`${inputs.oat} − ${result.isaTemperature.toFixed(1)} = ${result.isaDeviation > 0 ? '+' : ''}${result.isaDeviation.toFixed(1)}°C`} />
              <Step label="Density altitude" value={`${Math.round(result.densityAltitude)} ft`} />
            </div>
          </section>

          {/* Interpolation */}
          {interp && (
            <section>
              <SectionTitle>AFM 5.3.11 Interpolation — {inputs.power}% Power</SectionTitle>
              <div className="space-y-2 text-xs font-mono">
                {/* PA bracket */}
                <div>
                  <span className="text-muted-foreground">PA bracket: </span>
                  {interp.lowerPa === interp.upperPa ? (
                    <span>Exact match at {interp.lowerPa} ft</span>
                  ) : (
                    <span>{interp.lowerPa} ft — {interp.upperPa} ft (fraction: {interp.paFraction.toFixed(3)})</span>
                  )}
                </div>

                {/* ISA deviation bracket */}
                <div>
                  <span className="text-muted-foreground">ISA dev bracket: </span>
                  {interp.lowerIsaDev === interp.upperIsaDev ? (
                    <span>Exact match at ISA{interp.lowerIsaDev >= 0 ? '+' : ''}{interp.lowerIsaDev}</span>
                  ) : (
                    <span>ISA{interp.lowerIsaDev >= 0 ? '+' : ''}{interp.lowerIsaDev} — ISA+{interp.upperIsaDev} (fraction: {interp.isaDevFraction.toFixed(3)})</span>
                  )}
                </div>

                {/* Corner values */}
                <div className="mt-2">
                  <span className="text-muted-foreground">Corner values (ff / TAS):</span>
                  <div className="grid grid-cols-2 gap-1 mt-1 pl-2">
                    <div>PA {interp.lowerPa}, ISA{interp.lowerIsaDev >= 0 ? '+' : ''}{interp.lowerIsaDev}: {interp.corners[0].ff}/{interp.corners[0].tas}</div>
                    <div>PA {interp.lowerPa}, ISA+{interp.upperIsaDev}: {interp.corners[1].ff}/{interp.corners[1].tas}</div>
                    <div>PA {interp.upperPa}, ISA{interp.lowerIsaDev >= 0 ? '+' : ''}{interp.lowerIsaDev}: {interp.corners[2].ff}/{interp.corners[2].tas}</div>
                    <div>PA {interp.upperPa}, ISA+{interp.upperIsaDev}: {interp.corners[3].ff}/{interp.corners[3].tas}</div>
                  </div>
                </div>

                {/* Result */}
                <div className="mt-2 pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground">Interpolated: </span>
                    FF = {interp.baseFf.toFixed(2)} USG/h, TAS = {interp.baseTas.toFixed(1)} kt
                  </div>
                  {!inputs.wheelFairings && (
                    <div className="text-amber-500 mt-1">
                      Without fairings: TAS × 0.96 = {(interp.baseTas * 0.96).toFixed(1)} kt
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{children}</h4>;
}

function Step({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
