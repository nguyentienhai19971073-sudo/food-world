/**
 * 120 Curated Dynamic Levels across 6 Sectors
 * Features:
 * - Dynamic Fisher-Yates Randomization of countries & dishes on every playthrough
 * - Random kiosk target positioning preventing muscle-memory exploits
 * - Rolling cooldown frequency tracking prioritizing fresh, unseen culinary dishes
 * - 100% Guaranteed solvable logic (all dishes strictly affiliated with on-screen countries)
 * - Sector progression & strict difficulty curves
 */

import { LevelConfig, Continent } from '../types/game';
import { DISHES, getDishesByCountry } from './dishes';
import { COUNTRIES } from './countries';

// =========================================================================
// FISHER-YATES SHUFFLE ALGORITHM
// =========================================================================
export function fisherYatesShuffle<T>(array: T[], seed?: number): T[] {
  const result = [...array];
  if (typeof seed === 'number' && !isNaN(seed)) {
    // Deterministic pseudo-random generator
    let s = (Math.abs(seed) * 1664525 + 1013904223) >>> 0;
    const nextRandom = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(nextRandom() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // True high-entropy Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// =========================================================================
// ROLLING COOLDOWN & FREQUENCY TRACKER
// Reduces repetitiveness and prioritizes dishes/countries not seen recently
// =========================================================================
const recentDishesQueue: string[] = [];
const recentCountriesQueue: string[] = [];
const MAX_RECENT_DISHES = 36;
const MAX_RECENT_COUNTRIES = 16;

export function recordRecentUsage(dishIds: string[], countryIds: string[]) {
  dishIds.forEach((id) => {
    recentDishesQueue.push(id);
    if (recentDishesQueue.length > MAX_RECENT_DISHES) {
      recentDishesQueue.shift();
    }
  });
  countryIds.forEach((id) => {
    recentCountriesQueue.push(id);
    if (recentCountriesQueue.length > MAX_RECENT_COUNTRIES) {
      recentCountriesQueue.shift();
    }
  });
}

export function clearRecentUsage() {
  recentDishesQueue.length = 0;
  recentCountriesQueue.length = 0;
}

// =========================================================================
// SECTOR COUNTRY POOLS
// =========================================================================
export const SECTOR_COUNTRY_POOLS: Record<Continent, string[]> = {
  asia: ['VN', 'JP', 'KR', 'TH', 'CN', 'IN', 'ID', 'MY', 'SG', 'PH', 'TR', 'TW'],
  europe: ['IT', 'FR', 'ES', 'DE', 'GB', 'GR', 'CH', 'PL', 'BE', 'UA', 'HU'],
  americas: ['US', 'MX', 'CA', 'BR', 'PE', 'AR', 'JM', 'CU'],
  africa: ['EG', 'MA', 'ZA', 'ET', 'NG', 'TN'],
  oceania: ['AU', 'NZ', 'FJ', 'WS', 'TO'],
  world: [
    'VN', 'JP', 'KR', 'TH', 'CN', 'IN', 'ID', 'MY', 'SG', 'PH', 'TR', 'TW',
    'IT', 'FR', 'ES', 'DE', 'GB', 'GR', 'CH', 'PL', 'BE', 'UA', 'HU',
    'US', 'MX', 'CA', 'BR', 'PE', 'AR', 'JM', 'CU',
    'EG', 'MA', 'ZA', 'ET', 'NG', 'TN',
    'AU', 'NZ', 'FJ', 'WS', 'TO'
  ],
};

// =========================================================================
// DYNAMIC LEVEL SPECIFICATION BUILDER
// =========================================================================
interface LevelParams {
  sector: Continent;
  stageInSector: number;
  countryCount: number;
  dishCount: number;
  timeLimit: number | null;
  maxMistakes: number | null;
  isConveyor: boolean;
  hasTutorial: boolean;
}

function getLevelParams(levelNumber: number): LevelParams {
  const clamped = Math.max(1, Math.min(120, Math.floor(levelNumber)));

  if (clamped <= 25) {
    // Sector 1: Asia (1 - 25)
    const stage = clamped;
    if (stage <= 5) {
      return {
        sector: 'asia',
        stageInSector: stage,
        countryCount: 2,
        dishCount: 4,
        timeLimit: null,
        maxMistakes: null,
        isConveyor: false,
        hasTutorial: stage === 1,
      };
    } else if (stage <= 10) {
      return {
        sector: 'asia',
        stageInSector: stage,
        countryCount: 2,
        dishCount: 6,
        timeLimit: null,
        maxMistakes: 4,
        isConveyor: false,
        hasTutorial: false,
      };
    } else if (stage <= 18) {
      return {
        sector: 'asia',
        stageInSector: stage,
        countryCount: 3,
        dishCount: 8,
        timeLimit: 90,
        maxMistakes: 3,
        isConveyor: false,
        hasTutorial: false,
      };
    } else {
      return {
        sector: 'asia',
        stageInSector: stage,
        countryCount: 4,
        dishCount: 10,
        timeLimit: 80,
        maxMistakes: 3,
        isConveyor: true,
        hasTutorial: false,
      };
    }
  } else if (clamped <= 50) {
    // Sector 2: Europe (26 - 50)
    const stage = clamped - 25;
    if (stage <= 5) {
      return {
        sector: 'europe',
        stageInSector: stage,
        countryCount: 2,
        dishCount: 6,
        timeLimit: 90,
        maxMistakes: 4,
        isConveyor: false,
        hasTutorial: false,
      };
    } else if (stage <= 15) {
      return {
        sector: 'europe',
        stageInSector: stage,
        countryCount: 3,
        dishCount: 8,
        timeLimit: 75,
        maxMistakes: 3,
        isConveyor: false,
        hasTutorial: false,
      };
    } else {
      return {
        sector: 'europe',
        stageInSector: stage,
        countryCount: 4,
        dishCount: 10,
        timeLimit: 70,
        maxMistakes: 3,
        isConveyor: true,
        hasTutorial: false,
      };
    }
  } else if (clamped <= 70) {
    // Sector 3: Americas (51 - 70)
    const stage = clamped - 50;
    if (stage <= 5) {
      return {
        sector: 'americas',
        stageInSector: stage,
        countryCount: 2,
        dishCount: 6,
        timeLimit: 85,
        maxMistakes: 3,
        isConveyor: false,
        hasTutorial: false,
      };
    } else if (stage <= 15) {
      return {
        sector: 'americas',
        stageInSector: stage,
        countryCount: 3,
        dishCount: 8,
        timeLimit: 75,
        maxMistakes: 3,
        isConveyor: false,
        hasTutorial: false,
      };
    } else {
      return {
        sector: 'americas',
        stageInSector: stage,
        countryCount: 4,
        dishCount: 10,
        timeLimit: 65,
        maxMistakes: 2,
        isConveyor: true,
        hasTutorial: false,
      };
    }
  } else if (clamped <= 85) {
    // Sector 4: Africa (71 - 85)
    const stage = clamped - 70;
    if (stage <= 5) {
      return {
        sector: 'africa',
        stageInSector: stage,
        countryCount: 2,
        dishCount: 6,
        timeLimit: 80,
        maxMistakes: 3,
        isConveyor: false,
        hasTutorial: false,
      };
    } else {
      return {
        sector: 'africa',
        stageInSector: stage,
        countryCount: 3,
        dishCount: 8,
        timeLimit: 70,
        maxMistakes: 2,
        isConveyor: stage >= 10,
        hasTutorial: false,
      };
    }
  } else if (clamped <= 100) {
    // Sector 5: Oceania (86 - 100)
    const stage = clamped - 85;
    if (stage <= 5) {
      return {
        sector: 'oceania',
        stageInSector: stage,
        countryCount: 2,
        dishCount: 6,
        timeLimit: 80,
        maxMistakes: 3,
        isConveyor: false,
        hasTutorial: false,
      };
    } else {
      return {
        sector: 'oceania',
        stageInSector: stage,
        countryCount: 3,
        dishCount: 8,
        timeLimit: 70,
        maxMistakes: 2,
        isConveyor: stage >= 10,
        hasTutorial: false,
      };
    }
  } else {
    // Sector 6: World Tour Challenge (101 - 120)
    const stage = clamped - 100;
    if (stage <= 10) {
      return {
        sector: 'world',
        stageInSector: stage,
        countryCount: 4,
        dishCount: 10,
        timeLimit: 65,
        maxMistakes: 2,
        isConveyor: true,
        hasTutorial: false,
      };
    } else {
      return {
        sector: 'world',
        stageInSector: stage,
        countryCount: 5,
        dishCount: 12,
        timeLimit: 60,
        maxMistakes: 2,
        isConveyor: true,
        hasTutorial: false,
      };
    }
  }
}

// =========================================================================
// MAIN DYNAMIC GENERATOR
// =========================================================================
export function generateDynamicLevel(
  levelNumber: number,
  options?: { seed?: number; recordUsage?: boolean }
): LevelConfig {
  const params = getLevelParams(levelNumber);
  const countryPool = SECTOR_COUNTRY_POOLS[params.sector];

  // 1. SELECT COUNTRIES WITH FREQUENCY WEIGHTING & JITTER
  const scoredCountries = countryPool.map((cid) => {
    // Penalty if in recent queue
    const recentIdx = recentCountriesQueue.lastIndexOf(cid);
    const penalty = recentIdx === -1 ? 0 : (recentIdx + 1) * 3;
    const randomJitter = typeof options?.seed === 'number'
      ? ((options.seed * 17 + cid.charCodeAt(0)) % 10)
      : Math.random() * 12;

    return {
      cid,
      score: randomJitter - penalty,
    };
  });

  scoredCountries.sort((a, b) => b.score - a.score);
  const pickedCountryIds = scoredCountries
    .slice(0, params.countryCount)
    .map((item) => item.cid);

  // Randomize the order of chosen countries so kiosks appear in random board positions
  const randomizedCountryIds = fisherYatesShuffle(pickedCountryIds, options?.seed);

  // 2. SELECT DISHES STRICTLY AFFILIATED WITH RANDOMIZED COUNTRIES
  const selectedDishIds: string[] = [];

  // Guarantee: Each active country gets at least 1 dish
  randomizedCountryIds.forEach((cid) => {
    const candidateDishes = getDishesByCountry(cid);
    if (candidateDishes.length > 0) {
      // Pick the least recently used dish for this country
      const scoredDishes = candidateDishes.map((d) => {
        const recentIdx = recentDishesQueue.lastIndexOf(d.id);
        const penalty = recentIdx === -1 ? 0 : (recentIdx + 1) * 3;
        const randomJitter = typeof options?.seed === 'number'
          ? ((options.seed * 31 + d.id.charCodeAt(0)) % 10)
          : Math.random() * 10;
        return { dish: d, score: randomJitter - penalty };
      });
      scoredDishes.sort((a, b) => b.score - a.score);
      selectedDishIds.push(scoredDishes[0].dish.id);
    }
  });

  // Collect all candidate dishes for the chosen countries
  const allAvailableDishes: string[] = [];
  randomizedCountryIds.forEach((cid) => {
    getDishesByCountry(cid).forEach((d) => {
      if (!allAvailableDishes.includes(d.id)) {
        allAvailableDishes.push(d.id);
      }
    });
  });

  // Score remaining candidate dishes
  const remainingCandidates = allAvailableDishes.filter(
    (did) => !selectedDishIds.includes(did)
  );

  const scoredCandidates = remainingCandidates.map((did) => {
    const recentIdx = recentDishesQueue.lastIndexOf(did);
    const penalty = recentIdx === -1 ? 0 : (recentIdx + 1) * 3;
    const randomJitter = typeof options?.seed === 'number'
      ? ((options.seed * 47 + did.charCodeAt(0)) % 10)
      : Math.random() * 10;
    return { id: did, score: randomJitter - penalty };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);

  // Fill up to target dishCount with unique candidates
  for (const item of scoredCandidates) {
    if (selectedDishIds.length >= params.dishCount) break;
    selectedDishIds.push(item.id);
  }

  // If level requires more dishes than unique dishes in active countries, cycle through available pool
  let fallbackIdx = 0;
  while (selectedDishIds.length < params.dishCount && allAvailableDishes.length > 0) {
    selectedDishIds.push(allAvailableDishes[fallbackIdx % allAvailableDishes.length]);
    fallbackIdx++;
  }

  // 3. SHUFFLE DISHES USING FISHER-YATES
  const randomizedDishIds = fisherYatesShuffle(selectedDishIds, options?.seed);

  // 4. RECORD TO RECENT USAGE QUEUES (Default: true)
  if (options?.recordUsage !== false) {
    recordRecentUsage(randomizedDishIds, randomizedCountryIds);
  }

  // 5. COMPOSE LOCALIZED TITLES & TARGET SCORES
  const targetScore = params.dishCount * 100;

  const sectorTitlePrefixes: Record<Continent, { en: string; vi: string; ja: string; ko: string; es: string; fr: string }> = {
    asia: { en: 'Asia', vi: 'Châu Á', ja: 'アジア', ko: '아시아', es: 'Asia', fr: 'Asie' },
    europe: { en: 'Europe', vi: 'Châu Âu', ja: 'ヨーロッパ', ko: '유럽', es: 'Europa', fr: 'Europe' },
    americas: { en: 'Americas', vi: 'Châu Mỹ', ja: 'アメリカ', ko: '아메리카', es: 'América', fr: 'Amériques' },
    africa: { en: 'Africa', vi: 'Châu Phi', ja: 'アフリカ', ko: '아프리카', es: 'África', fr: 'Afrique' },
    oceania: { en: 'Oceania', vi: 'Đại Dương', ja: 'オセアニア', ko: '오세아니아', es: 'Oceanía', fr: 'Océanie' },
    world: { en: 'World Tour', vi: 'Thế Giới', ja: 'ワールド', ko: '월드 투어', es: 'Mundial', fr: 'Mondial' },
  };

  const prefix = sectorTitlePrefixes[params.sector];

  return {
    levelNumber,
    sector: params.sector,
    titleKey: `levelTitleKey_${params.sector}`,
    stageInSector: params.stageInSector,
    title: {
      en: `${prefix.en} Stage ${params.stageInSector}`,
      vi: `${prefix.vi} Màn ${params.stageInSector}`,
      ja: `${prefix.ja} ステージ ${params.stageInSector}`,
      ko: `${prefix.ko} 스테이지 ${params.stageInSector}`,
      es: `${prefix.es} Nivel ${params.stageInSector}`,
      fr: `${prefix.fr} Étape ${params.stageInSector}`,
    },
    countryIds: randomizedCountryIds,
    dishIds: randomizedDishIds,
    timeLimitSeconds: params.timeLimit,
    maxMistakes: params.maxMistakes,
    targetScore,
    starThresholds: [
      Math.floor(targetScore * 0.7),
      Math.floor(targetScore * 0.9),
      Math.floor(targetScore * 1.2),
    ],
    isConveyor: params.isConveyor,
    hasTutorial: params.hasTutorial,
  };
}

// Generate base static blueprint of all 120 levels (for level select previews & catalog)
export function generateAllLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];
  for (let i = 1; i <= 120; i++) {
    levels.push(generateDynamicLevel(i, { seed: i * 1337, recordUsage: false }));
  }
  return levels;
}

export const LEVELS = generateAllLevels();

// Live dynamic level getter: Produces a fresh randomized variation on every call
export function getLevel(levelNumber: number): LevelConfig {
  return generateDynamicLevel(levelNumber);
}

export function getLevelsBySector(sector: Continent): LevelConfig[] {
  return LEVELS.filter((l) => l.sector === sector);
}
