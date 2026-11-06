/**
 * Food Memory Game Mode Screen
 * Flip cards to match international dishes with their country flags.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Star, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { Language, Dish, Country } from '../types/game';
import { DISHES } from '../data/dishes';
import { COUNTRIES } from '../data/countries';
import { DishIllustration } from '../components/DishIllustration';
import { audioManager } from '../services/audio';
import { saveManager } from '../services/saveManager';
import { youtubeSdk } from '../services/youtubeSdk';
import { useTranslation } from '../localization/i18n';
import confetti from 'canvas-confetti';

interface Props {
  language?: Language;
  onBack: () => void;
}

interface MemoryCard {
  uid: string;
  type: 'dish' | 'country';
  countryId: string;
  dish?: Dish;
  country?: Country;
  isFlipped: boolean;
  isMatched: boolean;
}

export const FoodMemoryScreen: React.FC<Props> = ({ language: propLanguage, onBack }) => {
  const { language: contextLang, t, getDishName, getCountryName } = useTranslation();
  const language = propLanguage || contextLang;
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const PAIR_COUNT = 6; // 12 cards total

  const setupCards = () => {
    // Pick 6 random distinct countries with matching dishes
    const shuffledDishes = [...DISHES].sort(() => 0.5 - Math.random());
    const selectedPairs: { dish: Dish; country: Country }[] = [];
    const usedCountries = new Set<string>();

    for (const d of shuffledDishes) {
      if (!usedCountries.has(d.countryId)) {
        const country = COUNTRIES.find((c) => c.id === d.countryId);
        if (country) {
          usedCountries.add(d.countryId);
          selectedPairs.push({ dish: d, country });
          if (selectedPairs.length >= PAIR_COUNT) break;
        }
      }
    }

    const deck: MemoryCard[] = [];
    selectedPairs.forEach((pair, idx) => {
      // Dish Card
      deck.push({
        uid: `dish-${pair.dish.id}-${idx}`,
        type: 'dish',
        countryId: pair.country.id,
        dish: pair.dish,
        isFlipped: false,
        isMatched: false,
      });
      // Country Card
      deck.push({
        uid: `country-${pair.country.id}-${idx}`,
        type: 'country',
        countryId: pair.country.id,
        country: pair.country,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    setCards(deck.sort(() => 0.5 - Math.random()));
    setFlippedUids([]);
    setMoves(0);
    setMatchesCount(0);
    setScore(0);
    setIsGameOver(false);
  };

  useEffect(() => {
    setupCards();
  }, []);

  const handleCardClick = (card: MemoryCard) => {
    if (isBusy || card.isFlipped || card.isMatched || flippedUids.includes(card.uid)) return;

    audioManager.playCardFlip();
    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    // Update flip state
    setCards((prev) =>
      prev.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c))
    );

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsBusy(true);

      const [uid1, uid2] = nextFlipped;
      const card1 = cards.find((c) => c.uid === uid1);
      const card2 = card;

      if (card1 && card2 && card1.countryId === card2.countryId && card1.type !== card2.type) {
        // MATCH!
        setTimeout(() => {
          audioManager.playCorrect();
          setScore((s) => s + 250);
          setCards((prev) =>
            prev.map((c) =>
              c.uid === uid1 || c.uid === uid2
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedUids([]);
          setIsBusy(false);

          setMatchesCount((m) => {
            const next = m + 1;
            if (next >= PAIR_COUNT) {
              handleVictory();
            }
            return next;
          });
        }, 500);
      } else {
        // MISMATCH!
        setTimeout(() => {
          audioManager.playWrong();
          setCards((prev) =>
            prev.map((c) =>
              c.uid === uid1 || c.uid === uid2 ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedUids([]);
          setIsBusy(false);
        }, 900);
      }
    }
  };

  const handleVictory = async () => {
    setIsGameOver(true);
    audioManager.playVictory();
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const progress = saveManager.getProgress();
    const finalScore = score + Math.max(0, 1000 - moves * 40);
    setScore(finalScore);

    if (finalScore > (progress.highScores.foodMemoryMaxScore || 0)) {
      await saveManager.save({
        highScores: {
          ...progress.highScores,
          foodMemoryMaxScore: finalScore,
        },
      });
      youtubeSdk.sendScore(finalScore);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
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
              {t('modeFoodMemory', language)}
            </h1>
            <span className="text-xs font-semibold text-slate-400">
              Pairs matched: {matchesCount} / {PAIR_COUNT}
            </span>
          </div>
        </div>

        {/* Moves & Score */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Moves</span>
            <span className="text-sm sm:text-base font-black text-white tabular-nums">
              {moves}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('score', language)}</span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-display tabular-nums">
              {score}
            </span>
          </div>

          <button
            onClick={setupCards}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all border border-slate-700 active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Grid of memory cards */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <div
                key={card.uid}
                onClick={() => handleCardClick(card)}
                className={`relative aspect-[3/4] rounded-2xl border cursor-pointer select-none transition-all duration-300 transform perspective-1000
                  ${
                    card.isMatched
                      ? 'bg-emerald-500/20 border-emerald-400/80 shadow-lg shadow-emerald-500/20 scale-95'
                      : isRevealed
                      ? 'bg-slate-800 border-amber-400/80 shadow-xl'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/80 hover:border-slate-500 hover:scale-102 shadow-md'
                  }
                `}
              >
                {isRevealed ? (
                  <div className="w-full h-full flex flex-col items-center justify-between p-2.5 sm:p-3 animate-pop">
                    {card.type === 'dish' && card.dish ? (
                      <>
                        <span className="text-[9px] uppercase font-bold text-amber-400">{t('dishCard', language)}</span>
                        <div className="flex-1 flex items-center justify-center">
                          <DishIllustration iconType={card.dish.iconType} className="w-12 h-12 sm:w-14 sm:h-14" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-snug whitespace-normal break-words w-full px-1">
                          {getDishName(card.dish)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] uppercase font-bold text-blue-400">{t('countryCard', language)}</span>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-4xl sm:text-5xl filter drop-shadow">
                            {card.country?.flagEmoji}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-snug whitespace-normal break-words w-full px-1">
                          {card.country ? getCountryName(card.country) : ''}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  // Card Back
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700 text-amber-400 font-display font-black text-lg">
                      ?
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Victory Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>

            <h3 className="text-2xl font-black text-white font-display mb-1">
              {t('memoryMaster', language)}
            </h3>
            <span className="text-xs text-slate-400 mb-4">
              {t('clearedInMoves', language, { moves })}
            </span>

            <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-5 flex flex-col items-center">
              <span className="text-xs uppercase font-bold text-slate-400">
                {t('score', language)}
              </span>
              <span className="text-3xl font-black text-amber-400 font-display tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            <button
              onClick={setupCards}
              className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('replay', language)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
