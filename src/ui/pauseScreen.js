/**
 * PauseScreen - Modal overlay when game is paused
 */
import { SCREENS, gameState } from '../core/gameState.js';
import { audio } from '../core/audio.js';

export class PauseScreen {
  constructor(container, gameInstance) {
    this.container = container;
    this.gameInstance = gameInstance;
    this.element = null;
  }

  mount() {
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop pause-modal';
    this.element.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">GAME PAUSED</h2>
        </div>

        <div class="modal-actions-list">
          <button class="btn btn-primary modal-btn" id="pause-resume-btn">
            <span class="btn-icon">▶</span>
            <span>RESUME</span>
          </button>

          <button class="btn btn-secondary modal-btn" id="pause-restart-btn">
            <span class="btn-icon">↺</span>
            <span>RESTART LEVEL</span>
          </button>

          <button class="btn btn-secondary modal-btn" id="pause-levels-btn">
            <span class="btn-icon">▦</span>
            <span>LEVEL SELECT</span>
          </button>

          <button class="btn btn-subtle modal-btn" id="pause-home-btn">
            <span class="btn-icon">⌂</span>
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.element.querySelector('#pause-resume-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.resume();
    });

    this.element.querySelector('#pause-restart-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.resume();
      this.gameInstance.restartCurrentLevel();
    });

    this.element.querySelector('#pause-levels-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.resume();
      gameState.setScreen(SCREENS.LEVEL_SELECT);
    });

    this.element.querySelector('#pause-home-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.resume();
      gameState.setScreen(SCREENS.HOME);
    });
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
