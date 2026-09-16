# Cam Switch Configurator

Interactive browser-based configurator for a 12-contact / 24-terminal cam switch switching programme.

## Features
- 0°–345° cam positions in 15° increments
- 12 physical contact pairs / 24 terminals
- PDF-style alternating physical contact visualization
- Open, closed, and closed-without-interruption states
- Position return and spring return
- Global internal/external jumper wiring
- Conservative jumper limitation warnings
- Switching-program matrix
- Browser autosave plus JSON import/export
- Print-friendly layout

## GitHub Pages
The app is a static site. Publish the repository from the `main` branch, root (`/`) in **Settings → Pages**.

> Engineering note: internal-jumper rules in this prototype are conservative generic assumptions, not manufacturer-confirmed Secfetronik hardware rules. Always verify the final switch construction, contact ratings and bridge hardware with the manufacturer.
