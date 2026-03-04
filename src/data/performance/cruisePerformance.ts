import type { CruisePerformanceTable, CruiseIsaDev, CruisePower } from '@/lib/types';

/**
 * AFM 5.3.11 — Cruise Performance
 *
 * Conditions: Flaps UP, Landing gear retracted, Weight 1310 kg
 * Without wheel fairings: TAS −4%
 *
 * Structure: 8 pressure altitudes × 4 ISA deviations × 4 power settings
 * Values: Fuel flow [USG/h], TAS [kt]
 *
 * Note: At high altitude/temperature, maximum available power may be less than 92%.
 * The table values reflect actual achievable performance. Nominal power keys (92/75/60/45)
 * are used throughout; actual power % and fuel flow may differ at extreme conditions
 * (e.g. ISA+30 at PA ≥6000 ft).
 *
 * Source: Doc. #6.01.15-E Rev.3, page 5-27
 */

type RowData = Record<CruiseIsaDev, Record<CruisePower, { ff: number; tas: number }>>;

function row(pa: number, data: RowData) {
  return { pressureAltitude: pa, data };
}

export const cruisePerformanceTable: CruisePerformanceTable = {
  rows: [
    row(2000, {
      [-10]: { 92: { ff: 8.3, tas: 134 }, 75: { ff: 6.6, tas: 123 }, 60: { ff: 5.1, tas: 112 }, 45: { ff: 4.0, tas: 95 } },
      [0]:   { 92: { ff: 8.3, tas: 136 }, 75: { ff: 6.6, tas: 125 }, 60: { ff: 5.1, tas: 114 }, 45: { ff: 4.0, tas: 97 } },
      [10]:  { 92: { ff: 8.3, tas: 137 }, 75: { ff: 6.6, tas: 126 }, 60: { ff: 5.1, tas: 114 }, 45: { ff: 4.0, tas: 97 } },
      [30]:  { 92: { ff: 8.3, tas: 140 }, 75: { ff: 6.6, tas: 128 }, 60: { ff: 5.1, tas: 116 }, 45: { ff: 4.0, tas: 98 } },
    }),
    row(4000, {
      [-10]: { 92: { ff: 8.3, tas: 137 }, 75: { ff: 6.6, tas: 126 }, 60: { ff: 5.1, tas: 114 }, 45: { ff: 4.0, tas: 96 } },
      [0]:   { 92: { ff: 8.3, tas: 138 }, 75: { ff: 6.6, tas: 127 }, 60: { ff: 5.1, tas: 116 }, 45: { ff: 4.0, tas: 98 } },
      [10]:  { 92: { ff: 8.3, tas: 140 }, 75: { ff: 6.6, tas: 128 }, 60: { ff: 5.1, tas: 117 }, 45: { ff: 4.0, tas: 98 } },
      [30]:  { 92: { ff: 8.3, tas: 142 }, 75: { ff: 6.6, tas: 131 }, 60: { ff: 5.1, tas: 118 }, 45: { ff: 4.0, tas: 99 } },
    }),
    row(6000, {
      [-10]: { 92: { ff: 8.3, tas: 139 }, 75: { ff: 6.6, tas: 128 }, 60: { ff: 5.1, tas: 115 }, 45: { ff: 4.0, tas: 98 } },
      [0]:   { 92: { ff: 8.3, tas: 141 }, 75: { ff: 6.6, tas: 129 }, 60: { ff: 5.1, tas: 116 }, 45: { ff: 4.0, tas: 98 } },
      [10]:  { 92: { ff: 8.3, tas: 142 }, 75: { ff: 6.6, tas: 130 }, 60: { ff: 5.1, tas: 117 }, 45: { ff: 4.0, tas: 99 } },
      [30]:  { 92: { ff: 8.0, tas: 143 }, 75: { ff: 6.6, tas: 133 }, 60: { ff: 5.1, tas: 119 }, 45: { ff: 4.0, tas: 100 } },
    }),
    row(8000, {
      [-10]: { 92: { ff: 8.3, tas: 142 }, 75: { ff: 6.6, tas: 130 }, 60: { ff: 5.1, tas: 117 }, 45: { ff: 4.0, tas: 99 } },
      [0]:   { 92: { ff: 8.3, tas: 143 }, 75: { ff: 6.6, tas: 131 }, 60: { ff: 5.1, tas: 118 }, 45: { ff: 4.0, tas: 99 } },
      [10]:  { 92: { ff: 8.3, tas: 145 }, 75: { ff: 6.6, tas: 133 }, 60: { ff: 5.1, tas: 119 }, 45: { ff: 4.0, tas: 100 } },
      [30]:  { 92: { ff: 8.0, tas: 146 }, 75: { ff: 6.6, tas: 135 }, 60: { ff: 5.1, tas: 121 }, 45: { ff: 4.0, tas: 100 } },
    }),
    row(10000, {
      [-10]: { 92: { ff: 8.3, tas: 144 }, 75: { ff: 6.6, tas: 132 }, 60: { ff: 5.1, tas: 119 }, 45: { ff: 4.0, tas: 100 } },
      [0]:   { 92: { ff: 8.3, tas: 146 }, 75: { ff: 6.6, tas: 134 }, 60: { ff: 5.1, tas: 120 }, 45: { ff: 4.0, tas: 100 } },
      [10]:  { 92: { ff: 8.3, tas: 148 }, 75: { ff: 6.6, tas: 135 }, 60: { ff: 5.1, tas: 121 }, 45: { ff: 4.0, tas: 101 } },
      [30]:  { 92: { ff: 8.1, tas: 149 }, 75: { ff: 6.6, tas: 138 }, 60: { ff: 5.1, tas: 123 }, 45: { ff: 4.0, tas: 101 } },
    }),
    row(12000, {
      [-10]: { 92: { ff: 8.3, tas: 147 }, 75: { ff: 6.6, tas: 135 }, 60: { ff: 5.1, tas: 121 }, 45: { ff: 4.0, tas: 100 } },
      [0]:   { 92: { ff: 8.3, tas: 149 }, 75: { ff: 6.6, tas: 136 }, 60: { ff: 5.1, tas: 122 }, 45: { ff: 4.0, tas: 100 } },
      [10]:  { 92: { ff: 8.3, tas: 150 }, 75: { ff: 6.6, tas: 137 }, 60: { ff: 5.1, tas: 123 }, 45: { ff: 4.0, tas: 101 } },
      [30]:  { 92: { ff: 8.1, tas: 152 }, 75: { ff: 6.6, tas: 140 }, 60: { ff: 5.1, tas: 125 }, 45: { ff: 4.0, tas: 101 } },
    }),
    row(14000, {
      [-10]: { 92: { ff: 8.4, tas: 150 }, 75: { ff: 6.6, tas: 137 }, 60: { ff: 5.1, tas: 123 }, 45: { ff: 4.0, tas: 101 } },
      [0]:   { 92: { ff: 8.4, tas: 151 }, 75: { ff: 6.6, tas: 138 }, 60: { ff: 5.1, tas: 124 }, 45: { ff: 4.0, tas: 101 } },
      [10]:  { 92: { ff: 8.4, tas: 153 }, 75: { ff: 6.6, tas: 140 }, 60: { ff: 5.1, tas: 125 }, 45: { ff: 4.0, tas: 101 } },
      [30]:  { 92: { ff: 7.6, tas: 149 }, 75: { ff: 6.6, tas: 142 }, 60: { ff: 5.1, tas: 127 }, 45: { ff: 4.4, tas: 112 } },
    }),
    row(16000, {
      [-10]: { 92: { ff: 8.4, tas: 153 }, 75: { ff: 6.6, tas: 139 }, 60: { ff: 5.1, tas: 124 }, 45: { ff: 4.4, tas: 111 } },
      [0]:   { 92: { ff: 8.4, tas: 154 }, 75: { ff: 6.6, tas: 141 }, 60: { ff: 5.1, tas: 126 }, 45: { ff: 4.4, tas: 112 } },
      [10]:  { 92: { ff: 8.2, tas: 155 }, 75: { ff: 6.6, tas: 142 }, 60: { ff: 5.1, tas: 127 }, 45: { ff: 4.4, tas: 112 } },
      [30]:  { 92: { ff: 7.5, tas: 151 }, 75: { ff: 7.0, tas: 149 }, 60: { ff: 5.1, tas: 128 }, 45: { ff: 4.4, tas: 112 } },
    }),
  ],
};
