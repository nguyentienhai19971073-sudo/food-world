/**
 * Level Select Screen
 * 120 Levels organized across 6 Continent Sectors.
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, Lock, Play, Trophy } from 'lucide-react';
import { Language, Continent, UserProgress } from '../types/game';
import { useTranslation } from '../localization/i18n';
import { getLevelsBySector } from '../data/levels';

interface Props {
  language?: Language;
  progress: UserProgress;
  onSelectLevel: (levelNumber: number) => void;
  onBack: () => void;
}

const SECTORS: { id: Continent; key: string; range: string; icon: string }[] = [
  { id: 'asia', key: 'sectorAsia', range: '1-25', icon: '🏯' },
  { id: 'europe', key: 'sectorEurope', range: '26-50', icon: '🏰' },
  { id: 'americas', key: 'sectorAmericas', range: '51-70', icon: '🗽' },
  { id: 'africa', key: 'sectorAfrica', range: '71-85', icon: '🦁' },
  { id: 'oceania', key: 'sectorOceania', range: '86-100', icon: '🦘' },
  { id: 'world', key: 'sectorWorld', range: '101-120', icon: '🌍' },
];

export const LevelSelectScreen: React.FC<Props> = ({
  language: propLanguage,
  progress,
  onSelectLevel,
  onBack,
}) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;
  // Determine current active sector based on unlocked level
  const initialSector = SECTORS.find((s) => {
    const [start, end] = s.range.split('-').map(Number);
    return progress.unlockedLevels >= start && progress.unlockedLevels <= end;
  })?.id || 'asia';

  const [activeSector, setActiveSector] = useState<Continent>(initialSector);

  const levelsInSector = getLevelsBySector(activeSector);

  // Compute total stars earned
  const totalStarsEarned = Object.values(progress.levelScores).reduce(
    (acc, val) => acc + (val.stars || 0),
    0
  );

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
              {t('levels', language)}
            </h1>
            <span className="text-xs font-semibold text-slate-400">
              {t('stagesSubtitle', language)}
            </span>
          </div>
        </div>

        {/* Stars counter & Quick Play */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs sm:text-sm font-black text-amber-300 font-display tabular-nums">
              {totalStarsEarned} / 360
            </span>
          </div>

          <button
            onClick={() => onSelectLevel(progress.unlockedLevels)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{t('continueStage', language, { stage: progress.unlockedLevels })}</span>
          </button>
        </div>
      </header>

      {/* Sector Navigation Tabs */}
      <div className="w-full bg-slate-900/70 border-b border-slate-800 px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        {SECTORS.map((sector) => {
          const isActive = activeSector === sector.id;
          return (
            <button
              key={sector.id}
              onClick={() => setActiveSector(sector.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{sector.icon}</span>
              <span>{t(sector.key, language)}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-amber-500/40 text-slate-950 font-black' : 'bg-slate-700 text-slate-400'
              }`}>
                {sector.range}
              </span>
            </button>
          );
        })}
      </div>

      {/* Level Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {levelsInSector.map((level) => {
            const isUnlocked = level.levelNumber <= progress.unlockedLevels;
            const scoreData = progress.levelScores[level.levelNumber];
            const stars = scoreData?.stars || 0;
            const isCurrent = level.levelNumber === progress.unlockedLevels;

            return (
              <button
                key={level.levelNumber}
                onClick={() => isUnlocked && onSelectLevel(level.levelNumber)}
                disabled={!isUnlocked}
                className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all aspect-square select-none
                  ${
                    isUnlocked
                      ? isCurrent
                        ? 'bg-gradient-to-b from-amber-500/25 to-orange-500/20 border-2 border-amber-400 shadow-xl shadow-amber-500/30 scale-105 active:scale-95'
                        : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800 active:scale-95 shadow-md'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-40 cursor-not-allowed'
                  }
                `}
              >
                {/* Level Number */}
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="font-display">#{level.levelNumber}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>

                {/* Center Icon */}
                <div className="flex-1 flex items-center justify-center">
                  {isUnlocked ? (
                    <span className="text-2xl sm:text-3xl font-black text-white font-display">
                      {level.levelNumber}
                    </span>
                  ) : (
                    <Lock className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3.5 h-3.5 ${
                        starIdx <= stars
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow'
                          : 'text-slate-700 fill-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
