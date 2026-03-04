import type { TourStep } from './tourSteps';

export const landingTourSteps: TourStep[] = [
  {
    target: '[data-tour="perf-header"]',
    title: 'Landing Performance Calculator',
    content:
      'This calculator computes landing distances using AFM 5.3.12 (normal flaps), 5.3.13 (abnormal flaps), and go-around ROC from 5.3.14. It interpolates by mass and pressure altitude, then applies corrections for surface, slope, weather, and wind.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ld-aircraft-config"]',
    title: 'Aircraft Configuration',
    content:
      'Enter your Landing Mass. Select flap setting — LDG (normal, AFM 5.3.12) or T/O / UP (abnormal, AFM 5.3.13). Toggle wheel fairings off if removed. vRef speeds change with mass and flap setting.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ld-aerodrome"]',
    title: 'Aerodrome & Runway',
    content:
      'Enter the landing aerodrome details from the AIP — ICAO, designator, heading, threshold and end elevations. LDA (Landing Distance Available) is the key constraint. Use "Sync from Take-off" to copy aerodrome data, or save/load setups independently.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ld-weather"]',
    title: 'Weather Conditions',
    content:
      'Enter wind, OAT, QNH, and runway condition (Dry or Wet). Wind is true, not magnetic. Wet paved runways add 15% to both ground roll and over-50 ft distance. Grass corrections include dry (+30/45%) and wet grass (+15% on top).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ld-advisory"]',
    title: 'Advisory Data',
    content:
      'Shows derived conditions (PA, DA, ISA deviation, wind components) and every correction factor applied step by step — surface, slope, wet, and wind. Each step shows the AFM rule, the math, and the resulting GR and D50 values.',
    placement: 'left',
  },
  {
    target: '[data-tour="ld-results"]',
    title: 'Results',
    content:
      'Landing Roll (LR), Landing Distance Required over 50 ft (LDR), vRef for your flap setting, go-around ROC and gradient (AFM 5.3.14), and wind compass. LDR is colour-coded against LDA: green (≤70%), amber (70–100%), red (exceeds).',
    placement: 'top',
  },
  {
    target: '[data-tour="ld-runway-diagram"]',
    title: 'Runway Diagram',
    content:
      'A visual representation of your landing. The dashed line shows where LDR falls on the runway. The red line marks the LDA limit. Colouring matches your margin — green, amber, or red.',
    placement: 'top',
  },
  {
    target: '[data-tour="ld-show-working"]',
    title: 'Calculation Breakdown',
    content:
      'Expand this to see every step: AFM table values, bilinear interpolation between mass and pressure altitude, each correction applied, vRef lookup, and go-around ROC computation.',
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
