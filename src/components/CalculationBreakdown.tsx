import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { da40ng } from '@/data/da40ng';
import {
  calculateMoment,
  getActiveFwdLimit,
  getActiveAftLimit,
  getEffectiveLimits,
  interpolateLimit,
  isWithinEnvelope,
  usgToKg,
} from '@/lib/calculations';
import type {
  AircraftConfig,
  CalculationResult,
  LoadingState,
  Station,
} from '@/lib/types';

interface Props {
  config: AircraftConfig;
  loading: LoadingState;
  visibleStations: Station[];
  result: CalculationResult;
}

function fmt(n: number, d = 1): string {
  return n.toFixed(d);
}

function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <div className="text-sm text-muted-foreground font-mono leading-relaxed pl-4">
        {children}
      </div>
    </div>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function CalculationBreakdown({
  config,
  loading,
  visibleStations,
  result,
}: Props) {
  const limits = getEffectiveLimits(da40ng, config.activeMods);
  const fwdLimit = getActiveFwdLimit(da40ng, config.activeMods);
  const aftLimit = getActiveAftLimit(da40ng, config.activeMods);
  const tank = da40ng.tanks[config.tankConfig];
  const fuelArm = 2.63;

  const bemMoment = calculateMoment(config.bemMass, config.bemCg);

  const activeEntries = loading.entries
    .filter((e) => {
      const station = visibleStations.find((s) => s.id === e.stationId);
      return station && e.mass > 0;
    })
    .map((e) => {
      const station = visibleStations.find((s) => s.id === e.stationId)!;
      return { ...e, station, moment: calculateMoment(e.mass, station.arm) };
    });

  const takeoffFuelLitres = loading.takeoffFuelUsg * da40ng.usgToLitres;
  const takeoffFuelKg = usgToKg(loading.takeoffFuelUsg, da40ng.usgToLitres, da40ng.fuelDensity);
  const tripFuelLitres = loading.tripFuelUsg * da40ng.usgToLitres;
  const tripFuelKg = usgToKg(loading.tripFuelUsg, da40ng.usgToLitres, da40ng.fuelDensity);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Calculation Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
          {/* Left column: calculation steps */}
          <div className="space-y-5">
            <Step label="1. Basic Empty Mass (BEM)">
              <Line>Mass = {fmt(config.bemMass)} kg</Line>
              <Line>CG = {fmt(config.bemCg, 3)} m</Line>
              <Line>Moment = {fmt(config.bemMass)} × {fmt(config.bemCg, 3)} = {fmt(bemMoment)} kgm</Line>
            </Step>

            {activeEntries.length > 0 && (
              <Step label="2. Payload">
                {activeEntries.map((e) => (
                  <Line key={e.stationId}>
                    {e.station.label}: {fmt(e.mass)} kg × {fmt(e.station.arm, 2)} m = {fmt(e.moment)} kgm
                  </Line>
                ))}
              </Step>
            )}

            <Step label={`${activeEntries.length > 0 ? '3' : '2'}. Zero Fuel Mass (ZFM)`}>
              <Line>
                Mass = {fmt(config.bemMass)}
                {activeEntries.map((e) => ` + ${fmt(e.mass)}`).join('')}
                {' '}= {fmt(result.zfm.mass)} kg
              </Line>
              <Line>
                Moment = {fmt(bemMoment)}
                {activeEntries.map((e) => ` + ${fmt(e.moment)}`).join('')}
                {' '}= {fmt(result.zfm.moment)} kgm
              </Line>
              <Line>
                CG = {fmt(result.zfm.moment)} / {fmt(result.zfm.mass)} = {fmt(result.zfm.cg, 3)} m
              </Line>
            </Step>

            {loading.takeoffFuelUsg > 0 && (
              <Step label={`${activeEntries.length > 0 ? '4' : '3'}. Take-off Fuel`}>
                <Line>
                  {fmt(loading.takeoffFuelUsg)} USG × {fmt(da40ng.usgToLitres, 4)} = {fmt(takeoffFuelLitres)} L
                </Line>
                <Line>
                  {fmt(takeoffFuelLitres)} L × {fmt(da40ng.fuelDensity, 2)} kg/L = {fmt(takeoffFuelKg)} kg
                </Line>
                <Line>
                  Moment = {fmt(takeoffFuelKg)} × {fmt(fuelArm, 2)} = {fmt(calculateMoment(takeoffFuelKg, fuelArm))} kgm
                </Line>
              </Step>
            )}

            {loading.takeoffFuelUsg > 0 && (
              <Step label={`${activeEntries.length > 0 ? '5' : '4'}. Take-off Mass (TOM)`}>
                <Line>
                  Mass = {fmt(result.zfm.mass)} + {fmt(takeoffFuelKg)} = {fmt(result.tom.mass)} kg
                </Line>
                <Line>
                  Moment = {fmt(result.zfm.moment)} + {fmt(calculateMoment(takeoffFuelKg, fuelArm))} = {fmt(result.tom.moment)} kgm
                </Line>
                <Line>
                  CG = {fmt(result.tom.moment)} / {fmt(result.tom.mass)} = {fmt(result.tom.cg, 3)} m
                </Line>
              </Step>
            )}

            {loading.tripFuelUsg > 0 && (
              <Step label={`${activeEntries.length > 0 ? '6' : '5'}. Trip Fuel & Landing Mass`}>
                <Line>
                  {fmt(loading.tripFuelUsg)} USG × {fmt(da40ng.usgToLitres, 4)} = {fmt(tripFuelLitres)} L → {fmt(tripFuelKg)} kg
                </Line>
                <Line>
                  Mass = {fmt(result.tom.mass)} − {fmt(tripFuelKg)} = {fmt(result.lm.mass)} kg
                </Line>
                <Line>
                  Moment = {fmt(result.tom.moment)} − {fmt(calculateMoment(tripFuelKg, fuelArm))} = {fmt(result.lm.moment)} kgm
                </Line>
                <Line>
                  CG = {fmt(result.lm.moment)} / {fmt(result.lm.mass)} = {fmt(result.lm.cg, 3)} m
                </Line>
              </Step>
            )}
          </div>

          {/* Right column: checks */}
          <div className="space-y-5">
            <Step label="Mass Limit Checks">
              <Line>
                Max ZFM: {fmt(result.zfm.mass)} kg {result.zfm.mass <= limits.maxZfm ? '≤' : '>'} {limits.maxZfm} kg → {result.zfm.mass <= limits.maxZfm ? 'OK' : 'EXCEEDED'}
              </Line>
              {loading.takeoffFuelUsg > 0 && (
                <>
                  <Line>
                    MTOM: {fmt(result.tom.mass)} kg {result.tom.mass <= limits.mtom ? '≤' : '>'} {limits.mtom} kg → {result.tom.mass <= limits.mtom ? 'OK' : 'EXCEEDED'}
                  </Line>
                  <Line>
                    Fuel: {fmt(loading.takeoffFuelUsg)} USG {loading.takeoffFuelUsg <= tank.usableUsg ? '≤' : '>'} {tank.usableUsg} USG → {loading.takeoffFuelUsg <= tank.usableUsg ? 'OK' : 'EXCEEDED'}
                  </Line>
                </>
              )}
              {loading.tripFuelUsg > 0 && (
                <Line>
                  Max Ldg: {fmt(result.lm.mass)} kg {result.lm.mass <= limits.maxLanding ? '≤' : '>'} {limits.maxLanding} kg → {result.lm.mass <= limits.maxLanding ? 'OK' : 'EXCEEDED'}
                </Line>
              )}
            </Step>

            <Step label="CG Envelope Checks">
              <Line>
                Fwd limit at {fmt(result.zfm.mass)} kg = {fmt(interpolateLimit(result.zfm.mass, fwdLimit), 3)} m
              </Line>
              <Line>
                Aft limit = {fmt(interpolateLimit(result.zfm.mass, aftLimit), 3)} m
              </Line>
              <Line>
                ZFM CG {fmt(result.zfm.cg, 3)} m → {isWithinEnvelope(result.zfm.mass, result.zfm.cg, fwdLimit, aftLimit) ? 'WITHIN' : 'OUTSIDE'}
              </Line>
              {loading.takeoffFuelUsg > 0 && (
                <>
                  <Line>
                    Fwd limit at {fmt(result.tom.mass)} kg = {fmt(interpolateLimit(result.tom.mass, fwdLimit), 3)} m
                  </Line>
                  <Line>
                    TOM CG {fmt(result.tom.cg, 3)} m → {isWithinEnvelope(result.tom.mass, result.tom.cg, fwdLimit, aftLimit) ? 'WITHIN' : 'OUTSIDE'}
                  </Line>
                </>
              )}
              {loading.tripFuelUsg > 0 && (
                <>
                  <Line>
                    Fwd limit at {fmt(result.lm.mass)} kg = {fmt(interpolateLimit(result.lm.mass, fwdLimit), 3)} m
                  </Line>
                  <Line>
                    LM CG {fmt(result.lm.cg, 3)} m → {isWithinEnvelope(result.lm.mass, result.lm.cg, fwdLimit, aftLimit) ? 'WITHIN' : 'OUTSIDE'}
                  </Line>
                </>
              )}
            </Step>

            {config.activeMods.size > 0 && (
              <Step label="Active Modifications">
                {da40ng.modifications
                  .filter((m) => config.activeMods.has(m.id))
                  .map((m) => (
                    <Line key={m.id}>
                      {m.label}: {m.description}
                      {m.limitOverrides && (
                        <> → {Object.entries(m.limitOverrides).map(([k, v]) => `${k} = ${v} kg`).join(', ')}</>
                      )}
                    </Line>
                  ))}
              </Step>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
