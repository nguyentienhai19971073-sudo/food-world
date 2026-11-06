/**
 * New Food Discovered Celebration Modal
 * Displays when a player discovers an unlocked dish for the very first time.
 */

import React, { useEffect } from 'react';
import { Dish } from '../types/game';
import { COUNTRIES } from '../data/countries';
import { DishIllustration } from './DishIllustration';
import { useTranslation } from '../localization/i18n';
import { audioManager } from '../services/audio';
import { Sparkles, BookOpen } from 'lucide-react';

interface Props {
  dish: Dish | null;
  onClose: () => void;
}

export const NewFoodDiscoveredModal: React.FC<Props> = ({ dish, onClose }) => {
  const { t, getDishName, getDishDescription, getCountryName } = useTranslation();

  useEffect(() => {
    if (dish) {
      audioManager.playUnlockSparkle();
    }
  }, [dish]);

  if (!dish) return null;

  const country = COUNTRIES.find((c) => c.id === dish.countryId);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-3 border-amber-400/90 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center ring-4 ring-amber-400/20 transform animate-pop">
        
        {/* Sunburst background rays */}
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        {/* Celebration Header */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase mb-3 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{t('newFoodDiscoveredTitle')}</span>
        </div>

        {/* Big Dish Spotlight */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 my-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 blur-md animate-pulse" />
          <DishIllustration
            iconType={dish.iconType}
            dishId={dish.id}
            className="w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-2xl animate-float"
          />
        </div>

        {/* Country Badge */}
        {country && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 mt-2 mb-1 shadow-sm">
            <span className="text-base">{country.flagEmoji}</span>
            <span>{getCountryName(country)}</span>
          </div>
        )}

        {/* Full Dish Name */}
        <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-1 mb-2 leading-snug whitespace-normal break-words">
          {getDishName(dish)}
        </h3>

        {/* Fun Lore Description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-750 mb-4 max-h-24 overflow-y-auto">
          {getDishDescription(dish)}
        </p>

        {/* Added to Collection Tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mb-5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>{t('addedToCollection')}</span>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            audioManager.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition-transform active:scale-95 cursor-pointer"
        >
          {t('continueJourney')}
        </button>
      </div>
    </div>
  );
};
