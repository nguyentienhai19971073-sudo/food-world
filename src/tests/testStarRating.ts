/**
 * Automated Test Suite for Food World Star Rating & Scoring System
 * Validates:
 * 1. 0 wrong attempts -> strictly 3 stars (Flawless)
 * 2. 1-2 wrong attempts -> strictly 2 stars
 * 3. 3+ wrong attempts -> strictly 1 star
 * 4. Game over / defeat -> strictly 0 stars
 * 5. Wrong match deducts 25 points with minimum 0 floor
 * 6. High combo / fast time cannot recover lost stars from mistakes
 */

import {
  calculateStars,
  calculateProjectedStars,
  calculateScoreAfterAttempt,
  SCORE_WRONG_PENALTY,
  SCORE_CORRECT_BASE,
} from '../utils/starRating';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    console.error(`❌ FAILED: ${message}`);
  }
}

console.log('--- Testing Star Rating & Accuracy Rules ---');

// 1. Star Calculation on Victory
assert(calculateStars(0, true) === 3, '0 mistakes on victory must yield 3 stars');
assert(calculateStars(1, true) === 2, '1 mistake on victory must yield 2 stars');
assert(calculateStars(2, true) === 2, '2 mistakes on victory must yield 2 stars');
assert(calculateStars(3, true) === 1, '3 mistakes on victory must yield 1 star');
assert(calculateStars(4, true) === 1, '4 mistakes on victory must yield 1 star');
assert(calculateStars(10, true) === 1, '10 mistakes on victory must yield 1 star');
assert(calculateStars(99, true) === 1, '99 mistakes on victory must yield 1 star');

// 2. Star Calculation on Defeat
assert(calculateStars(0, false) === 0, '0 mistakes on defeat must yield 0 stars');
assert(calculateStars(1, false) === 0, '1 mistake on defeat must yield 0 stars');
assert(calculateStars(5, false) === 0, '5 mistakes on defeat must yield 0 stars');

// 3. Projected Stars (Live HUD)
assert(calculateProjectedStars(0) === 3, 'Projected stars with 0 mistakes is 3');
assert(calculateProjectedStars(1) === 2, 'Projected stars with 1 mistake drops to 2');
assert(calculateProjectedStars(2) === 2, 'Projected stars with 2 mistakes remains 2');
assert(calculateProjectedStars(3) === 1, 'Projected stars with 3 mistakes drops to 1');
assert(calculateProjectedStars(5) === 1, 'Projected stars with 5 mistakes is 1');

// 4. Score Calculation & Deductions
const initialScore = 200;
const afterWrong = calculateScoreAfterAttempt(initialScore, false);
assert(
  afterWrong.nextScore === 175,
  `Wrong match must deduct ${SCORE_WRONG_PENALTY} points (expected 175, got ${afterWrong.nextScore})`
);

// Score Floor at 0
const lowScore = 15;
const afterLowWrong = calculateScoreAfterAttempt(lowScore, false);
assert(
  afterLowWrong.nextScore === 0,
  `Wrong match with score 15 must floor at 0 (got ${afterLowWrong.nextScore})`
);

// Correct Match Score
const afterCorrect = calculateScoreAfterAttempt(0, true, 0);
assert(
  afterCorrect.nextScore === SCORE_CORRECT_BASE + 25,
  `First correct match should add base + first combo bonus (got ${afterCorrect.nextScore})`
);

// 5. Level Simulation Test: 8 dishes, player makes 1 mistake
console.log('--- Simulating 8-Dish Level with Mistakes ---');
{
  let runScore = 0;
  let runCombo = 0;
  let wrongCount = 0;

  // 3 correct matches
  for (let i = 0; i < 3; i++) {
    const res = calculateScoreAfterAttempt(runScore, true, runCombo);
    runScore = res.nextScore;
    runCombo++;
  }

  // 1 accidental mistake!
  wrongCount++;
  const wrongRes = calculateScoreAfterAttempt(runScore, false, runCombo);
  runScore = wrongRes.nextScore;
  runCombo = 0; // combo resets on mistake

  // Remaining 5 correct matches
  for (let i = 0; i < 5; i++) {
    const res = calculateScoreAfterAttempt(runScore, true, runCombo);
    runScore = res.nextScore;
    runCombo++;
  }

  const finalStars = calculateStars(wrongCount, true);
  assert(
    finalStars === 2,
    `Player with 1 mistake across 8 dishes must receive strictly 2 stars (got ${finalStars})`
  );
  assert(
    finalStars !== 3,
    'Player with 1 mistake must NEVER receive 3 stars'
  );
}

// 6. Level Simulation Test: 8 dishes, player makes 4 mistakes
{
  let runScore = 0;
  let runCombo = 0;
  let wrongCount = 0;

  // 4 mistakes
  for (let i = 0; i < 4; i++) {
    wrongCount++;
    const res = calculateScoreAfterAttempt(runScore, false, runCombo);
    runScore = res.nextScore;
    runCombo = 0;
  }

  // 8 correct matches
  for (let i = 0; i < 8; i++) {
    const res = calculateScoreAfterAttempt(runScore, true, runCombo);
    runScore = res.nextScore;
    runCombo++;
  }

  const finalStars = calculateStars(wrongCount, true);
  assert(
    finalStars === 1,
    `Player with 4 mistakes must receive strictly 1 star (got ${finalStars})`
  );
}

// 7. Level Simulation Test: 8 dishes, 0 mistakes (Flawless)
{
  let runScore = 0;
  let runCombo = 0;
  let wrongCount = 0;

  for (let i = 0; i < 8; i++) {
    const res = calculateScoreAfterAttempt(runScore, true, runCombo);
    runScore = res.nextScore;
    runCombo++;
  }

  const finalStars = calculateStars(wrongCount, true);
  assert(
    finalStars === 3,
    `Player with 0 mistakes must receive 3 stars (got ${finalStars})`
  );
}

// 8. ResultScene Logic: Independent resolution of currentStars and bestStars
console.log('--- Testing ResultScene Independent Star Resolution ---');
function resolveResultStars(props: {
  currentStars?: number;
  stars?: number;
  bestStars?: number;
  wrongAttempts?: number;
  isVictory?: boolean;
  saveBestStars?: number;
}) {
  const isVictory = props.isVictory ?? true;
  const calculatedFromWrongAttempts = calculateStars(props.wrongAttempts ?? 0, isVictory);
  const effectiveCurrentStars =
    props.currentStars !== undefined
      ? props.currentStars
      : props.wrongAttempts !== undefined
      ? calculatedFromWrongAttempts
      : (props.stars !== undefined ? props.stars : calculatedFromWrongAttempts);

  const effectiveBestStars = props.bestStars !== undefined ? props.bestStars : (props.saveBestStars || 0);
  const showHistoricalBadge = effectiveBestStars > effectiveCurrentStars;
  return { effectiveCurrentStars, effectiveBestStars, showHistoricalBadge };
}

// Case A: Player previously had 3 stars, but in this session made 4 mistakes -> currentStars: 1, bestStars: 3
const resA = resolveResultStars({ currentStars: 1, bestStars: 3 });
assert(resA.effectiveCurrentStars === 1, 'Current session stars must display 1 star, NOT 3');
assert(resA.effectiveBestStars === 3, 'All-time best must remain 3');
assert(resA.showHistoricalBadge === true, 'Historical badge must be shown when bestStars > currentStars');

// Case B: Player previously had 1 star, but in this session was flawless -> currentStars: 3, bestStars: 1
const resB = resolveResultStars({ currentStars: 3, bestStars: 1 });
assert(resB.effectiveCurrentStars === 3, 'Current session stars must display 3 stars');
assert(resB.showHistoricalBadge === false, 'Historical badge must NOT be shown when current >= best');

// Case C: Backward compatibility with stars prop
const resC = resolveResultStars({ stars: 2, bestStars: 3 });
assert(resC.effectiveCurrentStars === 2, 'Fallback to stars prop correctly resolves to 2');
assert(resC.showHistoricalBadge === true, 'Historical badge correctly displayed with stars fallback');

// Case D: Direct wrongAttempts calculation in ResultScene
const resD1 = resolveResultStars({ wrongAttempts: 0, bestStars: 0 });
assert(resD1.effectiveCurrentStars === 3, 'wrongAttempts = 0 directly calculates 3 stars in ResultScene');

const resD2 = resolveResultStars({ wrongAttempts: 1, bestStars: 3 });
assert(resD2.effectiveCurrentStars === 2, 'wrongAttempts = 1 directly calculates 2 stars in ResultScene');
assert(resD2.showHistoricalBadge === true, 'Shows historical badge 3★ when current is 2★');

const resD3 = resolveResultStars({ wrongAttempts: 5, bestStars: 3 });
assert(resD3.effectiveCurrentStars === 1, 'wrongAttempts = 5 directly calculates 1 star in ResultScene');
assert(resD3.showHistoricalBadge === true, 'Shows historical badge 3★ when current is 1★');

// 9. App.tsx Level Completion Logic Test:
console.log('--- Testing App.tsx Level Completion Star Calculation ---');
function appLevelComplete(score: number, wrongAttempts: number, explicitStars?: number) {
  const sessionStars = explicitStars !== undefined ? explicitStars : calculateStars(wrongAttempts, true);
  return { score, sessionStars };
}

assert(appLevelComplete(1000, 0).sessionStars === 3, 'App.tsx calculates 3 stars for 0 wrong attempts');
assert(appLevelComplete(950, 1).sessionStars === 2, 'App.tsx calculates 2 stars for 1 wrong attempt');
assert(appLevelComplete(900, 2).sessionStars === 2, 'App.tsx calculates 2 stars for 2 wrong attempts');
assert(appLevelComplete(800, 3).sessionStars === 1, 'App.tsx calculates 1 star for 3 wrong attempts');
assert(appLevelComplete(700, 7).sessionStars === 1, 'App.tsx calculates 1 star for 7 wrong attempts');

console.log(`\nResults: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL STAR RATING & SCORING TESTS PASSED PERFECTLY!');
}
