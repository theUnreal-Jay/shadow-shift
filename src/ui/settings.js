/**
 * SettingsScreen - Audio & Gameplay Accessibility Configuration
 */
import { SCREENS, gameState } from '../core/gameState.js';
import { storage } from '../core/storage.js';
import { audio } from '../core/audio.js';

export class SettingsScreen {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  mount() {
    const settings = storage.get('settings') || {};

    this.element = document.createElement('div');
    this.element.className = 'screen settings-screen';
    this.element.innerHTML = `
      <header class="settings-header">
        <button class="btn btn-icon-round back-btn" id="sett-back-btn" title="Back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 class="sett-title">SETTINGS</h2>
        <div class="sett-spacer"></div>
      </header>

      <main class="settings-container">
        <div class="settings-card">
          <!-- Audio Section -->
          <div class="setting-group">
            <h3 class="group-title">AUDIO</h3>

            <div class="setting-row">
              <label class="setting-label" for="sett-sfx-slider">Sound Effects (SFX)</label>
              <div class="setting-ctrl-range">
                <input type="range" id="sett-sfx-slider" min="0" max="1" step="0.05" value="${settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8}">
                <span class="range-val" id="sett-sfx-val">${Math.round((settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8) * 100)}%</span>
              </div>
            </div>

            <div class="setting-row">
              <label class="setting-label" for="sett-music-slider">Ambient Music</label>
              <div class="setting-ctrl-range">
                <input type="range" id="sett-music-slider" min="0" max="1" step="0.05" value="${settings.musicVolume !== undefined ? settings.musicVolume : 0.5}">
                <span class="range-val" id="sett-music-val">${Math.round((settings.musicVolume !== undefined ? settings.musicVolume : 0.5) * 100)}%</span>
              </div>
            </div>
          </div>

          <!-- Gameplay & Accessibility Section -->
          <div class="setting-group">
            <h3 class="group-title">ACCESSIBILITY</h3>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Reduced Motion</span>
                <span class="setting-subtext">Minimizes screen shakes and camera eases</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="sett-reduced-motion" ${settings.reducedMotion ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Haptic Feedback</span>
                <span class="setting-subtext">Vibration feedback on supported mobile devices</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="sett-vibration" ${settings.vibration ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Data & Storage Section -->
          <div class="setting-group danger-group">
            <h3 class="group-title">SAVE DATA</h3>
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Reset Game Progress</span>
                <span class="setting-subtext">Permanently erases all completed levels, stars, and coins.</span>
              </div>
              <button class="btn btn-danger btn-sm" id="sett-reset-btn">RESET</button>
            </div>
          </div>
        </div>
      </main>
    `;

    this.container.appendChild(this.element);

    // Event listeners
    this.element.querySelector('#sett-back-btn').addEventListener('click', () => {
      audio.playClick();
      gameState.setScreen(gameState.previousScreen || SCREENS.HOME);
    });

    const sfxSlider = this.element.querySelector('#sett-sfx-slider');
    const sfxVal = this.element.querySelector('#sett-sfx-val');
    sfxSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      sfxVal.textContent = `${Math.round(val * 100)}%`;
      audio.setSfxVolume(val);
      settings.sfxVolume = val;
      storage.set('settings', settings);
      audio.playClick(val * 0.2);
    });

    const musicSlider = this.element.querySelector('#sett-music-slider');
    const musicVal = this.element.querySelector('#sett-music-val');
    musicSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      musicVal.textContent = `${Math.round(val * 100)}%`;
      audio.setMusicVolume(val);
      settings.musicVolume = val;
      storage.set('settings', settings);
    });

    const reducedMotionToggle = this.element.querySelector('#sett-reduced-motion');
    reducedMotionToggle.addEventListener('change', (e) => {
      settings.reducedMotion = e.target.checked;
      storage.set('settings', settings);
      audio.playClick();
    });

    const vibrationToggle = this.element.querySelector('#sett-vibration');
    vibrationToggle.addEventListener('change', (e) => {
      settings.vibration = e.target.checked;
      storage.set('settings', settings);
      audio.playClick();
    });

    const resetBtn = this.element.querySelector('#sett-reset-btn');
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
        storage.resetAll();
        audio.playClick();
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
