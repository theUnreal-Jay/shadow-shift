/**
 * Collision & Walkability System for SHADOW SHIFT
 */

export class CollisionSystem {
  constructor(board, shadowSystem) {
    this.board = board;
    this.shadowSystem = shadowSystem;
  }

  setSystems(board, shadowSystem) {
    this.board = board;
    this.shadowSystem = shadowSystem;
  }

  /**
   * Checks if cell (x, y) is walkable for Lumi.
   * A cell is walkable if:
   * - It is within bounds
   * - It is not an impassable solid obstacle (pillar, prism, wall)
   * - It has a floor beneath it: Solid platform OR active shadow platform OR start/exit tile.
   */
  isWalkable(x, y) {
    const { width, height, objects, solidPlatforms, start, exit } = this.board;

    // Boundary check
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    // Impassable solid objects (pillars, blocks, prisms) cannot be walked through
    if (objects && objects.some(o => o.x === x && o.y === y && !o.walkable)) {
      return false;
    }

    // Start and Exit are always walkable
    if (start && start.x === x && start.y === y) return true;
    if (exit && exit.x === x && exit.y === y) return true;

    // Solid platforms are always walkable
    if (solidPlatforms && solidPlatforms.some(p => p.x === x && p.y === y)) {
      return true;
    }

    // Active shadow platforms are walkable
    if (this.shadowSystem && this.shadowSystem.isShadowAt(x, y)) {
      const shadow = this.shadowSystem.getShadowAt(x, y);
      // If fragile shadow has reached max steps, it is broken
      if (shadow && shadow.isFragile && shadow.steppedCount >= shadow.fragileSteps) {
        return false;
      }
      return true;
    }

    // Empty abyss / chasm
    return false;
  }

  isSolidGround(x, y) {
    const { solidPlatforms, start, exit } = this.board;
    if (start && start.x === x && start.y === y) return true;
    if (exit && exit.x === x && exit.y === y) return true;
    if (solidPlatforms && solidPlatforms.some(p => p.x === x && p.y === y)) return true;
    return false;
  }

  checkCollectible(x, y, collectibles) {
    if (!collectibles) return null;
    return collectibles.find(c => c.x === x && c.y === y && !c.collected);
  }

  checkSwitch(x, y, switches) {
    if (!switches) return null;
    return switches.find(s => s.x === x && s.y === y);
  }

  checkExit(x, y) {
    const { exit } = this.board;
    return exit && exit.x === x && exit.y === y;
  }

  checkHazard(x, y, hazards) {
    if (!hazards) return false;
    return hazards.some(h => h.x === x && h.y === y);
  }
}
