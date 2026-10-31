/**
 * Storage System for SHADOW SHIFT
 * Handles persistent data with schema versioning, validation, error recovery and backups.
 */

const STORAGE_KEY = 'SHADOW_SHIFT_SAVE_V1';
const BACKUP_KEY = 'SHADOW_SHIFT_BACKUP_V1';

const DEFAULT_SAVE = {
  version: 1,
  lastSaved: Date.now(),
  coins: 50,
  currentLevel: 1,
  unlockedLevels: [1],
  completedLevels: {}, // levelId: { stars: 1-3, bestMoves: 10, bestTime: 12.4 }
  unlockedSkins: ['classic'],
  activeSkin: 'classic',
  unlockedLanterns: ['brass'],
  activeLantern: 'brass',
  unlockedThemes: ['theater'],
  activeTheme: 'theater',
  achievements: {}, // id: { unlockedAt: timestamp }
  dailyStreak: 0,
  lastDailyDate: null,
  dailyCompletedToday: false,
  settings: {
    sfxVolume: 0.8,
    musicVolume: 0.5,
    animationIntensity: 1.0,
    reducedMotion: false,
    vibration: true
  },
  stats: {
    totalMoves: 0,
    totalLightRotations: 0,
    levelsFinished: 0,
    starsCollected: 0,
    playTimeSeconds: 0
  }
};

export class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.createFreshSave();
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.version) {
        console.warn('Corrupted save data detected. Attempting recovery from backup...');
        return this.recoverFromBackup();
      }

      // Merge deep with default save to ensure new schema fields exist
      const merged = this.deepMerge(DEFAULT_SAVE, parsed);
      this.backup(merged);
      return merged;
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return this.recoverFromBackup();
    }
  }

  save() {
    try {
      this.data.lastSaved = Date.now();
      const str = JSON.stringify(this.data);
      localStorage.setItem(STORAGE_KEY, str);
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  backup(data) {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
    } catch (e) {
      // Ignore backup error
    }
  }

  recoverFromBackup() {
    try {
      const rawBackup = localStorage.getItem(BACKUP_KEY);
      if (rawBackup) {
        const parsed = JSON.parse(rawBackup);
        if (parsed && parsed.version) {
          console.info('Restored save data from backup successfully.');
          return this.deepMerge(DEFAULT_SAVE, parsed);
        }
      }
    } catch (e) {
      console.error('Failed to recover from backup:', e);
    }
    return this.createFreshSave();
  }

  createFreshSave() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    this.data = fresh;
    this.save();
    this.backup(fresh);
    return fresh;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    this.data = this.createFreshSave();
    return this.data;
  }

  deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // --- Convenience Getters & Setters ---

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  getLevelRecord(levelId) {
    return this.data.completedLevels[levelId] || null;
  }

  saveLevelResult(levelId, stars, moves, time) {
    const existing = this.data.completedLevels[levelId] || { stars: 0, bestMoves: Infinity, bestTime: Infinity };
    const newStars = Math.max(existing.stars || 0, stars);
    const bestMoves = Math.min(existing.bestMoves || Infinity, moves);
    const bestTime = Math.min(existing.bestTime || Infinity, time);

    this.data.completedLevels[levelId] = {
      stars: newStars,
      bestMoves,
      bestTime,
      completedAt: Date.now()
    };

    // Unlock next level if not already unlocked
    const nextLevel = Number(levelId) + 1;
    if (!this.data.unlockedLevels.includes(nextLevel)) {
      this.data.unlockedLevels.push(nextLevel);
    }

    // Update aggregate stats
    this.data.stats.levelsFinished = Object.keys(this.data.completedLevels).length;
    let totalStars = 0;
    for (const id in this.data.completedLevels) {
      totalStars += this.data.completedLevels[id].stars;
    }
    this.data.stats.starsCollected = totalStars;

    this.save();
  }

  unlockSkin(skinId) {
    if (!this.data.unlockedSkins.includes(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
    }
  }

  unlockAchievement(achievementId) {
    if (!this.data.achievements[achievementId]) {
      this.data.achievements[achievementId] = { unlockedAt: Date.now() };
      this.save();
      return true;
    }
    return false;
  }

  addCoins(amount) {
    this.data.coins = Math.max(0, (this.data.coins || 0) + amount);
    this.save();
    return this.data.coins;
  }
}

export const storage = new StorageManager();
