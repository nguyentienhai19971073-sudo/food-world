/**
 * World Food Passport Modal & Stamp Celebration
 * Realistic 2D Travel Passport with continent spreads, authentic rubber stamps, and country mastery progress.
 */

import React, { useState, useEffect } from 'react';
import { Country, Continent } from '../types/game';
import { COUNTRIES } from '../data/countries';
import { DISHES } from '../data/dishes';
import { useTranslation } from '../localization/i18n';
import { audioManager } from '../services/audio';
import { saveManager } from '../services/saveManager';
import { X, Globe, Award, Sparkles, CheckCircle2, Lock, ChevronRight, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  awardedCountryId?: string | null; // If provided, triggers the stamp slam celebration animation
  onCelebrationComplete?: () => void;
}

export const PassportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  awardedCountryId = null,
  onCelebrationComplete,
}) => {
  const { t, getCountryName, getDishName } = useTranslation();
  const progress = saveManager.getProgress();
  const stamps = progress.passportStamps || [];
  const countryMastery = progress.countryMastery || {};

  const [activeContinent, setActiveContinent] = useState<Continent>('asia');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isCoverOpen, setIsCoverOpen] = useState(true);
  const [celebratingStamp, setCelebratingStamp] = useState<string | null>(null);
  const [stampLanded, setStampLanded] = useState(false);

  // When awardedCountryId is provided, trigger the stamp celebration flow
  useEffect(() => {
    if (awardedCountryId && isOpen) {
      const awardedCountry = COUNTRIES.find((c) => c.id === awardedCountryId);
      if (awardedCountry) {
        setActiveContinent(awardedCountry.continent);
        setCelebratingStamp(awardedCountryId);
        setStampLanded(false);

        // Sequence: open book -> drop stamp -> play audio
        setIsCoverOpen(true);
        const timer1 = setTimeout(() => {
          setStampLanded(true);
          audioManager.playStamp();
        }, 500);

        return () => clearTimeout(timer1);
      }
    } else {
      setCelebratingStamp(null);
      setStampLanded(false);
    }
  }, [awardedCountryId, isOpen]);

  if (!isOpen) return null;

  const continentCountries = COUNTRIES.filter((c) => c.continent === activeContinent);
  const totalStamps = stamps.length;
  const continentStamps = continentCountries.filter((c) => stamps.includes(c.id)).length;

  const handleTabChange = (continent: Continent) => {
    audioManager.playPageFlip();
    setActiveContinent(continent);
    setSelectedCountry(null);
  };

  const handleClose = () => {
    audioManager.playClick();
    if (celebratingStamp && onCelebrationComplete) {
      onCelebrationComplete();
    }
    onClose();
  };

  // Stamp ink color palette based on country ID
  const getStampInk = (cid: string) => {
    const inks = [
      '#dc2626', // Crimson Red
      '#2563eb', // Royal Blue
      '#059669', // Emerald Green
      '#7c3aed', // Royal Violet
      '#d97706', // Warm Amber
      '#0891b2', // Teal
    ];
    let hash = 0;
    for (let i = 0; i < cid.length; i++) {
      hash = (hash << 5) - hash + cid.charCodeAt(i);
    }
    return inks[Math.abs(hash) % inks.length];
  };

  // Stamp tilt based on country ID
  const getStampTilt = (cid: string) => {
    let hash = 0;
    for (let i = 0; i < cid.length; i++) hash += cid.charCodeAt(i);
    return ((hash % 15) - 7); // -7 to +7 deg
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      {/* Outer Passport Book Shell */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-amber-50/95 text-slate-900 border-4 border-amber-900/60 shadow-2xl overflow-hidden ring-4 ring-amber-500/20">
        
        {/* Leather Passport Spine & Header Ribbon */}
        <div className="relative bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-amber-200 px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b-2 border-amber-600/40 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <Globe className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-amber-400 font-display">
                  {t('passportTitle')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {totalStamps}/42 {t('stampsCollected')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                {t('passportSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-rose-500/80 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 hover:border-rose-400 active:scale-90"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Navigation Tabs (Continents) */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-900/10 border-b border-amber-800/20 overflow-x-auto no-scrollbar shrink-0">
          {(['asia', 'europe', 'americas', 'africa', 'oceania'] as Continent[]).map((cont) => {
            const count = COUNTRIES.filter((c) => c.continent === cont && stamps.includes(c.id)).length;
            const total = COUNTRIES.filter((c) => c.continent === cont).length;
            const isActive = activeContinent === cont;

            return (
              <button
                key={cont}
                onClick={() => handleTabChange(cont)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                  isActive
                    ? 'bg-amber-800 text-amber-100 shadow-md ring-2 ring-amber-600/50 scale-102'
                    : 'bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 border border-amber-800/20'
                }`}
              >
                <span>{t(`sector${cont.charAt(0).toUpperCase() + cont.slice(1)}`)}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-amber-900 text-amber-200' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {count}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vintage Passport Security Paper Body Spread */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          style={{
            backgroundImage: `radial-gradient(#d9770615 1px, transparent 1px), radial-gradient(#d9770615 1px, #fffbeb 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        >
          {/* Passport Visa Header Band */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-amber-800/30">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-900/70">
                OFFICIAL VISA PAGE • {activeContinent.toUpperCase()} SECTOR
              </span>
              <h3 className="text-base sm:text-lg font-black text-amber-950 font-display">
                {t(`sector${activeContinent.charAt(0).toUpperCase() + activeContinent.slice(1)}`)} Culinary Journey
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-900/70">
                Progress: <strong className="text-amber-950">{continentStamps}/{continentCountries.length}</strong>
              </span>
              <div className="w-28 sm:w-36 h-2 bg-amber-200/80 rounded-full overflow-hidden mt-1 border border-amber-400/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(continentStamps / Math.max(1, continentCountries.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stamps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {continentCountries.map((country) => {
              const isStamped = stamps.includes(country.id);
              const isCelebratingThis = celebratingStamp === country.id;
              const countryDishes = DISHES.filter((d) => d.countryId === country.id);
              const masteryTarget = Math.max(1, Math.min(3, countryDishes.length));
              const masteredDishIds = countryMastery[country.id] || [];
              const progressCount = Math.min(masteryTarget, masteredDishIds.length);
              const inkColor = getStampInk(country.id);
              const tilt = getStampTilt(country.id);

              return (
                <div
                  key={country.id}
                  onClick={() => {
                    audioManager.playClick();
                    setSelectedCountry(country);
                  }}
                  className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between min-h-[160px] group ${
                    isStamped
                      ? 'bg-amber-100/50 border-amber-400/60 shadow-md hover:shadow-lg hover:scale-102 hover:bg-amber-100/80'
                      : 'bg-white/50 border-dashed border-amber-300/80 hover:border-amber-400 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Country Flag & Code Header */}
                  <div className="w-full flex items-center justify-between pb-1 border-b border-amber-900/10">
                    <span className="text-lg filter drop-shadow-xs">{country.flagEmoji}</span>
                    <span className="text-[10px] font-black tracking-wider text-amber-950/70 font-mono">
                      {country.code}
                    </span>
                  </div>

                  {/* Stamp Center Area */}
                  <div className="flex-1 w-full flex items-center justify-center my-2 relative">
                    {isStamped ? (
                      /* Authenticated Rubber Stamp */
                      <div
                        className={`relative w-24 h-24 rounded-full border-3 flex flex-col items-center justify-center p-1.5 transition-transform duration-300 ${
                          isCelebratingThis && stampLanded ? 'animate-bounce' : ''
                        }`}
                        style={{
                          borderColor: inkColor,
                          color: inkColor,
                          transform: `rotate(${tilt}deg)`,
                          boxShadow: `inset 0 0 8px ${inkColor}20`,
                        }}
                      >
                        {/* Stamp Ink Rings */}
                        <div
                          className="absolute inset-1 rounded-full border border-dashed opacity-60"
                          style={{ borderColor: inkColor }}
                        />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center leading-none">
                          ENTRY VISITED
                        </span>
                        <span className="text-sm font-black my-0.5 tracking-wider font-display text-center leading-none line-clamp-1">
                          {getCountryName(country)}
                        </span>
                        <span className="text-[7px] font-bold opacity-80 uppercase tracking-tight">
                          ★ MASTER CHEF ★
                        </span>
                        <span className="text-[7px] font-mono opacity-70 mt-0.5">
                          OFFICIAL SEAL
                        </span>

                        {/* Stamped Ink Splatter Effect */}
                        <div
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full opacity-40"
                          style={{ backgroundColor: inkColor }}
                        />
                      </div>
                    ) : (
                      /* Locked / In-Progress Stamp Placeholder */
                      <div className="w-22 h-22 rounded-full border-2 border-dashed border-amber-800/25 flex flex-col items-center justify-center p-2 text-center">
                        <Lock className="w-5 h-5 text-amber-800/40 mb-1" />
                        <span className="text-[10px] font-black text-amber-950/60 leading-tight">
                          {getCountryName(country)}
                        </span>
                        <span className="text-[9px] font-bold text-amber-800/60 mt-0.5">
                          {progressCount}/{masteryTarget}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer Label / Progress */}
                  <div className="w-full pt-1.5 border-t border-amber-900/10 flex flex-col items-center">
                    <span className="text-[11px] font-black text-amber-950 text-center line-clamp-1 font-display">
                      {getCountryName(country)}
                    </span>
                    {isStamped ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {t('countryMastered')}
                      </span>
                    ) : (
                      <div className="w-full mt-1">
                        <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(progressCount / masteryTarget) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stamp Celebration Overlay (When awarded a new stamp) */}
        {celebratingStamp && stampLanded && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl p-6 sm:p-8 border-4 border-amber-500 shadow-2xl max-w-sm w-full text-center flex flex-col items-center transform animate-pop">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-inner">
                <Award className="w-10 h-10 text-amber-600 animate-bounce" />
              </div>

              <span className="text-xs font-black tracking-widest text-amber-700 uppercase">
                {t('newPassportStamp')}
              </span>
              <h2 className="text-2xl font-black text-amber-950 mt-1 mb-2 font-display">
                {COUNTRIES.find((c) => c.id === celebratingStamp)?.flagEmoji}{' '}
                {getCountryName(COUNTRIES.find((c) => c.id === celebratingStamp)!)}
              </h2>

              <p className="text-xs text-amber-900/80 mb-6 leading-relaxed">
                {t('stampUnlockedDesc', {
                  country: getCountryName(COUNTRIES.find((c) => c.id === celebratingStamp)!),
                })}
              </p>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition-transform active:scale-95"
              >
                {t('continueJourney')}
              </button>
            </div>
          </div>
        )}

        {/* Country Details Drawer */}
        {selectedCountry && (
          <div className="p-4 bg-amber-100/90 border-t border-amber-800/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow">{selectedCountry.flagEmoji}</span>
              <div>
                <h4 className="text-sm font-black text-amber-950 font-display">
                  {getCountryName(selectedCountry)} ({selectedCountry.code})
                </h4>
                <p className="text-xs text-amber-800">
                  {t('masteryProgress', {
                    current: (countryMastery[selectedCountry.id] || []).length,
                    target: Math.max(1, Math.min(3, DISHES.filter((d) => d.countryId === selectedCountry.id).length)),
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {DISHES.filter((d) => d.countryId === selectedCountry.id).map((dish) => {
                const isMatched = (countryMastery[selectedCountry.id] || []).includes(dish.id);
                return (
                  <span
                    key={dish.id}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white/60 text-slate-500 border-slate-300'
                    }`}
                  >
                    {isMatched ? '✓ ' : '🔒 '}
                    {getDishName(dish)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
