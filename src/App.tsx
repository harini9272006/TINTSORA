import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shuffle,
  Sparkles,
  Copy,
  Check,
  Heart,
  Code2,
  Plus,
} from 'lucide-react';
import { CURATED_PALETTES } from './data/palettes';
import { ColorInfo } from './types/color';
import {
  FilterState,
  NavSection,
  Palette,
  PaletteCategory,
} from './types/palette';
import { createColorInfo, normalizeHex, searchColorsByQuery } from './utils/colorUtils';
import {
  generateHarmoniousPalette,
  getPaletteMetrics,
  remixPalette,
} from './utils/paletteGenerator';
import { copyToClipboard } from './utils/clipboard';
import { Header, QUICK_SEARCH_CHIPS } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterPanel } from './components/FilterPanel';
import { PaletteCard } from './components/PaletteCard';
import { ColorSearch } from './components/ColorSearch';
import { ShadeExplorer } from './components/ShadeExplorer';
import { PaletteDetails } from './components/PaletteDetails';
import { CollectionView } from './components/CollectionView';

const STORAGE_PALETTES_KEY = 'tintsora_saved_palettes_v1';
const STORAGE_COLORS_KEY = 'tintsora_favorite_colors_v1';

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  colorCount: 'all',
  brightness: 'all',
  temperature: 'all',
  saturation: 'all',
  sortBy: 'newest',
};

export function App() {
  // All available palettes (starts with 56 curated palettes + any generated during session)
  const [palettes, setPalettes] = useState<Palette[]>(() => CURATED_PALETTES);

  // Saved Palettes in localStorage
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PALETTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Favorite Colors in localStorage
  const [favoriteColors, setFavoriteColors] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_COLORS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Navigation & Filter State
  const [activeNav, setActiveNav] = useState<NavSection>('new');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search State (with debounce for smooth typing)
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Featured Random Palette (for the Random Studio mode)
  const [featuredRandomPalette, setFeaturedRandomPalette] = useState<Palette>(() =>
    generateHarmoniousPalette(undefined, 5)
  );
  const [randomSeedCounter, setRandomSeedCounter] = useState(0);
  const [copiedRandomSpotlight, setCopiedRandomSpotlight] = useState<string | null>(null);

  // Active Modals
  const [inspectedColor, setInspectedColor] = useState<ColorInfo | null>(null);
  const [detailsPalette, setDetailsPalette] = useState<Palette | null>(null);

  // Sync savedPalettes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PALETTES_KEY, JSON.stringify(savedPalettes));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedPalettes]);

  // Sync favoriteColors to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COLORS_KEY, JSON.stringify(favoriteColors));
    } catch {
      // Ignore storage quota errors
    }
  }, [favoriteColors]);

  // Debounce search query slightly (120ms) for snappy yet smooth performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 120);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedColor) setInspectedColor(null);
        else if (detailsPalette) setDetailsPalette(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedColor, detailsPalette]);

  // Saved Palette IDs Set for fast O(1) lookup
  const savedPaletteIds = useMemo(
    () => savedPalettes.map((p) => p.id),
    [savedPalettes]
  );

  // Toggle saving a palette
  const handleToggleSavePalette = useCallback((palette: Palette) => {
    setSavedPalettes((prev) => {
      const exists = prev.some((p) => p.id === palette.id);
      if (exists) {
        return prev.filter((p) => p.id !== palette.id);
      }
      return [palette, ...prev];
    });
  }, []);

  // Rename a saved palette in Collection
  const handleRenameSavedPalette = useCallback((paletteId: string, newName: string) => {
    setSavedPalettes((prev) =>
      prev.map((p) => (p.id === paletteId ? { ...p, name: newName } : p))
    );
    setPalettes((prev) =>
      prev.map((p) => (p.id === paletteId ? { ...p, name: newName } : p))
    );
  }, []);

  // Remove a saved palette
  const handleRemoveSavedPalette = useCallback((paletteId: string) => {
    setSavedPalettes((prev) => prev.filter((p) => p.id !== paletteId));
  }, []);

  // Toggle favorite individual color
  const handleToggleFavoriteColor = useCallback((rawHex: string) => {
    const norm = normalizeHex(rawHex) || rawHex.toUpperCase();
    setFavoriteColors((prev) =>
      prev.includes(norm) ? prev.filter((h) => h !== norm) : [norm, ...prev]
    );
  }, []);

  // Remix/Randomize a specific palette card
  const handleRemixPalette = useCallback((paletteId: string) => {
    setPalettes((prev) =>
      prev.map((p) => {
        if (p.id !== paletteId) return p;
        const remixed = remixPalette(p);
        // keep same id so it updates in place smoothly
        return { ...remixed, id: p.id };
      })
    );
    setDetailsPalette((prev) => {
      if (!prev || prev.id !== paletteId) return prev;
      const remixed = remixPalette(prev);
      return { ...remixed, id: prev.id };
    });
  }, []);

  // Generate a new harmonious random palette and show Random view
  const handleTriggerRandom = useCallback(() => {
    const seedCat = filters.category !== 'All' ? filters.category : undefined;
    const count = filters.colorCount === 6 ? 6 : 5;
    const newPal = generateHarmoniousPalette(seedCat, count);
    setFeaturedRandomPalette(newPal);
    setPalettes((prev) => [newPal, ...prev]);
    setSearchInput('');
    setDebouncedQuery('');
    setActiveNav('random');
    setFilters((prev) => ({ ...prev, sortBy: 'random' }));
    setRandomSeedCounter((c) => c + 1);
  }, [filters.category, filters.colorCount]);

  // Generate 6 more harmonious palettes on demand ("Load More / Generate")
  const handleGenerateMorePalettes = useCallback(() => {
    const seedCat = filters.category !== 'All' ? filters.category : undefined;
    const batch: Palette[] = [];
    for (let i = 0; i < 6; i++) {
      batch.push(generateHarmoniousPalette(seedCat, i % 3 === 0 ? 6 : 5));
    }
    setPalettes((prev) => [...batch, ...prev]);
  }, [filters.category]);

  // Sidebar Navigation Handlers
  const handleSelectNav = useCallback(
    (nav: NavSection) => {
      setSearchInput('');
      setDebouncedQuery('');
      setActiveNav(nav);

      if (nav === 'new') {
        setFilters({ ...DEFAULT_FILTERS, sortBy: 'newest' });
      } else if (nav === 'popular') {
        setFilters({ ...DEFAULT_FILTERS, sortBy: 'popular' });
      } else if (nav === 'random') {
        handleTriggerRandom();
      }
    },
    [handleTriggerRandom]
  );

  const handleSelectCategory = useCallback((cat: PaletteCategory) => {
    setSearchInput('');
    setDebouncedQuery('');
    setActiveNav('category');
    setFilters((prev) => ({
      ...prev,
      category: cat,
    }));
  }, []);

  const handleUpdateFilters = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.category !== undefined) {
        if (partial.category === 'All') {
          setActiveNav(updated.sortBy === 'popular' ? 'popular' : 'new');
        } else {
          setActiveNav('category');
        }
      }
      if (partial.sortBy === 'random') {
        setRandomSeedCounter((c) => c + 1);
      }
      return updated;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActiveNav('new');
  }, []);

  // Filtered & Sorted Palettes
  const filteredPalettes = useMemo(() => {
    const result = palettes.filter((pal) => {
      // Category filter
      if (filters.category !== 'All' && !pal.categories.includes(filters.category)) {
        return false;
      }

      // Color count filter
      if (filters.colorCount !== 'all' && pal.colors.length !== filters.colorCount) {
        return false;
      }

      const metrics = getPaletteMetrics(pal.colors);

      // Brightness filter
      if (filters.brightness === 'light' && !metrics.isLight && !pal.categories.includes('Light')) {
        return false;
      }
      if (filters.brightness === 'dark' && !metrics.isDark && !pal.categories.includes('Dark')) {
        return false;
      }

      // Temperature filter
      if (filters.temperature === 'warm' && !metrics.isWarm && !pal.categories.includes('Warm')) {
        return false;
      }
      if (filters.temperature === 'cool' && !metrics.isCool && !pal.categories.includes('Cold')) {
        return false;
      }

      // Saturation filter
      if (
        filters.saturation === 'vibrant' &&
        !metrics.isVibrant &&
        !pal.categories.includes('Vibrant') &&
        !pal.categories.includes('Neon')
      ) {
        return false;
      }
      if (
        filters.saturation === 'muted' &&
        !metrics.isMuted &&
        !pal.categories.includes('Muted')
      ) {
        return false;
      }
      if (
        filters.saturation === 'pastel' &&
        !metrics.isPastel &&
        !pal.categories.includes('Pastel')
      ) {
        return false;
      }

      return true;
    });

    // Sort
    const sorted = [...result];
    if (filters.sortBy === 'popular') {
      sorted.sort((a, b) => b.likes - a.likes);
    } else if (filters.sortBy === 'newest') {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (filters.sortBy === 'random') {
      // Deterministic shuffle tied to randomSeedCounter so it doesn't jitter on unrelated state updates
      sorted.sort((a, b) => {
        const hashA =
          a.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
          randomSeedCounter * 31;
        const hashB =
          b.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
          randomSeedCounter * 17;
        return (hashA % 97) - (hashB % 97);
      });
    }

    return sorted;
  }, [palettes, filters, randomSeedCounter]);

  // Color Search Result when search query is active
  const colorSearchResult = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    return searchColorsByQuery(debouncedQuery);
  }, [debouncedQuery]);

  const totalCollectionCount = savedPalettes.length + favoriteColors.length;

  const handleCopySpotlight = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedRandomSpotlight(key);
      setTimeout(() => {
        setCopiedRandomSpotlight((prev) => (prev === key ? null : prev));
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col">
      {/* Top Header */}
      <Header
        searchQuery={searchInput}
        onSearchChange={(val) => setSearchInput(val)}
        onTriggerRandom={handleTriggerRandom}
        onOpenCollection={() => {
          setSearchInput('');
          setDebouncedQuery('');
          setActiveNav('collection');
        }}
        onResetHome={() => {
          setSearchInput('');
          setDebouncedQuery('');
          setActiveNav('new');
          setFilters(DEFAULT_FILTERS);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        collectionCount={totalCollectionCount}
        isCollectionActive={activeNav === 'collection' && !debouncedQuery.trim()}
      />

      {/* Main Content Area with Fixed Left Sidebar */}
      <div className="flex-1 flex">
        <Sidebar
          activeNav={activeNav}
          selectedCategory={filters.category}
          collectionCount={totalCollectionCount}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onSelectNav={handleSelectNav}
          onSelectCategory={handleSelectCategory}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 bg-white">
          {/* Aligned Hero Banner at top of Main Content */}
          <div className="pb-6 mb-6 border-b border-[#EEEEEE] flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="flex flex-col items-start">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717] leading-tight">
                Discover Your Perfect Color Palette
              </h1>
            </div>

            {/* Quick Color Search Suggestions */}
            <div className="flex flex-col items-start xl:items-end gap-2">
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Try instant color intelligence:
              </span>
              <div className="flex flex-wrap gap-1.5 xl:justify-end max-w-xl">
                {QUICK_SEARCH_CHIPS.map((chip) => {
                  const isActive =
                    searchInput.trim().toLowerCase() === chip.toLowerCase();
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setSearchInput(isActive ? '' : chip)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white text-[#737373] border-[#EEEEEE] hover:text-[#171717] hover:bg-[#F3F3F3]'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 1. If user is searching for a color, show the ColorSearch intelligence view */}
          {colorSearchResult ? (
            <ColorSearch
              result={colorSearchResult}
              favoriteColors={favoriteColors}
              onToggleFavoriteColor={handleToggleFavoriteColor}
              onInspectColor={(color) => setInspectedColor(color)}
              onClearSearch={() => {
                setSearchInput('');
                setDebouncedQuery('');
              }}
              onSelectSuggestion={(q) => {
                setSearchInput(q);
                setDebouncedQuery(q);
              }}
              onSaveCustomPalette={handleToggleSavePalette}
              savedPaletteIds={savedPaletteIds}
            />
          ) : activeNav === 'collection' ? (
            /* 2. Collection View */
            <CollectionView
              savedPalettes={savedPalettes}
              favoriteColorHexes={favoriteColors}
              onRenameSavedPalette={handleRenameSavedPalette}
              onRemoveSavedPalette={handleRemoveSavedPalette}
              onToggleFavoriteColor={handleToggleFavoriteColor}
              onOpenPaletteDetails={(pal) => setDetailsPalette(pal)}
              onInspectColor={(color) => setInspectedColor(color)}
              onExplorePalettes={() => setActiveNav('new')}
              onTriggerRandom={handleTriggerRandom}
            />
          ) : (
            /* 3. Main Palettes Discovery View (New, Popular, Random, or Category) */
            <div className="space-y-6 pb-12">
              {/* Random Harmonious Generator Studio Banner when in Random mode */}
              {activeNav === 'random' && (
                <section
                  aria-label="Random Harmonious Palette Generator"
                  className="bg-white border border-[#171717] rounded-2xl p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#737373]">
                        <Sparkles className="w-3.5 h-3.5 text-[#171717]" />
                        <span>Harmonious Color Generator</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#171717] mt-0.5">
                        {featuredRandomPalette.name}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTriggerRandom}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Generate New Random Palette</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopySpotlight(
                            featuredRandomPalette.colors.join(', '),
                            'random-all'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                      >
                        {copiedRandomSpotlight === 'random-all' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981]">Copied All!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#737373]" />
                            <span>Copy All</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSavePalette(featuredRandomPalette)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          savedPaletteIds.includes(featuredRandomPalette.id)
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            savedPaletteIds.includes(featuredRandomPalette.id)
                              ? 'fill-current text-[#FF595E]'
                              : ''
                          }`}
                        />
                        <span>
                          {savedPaletteIds.includes(featuredRandomPalette.id)
                            ? 'Saved'
                            : 'Save Palette'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDetailsPalette(featuredRandomPalette)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Export CSS / JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Large Interactive Swatch Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {featuredRandomPalette.colors.map((hex) => {
                      const info = createColorInfo(hex);
                      return (
                        <div
                          key={hex}
                          onClick={() => setInspectedColor(info)}
                          className="rounded-xl border border-[#EEEEEE] overflow-hidden cursor-pointer hover:border-[#171717] transition-all"
                        >
                          <div
                            style={{ backgroundColor: info.hex, color: info.textColor }}
                            className="h-24 p-3 flex flex-col justify-between"
                          >
                            <span className="text-[11px] font-semibold truncate">
                              {info.name}
                            </span>
                            <span className="font-mono text-xs font-bold">{info.hex}</span>
                          </div>
                          <div className="p-2.5 bg-white text-[11px] font-mono text-[#737373] space-y-0.5">
                            <div className="text-[#171717] font-semibold">{info.hex}</div>
                            <div>{info.rgbString}</div>
                            <div>{info.hslString}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Active View Heading & Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#171717]">
                    {filters.category !== 'All'
                      ? `${filters.category} Color Palettes`
                      : activeNav === 'popular'
                      ? 'Most Popular Color Palettes'
                      : activeNav === 'random'
                      ? 'Random & Harmonious Palettes'
                      : 'Newly Featured Curated Palettes'}
                  </h2>
                  <p className="text-xs text-[#737373]">
                    Click any swatch to inspect its 50–950 shade scale, or click any HEX code to copy immediately.
                  </p>
                </div>
              </div>

              <FilterPanel
                filters={filters}
                totalResults={filteredPalettes.length}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={handleResetFilters}
                onGenerateMore={handleGenerateMorePalettes}
              />

              {/* Palettes Grid */}
              {filteredPalettes.length === 0 ? (
                <div className="bg-white border border-[#EEEEEE] rounded-2xl p-10 text-center max-w-lg mx-auto my-6">
                  <h3 className="text-base font-bold text-[#171717]">
                    No Palettes Match These Exact Filter Criteria
                  </h3>
                  <p className="mt-1.5 text-xs text-[#737373] leading-relaxed">
                    Try clearing one of the filters or generate fresh harmonious palettes tailored to your current category.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateMorePalettes}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#EEEEEE] text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                    >
                      Generate Palettes for This Filter
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredPalettes.map((palette) => (
                      <PaletteCard
                        key={palette.id}
                        palette={palette}
                        isSaved={savedPaletteIds.includes(palette.id)}
                        onToggleSave={handleToggleSavePalette}
                        onRemixPalette={handleRemixPalette}
                        onOpenDetails={(pal) => setDetailsPalette(pal)}
                        onInspectColor={(color) => setInspectedColor(color)}
                      />
                    ))}
                  </div>

                  {/* Load More / Generate On-Demand Button */}
                  <div className="pt-6 text-center">
                    <button
                      type="button"
                      onClick={handleGenerateMorePalettes}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-[#171717] text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        Load & Generate 6 More Harmonious Palettes
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Minimalist Clean White Footer */}
      <footer className="bg-white border-t border-[#EEEEEE] px-6 py-5 text-xs text-[#737373]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Tintsora — Every Color. Every Shade. Endless Possibilities."
              className="h-7 w-auto object-contain"
            />
          </div>
          <div>
            Built for UI/UX Designers, Developers & Creators • Instant HEX, RGB, HSL & CSS Export
          </div>
        </div>
      </footer>

      {/* Color Shade Explorer Modal */}
      <ShadeExplorer
        color={inspectedColor}
        onClose={() => setInspectedColor(null)}
        onSelectColor={(color) => setInspectedColor(color)}
        isFavorite={inspectedColor ? favoriteColors.includes(inspectedColor.hex) : false}
        onToggleFavoriteColor={handleToggleFavoriteColor}
        onSearchColor={(query) => {
          setSearchInput(query);
          setDebouncedQuery(query);
        }}
        onSavePalette={handleToggleSavePalette}
        savedPaletteIds={savedPaletteIds}
      />

      {/* Developer Palette Details & Export Modal */}
      <PaletteDetails
        palette={detailsPalette}
        onClose={() => setDetailsPalette(null)}
        isSaved={detailsPalette ? savedPaletteIds.includes(detailsPalette.id) : false}
        onToggleSave={handleToggleSavePalette}
        onRemixPalette={handleRemixPalette}
        onInspectColor={(color) => setInspectedColor(color)}
      />
    </div>
  );
}

export default App;
