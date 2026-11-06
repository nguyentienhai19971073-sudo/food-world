/**
 * Unified Food & Country Data Hub (foodData)
 * Provides constant-ID culinary structures with language-specific localized arrays.
 */

import { Language, Dish, Country, LocalizedDish, LocalizedCountry } from '../types/game';
import { COUNTRIES, COUNTRIES_BY_LANG, getCountry } from './countries';
import { DISHES, DISHES_BY_LANG, getDish, getDishesByCountry, getDishesByContinent } from './dishes';

export interface FoodDataStructure {
  dishes: Dish[];
  countries: Country[];
  dishesByLanguage: Record<Language, LocalizedDish[]>;
  countriesByLanguage: Record<Language, LocalizedCountry[]>;
  getDish: (id: string) => Dish | undefined;
  getCountry: (id: string) => Country | undefined;
  getDishesByLanguage: (lang: Language) => LocalizedDish[];
  getCountriesByLanguage: (lang: Language) => LocalizedCountry[];
  getDishesByCountry: (countryId: string) => Dish[];
  getDishesByContinent: (continent: string) => Dish[];
}

export const foodData: FoodDataStructure = {
  dishes: DISHES,
  countries: COUNTRIES,
  dishesByLanguage: DISHES_BY_LANG,
  countriesByLanguage: COUNTRIES_BY_LANG,
  getDish,
  getCountry,
  getDishesByLanguage: (lang: Language) => DISHES_BY_LANG[lang] || DISHES_BY_LANG.en,
  getCountriesByLanguage: (lang: Language) => COUNTRIES_BY_LANG[lang] || COUNTRIES_BY_LANG.en,
  getDishesByCountry,
  getDishesByContinent,
};
