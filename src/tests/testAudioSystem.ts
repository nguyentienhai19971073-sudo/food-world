/**
 * Automated Audio System Verification Suite for Food World
 * Tests:
 * 1. AudioManager instance creation and API surface
 * 2. Volume controls (0.0 to 1.0 clamped range)
 * 3. Mute toggles for Music and SFX
 * 4. BGM track switching ('menu' vs 'gameplay')
 * 5. SFX method availability: playClick, playSelectFood, playPickup, playDrop, playCorrect, playWrong, playCombo, playStarSparkle, playVictory, playUnlock, playTimeUp, playGameOver
 * 6. YouTube mute compliance
 */

import { audioManager } from '../services/audio';
import { youtubeSdk } from '../services/youtubeSdk';

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

console.log('--- Testing Food World Audio System ---');

// 1. Initial State
assert(typeof audioManager.unlock === 'function', 'audioManager has unlock()');
assert(typeof audioManager.startBgm === 'function', 'audioManager has startBgm()');
assert(typeof audioManager.pauseBgm === 'function', 'audioManager has pauseBgm()');
assert(typeof audioManager.resumeBgm === 'function', 'audioManager has resumeBgm()');

// 2. Volume Clamping
audioManager.setMusicVolume(0.5);
assert(audioManager.getMusicVolume() === 0.5, 'Music volume set to 0.5');

audioManager.setMusicVolume(1.5);
assert(audioManager.getMusicVolume() === 1.0, 'Music volume clamped to max 1.0');

audioManager.setMusicVolume(-0.2);
assert(audioManager.getMusicVolume() === 0.0, 'Music volume clamped to min 0.0');

audioManager.setSfxVolume(0.85);
assert(audioManager.getSfxVolume() === 0.85, 'SFX volume set to 0.85');

audioManager.setSfxVolume(2.0);
assert(audioManager.getSfxVolume() === 1.0, 'SFX volume clamped to max 1.0');

// 3. Mute Toggles
audioManager.setMusicEnabled(false);
assert(audioManager.getMusicEnabled() === false, 'Music can be disabled');

audioManager.setMusicEnabled(true);
assert(audioManager.getMusicEnabled() === true, 'Music can be enabled');

audioManager.setSfxEnabled(false);
assert(audioManager.getSfxEnabled() === false, 'SFX can be disabled');

audioManager.setSfxEnabled(true);
assert(audioManager.getSfxEnabled() === true, 'SFX can be enabled');

// 4. BGM Track Switching
audioManager.startBgm('menu');
audioManager.startBgm('gameplay');
audioManager.pauseBgm();
audioManager.resumeBgm();

// 5. Sound Effects Execution in Node/Headless Environment (graceful fallback)
assert(typeof audioManager.playClick === 'function', 'has playClick()');
assert(typeof audioManager.playSelectFood === 'function', 'has playSelectFood()');
assert(typeof audioManager.playPickup === 'function', 'has playPickup()');
assert(typeof audioManager.playDrop === 'function', 'has playDrop()');
assert(typeof audioManager.playCorrect === 'function', 'has playCorrect()');
assert(typeof audioManager.playWrong === 'function', 'has playWrong()');
assert(typeof audioManager.playCombo === 'function', 'has playCombo()');
assert(typeof audioManager.playStarSparkle === 'function', 'has playStarSparkle()');
assert(typeof audioManager.playVictory === 'function', 'has playVictory()');
assert(typeof audioManager.playUnlock === 'function', 'has playUnlock()');
assert(typeof audioManager.playTimeUp === 'function', 'has playTimeUp()');
assert(typeof audioManager.playGameOver === 'function', 'has playGameOver()');

// Ensure execution does not throw even without browser AudioContext
try {
  audioManager.playClick();
  audioManager.playSelectFood();
  audioManager.playPickup();
  audioManager.playDrop();
  audioManager.playCorrect();
  audioManager.playWrong();
  audioManager.playCombo(3);
  audioManager.playCombo(5);
  audioManager.playCombo(10);
  audioManager.playStarSparkle(0);
  audioManager.playVictory();
  audioManager.playUnlock();
  audioManager.playTimeUp();
  audioManager.playGameOver();
  audioManager.testMusic();
  audioManager.testSfx();
  assert(true, 'All sound methods executed safely without exception');
} catch (e) {
  assert(false, `Sound method execution threw an error: ${e}`);
}

// 6. YouTube Mute Compliance & Environment Distinction
assert(typeof youtubeSdk.isAudioEnabled === 'function', 'youtubeSdk has isAudioEnabled()');
assert(typeof youtubeSdk.onAudioEnabledChange === 'function', 'youtubeSdk has onAudioEnabledChange()');
assert(typeof youtubeSdk.isInPlayablesEnv === 'function', 'youtubeSdk has isInPlayablesEnv()');

// Outside YouTube Playables, isInPlayablesEnv should be false and isAudioEnabled should be true
assert(youtubeSdk.isInPlayablesEnv() === false, 'NotInPlayables: isInPlayablesEnv() is false in node/standalone');
assert(youtubeSdk.isAudioEnabled() === true, 'NotInPlayables: isAudioEnabled() returns true (not muted)');

// Simulate genuine YouTube Playables environment
(globalThis as unknown as { window: { ytgame: { IN_PLAYABLES_ENV: boolean; system: { isAudioEnabled: () => boolean; onAudioEnabledChange: () => void } } } }).window = {
  ytgame: {
    IN_PLAYABLES_ENV: true,
    system: {
      isAudioEnabled: () => false,
      onAudioEnabledChange: () => {},
    },
  },
};
assert(youtubeSdk.isInPlayablesEnv() === true, 'InPlayables: isInPlayablesEnv() detects ytgame.IN_PLAYABLES_ENV === true');
assert(youtubeSdk.isAudioEnabled() === false, 'InPlayables: isAudioEnabled() strictly respects platform mute');

// Cleanup and ensure audio scheduler stops so test exits cleanly
audioManager.pauseBgm();

console.log(`\nAudio Tests Results: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL AUDIO SYSTEM TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}
