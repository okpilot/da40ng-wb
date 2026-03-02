// Slide type definitions
export type SlideType = 'theory' | 'quiz' | 'exercise' | 'interactive';
export type DiagramType =
  | 'none'
  | 'cg-effects'
  | 'aircraft-side-view'
  | 'seesaw'
  | 'balance'
  | 'envelope'
  | 'fuel';

export interface TheoryContent {
  paragraphs: string[];
  bullets?: string[];
  note?: string;
}

export interface QuizOption {
  label: string;
  correct: boolean;
  explanation: string;
}

export interface QuizContent {
  question: string;
  options: QuizOption[];
}

export interface ExerciseField {
  id: string;
  label: string;
  correctValue: number;
  tolerance: number;
  unit: string;
  hint: string;
}

export interface ExerciseContent {
  description: string;
  fields: ExerciseField[];
  explanation: string;
}

export interface InteractiveContent {
  description: string;
  tool: 'moment-calculator' | 'cg-calculator' | 'fuel-converter' | 'envelope-explorer';
}

export interface Slide {
  id: string;
  section: string;
  title: string;
  type: SlideType;
  diagram: DiagramType;
  content: TheoryContent | QuizContent | ExerciseContent | InteractiveContent;
}

// All 28 slides
export const learnSlides: Slide[] = [
  // ── Section 1: Introduction (3 slides) ──────────────────────
  {
    id: 'intro-what',
    section: 'Introduction',
    title: 'What is Mass & Balance?',
    type: 'theory',
    diagram: 'none',
    content: {
      paragraphs: [
        'Mass & Balance (M&B) is the process of ensuring an aircraft is loaded within its certified weight and centre-of-gravity limits before every flight.',
        'Every aircraft has a maximum takeoff mass (MTOM), a maximum landing mass, and a defined range where the centre of gravity (CG) must fall. Exceeding any of these limits can make the aircraft unsafe to fly.',
        'As a pilot, you are legally responsible for verifying M&B before each flight. This module teaches you how the calculations work so you understand the "why" — not just the "how".',
      ],
      bullets: [
        'M&B ensures structural limits are not exceeded',
        'CG position affects aircraft stability and control',
        'Incorrect loading can lead to loss of control',
        'The pilot-in-command is always responsible',
      ],
    } as TheoryContent,
  },
  {
    id: 'intro-cg-matters',
    section: 'Introduction',
    title: 'Why CG Position Matters',
    type: 'theory',
    diagram: 'cg-effects',
    content: {
      paragraphs: [
        'The centre of gravity (CG) is the point where the aircraft balances. Its position along the longitudinal axis dramatically affects flight characteristics.',
        'A forward CG makes the aircraft more stable but requires more elevator force to flare, increases stall speed, and increases fuel consumption due to the increased tail-down force needed.',
        'An aft CG makes the controls feel lighter and reduces fuel consumption, but reduces stability. If the CG moves too far aft, the aircraft can become uncontrollable — the elevator may not have enough authority to prevent a nose-up pitch that leads to an unrecoverable stall.',
      ],
      note: 'An aft CG beyond limits is the more dangerous condition — it can make the aircraft impossible to recover from a stall or spin.',
    } as TheoryContent,
  },
  {
    id: 'intro-quiz',
    section: 'Introduction',
    title: 'Check Your Understanding',
    type: 'quiz',
    diagram: 'none',
    content: {
      question: 'What is the primary concern if the CG is too far aft?',
      options: [
        {
          label: 'Higher fuel consumption',
          correct: false,
          explanation: 'A forward CG actually increases fuel consumption. An aft CG reduces it — but that\'s not the primary concern.',
        },
        {
          label: 'Reduced stability and potential loss of control',
          correct: true,
          explanation: 'Correct! An aft CG beyond limits reduces stability and can make the aircraft uncontrollable, as the elevator may lack authority to prevent a nose-up pitch.',
        },
        {
          label: 'Higher stall speed',
          correct: false,
          explanation: 'A forward CG increases stall speed. An aft CG actually decreases it, but that\'s not the main danger.',
        },
        {
          label: 'Increased structural stress on the nose gear',
          correct: false,
          explanation: 'Nose gear stress is more associated with a forward CG during landing. The aft CG danger is about controllability.',
        },
      ],
    } as QuizContent,
  },

  // ── Section 2: Key Concepts (5 slides) ──────────────────────
  {
    id: 'concepts-datum',
    section: 'Key Concepts',
    title: 'Datum, Arm, and Station',
    type: 'theory',
    diagram: 'aircraft-side-view',
    content: {
      paragraphs: [
        'Every M&B calculation starts from a reference point called the datum. On the DA40 NG, the datum is at the firewall (the front of the cabin). All distances are measured aft from this point.',
        'The arm is the horizontal distance from the datum to a loading point, measured in metres. Each loading point — called a station — has a fixed arm.',
      ],
      bullets: [
        'Front Seats — arm 2.30 m',
        'Rear Seats — arm 3.25 m',
        'Baggage Compartment — arm 3.65 m',
        'Fuel Tanks — arm 2.63 m',
        'Baggage Tube (with OÄM 40-164) — arm 4.32 m',
      ],
      note: 'Arms are fixed by the aircraft design and published in the AFM. You never need to calculate them.',
    } as TheoryContent,
  },
  {
    id: 'concepts-moment',
    section: 'Key Concepts',
    title: 'Moment: Mass × Arm',
    type: 'theory',
    diagram: 'seesaw',
    content: {
      paragraphs: [
        'A moment is the turning effect of a mass about the datum. It tells you how much rotational influence each item has on the aircraft\'s balance.',
        'Moment = Mass × Arm. The unit is kilogram-metres (kg·m). A heavy item far from the datum has a large moment. A light item close to the datum has a small moment.',
        'Think of a seesaw: a child sitting far from the pivot has more turning effect than a heavier person sitting close. Moments work the same way.',
      ],
      note: 'Example: 80 kg at arm 2.30 m → Moment = 80 × 2.30 = 184.0 kg·m',
    } as TheoryContent,
  },
  {
    id: 'concepts-moment-interactive',
    section: 'Key Concepts',
    title: 'Try It: Moment Calculator',
    type: 'interactive',
    diagram: 'none',
    content: {
      description: 'Enter a mass and arm to see the moment calculated. Try different values to build your intuition for how moments work.',
      tool: 'moment-calculator',
    } as InteractiveContent,
  },
  {
    id: 'concepts-cg',
    section: 'Key Concepts',
    title: 'Centre of Gravity',
    type: 'theory',
    diagram: 'balance',
    content: {
      paragraphs: [
        'The Centre of Gravity (CG) is the single point where the total weight of the aircraft effectively acts. It\'s found by dividing the total moment by the total mass:',
        'CG = Total Moment ÷ Total Mass',
        'For example, if total moment is 2,815 kg·m and total mass is 1,120 kg, then CG = 2,815 ÷ 1,120 = 2.513 m aft of datum.',
        'Every item you add to the aircraft shifts the CG toward that item\'s station. Adding weight to the rear seats (arm 3.25 m) pulls the CG aft. Adding fuel (arm 2.63 m) pulls it slightly forward relative to a high CG.',
      ],
    } as TheoryContent,
  },
  {
    id: 'concepts-cg-interactive',
    section: 'Key Concepts',
    title: 'Try It: CG Calculator',
    type: 'interactive',
    diagram: 'none',
    content: {
      description: 'Add multiple items with different masses and arms to see how each one shifts the CG. Watch how heavy items at extreme arms have the biggest effect.',
      tool: 'cg-calculator',
    } as InteractiveContent,
  },

  // ── Section 3: Mass Definitions (3 slides) ──────────────────
  {
    id: 'mass-definitions',
    section: 'Mass Definitions',
    title: 'BEM, ZFM, TOM, and LM',
    type: 'theory',
    diagram: 'none',
    content: {
      paragraphs: [
        'Aircraft mass is built up in stages. Each stage adds items and has its own limit:',
      ],
      bullets: [
        'Basic Empty Mass (BEM) — The aircraft as delivered: airframe, engine, fixed equipment, unusable fuel, and full oil. For our DA40 NG, the default BEM is 940 kg at CG 2.442 m.',
        'Zero Fuel Mass (ZFM) — BEM plus all payload (passengers, baggage). No fuel yet. Max ZFM = 1200 kg (base).',
        'Takeoff Mass (TOM) — ZFM plus fuel loaded for the flight. Max TOM = MTOM = 1280 kg (base).',
        'Landing Mass (LM) — TOM minus the fuel burned during the trip. Max LM = 1216 kg (base).',
      ],
      note: 'The CG must be within the envelope at ZFM, TOM, and LM — all three conditions are checked.',
    } as TheoryContent,
  },
  {
    id: 'mass-limits',
    section: 'Mass Definitions',
    title: 'Mass Limits',
    type: 'theory',
    diagram: 'none',
    content: {
      paragraphs: [
        'The DA40 NG has base mass limits set by the type certificate. Modifications can increase some of these:',
      ],
      bullets: [
        'MTOM: 1280 kg (1310 kg with MÄM 40-662)',
        'Max Landing: 1216 kg (1280 kg with MÄM 40-574)',
        'Max ZFM: 1200 kg (1265 kg with MÄM 40-574)',
        'Min Flight Mass: 940 kg',
      ],
      note: 'You must check the aircraft\'s technical log to know which modifications are installed. The modification status affects both mass limits and CG envelope boundaries.',
    } as TheoryContent,
  },
  {
    id: 'mass-quiz',
    section: 'Mass Definitions',
    title: 'Check Your Understanding',
    type: 'quiz',
    diagram: 'none',
    content: {
      question: 'Starting from BEM, you add passengers and baggage (but no fuel). What mass condition have you calculated?',
      options: [
        {
          label: 'Takeoff Mass (TOM)',
          correct: false,
          explanation: 'TOM includes fuel. You haven\'t added fuel yet, so this is not TOM.',
        },
        {
          label: 'Zero Fuel Mass (ZFM)',
          correct: true,
          explanation: 'Correct! ZFM = BEM + payload (passengers and baggage), before adding fuel.',
        },
        {
          label: 'Landing Mass (LM)',
          correct: false,
          explanation: 'LM = TOM minus trip fuel. You haven\'t added or subtracted any fuel.',
        },
        {
          label: 'Basic Empty Mass (BEM)',
          correct: false,
          explanation: 'BEM is the empty aircraft. You\'ve added payload, so it\'s no longer BEM.',
        },
      ],
    } as QuizContent,
  },

  // ── Section 4: The CG Envelope (4 slides) ──────────────────
  {
    id: 'envelope-what',
    section: 'The CG Envelope',
    title: 'What is the CG Envelope?',
    type: 'theory',
    diagram: 'envelope',
    content: {
      paragraphs: [
        'The CG envelope is a chart that shows the approved combination of aircraft mass and CG position. It\'s published in the AFM and defines the safe operating boundaries.',
        'The X-axis shows CG position (metres aft of datum) and the Y-axis shows aircraft mass (kg). The shaded polygon is the approved region — any point inside is within limits.',
        'The forward CG limit slopes from 2.40 m at light weights to 2.46 m at MTOM. The aft CG limit is constant at 2.53 m. Your calculated CG must fall between these boundaries at the actual mass.',
      ],
    } as TheoryContent,
  },
  {
    id: 'envelope-reading',
    section: 'The CG Envelope',
    title: 'Reading the Envelope',
    type: 'theory',
    diagram: 'envelope',
    content: {
      paragraphs: [
        'To check if a loading condition is within limits, plot the point (CG, Mass) on the chart:',
      ],
      bullets: [
        'Find the mass on the vertical axis',
        'Find the CG on the horizontal axis',
        'If the intersection falls inside the shaded area, you\'re within limits',
        'If it falls outside, you must adjust the loading',
      ],
      note: 'With MÄM 40-662 installed, the envelope extends upward to 1310 kg with a slightly higher forward CG limit (2.469 m). Check your aircraft\'s modification status.',
    } as TheoryContent,
  },
  {
    id: 'envelope-interactive',
    section: 'The CG Envelope',
    title: 'Explore the Envelope',
    type: 'interactive',
    diagram: 'none',
    content: {
      description: 'Click or drag a point around the DA40 NG CG envelope. See live feedback about whether the point is within limits and how close you are to each boundary.',
      tool: 'envelope-explorer',
    } as InteractiveContent,
  },
  {
    id: 'envelope-quiz',
    section: 'The CG Envelope',
    title: 'Check Your Understanding',
    type: 'quiz',
    diagram: 'none',
    content: {
      question: 'An aircraft has a mass of 1100 kg and CG of 2.38 m. Is this within the standard DA40 NG envelope? (Forward limit at 1100 kg is 2.40 m, aft limit is 2.53 m)',
      options: [
        {
          label: 'Yes, it\'s within limits',
          correct: false,
          explanation: 'The CG of 2.38 m is forward of the forward CG limit of 2.40 m at this mass. It\'s outside the envelope.',
        },
        {
          label: 'No, the CG is too far forward',
          correct: true,
          explanation: 'Correct! At 1100 kg, the forward CG limit is 2.40 m. A CG of 2.38 m is 0.02 m forward of this limit — outside the envelope.',
        },
        {
          label: 'No, the mass is too high',
          correct: false,
          explanation: '1100 kg is well below MTOM of 1280 kg. The mass is fine — it\'s the CG that\'s the problem.',
        },
        {
          label: 'No, the CG is too far aft',
          correct: false,
          explanation: '2.38 m is forward of the aft limit of 2.53 m. The CG is actually too far forward, not aft.',
        },
      ],
    } as QuizContent,
  },

  // ── Section 5: Fuel (3 slides) ──────────────────────────────
  {
    id: 'fuel-density',
    section: 'Fuel',
    title: 'Fuel: Density and Conversions',
    type: 'theory',
    diagram: 'fuel',
    content: {
      paragraphs: [
        'The DA40 NG uses Jet A-1 fuel with a density of 0.84 kg/L for mass and balance purposes. Fuel quantities are often given in US gallons (USG), but we need kilograms for M&B calculations.',
        'The conversion chain is: USG → Litres → Kilograms',
      ],
      bullets: [
        '1 USG = 3.785 litres',
        '1 litre of Jet A-1 = 0.84 kg',
        'Standard tank capacity: 28 USG (106 L / 89 kg usable)',
        'Long-range tank: 39 USG (147.6 L / 124 kg usable)',
        'Example: 25 USG × 3.785 = 94.6 L × 0.84 = 79.5 kg',
      ],
      note: 'The fuel arm on the DA40 NG is 2.63 m aft of datum — this is the same regardless of fuel quantity or tank type.',
    } as TheoryContent,
  },
  {
    id: 'fuel-converter',
    section: 'Fuel',
    title: 'Try It: Fuel Converter',
    type: 'interactive',
    diagram: 'none',
    content: {
      description: 'Convert between US gallons, litres, and kilograms using the DA40 NG fuel constants. See how the conversions chain together.',
      tool: 'fuel-converter',
    } as InteractiveContent,
  },
  {
    id: 'fuel-burn',
    section: 'Fuel',
    title: 'Fuel Burn and CG Shift',
    type: 'theory',
    diagram: 'fuel',
    content: {
      paragraphs: [
        'As fuel burns during flight, both the aircraft mass and moment change. Since the fuel arm (2.63 m) is typically forward of the loaded CG, burning fuel shifts the CG aft.',
        'This is why we check both TOM (takeoff mass) and LM (landing mass). The CG moves during flight as fuel burns, and it must remain within the envelope throughout.',
        'In practice, if TOM and LM are both within the envelope, all intermediate points will also be within limits because the CG moves linearly between them as fuel burns.',
      ],
      note: 'If the loaded CG is close to the aft limit at takeoff, fuel burn during flight could push it even further aft. Always check the landing condition!',
    } as TheoryContent,
  },

  // ── Section 6: Modifications (2 slides) ────────────────────
  {
    id: 'mods-overview',
    section: 'Modifications',
    title: 'Aircraft Modifications',
    type: 'theory',
    diagram: 'none',
    content: {
      paragraphs: [
        'The DA40 NG can have various modifications (Änderungen) installed that change mass limits and available loading stations. You must check the aircraft\'s technical log to know which are active.',
      ],
      bullets: [
        'MÄM 40-662 — Increases MTOM from 1280 to 1310 kg. Extends the CG envelope upward.',
        'MÄM 40-574 — Increases max landing mass from 1216 to 1280 kg, and max ZFM from 1200 to 1265 kg.',
        'OÄM 40-164 — Adds baggage tube station (arm 4.32 m, max 18 kg). Far aft, so it shifts CG significantly.',
        'OÄM 40-331 — Adds baggage extension stations with various arms and limits.',
      ],
      note: 'With both MÄMs active, MTOM = 1310 kg, max landing = 1280 kg, and max ZFM = 1265 kg. These are cumulative.',
    } as TheoryContent,
  },
  {
    id: 'mods-quiz',
    section: 'Modifications',
    title: 'Check Your Understanding',
    type: 'quiz',
    diagram: 'none',
    content: {
      question: 'With both MÄM 40-662 and MÄM 40-574 installed, what is the Maximum Takeoff Mass (MTOM)?',
      options: [
        {
          label: '1280 kg',
          correct: false,
          explanation: '1280 kg is the base MTOM without MÄM 40-662.',
        },
        {
          label: '1310 kg',
          correct: true,
          explanation: 'Correct! MÄM 40-662 increases MTOM to 1310 kg. MÄM 40-574 changes landing and ZFM limits but does not affect MTOM.',
        },
        {
          label: '1265 kg',
          correct: false,
          explanation: '1265 kg is the max ZFM with MÄM 40-574. That\'s a different limit.',
        },
        {
          label: '1350 kg',
          correct: false,
          explanation: 'No modification raises MTOM to 1350 kg. The highest is 1310 kg with MÄM 40-662.',
        },
      ],
    } as QuizContent,
  },

  // ── Section 7: Guided Worked Example (8 slides) ─────────────
  // Scenario: BEM 940/2.442, Front 160, Rear 140, Baggage 15, Fuel 25 USG, Trip 12 USG
  {
    id: 'example-scenario',
    section: 'Worked Example',
    title: 'The Scenario',
    type: 'theory',
    diagram: 'none',
    content: {
      paragraphs: [
        'Let\'s work through a complete M&B calculation together. You\'ll calculate each step, and the system will check your answers.',
        'Here\'s the scenario — a DA40 NG with standard configuration (no modifications, standard tank):',
      ],
      bullets: [
        'BEM: 940 kg at CG 2.442 m',
        'Front Seats: 160 kg (arm 2.30 m)',
        'Rear Seats: 140 kg (arm 3.25 m)',
        'Baggage: 15 kg (arm 3.65 m)',
        'Takeoff Fuel: 25 USG (arm 2.63 m)',
        'Trip Fuel: 12 USG',
      ],
      note: 'This scenario is deliberately designed to exceed limits — see if you can spot where the problems are!',
    } as TheoryContent,
  },
  {
    id: 'example-step1',
    section: 'Worked Example',
    title: 'Step 1: BEM Moment',
    type: 'exercise',
    diagram: 'none',
    content: {
      description: 'Calculate the BEM moment. Moment = Mass × Arm.',
      fields: [
        {
          id: 'bem-moment',
          label: 'BEM Moment (940 × 2.442)',
          correctValue: 2295.48,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: 'Multiply the BEM mass by the BEM CG arm: 940 × 2.442',
        },
      ],
      explanation: 'BEM Moment = 940 × 2.442 = 2295.5 kg·m. This is the starting point for all further calculations.',
    } as ExerciseContent,
  },
  {
    id: 'example-step2',
    section: 'Worked Example',
    title: 'Step 2: Payload Moments',
    type: 'exercise',
    diagram: 'none',
    content: {
      description: 'Calculate the moment for each payload item. Remember: Moment = Mass × Arm.',
      fields: [
        {
          id: 'front-moment',
          label: 'Front Seats (160 × 2.30)',
          correctValue: 368.0,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: '160 × 2.30 = ?',
        },
        {
          id: 'rear-moment',
          label: 'Rear Seats (140 × 3.25)',
          correctValue: 455.0,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: '140 × 3.25 = ?',
        },
        {
          id: 'baggage-moment',
          label: 'Baggage (15 × 3.65)',
          correctValue: 54.75,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: '15 × 3.65 = ?',
        },
      ],
      explanation: 'Front: 160 × 2.30 = 368.0 kg·m | Rear: 140 × 3.25 = 455.0 kg·m | Baggage: 15 × 3.65 = 54.75 kg·m. Note how the rear seats, despite carrying less mass, produce a larger moment due to the longer arm.',
    } as ExerciseContent,
  },
  {
    id: 'example-step3',
    section: 'Worked Example',
    title: 'Step 3: Zero Fuel Mass',
    type: 'exercise',
    diagram: 'none',
    content: {
      description: 'Sum up BEM and all payload to find ZFM. Then calculate the ZFM CG.\n\nBEM: 940 kg / 2295.5 kg·m\nFront: 160 kg / 368.0 kg·m\nRear: 140 kg / 455.0 kg·m\nBaggage: 15 kg / 54.75 kg·m',
      fields: [
        {
          id: 'zfm-mass',
          label: 'ZFM Mass',
          correctValue: 1255,
          tolerance: 0.5,
          unit: 'kg',
          hint: '940 + 160 + 140 + 15 = ?',
        },
        {
          id: 'zfm-moment',
          label: 'ZFM Moment',
          correctValue: 3173.23,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: '2295.5 + 368.0 + 455.0 + 54.75 = ?',
        },
        {
          id: 'zfm-cg',
          label: 'ZFM CG',
          correctValue: 2.528,
          tolerance: 0.002,
          unit: 'm',
          hint: 'CG = Total Moment ÷ Total Mass',
        },
      ],
      explanation: 'ZFM = 1255 kg, moment = 3173.2 kg·m, CG = 3173.2 ÷ 1255 = 2.528 m. Note: Max ZFM is 1200 kg — we already exceed it by 55 kg!',
    } as ExerciseContent,
  },
  {
    id: 'example-step4',
    section: 'Worked Example',
    title: 'Step 4: Fuel Conversion',
    type: 'exercise',
    diagram: 'none',
    content: {
      description: 'Convert the takeoff fuel from USG to kg, then calculate the fuel moment.\n\n25 USG × 3.785 L/USG = litres × 0.84 kg/L = kg\nFuel arm = 2.63 m',
      fields: [
        {
          id: 'fuel-litres',
          label: 'Fuel in litres (25 × 3.785)',
          correctValue: 94.64,
          tolerance: 0.5,
          unit: 'L',
          hint: '25 × 3.785 = ?',
        },
        {
          id: 'fuel-kg',
          label: 'Fuel in kg',
          correctValue: 79.49,
          tolerance: 0.5,
          unit: 'kg',
          hint: 'Litres × 0.84 = ?',
        },
        {
          id: 'fuel-moment',
          label: 'Fuel moment',
          correctValue: 209.07,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: 'Fuel kg × 2.63 = ?',
        },
      ],
      explanation: '25 USG × 3.785 = 94.6 L × 0.84 = 79.5 kg. Moment = 79.5 × 2.63 = 209.1 kg·m.',
    } as ExerciseContent,
  },
  {
    id: 'example-step5',
    section: 'Worked Example',
    title: 'Step 5: Takeoff Mass',
    type: 'exercise',
    diagram: 'none',
    content: {
      description: 'Add fuel to ZFM to find TOM, then calculate the TOM CG.\n\nZFM: 1255 kg / 3173.2 kg·m\nFuel: 79.5 kg / 209.1 kg·m',
      fields: [
        {
          id: 'tom-mass',
          label: 'TOM Mass',
          correctValue: 1334.49,
          tolerance: 0.5,
          unit: 'kg',
          hint: 'ZFM mass + fuel mass',
        },
        {
          id: 'tom-moment',
          label: 'TOM Moment',
          correctValue: 3382.30,
          tolerance: 0.5,
          unit: 'kg·m',
          hint: 'ZFM moment + fuel moment',
        },
        {
          id: 'tom-cg',
          label: 'TOM CG',
          correctValue: 2.535,
          tolerance: 0.002,
          unit: 'm',
          hint: 'Total moment ÷ total mass',
        },
      ],
      explanation: 'TOM = 1255 + 79.5 = 1334.5 kg, moment = 3173.2 + 209.1 = 3382.3 kg·m, CG = 3382.3 ÷ 1334.5 = 2.535 m. TOM of 1334.5 kg exceeds MTOM of 1280 kg by 54.5 kg!',
    } as ExerciseContent,
  },
  {
    id: 'example-step6',
    section: 'Worked Example',
    title: 'Step 6: Limit Checks',
    type: 'quiz',
    diagram: 'none',
    content: {
      question: 'Based on your calculations (ZFM 1255 kg at CG 2.528 m, TOM 1334.5 kg at CG 2.535 m), which limits are exceeded? The base limits are: Max ZFM 1200 kg, MTOM 1280 kg, aft CG limit 2.53 m.',
      options: [
        {
          label: 'Only MTOM is exceeded',
          correct: false,
          explanation: 'MTOM is exceeded (1334.5 > 1280), but that\'s not the only problem. Check ZFM and CG too.',
        },
        {
          label: 'ZFM and MTOM are exceeded, and TOM CG is beyond aft limit',
          correct: true,
          explanation: 'Correct! ZFM of 1255 kg exceeds max ZFM of 1200 kg. TOM of 1334.5 kg exceeds MTOM of 1280 kg. TOM CG of 2.535 m exceeds the aft limit of 2.53 m. Three failures!',
        },
        {
          label: 'Everything is within limits',
          correct: false,
          explanation: 'Not at all! This scenario was designed to fail. Check ZFM against 1200 kg and TOM against 1280 kg.',
        },
        {
          label: 'Only ZFM is exceeded',
          correct: false,
          explanation: 'ZFM is exceeded, but so is MTOM. And the CG at takeoff is beyond the aft limit.',
        },
      ],
    } as QuizContent,
  },
  {
    id: 'example-summary',
    section: 'Worked Example',
    title: 'Summary & Next Steps',
    type: 'theory',
    diagram: 'none',
    content: {
      paragraphs: [
        'In this scenario, we found three limit exceedances:',
      ],
      bullets: [
        'ZFM 1255 kg exceeds max ZFM 1200 kg — too much payload',
        'TOM 1334.5 kg exceeds MTOM 1280 kg — aircraft is too heavy',
        'TOM CG 2.535 m exceeds aft limit 2.53 m — balance is off',
      ],
      note: 'To fix this, you\'d need to offload passengers or baggage (reducing ZFM), and possibly move weight forward. Try it yourself in the Calculator — use these same values and experiment with different loadings to get within limits.',
    } as TheoryContent,
  },
];
