/**
 * GameState - Central State Management for SHADOW SHIFT
 */
import { events } from './eventManager.js';
import { storage } from './storage.js';

export const SCREENS = {
  SPLASH: 'SPLASH',
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAMEPLAY: 'GAMEPLAY',
  PAUSE: 'PAUSE',
  VICTORY: 'VICTORY',
  COLLECTION: 'COLLECTION',
  SETTINGS: 'SETTINGS',
  DAILY: 'DAILY'
};

export const GAME_MODES = {
  CAMPAIGN: 'CAMPAIGN',
  PROCEDURAL: 'PROCEDURAL',
  DAILY: 'DAILY'
};

export class GameStateManager {
  constructor() {
    this.currentScreen = SCREENS.SPLASH;
    this.previousScreen = null;
    this.gameMode = GAME_MODES.CAMPAIGN;

    this.isPaused = false;
    this.activeLevelData = null;
    this.activeLevelId = 1;
    this.moves = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    this.isLevelCompleted = false;

    // Undo history stack for moves & light changes
    this.historyStack = [];
  }

  setScreen(screen) {
    if (this.currentScreen === screen) return;
    this.previousScreen = this.currentScreen;
    this.currentScreen = screen;
    events.emit('SCREEN_CHANGED', { from: this.previousScreen, to: this.currentScreen });
  }

  startLevel(levelData, mode = GAME_MODES.CAMPAIGN) {
    this.gameMode = mode;
    this.activeLevelData = levelData;
    this.activeLevelId = levelData.id;
    this.moves = 0;
    this.elapsedTime = 0;
    this.isPaused = false;
    this.isLevelCompleted = false;
    this.historyStack = [];

    this.startTimer();
    this.setScreen(SCREENS.GAMEPLAY);
    events.emit('LEVEL_STARTED', { level: levelData, mode });
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && this.currentScreen === SCREENS.GAMEPLAY && !this.isLevelCompleted) {
        this.elapsedTime += 0.1;
        events.emit('TIMER_TICK', { time: this.elapsedTime });
      }
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  incrementMoves() {
    this.moves++;
    storage.data.stats.totalMoves++;
    storage.save();
    events.emit('MOVES_CHANGED', { moves: this.moves });
  }

  pause() {
    if (this.currentScreen !== SCREENS.GAMEPLAY) return;
    this.isPaused = true;
    events.emit('GAME_PAUSED');
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    events.emit('GAME_RESUMED');
  }

  completeLevel(stars = 3) {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;
    this.stopTimer();

    // Reward coins based on stars
    const coinsEarned = stars * 15;
    storage.addCoins(coinsEarned);

    if (this.gameMode === GAME_MODES.CAMPAIGN) {
      storage.saveLevelResult(this.activeLevelId, stars, this.moves, this.elapsedTime);
    } else if (this.gameMode === GAME_MODES.DAILY) {
      storage.data.dailyCompletedToday = true;
      storage.data.dailyStreak = (storage.data.dailyStreak || 0) + 1;
      storage.data.lastDailyDate = new Date().toISOString().slice(0, 10);
      storage.save();
    }

    events.emit('LEVEL_COMPLETED', {
      levelId: this.activeLevelId,
      stars,
      moves: this.moves,
      time: this.elapsedTime,
      coinsEarned,
      mode: this.gameMode
    });
  }
}

export const gameState = new GameStateManager();
