/**
 * Endless Challenge Game Mode Screen
 * Rapid incoming dishes, progressive speed, 3 lives survival.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Country, Dish, Language } from '../types/game';
import { COUNTRIES } from '../data/countries';
import { DISHES } from '../data/dishes';
import { HeaderHUD } from '../components/HeaderHUD';
import { CountryTarget } from '../components/CountryTarget';
import { DraggableDish } from '../components/DraggableDish';
import { ComboBanner } from '../components/ComboBanner';
import { PauseModal } from '../components/PauseModal';
import { audioManager } from '../services/audio';
import { saveManager } from '../services/saveManager';
import { youtubeSdk } from '../services/youtubeSdk';
import { useTranslation } from '../localization/i18n';
import { Heart, Flame, RotateCcw, Home, Skull } from 'lucide-react';

interface Props {
  language?: Language;
  onMainMenu: () => void;
}

export const EndlessScreen: React.FC<Props> = ({ language: propLanguage, onMainMenu }) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [matchedCount, setMatchedCount] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(!audioManager.getMusicEnabled());
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [targetFeedback, setTargetFeedback] = useState<{ [countryId: string]: 'correct' | 'wrong' | null }>({});

  const [activeCountries, setActiveCountries] = useState<Country[]>([]);
  const [activeDishIds, setActiveDishIds] = useState<string[]>([]);

  // Setup 4 active countries
  const refreshCountries = useCallback(() => {
    const shuffled = [...COUNTRIES].sort(() => 0.5 - Math.random()).slice(0, 4);
    setActiveCountries(shuffled);

    // Initial 4 dishes
    const validDishes = DISHES.filter((d) => shuffled.some((c) => c.id === d.countryId));
    const randomInitial = [...validDishes].sort(() => 0.5 - Math.random()).slice(0, 4);
    setActiveDishIds(randomInitial.map((d) => d.id));
  }, []);

  useEffect(() => {
    refreshCountries();
  }, [refreshCountries]);

  // Periodic conveyor incoming dishes
  useEffect(() => {
    if (isPaused || isGameOver) return;

    // Interval shrinks as speedLevel rises
    const intervalMs = Math.max(3000, 6000 - speedLevel * 400);

    const conveyorTimer = setInterval(() => {
      setActiveDishIds((prev) => {
        // If conveyor is overflowing (> 5 dishes), player missed one!
        if (prev.length >= 5) {
          handleMissedDish();
          return prev.slice(1);
        }

        // Add fresh dish
        const candidates = DISHES.filter((d) =>
          activeCountries.some((c) => c.id === d.countryId) && !prev.includes(d.id)
        );
        if (candidates.length > 0) {
          const nextDish = candidates[Math.floor(Math.random() * candidates.length)];
          return [...prev, nextDish.id];
        }
        return prev;
      });
    }, intervalMs);

    return () => clearInterval(conveyorTimer);
  }, [isPaused, isGameOver, speedLevel, activeCountries]);

  const handleMissedDish = () => {
    audioManager.playWrong();
    setCombo(0);
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        handleGameOver();
      }
      return next;
    });
  };

  const handleGameOver = async () => {
    setIsGameOver(true);
    audioManager.playGameOver();

    const progress = saveManager.getProgress();
    if (score > (progress.highScores.endlessScore || 0)) {
      await saveManager.save({
        highScores: {
          ...progress.highScores,
          endlessScore: score,
        },
      });
      youtubeSdk.sendScore(score);
    }
  };

  const handleAttemptMatch = (dishId: string, targetCountryId: string) => {
    if (isGameOver || isPaused) return;

    const dish = DISHES.find((d) => d.id === dishId);
    if (!dish) return;

    if (dish.countryId === targetCountryId) {
      // Correct!
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      const nextMatched = matchedCount + 1;
      setMatchedCount(nextMatched);

      // Speed up every 6 matches
      if (nextMatched % 6 === 0) {
        setSpeedLevel((lvl) => Math.min(lvl + 1, 8));
      }

      const added = 100 + Math.min(nextCombo * 20, 200);
      setScore((s) => s + added);

      if (nextCombo > 1) {
        audioManager.playCombo(nextCombo);
      } else {
        audioManager.playCorrect();
      }

      setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: 'correct' }));
      setTimeout(() => setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: null })), 400);

      // Remove dish and spawn new
      setActiveDishIds((prev) => {
        const filtered = prev.filter((id) => id !== dishId);
        const candidates = DISHES.filter((d) =>
          activeCountries.some((c) => c.id === d.countryId) && !filtered.includes(d.id)
        );
        if (candidates.length > 0) {
          const fresh = candidates[Math.floor(Math.random() * candidates.length)];
          return [...filtered, fresh.id];
        }
        return filtered;
      });

      setSelectedDishId(null);
    } else {
      // Wrong!
      audioManager.playWrong();
      setCombo(0);
      setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: 'wrong' }));
      setTimeout(() => setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: null })), 400);

      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          handleGameOver();
        }
        return next;
      });
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCombo(0);
    setLives(3);
    setMatchedCount(0);
    setSpeedLevel(1);
    setIsGameOver(false);
    setSelectedDishId(null);
    refreshCountries();
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      <HeaderHUD
        language={language}
        title={t('modeEndless', language)}
        score={score}
        combo={combo}
        timeRemaining={null}
        livesRemaining={lives}
        maxLives={3}
        isAudioMuted={isAudioMuted}
        onToggleAudio={() => {
          const next = isAudioMuted;
          audioManager.setMusicEnabled(next);
          audioManager.setSfxEnabled(next);
          setIsAudioMuted(!next);
        }}
        onPause={() => setIsPaused(true)}
      />

      <ComboBanner combo={combo} language={language} />

      {/* Main Play Area */}
      <div className="flex-1 w-full flex flex-col justify-between p-3 sm:p-6 overflow-hidden max-w-5xl mx-auto">
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          {/* Conveyor Speed Indicator */}
          <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-bold text-amber-300">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{t('conveyorSpeed', language)}: Lv.{speedLevel}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 w-full">
            {activeCountries.map((country) => (
              <CountryTarget
                key={country.id}
                country={country}
                language={language}
                isHighlighted={Boolean(selectedDishId)}
                feedbackState={targetFeedback[country.id]}
                onSelectCountry={() => {
                  if (selectedDishId) {
                    handleAttemptMatch(selectedDishId, country.id);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Conveyor Belt Tray */}
        <div className="w-full bg-slate-900/90 rounded-3xl p-3 sm:p-4 border border-slate-800 shadow-2xl backdrop-blur-md shrink-0">
          <div className="w-full flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-1">
            {activeDishIds.map((dishId) => {
              const dish = DISHES.find((d) => d.id === dishId);
              if (!dish) return null;

              return (
                <DraggableDish
                  key={dishId}
                  dish={dish}
                  language={language}
                  isSelected={selectedDishId === dishId}
                  onSelect={() => {
                    audioManager.playSelectFood();
                    setSelectedDishId(selectedDishId === dishId ? null : dishId);
                  }}
                  onDropOnCountry={(targetCountryId) => {
                    handleAttemptMatch(dishId, targetCountryId);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-3">
              <Skull className="w-8 h-8 text-rose-500" />
            </div>

            <h3 className="text-2xl font-black text-white font-display mb-1">
              {t('outOfLives', language)}
            </h3>
            <span className="text-xs text-slate-400 mb-4">
              {t('dishesMatched', language, { count: matchedCount })}
            </span>

            <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-5 flex flex-col items-center">
              <span className="text-xs uppercase font-bold text-slate-400">
                {t('score', language)}
              </span>
              <span className="text-3xl font-black text-amber-400 font-display tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={handleRestart}
                className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('tryAgain', language)}</span>
              </button>

              <button
                onClick={onMainMenu}
                className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700"
              >
                <Home className="w-4 h-4" />
                <span>{t('mainMenu', language)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        language={language}
        isAudioMuted={isAudioMuted}
        onResume={() => setIsPaused(false)}
        onReplay={handleRestart}
        onMainMenu={onMainMenu}
        onToggleAudio={() => {
          const next = isAudioMuted;
          audioManager.setMusicEnabled(next);
          audioManager.setSfxEnabled(next);
          setIsAudioMuted(!next);
        }}
      />
    </div>
  );
};
