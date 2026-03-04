import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CruiseResult, CruiseInputs, CruiseIsaDev } from '@/lib/types';
import { cruisePerformanceTable } from '@/data/performance/cruisePerformance';

const ISA_DEVS: CruiseIsaDev[] = [-10, 0, 10, 30];

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

          {/* AFM table */}
          {interp && (
            <section>
              <SectionTitle>AFM 5.3.11 — Cruise Performance at {inputs.power}% Power</SectionTitle>
              <AfmTable
                power={inputs.power}
                highlightPaLow={interp.lowerPa}
                highlightPaHigh={interp.upperPa}
                highlightIsaDevLow={interp.lowerIsaDev}
                highlightIsaDevHigh={interp.upperIsaDev}
              />
            </section>
          )}

          {/* Interpolation */}
          {interp && (
            <section>
              <SectionTitle>Interpolation</SectionTitle>
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
                  <span className="text-muted-foreground">Corner values (FF / TAS):</span>
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

          {/* Range & endurance */}
          {interp && (
            <section>
              <SectionTitle>Range & Endurance (Total)</SectionTitle>
              <div className="space-y-1 text-xs font-mono">
                <Step label="Usable fuel" value={`${inputs.usableFuelUsg} USG`} />
                <Step label="Endurance" value={`${inputs.usableFuelUsg} / ${result.fuelFlow.toFixed(2)} = ${result.endurance.toFixed(2)} h`} />
                <Step label="Range" value={`${result.endurance.toFixed(2)} × ${Math.round(result.tas)} = ${Math.round(result.range)} NM`} />
              </div>
            </section>
          )}

          {/* Fuel planning */}
          {interp && (
            <section>
              <SectionTitle>Fuel Planning</SectionTitle>
              <div className="space-y-1 text-xs font-mono">
                <Step label="Final reserve" value={`${inputs.reserveMinutes} min × (4.0 USG/h / 60) = ${result.reserveFuelUsg.toFixed(1)} USG`} />
                {inputs.alternateDistance > 0 ? (
                  <>
                    <Step label="Alternate distance" value={`${inputs.alternateDistance} NM at ${inputs.alternateAltitude} ft`} />
                    <Step label="Alternate TAS / FF" value={`${Math.round(result.alternateTas)} kt / ${result.alternateFf.toFixed(1)} USG/h`} />
                    <Step label="Alternate time" value={`${inputs.alternateDistance} / ${Math.round(result.alternateTas)} = ${result.alternateTas > 0 ? (inputs.alternateDistance / result.alternateTas).toFixed(2) : '0'} h`} />
                    <Step label="Alternate fuel" value={`${result.alternateFuelUsg.toFixed(1)} USG`} />
                  </>
                ) : (
                  <Step label="Alternate" value="None" />
                )}
                <div className="mt-1 pt-1 border-t font-semibold">
                  <Step label="Trip fuel" value={`${inputs.usableFuelUsg} − ${result.reserveFuelUsg.toFixed(1)} − ${result.alternateFuelUsg.toFixed(1)} = ${result.tripFuel.toFixed(1)} USG`} />
                  <Step label="Trip endurance" value={`${result.tripFuel.toFixed(1)} / ${result.fuelFlow.toFixed(2)} = ${result.enduranceWithAll.toFixed(2)} h`} />
                  <Step label="Trip range" value={`${result.enduranceWithAll.toFixed(2)} × ${Math.round(result.tas)} = ${Math.round(result.rangeWithAll)} NM`} />
                </div>
              </div>
            </section>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── AFM table display ────────────────────────────────────────────

function AfmTable({ power, highlightPaLow, highlightPaHigh, highlightIsaDevLow, highlightIsaDevHigh }: {
  power: number;
  highlightPaLow: number;
  highlightPaHigh: number;
  highlightIsaDevLow: number;
  highlightIsaDevHigh: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="text-xs font-semibold mb-1">
        1310 kg — Flaps UP — {power}% Power
      </div>
      <table className="text-[11px] border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-1.5 py-1 bg-muted text-left">PA (ft)</th>
            {ISA_DEVS.map((d) => (
              <th
                key={d}
                className={`border px-1.5 py-1 text-center ${
                  d >= highlightIsaDevLow && d <= highlightIsaDevHigh ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted'
                }`}
              >
                ISA{d >= 0 ? '+' : ''}{d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cruisePerformanceTable.rows.map((row) => {
            const pa = row.pressureAltitude;
            const isHighlightedPa = pa >= highlightPaLow && pa <= highlightPaHigh;
            return (
              <tr key={pa}>
                <td className={`border px-1.5 py-0.5 font-mono font-medium ${isHighlightedPa ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                  {pa.toLocaleString()}
                </td>
                {ISA_DEVS.map((d) => {
                  const cell = row.data[d][power as keyof typeof row.data[typeof d]];
                  const isHighlighted = isHighlightedPa && d >= highlightIsaDevLow && d <= highlightIsaDevHigh;
                  return (
                    <td
                      key={d}
                      className={`border px-1.5 py-0.5 font-mono text-center ${
                        isHighlighted ? 'bg-blue-200 dark:bg-blue-800/50 font-semibold' : ''
                      }`}
                    >
                      {cell.ff}<br />
                      <span className="text-muted-foreground">{cell.tas}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-[10px] text-muted-foreground mt-1">Top = fuel flow (USG/h), bottom = TAS (kt)</div>
    </div>
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
