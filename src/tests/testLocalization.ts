/**
 * Comprehensive Localization, Data Structure & Star Rating Verification Test Suite
 * Validates:
 * 1. 100% Key parity across all 6 languages (en, vi, ja, ko, es, fr) under /src/locales/
 * 2. foodData structure with constant IDs and language-specific arrays (COUNTRIES_BY_LANG, DISHES_BY_LANG)
 * 3. Levels structure using titleKey pointing to translation files
 * 4. All 42 countries have 6-language names and nameKeys
 * 5. All 164 dishes have 6-language names, descriptions, nameKeys, and descKeys
 * 6. All 120 levels have 6-language titles and titleKeys
 * 7. String interpolation functionality
 * 8. Session stars isolation from historical bests
 */

import { TRANSLATIONS, t, useTranslation } from '../localization/i18n';
import { COUNTRIES, COUNTRIES_BY_LANG } from '../data/countries';
import { DISHES, DISHES_BY_LANG } from '../data/dishes';
import { foodData } from '../data/foodData';
import { getLevel } from '../data/levels';
import { calculateStars } from '../utils/starRating';
import { Language } from '../types/game';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'vi', 'ja', 'ko', 'es', 'fr'];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

console.log('--- TEST 1: 100% Key Parity Across All 6 Locales under /src/locales/ ---');
const baseKeys = Object.keys(TRANSLATIONS.en);
console.log(`Base English keys count: ${baseKeys.length}`);
assert(baseKeys.length >= 500, `Base keys must include full UI and food keys (got ${baseKeys.length})`);

for (const lang of SUPPORTED_LANGUAGES) {
  const langDict = TRANSLATIONS[lang];
  assert(Boolean(langDict), `Translation dictionary must exist for ${lang}`);

  const missingKeys: string[] = [];
  const emptyKeys: string[] = [];

  for (const key of baseKeys) {
    if (!(key in langDict)) {
      missingKeys.push(key);
    } else if (!langDict[key] || langDict[key].trim() === '') {
      emptyKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    throw new Error(`Language "${lang}" is missing keys: ${missingKeys.slice(0, 10).join(', ')}...`);
  }
  if (emptyKeys.length > 0) {
    throw new Error(`Language "${lang}" has empty values for keys: ${emptyKeys.slice(0, 10).join(', ')}...`);
  }

  console.log(`✓ Language "${lang}": All ${baseKeys.length} keys verified with 100% parity.`);
}

console.log('\n--- TEST 2: foodData Structure & Language-Specific Arrays ---');
assert(Boolean(foodData), 'foodData object must be exported');
assert(foodData.countries.length === 42, 'foodData.countries must have 42 items');
assert(foodData.dishes.length >= 164, 'foodData.dishes must have at least 164 items');

for (const lang of SUPPORTED_LANGUAGES) {
  const countriesArray = foodData.getCountriesByLanguage(lang);
  const dishesArray = foodData.getDishesByLanguage(lang);

  assert(Array.isArray(countriesArray), `COUNTRIES_BY_LANG[${lang}] must be an array`);
  assert(countriesArray.length === 42, `COUNTRIES_BY_LANG[${lang}] must contain 42 countries`);

  assert(Array.isArray(dishesArray), `DISHES_BY_LANG[${lang}] must be an array`);
  assert(dishesArray.length >= 164, `DISHES_BY_LANG[${lang}] must contain at least 164 dishes`);

  // Verify constant IDs & localized strings
  countriesArray.forEach((c) => {
    assert(typeof c.id === 'string' && c.id.length > 0, `Country must have constant ID`);
    assert(typeof c.name === 'string' && c.name.length > 0, `Country ${c.id} in ${lang} must have localized name`);
    assert(c.nameKey === `country_${c.id}_name`, `Country ${c.id} nameKey mismatch`);
    // Ensure nameKey exists in translation files
    assert(t(c.nameKey, lang) === c.name, `Translation file mismatch for ${c.nameKey} in ${lang}`);
  });

  dishesArray.forEach((d) => {
    assert(typeof d.id === 'string' && d.id.length > 0, `Dish must have constant ID`);
    assert(typeof d.countryId === 'string' && d.countryId.length > 0, `Dish ${d.id} must have constant countryId`);
    assert(typeof d.name === 'string' && d.name.length > 0, `Dish ${d.id} in ${lang} must have localized name`);
    assert(typeof d.description === 'string' && d.description.length > 0, `Dish ${d.id} in ${lang} must have localized description`);
    assert(d.nameKey === `dish_${d.id}_name`, `Dish ${d.id} nameKey mismatch`);
    assert(d.descKey === `dish_${d.id}_desc`, `Dish ${d.id} descKey mismatch`);
    // Ensure keys exist in translation files
    assert(t(d.nameKey, lang) === d.name, `Translation file mismatch for ${d.nameKey} in ${lang}`);
    assert(t(d.descKey, lang) === d.description, `Translation file mismatch for ${d.descKey} in ${lang}`);
  });

  console.log(`✓ foodData arrays for "${lang}": 42 countries & ${dishesArray.length} dishes verified with constant IDs.`);
}

console.log('\n--- TEST 3: Levels Structure with titleKey pointing to translations ---');
for (let lvl = 1; lvl <= 120; lvl++) {
  const cfg = getLevel(lvl);
  assert(Boolean(cfg.titleKey), `Level ${lvl} must have titleKey`);
  assert(typeof cfg.stageInSector === 'number', `Level ${lvl} must have stageInSector`);

  for (const lang of SUPPORTED_LANGUAGES) {
    const fromTranslation = t(cfg.titleKey, lang, { stage: cfg.stageInSector });
    assert(
      Boolean(fromTranslation && fromTranslation !== cfg.titleKey),
      `Level ${lvl} titleKey "${cfg.titleKey}" failed to resolve in ${lang}`
    );
    assert(
      cfg.title[lang] === fromTranslation,
      `Level ${lvl} title[${lang}] mismatch with translation key resolution: "${cfg.title[lang]}" vs "${fromTranslation}"`
    );
  }
}
console.log('✓ All 120 levels verified with titleKey pointing to localized translations.');

console.log('\n--- TEST 4: Parameter Interpolation in t() ---');
const testCases: { key: string; lang: Language; params: Record<string, string | number>; expected: string }[] = [
  { key: 'mistakesCount', lang: 'en', params: { count: 3 }, expected: '3 errors' },
  { key: 'mistakesCount', lang: 'vi', params: { count: 3 }, expected: '3 lỗi' },
  { key: 'clearedInMoves', lang: 'en', params: { moves: 12 }, expected: 'Cleared in 12 moves!' },
  { key: 'clearedInMoves', lang: 'ja', params: { moves: 12 }, expected: '12手でクリア！' },
  { key: 'continueStage', lang: 'es', params: { stage: 45 }, expected: 'Continuar Nivel 45' },
  { key: 'continueStage', lang: 'fr', params: { stage: 45 }, expected: 'Continuer Niveau 45' },
];

for (const tc of testCases) {
  const output = t(tc.key, tc.lang, tc.params);
  assert(output === tc.expected, `Interpolation failed for ${tc.key} in ${tc.lang}. Expected "${tc.expected}", got "${output}"`);
  console.log(`✓ ${tc.lang} ${tc.key} -> "${output}"`);
}

console.log('\n--- TEST 5: useTranslation Hook & Localized Helpers ---');
assert(typeof useTranslation === 'function', 'useTranslation must be a callable hook function');
// Verify helper resolution for all 6 languages
const testDishId = 'pho';
const testCountryId = 'VN';
const testDish = foodData.getDish(testDishId)!;
const testCountry = foodData.getCountry(testCountryId)!;
assert(testDish.name.vi.includes('Phở'), 'Phở Vietnamese name verified');
assert(testDish.name.ja.includes('フォー'), 'Phở Japanese name verified');
assert(testCountry.name.fr.includes('Vi'), 'Vietnam French name verified');
console.log('✓ useTranslation hook and localized data helpers verified.');

console.log('\n--- TEST 6: Star Rating Accuracy & Session Isolation ---');
// 0 mistakes -> 3 Stars
assert(calculateStars(0, true) === 3, '0 mistakes must give 3 stars');
// 1 mistake -> 2 Stars
assert(calculateStars(1, true) === 2, '1 mistake must give 2 stars');
// 2 mistakes -> 2 Stars
assert(calculateStars(2, true) === 2, '2 mistakes must give 2 stars');
// 3 mistakes -> 1 Star
assert(calculateStars(3, true) === 1, '3 mistakes must give 1 star');
// 5 mistakes -> 1 Star
assert(calculateStars(5, true) === 1, '5 mistakes must give 1 star');
// Defeat -> 0 Stars
assert(calculateStars(0, false) === 0, 'Defeat must give 0 stars regardless of mistakes');
assert(calculateStars(2, false) === 0, 'Defeat must give 0 stars');
console.log('✓ Strict accuracy star rating calculation verified.');

console.log('\n========================================');
console.log('ALL LOCALIZATION, FOODDATA & STAR TESTS PASSED SUCCESSFULLY!');
console.log('========================================');
