import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Heart,
  Sparkles,
  Contrast,
  Search,
} from 'lucide-react';
import { ColorInfo } from '../types/color';
import { Palette } from '../types/palette';
import {
  createColorInfo,
  generateShadeScale,
  getContrastRatio,
  hslToHex,
  clamp,
} from '../utils/colorUtils';
import { generateMatchingPalettesForColor } from '../utils/paletteGenerator';
import { copyToClipboard } from '../utils/clipboard';

interface ShadeExplorerProps {
  color: ColorInfo | null;
  onClose: () => void;
  onSelectColor: (color: ColorInfo) => void;
  isFavorite: boolean;
  onToggleFavoriteColor: (hex: string) => void;
  onSearchColor: (query: string) => void;
  onSavePalette: (palette: Palette) => void;
  savedPaletteIds: string[];
}

export const ShadeExplorer: React.FC<ShadeExplorerProps> = ({
  color,
  onClose,
  onSelectColor,
  isFavorite,
  onToggleFavoriteColor,
  onSearchColor,
  onSavePalette,
  savedPaletteIds,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!color) return null;

  const { h, s, l } = color.hsl;
  const shadeScale = generateShadeScale(color.hex);
  const contrastWhite = getContrastRatio(color.hex, '#FFFFFF');
  const contrastBlack = getContrastRatio(color.hex, '#171717');

  // Complementary & Analogous
  const complementaryColors: ColorInfo[] = [
    createColorInfo(hslToHex({ h: (h + 180) % 360, s: clamp(s, 35, 95), l })),
    createColorInfo(hslToHex({ h: (h + 160) % 360, s: clamp(s, 35, 95), l })),
    createColorInfo(hslToHex({ h: (h + 200) % 360, s: clamp(s, 35, 95), l })),
  ];

  const analogousColors: ColorInfo[] = [
    createColorInfo(hslToHex({ h: (h - 30 + 360) % 360, s: clamp(s, 35, 95), l })),
    createColorInfo(hslToHex({ h: (h - 15 + 360) % 360, s: clamp(s, 35, 95), l })),
    createColorInfo(hslToHex({ h: (h + 15) % 360, s: clamp(s, 35, 95), l })),
    createColorInfo(hslToHex({ h: (h + 30) % 360, s: clamp(s, 35, 95), l })),
  ];

  // Monochromatic variations
  const monochromaticVariations: ColorInfo[] = [86, 72, 58, 42, 26, 14].map((targetL) =>
    createColorInfo(hslToHex({ h, s: clamp(s, 25, 95), l: targetL }))
  );

  // Related color families
  const relatedFamilies = [
    { label: 'Warm Neighbor', color: createColorInfo(hslToHex({ h: (h - 22 + 360) % 360, s, l })) },
    { label: 'Cool Neighbor', color: createColorInfo(hslToHex({ h: (h + 22) % 360, s, l })) },
    { label: 'Pastel Tint', color: createColorInfo(hslToHex({ h, s: clamp(s, 45, 80), l: 84 })) },
    { label: 'Muted Tone', color: createColorInfo(hslToHex({ h, s: clamp(Math.round(s * 0.4), 12, 45), l })) },
    { label: 'Deep Velvet', color: createColorInfo(hslToHex({ h, s: clamp(s, 40, 90), l: 22 })) },
  ];

  const matchingPalettes = generateMatchingPalettesForColor(color.hex);

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1500);
    }
  };

  const handleCopyAllFormats = () => {
    const summary = `${color.name}\nHEX: ${color.hex}\nRGB: ${color.rgbString}\nHSL: ${color.hslString}`;
    handleCopy(summary, 'all-formats');
  };

  const handleCopyScaleCss = () => {
    const slug = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const lines = shadeScale.map((s) => `  --color-${slug}-${s.stop}: ${s.color.hex};`);
    const css = `:root {\n${lines.join('\n')}\n}`;
    handleCopy(css, 'scale-css');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 backdrop-blur-[1px] overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Color Shade Explorer for ${color.name}`}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#EEEEEE] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col text-[#171717]"
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-[#EEEEEE] px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-md border border-black/10 shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <h2 className="font-bold text-base text-[#171717]">
              Shade Explorer — {color.name} ({color.hex})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSearchColor(color.hex);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Harmony Search</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavoriteColor(color.hex)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-[#FF595E]' : ''}`} />
              <span>{isFavorite ? 'Saved' : 'Save Color'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Shade Explorer"
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-7">
          {/* Large Preview + Exact Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Large Color Preview */}
            <div
              style={{ backgroundColor: color.hex, color: color.textColor }}
              className="md:col-span-5 rounded-2xl p-6 min-h-[190px] flex flex-col justify-between border border-[#EEEEEE]"
            >
              <div className="flex items-center justify-between text-xs font-medium opacity-85">
                <span className="font-mono">{color.hex}</span>
                <span className="inline-flex items-center gap-1">
                  <Contrast className="w-3.5 h-3.5" />
                  {color.isLight ? 'Light Swatch' : 'Dark Swatch'}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold tracking-tight">{color.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono opacity-90">
                  <span>vs White: {contrastWhite}:1</span>
                  <span>•</span>
                  <span>vs Black: {contrastBlack}:1</span>
                </div>
              </div>
            </div>

            {/* Exact HEX, RGB, HSL & Copy All */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Exact Color Specifications
                </span>
                <button
                  type="button"
                  onClick={handleCopyAllFormats}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#F3F3F3] hover:bg-[#EEEEEE] text-[#171717] transition-colors cursor-pointer"
                >
                  {copiedKey === 'all-formats' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981] font-semibold">Copied All Codes!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Copy All Codes</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'HEX', val: color.hex, key: 'hex' },
                  { label: 'RGB', val: color.rgbString, key: 'rgb' },
                  { label: 'HSL', val: color.hslString, key: 'hsl' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => handleCopy(f.val, f.key)}
                    className="p-3 rounded-xl border border-[#EEEEEE] hover:border-[#171717] bg-white text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-[#737373]">{f.label}</span>
                      {copiedKey === f.key ? (
                        <span className="text-[11px] font-semibold text-[#10B981] inline-flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#171717]" />
                      )}
                    </div>
                    <div className="font-mono font-semibold text-xs text-[#171717] truncate">
                      {f.val}
                    </div>
                  </button>
                ))}
              </div>

              {/* Related Color Families */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block mb-2">
                  Related Color Families (Click to switch)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {relatedFamilies.map((fam) => (
                    <button
                      key={fam.label}
                      type="button"
                      onClick={() => onSelectColor(fam.color)}
                      className="p-1.5 rounded-lg border border-[#EEEEEE] hover:border-[#171717] bg-white text-left transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span
                        className="w-5 h-5 rounded-md shrink-0 border border-black/10"
                        style={{ backgroundColor: fam.color.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-[#171717] truncate">
                          {fam.label}
                        </div>
                        <div className="text-[10px] font-mono text-[#737373]">
                          {fam.color.hex}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Complete 50 - 950 Shade Scale */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Complete Light-to-Dark Shade Scale (50 – 950)
                </h3>
                <p className="text-xs text-[#737373]">
                  Click any shade stop to copy its HEX code, or double-click to inspect it.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyScaleCss}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
              >
                {copiedKey === 'scale-css' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981] font-semibold">Copied CSS Variables!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Copy 50–950 CSS Scale</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-11 gap-2">
              {shadeScale.map((s) => {
                const key = `stop-${s.stop}`;
                return (
                  <div
                    key={s.stop}
                    onClick={() => handleCopy(s.color.hex, key)}
                    onDoubleClick={() => onSelectColor(s.color)}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5 ${
                      s.isBaseMatch ? 'border-[#171717] ring-2 ring-[#171717]/20' : 'border-[#EEEEEE]'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: s.color.hex, color: s.color.textColor }}
                      className="h-16 p-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono">{s.stop}</span>
                        {s.isBaseMatch && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current" title="Selected base shade" />
                        )}
                      </div>
                      {copiedKey === key ? (
                        <span className="text-[10px] font-semibold">Copied!</span>
                      ) : (
                        <span className="text-[10px] font-mono opacity-90">{s.color.hex}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Harmonies Row: Complementary, Analogous, Monochromatic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Complementary */}
            <div className="p-4 rounded-xl border border-[#EEEEEE] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                Complementary Colors
              </h4>
              <div className="space-y-2">
                {complementaryColors.map((c) => (
                  <MiniColorRow
                    key={c.hex}
                    color={c}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                    onSelect={onSelectColor}
                  />
                ))}
              </div>
            </div>

            {/* Analogous */}
            <div className="p-4 rounded-xl border border-[#EEEEEE] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                Analogous Colors
              </h4>
              <div className="space-y-2">
                {analogousColors.slice(0, 3).map((c) => (
                  <MiniColorRow
                    key={c.hex}
                    color={c}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                    onSelect={onSelectColor}
                  />
                ))}
              </div>
            </div>

            {/* Monochromatic */}
            <div className="p-4 rounded-xl border border-[#EEEEEE] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                Monochromatic Variations
              </h4>
              <div className="space-y-2">
                {monochromaticVariations.slice(0, 3).map((c) => (
                  <MiniColorRow
                    key={c.hex}
                    color={c}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                    onSelect={onSelectColor}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Matching Palettes Section */}
          <div className="space-y-3 pt-2 border-t border-[#EEEEEE]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#171717]" />
              <h3 className="text-sm font-bold text-[#171717]">
                Matching Palettes Featuring {color.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {matchingPalettes.map((mp) => {
                const isSaved = savedPaletteIds.includes(mp.id);
                return (
                  <div
                    key={mp.id}
                    className="p-3.5 rounded-xl border border-[#EEEEEE] space-y-2.5 bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-[#171717] truncate">
                        {mp.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(mp.colors.join(', '), mp.id)}
                          className="px-2 py-1 rounded-md text-[11px] font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] cursor-pointer"
                        >
                          {copiedKey === mp.id ? 'Copied!' : 'Copy All'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSavePalette(mp)}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                            isSaved
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
                          }`}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>

                    <div className="h-14 rounded-lg overflow-hidden flex border border-[#EEEEEE]">
                      {mp.colors.map((hex) => {
                        const info = createColorInfo(hex);
                        return (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => onSelectColor(info)}
                            style={{ backgroundColor: hex, color: info.textColor }}
                            className="flex-1 flex items-end justify-center pb-1 text-[10px] font-mono font-semibold hover:flex-[1.3] transition-all cursor-pointer"
                          >
                            {hex}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MiniColorRowProps {
  color: ColorInfo;
  copiedKey: string | null;
  onCopy: (val: string, key: string) => void;
  onSelect: (color: ColorInfo) => void;
}

const MiniColorRow: React.FC<MiniColorRowProps> = ({
  color,
  copiedKey,
  onCopy,
  onSelect,
}) => {
  const key = `mini-${color.hex}`;
  return (
    <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg border border-[#EEEEEE] hover:bg-[#F3F3F3]/60 transition-colors">
      <button
        type="button"
        onClick={() => onSelect(color)}
        className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
      >
        <span
          className="w-7 h-7 rounded-md border border-black/10 shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#171717] truncate">{color.name}</div>
          <div className="text-[11px] font-mono text-[#737373]">{color.hex}</div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onCopy(color.hex, key)}
        className="px-2 py-1 rounded-md text-[11px] font-medium text-[#737373] hover:text-[#171717] hover:bg-white border border-transparent hover:border-[#EEEEEE] cursor-pointer"
      >
        {copiedKey === key ? (
          <span className="text-[#10B981] font-semibold">Copied!</span>
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
