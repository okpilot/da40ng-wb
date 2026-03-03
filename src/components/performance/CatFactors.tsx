import { useState } from 'react';
import type { TakeoffResult, TakeoffInputs } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CatFactorsProps {
  result: TakeoffResult;
  inputs: TakeoffInputs;
}

interface Check {
  label: string;
  factoredLabel: string;
  factored: number;
  availableLabel: string;
  available: number;
  reason: string;
}

function getChecks(result: TakeoffResult, inputs: TakeoffInputs): Check[] {
  const hasSwyOrCwy = inputs.toda > inputs.tora || inputs.asda > inputs.tora;
  const todr = result.todr;

  if (!hasSwyOrCwy) {
    return [
      {
        label: 'TODR × 1.25 ≤ TORA',
        factoredLabel: `TODR ${todr} × 1.25`,
        factored: Math.ceil(todr * 1.25),
        availableLabel: 'TORA',
        available: inputs.tora,
        reason: 'No stopway or clearway available — a single 25% margin is applied to the AFM take-off distance to cover performance variability.',
      },
    ];
  }

  return [
    {
      label: 'TODR ≤ TORA',
      factoredLabel: `TODR`,
      factored: todr,
      availableLabel: 'TORA',
      available: inputs.tora,
      reason: 'The unfactored take-off distance must fit within the runway alone — stopway and clearway do not extend the usable take-off run.',
    },
    {
      label: 'TODR × 1.15 ≤ TODA',
      factoredLabel: `TODR ${todr} × 1.15`,
      factored: Math.ceil(todr * 1.15),
      availableLabel: 'TODA',
      available: inputs.toda,
      reason: 'A 15% margin is applied against TODA (runway + clearway). The clearway provides obstacle-free overfly area, so a smaller factor than 25% is sufficient.',
    },
    {
      label: 'TODR × 1.30 ≤ ASDA',
      factoredLabel: `TODR ${todr} × 1.30`,
      factored: Math.ceil(todr * 1.3),
      availableLabel: 'ASDA',
      available: inputs.asda,
      reason: 'A 30% margin is applied against ASDA (runway + stopway). The stopway allows deceleration after a rejected take-off, so a larger factor ensures adequate stopping distance.',
    },
  ];
}

export function CatFactors({ result, inputs }: CatFactorsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasNa = result.warnings.some((w) => w.message.includes('N/A'));

  if (hasNa || inputs.tora <= 0) return null;

  const checks = getChecks(result, inputs);
  const hasSwyOrCwy = inputs.toda > inputs.tora || inputs.asda > inputs.tora;
  const allPass = checks.every((c) => c.factored <= c.available);

  return (
    <Card>
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
              The most restrictive check governs the maximum allowable take-off distance.
            </>) : (
              'No stopway or clearway — a single factored check applies:'
            )}
          </div>

          <div className="space-y-3">
            {checks.map((check) => {
              const pass = check.factored <= check.available;
              const margin = check.available - check.factored;
              return (
                <div key={check.label} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground px-1">
                    {check.label}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm font-mono ${
                      pass ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {check.factoredLabel} = <span className="font-semibold">{check.factored} m</span>
                        <span className="text-muted-foreground mx-2">{pass ? '≤' : '>'}</span>
                        {check.availableLabel} = <span className="font-semibold">{check.available} m</span>
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
        </CardContent>
      )}
    </Card>
  );
}
