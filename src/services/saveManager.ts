/**
 * Save Manager
 * Handles local & cloud persistence through YouTube Playables SDK
 */

import { UserProgress } from '../types/game';
import { youtubeSdk } from './youtubeSdk';

const CURRENT_SAVE_VERSION = 1;

export const DEFAULT_USER_PROGRESS: UserProgress = {
  version: CURRENT_SAVE_VERSION,
  unlockedLevels: 1, // Start with Level 1 unlocked
  levelScores: {},
  unlockedFoodIds: ['pho', 'sushi', 'pizza', 'taco', 'croissant'], // Starter foods
  passportStamps: [], // Stamped countries
  countryMastery: {}, // countryId -> matched dishes
  highScores: {
    timeAttack60: 0,
    timeAttack120: 0,
    endlessScore: 0,
    foodMemoryMaxScore: 0,
    speedChallengeMaxScore: 0,
  },
  totalDishesMatched: 0,
  totalPerfectLevels: 0,
  settings: {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    language: 'vi',
    vibrationEnabled: true,
    reducedMotion: false,
  },
};

class SaveManager {
  private currentProgress: UserProgress = { ...DEFAULT_USER_PROGRESS };
  private isLoaded = false;

  constructor() {
    this.hydrateFromLocalSync();
  }

  private hydrateFromLocalSync() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('food_world_save_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this.currentProgress = {
              ...DEFAULT_USER_PROGRESS,
              ...parsed,
              passportStamps: Array.isArray(parsed.passportStamps) ? parsed.passportStamps : [],
              countryMastery: (parsed.countryMastery && typeof parsed.countryMastery === 'object') ? parsed.countryMastery : {},
              settings: {
                ...DEFAULT_USER_PROGRESS.settings,
                ...(parsed.settings || {}),
              },
              highScores: {
                ...DEFAULT_USER_PROGRESS.highScores,
                ...(parsed.highScores || {}),
              },
              levelScores: parsed.levelScores || {},
              unlockedFoodIds: Array.isArray(parsed.unlockedFoodIds)
                ? Array.from(new Set([...DEFAULT_USER_PROGRESS.unlockedFoodIds, ...parsed.unlockedFoodIds]))
                : DEFAULT_USER_PROGRESS.unlockedFoodIds,
            };
          }
        }
      }
    } catch {
      // ignore
    }
  }

  public async load(): Promise<UserProgress> {
    if (this.isLoaded) {
      return this.currentProgress;
    }

    try {
      const rawData = await youtubeSdk.loadData();
      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (parsed && typeof parsed === 'object') {
          this.currentProgress = {
            ...DEFAULT_USER_PROGRESS,
            ...parsed,
            passportStamps: Array.isArray(parsed.passportStamps) ? parsed.passportStamps : [],
            countryMastery: (parsed.countryMastery && typeof parsed.countryMastery === 'object') ? parsed.countryMastery : {},
            settings: {
              ...DEFAULT_USER_PROGRESS.settings,
              ...(parsed.settings || {}),
            },
            highScores: {
              ...DEFAULT_USER_PROGRESS.highScores,
              ...(parsed.highScores || {}),
            },
            levelScores: parsed.levelScores || {},
            unlockedFoodIds: Array.isArray(parsed.unlockedFoodIds)
              ? Array.from(new Set([...DEFAULT_USER_PROGRESS.unlockedFoodIds, ...parsed.unlockedFoodIds]))
              : DEFAULT_USER_PROGRESS.unlockedFoodIds,
          };
        }
      }
    } catch (e) {
      console.warn('Error reading player save data:', e);
    }

    this.isLoaded = true;
    return this.currentProgress;
  }

  public getProgress(): UserProgress {
    return this.currentProgress;
  }

  public async save(newProgress: Partial<UserProgress>): Promise<void> {
    this.currentProgress = {
      ...this.currentProgress,
      ...newProgress,
    };

    try {
      const serialized = JSON.stringify(this.currentProgress);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('food_world_save_data', serialized);
      }
      await youtubeSdk.saveData(serialized);
    } catch (e) {
      console.warn('Failed to save user data:', e);
    }
  }

  public async unlockFood(foodId: string): Promise<boolean> {
    if (!this.currentProgress.unlockedFoodIds.includes(foodId)) {
      const updated = [...this.currentProgress.unlockedFoodIds, foodId];
      await this.save({ unlockedFoodIds: updated });
      return true; // was newly unlocked
    }
    return false;
  }

  /**
   * Tracks a successful dish match for Country Mastery and Food Collection.
   * Returns metadata indicating if a new food was unlocked or a new passport stamp was earned.
   */
  public async recordDishMatch(
    dishId: string,
    countryId: string,
    countryTotalDishesCount: number
  ): Promise<{
    isNewFood: boolean;
    isNewStamp: boolean;
    masteredDishesCount: number;
    masteryTarget: number;
  }> {
    const isNewFood = !this.currentProgress.unlockedFoodIds.includes(dishId);
    let updatedUnlockedFoods = this.currentProgress.unlockedFoodIds;
    if (isNewFood) {
      updatedUnlockedFoods = [...this.currentProgress.unlockedFoodIds, dishId];
    }

    // Update country mastery set
    const currentDishesForCountry = this.currentProgress.countryMastery[countryId] || [];
    let updatedCountryDishes = currentDishesForCountry;
    if (!currentDishesForCountry.includes(dishId)) {
      updatedCountryDishes = [...currentDishesForCountry, dishId];
    }

    // Realistic target: min(3, country total dishes) or all if <= 2
    const masteryTarget = Math.max(1, Math.min(3, countryTotalDishesCount));
    const isMasteryReached = updatedCountryDishes.length >= masteryTarget;

    let isNewStamp = false;
    let updatedStamps = this.currentProgress.passportStamps || [];
    if (isMasteryReached && !updatedStamps.includes(countryId)) {
      updatedStamps = [...updatedStamps, countryId];
      isNewStamp = true;
    }

    await this.save({
      unlockedFoodIds: updatedUnlockedFoods,
      passportStamps: updatedStamps,
      countryMastery: {
        ...this.currentProgress.countryMastery,
        [countryId]: updatedCountryDishes,
      },
      totalDishesMatched: this.currentProgress.totalDishesMatched + 1,
    });

    return {
      isNewFood,
      isNewStamp,
      masteredDishesCount: updatedCountryDishes.length,
      masteryTarget,
    };
  }

  public async recordSpeedChallengeScore(score: number): Promise<{ isNewHighScore: boolean; bestScore: number }> {
    const prevBest = this.currentProgress.highScores.speedChallengeMaxScore || 0;
    const isNewHighScore = score > prevBest;
    const newBest = Math.max(prevBest, score);

    if (isNewHighScore) {
      await this.save({
        highScores: {
          ...this.currentProgress.highScores,
          speedChallengeMaxScore: newBest,
        },
      });
      youtubeSdk.sendScore(newBest);
    }

    return { isNewHighScore, bestScore: newBest };
  }

  public async recordLevelComplete(levelNumber: number, score: number, stars: number): Promise<void> {
    const existing = this.currentProgress.levelScores[levelNumber];
    const prevBestScore = existing?.score || 0;
    const prevBestStars = existing?.stars || 0;

    const newBestScore = Math.max(prevBestScore, score);
    const newBestStars = Math.max(prevBestStars, stars);

    const levelScores = {
      ...this.currentProgress.levelScores,
      [levelNumber]: {
        score: newBestScore,
        stars: newBestStars,
        clearedAt: Date.now(),
      },
    };

    const nextLevel = Math.min(120, Math.max(this.currentProgress.unlockedLevels, levelNumber + 1));
    const totalPerfect = (stars === 3 && prevBestStars < 3) 
      ? this.currentProgress.totalPerfectLevels + 1 
      : this.currentProgress.totalPerfectLevels;

    await this.save({
      levelScores,
      unlockedLevels: nextLevel,
      totalPerfectLevels: totalPerfect,
    });

    // Report to YouTube
    youtubeSdk.sendScore(newBestScore);
  }

  public async resetProgress(): Promise<void> {
    this.currentProgress = { ...DEFAULT_USER_PROGRESS };
    await this.save(this.currentProgress);
  }
}

export const saveManager = new SaveManager();
