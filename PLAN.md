# DA40 NG Performance — Implementation Plan

Data source: AFM Doc. #6.01.15-E Rev.3, Chapter 5

---

## Layout — EFB-style single page

Inspired by Airbus Flightbag. Three-column layout with a shared top strip.
Each column owns its own mass and aerodrome conditions because departure,
destination, and alternate are different airports.

### Top strip — Aircraft config (shared)
- Wheel fairings (yes/no)
- Installed modifications (from M&B page config)

### Left column — Takeoff
- **Mass**: Take-off mass (manual entry or import from M&B)
- **Conditions**: aerodrome elevation, QNH, OAT, wind direction + speed, runway heading, surface, slope
- **Derived** (shown inline): pressure altitude, density altitude, ISA deviation, headwind/crosswind components
- **Result**: ground roll + 50ft distance, correction breakdown
- **Extras**: V-speeds, stalling speed for the mass, take-off climb ROC + gradient

### Center column — Cruise
- Cruise altitude, power setting
- **Result**: TAS, fuel flow (USG/h + L/h)
- Time/fuel/distance to climb (if cruise altitude entered)
- Short section — least data of the three columns

### Right column — Landing
- **Mass**: Landing mass (manual or computed from TOM − trip fuel)
- **Conditions**: destination aerodrome elevation, QNH, OAT, wind, runway, surface, slope
- **Derived**: same as takeoff (PA, density alt, headwind/crosswind)
- **Flap config**: LDG / T/O / UP
- **Result**: ground roll + 50ft distance, correction breakdown
- **Extras**: V-ref, go-around climb ROC
- **Alternate** (collapsible): alternate mass + conditions + landing distance

### Reference tables (expandable / separate panel)
- Airspeed calibration (5.3.1)
- Fuel flow (5.3.2)
- Stalling speeds (5.3.5)

---

## Implementation Phases

### Phase 1 — Takeoff column + shared infrastructure

- [ ] `/performance` route + page scaffold (three-column layout)
- [ ] Top strip: fairings toggle, mod config
- [ ] Takeoff conditions inputs (elevation, QNH, OAT, wind, runway, surface, slope)
- [ ] Derived values: PA, density altitude (5.3.3), ISA deviation (5.3.4), wind components (5.3.6)
- [ ] Interpolation engine: trilinear (weight × PA × OAT)
- [ ] Digitize take-off distance tables (5.3.7)
  - 4 weight tables: 1310, 1280, 1200, 1100 kg
  - Each: 11 PA (SL–10000 ft) × 7 OAT (0–50°C)
  - Two values per cell: ground roll + 50ft distance
- [ ] Take-off correction factors
  - Headwind: −10% per 12 kt
  - Tailwind: +10% per 2 kt
  - Grass dry ≤5cm: ground roll +10%
  - Grass dry 5–10cm: ground roll +30%
  - Grass dry 25cm: ground roll +45%
  - Grass wet: dry grass result +20%
  - Soft ground: ground roll +50% (on top of grass)
  - Uphill slope: ground roll +15% per 1% slope
  - No wheel fairings: ground roll +20m, 50ft distance +30m
- [ ] Result display with correction breakdown
- [ ] V-speeds and stalling speed for mass (5.3.5)

### Phase 2 — Takeoff climb

- [ ] Digitize take-off climb ROC tables (5.3.8, Flaps T/O, 72 KIAS)
  - 4 weights × 10 PA (SL–16400 ft) × 8 OAT (−20 to +50°C)
  - No wheel fairings: ROC −20 ft/min
- [ ] Digitize cruise climb ROC tables (5.3.9, Flaps UP, 88 KIAS)
  - 4 weights × 10 PA × 8 OAT
  - No wheel fairings: ROC −40 ft/min
- [ ] Climb gradient: Gradient [%] = ROC [fpm] / TAS [KTAS] × 0.98
- [ ] Show climb ROC + gradient in takeoff column extras

### Phase 3 — Landing column

- [ ] Landing conditions inputs (destination aerodrome)
- [ ] Landing mass input (manual or TOM − trip fuel)
- [ ] Digitize landing distance tables — normal, Flaps LDG (5.3.12)
  - 4 weights × 11 PA × 7 OAT, ground roll + 50ft
  - v_REF: 77/77/76/72 KIAS per weight
- [ ] Digitize landing distance tables — abnormal flap, Flaps T/O or UP (5.3.13)
  - v_REF: 78/78/78/74 KIAS (T/O), 83/83/82/78 KIAS (UP)
- [ ] Landing correction factors
  - Headwind: −10% per 20 kt
  - Tailwind: +10% per 3 kt
  - Paved wet: +15%
  - Grass dry ≤5cm: ground roll +30%
  - Grass dry >5cm: ground roll +45%
  - Grass wet/soft: ground roll +15%
  - Downhill slope: ground roll +10% per 1% slope
- [ ] Result display with correction breakdown
- [ ] Flap config selector (LDG / T/O / UP) with appropriate v_REF

### Phase 4 — Go-around + alternate

- [ ] Digitize go-around climb ROC tables (5.3.14, Flaps LDG, v_REF)
  - 4 weights × 6 PA (SL–10000 ft) × 8 OAT
- [ ] Show go-around ROC in landing column extras
- [ ] Alternate sub-section (collapsible)
  - Alternate mass, conditions, landing distance

### Phase 5 — Cruise column

- [ ] Digitize cruise performance table (5.3.11)
  - 8 PA: 2000–16000 ft
  - 4 ISA deviations: ISA−10, ISA, ISA+10, ISA+20
  - 4 power settings: 92%, 75%, 60%, 45%
  - Values: fuel flow (USG/h), TAS (kt)
  - No wheel fairings: TAS −4%
- [ ] Cruise performance UI: TAS + fuel flow
- [ ] Time, fuel and distance to climb (5.3.10)
  - 4 weights × 9 PA (SL–16000 ft)
  - Values: OAT, TAS, ROC, time, fuel, distance
  - Subtraction method for departure PA → cruise PA

### Phase 6 — Reference tables

- [ ] Fuel flow table (5.3.2): power % → USG/h + L/h
- [ ] Airspeed calibration table (5.3.1): KIAS → KCAS per flap setting
- [ ] Stalling speeds table (5.3.5): 4 weights × 3 flap settings × 4 bank angles
- [ ] Expandable panel or separate view

---

## Architecture Notes

- Route: `/performance` via react-router-dom HashRouter
- Each column is a self-contained component with its own conditions state
- Top strip config shared via props or context
- All performance data in `src/data/performance/` as typed constants
- Interpolation engine: bilinear for (PA × OAT), linear for weight between tables
  - For weights below 1100 kg, use 1100 kg data (per AFM 5.2)
  - For OAT below table minimum, use lowest OAT data (per AFM 5.2)
  - Caution warning for OAT above table maximum
- All distances in metres (with ft conversion available)
- Correction breakdown shown as line items (reuse pattern from M&B loading sheet)
- Light mode (matching current app theme)
