/**
 * GameplayScreen - Main Puzzle HUD, Canvas Container & Mobile Touch Controls
 */
import { SCREENS, gameState } from '../core/gameState.js';
import { audio } from '../core/audio.js';
import { LIGHT_DIRECTIONS } from '../gameplay/shadowSystem.js';

export class GameplayScreen {
  constructor(container, gameInstance) {
    this.container = container;
    this.gameInstance = gameInstance;
    this.element = null;
    this.hintVisible = false;
  }

  mount() {
    const level = gameState.activeLevelData || { id: 1, name: 'First Light', targetMoves: 8, hint: 'Rotate the light!' };

    this.element = document.createElement('div');
    this.element.className = 'screen gameplay-screen';
    this.element.innerHTML = `
      <!-- Top HUD Header -->
      <header class="hud-header">
        <div class="hud-left">
          <button class="btn btn-icon-round hud-btn" id="hud-pause-btn" title="Pause Game">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1.5"></rect>
              <rect x="14" y="5" width="4" height="14" rx="1.5"></rect>
            </svg>
          </button>
          <div class="hud-level-info">
            <span class="hud-level-label">LEVEL ${level.id}</span>
            <span class="hud-level-name">${level.name}</span>
          </div>
        </div>

        <div class="hud-center">
          <div class="hud-metric-pill moves-pill">
            <span class="metric-label">MOVES</span>
            <span class="metric-val" id="hud-moves-val">0</span>
            <span class="metric-target" title="Target for 3 stars">/ ${level.targetMoves || 10}</span>
          </div>
          <div class="hud-metric-pill timer-pill">
            <span class="metric-label">TIME</span>
            <span class="metric-val" id="hud-timer-val">0.0s</span>
          </div>
        </div>

        <div class="hud-right">
          <button class="btn btn-icon-round hud-btn" id="hud-hint-btn" title="Show Hint">
            <span class="btn-emoji">💡</span>
          </button>
          <button class="btn btn-icon-round hud-btn" id="hud-restart-btn" title="Restart Level">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <polyline points="3 3 3 8 8 8"></polyline>
            </svg>
          </button>
        </div>
      </header>

      <!-- Optional Hint Banner -->
      <div class="hud-hint-banner" id="hud-hint-banner" style="display: none;">
        <span class="hint-icon">✦</span>
        <span class="hint-text">${level.hint || 'Experiment with different light angles.'}</span>
      </div>

      <!-- Main Canvas Board Container -->
      <main class="board-viewport" id="board-viewport">
        <canvas id="game-canvas"></canvas>
      </main>

      <!-- Bottom Interactive Controls Bar -->
      <footer class="hud-controls-footer">
        <!-- Desktop / Tablet Light Compass Controls -->
        <div class="light-control-panel">
          <div class="panel-label">
            <span class="light-bulb-icon">💡</span>
            <span>LIGHT DIRECTION</span>
          </div>

          <div class="light-compass-cluster">
            <button class="light-compass-btn dir-up" data-dir="${LIGHT_DIRECTIONS.UP}" title="Light from Top (casts down)">
              <span class="arrow">▲</span>
              <span class="key-hint">W / 3</span>
            </button>
            <div class="light-compass-row">
              <button class="light-compass-btn dir-left" data-dir="${LIGHT_DIRECTIONS.LEFT}" title="Light from Left (casts right)">
                <span class="arrow">◀</span>
                <span class="key-hint">A / 1</span>
              </button>
              <div class="light-compass-core" id="compass-indicator" title="Current Light Source">
                <div class="indicator-ray"></div>
              </div>
              <button class="light-compass-btn dir-right" data-dir="${LIGHT_DIRECTIONS.RIGHT}" title="Light from Right (casts left)">
                <span class="arrow">▶</span>
                <span class="key-hint">D / 2</span>
              </button>
            </div>
            <button class="light-compass-btn dir-down" data-dir="${LIGHT_DIRECTIONS.DOWN}" title="Light from Bottom (casts up)">
              <span class="arrow">▼</span>
              <span class="key-hint">S / 4</span>
            </button>
          </div>

          <div class="light-quick-rot-row">
            <button class="btn btn-sm btn-subtle" id="hud-rot-ccw" title="Rotate Counter-Clockwise (Q)">
              <span>⟲ Q</span>
            </button>
            <button class="btn btn-sm btn-subtle" id="hud-rot-cw" title="Rotate Clockwise (E)">
              <span>E ⟳</span>
            </button>
          </div>
        </div>

        <!-- Mobile Movement Virtual D-Pad (Visible on touch/small screens) -->
        <div class="mobile-dpad-panel" id="mobile-dpad">
          <div class="dpad-title">MOVE LUMI</div>
          <div class="dpad-grid">
            <button class="dpad-btn dpad-up" data-move="up">▲</button>
            <div class="dpad-mid-row">
              <button class="dpad-btn dpad-left" data-move="left">◀</button>
              <div class="dpad-center-hub">●</div>
              <button class="dpad-btn dpad-right" data-move="right">▶</button>
            </div>
            <button class="dpad-btn dpad-down" data-move="down">▼</button>
          </div>
        </div>
      </footer>
    `;

    this.container.appendChild(this.element);

    // Attach HUD button listeners
    this.element.querySelector('#hud-pause-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.pause();
    });

    this.element.querySelector('#hud-restart-btn').addEventListener('click', () => {
      audio.playClick();
      this.gameInstance.restartCurrentLevel();
    });

    const hintBanner = this.element.querySelector('#hud-hint-banner');
    this.element.querySelector('#hud-hint-btn').addEventListener('click', () => {
      audio.playClick(0.15, 750);
      this.hintVisible = !this.hintVisible;
      hintBanner.style.display = this.hintVisible ? 'flex' : 'none';
    });

    // Light direction compass buttons
    this.element.querySelectorAll('.light-compass-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        this.gameInstance.setLightDirection(dir);
      });
    });

    this.element.querySelector('#hud-rot-cw').addEventListener('click', () => {
      this.gameInstance.rotateLightClockwise();
    });
    this.element.querySelector('#hud-rot-ccw').addEventListener('click', () => {
      this.gameInstance.rotateLightCounterClockwise();
    });

    // Mobile D-pad movement buttons
    this.element.querySelectorAll('.dpad-btn').forEach(btn => {
      const handleMove = (e) => {
        e.preventDefault();
        const move = btn.dataset.move;
        if (move === 'up') this.gameInstance.movePlayer(0, -1);
        else if (move === 'down') this.gameInstance.movePlayer(0, 1);
        else if (move === 'left') this.gameInstance.movePlayer(-1, 0);
        else if (move === 'right') this.gameInstance.movePlayer(1, 0);
      };
      btn.addEventListener('touchstart', handleMove, { passive: false });
      btn.addEventListener('mousedown', handleMove);
    });

    this.updateActiveLightIndicator(this.gameInstance.lightSystem ? this.gameInstance.lightSystem.currentDirection : 'left');
  }

  updateLevelHeader(level) {
    if (!this.element) return;
    const label = this.element.querySelector('.hud-level-label');
    const name = this.element.querySelector('.hud-level-name');
    const target = this.element.querySelector('.metric-target');
    const hintText = this.element.querySelector('.hint-text');

    if (label) label.textContent = `LEVEL ${level.id}`;
    if (name) name.textContent = level.name;
    if (target) target.textContent = `/ ${level.targetMoves || 10}`;
    if (hintText) hintText.textContent = level.hint || 'Experiment with different light angles.';
    this.updateMoves(0);
    this.updateTimer(0);
  }

  updateMoves(moves) {
    const el = this.element ? this.element.querySelector('#hud-moves-val') : null;
    if (el) el.textContent = moves;
  }

  updateTimer(time) {
    const el = this.element ? this.element.querySelector('#hud-timer-val') : null;
    if (el) el.textContent = `${time.toFixed(1)}s`;
  }

  updateActiveLightIndicator(dir) {
    if (!this.element) return;
    this.element.querySelectorAll('.light-compass-btn').forEach(btn => {
      if (btn.dataset.dir === dir) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const indicator = this.element.querySelector('#compass-indicator .indicator-ray');
    if (indicator) {
      const angles = { left: 0, down: 90, right: 180, up: 270 };
      indicator.style.transform = `rotate(${angles[dir] || 0}deg)`;
    }
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
