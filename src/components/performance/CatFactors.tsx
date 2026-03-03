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
  factored: number;
  available: number;
  factor: string;
}

function getChecks(result: TakeoffResult, inputs: TakeoffInputs): Check[] {
  const hasSwyOrCwy = inputs.toda > inputs.tora || inputs.asda > inputs.tora;

  if (!hasSwyOrCwy) {
    return [
      {
        label: 'TODR × 1.25 ≤ TORA',
        factored: Math.ceil(result.todr * 1.25),
        available: inputs.tora,
        factor: `${result.todr} × 1.25`,
      },
    ];
  }

  return [
    {
      label: 'TODR ≤ TORA',
      factored: result.todr,
      available: inputs.tora,
      factor: `${result.todr}`,
    },
    {
      label: 'TODR × 1.15 ≤ TODA',
      factored: Math.ceil(result.todr * 1.15),
      available: inputs.toda,
      factor: `${result.todr} × 1.15`,
    },
    {
      label: 'TODR × 1.30 ≤ ASDA',
      factored: Math.ceil(result.todr * 1.3),
      available: inputs.asda,
      factor: `${result.todr} × 1.30`,
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

          <div className="text-xs text-muted-foreground mb-2">
            {hasSwyOrCwy
              ? 'Stopway and/or clearway present — three checks required:'
              : 'No stopway or clearway — single factored check:'}
          </div>

          <div className="space-y-2">
            {checks.map((check) => {
              const pass = check.factored <= check.available;
              const margin = check.available - check.factored;
              return (
                <div
                  key={check.label}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-mono ${
                    pass ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                  }`}
                >
                  <span>
                    {check.factor} = <span className="font-semibold">{check.factored} m</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      vs {check.available} m
                    </span>
                    <span className={`font-semibold ${pass ? 'text-green-600' : 'text-destructive'}`}>
                      {pass ? 'PASS' : 'FAIL'}{' '}
                      <span className="font-normal">
                        ({pass ? '+' : ''}{margin} m)
                      </span>
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
