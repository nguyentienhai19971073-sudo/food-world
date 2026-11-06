/**
 * Main Menu Screen
 * Commercial-grade presentation with animated floating delicacies, world map graphics,
 * game mode selector, collection launcher, and settings.
 */

import React, { useState } from 'react';
import { Play, BookOpen, Settings, Trophy, Sparkles, Globe2, Flame, Timer, Brain, Layers, Zap } from 'lucide-react';
import { Language, UserProgress, GameMode } from '../types/game';
import { useTranslation } from '../localization/i18n';
import { DishIllustration } from '../components/DishIllustration';
import { audioManager } from '../services/audio';

interface Props {
  language?: Language;
  progress: UserProgress;
  onStartClassic: () => void;
  onOpenLevelSelect: () => void;
  onOpenCollection: () => void;
  onOpenPassport: () => void;
  onStartSpeedChallenge: () => void;
  onSelectMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
  onOpenAssetManager?: () => void;
}

export const MainMenuScreen: React.FC<Props> = ({
  language: propLanguage,
  progress,
  onStartClassic,
  onOpenLevelSelect,
  onOpenCollection,
  onOpenPassport,
  onStartSpeedChallenge,
  onSelectMode,
  onOpenSettings,
  onOpenAssetManager,
}) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;
  const [showModeModal, setShowModeModal] = useState(false);

  // Total stars
  const totalStars = Object.values(progress.levelScores).reduce(
    (acc, val) => acc + (val.stars || 0),
    0
  );

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Background World Map & Floating Delicacies */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-20">
        <svg viewBox="0 0 1000 500" className="w-[1200px] max-w-none text-slate-600 fill-current">
          {/* Stylized world continents silhouettes */}
          <path d="M150,120 Q180,80 240,110 Q280,140 260,200 Q200,220 160,180 Z" />
          <path d="M220,240 Q260,260 280,340 Q240,420 200,380 Q180,300 220,240 Z" />
          <path d="M460,100 Q540,80 580,120 Q560,180 500,200 Q460,160 460,100 Z" />
          <path d="M480,220 Q540,240 560,340 Q520,400 480,360 Q440,300 480,220 Z" />
          <path d="M600,100 Q780,80 840,160 Q800,240 700,240 Q620,180 600,100 Z" />
          <path d="M740,300 Q840,300 860,380 Q800,420 740,380 Z" />
        </svg>
      </div>

      {/* Floating Animated Iconic Foods */}
      <div className="absolute top-12 left-6 sm:left-16 animate-float pointer-events-none opacity-80">
        <DishIllustration iconType="soup_bowl" className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <div className="absolute top-14 right-6 sm:right-20 animate-float pointer-events-none opacity-80" style={{ animationDelay: '1s' }}>
        <DishIllustration iconType="sushi_roll" className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <div className="absolute bottom-24 left-8 sm:left-24 animate-float pointer-events-none opacity-80" style={{ animationDelay: '1.5s' }}>
        <DishIllustration iconType="pizza_slice" className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <div className="absolute bottom-20 right-8 sm:right-24 animate-float pointer-events-none opacity-80" style={{ animationDelay: '0.5s' }}>
        <DishIllustration iconType="taco" className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>

      {/* Top Header Controls (Settings & Stats & Asset Manager) */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-black text-amber-300 font-display tabular-nums">
            {totalStars} ★
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-semibold text-slate-300">
            {t('level', language)} {progress.unlockedLevels}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAssetManager && (
            <button
              onClick={() => {
                audioManager.playClick();
                onOpenAssetManager();
              }}
              title={t('assetManagerTitle', language)}
              className="px-3 py-2 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 flex items-center gap-1.5 transition-all border border-amber-400/50 shadow-md active:scale-95 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('assetManager', language)}</span>
            </button>
          )}

          <button
            onClick={() => {
              audioManager.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-all border border-slate-800 shadow-md active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Center Hero: Logo & Play Call to Action */}
      <div className="flex flex-col items-center justify-center text-center z-10 my-auto max-w-lg w-full">
        {/* Cute Mascot Crown */}
        <div className="flex items-center gap-2 mb-2 animate-bounce">
          <span className="text-2xl">🌍</span>
          <span className="text-2xl">🍜</span>
          <span className="text-2xl">🍕</span>
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 drop-shadow-lg leading-tight mb-1">
          {t('gameTitle', language)}
        </h1>

        <span className="text-xs sm:text-sm font-bold text-amber-300/90 uppercase tracking-widest mb-6 block">
          {t('gameSubtitle', language)}
        </span>

        {/* Big Juicy PLAY Button */}
        <button
          onClick={() => {
            audioManager.ensureReady();
            audioManager.unlock().then(() => {
              audioManager.playClick();
              onStartClassic();
            });
          }}
          className="w-full max-w-xs py-4 sm:py-5 px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xl sm:text-2xl shadow-2xl shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-amber-200 mb-4 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-slate-950" />
          <span>{t('play', language)}</span>
        </button>

        {/* Secondary Buttons Row */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <button
            onClick={() => {
              audioManager.playClick();
              setShowModeModal(true);
            }}
            className="py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm border border-slate-800 hover:border-slate-700 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-orange-400" />
            <span>{t('modes', language)}</span>
          </button>

          <button
            onClick={() => {
              audioManager.playClick();
              onOpenLevelSelect();
            }}
            className="py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm border border-slate-800 hover:border-slate-700 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>{t('levels', language)}</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer: Collection & Passport Dual Launchers */}
      <footer className="w-full max-w-lg z-10 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => {
            audioManager.playClick();
            onOpenCollection();
          }}
          className="py-2.5 px-3 rounded-2xl bg-slate-900/85 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 text-slate-200 transition-all flex items-center gap-2.5 shadow-md text-left active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-white block truncate">
              {t('collection', language)}
            </span>
            <span className="text-[10px] text-amber-300 font-bold block">
              {progress.unlockedFoodIds.length}/164
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            onOpenPassport();
          }}
          className="py-2.5 px-3 rounded-2xl bg-slate-900/85 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 text-slate-200 transition-all flex items-center gap-2.5 shadow-md text-left active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
            <Globe2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-white block truncate">
              {t('passportTitle', language)}
            </span>
            <span className="text-[10px] text-emerald-300 font-bold block">
              {progress.passportStamps?.length || 0}/42 {t('stampsCollected', language)}
            </span>
          </div>
        </button>
      </footer>

      {/* Modes Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-2.5 max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-black text-white font-display mb-1 text-center">
              {t('modes', language)}
            </h3>

            {/* Mode 1: Classic Journey */}
            <button
              onClick={() => {
                audioManager.ensureReady();
                audioManager.playClick();
                setShowModeModal(false);
                onSelectMode('classic');
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center gap-3 group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-white block">
                  {t('modeClassic', language)}
                </span>
                <span className="text-xs text-slate-400 block leading-tight">
                  {t('modeClassicDesc', language)}
                </span>
              </div>
            </button>

            {/* Mode 2: Speed Challenge (Vòng chơi tốc độ) */}
            <button
              onClick={() => {
                audioManager.ensureReady();
                audioManager.playClick();
                setShowModeModal(false);
                onStartSpeedChallenge();
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-left transition-all flex items-center gap-3 group active:scale-98 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-300 block">
                    {t('speedChallengeMode', language)}
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-orange-500 text-slate-950 uppercase">
                    HOT
                  </span>
                </div>
                <span className="text-xs text-slate-300 block leading-tight">
                  {t('speedChallengeSubtitle', language)}
                </span>
              </div>
            </button>

            {/* Mode 3: Time Attack */}
            <button
              onClick={() => {
                audioManager.ensureReady();
                audioManager.playClick();
                setShowModeModal(false);
                onSelectMode('time_attack');
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center gap-3 group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                <Timer className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-white block">
                  {t('modeTimeAttack', language)}
                </span>
                <span className="text-xs text-slate-400 block leading-tight">
                  {t('modeTimeAttackDesc', language)}
                </span>
              </div>
            </button>

            {/* Mode 4: Food Memory */}
            <button
              onClick={() => {
                audioManager.ensureReady();
                audioManager.playClick();
                setShowModeModal(false);
                onSelectMode('food_memory');
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center gap-3 group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-white block">
                  {t('modeFoodMemory', language)}
                </span>
                <span className="text-xs text-slate-400 block leading-tight">
                  {t('modeFoodMemoryDesc', language)}
                </span>
              </div>
            </button>

            {/* Mode 5: Endless Challenge */}
            <button
              onClick={() => {
                audioManager.ensureReady();
                audioManager.playClick();
                setShowModeModal(false);
                onSelectMode('endless');
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center gap-3 group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-white block">
                  {t('modeEndless', language)}
                </span>
                <span className="text-xs text-slate-400 block leading-tight">
                  {t('modeEndlessDesc', language)}
                </span>
              </div>
            </button>

            <button
              onClick={() => setShowModeModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition-colors mt-2"
            >
              {t('cancel', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
