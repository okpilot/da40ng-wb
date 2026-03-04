import type { TourStep } from './tourSteps';

export const cruiseTourSteps: TourStep[] = [
  {
    target: '[data-tour="perf-header"]',
    title: 'Cruise Performance Calculator',
    content:
      'This calculator computes cruise TAS and fuel flow using AFM 5.3.11 tables. It interpolates by pressure altitude and ISA deviation, then plans range and endurance accounting for reserves, climb, and alternate fuel.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cr-aircraft-config"]',
    title: 'Aircraft Configuration',
    content:
      'Weight is fixed at 1310 kg MTOM and flaps UP — the AFM 5.3.11 table is published for this single configuration. Toggle wheel fairings off if removed — TAS is reduced by 4%.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cr-cruise-conditions"]',
    title: 'Cruise Conditions',
    content:
      'Enter cruise altitude, QNH, and OAT. If the climb segment is enabled, these lock to values from the Climb tab. Choose a power setting (92/75/60/45%) and enter your usable fuel — use the Std 28 or LR 39 presets for quick entry.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cr-advisory"]',
    title: 'Advisory Data',
    content:
      'Shows derived conditions (pressure altitude, density altitude, ISA deviation) and correction factors. The climb segment toggle links fuel, time, and distance from the Climb tab so they are deducted from your trip fuel.',
    placement: 'left',
  },
  {
    target: '[data-tour="cr-reserve"]',
    title: 'Reserve & Alternate',
    content:
      'Set VFR (30 min) or IFR (45 min) final reserve at 4.0 USG/h (AFM 5.3.2, 45% power). Enter alternate distance and altitude to compute alternate fuel — it interpolates FF and TAS at the alternate pressure altitude.',
    placement: 'left',
  },
  {
    target: '[data-tour="cr-results"]',
    title: 'Results',
    content:
      'TAS, fuel flow, trip range, and trip endurance. Range and endurance account for reserve, climb, and alternate fuel. The fuel breakdown summary below shows how usable fuel is allocated.',
    placement: 'top',
  },
  {
    target: '[data-tour="cr-show-working"]',
    title: 'Calculation Breakdown',
    content:
      'Expand this to see the full AFM 5.3.11 table with highlighted brackets, bilinear interpolation between PA and ISA deviation, and the complete fuel planning breakdown.',
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
