/**
 * ComboSystem Hook for FOOD WORLD
 * Tracks consecutive correct matches in ClassicGameScreen and other gameplay modes.
 * Determines combo tier (bronze -> silver -> gold) and dynamic visual scale factor.
 */

import { useState, useRef, useCallback } from 'react';
import { audioManager } from '../services/audio';

export type ComboTier = 'none' | 'bronze' | 'silver' | 'gold';

export interface ComboTierConfig {
  tier: ComboTier;
  labelKey: string;
  badgeEmoji: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  glowShadow: string;
  accentColor: string;
  ringColor: string;
}

export const COMBO_TIER_CONFIGS: Record<ComboTier, ComboTierConfig> = {
  none: {
    tier: 'none',
    labelKey: 'combo',
    badgeEmoji: '✨',
    bgGradient: 'bg-slate-800/90',
    borderColor: 'border-slate-700/80',
    textColor: 'text-slate-300',
    glowShadow: 'shadow-black/50',
    accentColor: '#94a3b8',
    ringColor: 'rgba(148, 163, 184, 0.2)',
  },
  bronze: {
    tier: 'bronze',
    labelKey: 'bronzeCombo',
    badgeEmoji: '🥉',
    bgGradient: 'bg-gradient-to-r from-[#8c4b20] via-[#cd7f32] to-[#b86227]',
    borderColor: 'border-[#f5a76c]',
    textColor: 'text-amber-50',
    glowShadow: 'shadow-[0_0_25px_rgba(205,127,50,0.65)]',
    accentColor: '#cd7f32',
    ringColor: 'rgba(205, 127, 50, 0.4)',
  },
  silver: {
    tier: 'silver',
    labelKey: 'silverCombo',
    badgeEmoji: '🥈',
    bgGradient: 'bg-gradient-to-r from-slate-400 via-slate-100 to-zinc-300',
    borderColor: 'border-white',
    textColor: 'text-slate-950 font-black',
    glowShadow: 'shadow-[0_0_35px_rgba(255,255,255,0.75)]',
    accentColor: '#e2e8f0',
    ringColor: 'rgba(255, 255, 255, 0.5)',
  },
  gold: {
    tier: 'gold',
    labelKey: 'goldCombo',
    badgeEmoji: '🥇',
    bgGradient: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500',
    borderColor: 'border-yellow-200',
    textColor: 'text-slate-950 font-black',
    glowShadow: 'shadow-[0_0_45px_rgba(251,191,36,0.9)]',
    accentColor: '#fbbf24',
    ringColor: 'rgba(251, 191, 36, 0.6)',
  },
};

/**
 * Determines current tier:
 * - 0 - 1: none
 * - 2 - 4: bronze
 * - 5 - 7: silver
 * - 8+   : gold
 */
export function getComboTier(combo: number): ComboTier {
  if (combo < 2) return 'none';
  if (combo <= 4) return 'bronze';
  if (combo <= 7) return 'silver';
  return 'gold';
}

/**
 * Dynamic visual scale factor:
 * Scales up smoothly as combo increases through the tiers
 */
export function getComboScale(combo: number): number {
  if (combo < 2) return 1.0;
  if (combo <= 4) {
    // Bronze: 1.08x to 1.16x
    return 1.08 + (combo - 2) * 0.04;
  }
  if (combo <= 7) {
    // Silver: 1.22x to 1.32x
    return 1.22 + (combo - 5) * 0.05;
  }
  // Gold: 1.38x to 1.68x
  return 1.38 + Math.min((combo - 8) * 0.04, 0.3);
}

/**
 * Bonus score formula per match
 */
export function getComboBonus(combo: number): number {
  if (combo < 2) return 0;
  return Math.min(combo * 25, 250);
}

export interface ComboSystemReturn {
  // State
  combo: number;
  maxCombo: number;
  comboBonusTotal: number;
  currentBonus: number;
  tier: ComboTier;
  tierConfig: ComboTierConfig;
  scale: number;
  isPopping: boolean;
  popKey: number;

  // Actions
  recordCorrectMatch: () => { newCombo: number; bonus: number; tier: ComboTier; scale: number };
  recordWrongMatch: () => void;
  resetCombo: () => void;
  resetAll: () => void;
}

/**
 * Custom hook tracking consecutive correct matches, tier elevation, and scale factor
 */
export function useComboSystem(): ComboSystemReturn {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboBonusTotal, setComboBonusTotal] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const [isPopping, setIsPopping] = useState(false);

  const comboRef = useRef(0);
  const maxComboRef = useRef(0);

  const tier = getComboTier(combo);
  const scale = getComboScale(combo);
  const currentBonus = getComboBonus(combo);
  const tierConfig = COMBO_TIER_CONFIGS[tier];

  const recordCorrectMatch = useCallback(() => {
    const nextCombo = comboRef.current + 1;
    comboRef.current = nextCombo;
    setCombo(nextCombo);

    if (nextCombo > maxComboRef.current) {
      maxComboRef.current = nextCombo;
      setMaxCombo(nextCombo);
    }

    const bonus = getComboBonus(nextCombo);
    setComboBonusTotal((prev) => prev + bonus);

    const nextTier = getComboTier(nextCombo);
    const nextScale = getComboScale(nextCombo);

    // Audio integration
    if (nextCombo > 1) {
      audioManager.playCombo(nextCombo);
    } else {
      audioManager.playCorrect();
    }

    // Trigger visual pop animation
    setPopKey((k) => k + 1);
    setIsPopping(true);

    return {
      newCombo: nextCombo,
      bonus,
      tier: nextTier,
      scale: nextScale,
    };
  }, []);

  const recordWrongMatch = useCallback(() => {
    comboRef.current = 0;
    setCombo(0);
    setIsPopping(false);
  }, []);

  const resetCombo = useCallback(() => {
    comboRef.current = 0;
    setCombo(0);
    setIsPopping(false);
  }, []);

  const resetAll = useCallback(() => {
    comboRef.current = 0;
    maxComboRef.current = 0;
    setCombo(0);
    setMaxCombo(0);
    setComboBonusTotal(0);
    setIsPopping(false);
    setPopKey(0);
  }, []);

  return {
    combo,
    maxCombo,
    comboBonusTotal,
    currentBonus,
    tier,
    tierConfig,
    scale,
    isPopping,
    popKey,
    recordCorrectMatch,
    recordWrongMatch,
    resetCombo,
    resetAll,
  };
}

// Export ComboSystem alias for direct convenience
export const ComboSystem = useComboSystem;
