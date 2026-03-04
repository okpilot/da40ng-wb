import type { ClimbRocTable } from '@/lib/types';

/**
 * AFM 5.3.9 — Climb Performance — Cruise Climb
 *
 * Conditions: Power 92% or max. 2100 RPM, Flaps UP, v_y 88 KIAS
 *
 * Each table: 10 pressure altitudes (SL–16400 ft) × 8 OAT columns (-20–50°C).
 * Cell: ROC in ft/min, null = N/A (hatched area in AFM).
 *
 * NOTE: Without wheel fairings, ROC decreased by 40 ft/min.
 *
 * Source: Doc. #6.01.15-E Rev.3, pages 5-21/5-22
 */

const PA_ROWS = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 16400];
const OAT_COLS = [-20, -10, 0, 10, 20, 30, 40, 50];

export const cruiseClimbRocTable1310: ClimbRocTable = {
  weight: 1310,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [665, 660, 655, 650, 645, 645, 620, 585],
    // 2000 ft
    [655, 650, 645, 640, 635, 630, 595, 555],
    // 4000 ft
    [645, 640, 635, 630, 620, 605, 565, 525],
    // 6000 ft
    [635, 630, 620, 615, 605, 580, 540, null],
    // 8000 ft
    [620, 615, 605, 600, 590, 550, 505, null],
    // 10000 ft
    [605, 600, 590, 580, 555, 510, null, null],
    // 12000 ft
    [590, 580, 570, 560, 520, 480, null, null],
    // 14000 ft
    [575, 565, 555, 540, 500, 445, null, null],
    // 16000 ft
    [560, 550, 520, 470, 405, null, null, null],
    // 16400 ft
    [545, 535, 500, 450, 380, null, null, null],
  ],
};

export const cruiseClimbRocTable1280: ClimbRocTable = {
  weight: 1280,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [690, 685, 680, 675, 670, 665, 645, 605],
    // 2000 ft
    [680, 675, 670, 665, 660, 655, 615, 575],
    // 4000 ft
    [670, 665, 660, 650, 645, 630, 590, 545],
    // 6000 ft
    [660, 650, 645, 635, 630, 600, 560, null],
    // 8000 ft
    [645, 635, 630, 620, 610, 570, 525, null],
    // 10000 ft
    [630, 620, 615, 605, 580, 535, null, null],
    // 12000 ft
    [615, 605, 590, 580, 540, 500, null, null],
    // 14000 ft
    [595, 585, 580, 560, 525, 465, null, null],
    // 16000 ft
    [585, 575, 545, 490, 425, null, null, null],
    // 16400 ft
    [570, 555, 525, 470, 400, null, null, null],
  ],
};

export const cruiseClimbRocTable1200: ClimbRocTable = {
  weight: 1200,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [750, 750, 745, 740, 735, 730, 705, 665],
    // 2000 ft
    [745, 740, 735, 730, 725, 720, 680, 635],
    // 4000 ft
    [735, 730, 725, 715, 710, 690, 650, 605],
    // 6000 ft
    [725, 715, 710, 700, 695, 660, 620, null],
    // 8000 ft
    [710, 700, 695, 685, 675, 630, 585, null],
    // 10000 ft
    [695, 685, 680, 670, 640, 590, null, null],
    // 12000 ft
    [680, 665, 655, 645, 600, 560, null, null],
    // 14000 ft
    [660, 650, 640, 625, 585, 520, null, null],
    // 16000 ft
    [650, 640, 605, 550, 480, null, null, null],
    // 16400 ft
    [635, 620, 585, 525, 455, null, null, null],
  ],
};

export const cruiseClimbRocTable1100: ClimbRocTable = {
  weight: 1100,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [845, 840, 835, 830, 825, 825, 795, 750],
    // 2000 ft
    [835, 830, 825, 820, 815, 810, 765, 715],
    // 4000 ft
    [825, 820, 815, 810, 800, 785, 735, 685],
    // 6000 ft
    [815, 810, 800, 795, 785, 750, 700, null],
    // 8000 ft
    [800, 795, 785, 780, 765, 715, 665, null],
    // 10000 ft
    [785, 775, 770, 760, 730, 675, null, null],
    // 12000 ft
    [770, 760, 745, 735, 685, 640, null, null],
    // 14000 ft
    [750, 740, 730, 715, 665, 600, null, null],
    // 16000 ft
    [740, 730, 695, 630, 555, null, null, null],
    // 16400 ft
    [725, 705, 675, 605, 525, null, null, null],
  ],
};

/** All tables sorted by weight descending (for bracket lookup) */
export const cruiseClimbRocTables: ClimbRocTable[] = [
  cruiseClimbRocTable1310,
  cruiseClimbRocTable1280,
  cruiseClimbRocTable1200,
  cruiseClimbRocTable1100,
];
