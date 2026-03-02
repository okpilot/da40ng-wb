# DA40 NG Performance — Implementation Plan

Data source: AFM Doc. #6.01.15-E Rev.3, Chapter 5

## Phase 1 — Formula-based calculators

- [ ] **Density Altitude** (5.3.3)
  - Inputs: pressure altitude (ft), OAT (°C)
  - Formula: ISA standard atmosphere calculation
  - Output: density altitude (ft)

- [ ] **Wind Components** (5.3.6)
  - Inputs: runway heading, wind direction, wind speed (kt)
  - Formula: headwind = speed × cos(angle), crosswind = speed × sin(angle)
  - Output: headwind/tailwind component, crosswind component
  - Show max demonstrated crosswind: 25 kt

## Phase 2 — Take-off Distance (5.3.7)

- [ ] **Digitize take-off distance tables**
  - 4 weight tables: 1310, 1280, 1200, 1100 kg
  - Each: 11 pressure altitudes (SL–10000 ft) × 7 OAT (0–50°C)
  - Two values per cell: ground roll + 15m/50ft distance
  - Interpolate between weights, PA, and OAT

- [ ] **Take-off correction factors**
  - Headwind: −10% per 12 kt
  - Tailwind: +10% per 2 kt
  - Grass dry ≤5cm: ground roll +10%
  - Grass dry 5–10cm: ground roll +30%
  - Grass dry 25cm: ground roll +45%
  - Grass wet: dry grass result +20%
  - Soft ground: ground roll +50% (on top of grass)
  - Uphill slope: ground roll +15% per 1% slope
  - No wheel fairings: ground roll +20m, 50ft distance +30m

- [ ] **Take-off distance UI**
  - Inputs: weight (from M&B or manual), PA, OAT, wind, surface, slope, fairings
  - Output: ground roll (m) + total over 50ft (m), with breakdown of corrections

## Phase 3 — Landing Distance (5.3.12, 5.3.13)

- [ ] **Digitize landing distance tables — normal (Flaps LDG)**
  - 4 weight tables: 1310, 1280, 1200, 1100 kg
  - Same structure as take-off: 11 PA × 7 OAT, ground roll + 15m/50ft
  - v_REF: 77/77/76/72 KIAS per weight

- [ ] **Digitize landing distance tables — abnormal flap (Flaps T/O or UP)**
  - 4 weight tables: 1310, 1280, 1200, 1100 kg
  - v_REF: 78/78/78/74 KIAS (T/O), 83/83/82/78 KIAS (UP)

- [ ] **Landing correction factors**
  - Headwind: −10% per 20 kt
  - Tailwind: +10% per 3 kt
  - Paved wet: +15%
  - Grass dry ≤5cm: ground roll +30%
  - Grass dry >5cm: ground roll +45%
  - Grass wet/soft: ground roll +15%
  - Downhill slope: ground roll +10% per 1% slope

- [ ] **Landing distance UI**
  - Inputs: weight, PA, OAT, wind, surface, slope, flap config (LDG/T/O/UP)
  - Output: ground roll + total over 50ft, with correction breakdown

## Phase 4 — Climb Performance (5.3.8, 5.3.9, 5.3.14)

- [ ] **Digitize take-off climb ROC tables (Flaps T/O, 72 KIAS)**
  - 4 weights: 1310, 1280, 1200, 1100 kg
  - 10 PA levels (SL–16400 ft) × 8 OAT (−20 to +50°C)
  - Note: no wheel fairings → ROC −20 ft/min

- [ ] **Digitize cruise climb ROC tables (Flaps UP, 88 KIAS)**
  - 4 weights: 1310, 1280, 1200, 1100 kg
  - 10 PA levels × 8 OAT
  - Note: no wheel fairings → ROC −40 ft/min

- [ ] **Digitize go-around climb ROC tables (Flaps LDG, v_REF)**
  - 4 weights: 1310, 1280, 1200, 1100 kg
  - 6 PA levels (SL–10000 ft) × 8 OAT

- [ ] **Climb gradient formula**
  - Gradient [%] = ROC [fpm] / TAS [KTAS] × 0.98

- [ ] **Climb performance UI**
  - Inputs: weight, PA, OAT, climb type (T/O / cruise / go-around), fairings
  - Output: ROC (ft/min), climb gradient (%)

## Phase 5 — Cruise Performance (5.3.11)

- [ ] **Digitize cruise performance table**
  - 8 pressure altitudes: 2000–16000 ft
  - 4 ISA deviations: ISA−10, ISA, ISA+10, ISA+20
  - 4 power settings per altitude: 92%, 75%, 60%, 45%
  - Values: fuel flow (USG/h), TAS (kt)
  - Note: no wheel fairings → TAS −4%

- [ ] **Cruise performance UI**
  - Inputs: pressure altitude, OAT (→ ISA dev), power setting
  - Output: TAS (kt), fuel flow (USG/h + L/h)

## Phase 6 — Reference Tables

- [ ] **Fuel flow table** (5.3.2)
  - Power % → fuel flow USG/h and L/h

- [ ] **Airspeed calibration table** (5.3.1)
  - KIAS → KCAS for UP, T/O, LDG flap settings

- [ ] **Stalling speeds table** (5.3.5)
  - 4 weights × 3 flap settings × 4 bank angles
  - KIAS and KCAS values

## Phase 7 — Time, Fuel and Distance to Climb (5.3.10)

- [ ] **Digitize climb planning tables**
  - 4 weights: 1310, 1280, 1200, 1100 kg
  - 9 pressure altitudes (SL–16000 ft)
  - Values: OAT, TAS, ROC, time, fuel, distance

- [ ] **Climb planning UI**
  - Inputs: weight, departure PA, cruise PA
  - Output: time (min), fuel (USG), distance (NM) — using subtraction method

---

## Architecture Notes

- Add React Router for `/` (M&B) and `/performance` pages
- Share aircraft config (weight from M&B) between pages if possible
- All performance data in `src/data/performance/` as typed constants
- Interpolation: bilinear for (PA × OAT), linear for weight between tables
- All distances in metres (with ft conversion available)
- Show calculation steps in breakdown like M&B page
