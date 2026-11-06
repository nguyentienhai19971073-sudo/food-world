/**
 * Speed Challenge Screen (Vòng Chơi Tốc Độ)
 * Fast-paced adrenaline rush matching mode triggered every 5 main stages.
 * Features:
 * - 60s / 45s / 30s countdown timer with ticking heartbeat sound
 * - Continuous infinite dish spawning
 * - Multiplier combos (x3, x5 GREAT!, x10 AMAZING!, x20 LEGENDARY!)
 * - Dedicated High Score tracking & independent record saving
 * - Seamless transition to next main stage upon completion
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Country, Dish, Language } from '../types/game';
import { COUNTRIES } from '../data/countries';
import { DISHES } from '../data/dishes';
import { CountryTarget } from '../components/CountryTarget';
import { DraggableDish } from '../components/DraggableDish';
import { ComboBanner } from '../components/ComboBanner';
import { useComboSystem } from '../hooks/useComboSystem';
import { audioManager } from '../services/audio';
import { saveManager } from '../services/saveManager';
import { useTranslation } from '../localization/i18n';
import { Timer, Zap, Trophy, Flame, Play, ArrowRight, Award, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  language?: Language;
  nextMainLevel: number;
  onContinue: () => void;
  onExitToMenu: () => void;
}

export const SpeedChallengeScreen: React.FC<Props> = ({
  language: propLanguage,
  nextMainLevel,
  onContinue,
  onExitToMenu,
}) => {
  const { language: contextLang, t, getDishName, getCountryName } = useTranslation();
  const language = propLanguage || contextLang;

  // Determine duration based on progression:
  // Level 5-20: 60s, Level 25-60: 45s, Level 65+: 30s
  const initialDuration = nextMainLevel <= 20 ? 60 : nextMainLevel <= 60 ? 45 : 30;

  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [dishesMatched, setDishesMatched] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const comboSystem = useComboSystem();

  // Summary record stats
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [personalBest, setPersonalBest] = useState<number>(0);

  // Active stalls (4 random countries)
  const [stalls, setStalls] = useState<Country[]>([]);
  // Tray of 4 dishes
  const [activeDishes, setActiveDishes] = useState<Dish[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  // Feedback animations
  const [targetFeedback, setTargetFeedback] = useState<{ [countryId: string]: 'correct' | 'wrong' | null }>({});
  const [wrongDishId, setWrongDishId] = useState<string | null>(null);

  // Drag-and-drop overlay
  const [dragState, setDragState] = useState<{ dish: Dish; x: number; y: number } | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  // Helper to pick random element
  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Helper to generate a new dish from active stalls
  const generateDishForStalls = useCallback((availableStalls: Country[], excludeDishIds: string[] = []): Dish => {
    const stall = pickRandom(availableStalls);
    const countryDishes = DISHES.filter((d) => d.countryId === stall.id && !excludeDishIds.includes(d.id));
    if (countryDishes.length > 0) {
      return pickRandom(countryDishes);
    }
    // Fallback if all dishes currently on tray
    const fallbackDishes = DISHES.filter((d) => d.countryId === stall.id);
    return fallbackDishes.length > 0 ? pickRandom(fallbackDishes) : DISHES[0];
  }, []);

  // Initialize Speed Challenge round
  useEffect(() => {
    // Pick 4 random diverse countries
    const shuffledCountries = [...COUNTRIES].sort(() => Math.random() - 0.5).slice(0, 4);
    setStalls(shuffledCountries);

    // Pick 4 initial dishes belonging to these 4 countries
    const initialDishes: Dish[] = [];
    const usedIds: string[] = [];
    for (let i = 0; i < 4; i++) {
      const d = generateDishForStalls(shuffledCountries, usedIds);
      initialDishes.push(d);
      usedIds.push(d.id);
    }
    setActiveDishes(initialDishes);

    // Start upbeat gameplay music
    audioManager.startBgm('gameplay');
  }, [generateDishForStalls]);

  // Countdown timer loop
  useEffect(() => {
    if (!isPlaying || isTimeUp) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }

        // Ticking heartbeat audio during last 10 seconds
        if (prev <= 10) {
          audioManager.playSpeedTick(prev <= 5);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isTimeUp]);

  // Handle Time's Up trigger
  const handleTimeUp = async () => {
    setIsPlaying(false);
    setIsTimeUp(true);
    audioManager.playTimeUp();

    // Check & save speed challenge high score
    const result = await saveManager.recordSpeedChallengeScore(score);
    setIsNewRecord(result.isNewHighScore);
    setPersonalBest(result.bestScore);
  };

  // Match evaluation
  const attemptMatch = (dishId: string, countryId: string) => {
    if (!isPlaying || isTimeUp) return;

    const dish = activeDishes.find((d) => d.id === dishId);
    if (!dish) return;

    if (dish.countryId === countryId) {
      // CORRECT MATCH
      audioManager.playCorrect();
      const { bonus } = comboSystem.recordCorrectMatch();
      const pointsEarned = 100 + bonus;

      setScore((s) => s + pointsEarned);
      setDishesMatched((m) => m + 1);

      // Flash stall
      setTargetFeedback({ [countryId]: 'correct' });
      setTimeout(() => setTargetFeedback({}), 350);

      // Track country mastery & food unlock
      saveManager.recordDishMatch(dish.id, dish.countryId, DISHES.filter((d) => d.countryId === dish.countryId).length);

      // Replace matched dish with a fresh dish
      setActiveDishes((prev) => {
        const remaining = prev.filter((d) => d.id !== dishId);
        const newDish = generateDishForStalls(stalls, remaining.map((d) => d.id));
        return [...remaining, newDish];
      });

      setSelectedDishId(null);
    } else {
      // WRONG MATCH
      audioManager.playWrong();
      comboSystem.recordWrongMatch();
      setMistakes((w) => w + 1);

      // Visual feedback
      setTargetFeedback({ [countryId]: 'wrong' });
      setWrongDishId(dishId);
      setTimeout(() => {
        setTargetFeedback({});
        setWrongDishId(null);
      }, 400);

      setSelectedDishId(null);
    }
  };

  // Tap-to-match or Drag-to-match handlers
  const handleDishClick = (dishId: string) => {
    if (selectedDishId === dishId) {
      setSelectedDishId(null);
    } else {
      setSelectedDishId(dishId);
      audioManager.playSelectFood();
    }
  };

  const handleStallClick = (countryId: string) => {
    if (selectedDishId) {
      attemptMatch(selectedDishId, countryId);
    }
  };

  // Drag handlers
  const handleStartDrag = (dish: Dish, e: React.PointerEvent) => {
    if (!isPlaying || isTimeUp) return;
    audioManager.playPickup();
    setDragState({ dish, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;
      setDragState((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const stallEl = el?.closest('[data-country-id]');
      const cid = stallEl?.getAttribute('data-country-id') || null;
      setHoveredCountryId(cid);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragState) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const stallEl = el?.closest('[data-country-id]');
      const cid = stallEl?.getAttribute('data-country-id');

      if (cid) {
        attemptMatch(dragState.dish.id, cid);
      } else {
        audioManager.playDrop();
      }

      setDragState(null);
      setHoveredCountryId(null);
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState]);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Top Adrenaline HUD */}
      <header className="w-full bg-slate-900/95 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between shadow-xl shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase font-display">
                {t('speedChallengeTitle')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                BONUS STAGE
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400">
              {t('speedChallengeSubtitle')}
            </p>
          </div>
        </div>

        {/* Dynamic Countdown Clock */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all ${
              timeLeft <= 10
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse ring-4 ring-rose-500/30 scale-105'
                : 'bg-slate-800 border-amber-400/50 text-amber-300'
            }`}
          >
            <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-400 animate-spin-slow' : 'text-amber-400'}`} />
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">
              {timeLeft}s
            </span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('score')}</span>
            <span className="text-lg font-black text-white font-mono">{score}</span>
          </div>
        </div>
      </header>

      {/* Floating Combo Multiplier */}
      <div className="w-full flex justify-center py-1">
        <ComboBanner
          combo={comboSystem.combo}
          tier={comboSystem.tier}
          scale={comboSystem.scale}
          popKey={comboSystem.popKey}
          bonus={comboSystem.currentBonus}
          language={language}
        />
      </div>

      {/* Main Playfield: Country Food Stalls (Grid of 4) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-2 flex flex-col justify-around items-center gap-3 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full justify-items-center">
          {stalls.map((country) => (
            <CountryTarget
              key={country.id}
              country={country}
              language={language}
              isHovered={hoveredCountryId === country.id}
              isHighlighted={Boolean(selectedDishId && activeDishes.find((d) => d.id === selectedDishId)?.countryId === country.id)}
              feedbackState={targetFeedback[country.id]}
              onSelectCountry={() => handleStallClick(country.id)}
            />
          ))}
        </div>

        {/* Instruction Banner */}
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>{t('dragOrTapHint')}</span>
        </div>

        {/* Continuous Dish Conveyor / Tray */}
        <div className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-3 shadow-2xl flex items-center justify-around gap-2 sm:gap-4">
          {activeDishes.map((dish) => (
            <DraggableDish
              key={dish.id}
              dish={dish}
              language={language}
              isSelected={selectedDishId === dish.id}
              isWrong={wrongDishId === dish.id}
              isDraggingThis={dragState?.dish.id === dish.id}
              onSelect={() => handleDishClick(dish.id)}
              onStartDrag={handleStartDrag}
            />
          ))}
        </div>
      </main>

      {/* Dragging Overlay */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
          style={{ left: dragState.x, top: dragState.y }}
        >
          <div className="w-28 sm:w-32 min-h-[128px] h-auto p-2.5 rounded-2xl bg-amber-500/90 border-2 border-white shadow-2xl scale-110 rotate-3 flex flex-col items-center">
            <span className="text-3xl filter drop-shadow">
              {COUNTRIES.find((c) => c.id === dragState.dish.countryId)?.flagEmoji}
            </span>
            <span className="text-xs font-black text-slate-950 text-center mt-1 whitespace-normal break-words leading-tight">
              {getDishName(dragState.dish)}
            </span>
          </div>
        </div>
      )}

      {/* Time's Up Summary Modal */}
      {isTimeUp && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-3 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center transform animate-pop ring-4 ring-amber-500/20">
            {/* Header Badge */}
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-inner">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>

            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              {t('speedChallengeSummary')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display mt-1 mb-2 tracking-tight">
              {t('timeUp')}
            </h2>

            {/* New High Score Pill */}
            {isNewRecord && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider mb-4 animate-bounce">
                <Sparkles className="w-4 h-4" />
                {t('newRecord')}
              </span>
            )}

            {/* Score Showcase */}
            <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-bold uppercase">{t('speedChallengeScore')}</span>
              <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight my-1">
                {score}
              </span>
              <span className="text-xs text-slate-400">
                Personal Best: <strong className="text-amber-300 font-mono">{personalBest}</strong>
              </span>
            </div>

            {/* Performance Stats Grid */}
            <div className="w-full grid grid-cols-3 gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-750 flex flex-col items-center">
                <span className="text-xs text-emerald-400 font-black">{dishesMatched}</span>
                <span className="text-[10px] text-slate-400 uppercase">{t('dishesMatched')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-750 flex flex-col items-center">
                <span className="text-xs text-rose-400 font-black">{mistakes}</span>
                <span className="text-[10px] text-slate-400 uppercase">{t('wrongMatches')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-750 flex flex-col items-center">
                <span className="text-xs text-amber-300 font-black">{comboSystem.maxCombo}x</span>
                <span className="text-[10px] text-slate-400 uppercase">{t('maxCombo')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  audioManager.playClick();
                  onContinue();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('continueJourney')} (Level {nextMainLevel})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  audioManager.playClick();
                  onExitToMenu();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition-colors"
              >
                {t('mainMenu')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
