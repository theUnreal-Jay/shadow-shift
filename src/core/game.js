/**
 * Main Game Controller for SHADOW SHIFT
 * Orchestrates rendering loop, input, physics, state transitions, and audio.
 */
import { SCREENS, GAME_MODES, gameState } from './gameState.js';
import { storage } from './storage.js';
import { audio } from './audio.js';
import { events } from './eventManager.js';

import { Player } from '../gameplay/player.js';
import { LightSystem } from '../gameplay/lightSystem.js';
import { ShadowSystem, LIGHT_DIRECTIONS } from '../gameplay/shadowSystem.js';
import { CollisionSystem } from '../gameplay/collision.js';
import { BoardRenderer } from '../gameplay/board.js';

import { SplashScreen } from '../ui/splashScreen.js';
import { HomeScreen } from '../ui/homeScreen.js';
import { LevelSelect } from '../ui/levelSelect.js';
import { GameplayScreen } from '../ui/gameplayScreen.js';
import { PauseScreen } from '../ui/pauseScreen.js';
import { ResultScreen } from '../ui/resultScreen.js';
import { CollectionScreen } from '../ui/collection.js';
import { SettingsScreen } from '../ui/settings.js';

export class Game {
  constructor(appElement) {
    this.appElement = appElement;

    // Gameplay Systems
    this.player = new Player(0, 0);
    this.lightSystem = new LightSystem(LIGHT_DIRECTIONS.LEFT);
    this.shadowSystem = null;
    this.collision = null;
    this.board = null;

    // Active Screen references
    this.currentView = null;
    this.pauseView = null;
    this.resultView = null;

    // Timing loop
    this.lastTime = performance.now();
    this.isRunning = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupInputHandlers();

    // Start on Splash Screen
    this.switchScreen(SCREENS.SPLASH);

    // Start 60fps render loop
    this.isRunning = true;
    requestAnimationFrame((t) => this.loop(t));
  }

  setupEventListeners() {
    events.on('SCREEN_CHANGED', ({ to }) => {
      this.switchScreen(to);
    });

    events.on('LEVEL_STARTED', ({ level }) => {
      if (this.currentView instanceof GameplayScreen) {
        this.currentView.updateLevelHeader(level);
      }
      this.loadLevel(level);
    });

    events.on('MOVES_CHANGED', ({ moves }) => {
      if (this.currentView instanceof GameplayScreen) {
        this.currentView.updateMoves(moves);
      }
    });

    events.on('TIMER_TICK', ({ time }) => {
      if (this.currentView instanceof GameplayScreen) {
        this.currentView.updateTimer(time);
      }
    });

    events.on('GAME_PAUSED', () => {
      if (!this.pauseView) {
        this.pauseView = new PauseScreen(this.appElement, this);
        this.pauseView.mount();
      }
    });

    events.on('GAME_RESUMED', () => {
      if (this.pauseView) {
        this.pauseView.unmount();
        this.pauseView = null;
      }
    });

    events.on('LEVEL_COMPLETED', (resultData) => {
      if (!this.resultView) {
        this.resultView = new ResultScreen(this.appElement, this);
        this.resultView.mount(resultData);
      }
    });

    events.on('PLAYER_STEP', ({ x, y }) => {
      if (this.board) {
        const px = this.board.offsetX + (x + 0.5) * this.board.cellSize;
        const py = this.board.offsetY + (y + 0.5) * this.board.cellSize;
        this.board.particles.createStepPuff(px, py);
      }
    });

    events.on('PLAYER_LOST_FOOTING', ({ fromX, fromY, toX, toY }) => {
      if (this.board) {
        const fx = this.board.offsetX + (fromX + 0.5) * this.board.cellSize;
        const fy = this.board.offsetY + (fromY + 0.5) * this.board.cellSize;
        const tx = this.board.offsetX + (toX + 0.5) * this.board.cellSize;
        const ty = this.board.offsetY + (toY + 0.5) * this.board.cellSize;
        this.board.particles.createRewindTrail(fx, fy, tx, ty);
      }
    });

    window.addEventListener('resize', () => {
      if (this.board) {
        this.board.resize();
      }
    });
  }

  setupInputHandlers() {
    window.addEventListener('keydown', (e) => {
      // Ignore inputs if paused or on non-gameplay screens
      if (gameState.currentScreen !== SCREENS.GAMEPLAY) return;

      const key = e.key.toLowerCase();

      if (e.key === 'Escape' || key === 'p') {
        if (gameState.isPaused) gameState.resume();
        else gameState.pause();
        return;
      }

      if (gameState.isPaused || gameState.isLevelCompleted) return;

      // Quick restart
      if (key === 'r') {
        this.restartCurrentLevel();
        return;
      }

      // Quick hint toggle
      if (key === 'h') {
        if (this.currentView instanceof GameplayScreen) {
          const btn = document.querySelector('#hud-hint-btn');
          if (btn) btn.click();
        }
        return;
      }

      // Light rotation hotkeys
      if (key === 'q') {
        this.rotateLightCounterClockwise();
        return;
      }
      if (key === 'e') {
        this.rotateLightClockwise();
        return;
      }
      if (key === '1') {
        this.setLightDirection(LIGHT_DIRECTIONS.LEFT);
        return;
      }
      if (key === '2') {
        this.setLightDirection(LIGHT_DIRECTIONS.RIGHT);
        return;
      }
      if (key === '3') {
        this.setLightDirection(LIGHT_DIRECTIONS.UP);
        return;
      }
      if (key === '4') {
        this.setLightDirection(LIGHT_DIRECTIONS.DOWN);
        return;
      }

      // Player Movement: Arrow keys or WASD
      let dx = 0;
      let dy = 0;

      if (key === 'arrowup' || key === 'w') dy = -1;
      else if (key === 'arrowdown' || key === 's') dy = 1;
      else if (key === 'arrowleft' || key === 'a') dx = -1;
      else if (key === 'arrowright' || key === 'd') dx = 1;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        this.movePlayer(dx, dy);
      }
    });
  }

  switchScreen(screenName) {
    if (this.currentView) {
      this.currentView.unmount();
      this.currentView = null;
    }
    if (this.pauseView) {
      this.pauseView.unmount();
      this.pauseView = null;
    }
    if (this.resultView) {
      this.resultView.unmount();
      this.resultView = null;
    }

    switch (screenName) {
      case SCREENS.SPLASH:
        this.currentView = new SplashScreen(this.appElement);
        break;
      case SCREENS.HOME:
        this.currentView = new HomeScreen(this.appElement);
        break;
      case SCREENS.LEVEL_SELECT:
        this.currentView = new LevelSelect(this.appElement);
        break;
      case SCREENS.GAMEPLAY:
        this.currentView = new GameplayScreen(this.appElement, this);
        break;
      case SCREENS.COLLECTION:
        this.currentView = new CollectionScreen(this.appElement);
        break;
      case SCREENS.SETTINGS:
        this.currentView = new SettingsScreen(this.appElement);
        break;
      default:
        this.currentView = new HomeScreen(this.appElement);
        break;
    }

    if (this.currentView) {
      this.currentView.mount();
    }
  }

  loadLevel(levelData) {
    // Clone level data so collectible state isn't permanently mutated
    const cloned = JSON.parse(JSON.stringify(levelData));
    gameState.activeLevelData = cloned;

    // Reset player position
    this.player.reset(cloned.start.x, cloned.start.y);

    // Initialize systems
    this.lightSystem = new LightSystem(cloned.lightDirection || LIGHT_DIRECTIONS.LEFT);
    this.shadowSystem = new ShadowSystem(cloned);
    this.collision = new CollisionSystem(cloned, this.shadowSystem);

    // Initial shadow calculation
    this.shadowSystem.calculateShadows(this.lightSystem.currentDirection);

    // Attach canvas to BoardRenderer
    setTimeout(() => {
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        this.board = new BoardRenderer(canvas);
        this.board.setContext(cloned, this.lightSystem, this.shadowSystem, this.player);
      }
      if (this.currentView instanceof GameplayScreen) {
        this.currentView.updateActiveLightIndicator(this.lightSystem.currentDirection);
      }
    }, 50);
  }

  restartCurrentLevel() {
    if (gameState.activeLevelData) {
      gameState.startLevel(gameState.activeLevelData, gameState.gameMode);
    }
  }

  movePlayer(dx, dy) {
    if (this.player.isMoving || gameState.isPaused || gameState.isLevelCompleted) return;

    const targetX = this.player.gridX + dx;
    const targetY = this.player.gridY + dy;

    if (!this.collision.isWalkable(targetX, targetY)) {
      // Cannot move to impassable or abyss cell
      return;
    }

    const isSolid = this.collision.isSolidGround(targetX, targetY);
    this.player.moveTo(targetX, targetY, isSolid);
    gameState.incrementMoves();

    // Check fragile shadow stepping
    if (this.shadowSystem.isShadowAt(targetX, targetY)) {
      const shadow = this.shadowSystem.getShadowAt(targetX, targetY);
      if (shadow && shadow.isFragile) {
        shadow.steppedCount = (shadow.steppedCount || 0) + 1;
      }
    }

    // Check collectible pickup
    const level = gameState.activeLevelData;
    const collectible = this.collision.checkCollectible(targetX, targetY, level.collectibles);
    if (collectible) {
      collectible.collected = true;
      audio.playCollect();
      if (this.board) {
        const cx = this.board.offsetX + (targetX + 0.5) * this.board.cellSize;
        const cy = this.board.offsetY + (targetY + 0.5) * this.board.cellSize;
        this.board.particles.createCollectBurst(cx, cy);
      }
    }

    // Check switches
    const sw = this.collision.checkSwitch(targetX, targetY, level.switches);
    if (sw && !sw.active) {
      sw.active = true;
      audio.playSwitch();
      if (sw.targetDir) {
        this.setLightDirection(sw.targetDir);
      }
    }

    // Check Exit Portal
    if (this.collision.checkExit(targetX, targetY)) {
      this.player.celebrate();
      audio.playDoorOpen();

      // Determine star rating:
      // Star 1: Completed
      // Star 2: All collectibles gathered
      // Star 3: Within target moves
      let stars = 1;
      const allCollected = !level.collectibles || level.collectibles.every(c => c.collected);
      if (allCollected) stars++;
      if (gameState.moves <= (level.targetMoves || 10)) stars++;

      setTimeout(() => {
        gameState.completeLevel(stars);
      }, 350);
    }
  }

  setLightDirection(direction) {
    if (gameState.isPaused || gameState.isLevelCompleted) return;
    if (this.lightSystem.currentDirection === direction) return;

    this.lightSystem.setDirection(direction);
    this.shadowSystem.calculateShadows(direction);
    audio.playShadowAppear();

    // Check if Lumi lost footing because of shadow disappearance
    this.player.handleShadowLoss(this.collision);

    if (this.currentView instanceof GameplayScreen) {
      this.currentView.updateActiveLightIndicator(direction);
    }
  }

  rotateLightClockwise() {
    const order = [LIGHT_DIRECTIONS.UP, LIGHT_DIRECTIONS.RIGHT, LIGHT_DIRECTIONS.DOWN, LIGHT_DIRECTIONS.LEFT];
    const currentIndex = order.indexOf(this.lightSystem.currentDirection);
    const nextIndex = (currentIndex + 1) % order.length;
    this.setLightDirection(order[nextIndex]);
  }

  rotateLightCounterClockwise() {
    const order = [LIGHT_DIRECTIONS.UP, LIGHT_DIRECTIONS.RIGHT, LIGHT_DIRECTIONS.DOWN, LIGHT_DIRECTIONS.LEFT];
    const currentIndex = order.indexOf(this.lightSystem.currentDirection);
    const prevIndex = (currentIndex - 1 + order.length) % order.length;
    this.setLightDirection(order[prevIndex]);
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) * 0.001);
    this.lastTime = currentTime;

    if (gameState.currentScreen === SCREENS.GAMEPLAY && !gameState.isPaused) {
      if (this.player && this.lightSystem && this.board) {
        this.player.update(dt, this.lightSystem.currentDirection);
        this.lightSystem.update(dt);
        this.board.update(dt);
        this.board.render();
      }
    }

    if (this.isRunning) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }
}
