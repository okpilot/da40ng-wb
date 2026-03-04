import type { TourStep } from './tourSteps';

export const takeoffTourSteps: TourStep[] = [
  {
    target: '[data-tour="perf-header"]',
    title: 'Take-Off Performance Calculator',
    content:
      'This calculator computes take-off distances using the AFM 5.3.7 tables. Enter your aircraft config, aerodrome, and weather — the app interpolates the tables and applies corrections automatically.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-aircraft-config"]',
    title: 'Aircraft Configuration',
    content:
      'Enter your Take-Off Mass from the M&B sheet. Flaps are fixed at the take-off setting. Toggle wheel fairings off if removed — this adds a correction to your distances.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-aerodrome"]',
    title: 'Aerodrome & Runway',
    content:
      'Enter the aerodrome and runway details from the AIP. Always use the most up-to-date AIP data — ICAO code, elevation, runway designator, heading, and threshold/DER elevations. Slope is calculated automatically from the elevation difference.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-save-load"]',
    title: 'Save & Load',
    content:
      'Save your aerodrome setup for quick recall — all runway data, intersections, and surface settings are preserved. Data is stored locally in your browser only, not in any database. Use the load button to switch between saved aerodromes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-surface"]',
    title: 'Runway Surface',
    content:
      'Select the runway surface. Grass runways get additional corrections — short grass (≤5 cm) adds 30%, long grass (>5 cm) adds 45%. Soft ground adds a further 20%.',
    placement: 'right',
  },
  {
    target: '[data-tour="to-distances"]',
    title: 'Declared Distances',
    content:
      'Enter TORA, TODA, and ASDA from the AIP. Always verify these against the latest published data. TODA = TORA + clearway, ASDA = TORA + stopway. Under Part NCO, TORA is the binding constraint.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-departure"]',
    title: 'Departure Point',
    content:
      'Select your departure point — full length or an intersection. You can add custom intersections with their own declared distances. Check the AIP for published intersection distances.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-weather"]',
    title: 'Weather Conditions',
    content:
      'Enter wind, OAT, and QNH from the ATIS or weather briefing. Wind direction is true (not magnetic). Select Dry (RWYCC 6) or Wet (RWYCC 5). Note: there is no AFM correction for wet paved take-off — an advisory caution is shown instead.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="to-advisory"]',
    title: 'Advisory Data',
    content:
      'These values are computed from your inputs. Pressure altitude and ISA deviation drive the AFM table lookup. Wind is split into head/tail and crosswind components. The correction factors show every adjustment applied to the base distance.',
    placement: 'left',
  },
  {
    target: '[data-tour="to-results"]',
    title: 'Results',
    content:
      'Your computed distances and speeds. TODR is colour-coded: green (≤70% of TORA), amber (70–100%), red (>100% — exceeds available runway). V_R and V_50 are interpolated for your mass.',
    placement: 'top',
  },
  {
    target: '[data-tour="to-runway-diagram"]',
    title: 'Runway Diagram',
    content:
      'A visual representation of your take-off. The dashed line shows where TODR falls on the runway. Below: declared distances (TORA in blue). The red line marks the binding limit. Colouring matches your margin.',
    placement: 'top',
  },
  {
    target: '[data-tour="to-cat-factors"]',
    title: 'CAT Safety Factors',
    content:
      'Part CAT operations require additional safety factors (CAT.POL.A.305). This section divides your available distances by the regulatory factors and checks all three constraints. Expand for the detailed breakdown.',
    placement: 'top',
  },
  {
    target: '[data-tour="to-show-working"]',
    title: 'Calculation Breakdown',
    content:
      'Expand this to see every step: AFM table values, bilinear interpolation, each correction applied, and the regulatory comparison. Useful for verifying against a manual calculation.',
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
