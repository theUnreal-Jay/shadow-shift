/**
 * ShadowSystem - Deterministic Grid Shadow Platform Generator
 * Calculates shadow platforms cast by solid objects based on light direction(s).
 */

export const LIGHT_DIRECTIONS = {
  LEFT: 'left',   // Light shines rightward, casting shadows to the RIGHT (+x)
  RIGHT: 'right', // Light shines leftward, casting shadows to the LEFT (-x)
  UP: 'up',       // Light shines downward, casting shadows DOWN (+y)
  DOWN: 'down'    // Light shines upward, casting shadows UP (-y)
};

export const DIRECTION_VECTORS = {
  left: { dx: 1, dy: 0, angle: 0 },       // Shadow cast to Right
  right: { dx: -1, dy: 0, angle: 180 },   // Shadow cast to Left
  up: { dx: 0, dy: 1, angle: 90 },        // Shadow cast Down
  down: { dx: 0, dy: -1, angle: 270 }     // Shadow cast Up
};

export class ShadowSystem {
  constructor(board) {
    this.board = board;
    this.activeShadows = new Map(); // key "x,y" => ShadowCell
    this.previousShadows = new Map();
    this.transitionProgress = 1.0;
  }

  /**
   * Recalculates all shadow platforms on the board.
   * @param {string} lightDirection - 'left' | 'right' | 'up' | 'down'
   * @param {Object} options - optional secondary light, switches, etc.
   * @returns {Map<string, Object>} Map of active shadow cells
   */
  calculateShadows(lightDirection, options = {}) {
    this.previousShadows = new Map(this.activeShadows);
    this.activeShadows.clear();
    this.transitionProgress = 0.0;

    const directions = [lightDirection];
    if (options.secondaryLightDirection) {
      directions.push(options.secondaryLightDirection);
    }

    const { width, height, objects, solidPlatforms, darkZones = [] } = this.board;

    // Helper: is a cell inside a dark zone where light is blocked?
    const isInDarkZone = (x, y) => {
      return darkZones.some(zone =>
        x >= zone.x && x < zone.x + zone.w &&
        y >= zone.y && y < zone.y + zone.h
      );
    };

    // Helper: is a cell occupied by a solid object or solid platform?
    const isSolid = (x, y) => {
      if (solidPlatforms && solidPlatforms.some(p => p.x === x && p.y === y)) return true;
      if (objects && objects.some(o => o.x === x && o.y === y)) return true;
      return false;
    };

    directions.forEach(dir => {
      const vec = DIRECTION_VECTORS[dir];
      if (!vec) return;

      // Every object casts a shadow
      objects.forEach(obj => {
        // If object is in a dark zone, light cannot hit it to cast a shadow
        if (isInDarkZone(obj.x, obj.y)) return;

        // Determine shadow vector (rotating prisms can deflect shadow)
        let dx = vec.dx;
        let dy = vec.dy;

        if (obj.type === 'prism') {
          // Prism rotates shadow 90 degrees clockwise or based on prism angle
          const prismRot = obj.rotation || 90;
          if (prismRot === 90) {
            const temp = dx;
            dx = -dy;
            dy = temp;
          } else if (prismRot === 180) {
            dx = -dx;
            dy = -dy;
          } else if (prismRot === 270) {
            const temp = dx;
            dx = dy;
            dy = -temp;
          }
        }

        const maxLen = obj.shadowLength !== undefined ? obj.shadowLength : 3;

        for (let step = 1; step <= maxLen; step++) {
          const nx = obj.x + dx * step;
          const ny = obj.y + dy * step;

          // Boundary check
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;

          // Solid obstacles stop the shadow
          if (isSolid(nx, ny)) break;

          // Dark zone absorption check
          if (isInDarkZone(nx, ny)) break;

          const key = `${nx},${ny}`;
          const existing = this.activeShadows.get(key);

          this.activeShadows.set(key, {
            x: nx,
            y: ny,
            sourceX: obj.x,
            sourceY: obj.y,
            sourceType: obj.type || 'pillar',
            direction: dir,
            step,
            maxLen,
            isFragile: !!obj.isFragile,
            fragileSteps: obj.fragileSteps !== undefined ? obj.fragileSteps : 2,
            steppedCount: existing ? existing.steppedCount : 0,
            intensity: Math.max(0.4, 1.0 - (step - 1) * 0.15)
          });
        }
      });
    });

    return this.activeShadows;
  }

  isShadowAt(x, y) {
    return this.activeShadows.has(`${x},${y}`);
  }

  getShadowAt(x, y) {
    return this.activeShadows.get(`${x},${y}`) || null;
  }

  updateTransition(dt) {
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + dt * 4.5);
    }
  }
}
