/**
 * CollectionScreen - Wardrobe, Skins, Projectors, and Achievements
 */
import { SCREENS, gameState } from '../core/gameState.js';
import { storage } from '../core/storage.js';
import { audio } from '../core/audio.js';
import { LUMI_SKINS, LANTERNS, THEMES } from '../data/skins.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

export class CollectionScreen {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.activeTab = 'skins'; // 'skins' | 'lanterns' | 'themes' | 'achievements'
  }

  mount() {
    this.element = document.createElement('div');
    this.element.className = 'screen collection-screen';
    this.render();
    this.container.appendChild(this.element);
  }

  render() {
    const coins = storage.get('coins') || 0;
    const unlockedSkins = storage.get('unlockedSkins') || ['classic'];
    const activeSkin = storage.get('activeSkin') || 'classic';
    const unlockedAchievements = storage.get('achievements') || {};

    this.element.innerHTML = `
      <header class="collection-header">
        <button class="btn btn-icon-round back-btn" id="coll-back-btn" title="Back to Home">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 class="coll-title">WARDROBE & VAULT</h2>
        <div class="coll-coins-badge">
          <span>🪙</span>
          <span class="coin-count">${coins}</span>
        </div>
      </header>

      <!-- Tabs Bar -->
      <nav class="coll-tabs-bar">
        <button class="coll-tab ${this.activeTab === 'skins' ? 'active' : ''}" data-tab="skins">
          <span>Lumi Skins</span>
        </button>
        <button class="coll-tab ${this.activeTab === 'lanterns' ? 'active' : ''}" data-tab="lanterns">
          <span>Lanterns</span>
        </button>
        <button class="coll-tab ${this.activeTab === 'themes' ? 'active' : ''}" data-tab="themes">
          <span>Themes</span>
        </button>
        <button class="coll-tab ${this.activeTab === 'achievements' ? 'active' : ''}" data-tab="achievements">
          <span>Achievements</span>
        </button>
      </nav>

      <main class="coll-content-container">
        ${this.activeTab === 'skins' ? this.renderSkinsTab(unlockedSkins, activeSkin, coins) : ''}
        ${this.activeTab === 'lanterns' ? this.renderLanternsTab(coins) : ''}
        ${this.activeTab === 'themes' ? this.renderThemesTab(coins) : ''}
        ${this.activeTab === 'achievements' ? this.renderAchievementsTab(unlockedAchievements) : ''}
      </main>
    `;

    // Attach listeners
    this.element.querySelector('#coll-back-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.setScreen(SCREENS.HOME);
    });

    this.element.querySelectorAll('.coll-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        audio.playClick(0.12, 550);
        this.activeTab = tab.dataset.tab;
        this.render();
      });
    });

    // Equip / Buy Skin buttons
    this.element.querySelectorAll('.skin-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skinId = btn.dataset.skinId;
        const skin = LUMI_SKINS.find(s => s.id === skinId);
        const isUnlocked = unlockedSkins.includes(skinId);

        if (isUnlocked) {
          // Equip
          storage.set('activeSkin', skinId);
          audio.playClick(0.2, 800);
          this.render();
        } else if (coins >= skin.price) {
          // Buy
          storage.addCoins(-skin.price);
          storage.unlockSkin(skinId);
          storage.set('activeSkin', skinId);
          audio.playCollect();
          this.render();
        }
      });
    });
  }

  renderSkinsTab(unlockedSkins, activeSkin, coins) {
    return `
      <div class="coll-grid skins-grid">
        ${LUMI_SKINS.map(skin => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isEquipped = activeSkin === skin.id;
          const canAfford = coins >= skin.price;

          return `
            <div class="coll-card ${isEquipped ? 'equipped' : ''}">
              <div class="card-preview-orb" style="background: radial-gradient(circle at 35% 35%, #fff, ${skin.color}); box-shadow: 0 0 16px ${skin.color}66;">
                <div class="orb-eyes">
                  <span class="eye"></span>
                  <span class="eye"></span>
                </div>
              </div>

              <div class="card-details">
                <div class="card-tag">${skin.tag}</div>
                <h4 class="card-title">${skin.name}</h4>
                <p class="card-desc">${skin.description}</p>
              </div>

              <div class="card-footer">
                ${isEquipped ? `
                  <button class="btn btn-sm btn-subtle disabled">EQUIPPED</button>
                ` : isUnlocked ? `
                  <button class="btn btn-sm btn-secondary skin-action-btn" data-skin-id="${skin.id}">EQUIP</button>
                ` : `
                  <button class="btn btn-sm btn-primary skin-action-btn ${canAfford ? '' : 'disabled'}" data-skin-id="${skin.id}">
                    <span>${skin.price} 🪙</span>
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderLanternsTab(coins) {
    const activeLantern = storage.get('activeLantern') || 'brass';
    return `
      <div class="coll-grid">
        ${LANTERNS.map(lantern => `
          <div class="coll-card ${activeLantern === lantern.id ? 'equipped' : ''}">
            <div class="card-preview-orb" style="background: ${lantern.color}; box-shadow: 0 0 16px ${lantern.color}66;">
              <span class="lantern-glyph">💡</span>
            </div>
            <div class="card-details">
              <h4 class="card-title">${lantern.name}</h4>
              <p class="card-desc">${lantern.description}</p>
            </div>
            <div class="card-footer">
              <button class="btn btn-sm ${activeLantern === lantern.id ? 'btn-subtle disabled' : 'btn-secondary'}">
                ${activeLantern === lantern.id ? 'EQUIPPED' : 'SELECT'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderThemesTab(coins) {
    const activeTheme = storage.get('activeTheme') || 'theater';
    return `
      <div class="coll-grid">
        ${THEMES.map(theme => `
          <div class="coll-card ${activeTheme === theme.id ? 'equipped' : ''}">
            <div class="card-preview-orb" style="background: ${theme.bg}; border: 1px solid rgba(255,255,255,0.2);">
              <span class="theme-glyph">🏛</span>
            </div>
            <div class="card-details">
              <h4 class="card-title">${theme.name}</h4>
              <p class="card-desc">${theme.description}</p>
            </div>
            <div class="card-footer">
              <button class="btn btn-sm ${activeTheme === theme.id ? 'btn-subtle disabled' : 'btn-secondary'}">
                ${activeTheme === theme.id ? 'EQUIPPED' : 'SELECT'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAchievementsTab(unlockedAchievements) {
    return `
      <div class="coll-grid achievements-grid">
        ${ACHIEVEMENTS.map(ach => {
          const isUnlocked = !!unlockedAchievements[ach.id];
          return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
              <div class="ach-badge">${ach.icon}</div>
              <div class="ach-info">
                <h4 class="ach-title">${ach.title}</h4>
                <p class="ach-desc">${ach.description}</p>
              </div>
              <div class="ach-reward">
                ${isUnlocked ? '<span class="ach-status">✓ Claimed</span>' : `<span class="reward-pill">+${ach.reward} 🪙</span>`}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
