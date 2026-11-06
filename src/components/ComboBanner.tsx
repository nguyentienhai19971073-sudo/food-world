/**
 * Dynamic Tiered Combo Banner & Pop-Up Effect for FOOD WORLD
 * Built with Framer Motion: scales up progressively and transitions colors (bronze -> silver -> gold).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Zap } from 'lucide-react';
import { Language } from '../types/game';
import { useTranslation } from '../localization/i18n';
import {
  ComboTier,
  getComboTier,
  getComboScale,
  getComboBonus,
  COMBO_TIER_CONFIGS,
} from '../hooks/useComboSystem';

interface Props {
  combo: number;
  tier?: ComboTier;
  scale?: number;
  popKey?: number;
  bonus?: number;
  language?: Language;
}

export const ComboBanner: React.FC<Props> = ({
  combo,
  tier: propTier,
  scale: propScale,
  popKey,
  bonus: propBonus,
  language: propLanguage,
}) => {
  const { language: contextLang, t } = useTranslation();
  const language = propLanguage || contextLang;

  // Derive tier, scale, bonus if not explicitly passed
  const activeTier = propTier || getComboTier(combo);
  const activeScale = propScale !== undefined ? propScale : getComboScale(combo);
  const activeBonus = propBonus !== undefined ? propBonus : getComboBonus(combo);
  const tierConfig = COMBO_TIER_CONFIGS[activeTier];

  if (combo < 2) return null;

  const isGold = activeTier === 'gold';
  const isSilver = activeTier === 'silver';
  const isBronze = activeTier === 'bronze';

  // Localized tier text
  const tierTitle = t(tierConfig.labelKey, language);

  return (
    <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={popKey || combo}
          initial={{ scale: activeScale * 0.5, y: 18, opacity: 0 }}
          animate={{
            scale: activeScale,
            y: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 550,
              damping: 22,
              mass: 0.8,
            },
          }}
          exit={{
            scale: activeScale * 1.18,
            y: -18,
            opacity: 0,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          className={`relative flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 ${tierConfig.borderColor} ${tierConfig.bgGradient} ${tierConfig.glowShadow} backdrop-blur-md overflow-hidden`}
        >
          {/* Sweeping Shimmer Sheen Effect */}
          <motion.div
            initial={{ x: '-150%' }}
            animate={{ x: '250%' }}
            transition={{
              duration: isGold ? 0.7 : 0.9,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Left Tier Badge & Icon */}
          <motion.div
            initial={{ rotate: -15, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            className="flex items-center justify-center shrink-0"
          >
            {isGold ? (
              <div className="flex items-center gap-0.5">
                <Flame className="w-5 sm:w-6 h-5 sm:h-6 text-red-600 animate-bounce drop-shadow" />
                <span className="text-xl sm:text-2xl drop-shadow">{tierConfig.badgeEmoji}</span>
              </div>
            ) : isSilver ? (
              <div className="flex items-center gap-0.5">
                <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 animate-pulse drop-shadow" />
                <span className="text-lg sm:text-xl drop-shadow">{tierConfig.badgeEmoji}</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-amber-200 drop-shadow" />
                <span className="text-base sm:text-lg drop-shadow">{tierConfig.badgeEmoji}</span>
              </div>
            )}
          </motion.div>

          {/* Center Combo Message */}
          <div className="flex flex-col items-center justify-center leading-none">
            <span
              className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${
                isBronze ? 'text-amber-200' : isSilver ? 'text-slate-700' : 'text-amber-950'
              }`}
            >
              {tierTitle}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-base sm:text-xl font-display font-black tracking-tight ${tierConfig.textColor}`}>
                x{combo}
              </span>
              <span className={`text-[11px] sm:text-xs font-black uppercase ${tierConfig.textColor}`}>
                {t('combo', language)}
              </span>
            </div>
          </div>

          {/* Right Bonus Tag */}
          {activeBonus > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.08, type: 'spring' }}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase shrink-0 shadow-inner ${
                isGold
                  ? 'bg-yellow-200/90 text-amber-950 border border-yellow-400'
                  : isSilver
                  ? 'bg-slate-900/90 text-white border border-slate-600'
                  : 'bg-amber-950/80 text-amber-200 border border-amber-600/70'
              }`}
            >
              +{activeBonus}
            </motion.div>
          )}

          {/* Outer Pulsing Aura Ring for Gold & High Combos */}
          {isGold && (
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-1 rounded-full border-2 border-yellow-300/60 pointer-events-none"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
