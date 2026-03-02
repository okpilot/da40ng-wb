export interface GlossaryEntry {
  term: string;
  abbreviation?: string;
  definition: string;
}

// Ordered longest-first so multi-word terms match before their sub-terms
export const glossary: GlossaryEntry[] = [
  {
    term: 'Maximum Takeoff Mass',
    abbreviation: 'MTOM',
    definition: 'The highest mass at which the aircraft is certified to take off. DA40 NG base: 1280 kg (1310 kg with MÄM 40-662).',
  },
  {
    term: 'Basic Empty Mass',
    abbreviation: 'BEM',
    definition: 'The mass of the aircraft as delivered — airframe, engine, fixed equipment, unusable fuel, and full oil. Does not include payload or usable fuel.',
  },
  {
    term: 'Zero Fuel Mass',
    abbreviation: 'ZFM',
    definition: 'BEM plus all payload (passengers and baggage), before adding usable fuel. MZFM for DA40 NG: 1200 kg (1265 kg with MÄM 40-574).',
  },
  {
    term: 'Takeoff Mass',
    abbreviation: 'TOM',
    definition: 'ZFM plus the fuel loaded for the flight. Must not exceed MTOM.',
  },
  {
    term: 'Landing Mass',
    abbreviation: 'LM',
    definition: 'TOM minus the fuel burned during the trip. Max landing mass for DA40 NG: 1216 kg (1280 kg with MÄM 40-574).',
  },
  {
    term: 'Centre of Gravity',
    abbreviation: 'CG',
    definition: 'The point where the total weight of the aircraft effectively acts. CG = Total Moment ÷ Total Mass. Must be within the certified envelope.',
  },
  {
    term: 'CG envelope',
    definition: 'A chart showing the approved combinations of aircraft mass and CG position. Defined by forward and aft CG limits at each mass.',
  },
  {
    term: 'datum',
    definition: 'The reference point from which all arms are measured. On the DA40 NG, the datum is at the firewall.',
  },
  {
    term: 'arm',
    definition: 'The horizontal distance from the datum to a loading point, measured in metres. Each station has a fixed arm defined in the AFM.',
  },
  {
    term: 'moment',
    definition: 'The turning effect of a mass about the datum. Moment = Mass × Arm, measured in kg·m.',
  },
  {
    term: 'station',
    definition: 'A designated loading point on the aircraft with a fixed arm. Examples: Front Seats (2.30 m), Rear Seats (3.25 m), Baggage (3.65 m).',
  },
  {
    term: 'forward CG limit',
    definition: 'The most forward permitted CG position at a given mass. Going beyond causes heavy controls, higher stall speed, and increased tail load.',
  },
  {
    term: 'aft CG limit',
    definition: 'The most rearward permitted CG position (2.53 m for DA40 NG). Exceeding this reduces stability and can make the aircraft uncontrollable.',
  },
  {
    term: 'MTOM',
    definition: 'Maximum Takeoff Mass — the highest mass at which the aircraft is certified to take off. DA40 NG base: 1280 kg.',
  },
  {
    term: 'BEM',
    definition: 'Basic Empty Mass — the aircraft empty, with unusable fuel and full oil. Does not include payload or usable fuel.',
  },
  {
    term: 'ZFM',
    definition: 'Zero Fuel Mass — BEM plus all payload, before adding usable fuel. MZFM: 1200 kg (base).',
  },
  {
    term: 'TOM',
    definition: 'Takeoff Mass — ZFM plus fuel loaded for the flight. Must not exceed MTOM.',
  },
  {
    term: 'LM',
    definition: 'Landing Mass — TOM minus fuel burned during the trip. Max: 1216 kg (base).',
  },
  {
    term: 'CG',
    definition: 'Centre of Gravity — the balance point of the aircraft. CG = Total Moment ÷ Total Mass.',
  },
  {
    term: 'AFM',
    definition: 'Aircraft Flight Manual — the official document containing all certified operating data, limits, and procedures for the aircraft.',
  },
  {
    term: 'MÄM 40-662',
    definition: 'A mandatory modification that increases MTOM from 1280 kg to 1310 kg and extends the CG envelope upward.',
  },
  {
    term: 'MÄM 40-574',
    definition: 'A mandatory modification that increases MLM to 1280 kg and MZFM to 1265 kg.',
  },
  {
    term: 'OÄM 40-164',
    definition: 'An optional modification that adds a baggage tube station at arm 4.32 m (max 18 kg).',
  },
  {
    term: 'OÄM 40-331',
    definition: 'An optional modification that adds baggage extension stations with various arms and limits.',
  },
  {
    term: 'fuel density',
    definition: 'Mass per unit volume of fuel. For Jet A-1 in M&B calculations: 0.84 kg/L.',
  },
  {
    term: 'USG',
    definition: 'US Gallons — a unit of volume. 1 USG = 3.785 litres.',
  },
  {
    term: 'stall speed',
    definition: 'The minimum speed at which the aircraft can maintain level flight. Increases with forward CG and higher mass.',
  },
];
