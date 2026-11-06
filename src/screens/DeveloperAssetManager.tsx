/**
 * Developer Asset Manager & Simulator Tool
 * Development-only visual asset manager for dishes, flags, and country backgrounds.
 * Directly saves uploads into source code public asset directory.
 */

import React, { useState, useEffect } from 'react';
import { DISHES } from '../data/dishes';
import { COUNTRIES } from '../data/countries';
import { Dish, Country, Language, Continent } from '../types/game';
import { assetManager } from '../services/assetManager';
import { DishIllustration } from '../components/DishIllustration';
import {
  Upload,
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Flag,
  Globe,
  Sliders,
  Play,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

interface Props {
  language: Language;
  onBack: () => void;
  onTestLevel: (lvlNum: number) => void;
}

export const DeveloperAssetManager: React.FC<Props> = ({
  language,
  onBack,
  onTestLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'dishes' | 'countries' | 'simulator'>('dishes');

  // Dish filtering
  const [dishSearch, setDishSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');

  // Country filtering
  const [countrySearch, setCountrySearch] = useState('');

  // Status feedback
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setTick] = useState(0);

  // Level tester
  const [testLevelNum, setTestLevelNum] = useState(1);

  useEffect(() => {
    return assetManager.subscribe(() => setTick((t) => t + 1));
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Upload handler for dish
  const handleUploadDish = async (dishId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const res = await assetManager.uploadAsset('dish', dishId, file);
    setIsProcessing(false);

    if (res.success) {
      showStatus('success', `Đã lưu ảnh mới cho món "${dishId}" vào thư mục dự án!`);
    } else {
      showStatus('error', res.error || 'Lỗi khi upload ảnh');
    }
  };

  // Restore default for dish
  const handleRestoreDish = async (dishId: string) => {
    setIsProcessing(true);
    const res = await assetManager.restoreDefault('dish', dishId);
    setIsProcessing(false);

    if (res.success) {
      showStatus('success', `Đã khôi phục đồ họa mặc định cho "${dishId}"!`);
    } else {
      showStatus('error', res.error || 'Lỗi khi khôi phục');
    }
  };

  // Upload handler for country flag
  const handleUploadFlag = async (countryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const res = await assetManager.uploadAsset('country_flag', countryId, file);
    setIsProcessing(false);

    if (res.success) {
      showStatus('success', `Đã cập nhật lá cờ cho quốc gia "${countryId}"!`);
    } else {
      showStatus('error', res.error || 'Lỗi khi upload lá cờ');
    }
  };

  // Upload handler for country background
  const handleUploadBg = async (countryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const res = await assetManager.uploadAsset('country_bg', countryId, file);
    setIsProcessing(false);

    if (res.success) {
      showStatus('success', `Đã cập nhật hình nền đặc trưng cho "${countryId}"!`);
    } else {
      showStatus('error', res.error || 'Lỗi khi upload hình nền');
    }
  };

  // Filtered dishes
  const filteredDishes = DISHES.filter((dish) => {
    const nameMatch =
      dish.name.vi.toLowerCase().includes(dishSearch.toLowerCase()) ||
      dish.name.en.toLowerCase().includes(dishSearch.toLowerCase()) ||
      dish.id.toLowerCase().includes(dishSearch.toLowerCase());

    const continentMatch =
      selectedContinent === 'all' || dish.continent === selectedContinent;

    const countryMatch =
      selectedCountryId === 'all' || dish.countryId === selectedCountryId;

    return nameMatch && continentMatch && countryMatch;
  });

  // Filtered countries
  const filteredCountries = COUNTRIES.filter((c) => {
    return (
      c.name.vi.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.name.en.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.id.toLowerCase().includes(countrySearch.toLowerCase())
    );
  });

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Top Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Game</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-amber-400 font-display flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Asset Manager & Developer Preview</span>
            </h1>
            <span className="text-[10px] text-slate-400">
              Môi trường phát triển: Tải lên và lưu trữ hình ảnh vĩnh viễn vào source code
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dishes'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Món ăn ({DISHES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('countries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'countries'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Quốc gia ({COUNTRIES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulator & Tester</span>
          </button>
        </div>
      </header>

      {/* Floating Status Notification */}
      {statusMsg && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 shadow-emerald-900/50'
              : 'bg-rose-950/95 border-rose-400 text-rose-200 shadow-rose-900/50'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6">
        {/* =========================================================================
            TAB 1: DISHES ASSET MANAGER
            ========================================================================= */}
        {activeTab === 'dishes' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            {/* Search & Filter Toolbar */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              {/* Search input */}
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-2xl flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn theo tên hoặc ID..."
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
                />
              </div>

              {/* Continent Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Châu lục:</span>
                <select
                  value={selectedContinent}
                  onChange={(e) => setSelectedContinent(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-none"
                >
                  <option value="all">Tất cả châu lục</option>
                  <option value="Asia">Châu Á</option>
                  <option value="Europe">Châu Âu</option>
                  <option value="Americas">Châu Mỹ</option>
                  <option value="Africa">Châu Phi</option>
                  <option value="Oceania">Châu Đại Dương</option>
                </select>
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Quốc gia:</span>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-none max-w-[180px]"
                >
                  <option value="all">Tất cả quốc gia</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flagEmoji} {c.name.vi} ({c.name.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDishes.map((dish) => {
                const country = COUNTRIES.find((c) => c.id === dish.countryId);
                const customImage = assetManager.getDishImage(dish.id);

                return (
                  <div
                    key={dish.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-lg relative group hover:border-slate-700 transition-all"
                  >
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-sm font-black text-white font-display leading-tight">
                          {dish.name.vi}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {dish.name.en} • <span className="font-mono text-[10px] text-amber-300">#{dish.id}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 shrink-0">
                        <span className="text-xs">{country?.flagEmoji}</span>
                        <span className="text-[10px] font-bold text-slate-300">
                          {country?.code}
                        </span>
                      </div>
                    </div>

                    {/* Image Preview Box */}
                    <div className="w-full h-36 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-3 flex flex-col items-center justify-center relative overflow-hidden mb-3">
                      <DishIllustration
                        iconType={dish.iconType}
                        dishId={dish.id}
                        className="w-20 h-20"
                      />

                      {customImage ? (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-bold">
                          Ảnh tùy chỉnh
                        </span>
                      ) : (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-bold">
                          2D Vector mặc định
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex items-center gap-2">
                      <label className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all text-center">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{customImage ? 'Thay ảnh' : 'Tải ảnh PNG/WebP'}</span>
                        <input
                          type="file"
                          accept="image/png,image/webp,image/jpeg"
                          onChange={(e) => handleUploadDish(dish.id, e)}
                          className="hidden"
                          disabled={isProcessing}
                        />
                      </label>

                      {customImage && (
                        <button
                          onClick={() => handleRestoreDish(dish.id)}
                          title="Khôi phục vector mặc định"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
                          disabled={isProcessing}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: COUNTRIES ASSET MANAGER
            ========================================================================= */}
        {activeTab === 'countries' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            {/* Search Toolbar */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-2xl flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm quốc gia theo tên hoặc mã ISO..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
                />
              </div>

              <span className="text-xs font-bold text-slate-400">
                Hiển thị {filteredCountries.length} / 42 quốc gia
              </span>
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCountries.map((c) => {
                const customFlag = assetManager.getCountryFlagImage(c.id);
                const customBg = assetManager.getCountryBackgroundImage(c.id);

                return (
                  <div
                    key={c.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                          style={{
                            backgroundColor: `${c.color}22`,
                            borderColor: c.color,
                          }}
                        >
                          {customFlag ? (
                            <img src={customFlag} alt={c.name.en} className="w-7 h-7 object-contain" />
                          ) : (
                            <span className="text-2xl">{c.flagEmoji}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white font-display">
                            {c.name.vi}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {c.name.en} • <span className="font-mono text-amber-300">#{c.code}</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {c.continent}
                      </span>
                    </div>

                    {/* Preview Box for Theme Background */}
                    <div className="w-full h-28 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden relative mb-3 flex items-center justify-center">
                      {customBg ? (
                        <img
                          src={customBg}
                          alt="Theme Background"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                          style={{
                            background: `radial-gradient(circle, ${c.color}33 0%, #0f172a 90%)`,
                          }}
                        >
                          <span className="text-xs font-semibold text-slate-400 mb-1">
                            Chưa có ảnh nền tùy chỉnh
                          </span>
                          <span className="text-[10px] text-slate-500">
                            (Ví dụ: Phố cổ, đèn lồng, danh lam thắng cảnh)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Uploads Row */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Flag Upload */}
                      <label className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-center truncate">
                        <Flag className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">Thay lá cờ</span>
                        <input
                          type="file"
                          accept="image/png,image/webp,image/svg+xml"
                          onChange={(e) => handleUploadFlag(c.id, e)}
                          className="hidden"
                          disabled={isProcessing}
                        />
                      </label>

                      {/* Background Upload */}
                      <label className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-center truncate">
                        <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Thay ảnh nền</span>
                        <input
                          type="file"
                          accept="image/png,image/webp,image/jpeg"
                          onChange={(e) => handleUploadBg(c.id, e)}
                          className="hidden"
                          disabled={isProcessing}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: LEVEL TESTER & SIMULATOR
            ========================================================================= */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-white font-display mb-1 flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-400" />
                <span>Level Tester & Simulator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Cho phép chọn và chơi thử bất kỳ màn chơi nào từ 1 đến 120 để kiểm tra kéo thả, đồ họa và luồng chuyển màn.
              </p>
            </div>

            {/* Quick Level Launcher */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300">
                Nhập số màn (1 – 120):
              </span>
              <input
                type="number"
                min={1}
                max={120}
                value={testLevelNum}
                onChange={(e) => setTestLevelNum(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                className="w-24 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-center text-sm font-bold text-amber-400"
              />

              <button
                onClick={() => onTestLevel(testLevelNum)}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Khởi chạy màn {testLevelNum}</span>
              </button>
            </div>

            {/* Quick Level Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Màn chơi đặc biệt theo từng khu vực:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { lvl: 1, label: 'Màn 1 (Châu Á)' },
                  { lvl: 26, label: 'Màn 26 (Châu Âu)' },
                  { lvl: 51, label: 'Màn 51 (Châu Mỹ)' },
                  { lvl: 71, label: 'Màn 71 (Châu Phi)' },
                  { lvl: 86, label: 'Màn 86 (Đại Dương)' },
                  { lvl: 101, label: 'Màn 101 (Thế Giới)' },
                ].map((item) => (
                  <button
                    key={item.lvl}
                    onClick={() => onTestLevel(item.lvl)}
                    className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all active:scale-95 text-center"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
