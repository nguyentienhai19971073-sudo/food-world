/**
 * Centralized Multi-Language Localization System (i18n) for FOOD WORLD
 * Fully modularized JSON dictionary supporting:
 * - en: English
 * - vi: Tiếng Việt
 * - ja: 日本語
 * - ko: 한국어
 * - es: Español
 * - fr: Français
 */

import { Language } from '../types/game';
import en from '../locales/en.json';
import vi from '../locales/vi.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en,
  vi,
  ja,
  ko,
  es,
  fr,
};

/**
 * Translate key to the target language with fallback to English,
 * and optional param interpolation (e.g. {count}, {moves}, {stage}).
 */
export function t(
  key: string,
  lang: Language,
  params?: Record<string, string | number>
): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let text = dictionary[key] || TRANSLATIONS.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return text;
}

export { useTranslation, I18nProvider, type I18nContextValue, type I18nProviderProps } from './I18nContext';

