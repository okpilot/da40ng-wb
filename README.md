# DA40 NG Mass & Balance

A free, open-source, client-side web app for **calculating** and **learning** mass & balance on the **Diamond DA40 NG**. Built for flight students and instructors at Egmont Aviation ATO — no login, no backend, everything runs in your browser.

**[Open the app](https://okpilot.github.io/da40ng-wb/)**

## Calculator

Real-time mass & balance calculator matching the Egmont Aviation OM App 08.2 form layout.

- **M&B loading sheet** with inline limit checks (MTOM, MLM, MZFM)
- **CG envelope chart** (SVG) with ZFM, TOM, and LM plotted in real time
- **Modification support** — MÄM 40-662, MÄM 40-574, OÄM 40-164, OÄM 40-331
- **Standard & Long Range tanks** — fuel input in USG, with litres/kg shown
- **Calculation breakdown** — every step with formulas for verification
- **Fully offline** — no server, no database, no tracking

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

- Diamond DA40 NG AFM, Doc. #6.01.15-E, Rev. 3 (Section 6 — Mass & Balance)
- Egmont Aviation OM, App 08.2

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
git clone https://github.com/okpilot/da40ng-wb.git
cd da40ng-wb
npm install
npm run dev
```

## Disclaimer

**For training and reference purposes only.** Always verify mass & balance calculations against the official Aircraft Flight Manual for your specific aircraft. Oleksandr Konovalov bears no legal responsibility for the use of this calculator or training module. The pilot-in-command is solely responsible for verifying mass and balance before every flight.

## License

MIT
