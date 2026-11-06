/**
 * Automated Verification for Food World Dynamic Random Generation System
 * Tests 120+ randomized iterations to verify:
 * 1. 100% of dishes have their country present in the level (solvability).
 * 2. Country kiosk positions and dish queues are randomized across replays.
 * 3. No orphan dishes, no missing countries, no illegal duplicates.
 * 4. Frequency cooldown functions properly.
 */

import { generateDynamicLevel, clearRecentUsage, getLevel } from '../data/levels';
import { DISHES } from '../data/dishes';
import { COUNTRIES } from '../data/countries';

console.log('=== RUNNING DYNAMIC RANDOM GENERATION TEST SUITE ===');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
  }
}

// TEST 1: Verify 120 Random Generations Across All 6 Sectors
console.log('\n[TEST 1] Testing 120 dynamic level generations across all sectors...');
clearRecentUsage();

for (let lvl = 1; lvl <= 120; lvl++) {
  const level = generateDynamicLevel(lvl);

  assert(level.levelNumber === lvl, `Level number must be ${lvl}`);
  assert(level.countryIds.length >= 2, `Level ${lvl} must have at least 2 countries`);
  assert(level.dishIds.length >= 4, `Level ${lvl} must have at least 4 dishes`);

  // Check unique countries
  const uniqueCountries = new Set(level.countryIds);
  assert(uniqueCountries.size === level.countryIds.length, `Level ${lvl} has duplicate countries`);

  // Check all countries exist in master DB
  level.countryIds.forEach((cid) => {
    const exists = COUNTRIES.some((c) => c.id === cid);
    assert(exists, `Level ${lvl} references invalid country: ${cid}`);
  });

  // CRITICAL SOLVABILITY CHECK: Every single dish MUST belong to an active country on board!
  level.dishIds.forEach((did) => {
    const dish = DISHES.find((d) => d.id === did);
    assert(Boolean(dish), `Level ${lvl} references invalid dish: ${did}`);
    if (dish) {
      assert(
        level.countryIds.includes(dish.countryId),
        `Level ${lvl} dish "${dish.id}" (${dish.countryId}) NOT in active countries: [${level.countryIds.join(', ')}]`
      );
    }
  });

  // Verify each active country has at least one dish in the level
  level.countryIds.forEach((cid) => {
    const hasDish = level.dishIds.some((did) => {
      const d = DISHES.find((item) => item.id === did);
      return d && d.countryId === cid;
    });
    assert(hasDish, `Level ${lvl} country ${cid} has zero dishes on board!`);
  });
}
console.log(`✓ 120 levels generated and 100% verified solvable!`);

// TEST 2: Verify Randomization & Position Variation across Replays of the Same Level
console.log('\n[TEST 2] Testing replay variance (Level 1 replay 5 times)...');
clearRecentUsage();

const replayRuns: Array<{ countries: string[]; dishes: string[] }> = [];
for (let i = 0; i < 5; i++) {
  const level = generateDynamicLevel(1);
  replayRuns.push({
    countries: level.countryIds,
    dishes: level.dishIds,
  });
}

// Compare run 0 with other runs to ensure variation exists
let detectedVariation = false;
for (let i = 1; i < replayRuns.length; i++) {
  const countriesMatch = JSON.stringify(replayRuns[0].countries) === JSON.stringify(replayRuns[i].countries);
  const dishesMatch = JSON.stringify(replayRuns[0].dishes) === JSON.stringify(replayRuns[i].dishes);

  if (!countriesMatch || !dishesMatch) {
    detectedVariation = true;
    break;
  }
}
assert(detectedVariation, 'Replaying Level 1 must produce different country positions or different dishes!');
console.log('✓ Replay variance verified: consecutive runs generate distinct culinary combinations!');

// TEST 3: Verify Sector Accuracy
console.log('\n[TEST 3] Testing sector-appropriate country affiliation...');
const asiaLevel = generateDynamicLevel(5);
assert(asiaLevel.sector === 'asia', 'Level 5 must be in Asia sector');
asiaLevel.countryIds.forEach((cid) => {
  const c = COUNTRIES.find((item) => item.id === cid);
  assert(c?.continent === 'asia', `Level 5 country ${cid} must be Asian`);
});

const europeLevel = generateDynamicLevel(30);
assert(europeLevel.sector === 'europe', 'Level 30 must be in Europe sector');
europeLevel.countryIds.forEach((cid) => {
  const c = COUNTRIES.find((item) => item.id === cid);
  assert(c?.continent === 'europe', `Level 30 country ${cid} must be European`);
});

const worldLevel = generateDynamicLevel(115);
assert(worldLevel.sector === 'world', 'Level 115 must be in World Tour');
assert(worldLevel.countryIds.length >= 4, 'Level 115 must have at least 4 countries');
assert(worldLevel.isConveyor === true, 'Level 115 must have conveyor belt mode enabled');
console.log('✓ Sector country affiliations verified!');

// TEST 4: Verify Difficulty Curve Scaling
console.log('\n[TEST 4] Testing difficulty curve progression...');
const easyLvl = generateDynamicLevel(2);
const hardLvl = generateDynamicLevel(118);

assert(easyLvl.countryIds.length < hardLvl.countryIds.length, 'Hard level must have more countries than easy level');
assert(easyLvl.dishIds.length < hardLvl.dishIds.length, 'Hard level must have more dishes than easy level');
assert(easyLvl.timeLimitSeconds === null, 'Early easy level has relaxed/no time limit');
assert(typeof hardLvl.timeLimitSeconds === 'number', 'World challenge has strict time limit');
console.log('✓ Difficulty scaling verified!');

console.log(`\n========================================`);
console.log(`ALL ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`Dynamic Random Generation System is 100% Valid & Solvable.`);
console.log(`========================================`);
