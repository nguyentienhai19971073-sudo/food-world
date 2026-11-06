/**
 * In-Game Header HUD
 * Responsive game status bar with score, combo, timer, lives, and audio toggle.
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Heart, Star, Sparkles, Globe } from 'lucide-react';
import { Language } from '../types/game';
import { useTranslation } from '../localization/i18n';

interface Props {
  language?: Language;
  title: string;
  score: number;
  combo: number;
  timeRemaining: number | null; // null if untimed
  maxTime?: number | null;
  livesRemaining: number | null; // null if unlimited
  maxLives?: number | null;
  starsEarned?: number;
  projectedStars?: number;
  matchedCount?: number;
  totalRequired?: number;
  wrongAttempts?: number;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onPause: () => void;
  onOpenPassport?: () => void;
}

export const HeaderHUD: React.FC<Props> = ({
  language: propLanguage,
  title,
  score,
  combo,
  timeRemaining,
  maxTime,
  livesRemaining,
  maxLives = 3,
  starsEarned = 0,
  projectedStars,
  matchedCount,
  totalRequired,
  wrongAttempts = 0,
  isAudioMuted,
  onToggleAudio,
  onPause,
  onOpenPassport,
}) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;
  const timePercent = maxTime && timeRemaining !== null ? Math.max(0, (timeRemaining / maxTime) * 100) : 100;
  const isTimeUrgent = timeRemaining !== null && timeRemaining <= 15;

  // Active star rating to display: projected during gameplay if provided, else starsEarned
  const displayStars = projectedStars !== undefined ? projectedStars : starsEarned;

  const matchProgressPercent =
    totalRequired && totalRequired > 0 && matchedCount !== undefined
      ? Math.min(100, (matchedCount / totalRequired) * 100)
      : null;

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2 flex flex-col gap-1.5 shadow-md shrink-0">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Left: Pause & Level info */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all border border-slate-700/80 shadow-sm shrink-0"
          >
            <Pause className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-white font-display tracking-tight leading-none truncate max-w-[110px] sm:max-w-[180px]">
              {title}
            </span>
            <div className="flex items-center gap-1 mt-0.5" title={`${displayStars} / 3 Sao`}>
              {[1, 2, 3].map((starIdx) => {
                const isActive = starIdx <= displayStars;
                return (
                  <Star
                    key={starIdx}
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      isActive
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                        : 'text-slate-700 fill-slate-800/80 opacity-50'
                    }`}
                  />
                );
              })}
              {projectedStars !== undefined && (
                <span
                  className={`text-[10px] font-black ml-1 px-1.5 py-0.2 rounded-md ${
                    displayStars === 3
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : displayStars === 2
                      ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                      : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                  }`}
                >
                  {displayStars}★
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Score & Combo */}
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 leading-none">
              {t('score', language)}
            </span>
            <span className="text-base sm:text-xl font-black text-amber-400 font-display tabular-nums leading-tight">
              {score.toLocaleString()}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] sm:text-sm animate-pop shadow-md shadow-orange-500/30">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              <span>{combo}x</span>
            </div>
          )}
        </div>

        {/* Right: Wrong Attempts & Lives / Audio */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Wrong attempts counter badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all border ${
              wrongAttempts === 0
                ? 'bg-slate-800/80 text-emerald-400 border-slate-700/60'
                : 'bg-rose-950/70 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-shake'
            }`}
            title={`${t('wrongAttempts', language)}: ${wrongAttempts}`}
          >
            <span className="font-mono text-xs">{wrongAttempts === 0 ? '✓' : '✗'}</span>
            <span className="tabular-nums font-black">{wrongAttempts}</span>
            <span className="hidden sm:inline text-[10px] opacity-80 uppercase">
              {wrongAttempts === 0 ? t('zeroMistakes', language) : t('mistakesCount', language, { count: wrongAttempts })}
            </span>
          </div>

          {livesRemaining !== null && (
            <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-700/80">
              {Array.from({ length: maxLives || 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    i < livesRemaining
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-slate-600 fill-slate-700/50'
                  }`}
                />
              ))}
            </div>
          )}

          {onOpenPassport && (
            <button
              onClick={onOpenPassport}
              title="World Food Passport"
              aria-label="Open Passport"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center transition-all border border-amber-500/40 shadow-sm shrink-0 active:scale-95"
            >
              <Globe className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <button
            onClick={onToggleAudio}
            aria-label="Toggle Audio"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all border border-slate-700/80 shadow-sm shrink-0"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Sub-row: Progress Bar & Ratio */}
      {matchProgressPercent !== null && totalRequired !== undefined && matchedCount !== undefined && (
        <div className="w-full flex items-center gap-2 pt-0.5">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 whitespace-nowrap">
            {t('progressLabel', language)}
          </span>
          <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${matchProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
            {matchedCount}/{totalRequired}
          </span>
        </div>
      )}

      {/* Timer Bar (if time limited) */}
      {timeRemaining !== null && (
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isTimeUrgent
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-gradient-to-r from-amber-400 to-emerald-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
          <span
            className={`text-xs font-bold tabular-nums min-w-[32px] text-right ${
              isTimeUrgent ? 'text-rose-400 animate-pulse font-black' : 'text-slate-300'
            }`}
          >
            {timeRemaining}s
          </span>
        </div>
      )}
    </header>
  );
};
