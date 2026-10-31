# SHADOW SHIFT
> *"Change the light. Change the world."*

A unique 2D shadow-manipulation puzzle arcade game built with **Vanilla JavaScript (ES Modules), HTML5 Canvas, SVG illustrations, Web Audio API, and CSS3**.

---

## ✦ Core Game Concept

Objects cast shadows, and those shadows become physical, usable platforms.

The player controls the direction of a directional light projector (`UP`, `DOWN`, `LEFT`, `RIGHT`). Rotating the light dynamically alters shadow projections across empty chasms, allowing **Lumi**—a glowing celestial spark—to traverse the void and reach the celestial exit portal.

---

## ✦ Features

- **100 Handcrafted Campaign Levels**: Spanning 10 thematic chapters:
  1. *Learning the Light* — Basic shadow bridges & exit navigation
  2. *Longer Shadows* — Multi-pillar structures & crystal shard routing
  3. *Moving Light* — Dynamic light timing & spatial coordination
  4. *Fragile Shadows* — Brittle shadow bridges with step limits
  5. *Multiple Light Sources* — Dual intersecting beams & compound platforms
  6. *Rotating Objects* — Crystal prisms deflecting shadows at 90° angles
  7. *Shadow Switches* — Pressure floor plates activating mechanisms
  8. *Dark Zones* — Light-absorbing void areas requiring indirect routing
  9. *Time Challenges* — Par move limits & ticking speed trials
  10. *Master Puzzles* — The Grand Zenith combining all mechanics
- **Infinite Procedural Mode ("Procedural Void")**: Infinite, guaranteed-solvable procedural puzzles powered by BFS reachability validation.
- **Daily Challenge**: Seeded daily puzzle with bonus coin rewards and streak tracking.
- **Original Character (LUMI)**: Animated procedural illustration with idle breathing, squash-and-stretch landing, blinking, and expressive eyes that physically track the light source.
- **Safe Recovery System**: If a shadow vanishes beneath Lumi, a rewind sequence safely returns Lumi to the last stable ground without breaking game state.
- **Synthesized Web Audio API**: Generative E-minor pentatonic ambient music and 10 procedurally synthesized sound effects with zero external audio assets.
- **Cosmetics & Wardrobe**: Unlockable Lumi skins (*Classic Spark*, *Amethyst Phantom*, *Cyber Neon*, *Sakura Whisper*, *Solar Flare*, *Quantum Ghost*), lantern projectors, board themes, and achievements.
- **Responsive Controls**: Desktop keyboard controls + touch-friendly mobile virtual D-Pad and compass.
- **Save System**: Persistent `localStorage` tracking stars, coins, unlocked skins, best moves, and achievements.

---

## ✦ Controls

| Action | Desktop Keyboard | Mobile / Touch |
| :--- | :--- | :--- |
| **Move Lumi** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual D-Pad |
| **Light Direction** | `1` (Left), `2` (Right), `3` (Up), `4` (Down) | On-screen Compass (`▲`, `◀`, `▼`, `▶`) |
| **Rotate Light** | `Q` (Counter-Clockwise) / `E` (Clockwise) | Quick Rotate Buttons |
| **Restart Level** | `R` | Top HUD Restart Button |
| **Toggle Hint** | `H` | Top HUD Lightbulb Icon |
| **Pause Game** | `Escape` or `P` | Top HUD Pause Button |

---

## ✦ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/theUnreal-Jay/shadow-shift.git
   cd shadow-shift
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## ✦ Tech Stack

- **Core**: Vanilla JavaScript (ES Modules)
- **Renderer**: HTML5 Canvas 2D + SVG Illustrations
- **Audio**: Web Audio API (Synthesized SFX & Ambient Music)
- **Styling**: Vanilla CSS3 (Glassmorphism, CSS Gradients, Flexbox/Grid)
- **Bundler**: Vite
