/**
 * Classic Journey Match Gameplay Screen
 * Featuring:
 * - Deterministic, non-stale Level Victory Evaluation (useRef tracking)
 * - 100% Z-Index Immune Global Drag Overlay
 * - Automatic victory transition upon matching final dish
 * - Watchdog verification ensuring game never hangs after matching all dishes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Country, Dish, LevelConfig, Language } from '../types/game';
import { COUNTRIES } from '../data/countries';
import { DISHES } from '../data/dishes';
import { HeaderHUD } from '../components/HeaderHUD';
import { CountryTarget } from '../components/CountryTarget';
import { DraggableDish } from '../components/DraggableDish';
import { ComboBanner } from '../components/ComboBanner';
import { useComboSystem } from '../hooks/useComboSystem';
import { ResultScene } from '../components/ResultScene';
import { PauseModal } from '../components/PauseModal';
import { NewFoodDiscoveredModal } from '../components/NewFoodDiscoveredModal';
import { PassportModal } from '../components/PassportModal';
import { DishIllustration } from '../components/DishIllustration';
import { audioManager } from '../services/audio';
import { saveManager } from '../services/saveManager';
import { t, useTranslation } from '../localization/i18n';
import {
  calculateStars,
  calculateProjectedStars,
  SCORE_WRONG_PENALTY,
  SCORE_CORRECT_BASE,
} from '../utils/starRating';
import { Hand } from 'lucide-react';

interface Props {
  level: LevelConfig;
  language?: Language;
  onLevelComplete: (score: number, wrongAttempts: number, stars?: number) => void;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onMainMenu: () => void;
  onOpenCollection: () => void;
  onOpenLevelSelect?: () => void;
}

export const ClassicGameScreen: React.FC<Props> = ({
  level,
  language: propLanguage,
  onLevelComplete,
  onNextLevel,
  onReplayLevel,
  onMainMenu,
  onOpenCollection,
  onOpenLevelSelect,
}) => {
  const { language: contextLang, t, getDishName, getDishDescription, getCountryName, getLevelTitle } = useTranslation();
  const language = propLanguage || contextLang;

  // Gameplay stats
  const [score, setScore] = useState(0);
  const comboSystem = useComboSystem();
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const wrongAttemptsRef = useRef(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(level.timeLimitSeconds);
  const [livesRemaining, setLivesRemaining] = useState<number | null>(level.maxMistakes);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(!audioManager.getMusicEnabled());

  // Real-time floating feedback toast (+100 / -25)
  const [feedbackToast, setFeedbackToast] = useState<{
    id: number;
    text: string;
    isCorrect: boolean;
  } | null>(null);

  // Active dishes queue
  const [remainingDishIds, setRemainingDishIds] = useState<string[]>([]);
  const [activeDishIds, setActiveDishIds] = useState<string[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  // DETERMINISTIC REF TRACKING: Guarantees 0 stale closures and 100% accurate match count
  const matchedDishIdsRef = useRef<Set<string>>(new Set());
  const hasCompletedLevelRef = useRef<boolean>(false);

  // Drag-and-Drop state: Top-level Floating Overlay
  const [dragState, setDragState] = useState<{ dish: Dish; x: number; y: number } | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const dragStateRef = useRef<{ dish: Dish; x: number; y: number } | null>(null);
  dragStateRef.current = dragState;

  // Animation & Feedback states
  const [targetFeedback, setTargetFeedback] = useState<{ [countryId: string]: 'correct' | 'wrong' | null }>({});
  const [wrongDishId, setWrongDishId] = useState<string | null>(null);
  const [newlyUnlockedDishes, setNewlyUnlockedDishes] = useState<Dish[]>([]);

  // Modals & Completion
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);

  // Active countries for this stage - randomized shuffle every match
  const [shuffledCountryIds, setShuffledCountryIds] = useState<string[]>(() => {
    return [...level.countryIds].sort(() => Math.random() - 0.5);
  });

  const activeCountries: Country[] = shuffledCountryIds
    .map((cid) => COUNTRIES.find((c) => c.id === cid))
    .filter((c): c is Country => Boolean(c));

  // Sequenced Celebration Queue: 'none' | 'new_food' | 'passport_stamp' | 'victory'
  const [celebrationStep, setCelebrationStep] = useState<'none' | 'new_food' | 'passport_stamp' | 'victory'>('none');
  const [celebrationNewDish, setCelebrationNewDish] = useState<Dish | null>(null);
  const [awardedPassportCountryId, setAwardedPassportCountryId] = useState<string | null>(null);
  const [showPassportDirectly, setShowPassportDirectly] = useState(false);

  // Forward ref for attemptMatch to always execute latest scope
  const attemptMatchRef = useRef<(dishId: string, targetCountryId: string) => void>(() => {});

  // Captured historical record prior to this session completing
  const initialBestStarsRef = useRef<number>(0);

  // Reset and initialize level state whenever level prop changes
  useEffect(() => {
    matchedDishIdsRef.current.clear();
    hasCompletedLevelRef.current = false;
    wrongAttemptsRef.current = 0;
    setWrongAttempts(0);
    setFeedbackToast(null);

    const progress = saveManager.getProgress();
    initialBestStarsRef.current = progress.levelScores[level.levelNumber]?.stars || 0;

    // Reshuffle country stalls on every new round/replay
    setShuffledCountryIds([...level.countryIds].sort(() => Math.random() - 0.5));
    setCelebrationStep('none');
    setCelebrationNewDish(null);
    setAwardedPassportCountryId(null);
    setShowPassportDirectly(false);

    setScore(0);
    comboSystem.resetAll();
    setTimeRemaining(level.timeLimitSeconds);
    setLivesRemaining(level.maxMistakes);
    setIsPaused(false);
    setIsGameOver(false);
    setIsVictory(false);
    setEarnedStars(0);
    setSessionStars(0);
    setSelectedDishId(null);
    setDragState(null);
    setHoveredCountryId(null);
    setNewlyUnlockedDishes([]);

    const batchSize = level.isConveyor ? 5 : Math.min(6, level.dishIds.length);
    setActiveDishIds(level.dishIds.slice(0, batchSize));
    setRemainingDishIds(level.dishIds.slice(batchSize));
  }, [level.levelNumber]);

  // Global window listeners for pointer movement & release during dragging
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return;

      // Update position of floating drag card
      setDragState({
        dish: dragStateRef.current.dish,
        x: e.clientX,
        y: e.clientY,
      });

      // Find country under pointer
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const countryElem = element?.closest('[data-country-id]') as HTMLElement | null;
      const targetId = countryElem?.getAttribute('data-country-id') || null;
      setHoveredCountryId(targetId);
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      const currentDish = dragStateRef.current.dish;

      const element = document.elementFromPoint(e.clientX, e.clientY);
      const countryElem = element?.closest('[data-country-id]') as HTMLElement | null;
      const targetId = countryElem?.getAttribute('data-country-id') || null;

      // Clean up drag state
      setDragState(null);
      setHoveredCountryId(null);

      if (targetId) {
        audioManager.playDrop();
        attemptMatchRef.current(currentDish.id, targetId);
      }
    };

    const handleGlobalPointerCancel = () => {
      setDragState(null);
      setHoveredCountryId(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    };
  }, []);

  // Timer loop: Automatically stops when game over or victory
  useEffect(() => {
    if (timeRemaining === null || isPaused || isGameOver || hasCompletedLevelRef.current) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused, isGameOver]);

  const handleTimeExpired = () => {
    if (hasCompletedLevelRef.current) return;
    hasCompletedLevelRef.current = true;
    audioManager.playTimeUp();
    audioManager.playGameOver();
    setIsGameOver(true);
    setIsVictory(false);
  };

  // CORE MATCH EVALUATOR: Deterministic, atomic match execution
  const handleAttemptMatch = useCallback(
    async (dishId: string, targetCountryId: string) => {
      if (hasCompletedLevelRef.current || isGameOver || isPaused) return;

      // Guard: already matched this dish
      if (matchedDishIdsRef.current.has(dishId)) return;

      const dish = DISHES.find((d) => d.id === dishId);
      if (!dish) return;

      const isCorrect = dish.countryId === targetCountryId;

      if (isCorrect) {
        // 1. ATOMIC RECORD: Add to mutable Set
        matchedDishIdsRef.current.add(dishId);
        const totalMatched = matchedDishIdsRef.current.size;
        const totalRequired = level.dishIds.length;

        // 2. Score & Combo
        const { bonus } = comboSystem.recordCorrectMatch();
        const addedScore = SCORE_CORRECT_BASE + bonus;
        const nextScore = score + addedScore;
        setScore(nextScore);

        // Floating feedback toast
        setFeedbackToast({
          id: Date.now(),
          text: `+${addedScore} ${t('correctNotice', language)}`,
          isCorrect: true,
        });

        // 4. Country feedback
        setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: 'correct' }));
        setTimeout(() => {
          setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: null }));
        }, 500);

        // 5. Food Encyclopedia & Country Mastery unlock
        const countryTotal = DISHES.filter((d) => d.countryId === dish.countryId).length;
        saveManager.recordDishMatch(dish.id, dish.countryId, countryTotal).then((res) => {
          if (res.isNewFood) {
            audioManager.playUnlockSparkle();
            setNewlyUnlockedDishes((prev) => [...prev, dish]);
            setCelebrationNewDish((prev) => prev || dish);
          }
          if (res.isNewStamp) {
            setAwardedPassportCountryId(dish.countryId);
          }
        });

        // 6. Update visual tray
        setActiveDishIds((prev) => prev.filter((id) => id !== dishId));
        setSelectedDishId(null);

        setRemainingDishIds((prevRemaining) => {
          if (prevRemaining.length > 0) {
            const nextDishId = prevRemaining[0];
            setActiveDishIds((prevActive) => [...prevActive, nextDishId]);
            return prevRemaining.slice(1);
          }
          return prevRemaining;
        });

        // 7. INSTANT VICTORY CHECK: When all dishes are matched, trigger victory immediately
        if (totalMatched >= totalRequired) {
          hasCompletedLevelRef.current = true;

          // Strict accuracy star evaluation:
          // 0 errors -> 3 Stars; 1-2 errors -> 2 Stars; 3+ errors -> 1 Star
          const currentStars = calculateStars(wrongAttemptsRef.current, true);
          setSessionStars(currentStars);
          setEarnedStars(currentStars);

          // Save progress before initializing ResultScene
          onLevelComplete(nextScore, wrongAttemptsRef.current, currentStars);

          // Lock gameplay, stop timer
          setIsGameOver(true);
          setIsVictory(true);

          // Audio victory
          audioManager.playVictory();

          // Smooth sequenced celebration trigger
          setTimeout(() => {
            setCelebrationStep((prev) => {
              if (prev !== 'none') return prev;
              if (celebrationNewDish) return 'new_food';
              if (awardedPassportCountryId) return 'passport_stamp';
              return 'victory';
            });
          }, 600);
        }
      } else {
        // Wrong match attempt
        wrongAttemptsRef.current += 1;
        setWrongAttempts(wrongAttemptsRef.current);

        // Deduct 25 points with score floor at 0
        setScore((prev) => Math.max(0, prev - SCORE_WRONG_PENALTY));
        comboSystem.recordWrongMatch();

        // Floating penalty toast
        setFeedbackToast({
          id: Date.now(),
          text: `-${SCORE_WRONG_PENALTY} ${t('wrongPenaltyNotice', language)}`,
          isCorrect: false,
        });

        audioManager.playWrong();
        setWrongDishId(dishId);
        setTimeout(() => setWrongDishId(null), 450);

        setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: 'wrong' }));
        setTimeout(() => {
          setTargetFeedback((prev) => ({ ...prev, [targetCountryId]: null }));
        }, 450);

        if (livesRemaining !== null) {
          const nextLives = livesRemaining - 1;
          setLivesRemaining(nextLives);
          if (nextLives <= 0) {
            hasCompletedLevelRef.current = true;
            setIsGameOver(true);
            setIsVictory(false);
            setEarnedStars(0);
            audioManager.playGameOver();
          }
        }
      }
    },
    [comboSystem, score, isGameOver, isPaused, livesRemaining, level, language, onLevelComplete]
  );

  // Keep attemptMatchRef pointing to the latest version of handleAttemptMatch
  attemptMatchRef.current = handleAttemptMatch;

  // Watchdog: If tray is empty and all dishes matched, guarantee victory triggers
  useEffect(() => {
    if (!hasCompletedLevelRef.current && !isGameOver) {
      if (
        matchedDishIdsRef.current.size >= level.dishIds.length &&
        level.dishIds.length > 0
      ) {
        hasCompletedLevelRef.current = true;
        const currentStars = calculateStars(wrongAttemptsRef.current, true);
        setSessionStars(currentStars);
        setEarnedStars(currentStars);
        onLevelComplete(score, wrongAttemptsRef.current, currentStars);
        setIsGameOver(true);
        setIsVictory(true);
        audioManager.playVictory();

        setTimeout(() => {
          setCelebrationStep((prev) => {
            if (prev !== 'none') return prev;
            if (celebrationNewDish) return 'new_food';
            if (awardedPassportCountryId) return 'passport_stamp';
            return 'victory';
          });
        }, 600);
      }
    }
  }, [activeDishIds, remainingDishIds, score, level, isGameOver, onLevelComplete, celebrationNewDish, awardedPassportCountryId]);

  // Auto-dismiss floating feedback toast after 900ms
  useEffect(() => {
    if (!feedbackToast) return;
    const timer = setTimeout(() => {
      setFeedbackToast(null);
    }, 900);
    return () => clearTimeout(timer);
  }, [feedbackToast]);

  const toggleAudio = () => {
    const next = isAudioMuted;
    audioManager.setMusicEnabled(next);
    audioManager.setSfxEnabled(next);
    setIsAudioMuted(!next);
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Real-time floating feedback toast (+100 / -25) */}
      {feedbackToast && (
        <div
          key={feedbackToast.id}
          className={`fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-[999998] px-4 py-1.5 sm:py-2 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-2xl backdrop-blur-md pointer-events-none animate-bounce-in border transition-all ${
            feedbackToast.isCorrect
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-shake'
          }`}
        >
          {feedbackToast.text}
        </div>
      )}

      {/* =========================================================================
          TOPMOST GLOBAL DRAG OVERLAY
          Guaranteed 100% z-index immune: renders at root level with pointer-events-none
          ========================================================================= */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-[999999] will-change-transform"
          style={{
            left: `${dragState.x}px`,
            top: `${dragState.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-28 min-h-[128px] sm:w-32 sm:min-h-[142px] h-auto bg-slate-900/95 border-3 border-amber-400 rounded-3xl p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(251,191,36,0.6)] flex flex-col items-center justify-between scale-105 rotate-2 animate-pulse">
            <div className="flex-1 w-full flex items-center justify-center pointer-events-none p-1">
              <DishIllustration
                iconType={dragState.dish.iconType}
                dishId={dragState.dish.id}
                className="w-15 h-15 sm:w-18 sm:h-18 filter drop-shadow-xl"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-amber-300 w-full text-center bg-slate-950/90 px-2 py-1 rounded-xl border border-amber-400/40 whitespace-normal break-words leading-tight">
              {getDishName(dragState.dish)}
            </span>
          </div>
        </div>
      )}

      {/* Top Header HUD */}
      <HeaderHUD
        language={language}
        title={getLevelTitle(level)}
        score={score}
        combo={comboSystem.combo}
        timeRemaining={timeRemaining}
        maxTime={level.timeLimitSeconds}
        livesRemaining={livesRemaining}
        maxLives={level.maxMistakes}
        starsEarned={earnedStars}
        projectedStars={calculateProjectedStars(wrongAttempts)}
        matchedCount={matchedDishIdsRef.current.size}
        totalRequired={level.dishIds.length}
        wrongAttempts={wrongAttempts}
        isAudioMuted={isAudioMuted}
        onToggleAudio={toggleAudio}
        onPause={() => setIsPaused(true)}
        onOpenPassport={() => setShowPassportDirectly(true)}
      />

      {/* Floating Combo Popup with Framer Motion Bronze -> Silver -> Gold Scaling */}
      <ComboBanner
        combo={comboSystem.combo}
        tier={comboSystem.tier}
        scale={comboSystem.scale}
        popKey={comboSystem.popKey}
        bonus={comboSystem.currentBonus}
        language={language}
      />

      {/* Main Play Area */}
      <div className="flex-1 w-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden max-w-5xl mx-auto">
        {/* Country Targets Area (Top/Center) */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
              {selectedDishId ? t('tapTutorialPrompt', language) : t('dragOrTapHint', language)}
            </span>
          </div>

          {/* Grid of Culinary Kiosks */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 w-full">
            {activeCountries.map((country) => (
              <CountryTarget
                key={country.id}
                country={country}
                language={language}
                isHovered={hoveredCountryId === country.id}
                isHighlighted={Boolean(selectedDishId)}
                feedbackState={targetFeedback[country.id]}
                onSelectCountry={() => {
                  if (selectedDishId) {
                    attemptMatchRef.current(selectedDishId, country.id);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Level 1 Tutorial Helper */}
        {level.hasTutorial && activeDishIds.length > 0 && matchedDishIdsRef.current.size === 0 && (
          <div className="w-full flex items-center justify-center py-1">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold animate-bounce shadow-md">
              <Hand className="w-4 h-4 text-amber-400" />
              <span>{t('tutorialPrompt', language)}</span>
            </div>
          </div>
        )}

        {/* Dedicated Dish Detail Inspector Panel (Triggered by Tapping Any Dish) */}
        {selectedDishId && (() => {
          const selectedDish = DISHES.find((d) => d.id === selectedDishId);
          if (!selectedDish) return null;
          return (
            <div className="w-full mb-2 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/95 to-amber-500/15 border border-amber-400/50 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-pop shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-slate-800/90 border border-amber-400/40 flex items-center justify-center p-1 shrink-0 shadow-inner">
                  <DishIllustration iconType={selectedDish.iconType} dishId={selectedDish.id} className="w-9 h-9 sm:w-11 sm:h-11" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-amber-300 leading-tight whitespace-normal break-words">
                      {getDishName(selectedDish)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-bold shrink-0">
                      {t('selectedDishPrompt', language) || 'SELECTED'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-tight mt-0.5 whitespace-normal break-words">
                    {getDishDescription(selectedDish)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDishId(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs shrink-0 cursor-pointer transition-all border border-slate-700 active:scale-95"
                title="Deselect"
              >
                ✕
              </button>
            </div>
          );
        })()}

        {/* Food Dishes Tray (Bottom) */}
        <div className="w-full bg-slate-900/90 rounded-3xl p-3 sm:p-4 border border-slate-800 shadow-2xl backdrop-blur-md shrink-0">
          <div className="w-full flex items-center justify-center gap-2.5 sm:gap-4 overflow-x-auto py-1">
            {activeDishIds.map((dishId) => {
              const dish = DISHES.find((d) => d.id === dishId);
              if (!dish) return null;

              const isDraggingThis = dragState?.dish.id === dishId;

              return (
                <DraggableDish
                  key={dishId}
                  dish={dish}
                  language={language}
                  isSelected={selectedDishId === dishId}
                  isWrong={wrongDishId === dishId}
                  isDraggingThis={isDraggingThis}
                  onSelect={() => {
                    audioManager.playSelectFood();
                    setSelectedDishId(selectedDishId === dishId ? null : dishId);
                  }}
                  onStartDrag={(d, e) => {
                    audioManager.playPickup();
                    setDragState({
                      dish: d,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ResultScene: Pops up when celebrationStep is 'victory' or isGameOver without victory */}
      <ResultScene
        isOpen={isGameOver && (celebrationStep === 'victory' || !isVictory)}
        isVictory={isVictory}
        score={score}
        comboBonus={comboSystem.comboBonusTotal}
        sessionStars={sessionStars}
        currentStars={sessionStars}
        stars={sessionStars}
        bestStars={initialBestStarsRef.current}
        wrongAttempts={wrongAttempts}
        levelNumber={level.levelNumber}
        newlyUnlockedDishes={newlyUnlockedDishes}
        language={language}
        onNextLevel={onNextLevel}
        onReplay={onReplayLevel}
        onMainMenu={onMainMenu}
        onOpenCollection={onOpenCollection}
        onOpenLevelSelect={onOpenLevelSelect}
      />

      {/* New Food Discovered Celebration Popup */}
      <NewFoodDiscoveredModal
        dish={celebrationStep === 'new_food' ? celebrationNewDish : null}
        onClose={() => {
          if (awardedPassportCountryId) {
            setCelebrationStep('passport_stamp');
          } else {
            setCelebrationStep('victory');
          }
        }}
      />

      {/* World Food Passport Celebration & Browser Modal */}
      <PassportModal
        isOpen={celebrationStep === 'passport_stamp' || showPassportDirectly}
        awardedCountryId={celebrationStep === 'passport_stamp' ? awardedPassportCountryId : null}
        onCelebrationComplete={() => {
          setCelebrationStep('victory');
        }}
        onClose={() => {
          setShowPassportDirectly(false);
          if (celebrationStep === 'passport_stamp') {
            setCelebrationStep('victory');
          }
        }}
      />

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        language={language}
        isAudioMuted={isAudioMuted}
        onResume={() => setIsPaused(false)}
        onReplay={onReplayLevel}
        onMainMenu={onMainMenu}
        onToggleAudio={toggleAudio}
      />
    </div>
  );
};
