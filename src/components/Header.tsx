import React from 'react';
import { Search, Shuffle, Bookmark, Menu, X, Pipette } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onTriggerRandom: () => void;
  onOpenCollection: () => void;
  onResetHome: () => void;
  onOpenMobileMenu: () => void;
  collectionCount: number;
  isCollectionActive: boolean;
}

export const QUICK_SEARCH_CHIPS = [
  'Coral',
  'Lavender',
  'Teal',
  'Indigo',
  'Turquoise',
  'Mint',
  'Burgundy',
  'Crimson',
  'Olive',
  'Beige',
  '#FF5733',
  'RGB(99, 102, 241)',
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onTriggerRandom,
  onOpenCollection,
  onResetHome,
  onOpenMobileMenu,
  collectionCount,
  isCollectionActive,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#EEEEEE] px-4 sm:px-6 h-[65px] flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Button + Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open categories and navigation menu"
          className="lg:hidden p-2 -ml-1 rounded-lg border border-[#EEEEEE] text-[#171717] hover:bg-[#F3F3F3] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onResetHome}
          aria-label="Tintsora Home"
          className="flex items-center text-left group focus:outline-none cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="Tintsora — Every Color. Every Shade. Endless Possibilities."
            className="h-9 sm:h-11 w-auto object-contain select-none"
          />
        </button>
      </div>

      {/* Center: Search Input in Top Nav */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search any color"
            aria-label="Search any color"
            className="w-full pl-10 pr-20 py-2 text-sm bg-white border border-[#EEEEEE] rounded-xl text-[#171717] placeholder-[#737373] focus:outline-none focus:border-[#171717] transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear color search"
              className="absolute right-2.5 px-2 py-0.5 text-xs font-medium text-[#737373] hover:text-[#171717] bg-[#F3F3F3] rounded-md flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          ) : (
            <label
              title="Pick any color from your screen or color wheel"
              className="absolute right-2.5 p-1 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
            >
              <Pipette className="w-3.5 h-3.5" />
              <input
                type="color"
                aria-label="Open native color picker"
                className="sr-only"
                onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
              />
            </label>
          )}
        </div>
      </div>

      {/* Right: Action Buttons (Random Palette & Collection Shortcut) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onTriggerRandom}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-[#171717] border border-[#EEEEEE] hover:bg-[#F3F3F3] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Shuffle className="w-4 h-4 text-[#171717]" />
          <span className="hidden sm:inline">Random Palette</span>
        </button>

        <button
          type="button"
          onClick={onOpenCollection}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
            isCollectionActive
              ? 'bg-[#171717] text-white border-[#171717]'
              : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden md:inline">Collection</span>
          <span
            className={`px-1.5 py-0.2 text-[11px] font-semibold rounded-full ${
              isCollectionActive
                ? 'bg-white text-[#171717]'
                : 'bg-[#F3F3F3] text-[#171717]'
            }`}
          >
            {collectionCount}
          </span>
        </button>
      </div>
    </header>
  );
};
