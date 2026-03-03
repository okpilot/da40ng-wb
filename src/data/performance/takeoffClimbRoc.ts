import type { ClimbRocTable } from '@/lib/types';

/**
 * AFM 5.3.8 — Climb Performance — Take-Off Climb
 *
 * Conditions: Power 92% or max. 2100 RPM, Flaps T/O, v_y 72 KIAS
 *
 * Each table: 10 pressure altitudes (SL–16400 ft) × 8 OAT columns (-20–50°C).
 * Cell: ROC in ft/min, null = N/A (hatched area in AFM).
 *
 * NOTE: Without wheel fairings, ROC decreased by 20 ft/min.
 *
 * Source: Doc. #6.01.15-E Rev.3, pages 5-18/5-19
 */

const PA_ROWS = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 16400];
const OAT_COLS = [-20, -10, 0, 10, 20, 30, 40, 50];

export const takeoffClimbRocTable1310: ClimbRocTable = {
  weight: 1310,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [660, 650, 640, 630, 620, 615, 590, 550],
    // 2000 ft
    [640, 630, 620, 610, 605, 595, 555, 515],
    // 4000 ft
    [620, 610, 600, 595, 585, 560, 520, 475],
    // 6000 ft
    [600, 590, 580, 570, 555, 520, 475, null],
    // 8000 ft
    [580, 570, 555, 540, 525, 480, 435, null],
    // 10000 ft
    [555, 540, 525, 510, 480, 435, null, null],
    // 12000 ft
    [525, 510, 495, 480, 435, 400, null, null],
    // 14000 ft
    [500, 485, 475, 460, 425, 360, null, null],
    // 16000 ft
    [490, 470, 440, 385, 325, null, null, null],
    // 16400 ft
    [475, 450, 420, 370, 305, null, null, null],
  ],
};

export const takeoffClimbRocTable1280: ClimbRocTable = {
  weight: 1280,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [675, 665, 655, 645, 635, 625, 600, 560],
    // 2000 ft
    [655, 645, 635, 625, 615, 605, 570, 525],
    // 4000 ft
    [635, 625, 615, 605, 595, 575, 530, 485],
    // 6000 ft
    [615, 605, 595, 580, 570, 535, 485, null],
    // 8000 ft
    [595, 580, 565, 550, 535, 490, 445, null],
    // 10000 ft
    [565, 550, 535, 520, 490, 445, null, null],
    // 12000 ft
    [535, 520, 505, 490, 445, 410, null, null],
    // 14000 ft
    [510, 495, 485, 470, 430, 370, null, null],
    // 16000 ft
    [500, 480, 450, 395, 330, null, null, null],
    // 16400 ft
    [485, 460, 430, 375, 310, null, null, null],
  ],
};

export const takeoffClimbRocTable1200: ClimbRocTable = {
  weight: 1200,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [740, 730, 720, 710, 700, 690, 665, 620],
    // 2000 ft
    [720, 710, 700, 690, 680, 670, 630, 585],
    // 4000 ft
    [700, 690, 680, 670, 660, 635, 590, 540],
    // 6000 ft
    [680, 670, 660, 645, 630, 595, 545, null],
    // 8000 ft
    [660, 645, 630, 615, 600, 545, 500, null],
    // 10000 ft
    [630, 615, 600, 585, 550, 500, null, null],
    // 12000 ft
    [595, 580, 565, 550, 505, 460, null, null],
    // 14000 ft
    [575, 560, 545, 530, 490, 420, null, null],
    // 16000 ft
    [560, 540, 510, 450, 380, null, null, null],
    // 16400 ft
    [545, 520, 490, 430, 360, null, null, null],
  ],
};

export const takeoffClimbRocTable1100: ClimbRocTable = {
  weight: 1100,
  pressureAltitudes: PA_ROWS,
  oats: OAT_COLS,
  rows: [
    // SL
    [835, 825, 815, 800, 795, 785, 755, 705],
    // 2000 ft
    [815, 805, 790, 780, 770, 760, 715, 665],
    // 4000 ft
    [795, 780, 770, 760, 750, 725, 670, 615],
    // 6000 ft
    [770, 760, 750, 735, 720, 680, 625, null],
    // 8000 ft
    [750, 735, 720, 705, 685, 630, 575, null],
    // 10000 ft
    [720, 700, 685, 670, 635, 580, null, null],
    // 12000 ft
    [685, 665, 650, 635, 585, 535, null, null],
    // 14000 ft
    [660, 645, 630, 615, 570, 495, null, null],
    // 16000 ft
    [650, 625, 590, 530, 455, null, null, null],
    // 16400 ft
    [630, 605, 570, 505, 430, null, null, null],
  ],
};

/** All tables sorted by weight descending (for bracket lookup) */
export const takeoffClimbRocTables: ClimbRocTable[] = [
  takeoffClimbRocTable1310,
  takeoffClimbRocTable1280,
  takeoffClimbRocTable1200,
  takeoffClimbRocTable1100,
];
