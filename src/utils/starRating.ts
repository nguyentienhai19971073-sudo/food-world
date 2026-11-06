/**
 * Star Rating & Scoring System for Food World
 * 
 * Strict accuracy-based evaluation:
 * - 3 Stars (★★★): Completed with 0 wrong attempts (Flawless).
 * - 2 Stars (★★☆): Completed with 1-2 wrong attempts.
 * - 1 Star  (★☆☆): Completed with 3 or more wrong attempts.
 * - 0 Stars (☆☆☆): Defeat or incomplete.
 * 
 * Score rules:
 * - Correct match: +100 points (+ combo bonus)
 * - Wrong match:   -25 points penalty (score floor at 0)
 * - Combos and fast time CANNOT recover lost stars from wrong attempts.
 */

export const SCORE_CORRECT_BASE = 100;
export const SCORE_WRONG_PENALTY = 25;

/**
 * Calculates final stars upon level completion or failure.
 */
export function calculateStars(wrongAttempts: number, isVictory: boolean = true): number {
  if (!isVictory) return 0;
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts <= 2) return 2;
  return 1;
}

/**
 * Returns the maximum achievable stars in the current run based on wrong attempts so far.
 * Used for live HUD projected stars display.
 */
export function calculateProjectedStars(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts <= 2) return 2;
  return 1;
}

/**
 * Calculates new score after a match attempt.
 */
export function calculateScoreAfterAttempt(
  currentScore: number,
  isCorrect: boolean,
  combo: number = 0
): { nextScore: number; scoreDelta: number; comboBonus: number } {
  if (isCorrect) {
    const comboBonus = Math.min((combo + 1) * 25, 250);
    const addedScore = SCORE_CORRECT_BASE + comboBonus;
    return {
      nextScore: currentScore + addedScore,
      scoreDelta: addedScore,
      comboBonus,
    };
  } else {
    const deducted = Math.min(currentScore, SCORE_WRONG_PENALTY);
    return {
      nextScore: Math.max(0, currentScore - SCORE_WRONG_PENALTY),
      scoreDelta: -SCORE_WRONG_PENALTY,
      comboBonus: 0,
    };
  }
}
