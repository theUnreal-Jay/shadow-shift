/**
 * Audio Engine for SHADOW SHIFT
 * 100% synthesized procedural sound effects and generative ambient music using Web Audio API.
 * Zero external audio files required.
 */
import { storage } from './storage.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.droneOsc = null;
    this.droneGain = null;

    // Load initial volumes from settings
    const settings = storage.get('settings') || {};
    this.sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8;
    this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;

    // Pentatonic scale frequencies for mystical ambient chimes (E minor pentatonic: E3, G3, A3, B3, D4, E4, G4, A4, B4, D5)
    this.ambientNotes = [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---

  playLightRotate() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant mechanical optical swivel + frequency swoop
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);

    // Add subtle click trigger
    this.playClick(0.15, 800);
  }

  playShadowAppear() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Warm deep harmonic swell for shadow materialization
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130.81, now); // C3
    osc.frequency.exponentialRampToValueAtTime(196.00, now + 0.25); // G3

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, now); // C2

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.36);
    subOsc.stop(now + 0.36);
  }

  playShadowDisappear() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  playStep() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Gentle micro-step sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitch = 220 + (Math.random() * 40 - 20);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playJump() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playLand() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  playCollect() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sparkly double chime
    const freqs = [587.33, 880.00, 1174.66]; // D5, A5, D6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.05 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.36);
    });
  }

  playSwitch() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playDoorOpen() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [329.63, 415.30, 493.88, 659.25]; // E major chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.52);
    });
  }

  playLevelComplete() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Joyful melodic flourish
    const melody = [
      { note: 392.00, time: 0.00, dur: 0.15 }, // G4
      { note: 493.88, time: 0.12, dur: 0.15 }, // B4
      { note: 587.33, time: 0.24, dur: 0.18 }, // D5
      { note: 783.99, time: 0.38, dur: 0.45 }  // G5
    ];

    melody.forEach(({ note, time, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.3, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  }

  playRewind() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Gentle soft reverse whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(420, now + 0.18);
    osc.frequency.linearRampToValueAtTime(200, now + 0.28);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playClick(vol = 0.15, freq = 600) {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.03);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // --- Generative Ambient Background Music ---

  startAmbientMusic() {
    this.ensureContext();
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // 1. Subtle warm continuous sub-drone (E2: ~82.4Hz)
    this.startDrone();

    // 2. Schedule gentle ambient pentatonic chimes
    this.scheduleNextAmbientChime();
  }

  stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.stopDrone();
  }

  startDrone() {
    if (!this.ctx || this.droneOsc) return;
    const now = this.ctx.currentTime;

    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();

    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(82.41, now); // E2

    // Very quiet soothing sub drone
    this.droneGain.gain.setValueAtTime(0.001, now);
    this.droneGain.gain.linearRampToValueAtTime(0.08, now + 2.0);

    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.musicGain);

    this.droneOsc.start(now);
  }

  stopDrone() {
    if (this.droneOsc && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.droneGain.gain.linearRampToValueAtTime(0.001, now + 1.0);
        setTimeout(() => {
          if (this.droneOsc) {
            this.droneOsc.stop();
            this.droneOsc.disconnect();
            this.droneOsc = null;
            this.droneGain = null;
          }
        }, 1100);
      } catch (e) {
        this.droneOsc = null;
      }
    }
  }

  scheduleNextAmbientChime() {
    if (!this.isMusicPlaying) return;

    // Play a gentle ambient note or interval
    this.playAmbientChime();

    // Schedule next chime between 2.5 and 5.5 seconds
    const delay = 2500 + Math.random() * 3000;
    this.musicTimer = setTimeout(() => {
      this.scheduleNextAmbientChime();
    }, delay);
  }

  playAmbientChime() {
    if (!this.ctx || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;

    // Pick 1 or 2 harmonious notes
    const noteIdx = Math.floor(Math.random() * this.ambientNotes.length);
    const freq = this.ambientNotes[noteIdx];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    // Slow organic attack and long reverberant decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 3.3);
  }
}

export const audio = new AudioManager();
