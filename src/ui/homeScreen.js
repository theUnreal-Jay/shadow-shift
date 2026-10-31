/**
 * HomeScreen - Main Navigation & Title Screen
 */
import { SCREENS, GAME_MODES, gameState } from '../core/gameState.js';
import { storage } from '../core/storage.js';
import { audio } from '../core/audio.js';
import { LEVELS, generateProceduralLevel, getDailyLevel } from '../data/levels.js';

export class HomeScreen {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  mount() {
    const stats = storage.get('stats') || {};
    const coins = storage.get('coins') || 0;
    const completed = storage.get('completedLevels') || {};
    const unlocked = storage.get('unlockedLevels') || [1];

    // Find highest unlocked level
    const highestUnlocked = Math.max(...unlocked, 1);
    const totalStars = stats.starsCollected || 0;

    this.element = document.createElement('div');
    this.element.className = 'screen home-screen';
    this.element.innerHTML = `
      <div class="home-decorations">
        <div class="ambient-light-cone"></div>
        <div class="ambient-shadow-monolith"></div>
      </div>

      <header class="home-header">
        <div class="home-currency-badge">
          <span class="currency-item star-pill">
            <span class="icon">★</span>
            <span class="val">${totalStars}</span>
          </span>
          <span class="currency-item coin-pill">
            <span class="icon">🪙</span>
            <span class="val">${coins}</span>
          </span>
        </div>
      </header>

      <main class="home-main">
        <div class="home-brand">
          <div class="home-icon-orb">
            <div class="orb-inner"></div>
            <div class="orb-beam"></div>
          </div>
          <h1 class="home-title">SHADOW SHIFT</h1>
          <p class="home-subtitle">Change the light. Change the world.</p>
        </div>

        <div class="home-menu-grid">
          <button class="btn btn-primary btn-large menu-btn play-btn" id="home-play-btn">
            <div class="btn-shine"></div>
            <span class="btn-icon">▶</span>
            <span class="btn-text-group">
              <span class="btn-label">PLAY CAMPAIGN</span>
              <span class="btn-subtext">Level ${highestUnlocked} of 100</span>
            </span>
          </button>

          <button class="btn btn-secondary menu-btn" id="home-level-select-btn">
            <span class="btn-icon">▦</span>
            <span class="btn-label">LEVELS (100)</span>
          </button>

          <button class="btn btn-secondary menu-btn daily-btn" id="home-daily-btn">
            <span class="btn-icon">📅</span>
            <span class="btn-text-group">
              <span class="btn-label">DAILY PUZZLE</span>
              <span class="btn-subtext">${storage.get('dailyCompletedToday') ? '✓ Completed' : 'Earn +45 Coins'}</span>
            </span>
          </button>

          <button class="btn btn-secondary menu-btn" id="home-endless-btn">
            <span class="btn-icon">♾</span>
            <span class="btn-label">PROCEDURAL VOID</span>
          </button>

          <div class="home-sub-menu-row">
            <button class="btn btn-icon-tile" id="home-collection-btn" title="Collection & Skins">
              <span class="tile-icon">🎨</span>
              <span class="tile-label">Wardrobe</span>
            </button>

            <button class="btn btn-icon-tile" id="home-settings-btn" title="Settings">
              <span class="tile-icon">⚙</span>
              <span class="tile-label">Settings</span>
            </button>
          </div>
        </div>
      </main>

      <footer class="home-footer">
        <p class="footer-tip">Tip: Press Q & E or 1-4 to rotate the light source quickly</p>
      </footer>
    `;

    this.container.appendChild(this.element);

    // Event listeners
    this.element.querySelector('#home-play-btn').addEventListener('click', () => {
      audio.playClick();
      const level = LEVELS.find(l => l.id === highestUnlocked) || LEVELS[0];
      gameState.startLevel(level, GAME_MODES.CAMPAIGN);
    });

    this.element.querySelector('#home-level-select-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.setScreen(SCREENS.LEVEL_SELECT);
    });

    this.element.querySelector('#home-daily-btn').addEventListener('click', () => {
      audio.playClick();
      const today = new Date().toISOString().slice(0, 10);
      const dailyLevel = getDailyLevel(today);
      gameState.startLevel(dailyLevel, GAME_MODES.DAILY);
    });

    this.element.querySelector('#home-endless-btn').addEventListener('click', () => {
      audio.playClick();
      const randomSeed = Math.floor(Math.random() * 90000) + 1000;
      const proceduralLevel = generateProceduralLevel(randomSeed);
      gameState.startLevel(proceduralLevel, GAME_MODES.PROCEDURAL);
    });

    this.element.querySelector('#home-collection-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.setScreen(SCREENS.COLLECTION);
    });

    this.element.querySelector('#home-settings-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.setScreen(SCREENS.SETTINGS);
    });
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
