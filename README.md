# DA40 NG Mass & Balance Calculator

A free, open-source, client-side web app for calculating mass & balance on the **Diamond DA40 NG**. Built for flight students and instructors — no login, no backend, everything runs in your browser.

**[Open the calculator](https://okpilot.github.io/da40ng-wb/)**

## Features

- **Mass & Balance sheet** matching the Egmont Aviation OM App 08.2 form layout
- **CG envelope chart** (AFM-style SVG) with ZFM, TOM, and LM plotted in real time
- **Inline limit checks** — mass limits and CG envelope pass/fail shown directly in the form
- **Modification support** — toggle MÄM 40-662, MÄM 40-574, OÄM 40-164, OÄM 40-331 and see limits and envelope adjust instantly
- **Standard & Long Range tanks** — fuel input in USG (per AFM), with litres shown for awareness
- **Calculation breakdown** — every step shown with formulas, so students can follow and verify the math
- **Fully offline** — no server, no database, no tracking. Works on any device with a browser

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
| Base max landing mass | 1216 kg |
| Base max ZFM | 1200 kg |

### Modifications

| Mod | Effect |
|---|---|
| MÄM 40-662 | MTOM increase to 1310 kg |
| MÄM 40-574 | Max landing 1280 kg / Max ZFM 1265 kg |
| OÄM 40-164 | Baggage tube (arm 4.32 m, max 18 kg) |
| OÄM 40-331 | Baggage extension compartments |

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- Pure SVG for the CG envelope chart
- GitHub Pages for hosting

## Development

```bash
git clone https://github.com/okpilot/da40ng-wb.git
cd da40ng-wb
npm install
npm run dev
```

## Disclaimer

**For training and reference purposes only.** Always verify mass & balance calculations against the official AFM and your operator's documentation before flight. The authors accept no responsibility for the use of this tool in operational flight planning.

## License

MIT
