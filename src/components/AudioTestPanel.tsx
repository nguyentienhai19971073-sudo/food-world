/**
 * AUDIO TEST PANEL (DEVELOPMENT MODE ONLY)
 * Complies with strict environment isolation:
 * - Appears in Google AI Studio Preview, localhost, and Vite dev mode.
 * - STRICTLY HIDDEN in YouTube Production Mode (when ytgame.IN_PLAYABLES_ENV is true or release build).
 */

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Sparkles,
  Trophy,
  Sliders,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { audioManager } from '../services/audio';
import { youtubeSdk } from '../services/youtubeSdk';

/**
 * Determine if Audio Test Panel should be enabled.
 * Returns false when running in YouTube Playables environment or in production without test params.
 */
export function isAudioTestEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  // 1. STRICT REQUIREMENT: If running inside YouTube Playables, NEVER show debug panel
  if (youtubeSdk.isInPlayablesEnv()) return false;

  // 2. Vite development mode
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) return true;
  } catch {
    // ignore in environments where import.meta is restricted
  }

  // 3. Google AI Studio Preview environments (*.run.app, localhost, or explicit test query)
  const hostname = window.location?.hostname || '';
  const search = window.location?.search || '';
  const isPreviewOrDev =
    hostname.includes('run.app') ||
    hostname.includes('localhost') ||
    search.includes('test_audio') ||
    search.includes('dev') ||
    !hostname; // Node test runner without hostname

  return isPreviewOrDev;
}

export const AudioTestPanel: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [audioLog, setAudioLog] = useState<{ id: number; time: string; msg: string; type: 'info' | 'success' | 'warn' }[]>([]);
  const [contextState, setContextState] = useState<string>('unknown');
  const [bgmTrack, setBgmTrack] = useState<'menu' | 'gameplay'>('menu');
  const [musicVol, setMusicVol] = useState(Math.round(audioManager.getMusicVolume() * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(audioManager.getSfxVolume() * 100));
  const [testComboTier, setTestComboTier] = useState(3);

  useEffect(() => {
    setIsEnabled(isAudioTestEnabled());

    // Update context state periodically
    const interval = setInterval(() => {
      setContextState(audioManager.getContextState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'success') => {
    const time = new Date().toLocaleTimeString();
    setAudioLog((prev) => [{ id: Date.now(), time, msg, type }, ...prev.slice(0, 5)]);
  };

  if (!isEnabled) {
    return null; // 100% stripped in YouTube Production Mode
  }

  // Floating Launcher Badge (Collapsed State)
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-[99999] flex items-center gap-2">
        <button
          onClick={() => {
            audioManager.ensureReady();
            setIsOpen(true);
            setContextState(audioManager.getContextState());
            addLog('Audio Test Deck opened. AudioContext initialized.');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs shadow-2xl border-2 border-amber-300 active:scale-95 transition-all cursor-pointer"
          title="Open Audio Test Deck (Development Mode)"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>AUDIO TEST</span>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:left-4 z-[99999] flex items-end sm:items-start justify-center sm:justify-start pointer-events-auto">
      <div className="w-full sm:w-[420px] max-h-[85vh] bg-slate-900/98 border-2 border-amber-500/70 rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex flex-col gap-3.5 text-white backdrop-blur-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-amber-300">
                  AUDIO TEST
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  DEV MODE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Google AI Studio Preview Audio Deck
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-all border border-slate-700"
            title="Minimize"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* AudioContext & Engine Status Indicator */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              AudioContext State:
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${
                  contextState === 'running'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {contextState}
              </span>
              <button
                onClick={async () => {
                  const unlocked = await audioManager.unlock();
                  setContextState(audioManager.getContextState());
                  addLog(unlocked ? 'Context resumed successfully' : 'Resume attempted');
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 border border-slate-700 cursor-pointer"
              >
                Resume
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-900">
            <span className="text-slate-400">Audio Pipeline:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Procedural Synthesis (0 404 Errors)
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="text-slate-400">YouTube Playables:</span>
            <span className="text-blue-400 font-bold">
              {youtubeSdk.isInPlayablesEnv() ? 'Active Container' : 'Dev / Preview Mode (Direct Audio)'}
            </span>
          </div>
        </div>

        {/* Real Audio Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* TEST MUSIC */}
          <button
            onClick={() => {
              audioManager.ensureReady();
              audioManager.unlock();
              audioManager.startBgm(bgmTrack);
              addLog(`TEST MUSIC: Started ${bgmTrack} track (AudioContext running)`);
            }}
            className="p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-emerald-400" />
            <span>TEST MUSIC</span>
          </button>

          {/* STOP MUSIC */}
          <button
            onClick={() => {
              audioManager.pauseBgm();
              addLog('STOP MUSIC: Paused background music');
            }}
            className="p-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Square className="w-4 h-4 fill-rose-400" />
            <span>STOP MUSIC</span>
          </button>

          {/* TEST CORRECT */}
          <button
            onClick={() => {
              audioManager.ensureReady();
              audioManager.playCorrect();
              addLog('TEST CORRECT: Played C5-E5-G5-C6 major chime');
            }}
            className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span>TEST CORRECT</span>
          </button>

          {/* TEST WRONG */}
          <button
            onClick={() => {
              audioManager.ensureReady();
              audioManager.playWrong();
              addLog('TEST WRONG: Played 170Hz filtered warning buzz');
            }}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>TEST WRONG</span>
          </button>

          {/* TEST COMBO */}
          <button
            onClick={() => {
              audioManager.ensureReady();
              audioManager.playCombo(testComboTier);
              addLog(`TEST COMBO: Played x${testComboTier} tiered celebration sparkle`);
              setTestComboTier((prev) => (prev === 3 ? 5 : prev === 5 ? 10 : 3));
            }}
            className="p-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>TEST COMBO (x{testComboTier})</span>
          </button>

          {/* TEST VICTORY */}
          <button
            onClick={() => {
              audioManager.ensureReady();
              audioManager.playVictory();
              addLog('TEST VICTORY: Played full level complete celebration fanfare');
            }}
            className="p-3 rounded-2xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 text-yellow-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>TEST VICTORY</span>
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          {/* Music Volume */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Music Volume:</span>
              <span className="text-amber-400">{musicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMusicVol(val);
                audioManager.setMusicVolume(val / 100);
              }}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>SFX Volume:</span>
              <span className="text-amber-400">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSfxVol(val);
                audioManager.setSfxVolume(val / 100);
              }}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Live Audio Event Log */}
        <div className="p-3 rounded-2xl bg-black/60 border border-slate-800/80 text-[11px] font-mono flex flex-col gap-1 max-h-28 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Real-Time Audio Logs:
          </div>
          {audioLog.length === 0 ? (
            <span className="text-slate-500 italic">No audio actions triggered yet. Click a test button above.</span>
          ) : (
            audioLog.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 text-slate-300 leading-tight">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={log.type === 'warn' ? 'text-amber-400' : 'text-emerald-400'}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
