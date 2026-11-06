/**
 * Automated Verification Suite for ComboSystem and Bronze -> Silver -> Gold Scaling
 */

import {
  getComboTier,
  getComboScale,
  getComboBonus,
  COMBO_TIER_CONFIGS,
  useComboSystem,
  ComboSystem,
} from '../hooks/useComboSystem';
import en from '../locales/en.json';
import vi from '../locales/vi.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

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

console.log('--- Testing FOOD WORLD ComboSystem & Tier Progression ---');

// 1. Hook availability
assert(typeof useComboSystem === 'function', 'useComboSystem is a function');
assert(typeof ComboSystem === 'function', 'ComboSystem alias is exported');

// 2. Tier classification (Bronze -> Silver -> Gold)
assert(getComboTier(0) === 'none', 'Combo 0 is none');
assert(getComboTier(1) === 'none', 'Combo 1 is none');
assert(getComboTier(2) === 'bronze', 'Combo 2 is bronze');
assert(getComboTier(3) === 'bronze', 'Combo 3 is bronze');
assert(getComboTier(4) === 'bronze', 'Combo 4 is bronze');
assert(getComboTier(5) === 'silver', 'Combo 5 is silver');
assert(getComboTier(6) === 'silver', 'Combo 6 is silver');
assert(getComboTier(7) === 'silver', 'Combo 7 is silver');
assert(getComboTier(8) === 'gold', 'Combo 8 is gold');
assert(getComboTier(9) === 'gold', 'Combo 9 is gold');
assert(getComboTier(12) === 'gold', 'Combo 12 is gold');

// 3. Progressive Scale Factor (Scaling Up)
const scale0 = getComboScale(0);
const scale2 = getComboScale(2);
const scale3 = getComboScale(3);
const scale4 = getComboScale(4);
const scale5 = getComboScale(5);
const scale6 = getComboScale(6);
const scale7 = getComboScale(7);
const scale8 = getComboScale(8);
const scale10 = getComboScale(10);

assert(scale0 === 1.0, 'Scale 0 is 1.0');
assert(scale2 >= 1.05 && scale2 < scale3, 'Bronze scale increases: scale(2) < scale(3)');
assert(scale3 < scale4, 'Bronze scale increases: scale(3) < scale(4)');
assert(scale4 < scale5, 'Bronze to Silver transition scales up: scale(4) < scale(5)');
assert(scale5 < scale6, 'Silver scale increases: scale(5) < scale(6)');
assert(scale6 < scale7, 'Silver scale increases: scale(6) < scale(7)');
assert(scale7 < scale8, 'Silver to Gold transition scales up: scale(7) < scale(8)');
assert(scale8 < scale10, 'Gold scale increases further with high combos');

console.log(`✓ Progressive scaling verified: Bronze(${scale2.toFixed(2)}x - ${scale4.toFixed(2)}x) -> Silver(${scale5.toFixed(2)}x - ${scale7.toFixed(2)}x) -> Gold(${scale8.toFixed(2)}x - ${scale10.toFixed(2)}x)`);

// 4. Bonus scoring formula
assert(getComboBonus(0) === 0, 'Bonus 0 is 0');
assert(getComboBonus(1) === 0, 'Bonus 1 is 0');
assert(getComboBonus(2) === 50, 'Bonus 2 is 50');
assert(getComboBonus(3) === 75, 'Bonus 3 is 75');
assert(getComboBonus(4) === 100, 'Bonus 4 is 100');
assert(getComboBonus(5) === 125, 'Bonus 5 is 125');
assert(getComboBonus(8) === 200, 'Bonus 8 is 200');
assert(getComboBonus(10) === 250, 'Bonus 10 is 250');
assert(getComboBonus(20) === 250, 'Bonus 20 is capped at 250');

// 5. Tier Configurations
const tiers: ('none' | 'bronze' | 'silver' | 'gold')[] = ['none', 'bronze', 'silver', 'gold'];
for (const t of tiers) {
  const cfg = COMBO_TIER_CONFIGS[t];
  assert(Boolean(cfg), `Configuration exists for tier "${t}"`);
  assert(Boolean(cfg.bgGradient), `Background gradient exists for tier "${t}"`);
  assert(Boolean(cfg.borderColor), `Border color exists for tier "${t}"`);
  assert(Boolean(cfg.badgeEmoji), `Badge emoji exists for tier "${t}"`);
}

// 6. Localization Keys Check across all 6 languages
const locales = [
  { code: 'en', data: en },
  { code: 'vi', data: vi },
  { code: 'ja', data: ja },
  { code: 'ko', data: ko },
  { code: 'es', data: es },
  { code: 'fr', data: fr },
];

for (const loc of locales) {
  assert(Boolean((loc.data as Record<string, string>)['bronzeCombo']), `${loc.code} has bronzeCombo`);
  assert(Boolean((loc.data as Record<string, string>)['silverCombo']), `${loc.code} has silverCombo`);
  assert(Boolean((loc.data as Record<string, string>)['goldCombo']), `${loc.code} has goldCombo`);
}

console.log(`\nComboSystem Tests Results: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL COMBOSYSTEM TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}
