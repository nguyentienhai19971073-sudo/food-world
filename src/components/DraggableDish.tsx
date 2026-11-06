/**
 * Draggable & Tappable Dish Card
 * High-polish casual cartoon style with idle float, tap selection, and drag trigger.
 */

import React from 'react';
import { Dish, Language } from '../types/game';
import { DishIllustration } from './DishIllustration';
import { useTranslation } from '../localization/i18n';

interface Props {
  dish: Dish;
  language?: Language;
  isSelected?: boolean;
  isWrong?: boolean;
  isDraggingThis?: boolean;
  onSelect: () => void;
  onStartDrag?: (dish: Dish, e: React.PointerEvent) => void;
  onDropOnCountry?: (countryId: string) => void;
  disabled?: boolean;
}

export const DraggableDish: React.FC<Props> = ({
  dish,
  language: propLanguage,
  isSelected = false,
  isWrong = false,
  isDraggingThis = false,
  onSelect,
  onStartDrag,
  onDropOnCountry,
  disabled = false,
}) => {
  const { language: contextLang, getDishName, t } = useTranslation();
  const activeLang = propLanguage || contextLang;
  const localizedName = getDishName(dish);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (onStartDrag) {
      onStartDrag(dish, e);
    } else {
      onSelect();
    }
  };

  if (isDraggingThis) {
    // Show stylish placeholder tray slot while dragging
    return (
      <div className="w-26 sm:w-30 md:w-34 min-h-[124px] sm:min-h-[140px] md:min-h-[154px] rounded-3xl border-2 border-dashed border-amber-400/40 bg-amber-400/5 flex flex-col items-center justify-center p-2 opacity-60 shrink-0">
        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest text-center px-1">
          {t('draggingPlaceholder')}
        </span>
      </div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        // Prevent click if drag just occurred
        e.stopPropagation();
      }}
      className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-3xl cursor-grab active:cursor-grabbing select-none transition-all duration-150 shrink-0
        w-26 sm:w-30 md:w-34 min-h-[124px] sm:min-h-[140px] md:min-h-[154px] h-auto touch-none
        ${
          isWrong
            ? 'bg-rose-950/90 border-2 border-rose-400 animate-shake shadow-rose-500/40 ring-2 ring-rose-400'
            : isSelected
            ? 'bg-gradient-to-b from-amber-500/30 to-orange-500/30 border-2 border-amber-400 shadow-2xl shadow-amber-500/40 scale-105 ring-2 ring-amber-300'
            : 'bg-slate-800/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-amber-400/60 shadow-lg hover:shadow-xl hover:scale-104 hover:-translate-y-1'
        }
      `}
      style={{
        boxShadow: isSelected
          ? '0 10px 25px rgba(251, 191, 36, 0.4), 0 0 15px rgba(245, 158, 11, 0.3)'
          : '0 6px 18px rgba(0,0,0,0.4)',
      }}
    >
      {/* Selected Indicator Badge */}
      {isSelected && (
        <span className="absolute -top-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md animate-bounce z-20">
          {t('selectedDishPrompt') || 'SELECTED'}
        </span>
      )}

      {/* Ceramic Plate Shadow Base */}
      <div className="absolute inset-x-3 bottom-10 h-3 bg-black/20 rounded-full blur-xs pointer-events-none" />

      {/* Dish Vector Illustration */}
      <div className="flex-1 w-full flex items-center justify-center p-1 pointer-events-none transform transition-transform group-hover:scale-110">
        <DishIllustration
          iconType={dish.iconType}
          dishId={dish.id}
          className="w-13 h-13 sm:w-16 sm:h-16 filter drop-shadow-lg"
        />
      </div>

      {/* Full Dish Name Label - Zero Ellipsis, Auto-Wrap, Full Readability */}
      <div className="w-full text-center px-1 py-1 min-h-[38px] sm:min-h-[44px] flex items-center justify-center z-10 pointer-events-none">
        <span className="text-[11px] sm:text-xs font-black text-slate-100 leading-snug block whitespace-normal break-words drop-shadow">
          {localizedName}
        </span>
      </div>
    </div>
  );
};
