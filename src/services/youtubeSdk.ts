/**
 * YouTube Playables SDK Adapter
 * Complies with official YouTube Playables Certification and Guidelines.
 * Safely wraps window.ytgame with fallbacks for development & standalone testing.
 */

// Typing for YouTube Playables SDK
declare global {
  interface Window {
    ytgame?: {
      IN_PLAYABLES_ENV?: boolean;
      game: {
        firstFrameReady: () => void;
        gameReady: () => void;
        loadData: () => Promise<string>;
        saveData: (data: string) => Promise<void>;
      };
      system: {
        isAudioEnabled: () => boolean;
        onAudioEnabledChange: (callback: (enabled: boolean) => void) => void;
        onPause: (callback: () => void) => void;
        onResume: (callback: () => void) => void;
      };
      engagement?: {
        sendScore: (params: { value: number }) => void;
      };
    };
  }
}

class YouTubeSdkAdapter {
  private isSdkAvailable = false;
  private firstFrameCalled = false;
  private gameReadyCalled = false;
  private audioListeners: ((enabled: boolean) => void)[] = [];
  private pauseListeners: (() => void)[] = [];
  private resumeListeners: (() => void)[] = [];
  private localAudioEnabled = true;

  constructor() {
    this.init();
  }

  /**
   * Identifies whether the game is genuinely running inside YouTube Playables environment.
   * Strictly uses ytgame.IN_PLAYABLES_ENV as specified by YouTube Playables.
   */
  public isInPlayablesEnv(): boolean {
    if (typeof window === 'undefined') return false;
    // 1. Official YouTube Playables runtime flag
    if (window.ytgame && typeof window.ytgame.IN_PLAYABLES_ENV === 'boolean') {
      return window.ytgame.IN_PLAYABLES_ENV === true;
    }
    // 2. Secondary check for youtube.com iframe ancestor origin
    if (window.ytgame) {
      try {
        if (
          window.location.ancestorOrigins &&
          Array.from(window.location.ancestorOrigins).some((origin) =>
            origin.includes('youtube.com')
          )
        ) {
          return true;
        }
      } catch {
        // Cross-origin restriction
      }
    }
    return false;
  }

  private init() {
    if (typeof window !== 'undefined' && window.ytgame) {
      this.isSdkAvailable = true;
      const inPlayables = this.isInPlayablesEnv();

      // Only query platform mute if running in genuine Playables environment
      if (inPlayables && window.ytgame.system?.isAudioEnabled) {
        try {
          this.localAudioEnabled = window.ytgame.system.isAudioEnabled();
        } catch {
          this.localAudioEnabled = true;
        }
      } else {
        // Outside YouTube (e.g. AI Studio Preview, Chrome), NEVER default to muted!
        this.localAudioEnabled = true;
      }

      try {
        if (window.ytgame.system?.onAudioEnabledChange) {
          window.ytgame.system.onAudioEnabledChange((enabled: boolean) => {
            // Strictly honor platform mute changes when actually inside YouTube Playables
            if (this.isInPlayablesEnv()) {
              this.localAudioEnabled = enabled;
              this.audioListeners.forEach((fn) => fn(enabled));
            }
          });
        }
        if (window.ytgame.system?.onPause) {
          window.ytgame.system.onPause(() => {
            this.pauseListeners.forEach((fn) => fn());
          });
        }
        if (window.ytgame.system?.onResume) {
          window.ytgame.system.onResume(() => {
            this.resumeListeners.forEach((fn) => fn());
          });
        }
      } catch (err) {
        console.warn('YouTube Playables SDK listener init notice:', err);
      }
    } else {
      this.localAudioEnabled = true;
    }
  }

  /**
   * Must be called when the initial game UI/canvas has rendered its first frame.
   */
  public notifyFirstFrameReady() {
    if (this.firstFrameCalled) return;
    this.firstFrameCalled = true;

    if (this.isSdkAvailable && window.ytgame?.game?.firstFrameReady) {
      try {
        window.ytgame.game.firstFrameReady();
      } catch (e) {
        console.warn('firstFrameReady error:', e);
      }
    }
  }

  /**
   * Must be called when the game is fully loaded and interactive for the user.
   */
  public notifyGameReady() {
    if (this.gameReadyCalled) return;
    if (!this.firstFrameCalled) {
      this.notifyFirstFrameReady();
    }
    this.gameReadyCalled = true;

    if (this.isSdkAvailable && window.ytgame?.game?.gameReady) {
      try {
        window.ytgame.game.gameReady();
      } catch (e) {
        console.warn('gameReady error:', e);
      }
    }
  }

  /**
   * Check if audio is enabled by the platform / user.
   * - In YouTube Playables: strictly honors platform mute via window.ytgame.system.isAudioEnabled()
   * - Outside YouTube Playables (AI Studio Preview, Chrome, standalone): returns true so audio functions normally
   */
  public isAudioEnabled(): boolean {
    if (!this.isInPlayablesEnv()) {
      return true;
    }
    if (typeof window !== 'undefined' && window.ytgame?.system?.isAudioEnabled) {
      try {
        return Boolean(window.ytgame.system.isAudioEnabled());
      } catch {
        return this.localAudioEnabled;
      }
    }
    return this.localAudioEnabled;
  }

  public onAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
    this.audioListeners.push(callback);
    return () => {
      this.audioListeners = this.audioListeners.filter((cb) => cb !== callback);
    };
  }

  public onPause(callback: () => void): () => void {
    this.pauseListeners.push(callback);
    return () => {
      this.pauseListeners = this.pauseListeners.filter((cb) => cb !== callback);
    };
  }

  public onResume(callback: () => void): () => void {
    this.resumeListeners.push(callback);
    return () => {
      this.resumeListeners = this.resumeListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Load saved player data via YouTube Playables SDK, with strict timeout and fallback to localStorage.
   */
  public async loadData(): Promise<string | null> {
    // If YouTube SDK is present, attempt loadData with a strict 400ms timeout
    if (typeof window !== 'undefined' && window.ytgame?.game?.loadData) {
      try {
        const timeoutPromise = new Promise<string | null>((resolve) => {
          setTimeout(() => resolve(null), 400);
        });
        const ytPromise = window.ytgame.game.loadData().catch((err) => {
          console.warn('YouTube loadData rejected:', err);
          return null;
        });

        const data = await Promise.race([ytPromise, timeoutPromise]);
        if (data) return data;
      } catch (e) {
        console.warn('YouTube loadData fallback to local storage:', e);
      }
    }

    // Always fallback to localStorage if YouTube SDK is unavailable, silent, or timed out
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('food_world_save_data');
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Save player data via YouTube Playables SDK, with fallback to localStorage.
   */
  public async saveData(dataString: string): Promise<boolean> {
    // 1. Immediately persist to localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('food_world_save_data', dataString);
      }
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    // 2. Persist to YouTube SDK with timeout
    if (typeof window !== 'undefined' && window.ytgame?.game?.saveData) {
      try {
        const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 500));
        await Promise.race([
          window.ytgame.game.saveData(dataString).catch((err) => {
            console.warn('YouTube saveData rejected:', err);
          }),
          timeoutPromise,
        ]);
        return true;
      } catch (e) {
        console.warn('YouTube saveData notice:', e);
      }
    }
    return true;
  }

  /**
   * Send high score / score report to YouTube Playables engagement system.
   */
  public sendScore(score: number): void {
    if (this.isSdkAvailable && window.ytgame?.engagement?.sendScore) {
      try {
        window.ytgame.engagement.sendScore({ value: Math.max(0, Math.floor(score)) });
      } catch (e) {
        console.warn('YouTube sendScore notice:', e);
      }
    }
  }

  public isYouTubeEnvironment(): boolean {
    return this.isInPlayablesEnv();
  }
}

export const youtubeSdk = new YouTubeSdkAdapter();
