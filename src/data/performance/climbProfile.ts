import type { ClimbProfileTable } from '@/lib/types';

/**
 * AFM 5.3.10 — Time, Fuel and Distance to Climb
 *
 * Conditions: Power 92% or max. 2100 RPM, Flaps UP, v_y 88 KIAS
 *
 * Values are cumulative from sea level at ISA conditions.
 * To find climb from PA_1 to PA_2: subtract PA_1 row from PA_2 row.
 *
 * ISA correction: add 5% to time & fuel, 10% to distance
 * for each 10°C above ISA.
 *
 * Distances based on zero wind. Fuel for start, taxi and take-off not included.
 *
 * Source: Doc. #6.01.15-E Rev.3, pages 5-24/5-25
 */

export const climbProfileTable1310: ClimbProfileTable = {
  weight: 1310,
  rows: [
    { pressureAltitude: 0,     oat: 15,  tas: 87, roc: 650, rocMs: 3.3, time: 0,  fuel: 0.0, distance: 0  },
    { pressureAltitude: 2000,  oat: 11,  tas: 88, roc: 645, rocMs: 3.3, time: 3,  fuel: 0.4, distance: 5  },
    { pressureAltitude: 4000,  oat: 7,   tas: 90, roc: 645, rocMs: 3.3, time: 6,  fuel: 0.9, distance: 9  },
    { pressureAltitude: 6000,  oat: 3,   tas: 91, roc: 640, rocMs: 3.2, time: 9,  fuel: 1.3, distance: 14 },
    { pressureAltitude: 8000,  oat: -1,  tas: 92, roc: 630, rocMs: 3.2, time: 13, fuel: 1.8, distance: 19 },
    { pressureAltitude: 10000, oat: -5,  tas: 94, roc: 625, rocMs: 3.2, time: 16, fuel: 2.2, distance: 25 },
    { pressureAltitude: 12000, oat: -9,  tas: 95, roc: 620, rocMs: 3.2, time: 19, fuel: 2.7, distance: 31 },
    { pressureAltitude: 14000, oat: -13, tas: 97, roc: 615, rocMs: 3.1, time: 23, fuel: 3.1, distance: 37 },
    { pressureAltitude: 16000, oat: -17, tas: 98, roc: 605, rocMs: 3.1, time: 26, fuel: 3.7, distance: 43 },
  ],
};

export const climbProfileTable1280: ClimbProfileTable = {
  weight: 1280,
  rows: [
    { pressureAltitude: 0,     oat: 15,  tas: 87, roc: 675, rocMs: 3.4, time: 0,  fuel: 0.0, distance: 0  },
    { pressureAltitude: 2000,  oat: 11,  tas: 88, roc: 670, rocMs: 3.4, time: 3,  fuel: 0.4, distance: 4  },
    { pressureAltitude: 4000,  oat: 7,   tas: 90, roc: 665, rocMs: 3.4, time: 6,  fuel: 0.8, distance: 9  },
    { pressureAltitude: 6000,  oat: 3,   tas: 91, roc: 660, rocMs: 3.4, time: 9,  fuel: 1.3, distance: 14 },
    { pressureAltitude: 8000,  oat: -1,  tas: 92, roc: 655, rocMs: 3.3, time: 12, fuel: 1.7, distance: 19 },
    { pressureAltitude: 10000, oat: -5,  tas: 94, roc: 650, rocMs: 3.3, time: 15, fuel: 2.1, distance: 24 },
    { pressureAltitude: 12000, oat: -9,  tas: 95, roc: 645, rocMs: 3.3, time: 19, fuel: 2.6, distance: 29 },
    { pressureAltitude: 14000, oat: -13, tas: 97, roc: 635, rocMs: 3.2, time: 22, fuel: 3.0, distance: 36 },
    { pressureAltitude: 16000, oat: -17, tas: 98, roc: 630, rocMs: 3.2, time: 25, fuel: 3.5, distance: 41 },
  ],
};

export const climbProfileTable1200: ClimbProfileTable = {
  weight: 1200,
  rows: [
    { pressureAltitude: 0,     oat: 15,  tas: 87, roc: 740, rocMs: 3.8, time: 0,  fuel: 0.0, distance: 0  },
    { pressureAltitude: 2000,  oat: 11,  tas: 88, roc: 735, rocMs: 3.7, time: 3,  fuel: 0.4, distance: 4  },
    { pressureAltitude: 4000,  oat: 7,   tas: 90, roc: 730, rocMs: 3.7, time: 5,  fuel: 0.8, distance: 8  },
    { pressureAltitude: 6000,  oat: 3,   tas: 91, roc: 725, rocMs: 3.7, time: 8,  fuel: 1.1, distance: 13 },
    { pressureAltitude: 8000,  oat: -1,  tas: 92, roc: 720, rocMs: 3.7, time: 11, fuel: 1.5, distance: 17 },
    { pressureAltitude: 10000, oat: -5,  tas: 94, roc: 715, rocMs: 3.6, time: 14, fuel: 1.9, distance: 22 },
    { pressureAltitude: 12000, oat: -9,  tas: 95, roc: 710, rocMs: 3.6, time: 17, fuel: 2.3, distance: 27 },
    { pressureAltitude: 14000, oat: -13, tas: 97, roc: 700, rocMs: 3.6, time: 20, fuel: 2.8, distance: 32 },
    { pressureAltitude: 16000, oat: -17, tas: 98, roc: 695, rocMs: 3.5, time: 23, fuel: 3.2, distance: 38 },
  ],
};

export const climbProfileTable1100: ClimbProfileTable = {
  weight: 1100,
  rows: [
    { pressureAltitude: 0,     oat: 15,  tas: 87, roc: 830, rocMs: 4.2, time: 0,  fuel: 0.0, distance: 0  },
    { pressureAltitude: 2000,  oat: 11,  tas: 88, roc: 830, rocMs: 4.2, time: 2,  fuel: 0.3, distance: 4  },
    { pressureAltitude: 4000,  oat: 7,   tas: 90, roc: 825, rocMs: 4.2, time: 5,  fuel: 0.7, distance: 7  },
    { pressureAltitude: 6000,  oat: 3,   tas: 91, roc: 820, rocMs: 4.2, time: 7,  fuel: 1.0, distance: 11 },
    { pressureAltitude: 8000,  oat: -1,  tas: 92, roc: 810, rocMs: 4.1, time: 10, fuel: 1.4, distance: 15 },
    { pressureAltitude: 10000, oat: -5,  tas: 94, roc: 805, rocMs: 4.1, time: 12, fuel: 1.7, distance: 19 },
    { pressureAltitude: 12000, oat: -9,  tas: 95, roc: 800, rocMs: 4.1, time: 15, fuel: 2.1, distance: 24 },
    { pressureAltitude: 14000, oat: -13, tas: 97, roc: 795, rocMs: 4.0, time: 18, fuel: 2.4, distance: 28 },
    { pressureAltitude: 16000, oat: -17, tas: 98, roc: 785, rocMs: 4.0, time: 20, fuel: 2.8, distance: 33 },
  ],
};

/** All tables sorted by weight descending (for bracket lookup) */
export const climbProfileTables: ClimbProfileTable[] = [
  climbProfileTable1310,
  climbProfileTable1280,
  climbProfileTable1200,
  climbProfileTable1100,
];
