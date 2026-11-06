/**
 * In-Game Pause Modal
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types/game';
import { useTranslation } from '../localization/i18n';

interface Props {
  isOpen: boolean;
  language?: Language;
  isAudioMuted: boolean;
  onResume: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
  onToggleAudio: () => void;
}

export const PauseModal: React.FC<Props> = ({
  isOpen,
  language: propLanguage,
  isAudioMuted,
  onResume,
  onReplay,
  onMainMenu,
  onToggleAudio,
}) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3">
        <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mb-2">
          {t('pause', language)}
        </h3>

        <button
          onClick={onResume}
          className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-400/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>{t('resume', language)}</span>
        </button>

        <button
          onClick={onReplay}
          className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>{t('replay', language)}</span>
        </button>

        <button
          onClick={onToggleAudio}
          className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isAudioMuted ? t('unmuteAudio', language) : t('muteAudio', language)}</span>
        </button>

        <button
          onClick={onMainMenu}
          className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>{t('mainMenu', language)}</span>
        </button>
      </div>
    </div>
  );
};
