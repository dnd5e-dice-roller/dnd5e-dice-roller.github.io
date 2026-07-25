# 🎲 D&D 5e Dice Roller ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

A physics-based 3D dice roller built for **Dungeons & Dragons 5e**, running entirely in the browser with no backend required. Designed for mobile-first use, with a warm tabletop aesthetic and a full D&D character sheet integration.

---

## Features

### Core Rolling
- **6 standard dice** — d4, d6, d8, d10, d12, d20 — with individual quantity counters (up to 10 per type)
- **d100 / Percentile** mode with automatic tens + units breakdown
- **Numeric modifier** (positive or negative) added to any roll
- **Advantage & Disadvantage** — rolls 2d20 and keeps the highest or lowest
- **Roll Type Picker** — when rolling from the Skills panel, choose Normal, Advantage, or Disadvantage on the fly
- **Nat 1 / Nat 20** toast notification on single d20 rolls

### Character Sheet (Skills Panel ⭐)
- **6 Ability Scores** — STR, DEX, CON, INT, WIS, CHA — with modifier auto-calculation
- **Proficiency Bonus** — Set your PB and it will added automatically to your savings throws and your skills proficiencies
- **Saving Throws** — roll any save directly; mark proficiency per ability
- **18 D&D 5e Skills** — grouped by ability, with one-tap rolls; toggle **Proficiency** or **Expertise** per skill (modifier auto-applied)

### Custom Rolls 🎲
- Save named roll combinations (dice + modifier) for quick reuse
- Launch a saved roll directly from the panel
- Delete individual entries; list persists across sessions

### History 📋
- List of last 10 rolls you made with roll detail included
- Clear button to delete entries

### Physics & Appearance
- **Physics panel ⚙️** — tweak dice size (Small / Medium / Large), gravity, friction, bounce, light intensity, and shadows
- **Color panel 🎨** — pick any custom color via color picker
- Multiple custom 3D themes: plain custom colors and gemstones themes (amber, amethyst, aquamarine, diamond, emerald, onyx, ruby, sapphire)
- Wood-texture tabletop background

### Persistence
- All state (dice counts, modifier, ability scores, proficiencies, custom rolls, physics settings, dice color) is automatically saved to **localStorage** and restored on next visit

### Saving Data
- You can save your Character Sheet and Custom Rolls data. A JSON file will be automatically saved to your Downloads folder, which you can later load to recover all data in case you lose or accidentally modify it.

---

## Tech Stack

| Layer | Detail |
|---|---|
| Renderer | [`@3d-dice/dice-box`](https://github.com/3d-dice/dice-box) v1.1.4 — WebGL / Rapier physics |
| Frontend | Vanilla HTML + CSS + ES Modules (no build step) |
| Persistence | `localStorage` |
| Hosting | Static file (works with GitHub Pages, Netlify, etc.) |

---

## Project Structure

```
/
├── index.html          # Single-file app (HTML + CSS + JS)
└── assets/
    ├── wood-bg.jpg     # Table background texture
    └── ...             # Dice-box WASM & asset files
```

> Custom 3D themes are loaded from jsDelivr CDN pointing to this repository's `/themes/` folder.

---

## Getting Started

### Run locally

Since the app uses ES Modules and loads WebAssembly assets, it requires a local HTTP server — simply opening `index.html` via `file://` will not work.

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

### Deploy to GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set source to the `main` branch, root folder `/`
4. Done — your dice roller will be live at `https://<user>.github.io/<repo>/`

---

## Usage

1. Use the **+** / **−** buttons to select how many of each die to roll
2. Set a **Modifier** if needed
3. Tap **Roll** — watch the physics simulation settle, then read the result at the top
4. Use **Advantage** or **Disadvantage** for quick 2d20 rolls
5. Use **d100** for a percentile roll (d10 tens + d10 units)
6. Open **👤 Character Sheet** to configure your character stats and roll directly from any ability, saving throws or skills
7. Open **🎲 Custom Rolls** to build and save reusable roll combinations
8. Open **📋 History** to see the last 10 rolls you made. Tap **Clear** to reset the table
9. Open **⚙️ Physics** or **🎨 Color** to personalize the experience