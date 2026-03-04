import { useState } from 'react';
import type { ClimbResult, ClimbInputs, ClimbRocDetail, ClimbPointResult, ClimbRocTable, ClimbRocCell } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { takeoffClimbRocTables } from '@/data/performance/takeoffClimbRoc';
import { cruiseClimbRocTables } from '@/data/performance/cruiseClimbRoc';

interface ClimbShowWorkingProps {
  result: ClimbResult;
  inputs: ClimbInputs;
}

export function ClimbShowWorking({ result, inputs }: ClimbShowWorkingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  if (hasNa) return null;

  return (
    <Card>
      <button
        type="button"
        className="w-full px-6 py-4 flex items-center gap-2 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-semibold text-sm">Calculation Breakdown</span>
        <span className="text-xs text-muted-foreground ml-2">Step-by-step with AFM tables</span>
      </button>

      {isOpen && (
        <CardContent className="space-y-6 pt-0">
          <StepByStep result={result} inputs={inputs} />

          {/* AFM 5.3.8 table */}
          {result.takeoffClimb.detail && (
            <AfmRocTables
              title="2. AFM 5.3.8 — T/O Climb ROC Tables"
              subtitle="Flaps T/O, Vy 72 KIAS, Power 92%"
              tables={takeoffClimbRocTables}
              detail={result.takeoffClimb.detail}
            />
          )}

          <RocWalkthrough
            title="3. T/O Climb ROC Interpolation"
            subtitle={`Flaps T/O, Vy 72 KIAS, Power 92% — at flap retraction PA (${Math.round(result.flapRetractionPa)} ft)`}
            detail={result.takeoffClimb.detail}
            cas={72}
            fairingsLabel="20 ft/min"
            point={result.takeoffClimb}
          />

          {/* AFM 5.3.9 table */}
          {result.cruiseClimbStart.detail && (
            <AfmRocTables
              title="4. AFM 5.3.9 — Cruise Climb ROC Tables"
              subtitle="Flaps UP, Vy 88 KIAS, Power 92%"
              tables={cruiseClimbRocTables}
              detail={result.cruiseClimbStart.detail}
            />
          )}

          <RocWalkthrough
            title="5a. Cruise Climb ROC — Start"
            subtitle={`Flaps UP, Vy 88 KIAS, Power 92% — at flap retraction PA (${Math.round(result.flapRetractionPa)} ft)`}
            detail={result.cruiseClimbStart.detail}
            cas={88}
            fairingsLabel="40 ft/min"
            point={result.cruiseClimbStart}
          />
          <RocWalkthrough
            title="5b. Cruise Climb ROC — TOC"
            subtitle={`Flaps UP, Vy 88 KIAS, Power 92% — at cruise PA (${Math.round(result.cruisePa)} ft)`}
            detail={result.cruiseClimbToc.detail}
            cas={88}
            fairingsLabel="40 ft/min"
            point={result.cruiseClimbToc}
          />
          <AverageWalkthrough result={result} />
          {result.climbSegment && (
            <ClimbSegmentWalkthrough result={result} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold border-b pb-1 mb-3">{children}</h4>;
}

function StepByStep({ result, inputs }: { result: ClimbResult; inputs: ClimbInputs }) {
  const pa = result.pressureAltitude;
  const steps = [
    {
      num: 1,
      title: 'Pressure Altitude',
      formula: 'PA = elevation + 30 × (1013 − QNH)',
      calc: `PA = ${inputs.elevation} + 30 × (1013 − ${inputs.qnh}) = ${Math.round(pa)} ft`,
    },
    {
      num: 2,
      title: 'ISA Temperature',
      formula: 'T_ISA = 15 − 2 × (PA / 1000)',
      calc: `T_ISA = 15 − 2 × (${Math.round(pa)} / 1000) = ${result.isaTemperature.toFixed(1)} °C`,
    },
    {
      num: 3,
      title: 'ISA Deviation',
      formula: 'ISA dev = OAT − T_ISA',
      calc: `ISA dev = ${inputs.oat} − ${result.isaTemperature.toFixed(1)} = ${result.isaDeviation >= 0 ? '+' : ''}${result.isaDeviation.toFixed(1)} °C`,
    },
    {
      num: 4,
      title: 'Density Altitude',
      formula: 'DA = PA + 120 × (OAT − T_ISA)',
      calc: `DA = ${Math.round(pa)} + 120 × (${inputs.oat} − ${result.isaTemperature.toFixed(1)}) = ${Math.round(result.densityAltitude)} ft`,
    },
    {
      num: 5,
      title: 'Flap Retraction PA',
      formula: 'FR PA = departure PA + flap retraction height',
      calc: `FR PA = ${Math.round(pa)} + ${inputs.flapRetractionHeight} = ${Math.round(result.flapRetractionPa)} ft`,
    },
    {
      num: 6,
      title: 'Cruise Pressure Altitude',
      formula: 'Cruise PA = cruise alt + 30 × (1013 − QNH)',
      calc: `Cruise PA = ${inputs.cruiseAltitude} + 30 × (1013 − ${inputs.qnh}) = ${Math.round(result.cruisePa)} ft`,
    },
  ];

  return (
    <div>
      <SectionTitle>1. Derived Conditions</SectionTitle>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.num} className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">Step {step.num}: {step.title}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{step.formula}</div>
            <div className="text-sm font-mono mt-1">{step.calc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── AFM ROC Table Display ──────────────────────────────────────── */

function AfmRocTables({
  title, subtitle, tables, detail,
}: {
  title: string; subtitle: string; tables: ClimbRocTable[]; detail: ClimbRocDetail;
}) {
  const lowerTable = tables.find((t) => t.weight === detail.lowerWeight);
  const upperTable = tables.find((t) => t.weight === detail.upperWeight);
  if (!lowerTable || !upperTable) return null;

  const tablesToShow = lowerTable === upperTable ? [lowerTable] : [upperTable, lowerTable];

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">{subtitle}</div>
      <div className="space-y-4">
        {tablesToShow.map((table) => (
          <RocTableDisplay
            key={table.weight}
            table={table}
            highlightPaLow={detail.lowerPa}
            highlightPaHigh={detail.upperPa}
            highlightOatLow={detail.lowerOat}
            highlightOatHigh={detail.upperOat}
          />
        ))}
      </div>
    </div>
  );
}

function RocTableDisplay({
  table, highlightPaLow, highlightPaHigh, highlightOatLow, highlightOatHigh,
}: {
  table: ClimbRocTable;
  highlightPaLow: number; highlightPaHigh: number;
  highlightOatLow: number; highlightOatHigh: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="text-xs font-semibold mb-1">{table.weight} kg</div>
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
                  const cell: ClimbRocCell = table.rows[paIdx][oatIdx];
                  const isHighlighted = isHighlightedPa && oat >= highlightOatLow && oat <= highlightOatHigh;
                  return (
                    <td
                      key={oat}
                      className={`border px-1.5 py-0.5 font-mono text-center ${
                        isHighlighted ? 'bg-blue-200 dark:bg-blue-800/50 font-semibold' : ''
                      }`}
                    >
                      {cell !== null ? cell : <span className="text-muted-foreground">N/A</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-[10px] text-muted-foreground mt-1">ROC in ft/min. Without wheel fairings: subtract penalty from result.</div>
    </div>
  );
}

/* ── ROC Interpolation Walkthrough ───────────────────────────────── */

function RocWalkthrough({ title, subtitle, detail, cas, fairingsLabel, point }: {
  title: string; subtitle: string; detail: ClimbRocDetail | null;
  cas: number; fairingsLabel: string; point: ClimbPointResult;
}) {
  if (!detail) return null;
  const sameTable = detail.lowerWeight === detail.upperWeight;

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">{subtitle}</div>
      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Within {detail.lowerWeight} kg table
          </div>
          <div className="text-sm font-mono mt-1">
            Bilinear: PA {detail.lowerPa}–{detail.upperPa} ft ({(detail.paFraction * 100).toFixed(0)}%), OAT {detail.lowerOat}–{detail.upperOat}°C ({(detail.oatFraction * 100).toFixed(0)}%)
          </div>
          <div className="text-sm font-mono">
            ROC = {detail.lowerTableRoc.toFixed(0)} ft/min
          </div>
        </div>

        {!sameTable && (
          <>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs font-semibold text-muted-foreground">
                Within {detail.upperWeight} kg table
              </div>
              <div className="text-sm font-mono mt-1">
                ROC = {detail.upperTableRoc.toFixed(0)} ft/min
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs font-semibold text-muted-foreground">Weight interpolation</div>
              <div className="text-sm font-mono mt-1">
                {(detail.weightFraction * 100).toFixed(0)}% between {detail.lowerWeight} kg and {detail.upperWeight} kg
              </div>
              <div className="text-sm font-mono">
                Base ROC = {detail.baseRoc.toFixed(0)} ft/min
              </div>
            </div>
          </>
        )}

        {detail.fairingsPenalty > 0 && (
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">Fairings penalty</div>
            <div className="text-sm font-mono mt-1">
              ROC = {detail.baseRoc.toFixed(0)} − {detail.fairingsPenalty} = {detail.finalRoc.toFixed(0)} ft/min
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Without wheel fairings: ROC decreased by {fairingsLabel}
            </div>
          </div>
        )}

        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Gradient calculation</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            TAS = CAS × (1 + 0.02 × PA/1000) = {cas} × (1 + 0.02 × {Math.round(point.pa)}/1000) = {point.tas.toFixed(1)} kt
          </div>
          <div className="text-sm font-mono mt-1">
            Gradient = ROC / TAS × 0.98 = {point.roc} / {point.tas.toFixed(1)} × 0.98 = {point.gradient.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function AverageWalkthrough({ result }: { result: ClimbResult }) {
  const start = result.cruiseClimbStart;
  const toc = result.cruiseClimbToc;
  const avg = result.cruiseClimbAvg;

  return (
    <div>
      <SectionTitle>5c. Cruise Climb — Average</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">
        Average computed from start and TOC components
      </div>
      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Average ROC</div>
          <div className="text-sm font-mono mt-1">
            ({start.roc} + {toc.roc}) / 2 = {avg.roc} fpm
          </div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Average TAS</div>
          <div className="text-sm font-mono mt-1">
            ({start.tas.toFixed(1)} + {toc.tas.toFixed(1)}) / 2 = {avg.tas.toFixed(1)} kt
          </div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Average gradient (from averaged components)</div>
          <div className="text-sm font-mono mt-1">
            Gradient = avg ROC / avg TAS × 0.98 = {avg.roc} / {avg.tas.toFixed(1)} × 0.98 = {avg.gradient.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function ClimbSegmentWalkthrough({ result }: { result: ClimbResult }) {
  const seg = result.climbSegment!;

  return (
    <div>
      <SectionTitle>6. Time, Fuel & Distance to Climb (AFM 5.3.10)</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">Flaps UP, Vy 88 KIAS, Power 92% — subtraction method</div>
      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Departure PA: {Math.round(seg.departurePa)} ft (cumulative from SL)
          </div>
          <div className="text-sm font-mono mt-1">
            Time: {seg.departureTime.toFixed(1)} min, Fuel: {seg.departureFuel.toFixed(2)} USG, Distance: {seg.departureDistance.toFixed(1)} NM
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Cruise PA: {Math.round(seg.cruisePa)} ft (cumulative from SL)
          </div>
          <div className="text-sm font-mono mt-1">
            Time: {seg.cruiseTime.toFixed(1)} min, Fuel: {seg.cruiseFuel.toFixed(2)} USG, Distance: {seg.cruiseDistance.toFixed(1)} NM
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">Subtraction</div>
          <div className="text-sm font-mono mt-1">
            Time: {seg.cruiseTime.toFixed(1)} − {seg.departureTime.toFixed(1)} = {seg.rawTime.toFixed(1)} min
          </div>
          <div className="text-sm font-mono">
            Fuel: {seg.cruiseFuel.toFixed(2)} − {seg.departureFuel.toFixed(2)} = {seg.rawFuel.toFixed(2)} USG
          </div>
          <div className="text-sm font-mono">
            Distance: {seg.cruiseDistance.toFixed(1)} − {seg.departureDistance.toFixed(1)} = {seg.rawDistance.toFixed(1)} NM
          </div>
        </div>

        {seg.isaDev > 0 && (
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">ISA correction (ISA +{seg.isaDev.toFixed(1)}°C)</div>
            <div className="text-xs text-muted-foreground mt-1">
              Add 5% to time & fuel, 10% to distance for each 10°C above ISA
            </div>
            <div className="text-sm font-mono mt-1">
              Time & Fuel factor: ×{seg.isaTimeFuelFactor.toFixed(3)} | Distance factor: ×{seg.isaDistanceFactor.toFixed(3)}
            </div>
            <div className="text-sm font-mono">
              Time: {seg.rawTime.toFixed(1)} × {seg.isaTimeFuelFactor.toFixed(3)} = {seg.time.toFixed(1)} min
            </div>
            <div className="text-sm font-mono">
              Fuel: {seg.rawFuel.toFixed(2)} × {seg.isaTimeFuelFactor.toFixed(3)} = {seg.fuel.toFixed(2)} USG
            </div>
            <div className="text-sm font-mono">
              Distance: {seg.rawDistance.toFixed(1)} × {seg.isaDistanceFactor.toFixed(3)} = {seg.distance.toFixed(1)} NM
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm font-mono bg-primary/10 rounded px-3 py-2 font-bold">
          <span>Final</span>
          <span>
            {Math.round(seg.time)} min | {seg.fuel.toFixed(1)} USG | {Math.round(seg.distance)} NM
          </span>
        </div>
      </div>
    </div>
  );
}
