import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Heart,
  Code2,
  FileJson,
  Shuffle,
  Eye,
} from 'lucide-react';
import { Palette } from '../types/palette';
import { ColorInfo } from '../types/color';
import { createColorInfo } from '../utils/colorUtils';
import { copyToClipboard } from '../utils/clipboard';

interface PaletteDetailsProps {
  palette: Palette | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (palette: Palette) => void;
  onRemixPalette: (paletteId: string) => void;
  onInspectColor: (color: ColorInfo) => void;
}

const ROLE_NAMES = [
  'primary',
  'secondary',
  'accent',
  'surface',
  'highlight',
  'neutral',
];

export const PaletteDetails: React.FC<PaletteDetailsProps> = ({
  palette,
  onClose,
  isSaved,
  onToggleSave,
  onRemixPalette,
  onInspectColor,
}) => {
  const [exportTab, setExportTab] = useState<'css' | 'json' | 'tailwind'>('css');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!palette) return null;

  const colorInfos = palette.colors.map((hex) => createColorInfo(hex));

  // Build CSS variables output
  const cssVariablesCode = `:root {\n${colorInfos
    .map((c, idx) => {
      const role = ROLE_NAMES[idx] || `swatch-${idx + 1}`;
      return `  --color-${role}: ${c.hex}; /* ${c.name} - ${c.rgbString} */`;
    })
    .join('\n')}\n}`;

  // Build JSON object output
  const jsonExportObject = {
    name: palette.name,
    categories: palette.categories,
    colors: colorInfos.map((c, idx) => ({
      role: ROLE_NAMES[idx] || `swatch-${idx + 1}`,
      name: c.name,
      hex: c.hex,
      rgb: c.rgbString,
      hsl: c.hslString,
    })),
  };
  const jsonCode = JSON.stringify(jsonExportObject, null, 2);

  // Build Tailwind v4 / Config output
  const tailwindCode = `/* Tailwind CSS v4 @theme tokens */\n@theme {\n${colorInfos
    .map((c, idx) => {
      const role = ROLE_NAMES[idx] || `swatch-${idx + 1}`;
      return `  --color-brand-${role}: ${c.hex};`;
    })
    .join('\n')}\n}`;

  const activeExportString =
    exportTab === 'css'
      ? cssVariablesCode
      : exportTab === 'json'
      ? jsonCode
      : tailwindCode;

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(key);
      setTimeout(() => {
        setCopiedId((prev) => (prev === key ? null : prev));
      }, 1600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/35 backdrop-blur-[1px] overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Palette details and developer export for ${palette.name}`}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#EEEEEE] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col text-[#171717]"
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-[#EEEEEE] px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-base text-[#171717]">{palette.name}</h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {palette.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3F3F3] text-[#737373]"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRemixPalette(palette.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remix Palette</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(palette)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#171717] border-[#EEEEEE] hover:bg-[#F3F3F3]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#FF595E]' : ''}`} />
              <span>{isSaved ? 'Saved in Collection' : 'Save Palette'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Palette Details"
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Large Palette Banner + Bulk Copy Buttons */}
          <div className="space-y-3">
            <div className="h-36 sm:h-44 rounded-2xl overflow-hidden flex border border-[#EEEEEE]">
              {colorInfos.map((c, idx) => (
                <div
                  key={`${c.hex}-${idx}`}
                  onClick={() => {
                    onClose();
                    onInspectColor(c);
                  }}
                  style={{ backgroundColor: c.hex, color: c.textColor }}
                  className="flex-1 p-3 flex flex-col justify-between cursor-pointer hover:flex-[1.25] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                      --color-{ROLE_NAMES[idx] || idx + 1}
                    </span>
                    <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm truncate">{c.name}</div>
                    <div className="font-mono text-xs font-bold mt-0.5">{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Bulk Copy Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs text-[#737373]">
                Click any color above to open its 50–950 Shade Explorer, or copy individual formats below:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(palette.colors.join(', '), 'all-hex')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                >
                  {copiedId === 'all-hex' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981] font-semibold">Copied All HEX!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Copy All HEX Codes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(colorInfos.map((c) => c.rgbString).join(', '), 'all-rgb')
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                >
                  {copiedId === 'all-rgb' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981] font-semibold">Copied All RGB!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Copy All RGB</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(colorInfos.map((c) => c.hslString).join(', '), 'all-hsl')
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                >
                  {copiedId === 'all-hsl' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981] font-semibold">Copied All HSL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Copy All HSL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Color Breakdown Table (HEX, RGB, HSL per swatch) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Individual Color Breakdown (Click any code to copy)
            </h3>

            <div className="border border-[#EEEEEE] rounded-xl overflow-hidden divide-y divide-[#EEEEEE]">
              {colorInfos.map((c, idx) => (
                <div
                  key={`${c.hex}-row-${idx}`}
                  className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F3F3F3]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-9 h-9 rounded-lg border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#171717] truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#737373]">
                        Role: --color-{ROLE_NAMES[idx] || `swatch-${idx + 1}`}
                      </div>
                    </div>
                  </div>

                  {/* Copyable HEX, RGB, HSL Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { val: c.hex, id: `row-hex-${idx}` },
                      { val: c.rgbString, id: `row-rgb-${idx}` },
                      { val: c.hslString, id: `row-hsl-${idx}` },
                    ].map((code) => (
                      <button
                        key={code.id}
                        type="button"
                        onClick={() => handleCopy(code.val, code.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white border border-[#EEEEEE] hover:border-[#171717] text-[#171717] transition-colors cursor-pointer"
                      >
                        <span>{code.val}</span>
                        {copiedId === code.id ? (
                          <span className="text-[#10B981] font-sans font-semibold text-[11px] inline-flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied!
                          </span>
                        ) : (
                          <Copy className="w-3 h-3 text-[#737373]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Export Section (CSS Variables, JSON Object, Tailwind CSS) */}
          <div className="space-y-3 pt-2 border-t border-[#EEEEEE]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#171717]" />
                <h3 className="text-sm font-bold text-[#171717]">
                  Developer Export Tools (CSS Variables & JSON)
                </h3>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-[#F3F3F3] border border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setExportTab('css')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    exportTab === 'css'
                      ? 'bg-white text-[#171717]'
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  CSS Variables (:root)
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab('json')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    exportTab === 'json'
                      ? 'bg-white text-[#171717]'
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  <FileJson className="w-3 h-3" />
                  <span>JSON Object</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab('tailwind')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    exportTab === 'tailwind'
                      ? 'bg-white text-[#171717]'
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  Tailwind v4
                </button>
              </div>
            </div>

            <div className="relative rounded-xl border border-[#EEEEEE] bg-[#F3F3F3]/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-semibold text-[#737373]">
                  {exportTab === 'css'
                    ? 'variables.css'
                    : exportTab === 'json'
                    ? 'palette.json'
                    : 'theme.css'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeExportString, `export-${exportTab}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
                >
                  {copiedId === `export-${exportTab}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Copied {exportTab.toUpperCase()} Output!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy {exportTab.toUpperCase()} Output</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-[#171717] overflow-x-auto leading-relaxed">
                <code>{activeExportString}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
