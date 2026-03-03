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

// ── Performance types ──────────────────────────────────────────────

export type SurfaceType = 'paved' | 'grass';

export type GrassLength = 'lte5cm' | '5to10cm' | '25cm';

export type Rwycc = 6 | 5 | 4 | 3 | 2 | 1 | 0;

export interface Intersection {
  name: string;
  distanceFromThreshold: number;
  tora: number;
  toda: number;
  asda: number;
}

export interface Runway {
  designator: string;
  heading: number;
  tora: number;
  toda: number;
  asda: number;
  lda: number;
  surface: SurfaceType;
  slope: number;
  displacedThreshold: number;
  stopway: number;
  clearway: number;
  intersections: Intersection[];
}

export interface Aerodrome {
  icao: string;
  name: string;
  elevation: number;
  runways: Runway[];
}

/** A single cell in a take-off distance table: [groundRoll, dist50ft] or null if N/A */
export type TakeoffCell = [number, number] | null;

/** One weight table: PA rows × OAT columns */
export interface TakeoffTable {
  weight: number;
  vR: number;
  v50: number;
  pressureAltitudes: number[];
  oats: number[];
  /** rows[paIndex][oatIndex] */
  rows: TakeoffCell[][];
}

export interface TakeoffInputs {
  mass: number;
  elevation: number;
  qnh: number;
  oat: number;
  windDirection: number;
  windSpeed: number;
  runwayHeading: number;
  surface: SurfaceType;
  grassLength: GrassLength;
  rwycc: Rwycc;
  softGround: boolean;
  slope: number;
  wheelFairings: boolean;
  // Declared distances
  tora: number;
  toda: number;
  asda: number;
  lda: number;
}

export interface CorrectionStep {
  label: string;
  factor: number | null;
  addGr: number;
  addD50: number;
  grAfter: number;
  d50After: number;
}

export interface InterpolationDetail {
  /** The two weight tables used */
  lowerWeight: number;
  upperWeight: number;
  /** Weight fraction between tables (0–1) */
  weightFraction: number;
  /** PA rows bracketing the input */
  lowerPa: number;
  upperPa: number;
  paFraction: number;
  /** OAT columns bracketing the input */
  lowerOat: number;
  upperOat: number;
  oatFraction: number;
  /** The 4 cells from the lower weight table [paLow/oatLow, paLow/oatHigh, paHigh/oatLow, paHigh/oatHigh] */
  lowerTableCells: (TakeoffCell)[];
  upperTableCells: (TakeoffCell)[];
  /** Interpolated GR and D50 within each weight table */
  lowerTableGr: number;
  lowerTableD50: number;
  upperTableGr: number;
  upperTableD50: number;
  /** Final interpolated base values */
  baseGr: number;
  baseD50: number;
}

export interface VSpeeds {
  vR: number;
  v50: number;
}

export interface TakeoffWarning {
  level: 'amber' | 'red';
  message: string;
}

export interface TakeoffResult {
  // Derived conditions
  pressureAltitude: number;
  densityAltitude: number;
  isaTemperature: number;
  isaDeviation: number;
  headwind: number;
  crosswind: number;
  // Table lookup
  interpolation: InterpolationDetail;
  // Corrections
  corrections: CorrectionStep[];
  // Final distances
  torr: number;
  todr: number;
  // V-speeds
  vSpeeds: VSpeeds;
  // Warnings
  warnings: TakeoffWarning[];
  /** OAT was clamped to table range */
  oatClamped: boolean;
  clampedOat: number;
}

// ── Climb performance types ──────────────────────────────────────

/** A single cell in a climb ROC table: ROC in ft/min or null if N/A */
export type ClimbRocCell = number | null;

/** One weight table for climb ROC: PA rows × OAT columns */
export interface ClimbRocTable {
  weight: number;
  pressureAltitudes: number[];
  oats: number[];
  /** rows[paIndex][oatIndex] — ROC in ft/min, null = N/A */
  rows: ClimbRocCell[][];
}

/** One row in a climb profile table (cumulative from SL at ISA) */
export interface ClimbProfileRow {
  pressureAltitude: number;
  oat: number;
  tas: number;
  roc: number;
  rocMs: number;
  time: number;
  fuel: number;
  distance: number;
}

/** One weight table for time/fuel/distance to climb */
export interface ClimbProfileTable {
  weight: number;
  rows: ClimbProfileRow[];
}

export interface ClimbInputs {
  mass: number;
  elevation: number;
  qnh: number;
  oat: number;
  wheelFairings: boolean;
  flapRetractionHeight: number;
  cruiseAltitude: number;
}

/** Interpolation detail for a single ROC lookup */
export interface ClimbRocDetail {
  lowerWeight: number;
  upperWeight: number;
  weightFraction: number;
  lowerPa: number;
  upperPa: number;
  paFraction: number;
  lowerOat: number;
  upperOat: number;
  oatFraction: number;
  lowerTableRoc: number;
  upperTableRoc: number;
  baseRoc: number;
  fairingsPenalty: number;
  finalRoc: number;
}

/** Climb segment result from 5.3.10 subtraction method */
export interface ClimbSegmentResult {
  departurePa: number;
  cruisePa: number;
  /** Interpolated row at departure PA */
  departureTime: number;
  departureFuel: number;
  departureDistance: number;
  /** Interpolated row at cruise PA */
  cruiseTime: number;
  cruiseFuel: number;
  cruiseDistance: number;
  /** Subtracted raw values */
  rawTime: number;
  rawFuel: number;
  rawDistance: number;
  /** ISA deviation used for correction */
  isaDev: number;
  /** ISA correction factors applied */
  isaTimeFuelFactor: number;
  isaDistanceFactor: number;
  /** Final corrected values */
  time: number;
  fuel: number;
  distance: number;
}

export interface ClimbWarning {
  level: 'amber' | 'red';
  message: string;
}

export interface ClimbResult {
  // Derived conditions
  pressureAltitude: number;
  densityAltitude: number;
  isaTemperature: number;
  isaDeviation: number;
  cruisePa: number;
  // T/O climb ROC (5.3.8)
  takeoffClimbRoc: number;
  takeoffClimbGradient: number;
  takeoffClimbTas: number;
  takeoffClimbDetail: ClimbRocDetail | null;
  // Cruise climb ROC (5.3.9)
  cruiseClimbRoc: number;
  cruiseClimbGradient: number;
  cruiseClimbTas: number;
  cruiseClimbDetail: ClimbRocDetail | null;
  // Climb segment (5.3.10)
  climbSegment: ClimbSegmentResult | null;
  // Warnings
  warnings: ClimbWarning[];
}
