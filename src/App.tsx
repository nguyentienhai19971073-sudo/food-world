/**
 * FOOD WORLD – Global Food Match
 * Complete YouTube Playables HTML5 Game
 * Main Application Orchestrator & State Machine
 */

import React, { useState, useEffect } from 'react';
import { GameMode, Language, UserProgress, LevelConfig } from './types/game';
import { DEFAULT_USER_PROGRESS, saveManager } from './services/saveManager';
import { youtubeSdk } from './services/youtubeSdk';
import { audioManager } from './services/audio';
import { getLevel } from './data/levels';
import { calculateStars } from './utils/starRating';
import { I18nProvider } from './localization/i18n';

// Screens & Modals
import { MainMenuScreen } from './screens/MainMenuScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { ClassicGameScreen } from './screens/ClassicGameScreen';
import { TimeAttackScreen } from './screens/TimeAttackScreen';
import { FoodMemoryScreen } from './screens/FoodMemoryScreen';
import { EndlessScreen } from './screens/EndlessScreen';
import { FoodCollectionScreen } from './screens/FoodCollectionScreen';
import { SpeedChallengeScreen } from './screens/SpeedChallengeScreen';
import { DeveloperAssetManager } from './screens/DeveloperAssetManager';
import { SettingsModal } from './components/SettingsModal';
import { PassportModal } from './components/PassportModal';
import { AudioTestPanel } from './components/AudioTestPanel';

type AppScreen =
  | 'menu'
  | 'level_select'
  | 'classic_game'
  | 'speed_challenge'
  | 'time_attack'
  | 'food_memory'
  | 'endless'
  | 'collection'
  | 'asset_manager';

export default function App() {
  const initialData = saveManager.getProgress();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [progress, setProgress] = useState<UserProgress>(initialData);
  const [isLoaded, setIsLoaded] = useState(true); // Instant load: all assets & code are bundled
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(initialData.unlockedLevels || 1);
  const [showSettings, setShowSettings] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(initialData.settings.musicEnabled ?? true);
  const [sfxEnabled, setSfxEnabled] = useState(initialData.settings.sfxEnabled ?? true);
  const [musicVolume, setMusicVolume] = useState(initialData.settings.musicVolume ?? 0.7);
  const [sfxVolume, setSfxVolume] = useState(initialData.settings.sfxVolume ?? 0.8);
  const [language, setLanguage] = useState<Language>(initialData.settings.language || 'vi');

  // Initialize YouTube Playables SDK & Player Save State
  useEffect(() => {
    // 1. Notify YouTube that first frame is rendered
    youtubeSdk.notifyFirstFrameReady();

    let isMounted = true;
    const syncPlayerData = async () => {
      try {
        const data = await saveManager.load();
        if (!isMounted) return;
        setProgress(data);
        setLanguage(data.settings.language || 'vi');
        setMusicEnabled(data.settings.musicEnabled ?? true);
        setSfxEnabled(data.settings.sfxEnabled ?? true);
        const mVol = data.settings.musicVolume ?? 0.7;
        const sVol = data.settings.sfxVolume ?? 0.8;
        setMusicVolume(mVol);
        setSfxVolume(sVol);
        audioManager.setMusicVolume(mVol);
        audioManager.setSfxVolume(sVol);
        audioManager.setMusicEnabled(data.settings.musicEnabled ?? true);
        audioManager.setSfxEnabled(data.settings.sfxEnabled ?? true);
        setCurrentLevelNumber(data.unlockedLevels || 1);
      } catch (e) {
        console.warn('Sync player data warning:', e);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
          // 2. Notify YouTube that game is interactive and ready
          youtubeSdk.notifyGameReady();
        }
      }
    };

    syncPlayerData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Screen-based BGM track management with smooth crossfade
  useEffect(() => {
    if (currentScreen === 'menu' || currentScreen === 'level_select' || currentScreen === 'collection') {
      audioManager.startBgm('menu');
    } else if (currentScreen !== 'asset_manager') {
      audioManager.startBgm('gameplay');
    } else {
      audioManager.pauseBgm();
    }
  }, [currentScreen]);

  const [replayNonce, setReplayNonce] = useState(0);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [activeLevelConfig, setActiveLevelConfig] = useState<LevelConfig>(() =>
    getLevel(initialData.unlockedLevels || 1)
  );

  const loadAndStartLevel = (lvlNum: number) => {
    audioManager.ensureReady();
    audioManager.unlock();
    const dynamicLevel = getLevel(lvlNum);
    setCurrentLevelNumber(lvlNum);
    setActiveLevelConfig(dynamicLevel);
    setReplayNonce((n) => n + 1);
    setCurrentScreen('classic_game');
  };

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    await saveManager.save({
      settings: {
        ...progress.settings,
        language: newLang,
      },
    });
  };

  const handleToggleMusic = async () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    audioManager.setMusicEnabled(next);
    await saveManager.save({
      settings: {
        ...progress.settings,
        musicEnabled: next,
      },
    });
  };

  const handleToggleSfx = async () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    audioManager.setSfxEnabled(next);
    await saveManager.save({
      settings: {
        ...progress.settings,
        sfxEnabled: next,
      },
    });
  };

  const handleMusicVolumeChange = async (vol: number) => {
    setMusicVolume(vol);
    audioManager.setMusicVolume(vol);
    await saveManager.save({
      settings: {
        ...progress.settings,
        musicVolume: vol,
      },
    });
  };

  const handleSfxVolumeChange = async (vol: number) => {
    setSfxVolume(vol);
    audioManager.setSfxVolume(vol);
    await saveManager.save({
      settings: {
        ...progress.settings,
        sfxVolume: vol,
      },
    });
  };

  const handleResetProgress = async () => {
    await saveManager.resetProgress();
    const fresh = saveManager.getProgress();
    setProgress(fresh);
    loadAndStartLevel(1);
    setCurrentScreen('menu');
  };

  const handleStartClassic = () => {
    loadAndStartLevel(progress.unlockedLevels || 1);
  };

  const handleSelectLevel = (lvlNum: number) => {
    loadAndStartLevel(lvlNum);
  };

  // Explicitly calculate star count based on wrongAttempts variable to bind the
  // 0-3 star result directly to the current session performance
  const handleLevelComplete = async (score: number, wrongAttempts: number, explicitStars?: number) => {
    const sessionStars = explicitStars !== undefined ? explicitStars : calculateStars(wrongAttempts, true);
    await saveManager.recordLevelComplete(currentLevelNumber, score, sessionStars);
    setProgress(saveManager.getProgress());
    return sessionStars;
  };

  const handleNextLevel = () => {
    if (currentLevelNumber >= 120) {
      setCurrentScreen('menu');
      return;
    }
    // Speed Challenge bonus round appears every 5 levels (Level 5 -> Speed Challenge -> Level 6)
    if (currentLevelNumber % 5 === 0) {
      setCurrentScreen('speed_challenge');
    } else {
      loadAndStartLevel(currentLevelNumber + 1);
    }
  };

  const handleReplayLevel = () => {
    loadAndStartLevel(currentLevelNumber);
  };

  const handleSelectMode = (mode: GameMode) => {
    audioManager.ensureReady();
    audioManager.unlock();
    switch (mode) {
      case 'classic':
        handleStartClassic();
        break;
      case 'time_attack':
        setCurrentScreen('time_attack');
        break;
      case 'food_memory':
        setCurrentScreen('food_memory');
        break;
      case 'endless':
        setCurrentScreen('endless');
        break;
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen bg-[#121624] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-display font-bold text-base text-amber-300 mb-3">
          Loading Food World...
        </span>
        <button
          onClick={() => {
            audioManager.ensureReady();
            audioManager.unlock();
            setIsLoaded(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          Vào chơi ngay / Start Game
        </button>
      </div>
    );
  }

  const currentLevelConfig: LevelConfig = activeLevelConfig;

  const content = (
    <div className="w-full h-full flex flex-col bg-[#121624] overflow-hidden select-none relative">
      {currentScreen === 'menu' && (
        <MainMenuScreen
          language={language}
          progress={progress}
          onStartClassic={handleStartClassic}
          onOpenLevelSelect={() => setCurrentScreen('level_select')}
          onOpenCollection={() => setCurrentScreen('collection')}
          onOpenPassport={() => setShowPassportModal(true)}
          onStartSpeedChallenge={() => setCurrentScreen('speed_challenge')}
          onSelectMode={handleSelectMode}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAssetManager={() => setCurrentScreen('asset_manager')}
        />
      )}

      {currentScreen === 'level_select' && (
        <LevelSelectScreen
          language={language}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onBack={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'classic_game' && (
        <ClassicGameScreen
          key={`classic-lvl-${currentLevelNumber}-${replayNonce}`}
          level={currentLevelConfig}
          language={language}
          onLevelComplete={handleLevelComplete}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
          onMainMenu={() => setCurrentScreen('menu')}
          onOpenCollection={() => setCurrentScreen('collection')}
          onOpenLevelSelect={() => setCurrentScreen('level_select')}
        />
      )}

      {currentScreen === 'speed_challenge' && (
        <SpeedChallengeScreen
          language={language}
          nextMainLevel={currentLevelNumber + 1}
          onContinue={() => {
            loadAndStartLevel(currentLevelNumber + 1);
          }}
          onExitToMenu={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'time_attack' && (
        <TimeAttackScreen
          language={language}
          onMainMenu={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'food_memory' && (
        <FoodMemoryScreen
          language={language}
          onBack={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'endless' && (
        <EndlessScreen
          language={language}
          onMainMenu={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'collection' && (
        <FoodCollectionScreen
          language={language}
          unlockedFoodIds={progress.unlockedFoodIds}
          onBack={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'asset_manager' && (
        <DeveloperAssetManager
          language={language}
          onBack={() => setCurrentScreen('menu')}
          onTestLevel={(lvl) => {
            loadAndStartLevel(lvl);
          }}
        />
      )}

      {/* Global World Food Passport Modal */}
      <PassportModal
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        language={language}
        musicEnabled={musicEnabled}
        sfxEnabled={sfxEnabled}
        musicVolume={musicVolume}
        sfxVolume={sfxVolume}
        onClose={() => setShowSettings(false)}
        onLanguageChange={handleLanguageChange}
        onToggleMusic={handleToggleMusic}
        onToggleSfx={handleToggleSfx}
        onMusicVolumeChange={handleMusicVolumeChange}
        onSfxVolumeChange={handleSfxVolumeChange}
        onTestMusic={() => audioManager.testMusic()}
        onTestSfx={() => audioManager.testSfx()}
        onResetProgress={handleResetProgress}
      />
    </div>
  );

  return (
    <I18nProvider language={language} onLanguageChange={handleLanguageChange}>
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
        {/* 9:16 Mobile Simulator Shell or Full Screen */}
        {isMobileFrame ? (
          <div className="w-full max-w-[420px] h-full max-h-[860px] rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl relative flex flex-col">
            {content}
          </div>
        ) : (
          content
        )}

        {/* Floating Developer Toolbar (Bottom Right) */}
        <div className="fixed bottom-3 right-3 z-[99999] flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-2xl shadow-xl backdrop-blur-md opacity-75 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title="Toggle 9:16 Mobile Viewport Frame"
            className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 border border-slate-700"
          >
            {isMobileFrame ? '16:9 Full' : '9:16 Mobile'}
          </button>

          {currentScreen !== 'asset_manager' && (
            <button
              onClick={() => setCurrentScreen('asset_manager')}
              title="Open Asset Manager"
              className="px-2 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-[10px] font-black text-slate-950 shadow-md"
            >
              Asset Manager
            </button>
          )}
        </div>

        {/* Dedicated Audio Test Mode (Dev & AI Studio Preview; hidden in YouTube Playables) */}
        <AudioTestPanel />
      </div>
    </I18nProvider>
  );
}
