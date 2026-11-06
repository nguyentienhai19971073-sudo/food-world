/**
 * Verification Script for Audio Test Mode & Full Dish Name Display
 */

import { isAudioTestEnabled } from '../components/AudioTestPanel';
import { youtubeSdk } from '../services/youtubeSdk';
import { audioManager } from '../services/audio';
import { foodData } from '../data/foodData';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

console.log('--- 1. Testing Audio Mode Gating (Dev vs YouTube Playables) ---');

// Mock window object for node environment
(globalThis as any).window = (globalThis as any).window || {};

// Test 1: In YouTube Playables Environment, Audio Test Mode MUST be completely disabled
(globalThis as any).window.ytgame = {
  IN_PLAYABLES_ENV: true,
  system: {
    isAudioEnabled: () => true,
    onAudioEnabledChange: () => {},
  },
};

assert(youtubeSdk.isInPlayablesEnv() === true, 'youtubeSdk accurately detects YouTube Playables environment');
assert(isAudioTestEnabled() === false, 'Audio test panel is strictly disabled in YouTube Playables environment');

// Test 2: In Preview or Dev Environment, Audio Test Mode is enabled
delete (globalThis as any).window.ytgame;
assert(youtubeSdk.isInPlayablesEnv() === false, 'youtubeSdk accurately detects non-YouTube environment');
assert(isAudioTestEnabled() === true, 'Audio test panel is accessible in AI Studio Dev / Preview environment');

console.log('\n--- 2. Verifying Full Dish Name Wrapping (No Truncation / No Ellipsis) ---');

const filesToCheck = [
  'src/components/DraggableDish.tsx',
  'src/screens/ClassicGameScreen.tsx',
  'src/screens/FoodMemoryScreen.tsx',
  'src/screens/FoodCollectionScreen.tsx',
];

for (const relPath of filesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf-8');

  // Dish name elements should not use `truncate` or `ellipsis`
  const lines = content.split('\n');
  let foundTruncateOnName = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if line renders dish.name or item.name and uses truncate
    if ((line.includes('dish.name') || line.includes('item.name') || line.includes('food.name')) && line.includes('truncate')) {
      foundTruncateOnName = true;
      console.error(`Found truncate on dish name in ${relPath}:${i + 1} -> ${line}`);
    }
  }

  assert(!foundTruncateOnName, `No dish name truncation in ${relPath}`);
  assert(!content.includes('text-overflow: ellipsis'), `No text-overflow: ellipsis in ${relPath}`);
  assert(!content.includes('text-ellipsis'), `No text-ellipsis class in ${relPath}`);
}

console.log('\n--- 3. Verifying Multilingual Dish Names Across 6 Locales ---');
const locales = ['vi', 'en', 'ja', 'ko', 'es', 'fr'] as const;

foodData.dishes.forEach((food) => {
  locales.forEach((loc) => {
    const name = food.name[loc];
    assert(!!name && name.trim().length > 0, `Dish ${food.id} has valid ${loc} name: "${name}"`);
  });
});
console.log(`Verified ${foodData.dishes.length} dishes have valid names across all 6 locales.`);

console.log('\n--- 4. Verifying Real Audio Functions ---');
assert(typeof audioManager.testMusic === 'function', 'audioManager.testMusic exists');
assert(typeof audioManager.testSfx === 'function', 'audioManager.testSfx exists');
assert(typeof audioManager.playCorrect === 'function', 'audioManager.playCorrect exists');
assert(typeof audioManager.playWrong === 'function', 'audioManager.playWrong exists');
assert(typeof audioManager.playCombo === 'function', 'audioManager.playCombo exists');
assert(typeof audioManager.playVictory === 'function', 'audioManager.playVictory exists');

// Invoke test methods safely in headless node
audioManager.testSfx();
audioManager.testMusic();
audioManager.playCorrect();
audioManager.playWrong();
audioManager.playCombo(3);
audioManager.playCombo(5);
audioManager.playVictory();
console.log('✅ All audio triggers executed successfully without runtime exceptions.');

console.log('\n🎉 ALL AUDIO & DISH NAME VERIFICATION TESTS PASSED SUCCESSFULLY!');
