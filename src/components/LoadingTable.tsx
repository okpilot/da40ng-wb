import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { da40ng } from '@/data/da40ng';
import {
  calculateMoment,
  getActiveFwdLimit,
  getActiveAftLimit,
  getEffectiveLimits,
  isWithinEnvelope,
  usgToKg,
} from '@/lib/calculations';
import type {
  AircraftConfig,
  CalculationResult,
  LoadingState,
  MassCondition,
  Station,
} from '@/lib/types';

interface Props {
  config: AircraftConfig;
  loading: LoadingState;
  visibleStations: Station[];
  result: CalculationResult;
  hasLoading: boolean;
  onStationMassChange: (stationId: string, mass: number) => void;
  onTakeoffFuelChange: (litres: number) => void;
  onTripFuelChange: (litres: number) => void;
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function LimitIndicator({
  passed,
  active,
}: {
  passed: boolean;
  active: boolean;
}) {
  if (!active) return <span className="text-muted-foreground/40">—</span>;
  if (passed) return <span className="text-green-600 font-bold">✓</span>;
  return <span className="text-destructive font-bold">✗</span>;
}

function SubtotalRow({
  label,
  condition,
  massLimit,
  massLimitLabel,
  cgPassed,
  active,
}: {
  label: string;
  condition: MassCondition;
  massLimit: number;
  massLimitLabel: string;
  cgPassed: boolean;
  active: boolean;
}) {
  const massOver = condition.mass > massLimit;
  return (
    <>
      <TableRow className="bg-muted/50 font-semibold">
        <TableCell>{label}</TableCell>
        <TableCell className={`text-right ${active && massOver ? 'text-destructive' : ''}`}>
          {fmt(condition.mass)}
        </TableCell>
        <TableCell className={`text-right ${active && !cgPassed ? 'text-destructive' : ''}`}>
          {fmt(condition.cg, 3)}
        </TableCell>
        <TableCell className="text-right">{fmt(condition.moment)}</TableCell>
      </TableRow>
      <TableRow className="bg-muted/30 text-xs">
        <TableCell className="py-1 pl-6 text-muted-foreground" colSpan={2}>
          <span className="inline-flex items-center gap-1.5">
            <LimitIndicator passed={!massOver} active={active} />
            <span>
              {massLimitLabel}:
              <span className="font-medium ml-1">{massLimit} kg</span>
            </span>
          </span>
        </TableCell>
        <TableCell className="py-1 text-muted-foreground" colSpan={2}>
          <span className="inline-flex items-center gap-1.5">
            <LimitIndicator passed={cgPassed} active={active} />
            <span>CG envelope</span>
          </span>
        </TableCell>
      </TableRow>
    </>
  );
}

export function LoadingTable({
  config,
  loading,
  visibleStations,
  result,
  hasLoading,
  onStationMassChange,
  onTakeoffFuelChange,
  onTripFuelChange,
}: Props) {
  const bemMoment = calculateMoment(config.bemMass, config.bemCg);
  const limits = getEffectiveLimits(da40ng, config.activeMods);
  const tank = da40ng.tanks[config.tankConfig];

  const takeoffFuelKg = usgToKg(loading.takeoffFuelUsg, da40ng.usgToLitres, da40ng.fuelDensity);
  const tripFuelKg = usgToKg(loading.tripFuelUsg, da40ng.usgToLitres, da40ng.fuelDensity);
  const takeoffFuelLitres = loading.takeoffFuelUsg * da40ng.usgToLitres;
  const tripFuelLitres = loading.tripFuelUsg * da40ng.usgToLitres;

  const fuelArm = 2.63;

  const fwdLimit = getActiveFwdLimit(da40ng, config.activeMods);
  const aftLimit = getActiveAftLimit(da40ng, config.activeMods);

  const zfmCgOk = isWithinEnvelope(result.zfm.mass, result.zfm.cg, fwdLimit, aftLimit, limits.maxZfm);
  const tomCgOk = isWithinEnvelope(result.tom.mass, result.tom.cg, fwdLimit, aftLimit, limits.mtom);
  const lmCgOk = isWithinEnvelope(result.lm.mass, result.lm.cg, fwdLimit, aftLimit, limits.maxLanding);

  const fuelOverCapacity = loading.takeoffFuelUsg > tank.usableUsg;

  return (
    <Card data-tour="loading-table">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Mass & Balance Sheet</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Item</TableHead>
              <TableHead className="text-right w-[110px]">Mass (kg)</TableHead>
              <TableHead className="text-right w-[90px]">Arm (m)</TableHead>
              <TableHead className="text-right w-[110px]">Moment (kgm)</TableHead>
            </TableRow>
          </TableHeader>
          {/* BEM row */}
          <TableBody>
            <TableRow>
              <TableCell>Basic Empty Mass</TableCell>
              <TableCell className="text-right">{fmt(config.bemMass)}</TableCell>
              <TableCell className="text-right">{fmt(config.bemCg, 3)}</TableCell>
              <TableCell className="text-right">{fmt(bemMoment)}</TableCell>
            </TableRow>
          </TableBody>

          {/* Station rows */}
          <tbody data-tour="payload-stations">
            {visibleStations.map((station) => {
              const entry = loading.entries.find(
                (e) => e.stationId === station.id,
              );
              const mass = entry?.mass ?? 0;
              const moment = calculateMoment(mass, station.arm);
              const overMax = station.maxMass != null && mass > station.maxMass;

              return (
                <TableRow key={station.id}>
                  <TableCell>
                    {station.label}
                    {station.maxMass != null && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (max {station.maxMass})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      className={`w-[90px] ml-auto text-right h-8 ${overMax ? 'border-destructive text-destructive' : ''}`}
                      value={mass || ''}
                      onChange={(e) =>
                        onStationMassChange(
                          station.id,
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">{fmt(station.arm, 2)}</TableCell>
                  <TableCell className="text-right">
                    {mass > 0 ? fmt(moment) : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>

          {/* ZFM Subtotal + limits */}
          <tbody data-tour="zfm-row">
            <SubtotalRow
              label="Zero Fuel Mass"
              condition={result.zfm}
              massLimit={limits.maxZfm}
              massLimitLabel="MZFM"
              cgPassed={zfmCgOk}
              active={hasLoading}
            />
          </tbody>

          {/* Fuel section: takeoff fuel, TOM, trip fuel, LM */}
          <tbody data-tour="fuel-section">
            {/* Takeoff Fuel */}
            <TableRow>
              <TableCell>
                Take-off Fuel
                <span className="ml-1 text-xs text-muted-foreground">
                  (max {tank.usableUsg} USG)
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    className={`w-[70px] text-right h-8 ${fuelOverCapacity ? 'border-destructive text-destructive' : ''}`}
                    value={loading.takeoffFuelUsg || ''}
                    onChange={(e) =>
                      onTakeoffFuelChange(parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs text-muted-foreground">USG</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{fmt(fuelArm, 2)}</TableCell>
              <TableCell className="text-right">
                {takeoffFuelKg > 0 ? fmt(calculateMoment(takeoffFuelKg, fuelArm)) : '—'}
              </TableCell>
            </TableRow>
            {/* Fuel info row: litres + kg */}
            {loading.takeoffFuelUsg > 0 && (
              <TableRow className="text-xs">
                <TableCell className="py-1 pl-6 text-muted-foreground" colSpan={4}>
                  {fmt(takeoffFuelLitres, 1)} L / {fmt(takeoffFuelKg)} kg
                  {fuelOverCapacity && (
                    <span className="ml-2 text-destructive font-medium">
                      — exceeds tank capacity ({tank.usableUsg} USG / {tank.usableLitres} L)
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}

            {/* TOM Subtotal + limits */}
            <SubtotalRow
              label="Take-off Mass"
              condition={result.tom}
              massLimit={limits.mtom}
              massLimitLabel="MTOM"
              cgPassed={tomCgOk}
              active={hasLoading}
            />

            {/* Trip Fuel */}
            <TableRow>
              <TableCell>
                Trip Fuel
                <span className="ml-1 text-xs text-muted-foreground">(burn)</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-[70px] text-right h-8"
                    value={loading.tripFuelUsg || ''}
                    onChange={(e) =>
                      onTripFuelChange(parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="text-xs text-muted-foreground">USG</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{fmt(fuelArm, 2)}</TableCell>
              <TableCell className="text-right">
                {tripFuelKg > 0 ? `−${fmt(calculateMoment(tripFuelKg, fuelArm))}` : '—'}
              </TableCell>
            </TableRow>
            {loading.tripFuelUsg > 0 && (
              <TableRow className="text-xs">
                <TableCell className="py-1 pl-6 text-muted-foreground" colSpan={4}>
                  {fmt(tripFuelLitres, 1)} L / −{fmt(tripFuelKg)} kg
                </TableCell>
              </TableRow>
            )}

            {/* LM Subtotal + limits */}
            <SubtotalRow
              label="Landing Mass"
              condition={result.lm}
              massLimit={limits.maxLanding}
              massLimitLabel="MLM"
              cgPassed={lmCgOk}
              active={hasLoading}
            />
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
}
