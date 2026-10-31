/**
 * LightSystem - Controls primary and secondary light sources and visual angles
 */
import { events } from '../core/eventManager.js';
import { audio } from '../core/audio.js';
import { LIGHT_DIRECTIONS } from './shadowSystem.js';

export const DIRECTION_ANGLES = {
  [LIGHT_DIRECTIONS.LEFT]: 0,    // Projector on left, shining right (0 deg)
  [LIGHT_DIRECTIONS.DOWN]: 90,   // Projector on top, shining down (90 deg)
  [LIGHT_DIRECTIONS.RIGHT]: 180, // Projector on right, shining left (180 deg)
  [LIGHT_DIRECTIONS.UP]: 270     // Projector on bottom, shining up (270 deg)
};

export class LightSystem {
  constructor(initialDirection = LIGHT_DIRECTIONS.LEFT) {
    this.currentDirection = initialDirection;
    this.targetAngle = DIRECTION_ANGLES[initialDirection] || 0;
    this.currentAngle = this.targetAngle;

    // Moving light features (Chapter 3)
    this.isMovingLight = false;
    this.moveInterval = 0; // if > 0, auto-swivels every N seconds or moves
    this.moveTimer = 0;

    // Dual light sources (Chapter 5)
    this.hasSecondaryLight = false;
    this.secondaryDirection = null;
    this.secondaryTargetAngle = 0;
    this.secondaryCurrentAngle = 0;
  }

  setDirection(direction, silent = false) {
    if (!Object.values(LIGHT_DIRECTIONS).includes(direction)) return;
    if (this.currentDirection === direction) return;

    this.currentDirection = direction;
    this.targetAngle = DIRECTION_ANGLES[direction];

    if (!silent) {
      audio.playLightRotate();
    }

    events.emit('LIGHT_CHANGED', {
      direction: this.currentDirection,
      secondaryDirection: this.secondaryDirection
    });
  }

  rotateClockwise() {
    const order = [LIGHT_DIRECTIONS.UP, LIGHT_DIRECTIONS.RIGHT, LIGHT_DIRECTIONS.DOWN, LIGHT_DIRECTIONS.LEFT];
    const currentIndex = order.indexOf(this.currentDirection);
    const nextIndex = (currentIndex + 1) % order.length;
    this.setDirection(order[nextIndex]);
  }

  rotateCounterClockwise() {
    const order = [LIGHT_DIRECTIONS.UP, LIGHT_DIRECTIONS.RIGHT, LIGHT_DIRECTIONS.DOWN, LIGHT_DIRECTIONS.LEFT];
    const currentIndex = order.indexOf(this.currentDirection);
    const prevIndex = (currentIndex - 1 + order.length) % order.length;
    this.setDirection(order[prevIndex]);
  }

  setSecondaryDirection(direction) {
    this.hasSecondaryLight = !!direction;
    this.secondaryDirection = direction;
    if (direction) {
      this.secondaryTargetAngle = DIRECTION_ANGLES[direction] || 0;
    }
    events.emit('LIGHT_CHANGED', {
      direction: this.currentDirection,
      secondaryDirection: this.secondaryDirection
    });
  }

  update(dt) {
    // Smooth angle interpolation with shortest angular distance
    this.currentAngle = this.lerpAngle(this.currentAngle, this.targetAngle, dt * 12);
    if (this.hasSecondaryLight) {
      this.secondaryCurrentAngle = this.lerpAngle(this.secondaryCurrentAngle, this.secondaryTargetAngle, dt * 12);
    }

    // Auto moving light handler
    if (this.isMovingLight && this.moveInterval > 0) {
      this.moveTimer += dt;
      if (this.moveTimer >= this.moveInterval) {
        this.moveTimer = 0;
        this.rotateClockwise();
      }
    }
  }

  lerpAngle(current, target, speed) {
    let diff = (target - current) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return current + diff * Math.min(1.0, speed);
  }
}
