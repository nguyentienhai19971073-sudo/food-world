/**
 * Core Game Types for FOOD WORLD – Global Food Match
 */

export type Continent = 'asia' | 'europe' | 'americas' | 'africa' | 'oceania' | 'world';

export type Language = 'en' | 'vi' | 'ja' | 'ko' | 'es' | 'fr';

export type GameMode = 'classic' | 'time_attack' | 'food_memory' | 'endless';

export interface LocalizedCountry {
  id: string; // e.g., 'VN', 'JP', 'IT' (constant ID)
  code: string;
  nameKey: string; // e.g., 'country_VN_name'
  name: string; // Localized for target language
  continent: Continent;
  flagEmoji: string;
  capital: string;
  color: string;
}

export interface Country {
  id: string; // e.g., 'VN', 'JP', 'IT' (constant ID)
  code: string;
  nameKey?: string; // e.g., 'country_VN_name'
  name: Record<Language, string>;
  continent: Continent;
  flagEmoji: string;
  capital: string;
  color: string; // Accent color for the country basket/plate
}

export interface LocalizedDish {
  id: string; // e.g., 'pho', 'sushi' (constant ID)
  nameKey: string; // e.g., 'dish_pho_name'
  descKey: string; // e.g., 'dish_pho_desc'
  name: string; // Localized for target language
  countryId: string; // references Country.id (constant ID)
  continent: Continent;
  description: string;
  difficulty: 1 | 2 | 3;
  iconType: string;
  tags: string[];
}

export interface Dish {
  id: string; // e.g., 'pho', 'sushi' (constant ID)
  nameKey?: string; // e.g., 'dish_pho_name'
  descKey?: string; // e.g., 'dish_pho_desc'
  name: Record<Language, string>;
  countryId: string; // references Country.id (constant ID)
  continent: Continent;
  description: Record<Language, string>;
  difficulty: 1 | 2 | 3; // 1 = Easy/Famous, 2 = Intermediate, 3 = Expert/Delicacy
  iconType: string; // Vector illustration key
  tags: string[];
}

export interface LevelConfig {
  levelNumber: number; // 1 to 120
  sector: Continent;
  titleKey: string; // Localization key e.g., 'levelTitleKey_asia'
  stageInSector: number; // 1 to 25
  title: Record<Language, string>;
  countryIds: string[]; // countries active in this level
  dishIds: string[]; // dishes to be served
  timeLimitSeconds: number | null; // null = relaxed / no limit
  maxMistakes: number | null; // null = unlimited, or integer like 3
  targetScore: number;
  starThresholds: [number, number, number]; // points for 1, 2, 3 stars
  isConveyor?: boolean; // moves on conveyor belt
  hasTutorial?: boolean;
}

export interface UserProgress {
  version: number;
  unlockedLevels: number; // Highest level reached (1-120)
  levelScores: Record<number, { score: number; stars: number; clearedAt: number }>;
  unlockedFoodIds: string[];
  passportStamps: string[]; // countryIds that earned their official passport stamp (e.g. ['VN', 'JP'])
  countryMastery: Record<string, string[]>; // countryId -> unique dishIds correctly matched
  highScores: {
    timeAttack60: number;
    timeAttack120: number;
    endlessScore: number;
    foodMemoryMaxScore: number;
    speedChallengeMaxScore: number;
  };
  totalDishesMatched: number;
  totalPerfectLevels: number;
  settings: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicVolume?: number; // 0.0 to 1.0 (default 0.7)
    sfxVolume?: number;   // 0.0 to 1.0 (default 0.8)
    language: Language;
    vibrationEnabled: boolean;
    reducedMotion?: boolean;
  };
}

export interface ActiveDishCard {
  instanceId: string;
  dishId: string;
  dish: Dish;
  status: 'idle' | 'dragging' | 'matched' | 'wrong' | 'cleared';
  x?: number;
  y?: number;
}
