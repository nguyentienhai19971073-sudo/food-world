/**
 * Time Attack Game Mode Screen
 * 60s intense speed matching with bonus seconds and score multipliers.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { Timer, Zap, Trophy, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language?: Language;
  onMainMenu: () => void;
}

export const TimeAttackScreen: React.FC<Props> = ({ language: propLanguage, onMainMenu }) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(!audioManager.getMusicEnabled());
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [targetFeedback, setTargetFeedback] = useState<{ [countryId: string]: 'correct' | 'wrong' | null }>({});

  // Active pool of countries & dishes
  const [activeCountries, setActiveCountries] = useState<Country[]>([]);
  const [activeDishIds, setActiveDishIds] = useState<string[]>([]);

  // Initialize random 4 countries and matching dishes
  const setupRound = useCallback(() => {
    // Pick 4 diverse countries
    const shuffledCountries = [...COUNTRIES].sort(() => 0.5 - Math.random()).slice(0, 4);
    setActiveCountries(shuffledCountries);

    // Pick 5 dishes that belong to these countries
    const matchingDishes = DISHES.filter((d) =>
      shuffledCountries.some((c) => c.id === d.countryId)
    );
    const chosen = [...matchingDishes].sort(() => 0.5 - Math.random()).slice(0, 5);
    setActiveDishIds(chosen.map((d) => d.id));
  }, []);

  useEffect(() => {
    setupRound();
  }, [setupRound]);

  // Timer loop
  useEffect(() => {
    if (isPaused || isGameOver) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  const handleGameOver = async () => {
    setIsGameOver(true);
    audioManager.playTimeUp();
    audioManager.playVictory();
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const progress = saveManager.getProgress();
    const prevBest = progress.highScores.timeAttack60 || 0;
    if (score > prevBest) {
      await saveManager.save({
        highScores: {
          ...progress.highScores,
          timeAttack60: score,
        },
      });
      youtubeSdk.sendScore(score);
    }
  };

  const handleAttemptMatch = useCallback(
    (dishId: string, targetCountryId: string) => {
      if (isGameOver || isPaused) return;

      const dish = DISHES.find((d) => d.id === dishId);
      if (!dish) return;

      if (dish.countryId === targetCountryId) {
        // Correct!
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        const comboBonus = Math.min(nextCombo * 20, 200);
        setScore((prev) => prev + 100 + comboBonus);

        // Add 1 bonus second!
        setTimeRemaining((prev) => Math.min(prev + 1, 90));

        if (nextCombo > 1) {
          audioManager.playCombo(nextCombo);
        } else {
          audioManager.playCorrect();
        }

        setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: 'correct' }));
        setTimeout(() => setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: null })), 400);

        // Replace dish with another dish
        setActiveDishIds((prev) => {
          const filtered = prev.filter((id) => id !== dishId);
          // Pick fresh dish from active countries
          const candidates = DISHES.filter((d) =>
            activeCountries.some((c) => c.id === d.countryId) && !filtered.includes(d.id)
          );
          if (candidates.length > 0) {
            const randomNew = candidates[Math.floor(Math.random() * candidates.length)];
            return [...filtered, randomNew.id];
          }
          return filtered;
        });

        setSelectedDishId(null);
      } else {
        // Wrong!
        audioManager.playWrong();
        setCombo(0);
        setTimeRemaining((prev) => Math.max(0, prev - 2)); // Penalty -2s

        setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: 'wrong' }));
        setTimeout(() => setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: null })), 400);
      }
    },
    [activeCountries, combo, isGameOver, isPaused]
  );

  const handleRestart = () => {
    setScore(0);
    setCombo(0);
    setTimeRemaining(60);
    setIsGameOver(false);
    setSelectedDishId(null);
    setupRound();
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      <HeaderHUD
        language={language}
        title={t('modeTimeAttack', language)}
        score={score}
        combo={combo}
        timeRemaining={timeRemaining}
        maxTime={60}
        livesRemaining={null}
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
          <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>+1s for each match · -2s penalty for mistakes</span>
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

        {/* Dishes Tray */}
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
            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <h3 className="text-2xl font-black text-white font-display mb-1">
              {t('timesUp', language)}
            </h3>

            <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 my-4 flex flex-col items-center">
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
                <span>{t('replay', language)}</span>
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
