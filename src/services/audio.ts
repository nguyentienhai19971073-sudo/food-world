/**
 * Professional Web Audio Synthesis Engine for FOOD WORLD
 * High-fidelity, zero-external-dependency procedural sound & music engine.
 * Fully compliant with YouTube Playables Audio Certification & Browser Autoplay Policies.
 */

import { youtubeSdk } from './youtubeSdk';

export type BgmTrack = 'menu' | 'gameplay';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Track & Playback state
  private currentTrack: BgmTrack | null = null;
  private isBgmPlaying = false;
  private schedulerTimer: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;

  // User Settings (0.0 to 1.0)
  private userMusicEnabled = true;
  private userSfxEnabled = true;
  private userMusicVolume = 0.7;
  private userSfxVolume = 0.8;

  // Autoplay & Unlock state
  private isUnlocked = false;

  constructor() {
    this.setupYouTubeListeners();
    this.setupGlobalUnlockListeners();
  }

  /**
   * Listens to YouTube Playables SDK events.
   * If running inside YouTube, strictly honors the platform mute state.
   */
  private setupYouTubeListeners() {
    youtubeSdk.onAudioEnabledChange((enabled) => {
      this.updateMasterMute();
      if (enabled && this.userMusicEnabled && !this.isBgmPlaying && this.currentTrack) {
        this.startBgm(this.currentTrack);
      }
    });

    youtubeSdk.onPause(() => {
      this.pauseBgm();
    });

    youtubeSdk.onResume(() => {
      if (this.userMusicEnabled && youtubeSdk.isAudioEnabled()) {
        this.resumeBgm();
      }
    });
  }

  /**
   * Sets up global touch & click listeners so the first interaction seamlessly unlocks
   * the Web Audio context without any console warnings or browser autoplay blocks.
   */
  private setupGlobalUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.unlock().then(() => {
        if (this.isUnlocked && this.userMusicEnabled && !this.isBgmPlaying) {
          this.startBgm(this.currentTrack || 'menu');
        }
      });
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
  }

  /**
   * Initializes Web Audio Context and internal gain graph if not already initialized
   */
  private initAudioGraph() {
    if (this.ctx || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.updateGainValues();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateMasterMute();
    } catch (e) {
      console.warn('Web Audio initialization notice:', e);
    }
  }

  /**
   * Synchronously guarantees the audio graph exists and attempts immediate resume
   * when triggered within a browser user-gesture (click, touch, keydown).
   */
  public ensureReady(): boolean {
    this.initAudioGraph();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return Boolean(this.ctx);
  }

  /**
   * Primary Web Audio Context Initializer & Unlocker
   */
  public async unlock(): Promise<boolean> {
    try {
      this.ensureReady();

      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          await this.ctx.resume();
        }

        // Play a 1-sample inaudible buffer to force iOS / Chrome autoplay unlock
        if (!this.isUnlocked) {
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);
          this.isUnlocked = true;
        }
      }

      return this.isUnlocked;
    } catch (e) {
      console.warn('Web Audio unlock notice:', e);
      return false;
    }
  }

  private updateGainValues() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.musicGain) {
      const targetMusicGain = this.userMusicEnabled ? this.userMusicVolume * 0.28 : 0;
      this.musicGain.gain.setTargetAtTime(targetMusicGain, now, 0.05);
    }
    if (this.sfxGain) {
      const targetSfxGain = this.userSfxEnabled ? this.userSfxVolume * 0.42 : 0;
      this.sfxGain.gain.setTargetAtTime(targetSfxGain, now, 0.05);
    }
  }

  private updateMasterMute() {
    if (!this.masterGain || !this.ctx) return;
    const allowedByYT = youtubeSdk.isAudioEnabled();
    this.masterGain.gain.setTargetAtTime(allowedByYT ? 1.0 : 0.0, this.ctx.currentTime, 0.05);
  }

  // =========================================================================
  // VOLUME & TOGGLE CONTROLS
  // =========================================================================

  public setMusicEnabled(enabled: boolean) {
    this.userMusicEnabled = enabled;
    this.updateGainValues();
    if (!enabled) {
      this.pauseBgm();
    } else {
      this.resumeBgm();
    }
  }

  public getMusicEnabled(): boolean {
    return this.userMusicEnabled;
  }

  public setSfxEnabled(enabled: boolean) {
    this.userSfxEnabled = enabled;
    this.updateGainValues();
  }

  public getSfxEnabled(): boolean {
    return this.userSfxEnabled;
  }

  public setMusicVolume(volume: number) {
    this.userMusicVolume = Math.max(0, Math.min(1, volume));
    this.updateGainValues();
  }

  public getMusicVolume(): number {
    return this.userMusicVolume;
  }

  public setSfxVolume(volume: number) {
    this.userSfxVolume = Math.max(0, Math.min(1, volume));
    this.updateGainValues();
  }

  public getSfxVolume(): number {
    return this.userSfxVolume;
  }

  public getContextState(): string {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public getCurrentTrack(): BgmTrack | null {
    return this.currentTrack;
  }

  public getSampleRate(): number {
    return this.ctx ? this.ctx.sampleRate : 44100;
  }

  // =========================================================================
  // HIGH-FIDELITY BGM PROCEDURAL SYNTHESIZER (LOOKAHEAD SCHEDULER)
  // =========================================================================

  /**
   * Starts a smooth BGM track:
   * - 'menu': "Bistro Fiesta" (Upbeat, cheerful marimba & acoustic chords)
   * - 'gameplay': "Chef's Flow" (Relaxing, lo-fi café rhythmic puzzle groove)
   */
  public startBgm(track: BgmTrack = 'menu') {
    this.unlock();

    // If same track already running, don't restart
    if (this.isBgmPlaying && this.currentTrack === track) return;

    // Cross-fade: If another track is running, smoothly fade it out
    if (this.isBgmPlaying) {
      this.fadeTransitionTo(track);
      return;
    }

    this.currentTrack = track;
    this.isBgmPlaying = true;
    this.currentStep = 0;

    if (!this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Start lookahead scheduling loop
    this.runScheduler();
  }

  private fadeTransitionTo(nextTrack: BgmTrack) {
    if (!this.ctx || !this.musicGain) {
      this.currentTrack = nextTrack;
      return;
    }
    const now = this.ctx.currentTime;
    // Fade out current
    this.musicGain.gain.setTargetAtTime(0, now, 0.15);

    setTimeout(() => {
      this.stopScheduler();
      this.currentTrack = nextTrack;
      this.currentStep = 0;
      if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this.updateGainValues();
        this.isBgmPlaying = true;
        this.runScheduler();
      }
    }, 200);
  }

  public pauseBgm() {
    this.isBgmPlaying = false;
    this.stopScheduler();
  }

  public resumeBgm() {
    if (this.userMusicEnabled && !this.isBgmPlaying) {
      this.startBgm(this.currentTrack || 'menu');
    }
  }

  private stopScheduler() {
    if (this.schedulerTimer !== null) {
      window.clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private runScheduler = () => {
    if (!this.isBgmPlaying || !this.ctx) return;

    // Lookahead: Schedule notes up to 150ms in advance
    const lookaheadSec = 0.15;
    while (this.nextNoteTime < this.ctx.currentTime + lookaheadSec) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      const stepDuration = this.currentTrack === 'menu' ? 0.22 : 0.26; // 136 BPM (menu) vs 115 BPM (gameplay)
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 32;
    }

    this.schedulerTimer = window.setTimeout(this.runScheduler, 40);
  };

  /**
   * Procedural note generation per musical step
   */
  private scheduleStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;
    if (!this.userMusicEnabled || !youtubeSdk.isAudioEnabled()) return;

    if (this.currentTrack === 'menu') {
      this.scheduleMenuStep(step, time);
    } else {
      this.scheduleGameplayStep(step, time);
    }
  }

  /**
   * "Bistro Fiesta" - Bright Mediterranean marimba & acoustic groove
   */
  private scheduleMenuStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    // Chords: Cmaj - Gmaj - Amin - Fmaj (each 8 steps)
    const chordIdx = Math.floor(step / 8);
    const chords = [
      [261.63, 329.63, 392.0], // C, E, G
      [196.0, 246.94, 293.66], // G, B, D
      [220.0, 261.63, 329.63], // A, C, E
      [174.61, 220.0, 261.63], // F, A, C
    ];
    const bassNotes = [130.81, 98.0, 110.0, 87.31]; // C3, G2, A2, F2

    // 1. Bassline on beat 0 and 4
    if (step % 4 === 0) {
      this.playSynthNote(bassNotes[chordIdx], time, 0.4, 'triangle', 0.12);
    }

    // 2. Acoustic Chord Arpeggios
    const chord = chords[chordIdx];
    const arpeggioNote = chord[step % 3];
    this.playSynthNote(arpeggioNote * 2, time, 0.18, 'sine', 0.05);

    // 3. Melodic Kalimba / Marimba Lead
    const leadNotes = [
      523.25, 0, 659.25, 783.99, 1046.5, 783.99, 659.25, 0,
      587.33, 0, 698.46, 880.0, 987.77, 880.0, 698.46, 0,
      659.25, 0, 783.99, 987.77, 1174.66, 987.77, 783.99, 0,
      880.0, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 0,
    ];

    const melodyFreq = leadNotes[step];
    if (melodyFreq > 0) {
      this.playSynthNote(melodyFreq, time, 0.22, 'sine', 0.08);
    }

    // 4. Subtle Woodblock Percussion on off-beats
    if (step % 2 === 1) {
      this.playPercussion(800, time, 0.02, 0.03);
    }
  }

  /**
   * "Chef's Flow" - Relaxing Lo-Fi Café Rhythmic Puzzle Groove
   */
  private scheduleGameplayStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    // Sophisticated jazzy chords: Cmaj7 - Am7 - Dm7 - G7
    const chordIdx = Math.floor(step / 8);
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];
    const bassNotes = [65.41, 55.0, 73.42, 49.0]; // C2, A1, D2, G1

    // 1. Warm Sub Bass on beats 0 and 3
    if (step % 4 === 0 || step % 4 === 3) {
      this.playSynthNote(bassNotes[chordIdx], time, 0.5, 'sine', 0.14);
    }

    // 2. Soft Rhodes / Electric Piano chord pad
    if (step % 4 === 0) {
      const chord = chords[chordIdx];
      chord.forEach((freq) => {
        this.playSynthNote(freq, time, 0.8, 'triangle', 0.04);
      });
    }

    // 3. Gentle Melodic Accents
    const puzzleMelody = [
      0, 659.25, 0, 783.99, 0, 987.77, 0, 783.99,
      0, 587.33, 0, 698.46, 0, 880.0, 0, 698.46,
      0, 659.25, 0, 880.0, 0, 1046.5, 0, 880.0,
      0, 783.99, 0, 659.25, 0, 587.33, 0, 523.25,
    ];

    const note = puzzleMelody[step];
    if (note > 0) {
      this.playSynthNote(note, time, 0.35, 'sine', 0.06);
    }

    // 4. Subtle Shaker / Brush
    if (step % 2 === 0) {
      this.playNoisePercussion(time, 0.03, 0.02);
    }
  }

  private playSynthNote(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType,
    vol: number
  ) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    } catch {
      // Audio node scheduling guard
    }
  }

  private playPercussion(freq: number, time: number, duration: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + duration);

      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // Audio node scheduling guard
    }
  }

  private playNoisePercussion(time: number, duration: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + duration);
    } catch {
      // Noise guard
    }
  }

  // =========================================================================
  // COMPLETE SOUND EFFECTS (SFX) SUITE
  // =========================================================================

  /**
   * Standard UI Button Click (Snappy & Satisfying)
   */
  public playClick() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('playClick audio error:', e);
    }
  }

  /**
   * Food Selection Pop (Friendly & Cheerful)
   */
  public playSelectFood() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.06);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('playSelectFood audio error:', e);
    }
  }

  /**
   * Pickup Dish Sound (Drag Start Lift)
   */
  public playPickup() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('playPickup audio error:', e);
    }
  }

  /**
   * Drop Dish Sound (Placement tap)
   */
  public playDrop() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('playDrop audio error:', e);
    }
  }

  /**
   * Correct Match (Harmonious Ascending Major Chime Arpeggio)
   */
  public playCorrect() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        gain.gain.setValueAtTime(0.001, now + idx * 0.045);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.045 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.35);
      });
    } catch (e) {
      console.warn('playCorrect audio error:', e);
    }
  }

  /**
   * Wrong Match (Gentle, Muted Warning Buzz - not harsh)
   */
  public playWrong() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.22);

      // Lowpass filter makes it pleasant, not ear-piercing
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      console.warn('playWrong audio error:', e);
    }
  }

  /**
   * Combo Tiered Celebration:
   * x2-x4: Great (ascending sparkle)
   * x5-x9: Amazing (harmonious chord sparkle)
   * x10+: Perfect (grand sparkling flourish)
   */
  public playCombo(combo: number) {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      if (combo >= 10) {
        // Perfect Combo Fanfare (C6, E6, G6, C7 arpeggio flourish)
        const notes = [1046.5, 1318.51, 1567.98, 2093.0];
        notes.forEach((f, i) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.05);

          gain.gain.setValueAtTime(0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.42);
        });
      } else if (combo >= 5) {
        // Amazing Combo (G5, B5, D6, G6 sparkle)
        const notes = [783.99, 987.77, 1174.66, 1567.98];
        notes.forEach((f, i) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.04);

          gain.gain.setValueAtTime(0.18, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.38);
        });
      } else {
        // Great Combo (E5, G5, C6)
        const notes = [659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.04);

          gain.gain.setValueAtTime(0.15, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.3);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.32);
        });
      }
    } catch (e) {
      console.warn('playCombo audio error:', e);
    }
  }

  /**
   * Star Reveal Sparkle (Sequential Sparkles for Stars 1, 2, 3)
   */
  public playStarSparkle(starIndex: number) {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const freqs = [659.25, 880.0, 1174.66]; // E5, A5, D6
      const freq = freqs[starIndex] || 1318.51;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {
      console.warn('playStarSparkle audio error:', e);
    }
  }

  /**
   * Victory Fanfare (Celebration Fanfare)
   */
  public playVictory() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const victoryNotes = [
        { f: 523.25, t: 0.0, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.12 },
        { f: 1046.5, t: 0.38, d: 0.55 },
      ];

      victoryNotes.forEach(({ f, t, d }) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });
    } catch (e) {
      console.warn('playVictory audio error:', e);
    }
  }

  /**
   * Unlock Sound (New Food / Level Unlocked)
   */
  public playUnlock() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const shimmerNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      shimmerNotes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.14, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch (e) {
      console.warn('playUnlock audio error:', e);
    }
  }

  /**
   * Time's Up Alert
   */
  public playTimeUp() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const alertBeeps = [880.0, 587.33];
      alertBeeps.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.2);
      });
    } catch (e) {
      console.warn('playTimeUp audio error:', e);
    }
  }

  /**
   * Game Over / Defeat Melody (Gentle descending chord)
   */
  public playGameOver() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const defeatNotes = [
        { f: 440.0, t: 0.0, d: 0.2 },  // A4
        { f: 392.0, t: 0.18, d: 0.2 }, // G4
        { f: 349.23, t: 0.36, d: 0.25 }, // F4
        { f: 293.66, t: 0.58, d: 0.45 }, // D4
      ];

      defeatNotes.forEach(({ f, t, d }) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.18, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });
    } catch (e) {
      console.warn('playGameOver audio error:', e);
    }
  }

  /**
   * Card Flip Sound (for Food Memory Mode)
   */
  public playCardFlip() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.07);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('playCardFlip audio error:', e);
    }
  }

  /**
   * Passport Rubber Stamp Thud (Satisfying deep mechanical ink impact)
   */
  public playStamp() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Heavy low thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);

      // Ink slap texture
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.01));
      }
      const noise = this.ctx.createBufferSource();
      const noiseGain = this.ctx.createGain();
      noise.buffer = buffer;
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
    } catch (e) {
      console.warn('playStamp audio error:', e);
    }
  }

  /**
   * Speed Challenge Heartbeat / Countdown Tick
   */
  public playSpeedTick(isUrgent = false) {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 950 : 650, now);
      osc.frequency.exponentialRampToValueAtTime(isUrgent ? 1200 : 700, now + 0.03);

      gain.gain.setValueAtTime(isUrgent ? 0.2 : 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('playSpeedTick audio error:', e);
    }
  }


  /**
   * Book Page Turn / Paper Swoosh
   */
  public playPageFlip() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('playPageFlip audio error:', e);
    }
  }

  /**
   * Magical Unlock / Discovery Sparkle
   */
  public playUnlockSparkle() {
    if (!this.userSfxEnabled || !youtubeSdk.isAudioEnabled()) return;
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      pitches.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.04 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch (e) {
      console.warn('playUnlockSparkle audio error:', e);
    }
  }

  // =========================================================================
  // AUDIO SETTINGS PREVIEW TESTING
  // =========================================================================

  public testMusic() {
    this.unlock();
    this.startBgm('menu');
  }

  public testSfx() {
    this.unlock();
    this.playCorrect();
  }
}

export const audioManager = new AudioManager();
