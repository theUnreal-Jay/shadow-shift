/**
 * LevelSelect - 100 Levels Organized Across 10 Chapters
 */
import { SCREENS, GAME_MODES, gameState } from '../core/gameState.js';
import { storage } from '../core/storage.js';
import { audio } from '../core/audio.js';
import { CHAPTERS } from '../data/chapters.js';
import { LEVELS } from '../data/levels.js';

export class LevelSelect {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.activeChapterId = 1;
  }

  mount() {
    this.element = document.createElement('div');
    this.element.className = 'screen level-select-screen';
    this.render();
    this.container.appendChild(this.element);
  }

  render() {
    const unlocked = storage.get('unlockedLevels') || [1];
    const completed = storage.get('completedLevels') || {};

    const chapter = CHAPTERS.find(c => c.id === this.activeChapterId) || CHAPTERS[0];
    const [startLvl, endLvl] = chapter.levelsRange;
    const chapterLevels = LEVELS.filter(l => l.id >= startLvl && l.id <= endLvl);

    // Compute chapter stars
    let chapterStars = 0;
    chapterLevels.forEach(l => {
      if (completed[l.id]) chapterStars += completed[l.id].stars || 0;
    });

    this.element.innerHTML = `
      <header class="level-select-header">
        <button class="btn btn-icon-round back-btn" id="ls-back-btn" title="Back to Home">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="header-titles">
          <h2 class="ls-title">SELECT LEVEL</h2>
          <span class="ls-chapter-stars">Chapter Stars: ${chapterStars} / 30 ★</span>
        </div>
        <div class="ls-spacer"></div>
      </header>

      <!-- Chapter Navigation Tabs -->
      <nav class="chapter-tabs-bar">
        ${CHAPTERS.map(c => `
          <button class="chapter-tab ${c.id === this.activeChapterId ? 'active' : ''}" data-chapter="${c.id}">
            <span class="tab-badge">${c.badgeIcon}</span>
            <span class="tab-num">Ch.${c.id}</span>
          </button>
        `).join('')}
      </nav>

      <!-- Chapter Banner -->
      <div class="chapter-banner" style="border-left-color: ${chapter.color}">
        <div class="banner-info">
          <h3 class="banner-title">${chapter.title}</h3>
          <p class="banner-desc">${chapter.description}</p>
        </div>
      </div>

      <!-- Level Cards Grid -->
      <main class="levels-grid-container">
        <div class="levels-grid">
          ${chapterLevels.map(lvl => {
            const isUnlocked = unlocked.includes(lvl.id);
            const record = completed[lvl.id];
            const stars = record ? record.stars : 0;

            return `
              <div class="level-card ${isUnlocked ? 'unlocked' : 'locked'} ${record ? 'completed' : ''}" data-level-id="${lvl.id}">
                ${!isUnlocked ? `
                  <div class="lock-overlay">
                    <span class="lock-icon">🔒</span>
                  </div>
                ` : `
                  <div class="card-num">${lvl.id}</div>
                  <div class="card-name">${lvl.name}</div>
                  <div class="card-stars">
                    <span class="star ${stars >= 1 ? 'filled' : ''}">★</span>
                    <span class="star ${stars >= 2 ? 'filled' : ''}">★</span>
                    <span class="star ${stars >= 3 ? 'filled' : ''}">★</span>
                  </div>
                  ${record ? `
                    <div class="card-record">Best: ${record.bestMoves} moves</div>
                  ` : ''}
                `}
              </div>
            `;
          }).join('')}
        </div>
      </main>
    `;

    // Attach listeners
    this.element.querySelector('#ls-back-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.setScreen(SCREENS.HOME);
    });

    this.element.querySelectorAll('.chapter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        audio.playClick(0.12, 550);
        this.activeChapterId = parseInt(tab.dataset.chapter, 10);
        this.render();
      });
    });

    this.element.querySelectorAll('.level-card.unlocked').forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        const levelId = parseInt(card.dataset.levelId, 10);
        const levelData = LEVELS.find(l => l.id === levelId);
        if (levelData) {
          gameState.startLevel(levelData, GAME_MODES.CAMPAIGN);
        }
      });
    });
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
