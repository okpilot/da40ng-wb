export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: TourPlacement;
}

export const tourSteps: TourStep[] = [
  {
    target: '[data-tour="header"]',
    title: 'Welcome to the DA40 NG M&B Calculator',
    content:
      'This tool helps you compute mass and balance for the Diamond DA40 NG. Work your way top-to-bottom — just like the real loading sheet.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="bem-inputs"]',
    title: 'Basic Empty Mass (BEM)',
    content:
      'Enter the BEM mass and CG from your aircraft\'s weighing report. The moment is computed automatically.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tank-config"]',
    title: 'Fuel Tank Configuration',
    content:
      'Select Standard (28 USG / 106 L) or Long Range (39 USG / 148 L) to match your aircraft. This sets the maximum fuel you can enter later.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="modifications"]',
    title: 'Installed Modifications',
    content:
      'Toggle any STCs or modifications installed on your aircraft. These affect mass limits and the CG envelope.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="loading-table"]',
    title: 'Mass & Balance Sheet',
    content:
      'This table mirrors the official AFM loading sheet. Each row shows mass, arm, and moment. Subtotals are computed automatically.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="payload-stations"]',
    title: 'Payload Stations',
    content:
      'Enter the mass of each occupant and baggage. Per-station limits are shown in parentheses.',
    placement: 'right',
  },
  {
    target: '[data-tour="zfm-row"]',
    title: 'Zero Fuel Mass (ZFM)',
    content:
      'The ZFM subtotal is BEM + payload. Check the MZFM limit and CG envelope indicators before continuing to fuel.',
    placement: 'right',
  },
  {
    target: '[data-tour="fuel-section"]',
    title: 'Fuel & Final Masses',
    content:
      'Enter take-off fuel and trip fuel (burn). The calculator shows Take-off Mass (TOM) and Landing Mass (LM) with their limit checks.',
    placement: 'right',
  },
  {
    target: '[data-tour="cg-envelope"]',
    title: 'CG Envelope Chart',
    content:
      'The chart plots ZFM, TOM, and LM in real time. All three points must fall inside the envelope for the flight to be within limits.',
    placement: 'left',
  },
  {
    target: '[data-tour="footer-disclaimer"]',
    title: 'Important Disclaimer',
    content:
      'This calculator is for training purposes only. Always verify data against the actual AFM for your specific aircraft.',
    placement: 'top',
  },
  {
    target: '[data-tour="learn-button"]',
    title: 'Want to Learn More?',
    content:
      'Head to the Learn module for theory on mass & balance — including worked examples, diagrams, and quizzes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tour-button"]',
    title: 'Replay This Tour',
    content:
      'You can restart this walkthrough any time by clicking this icon.',
    placement: 'bottom',
  },
];
