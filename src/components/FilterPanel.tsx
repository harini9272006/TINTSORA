import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ALL_CATEGORIES } from '../data/palettes';
import {
  BrightnessFilter,
  ColorCountFilter,
  FilterState,
  PaletteCategory,
  SaturationFilter,
  SortOption,
  TemperatureFilter,
} from '../types/palette';

interface FilterPanelProps {
  filters: FilterState;
  totalResults: number;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onGenerateMore: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  totalResults,
  onUpdateFilters,
  onResetFilters,
  onGenerateMore,
}) => {
  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.colorCount !== 'all' ||
    filters.brightness !== 'all' ||
    filters.temperature !== 'all' ||
    filters.saturation !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <section
      aria-label="Filter and sort palettes"
      className="bg-white border border-[#EEEEEE] rounded-2xl p-4 mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373]" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              onUpdateFilters({
                category: e.target.value as PaletteCategory | 'All',
              })
            }
            className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EEEEEE] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
          >
            <option value="All">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Number of Colors per Palette */}
          <select
            aria-label="Filter by number of colors"
            value={String(filters.colorCount)}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateFilters({
                colorCount: (val === 'all' ? 'all' : Number(val)) as ColorCountFilter,
              });
            }}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EEEEEE] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
          >
            <option value="all">Any Color Count (5–6)</option>
            <option value="5">5 Colors</option>
            <option value="6">6 Colors</option>
          </select>

          {/* Light or Dark Palettes */}
          <select
            aria-label="Filter by brightness"
            value={filters.brightness}
            onChange={(e) =>
              onUpdateFilters({ brightness: e.target.value as BrightnessFilter })
            }
            className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EEEEEE] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
          >
            <option value="all">Brightness: All</option>
            <option value="light">Light Palettes</option>
            <option value="dark">Dark Palettes</option>
          </select>

          {/* Warm or Cool Colors */}
          <select
            aria-label="Filter by color temperature"
            value={filters.temperature}
            onChange={(e) =>
              onUpdateFilters({ temperature: e.target.value as TemperatureFilter })
            }
            className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EEEEEE] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
          >
            <option value="all">Temperature: All</option>
            <option value="warm">Warm Colors</option>
            <option value="cool">Cool Colors</option>
          </select>

          {/* Saturation Level */}
          <select
            aria-label="Filter by saturation level"
            value={filters.saturation}
            onChange={(e) =>
              onUpdateFilters({ saturation: e.target.value as SaturationFilter })
            }
            className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EEEEEE] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
          >
            <option value="all">Saturation: All</option>
            <option value="vibrant">Vibrant & High</option>
            <option value="muted">Muted & Subtle</option>
            <option value="pastel">Soft Pastel</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#171717] bg-[#F3F3F3] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Right: Sort By & Results Count */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EEEEEE]">
          <span className="text-xs text-[#737373] font-medium">
            Showing <strong className="text-[#171717]">{totalResults}</strong> palettes
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-[#737373] font-medium">
              Sort:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) =>
                onUpdateFilters({ sortBy: e.target.value as SortOption })
              }
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EEEEEE] rounded-lg text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="random">Random Order</option>
            </select>

            <button
              type="button"
              onClick={onGenerateMore}
              title="Generate a fresh harmonious palette in this view"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
            >
              <span>Generate</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
