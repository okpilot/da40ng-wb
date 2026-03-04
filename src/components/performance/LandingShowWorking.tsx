import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LandingResult, LandingInputs, LandingCell } from '@/lib/types';
import { landingLdgTables } from '@/data/performance/landingDistance';
import { landingAbnormalTables } from '@/data/performance/landingDistanceAbnormal';

interface LandingShowWorkingProps {
  result: LandingResult;
  inputs: LandingInputs;
}

export function LandingShowWorking({ result, inputs }: LandingShowWorkingProps) {
  const [open, setOpen] = useState(false);
  const interp = result.interpolation;
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

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
              <Step label="Elevation" value={`${inputs.elevation} ft`} />
              <Step label="QNH" value={`${inputs.qnh} hPa`} />
              <Step label="Pressure altitude" value={`${inputs.elevation} + 30 × (1013 − ${inputs.qnh}) = ${Math.round(result.pressureAltitude)} ft`} />
              <Step label="ISA temperature" value={`15 − 2 × (${Math.round(result.pressureAltitude)}/1000) = ${result.isaTemperature.toFixed(1)}°C`} />
              <Step label="ISA deviation" value={`${inputs.oat} − ${result.isaTemperature.toFixed(1)} = ${result.isaDeviation > 0 ? '+' : ''}${result.isaDeviation.toFixed(1)}°C`} />
              <Step label="Density altitude" value={`${Math.round(result.densityAltitude)} ft`} />
              {inputs.windSpeed > 0 && (
                <>
                  <Step label="Headwind" value={`${result.headwind.toFixed(1)} kt${result.headwind < 0 ? ' (TAILWIND)' : ''}`} />
                  <Step label="Crosswind" value={`${result.crosswind.toFixed(1)} kt`} />
                </>
              )}
            </div>
          </section>

          {/* AFM table with highlights */}
          {!hasNa && (
            <section>
              <SectionTitle>
                AFM {inputs.flap === 'LDG' ? '5.3.12' : '5.3.13'} — Landing Distance ({inputs.flap === 'LDG' ? 'Flaps LDG' : `Flaps ${inputs.flap}`})
              </SectionTitle>
              <AfmTables result={result} inputs={inputs} />
            </section>
          )}

          {/* Interpolation walkthrough */}
          {!hasNa && (
            <section>
              <SectionTitle>Interpolation</SectionTitle>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">PA bracket: </span>
                  {interp.lowerPa === interp.upperPa ? (
                    <span>Exact at {interp.lowerPa} ft</span>
                  ) : (
                    <span>{interp.lowerPa}–{interp.upperPa} ft (frac: {interp.paFraction.toFixed(3)})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">OAT bracket: </span>
                  {interp.lowerOat === interp.upperOat ? (
                    <span>Exact at {interp.lowerOat}°C</span>
                  ) : (
                    <span>{interp.lowerOat}–{interp.upperOat}°C (frac: {interp.oatFraction.toFixed(3)})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Weight bracket: </span>
                  {interp.lowerWeight === interp.upperWeight ? (
                    <span>Exact at {interp.lowerWeight} kg</span>
                  ) : (
                    <span>{interp.lowerWeight}–{interp.upperWeight} kg (frac: {interp.weightFraction.toFixed(3)})</span>
                  )}
                </div>

                {/* Per-table values */}
                <div className="mt-2 pt-2 border-t">
                  <div>
                    {interp.lowerWeight} kg table → GR = {interp.lowerTableGr.toFixed(1)} m, D50 = {interp.lowerTableD50.toFixed(1)} m
                  </div>
                  {interp.lowerWeight !== interp.upperWeight && (
                    <div>
                      {interp.upperWeight} kg table → GR = {interp.upperTableGr.toFixed(1)} m, D50 = {interp.upperTableD50.toFixed(1)} m
                    </div>
                  )}
                  <div className="font-semibold mt-1">
                    Base: GR = {interp.baseGr.toFixed(1)} m, D50 = {interp.baseD50.toFixed(1)} m
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Corrections */}
          {result.corrections.length > 0 && (
            <section>
              <SectionTitle>Corrections</SectionTitle>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono bg-muted rounded px-3 py-1.5">
                  <span>Base from AFM table</span>
                  <span>GR {Math.round(interp.baseGr)} m | D50 {Math.round(interp.baseD50)} m</span>
                </div>
                {result.corrections.map((step, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono bg-muted rounded px-3 py-1.5">
                    <span>
                      {step.label}
                      {step.factor != null && <span className="text-muted-foreground ml-2">×{step.factor.toFixed(3)}</span>}
                    </span>
                    <span>GR {Math.round(step.grAfter)} m | D50 {Math.round(step.d50After)} m</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-mono bg-primary/10 rounded px-3 py-1.5 font-bold">
                  <span>Final</span>
                  <span>LGRR {Math.round(result.lgrr)} m | LDR {Math.round(result.ldr)} m</span>
                </div>
              </div>
            </section>
          )}

          {/* Go-around breakdown */}
          {!result.goAround.isNa && result.goAround.detail && (
            <section>
              <SectionTitle>Go-Around ROC (AFM 5.3.14)</SectionTitle>
              <div className="space-y-1 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Weight bracket: </span>
                  {result.goAround.detail.lowerWeight === result.goAround.detail.upperWeight ? (
                    <span>Exact at {result.goAround.detail.lowerWeight} kg</span>
                  ) : (
                    <span>{result.goAround.detail.lowerWeight}–{result.goAround.detail.upperWeight} kg (frac: {result.goAround.detail.weightFraction.toFixed(3)})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">PA bracket: </span>
                  {result.goAround.detail.lowerPa}–{result.goAround.detail.upperPa} ft
                </div>
                <div>
                  <span className="text-muted-foreground">OAT bracket: </span>
                  {result.goAround.detail.lowerOat}–{result.goAround.detail.upperOat}°C
                </div>
                <div className="mt-1 pt-1 border-t">
                  <div>Lower table ({result.goAround.detail.lowerWeight} kg): {result.goAround.detail.lowerTableRoc.toFixed(0)} fpm</div>
                  {result.goAround.detail.lowerWeight !== result.goAround.detail.upperWeight && (
                    <div>Upper table ({result.goAround.detail.upperWeight} kg): {result.goAround.detail.upperTableRoc.toFixed(0)} fpm</div>
                  )}
                  <div className="font-semibold mt-1">
                    ROC = {result.goAround.roc} fpm, Gradient = {result.goAround.gradient.toFixed(1)}%
                  </div>
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

function AfmTables({ result, inputs }: { result: LandingResult; inputs: LandingInputs }) {
  const interp = result.interpolation;
  const tables = inputs.flap === 'LDG' ? landingLdgTables : landingAbnormalTables;

  const lowerTable = tables.find((t) => t.weight === interp.lowerWeight);
  const upperTable = tables.find((t) => t.weight === interp.upperWeight);

  if (!lowerTable || !upperTable) return null;

  const tablesToShow = lowerTable === upperTable ? [lowerTable] : [upperTable, lowerTable];

  return (
    <div className="space-y-3">
      {tablesToShow.map((table) => (
        <AfmTableDisplay
          key={table.weight}
          table={table}
          highlightPaLow={interp.lowerPa}
          highlightPaHigh={interp.upperPa}
          highlightOatLow={interp.lowerOat}
          highlightOatHigh={interp.upperOat}
          flapLabel={inputs.flap}
        />
      ))}
    </div>
  );
}

function AfmTableDisplay({
  table,
  highlightPaLow,
  highlightPaHigh,
  highlightOatLow,
  highlightOatHigh,
  flapLabel,
}: {
  table: { weight: number; vRef: number; vRefUp?: number; pressureAltitudes: number[]; oats: number[]; rows: LandingCell[][] };
  highlightPaLow: number;
  highlightPaHigh: number;
  highlightOatLow: number;
  highlightOatHigh: number;
  flapLabel: string;
}) {
  const vRefDisplay = flapLabel === 'UP' && table.vRefUp ? table.vRefUp : table.vRef;

  return (
    <div className="overflow-x-auto">
      <div className="text-xs font-semibold mb-1">
        {table.weight} kg — V<sub>Ref</sub> {vRefDisplay} KIAS
      </div>
      <table className="text-[11px] border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-1.5 py-1 bg-muted text-left">PA (ft)</th>
            {table.oats.map((oat) => (
              <th
                key={oat}
                className={`border px-1.5 py-1 text-center ${
                  oat >= highlightOatLow && oat <= highlightOatHigh ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted'
                }`}
              >
                {oat}°C
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.pressureAltitudes.map((pa, paIdx) => {
            const isHighlightedPa = pa >= highlightPaLow && pa <= highlightPaHigh;
            return (
              <tr key={pa}>
                <td className={`border px-1.5 py-0.5 font-mono font-medium ${isHighlightedPa ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                  {pa === 0 ? 'SL' : pa.toLocaleString()}
                </td>
                {table.oats.map((oat, oatIdx) => {
                  const cell = table.rows[paIdx][oatIdx];
                  const isHighlighted = isHighlightedPa && oat >= highlightOatLow && oat <= highlightOatHigh;
                  return (
                    <td
                      key={oat}
                      className={`border px-1.5 py-0.5 font-mono text-center ${
                        isHighlighted ? 'bg-blue-200 dark:bg-blue-800/50 font-semibold' : ''
                      }`}
                    >
                      {cell ? (
                        <span>
                          {cell[0]}<br />
                          <span className="text-muted-foreground">{cell[1]}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-[10px] text-muted-foreground mt-1">Top = ground roll (m), bottom = 50 ft distance (m)</div>
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
