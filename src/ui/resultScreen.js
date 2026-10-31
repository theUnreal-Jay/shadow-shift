/**
 * ResultScreen - Victory modal overlay with star animations and rewards
 */
import { SCREENS, GAME_MODES, gameState } from '../core/gameState.js';
import { audio } from '../core/audio.js';
import { LEVELS } from '../data/levels.js';

export class ResultScreen {
  constructor(container, gameInstance) {
    this.container = container;
    this.gameInstance = gameInstance;
    this.element = null;
  }

  mount(resultData) {
    const { levelId, stars = 3, moves = 8, time = 12.5, coinsEarned = 45, mode } = resultData;
    const level = gameState.activeLevelData || {};

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop victory-modal';
    this.element.innerHTML = `
      <div class="modal-card victory-card">
        <div class="victory-header">
          <div class="victory-rays"></div>
          <h2 class="victory-title">LEVEL COMPLETE!</h2>
          <p class="victory-level-name">${level.name || `Level ${levelId}`}</p>
        </div>

        <div class="victory-stars-cluster">
          <div class="star-item star-1 ${stars >= 1 ? 'earned pop' : ''}">
            <span class="star-glyph">★</span>
            <span class="star-desc">Completed</span>
          </div>
          <div class="star-item star-2 ${stars >= 2 ? 'earned pop' : ''}">
            <span class="star-glyph">★</span>
            <span class="star-desc">All Crystals</span>
          </div>
          <div class="star-item star-3 ${stars >= 3 ? 'earned pop' : ''}">
            <span class="star-glyph">★</span>
            <span class="star-desc">Under ${level.targetMoves || 10} Moves</span>
          </div>
        </div>

        <div class="victory-stats-row">
          <div class="stat-box">
            <span class="stat-lbl">MOVES</span>
            <span class="stat-val ${moves <= (level.targetMoves || 10) ? 'highlight' : ''}">${moves}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">TIME</span>
            <span class="stat-val">${time.toFixed(1)}s</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">REWARD</span>
            <span class="stat-val coin-val">+${coinsEarned} 🪙</span>
          </div>
        </div>

        <div class="victory-actions-row">
          <button class="btn btn-secondary modal-btn" id="victory-replay-btn" title="Replay">
            <span class="btn-icon">↺</span>
            <span>RETRY</span>
          </button>

          <button class="btn btn-secondary modal-btn" id="victory-levels-btn" title="Level Select">
            <span class="btn-icon">▦</span>
            <span>LEVELS</span>
          </button>

          <button class="btn btn-primary modal-btn next-btn" id="victory-next-btn">
            <span>NEXT LEVEL</span>
            <span class="btn-icon">▶</span>
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    // Play victory sound fanfare
    audio.playLevelComplete();

    // Spawn victory confetti on canvas
    if (this.gameInstance.board) {
      this.gameInstance.board.particles.createVictoryConfetti(
        this.gameInstance.board.canvas.width / (window.devicePixelRatio || 1),
        this.gameInstance.board.canvas.height / (window.devicePixelRatio || 1)
      );
    }

    // Attach listeners
    this.element.querySelector('#victory-replay-btn').addEventListener('click', () => {
      audio.playClick();
      this.unmount();
      this.gameInstance.resultView = null;
      this.gameInstance.restartCurrentLevel();
    });

    this.element.querySelector('#victory-levels-btn').addEventListener('click', () => {
      audio.playClick();
      this.unmount();
      this.gameInstance.resultView = null;
      gameState.setScreen(SCREENS.LEVEL_SELECT);
    });

    this.element.querySelector('#victory-next-btn').addEventListener('click', () => {
      audio.playClick();
      this.unmount();
      this.gameInstance.resultView = null;
      if (mode === GAME_MODES.CAMPAIGN) {
        const nextId = Number(levelId) + 1;
        const nextLevel = LEVELS.find(l => l.id === nextId);
        if (nextLevel) {
          gameState.startLevel(nextLevel, GAME_MODES.CAMPAIGN);
        } else {
          gameState.setScreen(SCREENS.LEVEL_SELECT);
        }
      } else {
        gameState.setScreen(SCREENS.HOME);
      }
    });
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
