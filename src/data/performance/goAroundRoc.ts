import type { GoAroundRocTable } from '@/lib/types';

/**
 * AFM 5.3.14 — Go-Around Climb Performance
 *
 * Conditions: Power MAX, Flaps LDG, Airspeed vRef
 * - 77 KIAS at 1280 kg and 1310 kg
 * - 76 KIAS at 1200 kg
 * - 72 KIAS at 1100 kg
 *
 * Each table: 6 pressure altitudes (SL–10000 ft) × 8 OAT columns (-20 to +50°C).
 * Values are ROC in ft/min. null = N/A (hatched area in AFM).
 *
 * Source: Doc. #6.01.15-E Rev.3, pages 5-39 to 5-40
 */

const PA_ROWS = [0, 2000, 4000, 6000, 8000, 10000];
const OAT_COLS = [-20, -10, 0, 10, 20, 30, 40, 50];

export const goAroundRocTable1310: GoAroundRocTable = {
  weight: 1310,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [410, 405, 395, 390, 385, 375, 360, 335],
    // 2000 ft
    [395, 390, 380, 375, 370, 360, 340, 310],
    // 4000 ft
    [380, 375, 365, 360, 350, 340, 315, 285],
    // 6000 ft
    [365, 360, 350, 345, 335, 315, 285, null],
    // 8000 ft
    [350, 345, 335, 320, 310, 280, 250, null],
    // 10000 ft
    [330, 320, 310, 295, 275, 240, null, null],
  ],
};

export const goAroundRocTable1280: GoAroundRocTable = {
  weight: 1280,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [425, 415, 410, 400, 395, 385, 370, 345],
    // 2000 ft
    [410, 400, 395, 385, 380, 370, 350, 320],
    // 4000 ft
    [395, 385, 380, 370, 365, 350, 325, 295],
    // 6000 ft
    [380, 370, 360, 355, 345, 325, 295, null],
    // 8000 ft
    [360, 355, 345, 330, 320, 290, 260, null],
    // 10000 ft
    [345, 330, 320, 305, 285, 250, null, null],
  ],
};

export const goAroundRocTable1200: GoAroundRocTable = {
  weight: 1200,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [505, 500, 495, 490, 480, 475, 460, 425],
    // 2000 ft
    [495, 490, 480, 475, 465, 460, 435, 400],
    // 4000 ft
    [480, 475, 465, 455, 450, 435, 410, 375],
    // 6000 ft
    [465, 455, 450, 440, 435, 410, 380, null],
    // 8000 ft
    [450, 440, 430, 425, 410, 380, 345, null],
    // 10000 ft
    [430, 420, 410, 395, 375, 335, null, null],
  ],
};

export const goAroundRocTable1100: GoAroundRocTable = {
  weight: 1100,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [615, 615, 610, 605, 605, 595, 575, 535],
    // 2000 ft
    [610, 605, 605, 595, 585, 580, 550, 510],
    // 4000 ft
    [605, 595, 585, 580, 570, 555, 520, 480],
    // 6000 ft
    [585, 575, 570, 560, 550, 525, 490, null],
    // 8000 ft
    [570, 560, 550, 540, 530, 495, 455, null],
    // 10000 ft
    [550, 540, 530, 520, 495, 450, null, null],
  ],
};

/** All go-around ROC tables, sorted descending by weight */
export const goAroundRocTables: GoAroundRocTable[] = [
  goAroundRocTable1310,
  goAroundRocTable1280,
  goAroundRocTable1200,
  goAroundRocTable1100,
];
