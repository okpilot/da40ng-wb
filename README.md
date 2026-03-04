# Flight Training Tools

A free, open-source, client-side web app — a sandbox for flight training tools and experiments. Started with DA40 NG mass & balance, grew into performance calculators and a CR-3 flight computer emulator, and will keep evolving with whatever seems useful. Built for flight students and instructors — no login, no backend, everything runs in your browser.

**[Open the app](https://okpilot.github.io/flight-training-tools/)**

## Calculator

Real-time mass & balance calculator for the Diamond DA40 NG.

- **M&B loading sheet** with inline limit checks (MTOM, MLM, MZFM)
- **CG envelope chart** (SVG) with ZFM, TOM, and LM plotted in real time
- **Modification support** — MÄM 40-662, MÄM 40-574, OÄM 40-164, OÄM 40-331
- **Standard & Long Range tanks** — fuel input in USG, with litres/kg shown
- **Calculation breakdown** — every step with formulas for verification
- **Guided tour** — 12-step spotlight walkthrough on first visit, replayable via header icon
- **Fully offline** — no server, no database, no tracking

## Performance

Four performance calculators covering the full flight profile, each with guided tour walkthroughs and full calculation breakdowns.

### Take-off (AFM 5.3.7)

- **AFM table interpolation** — bilinear (PA × OAT) + linear (weight) across 4 digitised weight tables
- **Correction factors** — surface (paved/grass), slope, wind, wheel fairings, applied in AFM order
- **Aerodrome setup** — ICAO, runway designator, THR/DER elevations for slope, declared distances (TORA/TODA/ASDA), intersection departures — save/load to localStorage
- **NCO runway diagram** — physical runway with TODR/TORR above, TORA (binding) below, green/amber/red colour coding
- **Part CAT safety factors** (CAT.POL.A.305) — max allowable TODR per constraint, dedicated runway diagram with factored limits
- **V-speeds** — V_R and V_50 interpolated for mass

### Climb (AFM 5.3.8 / 5.3.9 / 5.3.10)

- **Take-off climb ROC** (5.3.8) and **cruise climb ROC** (5.3.9) — interpolated by weight and PA
- **Time, fuel, and distance to TOC** (5.3.10) — with ISA correction factors
- **Climb profile diagram** — side-view SVG from DEP → FRA → TOC, colour-coded by gradient quality
- **Wheel fairings penalty** — −20 fpm (T/O climb), −40 fpm (cruise climb)
- Seeds from Take-off tab with "Sync from Take-off" button

### Cruise (AFM 5.3.11)

- **TAS and fuel flow** — bilinear interpolation by PA and ISA deviation at 92/75/60/45% power
- **Fuel planning** — usable fuel, VFR/IFR final reserve (30/45 min at 4.0 USG/h), alternate aerodrome fuel
- **Climb segment integration** — deducts climb fuel/time/distance from the Climb tab
- **Range and endurance** — trip values accounting for reserve, climb, and alternate
- **Wheel fairings** — TAS ×0.96 without fairings

### Landing (AFM 5.3.12 / 5.3.13 / 5.3.14)

- **Normal (LDG) and abnormal (T/O, UP) flap tables** — 5.3.12 and 5.3.13
- **Correction factors** — grass (short/long), wet grass, slope, paved wet, wind
- **Go-around ROC** (5.3.14) — rate of climb, gradient, and TAS
- **vRef speeds** — per-weight, per-flap setting
- **Runway diagram** — LDR vs LDA with colour-coded margin
- **LDA exceedance warning** — red badge when LDR exceeds available distance

## Learn Module

Interactive teaching module with 32 slides across 7 sections, covering full M&B theory and a guided worked example.

- **Theory slides** with SVG diagrams and aviation glossary (clickable blue terms)
- **Quizzes** with instant feedback and explanations
- **Exercises** with tolerance-based validation and "Show answer" option
- **Interactive tools** — moment calculator, CG calculator, fuel converter, CG envelope explorer
- **Guided worked example** — step-by-step calculation with live loading sheet and CG envelope on the right panel. Teaches stop-and-correct: if a limit is exceeded, fix it before continuing
- **Progress saved** to localStorage — resume where you left off

### Sections

1. Introduction — what is M&B, why CG matters
2. Key Concepts — datum, arm, moment, CG
3. Mass Definitions — BEM, ZFM, TOM, LM, ramp mass
4. The CG Envelope — reading, plotting, exploring
5. Fuel — density, conversions, CG shift during burn
6. Modifications — MÄM/OÄM effects on limits and stations
7. Worked Example — full calculation with correction exercise

## Data Sources

- Diamond DA40 NG AFM, Doc. #6.01.15-E, Rev. 3 (Section 5 — Performance: 5.3.7–5.3.14, Section 6 — Mass & Balance)
- EASA Regulation (EU) No 965/2012, Annex IV — CAT.POL.A.305

## Aircraft Data

| Parameter | Value |
|---|---|
| Front seats arm | 2.30 m |
| Rear seats arm | 3.25 m |
| Fuel arm | 2.63 m |
| Baggage compartment arm | 3.65 m |
| Standard tank (usable) | 28 USG / 106 L |
| Long Range tank (usable) | 39 USG / 148 L |
| Fuel density | 0.84 kg/L |
| Base MTOM | 1280 kg |
| Base MLM | 1216 kg |
| Base MZFM | 1200 kg |

### Modifications

| Mod | Effect |
|---|---|
| MÄM 40-662 | MTOM increase to 1310 kg |
| MÄM 40-574 | MLM 1280 kg / MZFM 1265 kg |
| OÄM 40-164 | Baggage tube (arm 4.32 m, max 18 kg) |
| OÄM 40-331 | Baggage extension compartments |

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 + shadcn/ui
- react-router-dom with HashRouter (GitHub Pages compatible)
- Pure SVG for charts and diagrams
- GitHub Pages for hosting

## Development

```bash
git clone https://github.com/okpilot/flight-training-tools.git
cd flight-training-tools
npm install
npm run dev
```

## Disclaimer

**For training and reference purposes only.** Always verify all calculations against the official Aircraft Flight Manual for your specific aircraft. The pilot-in-command is solely responsible for verifying mass & balance and performance before every flight.

## License

MIT
