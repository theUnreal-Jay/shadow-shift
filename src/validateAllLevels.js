import { LEVELS } from './data/levels.js';
import { PathValidator } from './gameplay/pathValidator.js';

console.log(`Checking all ${LEVELS.length} levels for reachability and solvability...`);

let unsolvableCount = 0;
LEVELS.forEach(lvl => {
  const result = PathValidator.validate(lvl);
  if (!result.isSolvable) {
    unsolvableCount++;
    console.error(`Level ${lvl.id} (${lvl.name}) is NOT solvable!`);
  } else {
    // Check if targetMoves is reasonable
    if (lvl.targetMoves < result.minSteps) {
      console.warn(`Level ${lvl.id} targetMoves (${lvl.targetMoves}) is less than minSteps (${result.minSteps})`);
    }
  }
});

if (unsolvableCount === 0) {
  console.log(`SUCCESS: All ${LEVELS.length} levels are 100% verified solvable!`);
} else {
  console.error(`FAILURE: ${unsolvableCount} levels are unsolvable.`);
}
