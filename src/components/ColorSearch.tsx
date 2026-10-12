import React, { useState } from 'react';
import {
  Copy,
  Check,
  Heart,
  Maximize2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ColorInfo, ColorSearchResult } from '../types/color';
import { Palette } from '../types/palette';
import { ColorSwatch } from './ColorSwatch';
import { copyToClipboard } from '../utils/clipboard';

interface ColorSearchProps {
  result: ColorSearchResult;
  favoriteColors: string[];
  onToggleFavoriteColor: (hex: string) => void;
  onInspectColor: (color: ColorInfo) => void;
  onClearSearch: () => void;
  onSelectSuggestion: (query: string) => void;
  onSaveCustomPalette: (palette: Palette) => void;
  savedPaletteIds: string[];
}

const SUGGESTED_QUERIES = [
  'Coral',
  'Lavender',
  'Teal',
  'Indigo',
  'Turquoise',
  'Mint',
  'Burgundy',
  'Beige',
  'Olive',
  'Crimson',
  '#FF5733',
  'rgb(59, 130, 246)',
  'hsl(160, 84%, 39%)',
];

export const ColorSearch: React.FC<ColorSearchProps> = ({
  result,
  favoriteColors,
  onToggleFavoriteColor,
  onInspectColor,
  onClearSearch,
  onSelectSuggestion,
  onSaveCustomPalette,
  savedPaletteIds,
}) => {
  const [visibleShadeCount, setVisibleShadeCount] = useState(24);
  const [activeTab, setActiveTab] = useState<'harmonies' | 'all-shades'>('harmonies');
  const [copiedBannerField, setCopiedBannerField] = useState<string | null>(null);

  const handleCopyValue = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedBannerField(key);
      setTimeout(() => {
        setCopiedBannerField((prev) => (prev === key ? null : prev));
      }, 1500);
    }
  };

  if (!result.isValid || !result.exactMatch) {
    return (
      <div className="bg-white border border-[#EEEEEE] rounded-2xl p-8 text-center max-w-2xl mx-auto my-6">
        <div className="w-12 h-12 rounded-2xl bg-[#F3F3F3] flex items-center justify-center mx-auto mb-4 text-[#171717]">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#171717]">
          No Matching Color Found for &ldquo;{result.query}&rdquo;
        </h2>
        <p className="mt-2 text-sm text-[#737373] leading-relaxed">
          {result.errorMessage}
        </p>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] mb-3">
            Try one of these valid color queries:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSelectSuggestion(q)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#EEEEEE] text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#EEEEEE]">
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Curated Palettes</span>
          </button>
        </div>
      </div>
    );
  }

  const base = result.exactMatch;
  const isBaseFav = favoriteColors.includes(base.hex);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation & Result Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EEEEEE]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#EEEEEE] text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Palettes</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#171717]">
              Color Intelligence Results for &ldquo;{result.query}&rdquo;
            </h2>
            <p className="text-xs text-[#737373]">
              Generated {result.allRelatedShades.length} mathematically valid shades, variations & harmonies
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-[#F3F3F3] border border-[#EEEEEE]">
          <button
            type="button"
            onClick={() => setActiveTab('harmonies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'harmonies'
                ? 'bg-white text-[#171717]'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            10 Harmonies & Variations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all-shades')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all-shades'
                ? 'bg-white text-[#171717]'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            All {result.allRelatedShades.length} Related Shades
          </button>
        </div>
      </div>

      {/* 1. EXACT MATCHING COLOR HERO CARD */}
      <section aria-label="Exact Matching Color" className="bg-white border border-[#EEEEEE] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Large Swatch Preview */}
          <div
            onClick={() => onInspectColor(base)}
            style={{ backgroundColor: base.hex, color: base.textColor }}
            className="lg:col-span-5 min-h-[210px] p-6 flex flex-col justify-between cursor-pointer relative group"
          >
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: base.isLight ? 'rgba(23,23,23,0.1)' : 'rgba(255,255,255,0.16)',
                  color: base.textColor,
                }}
              >
                1. Exact Matching Color
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: base.isLight ? 'rgba(23,23,23,0.1)' : 'rgba(255,255,255,0.16)',
                  color: base.textColor,
                }}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Shade Explorer</span>
              </span>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{base.name}</h3>
              <p className="font-mono text-sm opacity-90 mt-1">
                {base.hex} • {base.rgbString} • {base.hslString}
              </p>
            </div>
          </div>

          {/* Exact Color Codes & Actions */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-white">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                    Primary Color Specifications
                  </span>
                  <h4 className="text-xl font-bold text-[#171717]">{base.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleFavoriteColor(base.hex)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      isBaseFav
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isBaseFav ? 'fill-current text-[#FF595E]' : ''}`} />
                    <span>{isBaseFav ? 'Saved in Collection' : 'Save Color'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onInspectColor(base)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>50–950 Scale & Details</span>
                  </button>
                </div>
              </div>

              {/* Copyable Code Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'HEX Code', value: base.hex, key: 'hex' },
                  { label: 'RGB Value', value: base.rgbString, key: 'rgb' },
                  { label: 'HSL Value', value: base.hslString, key: 'hsl' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleCopyValue(item.value, item.key)}
                    className="p-3 rounded-xl border border-[#EEEEEE] hover:border-[#171717] bg-white text-left transition-colors flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-medium text-[#737373]">{item.label}</span>
                      {copiedBannerField === item.key ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                          <Check className="w-3 h-3" />
                          Copied!
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#171717]" />
                      )}
                    </div>
                    <span className="font-mono font-semibold text-xs sm:text-sm text-[#171717] truncate">
                      {item.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 50-950 Mini Strip Preview */}
            <div className="mt-5 pt-4 border-t border-[#EEEEEE]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                  Quick Design System Scale (50 – 950)
                </span>
                <span className="text-[11px] text-[#737373]">Click any stop to inspect</span>
              </div>
              <div className="grid grid-cols-11 rounded-lg overflow-hidden border border-[#EEEEEE] h-9">
                {result.shadeScale.map((s) => (
                  <button
                    key={s.stop}
                    type="button"
                    onClick={() => onInspectColor(s.color)}
                    title={`${s.stop}: ${s.color.hex}`}
                    style={{ backgroundColor: s.color.hex, color: s.color.textColor }}
                    className="flex items-center justify-center text-[10px] font-mono font-semibold hover:scale-105 transition-transform cursor-pointer"
                  >
                    {s.stop}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeTab === 'harmonies' ? (
        <div className="space-y-10">
          {/* 2. Lighter Variations */}
          <HarmonySection
            number="2"
            title="Lighter Variations (Tints)"
            description={`Gradually lightened variations of ${base.name} created by increasing HSL lightness while preserving hue.`}
            colors={result.lighterVariations}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 3. Darker Variations */}
          <HarmonySection
            number="3"
            title="Darker Variations (Shades)"
            description={`Rich, deeper variations of ${base.name} ideal for dark surfaces, borders, and high-contrast typography.`}
            colors={result.darkerVariations}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 4. Saturated & Desaturated Variations */}
          <section className="space-y-4">
            <div className="border-b border-[#EEEEEE] pb-2">
              <h3 className="text-base font-bold text-[#171717]">
                4. Saturated & Desaturated Variations (Tones)
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Compare high-chroma vivid variations alongside subtle, muted tones of {base.name}.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                High Saturation & Vivid Variations
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {result.saturatedVariations.map((c) => (
                  <ColorSwatch
                    key={`sat-${c.hex}`}
                    color={c}
                    onSelectColor={onInspectColor}
                    isFavorite={favoriteColors.includes(c.hex)}
                    onToggleFavorite={onToggleFavoriteColor}
                    badgeText="Saturated"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Desaturated & Muted Variations
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {result.desaturatedVariations.map((c) => (
                  <ColorSwatch
                    key={`desat-${c.hex}`}
                    color={c}
                    onSelectColor={onInspectColor}
                    isFavorite={favoriteColors.includes(c.hex)}
                    onToggleFavorite={onToggleFavoriteColor}
                    badgeText="Muted"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 5. Closely Related Shades */}
          <HarmonySection
            number="5"
            title="Closely Related Shades"
            description={`Neighboring shades and named colors in the ${base.name} family.`}
            colors={result.closelyRelatedShades}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 6. Complementary Colors */}
          <HarmonySection
            number="6"
            title="Complementary & Split-Complementary Colors"
            description="Directly opposite on the color wheel (180° hue rotation) for maximum visual contrast and accent pairing."
            colors={result.complementary}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 7. Analogous Colors */}
          <HarmonySection
            number="7"
            title="Analogous Colors"
            description="Adjacent hues on the color wheel (-45° to +45°) that create cohesive, serene multi-color gradients and UI themes."
            colors={result.analogous}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 8. Triadic Colors */}
          <HarmonySection
            number="8"
            title="Triadic Color Harmonies"
            description="Three evenly spaced hues (120° apart) offering vibrant balance and distinct semantic status colors."
            colors={result.triadic}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 9. Tetradic Color Combinations */}
          <HarmonySection
            number="9"
            title="Tetradic Color Combinations"
            description="Four-point rectangular and square color wheel harmonies for rich illustration and brand systems."
            colors={result.tetradic}
            favoriteColors={favoriteColors}
            onToggleFavoriteColor={onToggleFavoriteColor}
            onInspectColor={onInspectColor}
          />

          {/* 10. Monochromatic Palettes */}
          <section className="space-y-4">
            <div className="border-b border-[#EEEEEE] pb-2">
              <h3 className="text-base font-bold text-[#171717]">
                10. Monochromatic Palettes
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Ready-to-use 5-color monochromatic palettes derived mathematically from {base.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.monochromaticPalettes.map((monoColors, pIdx) => {
                const titles = [
                  `${base.name} Classic Monochromatic`,
                  `${base.name} Pastel Tint Scale`,
                  `${base.name} Deep Editorial Scale`,
                  `${base.name} Muted Architectural Scale`,
                ];
                const palId = `mono-${base.hex}-${pIdx}`;
                const hexArray = monoColors.map((m) => m.hex);
                const isPalSaved = savedPaletteIds.includes(palId);

                return (
                  <div
                    key={palId}
                    className="bg-white border border-[#EEEEEE] rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-[#171717]">{titles[pIdx]}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyValue(hexArray.join(', '), `mono-copy-${pIdx}`)
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBannerField === `mono-copy-${pIdx}` ? (
                            <>
                              <Check className="w-3 h-3 text-[#10B981]" />
                              <span className="text-[#10B981]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#737373]" />
                              <span>Copy All</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onSaveCustomPalette({
                              id: palId,
                              name: titles[pIdx],
                              colors: hexArray,
                              categories: ['Monochrome', 'Minimal'],
                              likes: 340 + pIdx * 45,
                              createdAt: new Date().toISOString(),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border inline-flex items-center gap-1 cursor-pointer ${
                            isPalSaved
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${isPalSaved ? 'fill-current text-[#FF595E]' : ''}`}
                          />
                          <span>{isPalSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="h-24 rounded-xl overflow-hidden flex border border-[#EEEEEE]">
                      {monoColors.map((mc) => (
                        <div
                          key={mc.hex}
                          onClick={() => onInspectColor(mc)}
                          style={{ backgroundColor: mc.hex, color: mc.textColor }}
                          className="flex-1 p-2 flex flex-col justify-end cursor-pointer hover:flex-[1.25] transition-all"
                        >
                          <span className="font-mono text-[11px] font-semibold">
                            {mc.hex}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {/* ALL 50+ RELATED SHADES SECTION (Always visible at bottom or when tab is active) */}
      <section className="space-y-4 pt-4 border-t border-[#EEEEEE]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#737373]">
              <Layers className="w-3.5 h-3.5" />
              <span>Extended Shade Library</span>
            </div>
            <h3 className="text-lg font-bold text-[#171717]">
              All {result.allRelatedShades.length} Related Shades & Variations for {base.name}
            </h3>
          </div>
          <span className="text-xs text-[#737373]">
            Showing {Math.min(visibleShadeCount, result.allRelatedShades.length)} of{' '}
            {result.allRelatedShades.length} shades
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {result.allRelatedShades.slice(0, visibleShadeCount).map((shade) => (
            <ColorSwatch
              key={`all-${shade.hex}`}
              color={shade}
              onSelectColor={onInspectColor}
              isFavorite={favoriteColors.includes(shade.hex)}
              onToggleFavorite={onToggleFavoriteColor}
              badgeText={shade.category}
            />
          ))}
        </div>

        {visibleShadeCount < result.allRelatedShades.length && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleShadeCount((prev) => prev + 24)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#171717] text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              <span>
                Load More Shades ({result.allRelatedShades.length - visibleShadeCount} remaining)
              </span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

interface HarmonySectionProps {
  number: string;
  title: string;
  description: string;
  colors: ColorInfo[];
  favoriteColors: string[];
  onToggleFavoriteColor: (hex: string) => void;
  onInspectColor: (color: ColorInfo) => void;
}

const HarmonySection: React.FC<HarmonySectionProps> = ({
  number,
  title,
  description,
  colors,
  favoriteColors,
  onToggleFavoriteColor,
  onInspectColor,
}) => {
  return (
    <section className="space-y-3.5">
      <div className="border-b border-[#EEEEEE] pb-2">
        <h3 className="text-base font-bold text-[#171717]">
          {number}. {title}
        </h3>
        <p className="text-xs text-[#737373] mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {colors.map((c) => (
          <ColorSwatch
            key={`${number}-${c.hex}`}
            color={c}
            onSelectColor={onInspectColor}
            isFavorite={favoriteColors.includes(c.hex)}
            onToggleFavorite={onToggleFavoriteColor}
          />
        ))}
      </div>
    </section>
  );
};
