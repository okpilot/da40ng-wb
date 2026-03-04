import { useState } from 'react';
import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CatRunwayDiagram } from './RunwayDiagram';

interface CatFactorsProps {
  result: TakeoffResult;
  inputs: TakeoffInputs;
  departureLabel: string;
  fullRunwayTora: number;
  runwayDesignator: string;
}

export interface CatCheck {
  label: string;
  sourceLabel: string;
  available: number;
  divisor: number;
  limit: number;
  todr: number;
  reason: string;
}

export function getCatChecks(result: TakeoffResult, inputs: TakeoffInputs): CatCheck[] {
  const hasSwyOrCwy = inputs.toda > inputs.tora || inputs.asda > inputs.tora;
  const todr = result.todr;

  if (!hasSwyOrCwy) {
    return [
      {
        label: 'TORA / 1.25',
        sourceLabel: 'TORA',
        available: inputs.tora,
        divisor: 1.25,
        limit: Math.floor(inputs.tora / 1.25),
        todr,
        reason: 'No stopway or clearway available — a single 25% margin is applied to the AFM take-off distance to cover performance variability.',
      },
    ];
  }

  return [
    {
      label: 'TORA / 1.0',
      sourceLabel: 'TORA',
      available: inputs.tora,
      divisor: 1.0,
      limit: Math.floor(inputs.tora / 1.0),
      todr,
      reason: 'The unfactored take-off distance must fit within the runway alone — stopway and clearway do not extend the usable take-off run.',
    },
    {
      label: 'TODA / 1.15',
      sourceLabel: 'TODA',
      available: inputs.toda,
      divisor: 1.15,
      limit: Math.floor(inputs.toda / 1.15),
      todr,
      reason: 'A 15% margin is applied against TODA (runway + clearway). The clearway provides obstacle-free overfly area, so a smaller factor than 25% is sufficient.',
    },
    {
      label: 'ASDA / 1.30',
      sourceLabel: 'ASDA',
      available: inputs.asda,
      divisor: 1.3,
      limit: Math.floor(inputs.asda / 1.3),
      todr,
      reason: 'A 30% margin is applied against ASDA (runway + stopway). The stopway allows deceleration after a rejected take-off, so a larger factor ensures adequate stopping distance.',
    },
  ];
}

export function CatFactors({ result, inputs, departureLabel, fullRunwayTora, runwayDesignator }: CatFactorsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  if (hasNa || inputs.tora <= 0) return null;

  const checks = getCatChecks(result, inputs);
  const hasSwyOrCwy = inputs.toda > inputs.tora || inputs.asda > inputs.tora;
  const allPass = checks.every((c) => c.todr <= c.limit);
  const binding = checks.reduce((min, c) => (c.limit < min.limit ? c : min), checks[0]);

  return (
    <Card data-tour="to-cat-factors">
      <button
        type="button"
        className="w-full px-6 py-4 flex items-center gap-2 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-semibold text-sm">EASA Part CAT Safety Factors</span>
        <span className="text-xs text-muted-foreground ml-2">CAT.POL.A.305</span>
        {!isOpen && (
          <span className={`ml-auto text-xs font-semibold ${allPass ? 'text-green-600' : 'text-destructive'}`}>
            {allPass ? 'PASS' : 'FAIL'}
          </span>
        )}
      </button>

      {isOpen && (
        <CardContent className="space-y-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Under EASA Part CAT (EU 965/2012), Performance Class B single-engine aircraft must apply
            safety factors to the unfactored take-off distance (TODR) from the AFM. Part NCO
            (EU 800/2013) does not require these factors — the AFM requires only that the available
            runway length is at least equal to the take-off distance over 50 ft (AFM 5.3.7). Part CAT
            factors provide an additional safety margin.
          </p>

          <div className="text-xs text-muted-foreground">
            {hasSwyOrCwy ? (<>
              Stopway and/or clearway present — the regulation lists three conditions using "or",
              but <span className="font-semibold text-foreground">all applicable checks must pass simultaneously</span>.
              The most restrictive check governs whether the TODR is acceptable.
            </>) : (
              'No stopway or clearway — a single factored check applies:'
            )}
          </div>

          <CatRunwayDiagram
            inputs={inputs}
            result={result}
            departureLabel={departureLabel}
            fullRunwayTora={fullRunwayTora}
            runwayDesignator={runwayDesignator}
            checks={checks}
          />

          <div className="space-y-3">
            {checks.map((check) => {
              const pass = check.todr <= check.limit;
              const margin = check.limit - check.todr;
              return (
                <div key={check.label} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground px-1">
                    Max TODR = {check.label}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm font-mono ${
                      pass ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {check.sourceLabel} {check.available} / {check.divisor} = <span className="font-semibold">{check.limit} m</span>
                        <span className="text-muted-foreground mx-2">{pass ? '≥' : '<'}</span>
                        TODR = <span className="font-semibold">{check.todr} m</span>
                      </span>
                      <span className={`font-semibold ${pass ? 'text-green-600' : 'text-destructive'}`}>
                        {pass ? 'PASS' : 'FAIL'}{' '}
                        <span className="font-normal">
                          ({pass ? '+' : ''}{margin} m)
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground px-1">
                    {check.reason}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${allPass ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 text-destructive'}`}>
            Most restrictive: {binding.label} — max allowable TODR = {binding.limit} m
          </div>
        </CardContent>
      )}
    </Card>
  );
}
