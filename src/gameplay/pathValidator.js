/**
 * PathValidator - BFS Reachability & Solvability Validator
 * Explores state space (playerX, playerY, lightDir) to guarantee any level is 100% solvable.
 */
import { LIGHT_DIRECTIONS } from './shadowSystem.js';

export class PathValidator {
  /**
   * Validates if a level configuration is solvable.
   * @param {Object} levelData - Board configuration
   * @returns {Object} { isSolvable: boolean, minSteps: number, solutionPath: Array }
   */
  static validate(levelData) {
    const { width, height, start, exit, objects = [], solidPlatforms = [], darkZones = [] } = levelData;
    if (!start || !exit) return { isSolvable: false, minSteps: 0, solutionPath: [] };

    const directions = [LIGHT_DIRECTIONS.LEFT, LIGHT_DIRECTIONS.RIGHT, LIGHT_DIRECTIONS.UP, LIGHT_DIRECTIONS.DOWN];
    const dirVectors = {
      left: { dx: 1, dy: 0 },
      right: { dx: -1, dy: 0 },
      up: { dx: 0, dy: 1 },
      down: { dx: 0, dy: -1 }
    };

    // Precalculate shadow maps for each light direction
    const shadowMapByDir = {};
    directions.forEach(dir => {
      const vec = dirVectors[dir];
      const shadows = new Set();

      objects.forEach(obj => {
        // Dark zone check
        const inDark = darkZones.some(z =>
          obj.x >= z.x && obj.x < z.x + z.w &&
          obj.y >= z.y && obj.y < z.y + z.h
        );
        if (inDark) return;

        let dx = vec.dx;
        let dy = vec.dy;
        if (obj.type === 'prism') {
          const prismRot = obj.rotation || 90;
          if (prismRot === 90) { const t = dx; dx = -dy; dy = t; }
          else if (prismRot === 180) { dx = -dx; dy = -dy; }
          else if (prismRot === 270) { const t = dx; dx = dy; dy = -t; }
        }

        const maxLen = obj.shadowLength !== undefined ? obj.shadowLength : 3;
        for (let step = 1; step <= maxLen; step++) {
          const nx = obj.x + dx * step;
          const ny = obj.y + dy * step;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;
          // Solid obstacle blocks shadow
          if (solidPlatforms.some(p => p.x === nx && p.y === ny) || objects.some(o => o.x === nx && o.y === ny)) break;
          // Dark zone absorbs shadow
          if (darkZones.some(z => nx >= z.x && nx < z.x + z.w && ny >= z.y && ny < z.y + z.h)) break;

          shadows.add(`${nx},${ny}`);
        }
      });

      shadowMapByDir[dir] = shadows;
    });

    const isSolid = (x, y) => {
      if (start.x === x && start.y === y) return true;
      if (exit.x === x && exit.y === y) return true;
      return solidPlatforms.some(p => p.x === x && p.y === y);
    };

    const isWalkable = (x, y, dir) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      // Impassable obstacle
      if (objects.some(o => o.x === x && o.y === y && !o.walkable)) return false;
      // Solid or Shadow
      return isSolid(x, y) || shadowMapByDir[dir].has(`${x},${y}`);
    };

    // BFS Search
    // State: [px, py, dir]
    const initialDir = levelData.lightDirection || LIGHT_DIRECTIONS.LEFT;
    const startState = `${start.x},${start.y},${initialDir}`;
    const queue = [{ x: start.x, y: start.y, dir: initialDir, steps: 0, path: [] }];
    const visited = new Set([startState]);

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();

      // Check if exit reached
      if (current.x === exit.x && current.y === exit.y) {
        return {
          isSolvable: true,
          minSteps: current.steps,
          solutionPath: [...current.path, { x: current.x, y: current.y, dir: current.dir }]
        };
      }

      // Action 1: Walk to adjacent walkable cell
      for (const n of neighbors) {
        const nx = current.x + n.dx;
        const ny = current.y + n.dy;

        if (isWalkable(nx, ny, current.dir)) {
          const stateKey = `${nx},${ny},${current.dir}`;
          if (!visited.has(stateKey)) {
            visited.add(stateKey);
            queue.push({
              x: nx,
              y: ny,
              dir: current.dir,
              steps: current.steps + 1,
              path: [...current.path, { action: 'move', x: nx, y: ny, dir: current.dir }]
            });
          }
        }
      }

      // Action 2: Rotate light direction
      for (const nextDir of directions) {
        if (nextDir !== current.dir) {
          // If Lumi is on solid ground, rotating light is always completely safe!
          // If Lumi is on a shadow, they stay if the shadow still exists under new light,
          // or if they drop back to solid ground.
          let nextX = current.x;
          let nextY = current.y;

          if (!isWalkable(nextX, nextY, nextDir)) {
            // Cannot remain in place under new light without falling
            continue;
          }

          const stateKey = `${nextX},${nextY},${nextDir}`;
          if (!visited.has(stateKey)) {
            visited.add(stateKey);
            queue.push({
              x: nextX,
              y: nextY,
              dir: nextDir,
              steps: current.steps + 1,
              path: [...current.path, { action: 'rotate', x: nextX, y: nextY, dir: nextDir }]
            });
          }
        }
      }
    }

    return { isSolvable: false, minSteps: 0, solutionPath: [] };
  }
}
