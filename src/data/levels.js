/**
 * Levels Database & Procedural Generator for SHADOW SHIFT
 * Contains 100 Handcrafted Solvable Levels + Infinite Guaranteed-Solvable Procedural Generator
 */
import { buildAll100Levels } from '../generateValidLevels.js';
import { PathValidator } from '../gameplay/pathValidator.js';
import { LIGHT_DIRECTIONS } from '../gameplay/shadowSystem.js';

function createRNG(seed) {
  let s = Math.abs(seed) || 1;
  return function() {
    s |= 0;
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Procedural Solvable Level Generator
 */
export function generateProceduralLevel(seedNumber = 101) {
  const rng = createRNG(seedNumber);
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const width = 9 + Math.floor(rng() * 3);  // 9 to 11
    const height = 7 + Math.floor(rng() * 2); // 7 to 8

    const start = { x: 1, y: 1 + Math.floor(rng() * (height - 2)) };
    const exit = { x: width - 2, y: 1 + Math.floor(rng() * (height - 2)) };

    const initialDir = [LIGHT_DIRECTIONS.UP, LIGHT_DIRECTIONS.LEFT, LIGHT_DIRECTIONS.RIGHT, LIGHT_DIRECTIONS.DOWN][Math.floor(rng() * 4)];

    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);

    const solidPlatforms = [
      { x: start.x, y: start.y },
      { x: start.x + 1, y: start.y },
      { x: midX, y: midY },
      { x: exit.x - 1, y: exit.y },
      { x: exit.x, y: exit.y }
    ];

    const objects = [
      {
        x: midX,
        y: Math.max(1, midY - 1),
        type: (seedNumber > 50 && rng() > 0.6) ? 'prism' : 'pillar',
        shadowLength: 3,
        rotation: 90
      }
    ];

    const collectibles = [
      { x: midX, y: midY, collected: false }
    ];

    const candidate = {
      id: seedNumber,
      name: `Procedural Realm #${seedNumber}`,
      chapter: Math.min(10, Math.floor(seedNumber / 10)),
      width,
      height,
      start,
      exit,
      lightDirection: initialDir,
      solidPlatforms,
      objects,
      collectibles,
      switches: [],
      darkZones: [],
      targetMoves: 10,
      parTime: 40,
      hint: 'Rotate the light to bridge the central chasm.'
    };

    const validation = PathValidator.validate(candidate);
    if (validation.isSolvable && validation.minSteps >= 3) {
      candidate.targetMoves = Math.max(6, validation.minSteps + 2);
      candidate.parTime = Math.max(25, candidate.targetMoves * 4);
      return candidate;
    }
  }

  // Guaranteed fallback level
  return {
    id: seedNumber,
    name: `Labyrinth #${seedNumber}`,
    chapter: 1,
    width: 9,
    height: 7,
    start: { x: 1, y: 3 },
    exit: { x: 7, y: 3 },
    lightDirection: LIGHT_DIRECTIONS.UP,
    solidPlatforms: [
      { x: 1, y: 3 }, { x: 2, y: 3 },
      { x: 4, y: 3 },
      { x: 6, y: 3 }, { x: 7, y: 3 }
    ],
    objects: [
      { x: 3, y: 2, type: 'pillar', shadowLength: 3 },
      { x: 5, y: 2, type: 'pillar', shadowLength: 3 }
    ],
    collectibles: [{ x: 4, y: 3, collected: false }],
    switches: [],
    darkZones: [],
    targetMoves: 8,
    parTime: 30,
    hint: 'Cast shadows down to connect the stone islands.'
  };
}

export function getDailyLevel(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 10000 + 1000;
  const level = generateProceduralLevel(seed);
  level.id = 'daily';
  level.name = `Daily Challenge: ${dateStr}`;
  return level;
}

export const LEVELS = buildAll100Levels();
