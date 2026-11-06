/**
 * React Context & Provider for FOOD WORLD Localization (i18n)
 * Broadcasts language state changes so all active components re-render automatically.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { Language, Dish, Country, LevelConfig, LocalizedDish, LocalizedCountry } from '../types/game';
import { TRANSLATIONS, t as translateFn } from './i18n';
import { foodData } from '../data/foodData';

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (
    key: string,
    arg1?: Language | Record<string, string | number>,
    arg2?: Record<string, string | number>
  ) => string;
  getDishName: (dishOrId: Dish | LocalizedDish | string) => string;
  getDishDescription: (dishOrId: Dish | LocalizedDish | string) => string;
  getCountryName: (countryOrId: Country | LocalizedCountry | string) => string;
  getLevelTitle: (level: LevelConfig) => string;
  dishes: Dish[];
  countries: Country[];
  currentDishes: LocalizedDish[];
  currentCountries: LocalizedCountry[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  language,
  onLanguageChange,
  children,
}) => {
  const value = useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage: onLanguageChange,
      t: (
        key: string,
        arg1?: Language | Record<string, string | number>,
        arg2?: Record<string, string | number>
      ) => {
        let targetLang = language;
        let params: Record<string, string | number> | undefined;
        if (typeof arg1 === 'string') {
          targetLang = arg1 as Language;
          params = arg2;
        } else if (arg1 && typeof arg1 === 'object') {
          params = arg1;
        }
        return translateFn(key, targetLang, params);
      },
      getDishName: (dishOrId: Dish | LocalizedDish | string) => {
        if (!dishOrId) return '';
        if (typeof dishOrId === 'string') {
          const fromKey = translateFn(`dish_${dishOrId}_name`, language);
          if (fromKey !== `dish_${dishOrId}_name`) return fromKey;
          const dish = foodData.getDish(dishOrId);
          return dish?.name[language] || dish?.name.en || dishOrId;
        }
        if ('nameKey' in dishOrId && dishOrId.nameKey) {
          const fromKey = translateFn(dishOrId.nameKey, language);
          if (fromKey !== dishOrId.nameKey) return fromKey;
        }
        if (typeof dishOrId.name === 'string') return dishOrId.name;
        return dishOrId.name[language] || dishOrId.name.en || '';
      },
      getDishDescription: (dishOrId: Dish | LocalizedDish | string) => {
        if (!dishOrId) return '';
        if (typeof dishOrId === 'string') {
          const fromKey = translateFn(`dish_${dishOrId}_desc`, language);
          if (fromKey !== `dish_${dishOrId}_desc`) return fromKey;
          const dish = foodData.getDish(dishOrId);
          return dish?.description[language] || dish?.description.en || '';
        }
        if ('descKey' in dishOrId && dishOrId.descKey) {
          const fromKey = translateFn(dishOrId.descKey, language);
          if (fromKey !== dishOrId.descKey) return fromKey;
        }
        if (typeof dishOrId.description === 'string') return dishOrId.description;
        return dishOrId.description[language] || dishOrId.description.en || '';
      },
      getCountryName: (countryOrId: Country | LocalizedCountry | string) => {
        if (!countryOrId) return '';
        if (typeof countryOrId === 'string') {
          const fromKey = translateFn(`country_${countryOrId}_name`, language);
          if (fromKey !== `country_${countryOrId}_name`) return fromKey;
          const country = foodData.getCountry(countryOrId);
          return country?.name[language] || country?.name.en || countryOrId;
        }
        if ('nameKey' in countryOrId && countryOrId.nameKey) {
          const fromKey = translateFn(countryOrId.nameKey, language);
          if (fromKey !== countryOrId.nameKey) return fromKey;
        }
        if (typeof countryOrId.name === 'string') return countryOrId.name;
        return countryOrId.name[language] || countryOrId.name.en || '';
      },
      getLevelTitle: (level: LevelConfig) => {
        if (!level) return '';
        if (level.titleKey) {
          const res = translateFn(level.titleKey, language, { stage: level.stageInSector });
          if (res !== level.titleKey) return res;
        }
        return level.title?.[language] || level.title?.en || `Level ${level.levelNumber}`;
      },
      dishes: foodData.dishes,
      countries: foodData.countries,
      currentDishes: foodData.getDishesByLanguage(language),
      currentCountries: foodData.getCountriesByLanguage(language),
    };
  }, [language, onLanguageChange]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/**
 * Custom hook to consume localization context anywhere in the component tree
 */
export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Resilient fallback if consumed outside Provider (e.g. unit tests)
    const fallbackLang: Language = 'vi';
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: (
        key: string,
        arg1?: Language | Record<string, string | number>,
        arg2?: Record<string, string | number>
      ) => {
        let targetLang: Language = fallbackLang;
        let params: Record<string, string | number> | undefined;
        if (typeof arg1 === 'string') {
          targetLang = arg1 as Language;
          params = arg2;
        } else if (arg1 && typeof arg1 === 'object') {
          params = arg1;
        }
        return translateFn(key, targetLang, params);
      },
      getDishName: (dishOrId: Dish | LocalizedDish | string) => {
        if (!dishOrId) return '';
        if (typeof dishOrId === 'string') {
          const d = foodData.getDish(dishOrId);
          return d?.name.vi || d?.name.en || dishOrId;
        }
        if (typeof dishOrId.name === 'string') return dishOrId.name;
        return dishOrId.name.vi || dishOrId.name.en || '';
      },
      getDishDescription: (dishOrId: Dish | LocalizedDish | string) => {
        if (!dishOrId) return '';
        if (typeof dishOrId === 'string') {
          const d = foodData.getDish(dishOrId);
          return d?.description.vi || d?.description.en || '';
        }
        if (typeof dishOrId.description === 'string') return dishOrId.description;
        return dishOrId.description.vi || dishOrId.description.en || '';
      },
      getCountryName: (countryOrId: Country | LocalizedCountry | string) => {
        if (!countryOrId) return '';
        if (typeof countryOrId === 'string') {
          const c = foodData.getCountry(countryOrId);
          return c?.name.vi || c?.name.en || countryOrId;
        }
        if (typeof countryOrId.name === 'string') return countryOrId.name;
        return countryOrId.name.vi || countryOrId.name.en || '';
      },
      getLevelTitle: (l: LevelConfig) => l.title?.vi || l.title?.en || `Level ${l.levelNumber}`,
      dishes: foodData.dishes,
      countries: foodData.countries,
      currentDishes: foodData.getDishesByLanguage(fallbackLang),
      currentCountries: foodData.getCountriesByLanguage(fallbackLang),
    };
  }
  return ctx;
}
