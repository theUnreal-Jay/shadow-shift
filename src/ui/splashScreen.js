/**
 * SplashScreen - Atmospheric Cinematic Intro
 */
import { SCREENS, gameState } from '../core/gameState.js';
import { audio } from '../core/audio.js';

export class SplashScreen {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  mount() {
    this.element = document.createElement('div');
    this.element.className = 'screen splash-screen';
    this.element.innerHTML = `
      <div class="splash-content">
        <div class="splash-light-beacon">
          <div class="beacon-glow"></div>
          <div class="beacon-ray"></div>
        </div>
        <div class="splash-logo-container">
          <h1 class="splash-title">SHADOW SHIFT</h1>
          <p class="splash-tagline">"Change the light. Change the world."</p>
        </div>
        <div class="splash-lumi-preview">
          <svg class="splash-lumi-svg" viewBox="0 0 100 100" width="80" height="80">
            <defs>
              <radialGradient id="splashLumiGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#fff5cc" />
                <stop offset="100%" stop-color="#fdcb6e" />
              </radialGradient>
              <filter id="splashLumiGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="32" fill="#fdcb6e" opacity="0.3" filter="url(#splashLumiGlow)" />
            <!-- Antenna -->
            <path d="M50 30 Q54 18 60 14" stroke="#fdcb6e" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="60" cy="14" r="5" fill="#ffeaa7" />
            <!-- Body -->
            <path d="M50 25 C72 25 78 68 50 75 C22 68 28 25 50 25 Z" fill="url(#splashLumiGrad)" />
            <!-- Eyes -->
            <ellipse cx="43" cy="48" rx="4.5" ry="6.5" fill="#2d3436" />
            <circle cx="41.5" cy="46" r="1.8" fill="#ffffff" />
            <ellipse cx="57" cy="48" rx="4.5" ry="6.5" fill="#2d3436" />
            <circle cx="55.5" cy="46" r="1.8" fill="#ffffff" />
            <!-- Cheeks -->
            <circle cx="36" cy="56" r="3" fill="rgba(255, 118, 117, 0.6)" />
            <circle cx="64" cy="56" r="3" fill="rgba(255, 118, 117, 0.6)" />
            <!-- Smile -->
            <path d="M47 57 Q50 61 53 57" stroke="#2d3436" stroke-width="1.8" fill="none" stroke-linecap="round" />
          </svg>
        </div>
        <button class="btn btn-primary splash-start-btn" id="splash-start-btn">
          <span>ENTER THE SHADOWS</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <p class="splash-prompt">Press SPACE or click anywhere to begin</p>
      </div>
    `;

    this.container.appendChild(this.element);

    const startBtn = this.element.querySelector('#splash-start-btn');
    const startAction = () => {
      audio.ensureContext();
      audio.playClick(0.3, 700);
      audio.startAmbientMusic();
      gameState.setScreen(SCREENS.HOME);
    };

    startBtn.addEventListener('click', startAction);
    this.element.addEventListener('click', (e) => {
      if (e.target !== startBtn && !startBtn.contains(e.target)) {
        startAction();
      }
    });

    this.keyHandler = (e) => {
      if (gameState.currentScreen === SCREENS.SPLASH) {
        startAction();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  unmount() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
