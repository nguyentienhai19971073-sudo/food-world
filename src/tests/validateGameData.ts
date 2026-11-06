/**
 * Automated Verification Script for FOOD WORLD – Global Food Match
 * Validates integrity of all 120 levels, 42 countries, 168 dishes, and game logic.
 */

import { COUNTRIES, COUNTRY_MAP } from '../data/countries';
import { DISHES, DISH_MAP } from '../data/dishes';
import { LEVELS } from '../data/levels';
import { TRANSLATIONS } from '../localization/i18n';
import { Language } from '../types/game';

function runValidation() {
  console.log('--- STARTING FOOD WORLD GAME VERIFICATION ---');
  let errors = 0;

  // 1. Countries Check (>= 40 countries)
  console.log(`Checking countries count: found ${COUNTRIES.length} countries (minimum required: 40)...`);
  if (COUNTRIES.length < 40) {
    console.error(`FAIL: Expected >= 40 countries, found ${COUNTRIES.length}`);
    errors++;
  } else {
    console.log(`PASS: ${COUNTRIES.length} countries verified.`);
  }

  // 2. Dishes Check (>= 160 dishes)
  console.log(`Checking dishes count: found ${DISHES.length} dishes (minimum required: 160)...`);
  if (DISHES.length < 160) {
    console.error(`FAIL: Expected >= 160 dishes, found ${DISHES.length}`);
    errors++;
  } else {
    console.log(`PASS: ${DISHES.length} dishes verified.`);
  }

  // 3. Verify every dish belongs to a valid country in COUNTRIES
  console.log('Checking dish country affiliations...');
  DISHES.forEach((dish) => {
    if (!COUNTRY_MAP.has(dish.countryId)) {
      console.error(`FAIL: Dish ${dish.id} references invalid countryId ${dish.countryId}`);
      errors++;
    }
  });

  // 4. Verify all 120 levels can be completed (each level's dishes belong to its active countries)
  console.log(`Verifying all ${LEVELS.length} levels for completion validity...`);
  if (LEVELS.length !== 120) {
    console.error(`FAIL: Expected 120 levels, found ${LEVELS.length}`);
    errors++;
  }

  LEVELS.forEach((level) => {
    // Check countries in level
    level.countryIds.forEach((cid) => {
      if (!COUNTRY_MAP.has(cid)) {
        console.error(`FAIL: Level ${level.levelNumber} references invalid country ${cid}`);
        errors++;
      }
    });

    // Check dishes in level
    level.dishIds.forEach((did) => {
      const dish = DISH_MAP.get(did);
      if (!dish) {
        console.error(`FAIL: Level ${level.levelNumber} references missing dish ${did}`);
        errors++;
      } else {
        // Must belong to one of the level's active countries
        if (!level.countryIds.includes(dish.countryId)) {
          console.error(
            `FAIL: Level ${level.levelNumber} dish ${did} (${dish.countryId}) not in level countryIds [${level.countryIds.join(', ')}]`
          );
          errors++;
        }
      }
    });
  });

  // 5. Verify i18n support across all 6 languages
  const requiredLangs: Language[] = ['en', 'vi', 'ja', 'ko', 'es', 'fr'];
  console.log(`Checking i18n coverage across: ${requiredLangs.join(', ')}...`);
  requiredLangs.forEach((lang) => {
    const dict = TRANSLATIONS[lang];
    if (!dict) {
      console.error(`FAIL: Missing translations for language ${lang}`);
      errors++;
    } else {
      const sampleKeys = ['gameTitle', 'play', 'modes', 'collection', 'level', 'score'];
      sampleKeys.forEach((k) => {
        if (!dict[k]) {
          console.error(`FAIL: Missing key ${k} in language ${lang}`);
          errors++;
        }
      });
    }
  });

  console.log('--- VERIFICATION SUMMARY ---');
  if (errors === 0) {
    console.log('ALL TESTS PASSED! Game integrity verified successfully.');
    process.exit(0);
  } else {
    console.error(`COMPLETED WITH ${errors} ERRORS.`);
    process.exit(1);
  }
}

runValidation();
