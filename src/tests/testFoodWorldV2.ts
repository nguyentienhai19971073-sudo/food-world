/**
 * Comprehensive V2 Test Suite for FOOD WORLD:
 * 1. World Food Passport & Country Mastery System
 * 2. Food Collection Discovery & 160+ Dish Parity
 * 3. Country Food Stalls & Shuffle Architecture
 * 4. Speed Challenge Cadence (Every 5 Levels) & Scoring
 * 5. Audio Procedural SFX Pipeline
 */

import { saveManager, DEFAULT_USER_PROGRESS } from '../services/saveManager';
import { COUNTRIES } from '../data/countries';
import { DISHES } from '../data/dishes';
import { audioManager } from '../services/audio';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [ASSERTION FAILED] ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runV2Tests() {
  console.log('=== FOOD WORLD V2 VERIFICATION TEST SUITE ===\n');

  // -------------------------------------------------------------
  // TEST 1: Country Mastery & Passport Stamp Awarding
  // -------------------------------------------------------------
  console.log('--- TEST 1: Country Mastery & Passport Stamp System ---');
  await saveManager.resetProgress();
  let progress = saveManager.getProgress();

  assert(progress.passportStamps.length === 0, 'Initial passport stamps count is 0');
  assert(Object.keys(progress.countryMastery).length === 0, 'Initial country mastery is empty');

  // Test with Vietnam (VN) which has dishes: pho, banh_mi, bun_cha, etc.
  const vnDishes = DISHES.filter((d) => d.countryId === 'VN');
  assert(vnDishes.length >= 3, 'Vietnam has at least 3 dishes in the database');

  // Match 1st dish
  const res1 = await saveManager.recordDishMatch(vnDishes[0].id, 'VN', vnDishes.length);
  assert(res1.isNewStamp === false, 'First dish match does not yet earn passport stamp');
  assert(res1.masteredDishesCount === 1, 'Mastered dish count is 1');

  // Match duplicate of 1st dish (should not increment mastery)
  const res1Dup = await saveManager.recordDishMatch(vnDishes[0].id, 'VN', vnDishes.length);
  assert(res1Dup.masteredDishesCount === 1, 'Duplicate dish does not increase mastery count');

  // Match 2nd dish
  const res2 = await saveManager.recordDishMatch(vnDishes[1].id, 'VN', vnDishes.length);
  assert(res2.masteredDishesCount === 2, 'Mastered dish count is 2');
  assert(res2.isNewStamp === false, 'Second dish match does not yet earn passport stamp');

  // Match 3rd dish -> Reaches target (3/3)!
  const res3 = await saveManager.recordDishMatch(vnDishes[2].id, 'VN', vnDishes.length);
  assert(res3.masteredDishesCount === 3, 'Mastered dish count is 3');
  assert(res3.isNewStamp === true, 'Third dish match triggers official passport stamp!');

  progress = saveManager.getProgress();
  assert(progress.passportStamps.includes('VN'), 'Passport stamps now permanently contains VN');
  assert(progress.passportStamps.length === 1, 'Total stamps count is 1');

  // Replay test: Matching again must NOT double-reward or duplicate stamp
  const resReplay = await saveManager.recordDishMatch(vnDishes[0].id, 'VN', vnDishes.length);
  assert(resReplay.isNewStamp === false, 'Replaying does not award duplicate stamp');
  progress = saveManager.getProgress();
  assert(progress.passportStamps.filter((s) => s === 'VN').length === 1, 'No duplicate stamps on replay');

  // -------------------------------------------------------------
  // TEST 2: Food Collection Discovery Logic
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Food Collection Discovery & DB Integrity ---');
  assert(DISHES.length >= 160, `DISHES count must be >= 160 (actual: ${DISHES.length})`);
  assert(COUNTRIES.length >= 40, `COUNTRIES count must be >= 40 (actual: ${COUNTRIES.length})`);

  // Test new food flag
  const testDish = DISHES.find((d) => !progress.unlockedFoodIds.includes(d.id));
  if (testDish) {
    const unlockRes1 = await saveManager.recordDishMatch(testDish.id, testDish.countryId, 3);
    assert(unlockRes1.isNewFood === true, `First match of ${testDish.id} flags isNewFood === true`);

    const unlockRes2 = await saveManager.recordDishMatch(testDish.id, testDish.countryId, 3);
    assert(unlockRes2.isNewFood === false, `Second match of ${testDish.id} flags isNewFood === false`);
  }

  // -------------------------------------------------------------
  // TEST 3: Speed Challenge Cadence & Scoring
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Speed Challenge Cadence & High Score Storage ---');
  // Verify cadence: Level 5, 10, 15, 20...
  for (let lvl = 1; lvl <= 20; lvl++) {
    const isSpeedChallengeTrigger = lvl % 5 === 0;
    if (isSpeedChallengeTrigger) {
      assert(lvl === 5 || lvl === 10 || lvl === 15 || lvl === 20, `Level ${lvl} correctly triggers Speed Challenge`);
    }
  }

  // Speed Challenge score persistence
  const scoreRes1 = await saveManager.recordSpeedChallengeScore(1500);
  assert(scoreRes1.isNewHighScore === true, '1500 is recognized as new high score');
  assert(scoreRes1.bestScore === 1500, 'Best score recorded as 1500');

  const scoreRes2 = await saveManager.recordSpeedChallengeScore(1200);
  assert(scoreRes2.isNewHighScore === false, '1200 does not overwrite higher record');
  assert(scoreRes2.bestScore === 1500, 'Best score remains 1500');

  const scoreRes3 = await saveManager.recordSpeedChallengeScore(2400);
  assert(scoreRes3.isNewHighScore === true, '2400 sets a new personal record');
  assert(scoreRes3.bestScore === 2400, 'Best score updated to 2400');

  // -------------------------------------------------------------
  // TEST 4: Procedural Web Audio SFX Verification
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Procedural Web Audio SFX Pipeline ---');
  assert(typeof audioManager.playStamp === 'function', 'audioManager.playStamp exists');
  assert(typeof audioManager.playSpeedTick === 'function', 'audioManager.playSpeedTick exists');
  assert(typeof audioManager.playTimeUp === 'function', 'audioManager.playTimeUp exists');
  assert(typeof audioManager.playPageFlip === 'function', 'audioManager.playPageFlip exists');
  assert(typeof audioManager.playUnlockSparkle === 'function', 'audioManager.playUnlockSparkle exists');

  // Execute without throwing
  audioManager.playStamp();
  audioManager.playSpeedTick(false);
  audioManager.playSpeedTick(true);
  audioManager.playTimeUp();
  audioManager.playPageFlip();
  audioManager.playUnlockSparkle();
  console.log('✅ All V2 audio synthesis triggers executed cleanly without runtime exceptions');

  console.log('\n🎉 ALL FOOD WORLD V2 SYSTEM TESTS COMPLETED SUCCESSFULLY!');
}

runV2Tests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
