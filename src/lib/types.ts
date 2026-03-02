export type ModificationId = 'mam40-662' | 'mam40-574' | 'oam40-164' | 'oam40-331';

export type TankConfig = 'standard' | 'long-range';

export interface Station {
  id: string;
  label: string;
  arm: number;
  maxMass?: number;
  /** Only visible when these mods are active */
  requiresMods?: ModificationId[];
}

export interface Modification {
  id: ModificationId;
  label: string;
  description: string;
  limitOverrides?: Partial<MassLimits>;
}

export interface MassLimits {
  mtom: number;
  maxLanding: number;
  maxZfm: number;
  minFlight: number;
}

export interface TankData {
  usableUsg: number;
  usableLitres: number;
  usableKg: number;
}

export interface EnvelopePoint {
  mass: number;
  cg: number;
}

export interface AircraftData {
  name: string;
  stations: Station[];
  modifications: Modification[];
  baseLimits: MassLimits;
  tanks: Record<TankConfig, TankData>;
  fuelDensity: number;
  usgToLitres: number;
  fwdCgLimit: EnvelopePoint[];
  aftCgLimit: EnvelopePoint[];
  /** Extended fwd CG limit points when MÄM 40-662 is active */
  fwdCgLimitExtended: EnvelopePoint[];
  defaultBem: { mass: number; cg: number };
}

export interface AircraftConfig {
  bemMass: number;
  bemCg: number;
  activeMods: Set<ModificationId>;
  tankConfig: TankConfig;
}

export interface LoadingEntry {
  stationId: string;
  mass: number;
}

export interface LoadingState {
  entries: LoadingEntry[];
  takeoffFuelUsg: number;
  tripFuelUsg: number;
}

export interface MassCondition {
  mass: number;
  moment: number;
  cg: number;
}

export interface CalculationResult {
  zfm: MassCondition;
  tom: MassCondition;
  lm: MassCondition;
}

export interface LimitCheck {
  label: string;
  passed: boolean;
  value: number;
  limit: number;
  unit: string;
}
