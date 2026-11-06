/**
 * Country Food Stall (Gian Hàng Ẩm Thực Mini Cao Cấp)
 * Authentic 2D cartoon food stalls with culturally distinct awnings, lanterns,
 * national flags, serving platters, and interactive lighting feedback.
 */

import React, { useState, useEffect } from 'react';
import { Country, Language } from '../types/game';
import { assetManager } from '../services/assetManager';
import { useTranslation } from '../localization/i18n';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

interface Props {
  country: Country;
  language?: Language;
  isHovered?: boolean;
  isHighlighted?: boolean;
  feedbackState?: 'correct' | 'wrong' | null;
  onSelectCountry?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export const CountryTarget: React.FC<Props> = ({
  country,
  language: propLanguage,
  isHovered = false,
  isHighlighted = false,
  feedbackState = null,
  onSelectCountry,
  onPointerEnter,
  onPointerLeave,
}) => {
  const { language: contextLang, getCountryName, t } = useTranslation();
  const activeLang = propLanguage || contextLang;
  const [, setTick] = useState(0);

  useEffect(() => {
    return assetManager.subscribe(() => setTick((t) => t + 1));
  }, []);

  const localizedName = getCountryName(country);
  const customFlag = assetManager.getCountryFlagImage(country.id);
  const isActive = isHovered || isHighlighted;

  // Render cultural architectural canopy based on country ID or continent
  const renderStallRoof = () => {
    switch (country.id) {
      case 'VN':
        // Vietnam: Red ancient tiled roof eaves + Phố Cổ lanterns
        return (
          <div className="w-full h-11 relative flex flex-col justify-end bg-gradient-to-b from-red-800 to-amber-900 border-b-2 border-amber-600/60 shadow-md">
            {/* Tile ridges */}
            <div className="absolute inset-x-0 top-0 h-2 bg-red-950 flex justify-around">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-2.5 h-3 bg-red-700 rounded-b-md shadow-xs" />
              ))}
            </div>
            {/* Lantern hangings */}
            <div className="flex justify-between items-center px-2 pb-1 z-10">
              <span className="text-[11px] animate-swing drop-shadow">🏮</span>
              <span className="text-[8px] font-black tracking-widest text-amber-300 uppercase font-display bg-black/40 px-1 rounded">
                PHỐ CỔ
              </span>
              <span className="text-[11px] animate-swing drop-shadow" style={{ animationDelay: '0.4s' }}>🏮</span>
            </div>
          </div>
        );

      case 'JP':
        // Japan: Cedar wooden eave with chōchin paper lantern & torii vibe
        return (
          <div className="w-full h-11 relative flex flex-col justify-end bg-gradient-to-b from-stone-800 to-amber-950 border-b-2 border-stone-600 shadow-md">
            <div className="absolute top-0 inset-x-0 h-2 bg-stone-900 rounded-t-sm" />
            <div className="flex justify-between items-center px-2 pb-1 z-10">
              <span className="text-[11px] animate-swing drop-shadow">🏮</span>
              <span className="text-[8px] font-black tracking-widest text-red-300 uppercase font-display bg-black/50 px-1 rounded">
                屋台 YATAI
              </span>
              <span className="text-[11px] animate-swing drop-shadow" style={{ animationDelay: '0.5s' }}>🏮</span>
            </div>
          </div>
        );

      case 'KR':
        // South Korea: Orange Pojangmacha street tent + neon signage
        return (
          <div className="w-full h-11 relative flex flex-col justify-end bg-gradient-to-b from-orange-600 to-red-700 border-b-2 border-orange-400 shadow-md">
            <div className="flex justify-center items-center px-1 pb-1 z-10">
              <span className="text-[8px] font-black tracking-widest text-yellow-200 uppercase font-display bg-black/40 px-1.5 py-0.5 rounded border border-yellow-300/40 shadow-xs">
                포장마차 K-STREET
              </span>
            </div>
          </div>
        );

      case 'IT':
        // Italy: Classic Trattoria green-white-red scalloped awning
        return (
          <div className="w-full h-11 relative flex flex-col justify-between shadow-md overflow-hidden">
            <div
              className="w-full h-8 flex"
              style={{
                background: `repeating-linear-gradient(
                  -45deg,
                  #15803d,
                  #15803d 10px,
                  #ffffff 10px,
                  #ffffff 20px,
                  #b91c1c 20px,
                  #b91c1c 30px
                )`,
              }}
            />
            {/* Scalloped valence */}
            <div className="h-3 bg-stone-900 flex justify-around items-center px-1">
              <span className="text-[7.5px] font-black text-amber-200 uppercase tracking-widest font-serif">
                TRATTORIA
              </span>
            </div>
          </div>
        );

      case 'FR':
        // France: Parisian dark green bistro canopy with polished brass trim
        return (
          <div className="w-full h-11 relative flex flex-col justify-between bg-emerald-950 border-b-2 border-amber-400 shadow-md">
            <div className="w-full h-7 flex items-center justify-center bg-gradient-to-b from-emerald-900 to-emerald-950">
              <span className="text-[8px] font-black text-amber-300 uppercase tracking-widest font-serif italic">
                Bistro de Paris
              </span>
            </div>
            {/* Brass rail valence */}
            <div className="h-4 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 flex justify-around items-center">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-950" />
              ))}
            </div>
          </div>
        );

      case 'MX':
        // Mexico: Festive multi-color serape striped awning with Papel Picado
        return (
          <div className="w-full h-11 relative flex flex-col justify-between shadow-md overflow-hidden">
            <div
              className="w-full h-7 flex"
              style={{
                background: `repeating-linear-gradient(
                  -45deg,
                  #db2777,
                  #db2777 8px,
                  #0284c7 8px,
                  #0284c7 16px,
                  #eab308 16px,
                  #eab308 24px,
                  #16a34a 24px,
                  #16a34a 32px
                )`,
              }}
            />
            <div className="h-4 bg-amber-950 flex justify-around items-center px-1">
              <span className="text-[8px] font-black text-yellow-300 uppercase tracking-widest font-display">
                TAQUERÍA
              </span>
            </div>
          </div>
        );

      case 'US':
        // USA: Retro 1950s Diner chrome & neon canopy
        return (
          <div className="w-full h-11 relative flex flex-col justify-between bg-slate-900 border-b-2 border-cyan-400 shadow-md">
            <div className="w-full h-7 flex items-center justify-center bg-gradient-to-r from-red-600 via-slate-800 to-red-600">
              <span className="text-[8px] font-black text-cyan-300 uppercase tracking-widest font-display animate-pulse">
                ★ DINER ★
              </span>
            </div>
            <div className="h-4 bg-cyan-950 flex items-center justify-around border-t border-cyan-500/40">
              <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000,#000_6px,#fff_6px,#fff_12px)] opacity-60" />
            </div>
          </div>
        );

      default:
        // Regional theme default based on country color
        return (
          <div className="w-full h-11 relative flex flex-col justify-between shadow-md overflow-hidden">
            <div
              className="w-full h-8 flex"
              style={{
                background: `repeating-linear-gradient(
                  -45deg,
                  ${country.color},
                  ${country.color} 11px,
                  #ffffff 11px,
                  #ffffff 22px
                )`,
              }}
            />
            <div className="h-3 flex justify-around items-center bg-slate-950/80 px-1 border-t border-white/20">
              <span className="text-[7.5px] font-black text-amber-200 uppercase tracking-widest">
                {t('foodStall')}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      data-country-id={country.id}
      onClick={onSelectCountry}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`relative flex flex-col items-center justify-between rounded-3xl transition-all duration-200 cursor-pointer select-none
        w-[130px] sm:w-[155px] md:w-[172px] min-h-[155px] sm:min-h-[175px]
        border-3 shadow-2xl overflow-hidden group
        ${
          feedbackState === 'correct'
            ? 'bg-gradient-to-b from-emerald-950 to-slate-950 border-emerald-400 scale-108 shadow-emerald-500/60 ring-4 ring-emerald-400/40'
            : feedbackState === 'wrong'
            ? 'bg-gradient-to-b from-rose-950 to-slate-950 border-rose-400 animate-shake shadow-rose-500/60'
            : isActive
            ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-400 scale-105 shadow-amber-500/50 ring-2 ring-amber-400/50'
            : 'bg-slate-900/95 border-slate-700/80 hover:border-slate-500 hover:scale-102'
        }
      `}
      style={{
        boxShadow: isActive
          ? `0 14px 32px ${country.color}66, 0 0 25px rgba(251, 191, 36, 0.45)`
          : '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* Decorative Stall Canopy Header */}
      {renderStallRoof()}

      {/* Flag & Stall Signboard */}
      <div className="flex flex-col items-center justify-center pt-1.5 px-2 z-10 w-full flex-1">
        {/* National Flag Badge */}
        <div
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 border-2 ${
            isActive ? 'scale-110 border-amber-300 ring-2 ring-amber-400/40' : 'border-white/20'
          }`}
          style={{
            backgroundColor: `${country.color}22`,
          }}
        >
          {customFlag ? (
            <img
              src={customFlag}
              alt={country.name.en}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow"
            />
          ) : (
            <span className="text-2xl sm:text-3xl filter drop-shadow select-none">
              {country.flagEmoji}
            </span>
          )}
        </div>

        {/* Full Country Name Sign */}
        <span className="text-xs sm:text-sm font-black text-white text-center leading-tight tracking-wide px-1 mt-1 line-clamp-1 font-display drop-shadow">
          {localizedName}
        </span>
      </div>

      {/* Culinary Receiving Platter Counter */}
      <div className="w-full px-2 pb-2.5 pt-1 flex flex-col items-center justify-center z-10 shrink-0">
        <div
          className={`w-full h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 border-2 ${
            feedbackState === 'correct'
              ? 'bg-emerald-500/30 border-emerald-300 shadow-[0_0_18px_#10b981]'
              : feedbackState === 'wrong'
              ? 'bg-rose-500/30 border-rose-300 shadow-[0_0_18px_#f43f5e]'
              : isActive
              ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_18px_#f59e0b]'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          {feedbackState === 'correct' ? (
            <div className="flex items-center gap-1 text-emerald-300 font-black text-xs animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{t('stallDelicious')}</span>
            </div>
          ) : feedbackState === 'wrong' ? (
            <span className="text-rose-300 font-black text-xs animate-pulse">
              {t('stallTryAgain')}
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <UtensilsCrossed className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300 animate-spin-slow' : 'text-slate-500'}`} />
              <span
                className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                  isActive ? 'text-amber-300 animate-pulse' : 'text-slate-400'
                }`}
              >
                {isActive ? t('dropDishHere') : t('foodStall')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
