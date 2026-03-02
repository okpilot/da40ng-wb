import type {
  AircraftConfig,
  AircraftData,
  CalculationResult,
  EnvelopePoint,
  LimitCheck,
  LoadingState,
  MassCondition,
  MassLimits,
  ModificationId,
  Station,
} from './types';

export function calculateMoment(mass: number, arm: number): number {
  return mass * arm;
}

export function calculateCG(totalMass: number, totalMoment: number): number {
  if (totalMass === 0) return 0;
  return totalMoment / totalMass;
}

export function litresToKg(litres: number, density: number): number {
  return litres * density;
}

export function usgToKg(usg: number, usgToLitres: number, density: number): number {
  return usg * usgToLitres * density;
}

export function getEffectiveLimits(
  data: AircraftData,
  activeMods: Set<ModificationId>,
): MassLimits {
  const limits = { ...data.baseLimits };
  for (const mod of data.modifications) {
    if (activeMods.has(mod.id) && mod.limitOverrides) {
      Object.assign(limits, mod.limitOverrides);
    }
  }
  return limits;
}

export function getVisibleStations(
  stations: Station[],
  activeMods: Set<ModificationId>,
): Station[] {
  return stations.filter((s) => {
    if (!s.requiresMods) return true;
    return s.requiresMods.every((m) => activeMods.has(m));
  });
}

export function calculateLoadingCondition(
  config: AircraftConfig,
  loading: LoadingState,
  data: AircraftData,
): CalculationResult {
  // BEM
  const bemMoment = calculateMoment(config.bemMass, config.bemCg);
  let zfMass = config.bemMass;
  let zfMoment = bemMoment;

  // Add station loads
  const visibleStations = getVisibleStations(data.stations, config.activeMods);
  const visibleIds = new Set(visibleStations.map((s) => s.id));

  for (const entry of loading.entries) {
    if (!visibleIds.has(entry.stationId)) continue;
    const station = data.stations.find((s) => s.id === entry.stationId);
    if (!station || entry.mass === 0) continue;
    zfMass += entry.mass;
    zfMoment += calculateMoment(entry.mass, station.arm);
  }

  const zfm: MassCondition = {
    mass: zfMass,
    moment: zfMoment,
    cg: calculateCG(zfMass, zfMoment),
  };

  // TOM = ZFM + takeoff fuel
  const fuelArm = 2.63;
  const takeoffFuelKg = usgToKg(loading.takeoffFuelUsg, data.usgToLitres, data.fuelDensity);
  const tomMass = zfMass + takeoffFuelKg;
  const tomMoment = zfMoment + calculateMoment(takeoffFuelKg, fuelArm);
  const tom: MassCondition = {
    mass: tomMass,
    moment: tomMoment,
    cg: calculateCG(tomMass, tomMoment),
  };

  // LM = TOM - trip fuel
  const tripFuelKg = usgToKg(loading.tripFuelUsg, data.usgToLitres, data.fuelDensity);
  const lmMass = tomMass - tripFuelKg;
  const lmMoment = tomMoment - calculateMoment(tripFuelKg, fuelArm);
  const lm: MassCondition = {
    mass: lmMass,
    moment: lmMoment,
    cg: calculateCG(lmMass, lmMoment),
  };

  return { zfm, tom, lm };
}

export function interpolateLimit(
  mass: number,
  points: EnvelopePoint[],
): number {
  if (points.length === 0) return 0;
  if (mass <= points[0].mass) return points[0].cg;
  if (mass >= points[points.length - 1].mass)
    return points[points.length - 1].cg;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (mass >= p1.mass && mass <= p2.mass) {
      const ratio = (mass - p1.mass) / (p2.mass - p1.mass);
      return p1.cg + ratio * (p2.cg - p1.cg);
    }
  }
  return points[points.length - 1].cg;
}

export function isWithinEnvelope(
  mass: number,
  cg: number,
  fwdLimit: EnvelopePoint[],
  aftLimit: EnvelopePoint[],
  massLimit?: number,
): boolean {
  // Mass must be within the envelope's vertical bounds
  const minMass = Math.max(fwdLimit[0].mass, aftLimit[0].mass);
  const envelopeMaxMass = Math.min(
    fwdLimit[fwdLimit.length - 1].mass,
    aftLimit[aftLimit.length - 1].mass,
  );
  // Use the tighter of the envelope boundary and the applicable mass limit
  const maxMass = massLimit != null
    ? Math.min(envelopeMaxMass, massLimit)
    : envelopeMaxMass;
  if (mass < minMass || mass > maxMass) return false;

  const fwd = interpolateLimit(mass, fwdLimit);
  const aft = interpolateLimit(mass, aftLimit);
  return cg >= fwd && cg <= aft;
}

export function getActiveFwdLimit(
  data: AircraftData,
  activeMods: Set<ModificationId>,
): EnvelopePoint[] {
  return activeMods.has('mam40-662')
    ? data.fwdCgLimitExtended
    : data.fwdCgLimit;
}

export function getActiveAftLimit(
  data: AircraftData,
  activeMods: Set<ModificationId>,
): EnvelopePoint[] {
  // Aft limit top mass adjusts to match effective MTOM
  const limits = getEffectiveLimits(data, activeMods);
  return [
    { mass: data.baseLimits.minFlight, cg: 2.53 },
    { mass: limits.mtom, cg: 2.53 },
  ];
}

export function runLimitChecks(
  config: AircraftConfig,
  result: CalculationResult,
  data: AircraftData,
  loading: LoadingState,
): LimitCheck[] {
  const limits = getEffectiveLimits(data, config.activeMods);
  const fwdLimit = getActiveFwdLimit(data, config.activeMods);
  const aftLimit = getActiveAftLimit(data, config.activeMods);

  const maxFuelKg = data.tanks[config.tankConfig].usableKg;
  const takeoffFuelKg = usgToKg(
    loading.takeoffFuelUsg,
    data.usgToLitres,
    data.fuelDensity,
  );

  const checks: LimitCheck[] = [
    {
      label: 'ZFM',
      passed: result.zfm.mass <= limits.maxZfm,
      value: result.zfm.mass,
      limit: limits.maxZfm,
      unit: 'kg',
    },
    {
      label: 'TOM',
      passed: result.tom.mass <= limits.mtom,
      value: result.tom.mass,
      limit: limits.mtom,
      unit: 'kg',
    },
    {
      label: 'Landing Mass',
      passed: result.lm.mass <= limits.maxLanding,
      value: result.lm.mass,
      limit: limits.maxLanding,
      unit: 'kg',
    },
    {
      label: 'Min Flight Mass',
      passed: result.tom.mass >= limits.minFlight,
      value: result.tom.mass,
      limit: limits.minFlight,
      unit: 'kg',
    },
    {
      label: 'Fuel Capacity',
      passed: takeoffFuelKg <= maxFuelKg,
      value: takeoffFuelKg,
      limit: maxFuelKg,
      unit: 'kg',
    },
    {
      label: 'ZFM CG',
      passed:
        result.zfm.mass > 0 &&
        isWithinEnvelope(result.zfm.mass, result.zfm.cg, fwdLimit, aftLimit),
      value: result.zfm.cg,
      limit: 0,
      unit: 'm',
    },
    {
      label: 'TOM CG',
      passed:
        result.tom.mass > 0 &&
        isWithinEnvelope(result.tom.mass, result.tom.cg, fwdLimit, aftLimit),
      value: result.tom.cg,
      limit: 0,
      unit: 'm',
    },
    {
      label: 'LM CG',
      passed:
        result.lm.mass > 0 &&
        isWithinEnvelope(result.lm.mass, result.lm.cg, fwdLimit, aftLimit),
      value: result.lm.cg,
      limit: 0,
      unit: 'm',
    },
  ];

  return checks;
}

export function buildEnvelopePolygon(
  fwdLimit: EnvelopePoint[],
  aftLimit: EnvelopePoint[],
): { mass: number; cg: number }[] {
  // Walk fwd limit bottom-to-top, then aft limit top-to-bottom
  const polygon: { mass: number; cg: number }[] = [];
  for (const p of fwdLimit) {
    polygon.push({ mass: p.mass, cg: p.cg });
  }
  for (let i = aftLimit.length - 1; i >= 0; i--) {
    polygon.push({ mass: aftLimit[i].mass, cg: aftLimit[i].cg });
  }
  // Close polygon
  polygon.push({ mass: fwdLimit[0].mass, cg: fwdLimit[0].cg });
  return polygon;
}
