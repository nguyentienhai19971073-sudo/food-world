/**
 * Settings Modal
 * Complete Audio, Language, Guide & Reset Controls.
 * Fully compliant with YouTube Playables Audio System & Device Controls.
 */

import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Globe,
  RotateCcw,
  HelpCircle,
  Play,
  Sliders,
  Check,
} from 'lucide-react';
import { Language } from '../types/game';
import { useTranslation } from '../localization/i18n';
import { youtubeSdk } from '../services/youtubeSdk';

interface Props {
  isOpen: boolean;
  language?: Language;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume?: number;
  sfxVolume?: number;
  onClose: () => void;
  onLanguageChange: (lang: Language) => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onMusicVolumeChange?: (vol: number) => void;
  onSfxVolumeChange?: (vol: number) => void;
  onTestMusic?: () => void;
  onTestSfx?: () => void;
  onResetProgress: () => void;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  language: propLanguage,
  musicEnabled,
  sfxEnabled,
  musicVolume = 0.7,
  sfxVolume = 0.8,
  onClose,
  onLanguageChange,
  onToggleMusic,
  onToggleSfx,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onTestMusic,
  onTestSfx,
  onResetProgress,
}) => {
  const { language: contextLang, setLanguage, t } = useTranslation();
  const language = propLanguage || contextLang;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [testingMusic, setTestingMusic] = useState(false);
  const [testingSfx, setTestingSfx] = useState(false);

  if (!isOpen) return null;

  const isYtMuted = youtubeSdk.isInPlayablesEnv() && !youtubeSdk.isAudioEnabled();

  const handleTestMusic = () => {
    setTestingMusic(true);
    if (onTestMusic) onTestMusic();
    setTimeout(() => setTestingMusic(false), 2000);
  };

  const handleTestSfx = () => {
    setTestingSfx(true);
    if (onTestSfx) onTestSfx();
    setTimeout(() => setTestingSfx(false), 800);
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
            <span>{t('settings', language)}</span>
          </h3>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* YouTube System Mute Notice (if active) */}
        {isYtMuted && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
            <VolumeX className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              {t('ytMutedNotice', language)}
            </span>
          </div>
        )}

        {/* Audio Settings Section */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('audioSettingsTitle', language)}</span>
          </div>

          {/* Music Controls Box */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">{t('music', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestMusic}
                  disabled={!musicEnabled}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                    testingMusic
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-slate-700/80 hover:bg-slate-600 text-amber-300 border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                  title="Test Music snippet"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{testingMusic ? t('testing', language) : t('testMusic', language)}</span>
                </button>

                <button
                  onClick={onToggleMusic}
                  aria-label="Toggle Music"
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    musicEnabled ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                      musicEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Music Volume Slider */}
            {onMusicVolumeChange && (
              <div className="flex items-center gap-3 pt-1 border-t border-slate-700/50">
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap min-w-[55px]">
                  {t('volume', language)}
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                  disabled={!musicEnabled}
                  className="flex-1 accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-mono font-bold text-amber-400 min-w-[32px] text-right">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Sound FX Controls Box */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">{t('sfx', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestSfx}
                  disabled={!sfxEnabled}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                    testingSfx
                      ? 'bg-emerald-400 text-slate-950 border-emerald-300 animate-pulse'
                      : 'bg-slate-700/80 hover:bg-slate-600 text-emerald-300 border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                  title="Test Sound Effects"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{testingSfx ? t('testing', language) : t('testSfx', language)}</span>
                </button>

                <button
                  onClick={onToggleSfx}
                  aria-label="Toggle Sound Effects"
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    sfxEnabled ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                      sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* SFX Volume Slider */}
            {onSfxVolumeChange && (
              <div className="flex items-center gap-3 pt-1 border-t border-slate-700/50">
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap min-w-[55px]">
                  {t('volume', language)}
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
                  disabled={!sfxEnabled}
                  className="flex-1 accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 min-w-[32px] text-right">
                  {Math.round(sfxVolume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {t('language', language)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-xs font-bold cursor-pointer ${
                  language === lang.code
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {language === lang.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* How To Play */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 mb-5">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>{t('howToPlayTitle', language)}</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <li>• {t('howToPlay1', language)}</li>
            <li>• {t('howToPlay2', language)}</li>
            <li>• {t('howToPlay3', language)}</li>
          </ul>
        </div>

        {/* Reset Progress */}
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 px-4 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetProgress', language)}</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center flex flex-col gap-2">
            <span className="text-xs font-semibold text-rose-300 leading-tight">
              {t('resetConfirm', language)}
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                {t('yesReset', language)}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t('cancel', language)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
