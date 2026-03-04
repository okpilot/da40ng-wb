# DA40 NG Performance — Implementation Plan

Data source: AFM Doc. #6.01.15-E Rev.3, Chapter 5

---

## Layout — Single-page stacked sections

Mobile-first, single-column layout. Sections stack vertically:
Takeoff → Cruise → Landing. Each section is independently collapsible.
Shared aircraft config (fairings, mods) sits in a top strip.

### Top strip — Aircraft config (shared)
- Wheel fairings (yes/no)
- Installed modifications (from M&B page config)

### Takeoff section
- **Mass**: Take-off mass (manual entry or import from M&B)
- **Conditions**: aerodrome elevation, QNH, OAT, wind direction + speed, runway heading, surface, slope
- **Derived** (shown inline): pressure altitude, density altitude, ISA deviation, headwind/crosswind components
- **Result**: ground roll + 50ft distance, correction breakdown
- **Extras**: V-speeds, stalling speed for the mass, take-off climb ROC + gradient
- **Show working** (collapsible): step-by-step calculation + highlighted AFM tables

### Cruise section
- Cruise altitude, power setting
- **Result**: TAS, fuel flow (USG/h + L/h)
- Time/fuel/distance to climb (if cruise altitude entered)
- **Show working** (collapsible)

### Landing section
- **Mass**: Landing mass (manual or computed from TOM − trip fuel)
- **Conditions**: destination aerodrome elevation, QNH, OAT, wind, runway, surface, slope
- **Derived**: same as takeoff (PA, density alt, headwind/crosswind)
- **Flap config**: LDG / T/O / UP
- **Result**: ground roll + 50ft distance, correction breakdown
- **Extras**: V-ref, go-around climb ROC
- **Show working** (collapsible)
- **Alternate** (collapsible): alternate mass + conditions + landing distance

### Reference tables (expandable / separate panel)
- Airspeed calibration (5.3.1)
- Fuel flow (5.3.2)
- Stalling speeds (5.3.5)

---

## Aerodrome Database

A JSON file (`src/data/aerodromes.json`) provides a small database of aerodromes
that pilots can select to pre-fill conditions. The user can also type values manually.

### Schema per aerodrome
```json
{
  "icao": "LOAN",
  "name": "Wiener Neustadt Ost",
  "elevation": 896,
  "runways": [
    {
      "designator": "09",
      "heading": 86,
      "tora": 1200,
      "toda": 1350,
      "asda": 1250,
      "lda": 1100,
      "surface": "asphalt",
      "slope": 0.0,
      "displacedThreshold": 100,
      "stopway": 50,
      "clearway": 150,
      "intersections": [
        {
          "name": "A",
          "distanceFromThreshold": 300,
          "tora": 900,
          "toda": 1050,
          "asda": 950
        }
      ]
    }
  ]
}
```

### Fields
- `icao` — ICAO code (searchable)
- `name` — aerodrome name
- `elevation` — field elevation in feet (AMSL)
- `runways[]` — array of runway objects:
  - `designator` — runway designator (e.g. "09", "27L")
  - `heading` — magnetic heading [°]
  - `tora` — Take-Off Run Available [m] (full length)
  - `toda` — Take-Off Distance Available [m] (full length)
  - `asda` — Accelerate-Stop Distance Available [m] (full length)
  - `lda` — Landing Distance Available [m]
  - `surface` — "asphalt" | "grass"
  - `slope` — runway slope [%], positive = uphill for that designator
  - `displacedThreshold` — displaced threshold length [m] (0 if none)
  - `stopway` — stopway length beyond runway end [m] (0 if none)
  - `clearway` — clearway length beyond runway end [m] (0 if none)
  - `intersections[]` — optional array of intersection departure points:
    - `name` — taxiway/intersection identifier (e.g. "A", "B2")
    - `distanceFromThreshold` — distance from runway start to intersection [m]
    - `tora` — reduced TORA from this intersection [m]
    - `toda` — reduced TODA from this intersection [m]
    - `asda` — reduced ASDA from this intersection [m]

### Intersection departures
When an intersection is selected:
- TORA, TODA, ASDA update to the intersection values
- The runway diagram shows the intersection point on the runway
- The portion of runway behind the aircraft is greyed out
- LDA is unaffected (landing always uses full runway from threshold)
- UI: toggle between "Full length" and each available intersection

### Declared distance comparison — Runway diagram

A single **combined runway diagram** (SVG) shows the physical runway, its features,
and overlays both the declared and required distances on the same drawing.

#### Diagram layout
```
  Displaced                                              Stopway  Clearway
  Threshold        Runway Surface                        ◄─50m──► ◄─100m─►
  ◄──100m──►◄────────────────────────────────────────────►
  ┌────────┬─────────────────────────────────────────────┬───────┐
  │ ////// │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ▒▒▒▒▒ │
  └────────┴─────────────────────────────────────────────┴───────┘·········│

  Declared distances:
  │◄───────────────── TORA: 1200 m ─────────────────────►│
  │◄───────────────── ASDA: 1250 m ──────────────────────────────►│
  │◄───────────────── TODA: 1350 m ───────────────────────────────────────►│
            │◄────── LDA:  1100 m ──────────────────────►│

  Required (calculated):
  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ TORR: 482 m ✅
  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ TODR: 638 m ✅
```

#### Visual elements
- **Runway surface**: solid fill, the main paved area
- **Displaced threshold**: hatched/striped area at the start (landing threshold is displaced)
- **Stopway**: different texture beyond runway end (paved, usable for abort)
- **Clearway**: dotted/outlined area beyond stopway (obstacle-free, not paved)
- **Declared distances**: labeled dimension lines (TORA, TODA, ASDA, LDA)
- **Required distances**: filled bars overlaid (TORR, TODR) with colour coding
- **50ft marker**: small triangle/icon at the TODR point showing obstacle clearance

#### Colour coding for required vs available
- **Green**: required ≤ 70% of available — comfortable margin
- **Amber**: required 70–100% of available — tight, needs attention
- **Red**: required > available — insufficient runway, do not attempt

#### Terminology (displayed for students)
- TORR = Take-Off Run Required (calculated ground roll with corrections)
- TORA = Take-Off Run Available (declared distance from aerodrome data)
- TODR = Take-Off Distance Required (calculated 50ft distance with corrections)
- TODA = Take-Off Distance Available (declared distance from aerodrome data)
- ASDA = Accelerate-Stop Distance Available (shown for reference)
- LDR = Landing Distance Required
- LDA = Landing Distance Available

#### Landing mode
Same diagram, but highlights LDR vs LDA and shows approach from the
displaced threshold end.

If no aerodrome is selected (manual entry), the user can enter declared
distances and runway features manually — the diagram still renders.

### Initial aerodromes
Start with a handful of Austrian training aerodromes commonly used by DA40 students.
Users can request additions via GitHub issues.

---

## Runway Slope — Visualisation & Calculation

### On the runway diagram
The runway surface is drawn with a visible slope indication:
- A slight tilt on the runway rectangle to show uphill/downhill
- Slope value labeled (e.g. "1.2% uphill ↗")
- Arrow showing direction of take-off run relative to slope

This helps students see *why* the slope correction applies — they're
rolling uphill (or downhill) and the diagram makes it intuitive.

### In the calculation display ("Show working")
Show the slope correction explicitly:
- "Runway slope: 1.2% uphill"
- "Correction: ground roll × (1 + 0.15 × 1.2) = ground roll × 1.18 (+18%)"
- The AFM states: +15% ground roll per 1% uphill slope

### In the aerodrome database
Each runway designator stores its own slope value. Reciprocal runways have
opposite sign slopes (e.g. RWY 09 = +1.2% uphill, RWY 27 = −1.2% downhill).
When a runway is selected, the slope auto-fills and the diagram updates.

### Manual entry
If no aerodrome selected, the user enters slope manually as a percentage.
Positive = uphill, negative = downhill (for take-off context).
For landing, downhill slope increases landing roll.

---

## Base Conditions — Explicit Display

The AFM tables are computed under specific assumed conditions. The "Show working"
panel must explicitly state these so students understand what the corrections are for.

### Take-off table base conditions (5.3.7)
- Power lever: MAX
- Flaps: T/O
- Runway: dry, paved, level
- Brakes held until full power setting is complete
- Nose wheel lift-off at V_R
- Initial climb at V_50

### Landing table base conditions (5.3.12)
- Power lever: IDLE
- Flaps: LDG (or T/O / UP for abnormal)
- Runway: dry, paved, level
- Approach speed: V_REF

### Display format
The "Show working" panel shows a side-by-side comparison:

| Condition | AFM assumes | Your input | Correction needed? |
|-----------|-------------|------------|-------------------|
| Surface   | Dry paved   | Grass ≤5cm | Yes: GR +10%      |
| Slope     | Level       | 1.2% up    | Yes: GR +18%      |
| Wind      | Calm        | 8 kt head  | Yes: −6.7%        |
| Fairings  | Installed   | Installed  | No                |

---

## "Show Working" — Educational Feature

Each section has a collapsible "Show working" panel that displays:

### 1. Step-by-step calculation
- Numbered steps with formulas and actual values plugged in
- e.g. "PA = 1200 + 30 × (1013 − 1005) = 1448 ft"
- e.g. "ISA temp at 1448 ft = 15 − 2 × 1.448 = 12.1°C → ISA dev = +8.9°C"
- Wind component breakdown with diagram values

### 2. AFM tables with highlighted cells
- Render the actual AFM performance tables for the two bracketing weights
- **Highlight the 4 cells** used for bilinear interpolation (the PA×OAT rectangle)
- Show which rows/columns were selected and why
- Students can compare against the paper AFM

### 3. Interpolation walkthrough
- Show the bilinear interpolation within each weight table
- Show the linear interpolation between weight tables
- "At 1310 kg: GR = 412 m. At 1280 kg: GR = 407 m. Your mass 1295 kg is 50% between → GR = 410 m"

### 4. Correction breakdown
- Line-item table: base value → each correction factor → final result
- e.g. "Base ground roll: 410 m → Grass dry ≤5cm +10% → 451 m → Headwind 8kt: −6.7% → 421 m"

---

## Take-off Calculation Design

### Inputs
- Take-off mass [kg]
- Aerodrome elevation [ft] — from database or manual
- QNH [hPa]
- OAT [°C]
- Wind direction [°] + speed [kt]
- Runway heading [°] — from database or manual
- Surface type: paved / grass — from database or manual
- Grass length (if grass): ≤5cm / 5–10cm / 25cm
- RWYCC: 6 (Dry) / 5 (Wet) — selectable; 4–0 shown for info only
- Soft ground: yes / no (additional checkbox if grass)
- Runway slope [%] — from database or manual (positive = uphill)
- Departure point: full length / intersection — from database or manual
- Wheel fairings: yes / no

### Derived values (pure formulas)
- Pressure altitude [ft] = elevation + 30 × (1013 − QNH)
- ISA temperature [°C] = 15 − 2 × (PA / 1000)
- ISA deviation [°C] = OAT − ISA temperature
- Density altitude [ft] = PA + 120 × (OAT − ISA temp)
- Headwind component [kt] = wind_speed × cos(wind_dir − runway_hdg)
- Crosswind component [kt] = wind_speed × |sin(wind_dir − runway_hdg)|

### Table interpolation
1. Identify the two weight tables that bracket the mass (clamp at 1100 kg if below)
2. Within each weight table: bilinear interpolation on PA × OAT
   - Find the two PA rows that bracket the input PA
   - Find the two OAT columns that bracket the input OAT
   - Interpolate across 4 cells → ground roll + 50ft distance
   - If any of the 4 cells is "N/A" (hatched), flag caution
3. Linear interpolation between the two weight results for the actual mass
4. OAT < 0°C → clamp to 0°C (per AFM 5.2)
5. OAT > 50°C → caution warning
6. Mass < 1100 kg → use 1100 kg table (per AFM 5.2)

### RWYCC → AFM correction mapping

The AFM (2014) uses descriptive terms. We map RWYCC codes to AFM factors:

#### Take-off corrections
| Surface | RWYCC | AFM term | Ground roll correction |
|---------|-------|----------|----------------------|
| Paved   | 6 (Dry) | Dry paved (base) | None |
| Paved   | 5 (Wet) | — | No AFM correction* |
| Grass   | 6 (Dry) | Grass dry ≤5cm | GR × 1.10 |
| Grass   | 6 (Dry) | Grass dry 5–10cm | GR × 1.30 |
| Grass   | 6 (Dry) | Grass dry 25cm | GR × 1.45 |
| Grass   | 5 (Wet) | Grass wet | Dry grass factor, then × 1.20 |
| Grass   | 5 (Wet) + soft | Soft ground | + GR × 1.50 on top of grass |
| Any     | 4–0 | Contaminated | ⚠ Info only — do not operate |

*Note: AFM does not provide a wet paved take-off correction. Display advisory
"No AFM data for wet paved take-off — exercise caution."

#### Landing corrections
| Surface | RWYCC | AFM term | Correction |
|---------|-------|----------|-----------|
| Paved   | 6 (Dry) | Dry paved (base) | None |
| Paved   | 5 (Wet) | Paved wet | +15% |
| Grass   | 6 (Dry) | Grass dry ≤5cm | GR × 1.30 |
| Grass   | 6 (Dry) | Grass dry >5cm | GR × 1.45 |
| Grass   | 5 (Wet) | Grass wet / soft | GR × 1.15 |
| Any     | 4–0 | Contaminated | ⚠ Info only — do not operate |

#### RWYCC display
Show all 7 codes (6–0) with descriptions for educational value:
- **6** — Dry ✅ (selectable)
- **5** — Wet ✅ (selectable)
- **4** — Compacted snow / Slippery wet ℹ️ (info only)
- **3** — Wet snow / Dry snow / Wet ice ℹ️ (info only)
- **2** — Standing water / Slush ℹ️ (info only)
- **1** — Ice ℹ️ (info only)
- **0** — Wet ice / Water on top of compacted snow ℹ️ (info only)

Codes 4–0 are greyed out with a note: "DA40 NG — do not operate on
contaminated runways. Shown for RWYCC training purposes."

### Correction factors (applied post-interpolation)

Order of application:
1. **Surface** corrections → ground roll only:
   - Determined by surface type + RWYCC + grass length (see table above)
   - Soft ground: additional GR × 1.50 on top of grass correction
2. **Slope** correction → ground roll only:
   - Uphill: GR × (1 + 0.15 × slope%)
3. **Reconstruct 50ft distance**:
   - Air segment = base_D50 − base_GR (unchanged by surface/slope)
   - Corrected D50 = corrected_GR + air_segment
4. **Wind** correction → both GR and D50:
   - Headwind: factor = 1 − 0.10 × (headwind_kt / 12)
   - Tailwind: factor = 1 + 0.10 × (tailwind_kt / 2)
   - Note: 50% headwind / 150% tailwind safety already built into factors
5. **Fairings** → absolute additions:
   - No fairings: GR += 20 m, D50 += 30 m

### V-speeds for mass
Linear interpolation between the 4 weight-specific values:
| Weight | V_R | V_50 |
|--------|------|------|
| 1310   | 67   | 72   |
| 1280   | 67   | 72   |
| 1200   | 65   | 70   |
| 1100   | 61   | 67   |

---

## Implementation Phases

### Phase 1 — Takeoff calculation + page scaffold ✅ COMPLETE

- [x] `/performance` route + page scaffold
- [x] Aircraft configuration card (TOM, flaps T/O 5°, wheel fairings)
- [x] Aerodrome & runway card (elevation, heading, slope from THR/DER, surface, grass options, declared distances) — manual entry only
- [x] Weather conditions card (wind, OAT, QNH, RWYCC 6 Dry / 5 Wet)
- [x] Advisory data (PA, DA, ISA dev, wind components, correction factors)
- [x] Interpolation engine: bilinear (PA × OAT) + linear (weight)
- [x] Digitize take-off distance tables (5.3.7) — 4 weights × 11 PA × 6 OAT
- [x] Take-off correction factors (surface, slope, wind, fairings)
- [x] Results card (TORR, TODR, V_R, V_50 with green/amber/red margin indicators)
- [x] Horizontal runway diagram (TORA/TODA/ASDA declared, TORR/TODR required, stopway, clearway)
- [x] "Show working" collapsible panel (step-by-step, AFM tables with highlights, interpolation walkthrough, correction breakdown)
- [x] Navigation links on Calculator and Learn pages

### Phase 2 — Climb calculator ✅ COMPLETE

- [x] Digitize take-off climb ROC tables (5.3.8, Flaps T/O, 72 KIAS)
- [x] Digitize cruise climb ROC tables (5.3.9, Flaps UP, 88 KIAS)
- [x] Digitize time/fuel/distance to climb tables (5.3.10)
- [x] Climb gradient: Gradient [%] = ROC [fpm] / TAS [KTAS] × 0.98
- [x] Climb profile diagram (DEP→FRA→TOC with gradient segments)
- [x] ISA correction factors for 5.3.10
- [x] "Show working" panel with AFM tables

### Phase 3 — Cruise calculator ✅ COMPLETE

- [x] Digitize cruise performance table (5.3.11) — 8 PA × 4 ISA dev × 4 power
- [x] Cruise performance UI: TAS + fuel flow + range + endurance
- [x] Wheel fairings: TAS ×0.96
- [x] Fuel presets (Std 28 USG, LR 39 USG)
- [x] Final reserve fuel (30 min VFR / 45 min IFR at 4.0 USG/h per AFM 5.3.2)
- [x] Alternate aerodrome fuel planning (distance + altitude → interpolated FF/TAS)
- [x] Trip fuel = usable − reserve − alternate; warning if insufficient
- [x] "Show working" panel with fuel planning breakdown

### Phase 4 — Landing calculator ✅ COMPLETE

- [x] Digitize landing distance tables — Flaps LDG (5.3.12), abnormal (5.3.13)
- [x] Landing correction factors (grass, wet, slope, wind)
- [x] Flap config selector (LDG / T/O / UP) with per-flap vRef
- [x] Digitize go-around climb ROC tables (5.3.14)
- [x] Go-around ROC + gradient in results
- [x] Landing runway diagram with designator
- [x] "Show working" panel

### Phase 5 — (merged into phases 2-4)

### Phase 6 — Reference tables

- [ ] Fuel flow table (5.3.2): power % → USG/h + L/h
- [ ] Airspeed calibration table (5.3.1): KIAS → KCAS per flap setting
- [ ] Stalling speeds table (5.3.5): 4 weights × 3 flap settings × 4 bank angles
- [ ] Expandable panel or separate view

---

## Architecture Notes

- Route: `/performance` via react-router-dom HashRouter
- Stacked single-column layout, each section independently collapsible
- Top strip config shared via props or context
- All performance data in `src/data/performance/` as typed constants
- Interpolation engine: bilinear for (PA × OAT), linear for weight between tables
  - For weights below 1100 kg, use 1100 kg data (per AFM 5.2)
  - For OAT below table minimum, use lowest OAT data (per AFM 5.2)
  - Caution warning for OAT above table maximum
- All distances in metres (with ft conversion available)
- Correction breakdown shown as line items (reuse pattern from M&B loading sheet)
- "Show working" renders the same table data used for calculation, with CSS highlights
- Light mode (matching current app theme)
