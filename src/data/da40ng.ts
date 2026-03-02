import type { AircraftData } from '@/lib/types';

export const da40ng: AircraftData = {
  name: 'DA40 NG',

  stations: [
    { id: 'front', label: 'Front Seats', arm: 2.30, maxMass: 200 },
    { id: 'rear', label: 'Rear Seats', arm: 3.25, maxMass: 200 },
    { id: 'baggage-std', label: 'Baggage Compartment', arm: 3.65, maxMass: 20 },
    {
      id: 'baggage-tube',
      label: 'Baggage Tube',
      arm: 4.32,
      maxMass: 18,
      requiresMods: ['oam40-164'],
    },
    {
      id: 'baggage-ext-short',
      label: 'Baggage Ext. (Short)',
      arm: 3.97,
      maxMass: 45,
      requiresMods: ['oam40-331'],
    },
    {
      id: 'baggage-ext-fwd',
      label: 'Baggage Ext. Fwd',
      arm: 3.89,
      maxMass: 45,
      requiresMods: ['oam40-331'],
    },
    {
      id: 'baggage-ext-aft',
      label: 'Baggage Ext. Aft',
      arm: 4.54,
      maxMass: 45,
      requiresMods: ['oam40-331'],
    },
  ],

  modifications: [
    {
      id: 'mam40-662',
      label: 'MÄM 40-662',
      description: 'MTOM increase to 1310 kg',
      limitOverrides: { mtom: 1310 },
    },
    {
      id: 'mam40-574',
      label: 'MÄM 40-574',
      description: 'MLM 1280 kg / MZFM 1265 kg',
      limitOverrides: { maxLanding: 1280, maxZfm: 1265 },
    },
    {
      id: 'oam40-164',
      label: 'OÄM 40-164',
      description: 'Baggage tube',
    },
    {
      id: 'oam40-331',
      label: 'OÄM 40-331',
      description: 'Baggage extension',
    },
  ],

  baseLimits: {
    mtom: 1280,
    maxLanding: 1216,
    maxZfm: 1200,
    minFlight: 940,
  },

  tanks: {
    standard: { usableUsg: 28, usableLitres: 106, usableKg: 89 },
    'long-range': { usableUsg: 39, usableLitres: 147.6, usableKg: 124 },
  },

  fuelDensity: 0.84,
  usgToLitres: 3.785411784,

  // Forward CG limit: 2.40m from 940–1080kg, then linear to 2.46m at 1280kg
  fwdCgLimit: [
    { mass: 940, cg: 2.40 },
    { mass: 1080, cg: 2.40 },
    { mass: 1280, cg: 2.46 },
  ],

  // Extended fwd CG limit with MÄM 40-662: continues to 2.469m at 1310kg
  fwdCgLimitExtended: [
    { mass: 940, cg: 2.40 },
    { mass: 1080, cg: 2.40 },
    { mass: 1280, cg: 2.46 },
    { mass: 1310, cg: 2.469 },
  ],

  // Aft CG limit: constant 2.53m
  aftCgLimit: [
    { mass: 940, cg: 2.53 },
    { mass: 1310, cg: 2.53 },
  ],

  defaultBem: { mass: 940, cg: 2.442 },
};
