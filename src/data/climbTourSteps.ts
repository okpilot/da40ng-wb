import type { TourStep } from './tourSteps';

export const climbTourSteps: TourStep[] = [
  {
    target: '[data-tour="perf-header"]',
    title: 'Climb Performance Calculator',
    content:
      'This calculator computes climb performance using AFM 5.3.8 (T/O climb ROC), 5.3.9 (cruise climb ROC), and 5.3.10 (time/fuel/distance to TOC). It shows rate of climb, gradient, and the full climb profile from departure to top of climb.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cl-aircraft-config"]',
    title: 'Aircraft Configuration',
    content:
      'Enter your Take-Off Mass. Flaps transition from T/O to UP at the retraction height. Toggle wheel fairings off if removed — this reduces ROC by 20 fpm (T/O climb) and 40 fpm (cruise climb).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cl-departure"]',
    title: 'Departure Conditions',
    content:
      'Enter departure elevation, QNH, and OAT. Use "Sync from Take-off" to pull values from the take-off tab so you don\'t have to re-enter them.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cl-parameters"]',
    title: 'Climb Parameters',
    content:
      'Flap retraction height splits the climb into two phases — T/O climb (flaps T/O, Vy 72 KIAS) below, and cruise climb (flaps UP, Vy 88 KIAS) above. Cruise altitude defines the top of climb (TOC).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cl-correction-factors"]',
    title: 'Correction Factors',
    content:
      'Shows the AFM assumptions and any corrections applied. Wheel fairings penalty affects ROC. ISA deviation above standard increases time, fuel, and distance via the 5.3.10 correction factors.',
    placement: 'left',
  },
  {
    target: '[data-tour="cl-results"]',
    title: 'Results',
    content:
      'The ROC/gradient table shows values at each climb phase — T/O climb, cruise climb start, average, and TOC. Colour coding: green (≥3.3% gradient), amber (2–3.3%), red (<2%). Time, fuel, and distance from departure to TOC are shown on the right.',
    placement: 'top',
  },
  {
    target: '[data-tour="cl-diagram"]',
    title: 'Climb Profile',
    content:
      'A side-view diagram showing the climb from departure to TOC. Each segment (DEP→FRA→TOC) is colour-coded by gradient quality. Altitude labels show both elevation and pressure altitude.',
    placement: 'top',
  },
  {
    target: '[data-tour="cl-show-working"]',
    title: 'Calculation Breakdown',
    content:
      'Expand this to see the full working: AFM table lookups, bilinear interpolation between weight and pressure altitude brackets, ISA correction factors, and step-by-step subtraction for time/fuel/distance.',
    placement: 'top',
  },
  {
    target: '[data-tour="perf-tour-button"]',
    title: 'Replay This Tour',
    content:
      'Click this button any time to replay the tour.',
    placement: 'bottom',
  },
];
