/**
 * Food Collection & World Culinary Encyclopedia Screen
 * Browse, filter, search and inspect all unlocked world dishes.
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Lock, Sparkles, Filter, Info, X } from 'lucide-react';
import { Language, Continent, Dish } from '../types/game';
import { useTranslation } from '../localization/i18n';
import { DISHES } from '../data/dishes';
import { COUNTRIES } from '../data/countries';
import { DishIllustration } from '../components/DishIllustration';

interface Props {
  language?: Language;
  unlockedFoodIds: string[];
  onBack: () => void;
}

export const FoodCollectionScreen: React.FC<Props> = ({
  language: propLanguage,
  unlockedFoodIds,
  onBack,
}) => {
  const { language: contextLang, t, getDishName, getDishDescription, getCountryName } = useTranslation();
  const language = propLanguage || contextLang;
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(false);
  const [inspectedDish, setInspectedDish] = useState<Dish | null>(null);

  const totalDishes = DISHES.length;
  const unlockedCount = DISHES.filter((d) => unlockedFoodIds.includes(d.id)).length;
  const percentComplete = Math.round((unlockedCount / totalDishes) * 100);

  const filteredDishes = useMemo(() => {
    return DISHES.filter((dish) => {
      // Continent filter
      if (selectedContinent !== 'all' && dish.continent !== selectedContinent) {
        return false;
      }
      // Unlocked only filter
      const isUnlocked = unlockedFoodIds.includes(dish.id);
      if (filterUnlockedOnly && !isUnlocked) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const enName = dish.name.en.toLowerCase();
        const viName = dish.name.vi.toLowerCase();
        const currName = (dish.name[language] || '').toLowerCase();
        const country = COUNTRIES.find((c) => c.id === dish.countryId);
        const countryName = (country?.name[language] || country?.name.en || '').toLowerCase();

        if (
          !enName.includes(query) &&
          !viName.includes(query) &&
          !currName.includes(query) &&
          !countryName.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [selectedContinent, filterUnlockedOnly, searchQuery, unlockedFoodIds, language]);

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navbar */}
      <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all border border-slate-700 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
              {t('collection', language)}
            </h1>
            <span className="text-xs font-semibold text-slate-400">
              {unlockedCount} / {totalDishes} {t('collectedFoods', language)} ({percentComplete}%)
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-[200px] sm:max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', language)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </header>

      {/* Progress & Filters Bar */}
      <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Continent Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <button
            onClick={() => setSelectedContinent('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedContinent === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('allContinents', language)}
          </button>
          {(['asia', 'europe', 'americas', 'africa', 'oceania'] as Continent[]).map((cont) => {
            const labelKey = `sector${cont.charAt(0).toUpperCase() + cont.slice(1)}`;
            return (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedContinent === cont
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t(labelKey, language)}
              </button>
            );
          })}
        </div>

        {/* Toggle Unlocked Only */}
        <button
          onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            filterUnlockedOnly
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('unlockedOnly', language)}</span>
        </button>
      </div>

      {/* Main Grid View */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredDishes.map((dish) => {
            const isUnlocked = unlockedFoodIds.includes(dish.id);
            const country = COUNTRIES.find((c) => c.id === dish.countryId);
            const dishName = getDishName(dish);
            const countryName = country ? getCountryName(country) : '';

            return (
              <div
                key={dish.id}
                onClick={() => isUnlocked && setInspectedDish(dish)}
                className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all select-none
                  h-44 sm:h-48
                  ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-400/60 hover:bg-slate-800/90 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-amber-500/10'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                {isUnlocked ? (
                  <>
                    {/* Country Badge */}
                    <div className="w-full flex items-center justify-between gap-1 text-[11px] font-bold text-slate-400">
                      <span className="text-base">{country?.flagEmoji}</span>
                      <span className="leading-tight text-right whitespace-normal break-words">{countryName}</span>
                    </div>

                    {/* Illustration */}
                    <div className="flex-1 flex items-center justify-center p-2">
                      <DishIllustration iconType={dish.iconType} className="w-16 h-16 sm:w-20 sm:h-20 filter drop-shadow-md" />
                    </div>

                    {/* Dish Title */}
                    <div className="w-full text-center mt-1">
                      <span className="text-xs sm:text-sm font-bold text-white block whitespace-normal break-words leading-tight">
                        {dishName}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700/60">
                      <Lock className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {t('locked', language)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Dish Lore Details Modal */}
      {inspectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <button
              onClick={() => setInspectedDish(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Large Illustration */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 mb-3 flex items-center justify-center">
              <DishIllustration iconType={inspectedDish.iconType} className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {/* Country & Flag */}
            {(() => {
              const country = COUNTRIES.find((c) => c.id === inspectedDish.countryId);
              return (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-300 mb-2">
                  <span className="text-base">{country?.flagEmoji}</span>
                  <span>{country ? getCountryName(country) : ''}</span>
                </div>
              );
            })()}

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white font-display mb-3">
              {getDishName(inspectedDish)}
            </h3>

            {/* Description Lore */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-2xl border border-slate-800 text-left mb-4">
              {getDishDescription(inspectedDish)}
            </p>

            {/* Difficulty Badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>{t('culinaryCategory', language)}:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                {inspectedDish.difficulty === 1
                  ? t('difficultyEasy', language)
                  : inspectedDish.difficulty === 2
                  ? t('difficultyMed', language)
                  : t('difficultyHard', language)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
