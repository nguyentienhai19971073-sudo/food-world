/**
 * 2D Cartoon Vector Illustrations for Food World
 * High-definition, responsive vector graphics with appetizing colors, highlights, and details.
 */

import React, { useState, useEffect } from 'react';
import { assetManager } from '../services/assetManager';

interface Props {
  iconType: string;
  dishId?: string;
  className?: string;
}

export const DishIllustration: React.FC<Props> = ({ iconType, dishId, className = 'w-16 h-16' }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return assetManager.subscribe(() => setTick((t) => t + 1));
  }, []);

  const customImage = dishId ? assetManager.getDishImage(dishId) : null;
  if (customImage) {
    return (
      <img
        src={customImage}
        alt={dishId || iconType}
        className={`${className} object-contain filter drop-shadow-md transition-transform`}
        loading="lazy"
      />
    );
  }

  // Render bespoke vector graphic based on iconType
  switch (iconType) {
    case 'soup_bowl': // Pho
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="80" rx="36" ry="7" fill="#000" opacity="0.15" />
          <path d="M18 48 C 18 78, 82 78, 82 48 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2.5" />
          <ellipse cx="50" cy="48" rx="32" ry="12" fill="#B45309" opacity="0.3" />
          <ellipse cx="50" cy="49" rx="30" ry="10" fill="#D97706" />
          {/* Rice noodles & beef */}
          <path d="M30 46 Q 40 52 52 46 T 70 48" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 50 Q 48 54 62 49" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="44" cy="46" rx="7" ry="4" fill="#881337" />
          <ellipse cx="58" cy="48" rx="6" ry="3.5" fill="#9F1239" />
          {/* Herbs and chili */}
          <circle cx="38" cy="45" r="2.5" fill="#22C55E" />
          <circle cx="62" cy="44" r="2.5" fill="#22C55E" />
          <circle cx="48" cy="51" r="2" fill="#EF4444" />
          {/* Steam */}
          <path d="M42 32 Q 40 22 46 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M56 30 Q 58 20 52 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );

    case 'sandwich': // Banh Mi / Cubano
    case 'panini_sandwich':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="38" ry="6" fill="#000" opacity="0.15" />
          {/* Bottom Baguette */}
          <path d="M14 62 C 14 74, 86 74, 86 62 Z" fill="#D97706" stroke="#B45309" strokeWidth="2" />
          {/* Fillings: pate, ham, cucumber, cilantro */}
          <rect x="18" y="54" width="64" height="6" rx="3" fill="#BE123C" />
          <rect x="22" y="50" width="56" height="5" rx="2.5" fill="#84CC16" />
          <path d="M26 48 L74 48" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
          <circle cx="36" cy="48" r="2" fill="#EF4444" />
          <circle cx="56" cy="48" r="2" fill="#EF4444" />
          {/* Top Baguette Crust */}
          <path d="M12 48 C 12 26, 88 26, 88 48 C 88 53, 12 53, 12 48 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Baguette cuts */}
          <line x1="28" y1="36" x2="38" y2="44" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="34" x2="55" y2="44" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="62" y1="36" x2="72" y2="44" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'pizza_slice': // Pizza
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="86" rx="32" ry="6" fill="#000" opacity="0.15" />
          {/* Crust */}
          <path d="M20 28 Q 50 16 80 28 L 50 84 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
          {/* Cheese */}
          <path d="M24 33 Q 50 24 76 33 L 50 78 Z" fill="#FCD34D" />
          {/* Pepperoni & Basil */}
          <circle cx="45" cy="42" r="6" fill="#DC2626" />
          <circle cx="58" cy="52" r="5.5" fill="#DC2626" />
          <circle cx="42" cy="62" r="5" fill="#DC2626" />
          <ellipse cx="36" cy="48" rx="4" ry="2.5" fill="#16A34A" transform="rotate(-25 36 48)" />
          <ellipse cx="62" cy="40" rx="4" ry="2.5" fill="#16A34A" transform="rotate(35 62 40)" />
          {/* Melt string */}
          <path d="M50 78 Q 51 86 52 82" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'sushi_roll': // Sushi
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="78" rx="36" ry="7" fill="#000" opacity="0.15" />
          {/* White Rice Base */}
          <ellipse cx="50" cy="54" rx="32" ry="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
          <rect x="18" y="54" width="64" height="12" fill="#F8FAFC" />
          <ellipse cx="50" cy="66" rx="32" ry="13" fill="#E2E8F0" />
          {/* Salmon Nigiri Slice */}
          <path d="M14 48 C 22 36, 78 36, 86 48 C 86 56, 14 56, 14 48 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
          {/* Salmon White Marbling Stripes */}
          <path d="M28 42 Q 40 50 48 44" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M46 41 Q 58 50 68 44" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M64 42 Q 74 49 80 46" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          {/* Nori Seaweed Ribbon */}
          <rect x="42" y="38" width="16" height="34" rx="2" fill="#1E293B" />
        </svg>
      );

    case 'burger': // Cheeseburger
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="84" rx="36" ry="6" fill="#000" opacity="0.15" />
          {/* Bottom Bun */}
          <path d="M20 70 C 20 80, 80 80, 80 70 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* Patty */}
          <rect x="18" y="60" width="64" height="10" rx="5" fill="#78350F" />
          {/* Melted Cheese */}
          <polygon points="18,60 82,60 76,68 56,66 48,70 34,65 24,68" fill="#FBBF24" />
          {/* Lettuce */}
          <path d="M16 54 Q 30 60 40 54 Q 50 60 60 54 Q 72 60 84 54 L 84 56 L 16 56 Z" fill="#4ADE80" />
          {/* Tomato */}
          <rect x="22" y="47" width="56" height="7" rx="3.5" fill="#EF4444" />
          {/* Top Bun */}
          <path d="M16 46 C 16 22, 84 22, 84 46 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* Sesame Seeds */}
          <ellipse cx="36" cy="32" rx="2" ry="1" fill="#FEF3C7" transform="rotate(-15 36 32)" />
          <ellipse cx="50" cy="28" rx="2" ry="1" fill="#FEF3C7" />
          <ellipse cx="64" cy="32" rx="2" ry="1" fill="#FEF3C7" transform="rotate(20 64 32)" />
          <ellipse cx="44" cy="38" rx="2" ry="1" fill="#FEF3C7" transform="rotate(10 44 38)" />
          <ellipse cx="58" cy="38" rx="2" ry="1" fill="#FEF3C7" transform="rotate(-10 58 38)" />
        </svg>
      );

    case 'taco': // Taco
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="84" rx="34" ry="6" fill="#000" opacity="0.15" />
          {/* Hard Taco Shell Back */}
          <path d="M15 65 C 20 25, 80 25, 85 65 Z" fill="#D97706" />
          {/* Meat & Fillings */}
          <ellipse cx="50" cy="52" rx="30" ry="12" fill="#78350F" />
          {/* Greens & Tomato cubes */}
          <circle cx="36" cy="46" r="4" fill="#22C55E" />
          <circle cx="48" cy="44" r="5" fill="#22C55E" />
          <circle cx="62" cy="47" r="4.5" fill="#22C55E" />
          <rect x="38" y="48" width="6" height="6" rx="1.5" fill="#EF4444" />
          <rect x="52" y="46" width="6" height="6" rx="1.5" fill="#EF4444" />
          <rect x="44" y="42" width="5" height="5" rx="1.5" fill="#FBBF24" />
          {/* Taco Shell Front Fold */}
          <path d="M16 68 C 22 42, 78 42, 84 68 C 84 78, 16 78, 16 68 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
        </svg>
      );

    case 'ramen_bowl': // Ramen
    case 'noodle_bowl':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="84" rx="34" ry="6" fill="#000" opacity="0.15" />
          <path d="M18 48 C 18 80, 82 80, 82 48 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
          <ellipse cx="50" cy="48" rx="32" ry="12" fill="#F59E0B" />
          {/* Ramen noodles wavy */}
          <path d="M28 48 Q 36 54 44 48 T 60 48 T 72 48" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
          {/* Chashu slice */}
          <ellipse cx="40" cy="44" rx="9" ry="6" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
          {/* Soft boiled egg half */}
          <ellipse cx="60" cy="44" rx="8" ry="6" fill="#FFF" />
          <circle cx="60" cy="44" r="4" fill="#F97316" />
          {/* Nori sheet */}
          <rect x="24" y="32" width="10" height="18" rx="1" fill="#0F172A" transform="rotate(-15 24 32)" />
          {/* Scallions */}
          <circle cx="48" cy="50" r="2.5" fill="#22C55E" />
          <circle cx="53" cy="53" r="2" fill="#22C55E" />
        </svg>
      );

    case 'croissant_bread': // Croissant
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000" opacity="0.15" />
          <path d="M14 62 C 20 40, 40 32, 50 32 C 60 32, 80 40, 86 62 C 78 68, 64 62, 50 64 C 36 62, 22 68, 14 62 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Crescent segments */}
          <path d="M30 42 C 38 40, 42 60, 36 63" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M44 34 C 52 34, 54 58, 48 64" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M60 38 C 66 40, 66 60, 58 63" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Golden shine */}
          <path d="M42 38 Q 50 36 58 38" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'boba_cup': // Bubble Tea
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="88" rx="22" ry="5" fill="#000" opacity="0.15" />
          {/* Cup body */}
          <path d="M30 28 L 36 82 C 36 85, 64 85, 64 82 L 70 28 Z" fill="#FEF3C7" stroke="#CBD5E1" strokeWidth="2" />
          {/* Milk tea fill */}
          <path d="M32 38 L 36 81 C 36 83, 64 83, 64 81 L 68 38 Z" fill="#D97706" opacity="0.8" />
          {/* Tapioca pearls */}
          <circle cx="44" cy="74" r="4.5" fill="#18181B" />
          <circle cx="56" cy="73" r="4.5" fill="#18181B" />
          <circle cx="50" cy="65" r="4" fill="#18181B" />
          <circle cx="40" cy="66" r="3.8" fill="#18181B" />
          <circle cx="60" cy="66" r="3.8" fill="#18181B" />
          {/* Cup Lid & Big Straw */}
          <ellipse cx="50" cy="28" rx="22" ry="5" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />
          <line x1="50" y1="12" x2="50" y2="78" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          <line x1="50" y1="12" x2="50" y2="78" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'paella_pan': // Paella
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="80" rx="38" ry="7" fill="#000" opacity="0.15" />
          {/* Pan Handles */}
          <circle cx="14" cy="50" r="6" stroke="#475569" strokeWidth="3" />
          <circle cx="86" cy="50" r="6" stroke="#475569" strokeWidth="3" />
          {/* Pan */}
          <ellipse cx="50" cy="52" rx="36" ry="18" fill="#334155" />
          {/* Saffron Rice */}
          <ellipse cx="50" cy="50" rx="33" ry="15" fill="#FBBF24" />
          {/* Prawns */}
          <path d="M38 46 Q 30 38 42 42" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 48 Q 72 40 60 44" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          {/* Mussels */}
          <ellipse cx="48" cy="44" rx="5" ry="3" fill="#0F172A" />
          <ellipse cx="52" cy="54" rx="5" ry="3" fill="#0F172A" />
          {/* Peas & Lemon wedge */}
          <circle cx="34" cy="54" r="2" fill="#22C55E" />
          <circle cx="66" cy="52" r="2" fill="#22C55E" />
          <polygon points="50,42 56,48 48,50" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
        </svg>
      );

    case 'poutine_bowl': // Poutine
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="34" ry="6" fill="#000" opacity="0.15" />
          <path d="M20 54 C 20 78, 80 78, 80 54 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
          {/* French fries */}
          <rect x="30" y="38" width="6" height="24" rx="2" fill="#FBBF24" transform="rotate(-20 30 38)" />
          <rect x="44" y="34" width="6" height="26" rx="2" fill="#F59E0B" transform="rotate(5 44 34)" />
          <rect x="58" y="36" width="6" height="25" rx="2" fill="#FBBF24" transform="rotate(25 58 36)" />
          <rect x="38" y="44" width="24" height="6" rx="2" fill="#F59E0B" />
          {/* Brown Gravy */}
          <path d="M26 50 Q 50 62 74 50 Q 64 68 36 66 Z" fill="#78350F" opacity="0.85" />
          {/* Cheese Curds */}
          <ellipse cx="38" cy="50" rx="5" ry="3.5" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="1" />
          <ellipse cx="52" cy="46" rx="6" ry="4" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="1" />
          <ellipse cx="62" cy="52" rx="5" ry="3.5" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="1" />
        </svg>
      );

    case 'dim_sum_steamer': // Dim Sum
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="7" fill="#000" opacity="0.15" />
          {/* Bamboo Steamer Rim */}
          <path d="M16 48 C 16 72, 84 72, 84 48 L 84 66 C 84 78, 16 78, 16 66 Z" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          <ellipse cx="50" cy="48" rx="34" ry="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          {/* Dumplings */}
          <circle cx="36" cy="46" r="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="50" cy="42" r="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="64" cy="46" r="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Dumpling pleated top */}
          <circle cx="36" cy="44" r="2.5" fill="#F97316" />
          <circle cx="50" cy="40" r="2.5" fill="#F97316" />
          <circle cx="64" cy="44" r="2.5" fill="#F97316" />
          {/* Bamboo weaves */}
          <line x1="20" y1="62" x2="80" y2="62" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      );

    case 'rice_bowl': // Bibimbap / Donburi
    case 'grain_bowl':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="34" ry="6" fill="#000" opacity="0.15" />
          <path d="M18 46 C 18 78, 82 78, 82 46 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <ellipse cx="50" cy="46" rx="32" ry="12" fill="#F8FAFC" />
          {/* Colorful sections */}
          <path d="M30 42 A 10 10 0 0 1 42 38 L 50 46 Z" fill="#84CC16" />
          <path d="M42 38 A 10 10 0 0 1 58 38 L 50 46 Z" fill="#EF4444" />
          <path d="M58 38 A 10 10 0 0 1 70 42 L 50 46 Z" fill="#78350F" />
          <path d="M68 44 A 10 10 0 0 1 60 52 L 50 46 Z" fill="#F97316" />
          {/* Center Sunny Egg */}
          <circle cx="50" cy="46" r="7" fill="#FFF" />
          <circle cx="50" cy="46" r="4.5" fill="#FBBF24" />
        </svg>
      );

    case 'waffle_plate': // Belgian Waffle
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="84" rx="34" ry="6" fill="#000" opacity="0.15" />
          <rect x="22" y="32" width="56" height="44" rx="8" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          {/* Waffle Grid Squares */}
          <rect x="28" y="38" width="10" height="13" rx="2" fill="#D97706" />
          <rect x="45" y="38" width="10" height="13" rx="2" fill="#D97706" />
          <rect x="62" y="38" width="10" height="13" rx="2" fill="#D97706" />
          <rect x="28" y="57" width="10" height="13" rx="2" fill="#D97706" />
          <rect x="45" y="57" width="10" height="13" rx="2" fill="#D97706" />
          <rect x="62" y="57" width="10" height="13" rx="2" fill="#D97706" />
          {/* Whipped cream & Strawberries */}
          <circle cx="50" cy="38" r="9" fill="#FFF" />
          <circle cx="43" cy="36" r="4.5" fill="#EF4444" />
          <circle cx="57" cy="36" r="4.5" fill="#EF4444" />
        </svg>
      );

    case 'sausage_plate': // Bratwurst
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000" opacity="0.15" />
          <ellipse cx="50" cy="68" rx="36" ry="12" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
          {/* Curved Grilled Sausage */}
          <path d="M22 60 C 24 38, 76 38, 78 60 C 76 68, 66 66, 50 64 C 34 66, 24 68, 22 60 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
          {/* Grill Marks */}
          <line x1="34" y1="48" x2="38" y2="58" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="46" x2="52" y2="57" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="48" x2="66" y2="58" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" />
          {/* Yellow Mustard Drizzle */}
          <path d="M30 52 Q 40 60 50 52 T 70 52" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'tagine_pot': // Tagine
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="84" rx="36" ry="6" fill="#000" opacity="0.15" />
          {/* Base dish */}
          <ellipse cx="50" cy="74" rx="36" ry="10" fill="#9A3412" stroke="#7C2D12" strokeWidth="2" />
          {/* Conical Lid */}
          <path d="M20 70 L 46 26 L 54 26 L 80 70 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="2" />
          {/* Top Knob */}
          <circle cx="50" cy="22" r="5" fill="#7C2D12" />
          {/* Traditional Moroccan patterns */}
          <path d="M30 62 L 50 48 L 70 62" stroke="#FEF08A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="48" r="2.5" fill="#FEF08A" />
        </svg>
      );

    case 'fondue_pot': // Swiss Fondue
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="84" rx="30" ry="5" fill="#000" opacity="0.15" />
          {/* Caquelon Pot */}
          <path d="M22 50 C 22 76, 78 76, 78 50 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
          <rect x="74" y="52" width="16" height="7" rx="3" fill="#475569" />
          {/* Molten Cheese Surface */}
          <ellipse cx="50" cy="50" rx="27" ry="10" fill="#FDE047" stroke="#FACC15" strokeWidth="1.5" />
          {/* Bubbles */}
          <circle cx="44" cy="50" r="3" fill="#CA8A04" opacity="0.6" />
          <circle cx="58" cy="48" r="2.5" fill="#CA8A04" opacity="0.6" />
          {/* Fondue Fork with bread */}
          <line x1="28" y1="20" x2="48" y2="50" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <rect x="42" y="42" width="8" height="8" rx="2" fill="#D97706" transform="rotate(30 42 42)" />
        </svg>
      );

    case 'salad_bowl': // Greek salad
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="34" ry="6" fill="#000" opacity="0.15" />
          <path d="M18 48 C 18 78, 82 78, 82 48 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          <ellipse cx="50" cy="48" rx="32" ry="12" fill="#22C55E" />
          {/* Cucumber slices */}
          <circle cx="34" cy="46" r="6" fill="#86EFAC" stroke="#22C55E" strokeWidth="1.5" />
          <circle cx="66" cy="46" r="6" fill="#86EFAC" stroke="#22C55E" strokeWidth="1.5" />
          {/* Tomato wedges */}
          <ellipse cx="44" cy="52" rx="5" ry="3.5" fill="#EF4444" />
          <ellipse cx="56" cy="52" rx="5" ry="3.5" fill="#EF4444" />
          {/* Feta Cheese Block */}
          <rect x="45" y="38" width="12" height="9" rx="1.5" fill="#FFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Black Kalamata Olives */}
          <circle cx="38" cy="42" r="3" fill="#0F172A" />
          <circle cx="62" cy="42" r="3" fill="#0F172A" />
        </svg>
      );

    case 'pavlova_cake': // Pavlova
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000" opacity="0.15" />
          <ellipse cx="50" cy="74" rx="36" ry="10" fill="#E2E8F0" />
          {/* Crisp Meringue Base */}
          <path d="M22 66 C 22 52, 78 52, 78 66 C 78 74, 22 74, 22 66 Z" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="2" />
          {/* Whipped Cream Mountain */}
          <ellipse cx="50" cy="54" rx="24" ry="12" fill="#FFFFFF" />
          {/* Kiwi Slices */}
          <ellipse cx="42" cy="50" rx="7" ry="4.5" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1" />
          <circle cx="42" cy="50" r="1.5" fill="#000" />
          <ellipse cx="58" cy="50" rx="7" ry="4.5" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1" />
          <circle cx="58" cy="50" r="1.5" fill="#000" />
          {/* Strawberry on top */}
          <path d="M46 44 C 46 38, 54 38, 54 44 L 50 48 Z" fill="#EF4444" />
        </svg>
      );

    case 'skillet_eggs': // Shakshuka
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000" opacity="0.15" />
          {/* Cast iron skillet handle */}
          <rect x="80" y="47" width="16" height="6" rx="2" fill="#1E293B" />
          {/* Pan */}
          <circle cx="50" cy="50" r="32" fill="#0F172A" />
          {/* Red tomato sauce */}
          <circle cx="50" cy="50" r="28" fill="#DC2626" />
          {/* 3 Poached Eggs */}
          <circle cx="40" cy="44" r="7" fill="#FFF" />
          <circle cx="40" cy="44" r="4" fill="#F59E0B" />
          <circle cx="60" cy="44" r="7" fill="#FFF" />
          <circle cx="60" cy="44" r="4" fill="#F59E0B" />
          <circle cx="50" cy="60" r="7" fill="#FFF" />
          <circle cx="50" cy="60" r="4" fill="#F59E0B" />
          {/* Herbs */}
          <circle cx="50" cy="46" r="2" fill="#22C55E" />
          <circle cx="36" cy="56" r="2" fill="#22C55E" />
        </svg>
      );

    case 'fried_shrimp': // Tempura
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="34" ry="6" fill="#000" opacity="0.15" />
          {/* Red shrimp tail */}
          <path d="M22 62 L 14 54 C 18 52, 22 56, 26 58 Z" fill="#EF4444" />
          {/* Golden Tempura Batter Body */}
          <path d="M24 58 C 30 36, 70 34, 82 52 C 84 64, 40 68, 24 58 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          {/* Crispy flakes */}
          <circle cx="40" cy="48" r="2" fill="#FEF08A" />
          <circle cx="56" cy="46" r="2.5" fill="#FEF08A" />
          <circle cx="68" cy="54" r="2" fill="#FEF08A" />
        </svg>
      );

    case 'spring_roll': // Goi Cuon
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000" opacity="0.15" />
          {/* Translucent roll */}
          <rect x="20" y="42" width="60" height="26" rx="13" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" opacity="0.95" />
          {/* Visible shrimp inside */}
          <path d="M34 55 Q 50 46 66 55" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
          {/* Visible mint & herbs inside */}
          <rect x="30" y="58" width="40" height="4" rx="2" fill="#22C55E" />
        </svg>
      );

    case 'cake_slice': // Tiramisu / Lamington
    case 'chocolate_cube':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="32" ry="6" fill="#000" opacity="0.15" />
          {/* Plate */}
          <ellipse cx="50" cy="74" rx="36" ry="10" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
          {/* Cake block */}
          <polygon points="30,42 70,42 80,64 20,64" fill="#451A03" />
          {/* Mascarpone layers */}
          <line x1="26" y1="50" x2="74" y2="50" stroke="#FEF3C7" strokeWidth="3" />
          <line x1="23" y1="58" x2="77" y2="58" stroke="#FEF3C7" strokeWidth="3" />
          {/* Cocoa dusted top */}
          <polygon points="30,42 70,42 62,34 22,34" fill="#78350F" />
          {/* Mint leaf on top */}
          <circle cx="46" cy="32" r="3" fill="#22C55E" />
          <circle cx="52" cy="31" r="2.5" fill="#22C55E" />
        </svg>
      );

    default:
      // Generic Gourmet Cloche / Plate fallback with appetizing accents
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000" opacity="0.15" />
          {/* Porcelain Platter */}
          <ellipse cx="50" cy="68" rx="38" ry="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
          <ellipse cx="50" cy="66" rx="30" ry="8" fill="#F1F5F9" />
          {/* Silver Cloche Dome */}
          <path d="M24 64 C 24 32, 76 32, 76 64 Z" fill="url(#silverGrad)" stroke="#94A3B8" strokeWidth="2" />
          {/* Cloche Handle */}
          <circle cx="50" cy="30" r="5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
          {/* Sparkles */}
          <path d="M72 32 L74 36 L78 37 L74 39 L72 43 L70 39 L66 37 L70 36 Z" fill="#FBBF24" />
          <defs>
            <linearGradient id="silverGrad" x1="24" y1="48" x2="76" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F1F5F9" />
              <stop offset="0.5" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};
