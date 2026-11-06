/**
 * Level Result Modal (Victory, Defeat & World Champion Celebration)
 * Features:
 * - Deterministic, unblocked interaction on mobile & desktop
 * - Sequential animated stars with audio sparkles
 * - Grand World Champion Screen upon completing Level 120
 * - Unlocked culinary dish showcase
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Star,
  RotateCcw,
  ArrowRight,
  Home,
  Sparkles,
  Trophy,
  Award,
  Globe,
  Grid,
  CheckCircle2,
} from 'lucide-react';
import { Language, Dish } from '../types/game';
import { useTranslation } from '../localization/i18n';
import { DishIllustration } from './DishIllustration';
import { COUNTRIES } from '../data/countries';
import { audioManager } from '../services/audio';
import { saveManager } from '../services/saveManager';
import { calculateStars } from '../utils/starRating';

export interface Props {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  comboBonus?: number;
  sessionStars?: number; // Strictly current match's session stars
  currentStars?: number; // Backward compatible alias
  stars?: number;        // Backward compatible alias
  bestStars?: number;    // All-time best stars record
  wrongAttempts?: number;
  levelNumber: number;
  newlyUnlockedDishes: Dish[];
  language?: Language;
  onNextLevel: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
  onOpenCollection: () => void;
  onOpenLevelSelect?: () => void;
}

export const ResultModal: React.FC<Props> = ({
  isOpen,
  isVictory,
  score,
  comboBonus = 0,
  sessionStars,
  currentStars,
  stars,
  bestStars,
  wrongAttempts = 0,
  levelNumber,
  newlyUnlockedDishes,
  language: propLanguage,
  onNextLevel,
  onReplay,
  onMainMenu,
  onOpenCollection,
  onOpenLevelSelect,
}) => {
  const { language: contextLang, t, getDishName, getCountryName } = useTranslation();
  const language = propLanguage || contextLang;
  const [revealedStars, setRevealedStars] = useState(0);

  const isFinalLevel = levelNumber >= 120;
  const progress = saveManager.getProgress();

  // EXPLICIT CALCULATION BASED ON 'wrongAttempts':
  // Calculate star count directly from wrongAttempts variable:
  // - 0 wrongAttempts -> 3 Stars (Flawless)
  // - 1-2 wrongAttempts -> 2 Stars
  // - 3+ wrongAttempts -> 1 Star
  // - Defeat / Incomplete -> 0 Stars
  const calculatedFromWrongAttempts = calculateStars(wrongAttempts, isVictory);

  // STRICT BINDING TO CURRENT SESSION:
  // effectiveCurrentStars is strictly calculated from the current session's performance
  // (using sessionStars, currentStars, or wrongAttempts), COMPLETELY INDEPENDENT of the historical bestStars record!
  const effectiveCurrentStars =
    sessionStars !== undefined
      ? sessionStars
      : currentStars !== undefined
      ? currentStars
      : wrongAttempts !== undefined
      ? calculatedFromWrongAttempts
      : (stars !== undefined ? stars : calculatedFromWrongAttempts);

  // All-time best stars record is strictly separated and only used for the historical badge
  const effectiveBestStars =
    bestStars !== undefined
      ? bestStars
      : (progress.levelScores[levelNumber]?.stars || 0);

  useEffect(() => {
    if (isOpen && isVictory) {
      setRevealedStars(0);

      // Star reveal sequence strictly based on current session's star rating
      const t1 = setTimeout(() => {
        if (effectiveCurrentStars >= 1) {
          setRevealedStars(1);
          audioManager.playStarSparkle(0);
        }
      }, 300);

      const t2 = setTimeout(() => {
        if (effectiveCurrentStars >= 2) {
          setRevealedStars(2);
          audioManager.playStarSparkle(1);
        }
      }, 650);

      const t3 = setTimeout(() => {
        if (effectiveCurrentStars >= 3) {
          setRevealedStars(3);
          audioManager.playStarSparkle(2);
        }
      }, 1000);

      try {
        confetti({
          particleCount: isFinalLevel ? 180 : effectiveCurrentStars === 3 ? 120 : 70,
          spread: isFinalLevel ? 100 : 80,
          origin: { y: 0.55 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#FBBF24'],
        });
      } catch {
        // Safe fallback
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setRevealedStars(0);
    }
  }, [isOpen, isVictory, effectiveCurrentStars, isFinalLevel]);

  if (!isOpen) return null;

  // Calculate cumulative stats for final championship
  const totalStarsAccumulated = Object.values(progress.levelScores).reduce(
    (acc, val) => acc + (val.stars || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-auto"
      style={{ touchAction: 'auto' }}
    >
      {/* =========================================================================
          CASE 1: GRAND WORLD CHAMPION SCREEN (LEVEL 120 CLEARED)
          ========================================================================= */}
      {isVictory && isFinalLevel ? (
        <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 border-3 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(251,191,36,0.4)] text-center flex flex-col items-center animate-bounce-in">
          {/* Shimmering Halo */}
          <div className="absolute -top-16 w-48 h-48 bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />

          {/* Golden Champion Trophy */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-2xl border-4 border-amber-200 animate-pulse">
              <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-slate-950 fill-slate-950" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-spin" />
          </div>

          {/* Championship Title */}
          <span className="text-xs font-black tracking-widest uppercase text-amber-300 mb-1">
            {t('championSubtitle', language)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 font-display tracking-tight leading-tight mb-2">
            {t('championTitleLine1', language)}
            <br />
            {t('championTitleLine2', language)}
          </h2>
          <p className="text-xs text-slate-300 mb-4 px-2">
            {t('championDescription', language)}
          </p>

          {/* Grand Stats Grid */}
          <div className="grid grid-cols-3 gap-2 w-full mb-4">
            <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('championStages', language)}</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-display">
                120 / 120
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('championDishes', language)}</span>
              <span className="text-base sm:text-lg font-black text-emerald-300 font-display">
                {progress.unlockedFoodIds.length} / 164
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('championTotalStars', language)}</span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-display">
                {totalStarsAccumulated} ★
              </span>
            </div>
          </div>

          {/* Final Score */}
          <div className="w-full bg-slate-900/80 border border-amber-400/40 rounded-2xl py-2 px-4 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">{t('championFinalScore', language)}</span>
            <span className="text-xl font-black text-amber-300 font-display">
              {score.toLocaleString()}
            </span>
          </div>

          {/* 3 Championship Navigation Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={() => {
                audioManager.playClick();
                onReplay();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>{t('championPlayAgain', language)}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <button
                onClick={() => {
                  audioManager.playClick();
                  if (onOpenLevelSelect) {
                    onOpenLevelSelect();
                  } else {
                    onMainMenu();
                  }
                }}
                className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Grid className="w-4 h-4 text-emerald-400" />
                <span>{t('championSelectStage', language)}</span>
              </button>

              <button
                onClick={() => {
                  audioManager.playClick();
                  onMainMenu();
                }}
                className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4 text-slate-300" />
                <span>{t('championHome', language)}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           CASE 2: STANDARD LEVEL RESULTS (LEVELS 1 - 119 OR DEFEAT)
           ========================================================================= */
        <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-center flex flex-col items-center">
          {/* Glow backdrop */}
          <div
            className={`absolute -top-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 ${
              isVictory ? 'bg-amber-400' : 'bg-rose-500'
            }`}
          />

          {/* Level Banner / Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-amber-300 text-xs font-bold mb-2 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('level', language)} {levelNumber} / 120</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 font-display tracking-tight mb-2">
            {isVictory ? t('levelCleared', language) : t('levelFailed', language)}
          </h2>

          {/* 3 Sequential Animated Stars: strictly displays current session stars */}
          {isVictory && (
            <div className="flex flex-col items-center gap-1 my-2">
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((starIdx) => {
                  const isEarned = starIdx <= effectiveCurrentStars;
                  const isShown = starIdx <= revealedStars;
                  return (
                    <div
                      key={starIdx}
                      className={`transition-all duration-300 transform ${
                        isShown
                          ? 'scale-115 rotate-0 opacity-100'
                          : isEarned
                          ? 'scale-50 rotate-45 opacity-20'
                          : 'scale-90 opacity-40'
                      }`}
                    >
                      <Star
                        className={`w-12 h-12 sm:w-14 sm:h-14 ${
                          isShown
                            ? 'fill-amber-400 text-amber-300 filter drop-shadow-[0_0_16px_rgba(251,191,36,0.8)]'
                            : 'fill-slate-800 text-slate-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Historical Best Star Record (shown if higher than this current run) */}
              {effectiveBestStars > effectiveCurrentStars && (
                <span className="text-[11px] font-bold text-amber-300/90 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full mt-1">
                  ⭐ {t('previousBestStars', language)}: {effectiveBestStars} ★
                </span>
              )}
            </div>
          )}

          {/* Star Rating Evaluation & Mistakes Breakdown: based strictly on current session stars */}
          {isVictory && (
            <div
              className={`w-full rounded-2xl px-3.5 py-2 mb-2 border text-xs font-semibold flex items-center justify-between ${
                effectiveCurrentStars === 3
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : effectiveCurrentStars === 2
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-sm">{effectiveCurrentStars === 3 ? '🌟' : effectiveCurrentStars === 2 ? '👍' : '🎯'}</span>
                <div>
                  <span className="font-bold block">
                    {effectiveCurrentStars === 3
                      ? t('flawlessStars3', language)
                      : effectiveCurrentStars === 2
                      ? t('goodStars2', language)
                      : t('completedStars1', language)}
                  </span>
                  <span className="text-[10px] opacity-85 block">
                    {effectiveCurrentStars === 3
                      ? t('flawlessDesc', language)
                      : effectiveCurrentStars === 2
                      ? t('goodDesc', language, { count: wrongAttempts })
                      : t('completedDesc', language, { count: wrongAttempts })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">{t('wrongAttempts', language)}</span>
                <span className={`font-mono font-black text-sm ${wrongAttempts === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {wrongAttempts === 0 ? `0 (${t('zeroMistakes', language)})` : t('mistakesCount', language, { count: wrongAttempts })}
                </span>
              </div>
            </div>
          )}

          {/* Score Breakdown Box */}
          <div className="w-full bg-slate-800/90 rounded-2xl p-3 sm:p-4 border border-slate-700/80 my-2 flex items-center justify-around shadow-inner">
            <div className="flex flex-col items-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('score', language)}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            {comboBonus > 0 && (
              <>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {t('comboBonus', language)}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-300 font-display tabular-nums">
                    +{comboBonus}
                  </span>
                </div>
              </>
            )}

            {wrongAttempts > 0 && (
              <>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    {t('penaltyDeduction', language)}
                  </span>
                  <span className="text-base sm:text-xl font-black text-rose-400 font-display tabular-nums">
                    -{wrongAttempts * 25}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Newly Unlocked Dish Showcase */}
          {isVictory && newlyUnlockedDishes.length > 0 && (
            <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 my-2 flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{t('newFoodUnlocked', language)}</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full">
                {newlyUnlockedDishes.map((dish) => {
                  const country = COUNTRIES.find((c) => c.id === dish.countryId);
                  return (
                    <div
                      key={dish.id}
                      onClick={onOpenCollection}
                      className="flex items-center gap-2.5 bg-slate-800/95 hover:bg-slate-700 px-3 py-2 rounded-xl border border-amber-400/40 cursor-pointer transition-all shrink-0 shadow-md"
                    >
                      <DishIllustration iconType={dish.iconType} dishId={dish.id} className="w-8 h-8" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">
                          {getDishName(dish)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {country?.flagEmoji} {country ? getCountryName(country) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guaranteed Clickable Action Buttons */}
          <div className="w-full flex flex-col gap-3 mt-3">
            {isVictory ? (
              <button
                onClick={() => {
                  audioManager.playClick();
                  onNextLevel();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-lg shadow-xl shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-amber-200 cursor-pointer animate-pulse"
              >
                <span>{t('nextLevel', language)}</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={() => {
                  audioManager.playClick();
                  onReplay();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                <span>{t('replay', language)}</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => {
                  audioManager.playClick();
                  onReplay();
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>{t('replay', language)}</span>
              </button>

              <button
                onClick={() => {
                  audioManager.playClick();
                  onMainMenu();
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>{t('mainMenu', language)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Aliases for ResultScene naming convention
export const ResultScene = ResultModal;
export type ResultSceneProps = Props;
export type ResultModalProps = Props;
