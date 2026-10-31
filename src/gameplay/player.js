/**
 * Player (LUMI) Character Controller & Animation State
 */
import { events } from '../core/eventManager.js';
import { audio } from '../core/audio.js';
import { storage } from '../core/storage.js';

export const PLAYER_STATES = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  JUMPING: 'JUMPING',
  FALLING: 'FALLING',
  CONFUSED: 'CONFUSED',
  CELEBRATING: 'CELEBRATING'
};

export class Player {
  constructor(startX = 0, startY = 0) {
    this.gridX = startX;
    this.gridY = startY;

    // Visual rendering position (interpolates towards gridX, gridY)
    this.renderX = startX;
    this.renderY = startY;

    // Last confirmed solid platform for safe recovery
    this.lastSafeX = startX;
    this.lastSafeY = startY;

    // Movement animation
    this.isMoving = false;
    this.moveProgress = 1.0;
    this.moveDuration = 0.16; // 160ms smooth step
    this.fromX = startX;
    this.fromY = startY;

    // Facing direction: 1 for right, -1 for left
    this.facing = 1;

    // Animation & Emotion State
    this.state = PLAYER_STATES.IDLE;
    this.stateTimer = 0;
    this.idleTime = 0;
    this.blinkTimer = 2.0 + Math.random() * 2.0;
    this.isBlinking = false;

    // Squash & Stretch factors
    this.scaleX = 1.0;
    this.scaleY = 1.0;

    // Eye gaze direction (looks toward the light)
    this.lookX = 0;
    this.lookY = 0;
  }

  reset(startX, startY) {
    this.gridX = startX;
    this.gridY = startY;
    this.renderX = startX;
    this.renderY = startY;
    this.lastSafeX = startX;
    this.lastSafeY = startY;
    this.isMoving = false;
    this.moveProgress = 1.0;
    this.facing = 1;
    this.state = PLAYER_STATES.IDLE;
    this.stateTimer = 0;
    this.idleTime = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
  }

  moveTo(targetX, targetY, isSolidGround = false) {
    if (this.isMoving) return;

    this.fromX = this.gridX;
    this.fromY = this.gridY;
    this.gridX = targetX;
    this.gridY = targetY;

    // Set facing direction
    if (targetX > this.fromX) this.facing = 1;
    else if (targetX < this.fromX) this.facing = -1;

    this.isMoving = true;
    this.moveProgress = 0.0;
    this.state = PLAYER_STATES.WALKING;

    // Soft jump squash & stretch anticipation
    this.scaleX = 0.85;
    this.scaleY = 1.15;

    if (isSolidGround) {
      this.lastSafeX = targetX;
      this.lastSafeY = targetY;
    }

    audio.playStep();
    if (navigator.vibrate && storage.get('settings')?.vibration) {
      try { navigator.vibrate(15); } catch (e) {}
    }
    events.emit('PLAYER_STEP', { x: targetX, y: targetY });
  }

  /**
   * Called when a shadow disappears underneath Lumi.
   * Gracefully plays confusion animation and safely rewinds to last safe solid ground.
   */
  handleShadowLoss(collisionSystem) {
    // If current position is still solid ground, we're safe
    if (collisionSystem.isSolidGround(this.gridX, this.gridY)) {
      this.lastSafeX = this.gridX;
      this.lastSafeY = this.gridY;
      return;
    }

    // If still on another active shadow, we're fine
    if (collisionSystem.shadowSystem.isShadowAt(this.gridX, this.gridY)) {
      return;
    }

    // Shadow disappeared underneath Lumi!
    this.state = PLAYER_STATES.CONFUSED;
    this.stateTimer = 0.45;
    audio.playRewind();

    if (navigator.vibrate && storage.get('settings')?.vibration) {
      try { navigator.vibrate([25, 30, 25]); } catch (e) {}
    }

    events.emit('PLAYER_LOST_FOOTING', {
      fromX: this.gridX,
      fromY: this.gridY,
      toX: this.lastSafeX,
      toY: this.lastSafeY
    });

    // Smoothly rewind to last stable solid platform
    setTimeout(() => {
      this.gridX = this.lastSafeX;
      this.gridY = this.lastSafeY;
      this.fromX = this.renderX;
      this.fromY = this.renderY;
      this.moveProgress = 0.0;
      this.isMoving = true;
      this.state = PLAYER_STATES.IDLE;
    }, 280);
  }

  update(dt, lightDirection) {
    this.idleTime += dt;

    // Update looking direction based on light
    if (lightDirection === 'left') {
      this.lookX = -1; this.lookY = 0;
    } else if (lightDirection === 'right') {
      this.lookX = 1; this.lookY = 0;
    } else if (lightDirection === 'up') {
      this.lookX = 0; this.lookY = -1;
    } else if (lightDirection === 'down') {
      this.lookX = 0; this.lookY = 1;
    }

    // Blink timer
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -0.15) {
        this.isBlinking = false;
        this.blinkTimer = 2.5 + Math.random() * 3.0;
      }
    }

    // Interpolate movement position
    if (this.isMoving) {
      this.moveProgress += dt / this.moveDuration;
      if (this.moveProgress >= 1.0) {
        this.moveProgress = 1.0;
        this.isMoving = false;
        this.renderX = this.gridX;
        this.renderY = this.gridY;
        if (this.state === PLAYER_STATES.WALKING) {
          this.state = PLAYER_STATES.IDLE;
          // Landing squash
          this.scaleX = 1.2;
          this.scaleY = 0.82;
        }
      } else {
        // Smooth easeInOutQuad interpolation
        const t = this.moveProgress;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        this.renderX = this.fromX + (this.gridX - this.fromX) * ease;
        this.renderY = this.fromY + (this.gridY - this.fromY) * ease;
      }
    } else {
      this.renderX = this.gridX;
      this.renderY = this.gridY;
    }

    // Return scale back towards 1.0 (spring easing)
    this.scaleX += (1.0 - this.scaleX) * Math.min(1.0, dt * 14);
    this.scaleY += (1.0 - this.scaleY) * Math.min(1.0, dt * 14);

    // Idle breathing animation
    if (this.state === PLAYER_STATES.IDLE && !this.isMoving) {
      const breath = Math.sin(this.idleTime * 3.5) * 0.04;
      this.scaleX = 1.0 - breath;
      this.scaleY = 1.0 + breath;
    }
  }

  celebrate() {
    this.state = PLAYER_STATES.CELEBRATING;
    this.scaleX = 1.25;
    this.scaleY = 1.35;
  }
}
