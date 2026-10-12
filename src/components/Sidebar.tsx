import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Shuffle,
  Bookmark,
  Search,
  X,
  CloudSun,
  Camera,
  Radio,
  Zap,
  Crown,
  Sun,
  Moon,
  FlameKindling,
  Snowflake,
  Palmtree,
  Leaf,
  Flower2,
  Contrast,
  Mountain,
  Waves,
  Trees,
  Sunset,
  Minimize2,
  Palette as PaletteIcon,
  Sliders,
  Gem,
  Heart,
  Sprout,
  Diamond,
  Briefcase,
  Gamepad2,
  Share2,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/palettes';
import { NavSection, PaletteCategory } from '../types/palette';

interface SidebarProps {
  activeNav: NavSection;
  selectedCategory: PaletteCategory | 'All';
  collectionCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectNav: (nav: NavSection) => void;
  onSelectCategory: (cat: PaletteCategory) => void;
}

const CATEGORY_META: Record<
  PaletteCategory,
  { icon: React.ComponentType<{ className?: string }>; dotColor: string }
> = {
  Pastel: { icon: CloudSun, dotColor: '#FFB3C6' },
  Vintage: { icon: Camera, dotColor: '#E07A5F' },
  Retro: { icon: Radio, dotColor: '#F4A261' },
  Neon: { icon: Zap, dotColor: '#F72585' },
  Gold: { icon: Crown, dotColor: '#D4AF37' },
  Light: { icon: Sun, dotColor: '#FDE68A' },
  Dark: { icon: Moon, dotColor: '#1E293B' },
  Warm: { icon: FlameKindling, dotColor: '#EA580C' },
  Cold: { icon: Snowflake, dotColor: '#0284C7' },
  Summer: { icon: Palmtree, dotColor: '#00B4D8' },
  Fall: { icon: Leaf, dotColor: '#BC6C25' },
  Winter: { icon: Snowflake, dotColor: '#38BDF8' },
  Spring: { icon: Flower2, dotColor: '#84CC16' },
  Monochrome: { icon: Contrast, dotColor: '#52525B' },
  'Earth Tones': { icon: Mountain, dotColor: '#936639' },
  Ocean: { icon: Waves, dotColor: '#0077B6' },
  Forest: { icon: Trees, dotColor: '#2D6A4F' },
  Sunset: { icon: Sunset, dotColor: '#F35B04' },
  Minimal: { icon: Minimize2, dotColor: '#94A3B8' },
  Vibrant: { icon: PaletteIcon, dotColor: '#8338EC' },
  Muted: { icon: Sliders, dotColor: '#84A98C' },
  'Jewel Tones': { icon: Gem, dotColor: '#9A031E' },
  Wedding: { icon: Heart, dotColor: '#E5D3B3' },
  Nature: { icon: Sprout, dotColor: '#588157' },
  Luxury: { icon: Diamond, dotColor: '#C5A059' },
  Corporate: { icon: Briefcase, dotColor: '#2563EB' },
  Gaming: { icon: Gamepad2, dotColor: '#10B981' },
  'Social Media': { icon: Share2, dotColor: '#EC4899' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  selectedCategory,
  collectionCount,
  isOpenMobile,
  onCloseMobile,
  onSelectNav,
  onSelectCategory,
}) => {
  const [catSearch, setCatSearch] = useState('');

  const filteredCategories = ALL_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(catSearch.trim().toLowerCase())
  );

  const handleNavClick = (nav: NavSection) => {
    onSelectNav(nav);
    onCloseMobile();
  };

  const handleCatClick = (cat: PaletteCategory) => {
    onSelectCategory(cat);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#171717] select-none">
      {/* Mobile Header inside Drawer */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EEEEEE] lg:hidden">
        <img
          src="/logo.png"
          alt="Tintsora"
          className="h-8 w-auto object-contain"
        />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="p-3 space-y-1">
        <button
          type="button"
          onClick={() => handleNavClick('new')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeNav === 'new' && selectedCategory === 'All'
              ? 'bg-[#F3F3F3] text-[#171717] font-semibold'
              : 'text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3]/60'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-[#171717]" />
          <span>New</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('popular')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeNav === 'popular' && selectedCategory === 'All'
              ? 'bg-[#F3F3F3] text-[#171717] font-semibold'
              : 'text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3]/60'
          }`}
        >
          <Flame className="w-4 h-4 shrink-0 text-[#171717]" />
          <span>Popular</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('random')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeNav === 'random'
              ? 'bg-[#F3F3F3] text-[#171717] font-semibold'
              : 'text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3]/60'
          }`}
        >
          <Shuffle className="w-4 h-4 shrink-0 text-[#171717]" />
          <span>Random</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('collection')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeNav === 'collection'
              ? 'bg-[#F3F3F3] text-[#171717] font-semibold'
              : 'text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-4 h-4 shrink-0 text-[#171717]" />
            <span>Collection</span>
          </div>
          {collectionCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#171717] text-white">
              {collectionCount}
            </span>
          )}
        </button>
      </div>

      {/* Subtle Divider */}
      <div className="mx-3 border-t border-[#EEEEEE]" />

      {/* Categories Header & Quick Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
            Categories ({ALL_CATEGORIES.length})
          </span>
          {selectedCategory !== 'All' && (
            <button
              type="button"
              onClick={() => handleNavClick('new')}
              className="text-[11px] font-medium text-[#171717] hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder="Filter categories..."
            aria-label="Filter color categories"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#EEEEEE] rounded-lg text-[#171717] placeholder-[#737373] focus:outline-none focus:border-[#171717] transition-colors"
          />
          {catSearch && (
            <button
              type="button"
              onClick={() => setCatSearch('')}
              aria-label="Clear category filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Category List */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-0.5">
        {filteredCategories.length === 0 ? (
          <p className="px-2 py-4 text-xs text-[#737373] text-center">
            No matching categories
          </p>
        ) : (
          filteredCategories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const IconComponent = meta.icon;
            const isSelected = activeNav === 'category' && selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCatClick(cat)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors group ${
                  isSelected
                    ? 'bg-[#F3F3F3] text-[#171717] font-semibold'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3]/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <IconComponent
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isSelected ? 'text-[#171717]' : 'text-[#737373] group-hover:text-[#171717]'
                    }`}
                  />
                  <span className="truncate">{cat}</span>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: meta.dotColor }}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        aria-label="Sidebar Navigation"
        className="hidden lg:block w-[244px] shrink-0 border-r border-[#EEEEEE] bg-white sticky top-[65px] h-[calc(100vh-65px)]"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-out */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            aria-label="Mobile Navigation Drawer"
            className="relative w-[260px] max-w-[80vw] bg-white h-full border-r border-[#EEEEEE] z-10 flex flex-col"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
