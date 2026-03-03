import { useState } from 'react';
import type { TakeoffResult, TakeoffInputs, TakeoffCell } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { takeoffTables } from '@/data/performance/takeoffDistance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ShowWorkingProps {
  result: TakeoffResult;
  inputs: TakeoffInputs;
}

export function ShowWorking({ result, inputs }: ShowWorkingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  if (hasNa) return null;

  return (
    <Card>
      <button
        type="button"
        className="w-full px-6 py-4 flex items-center gap-2 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-semibold text-sm">Show Working</span>
        <span className="text-xs text-muted-foreground ml-2">Step-by-step calculation with AFM tables</span>
      </button>

      {isOpen && (
        <CardContent className="space-y-6 pt-0">
          {/* 1. Base conditions comparison */}
          <BaseConditions inputs={inputs} />

          {/* 2. Step-by-step calculation */}
          <StepByStep result={result} inputs={inputs} />

          {/* 3. AFM tables with highlighted cells */}
          <AfmTables result={result} />

          {/* 4. Interpolation walkthrough */}
          <InterpolationWalkthrough result={result} inputs={inputs} />

          {/* 5. Correction breakdown */}
          {result.corrections.length > 0 && (
            <CorrectionBreakdownDetailed result={result} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold border-b pb-1 mb-3">{children}</h4>;
}

// ── 1. Base conditions ────────────────────────────────────────────

function BaseConditions({ inputs }: { inputs: TakeoffInputs }) {
  const rows = [
    {
      condition: 'Surface',
      afm: 'Dry, paved',
      yours: inputs.surface === 'paved'
        ? inputs.rwycc === 5 ? 'Paved, wet' : 'Paved, dry'
        : inputs.rwycc === 5
          ? `Grass wet ${inputs.grassLength === 'lte5cm' ? '≤5 cm' : inputs.grassLength === '5to10cm' ? '5–10 cm' : '25 cm'}`
          : `Grass dry ${inputs.grassLength === 'lte5cm' ? '≤5 cm' : inputs.grassLength === '5to10cm' ? '5–10 cm' : '25 cm'}`,
      correction: inputs.surface === 'paved' && inputs.rwycc === 6 ? 'None' : 'Yes',
    },
    {
      condition: 'Slope',
      afm: 'Level',
      yours: inputs.slope === 0 ? 'Level' : `${Math.abs(inputs.slope).toFixed(1)}% ${inputs.slope > 0 ? 'uphill' : 'downhill'}`,
      correction: inputs.slope > 0 ? `GR ×${(1 + 0.15 * inputs.slope).toFixed(2)}` : 'None',
    },
    {
      condition: 'Wind',
      afm: 'Calm',
      yours: inputs.windSpeed === 0 ? 'Calm' : `${inputs.windDirection}°/${inputs.windSpeed} kt`,
      correction: inputs.windSpeed === 0 ? 'None' : 'Yes',
    },
    {
      condition: 'Wheel fairings',
      afm: 'Installed',
      yours: inputs.wheelFairings ? 'Installed' : 'Not installed',
      correction: inputs.wheelFairings ? 'None' : 'GR +20 m, D50 +30 m',
    },
  ];

  return (
    <div>
      <SectionTitle>1. Base Conditions Comparison</SectionTitle>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Condition</TableHead>
            <TableHead>AFM assumes</TableHead>
            <TableHead>Your input</TableHead>
            <TableHead>Correction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.condition}>
              <TableCell className="font-medium">{row.condition}</TableCell>
              <TableCell>{row.afm}</TableCell>
              <TableCell>{row.yours}</TableCell>
              <TableCell className={row.correction !== 'None' ? 'text-amber-500 font-medium' : 'text-muted-foreground'}>
                {row.correction}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── 2. Step-by-step ───────────────────────────────────────────────

function StepByStep({ result, inputs }: { result: TakeoffResult; inputs: TakeoffInputs }) {
  const pa = result.pressureAltitude;
  const steps = [
    {
      num: 1,
      title: 'Pressure Altitude',
      formula: `PA = elevation + 30 × (1013.25 − QNH)`,
      calc: `PA = ${inputs.elevation} + 30 × (1013.25 − ${inputs.qnh}) = ${Math.round(pa)} ft`,
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
  ];

  if (inputs.windSpeed > 0) {
    steps.push({
      num: 5,
      title: 'Wind Components',
      formula: 'Headwind = speed × cos(wind_dir − rwy_hdg)',
      calc: `Headwind = ${inputs.windSpeed} × cos(${inputs.windDirection}° − ${inputs.runwayHeading}°) = ${result.headwind.toFixed(1)} kt${result.headwind < 0 ? ' (TAILWIND)' : ''}\nCrosswind = ${inputs.windSpeed} × |sin(${inputs.windDirection}° − ${inputs.runwayHeading}°)| = ${result.crosswind.toFixed(1)} kt`,
    });
  }

  return (
    <div>
      <SectionTitle>2. Step-by-Step Calculation</SectionTitle>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.num} className="bg-muted rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground">Step {step.num}: {step.title}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{step.formula}</div>
            <div className="text-sm font-mono mt-1 whitespace-pre-line">{step.calc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. AFM Tables ─────────────────────────────────────────────────

function AfmTables({ result }: { result: TakeoffResult }) {
  const interp = result.interpolation;

  // Find the two weight tables
  const lowerTable = takeoffTables.find((t) => t.weight === interp.lowerWeight);
  const upperTable = takeoffTables.find((t) => t.weight === interp.upperWeight);

  if (!lowerTable || !upperTable) return null;

  const tablesToShow = lowerTable === upperTable
    ? [lowerTable]
    : [upperTable, lowerTable];

  return (
    <div>
      <SectionTitle>3. AFM Tables — Highlighted Interpolation Cells</SectionTitle>
      <div className="space-y-4">
        {tablesToShow.map((table) => (
          <AfmTableDisplay
            key={table.weight}
            table={table}
            highlightPaLow={interp.lowerPa}
            highlightPaHigh={interp.upperPa}
            highlightOatLow={interp.lowerOat}
            highlightOatHigh={interp.upperOat}
          />
        ))}
      </div>
    </div>
  );
}

function AfmTableDisplay({
  table,
  highlightPaLow,
  highlightPaHigh,
  highlightOatLow,
  highlightOatHigh,
}: {
  table: { weight: number; vR: number; v50: number; pressureAltitudes: number[]; oats: number[]; rows: TakeoffCell[][] };
  highlightPaLow: number;
  highlightPaHigh: number;
  highlightOatLow: number;
  highlightOatHigh: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="text-xs font-semibold mb-1">{table.weight} kg — V<sub>R</sub> {table.vR} KIAS, V<sub>50</sub> {table.v50} KIAS</div>
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
                  const isHighlighted =
                    isHighlightedPa &&
                    oat >= highlightOatLow &&
                    oat <= highlightOatHigh;
                  return (
                    <td
                      key={oat}
                      className={`border px-1.5 py-0.5 font-mono text-center ${
                        isHighlighted
                          ? 'bg-blue-200 dark:bg-blue-800/50 font-semibold'
                          : ''
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
      <div className="text-[10px] text-muted-foreground mt-1">Top value = ground roll (m), bottom = 50 ft distance (m)</div>
    </div>
  );
}

// ── 4. Interpolation walkthrough ──────────────────────────────────

function InterpolationWalkthrough({ result, inputs }: { result: TakeoffResult; inputs: TakeoffInputs }) {
  const interp = result.interpolation;
  const sameTable = interp.lowerWeight === interp.upperWeight;

  return (
    <div>
      <SectionTitle>4. Interpolation Walkthrough</SectionTitle>
      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Within {interp.lowerWeight} kg table
          </div>
          <div className="text-sm font-mono mt-1">
            Bilinear: PA {interp.lowerPa}–{interp.upperPa} ft ({(interp.paFraction * 100).toFixed(0)}%), OAT {interp.lowerOat}–{interp.upperOat}°C ({(interp.oatFraction * 100).toFixed(0)}%)
          </div>
          <div className="text-sm font-mono">
            GR = {interp.lowerTableGr.toFixed(0)} m, D50 = {interp.lowerTableD50.toFixed(0)} m
          </div>
        </div>

        {!sameTable && (
          <>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs font-semibold text-muted-foreground">
                Within {interp.upperWeight} kg table
              </div>
              <div className="text-sm font-mono mt-1">
                GR = {interp.upperTableGr.toFixed(0)} m, D50 = {interp.upperTableD50.toFixed(0)} m
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs font-semibold text-muted-foreground">
                Weight interpolation
              </div>
              <div className="text-sm font-mono mt-1">
                Mass {inputs.mass} kg is {(interp.weightFraction * 100).toFixed(0)}% between {interp.lowerWeight} kg and {interp.upperWeight} kg
              </div>
              <div className="text-sm font-mono">
                Base GR = {interp.baseGr.toFixed(0)} m, Base D50 = {interp.baseD50.toFixed(0)} m
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 5. Correction breakdown (detailed) ───────────────────────────

function CorrectionBreakdownDetailed({ result }: { result: TakeoffResult }) {
  return (
    <div>
      <SectionTitle>5. Correction Breakdown</SectionTitle>
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-mono bg-muted rounded px-3 py-2">
          <span>Base from AFM table</span>
          <span>GR {Math.round(result.interpolation.baseGr)} m | D50 {Math.round(result.interpolation.baseD50)} m</span>
        </div>
        {result.corrections.map((step, i) => (
          <div key={i} className="flex justify-between text-sm font-mono bg-muted rounded px-3 py-2">
            <span>
              {step.label}
              {step.factor != null && <span className="text-muted-foreground ml-2">×{step.factor.toFixed(3)}</span>}
              {step.addGr > 0 && <span className="text-muted-foreground ml-2">+{step.addGr}/{step.addD50} m</span>}
            </span>
            <span>GR {Math.round(step.grAfter)} m | D50 {Math.round(step.d50After)} m</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-mono bg-primary/10 rounded px-3 py-2 font-bold">
          <span>Final</span>
          <span>TORR {result.torr} m | TODR {result.todr} m</span>
        </div>
      </div>
    </div>
  );
}
