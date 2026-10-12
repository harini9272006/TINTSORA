import React, { useState } from 'react';
import {
  Copy,
  Check,
  Heart,
  Shuffle,
  Code2,
  Eye,
} from 'lucide-react';
import { Palette } from '../types/palette';
import { ColorInfo } from '../types/color';
import { createColorInfo } from '../utils/colorUtils';
import { copyToClipboard } from '../utils/clipboard';

interface PaletteCardProps {
  palette: Palette;
  isSaved: boolean;
  onToggleSave: (palette: Palette) => void;
  onRemixPalette: (paletteId: string) => void;
  onOpenDetails: (palette: Palette) => void;
  onInspectColor: (color: ColorInfo) => void;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({
  palette,
  isSaved,
  onToggleSave,
  onRemixPalette,
  onOpenDetails,
  onInspectColor,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const colorInfos = palette.colors.map((hex) => createColorInfo(hex));

  const handleCopySingleHex = async (e: React.MouseEvent, hex: string) => {
    e.stopPropagation();
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedHex(hex);
      setTimeout(() => {
        setCopiedHex((prev) => (prev === hex ? null : prev));
      }, 1400);
    }
  };

  const handleCopyAll = async () => {
    const joined = palette.colors.join(', ');
    const ok = await copyToClipboard(joined);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1600);
    }
  };

  return (
    <article className="bg-white border border-[#EEEEEE] rounded-2xl p-3.5 hover:border-[#171717]/30 transition-all flex flex-col justify-between">
      {/* Horizontal 5+ Color Swatches Bar */}
      <div className="h-36 sm:h-40 w-full rounded-xl overflow-hidden flex border border-[#EEEEEE]">
        {colorInfos.map((c, idx) => {
          const isCopied = copiedHex === c.hex;
          return (
            <div
              key={`${palette.id}-${idx}-${c.hex}`}
              onClick={() => onInspectColor(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onInspectColor(c);
                }
              }}
              aria-label={`Inspect ${c.name} (${c.hex})`}
              style={{ backgroundColor: c.hex, color: c.textColor }}
              className="relative flex-1 hover:flex-[1.35] transition-all duration-200 flex flex-col justify-between p-2 cursor-pointer group/swatch select-none focus:outline-none"
            >
              {/* Top Inspect button on swatch hover */}
              <div className="flex justify-end opacity-0 group-hover/swatch:opacity-100 transition-opacity">
                <span
                  title={`Explore ${c.name} shades`}
                  className="p-1 rounded-md text-[10px] font-medium flex items-center gap-0.5"
                  style={{
                    backgroundColor: c.isLight ? 'rgba(23,23,23,0.12)' : 'rgba(255,255,255,0.18)',
                    color: c.textColor,
                  }}
                >
                  <Eye className="w-3 h-3" />
                </span>
              </div>

              {/* Bottom Always-Visible HEX Code & Copy button */}
              <div className="flex flex-col items-center sm:items-start gap-0.5 mt-auto">
                <span
                  className="hidden xl:block text-[10px] font-medium truncate max-w-full opacity-80"
                  style={{ color: c.textColor }}
                >
                  {c.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopySingleHex(e, c.hex)}
                  title={`Copy ${c.hex}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[10px] sm:text-[11px] font-semibold tracking-tight transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: c.isLight
                      ? 'rgba(255,255,255,0.72)'
                      : 'rgba(23,23,23,0.58)',
                    color: c.isLight ? '#171717' : '#FFFFFF',
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-2.5 h-2.5 shrink-0" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>{c.hex}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Palette Info & Action Toolbar */}
      <div className="pt-3 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              onClick={() => onOpenDetails(palette)}
              className="font-semibold text-sm text-[#171717] truncate hover:underline cursor-pointer"
            >
              {palette.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {palette.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 text-[10px] font-medium bg-[#F3F3F3] text-[#737373] rounded-md"
                >
                  {cat}
                </span>
              ))}
              <span className="text-[10px] text-[#737373] font-mono ml-0.5">
                • {palette.colors.length} colors
              </span>
            </div>
          </div>

          {/* Favorite / Save Palette Button */}
          <button
            type="button"
            onClick={() => onToggleSave(palette)}
            title={isSaved ? 'Remove from Collection' : 'Save palette to Collection'}
            aria-label={isSaved ? 'Remove from Collection' : 'Save palette to Collection'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
              isSaved
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-white text-[#737373] border-[#EEEEEE] hover:text-[#171717] hover:bg-[#F3F3F3]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#FF595E]' : ''}`} />
            <span>{isSaved ? palette.likes + 1 : palette.likes}</span>
          </button>
        </div>

        {/* Bottom Action Buttons Row */}
        <div className="pt-2 border-t border-[#EEEEEE] flex items-center justify-between gap-1.5">
          {/* Copy All Colors Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            title="Copy all HEX codes in this palette"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-[#171717] border border-[#EEEEEE] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-semibold">Copied All!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#737373]" />
                <span>Copy All</span>
              </>
            )}
          </button>

          {/* Randomize / Remix Palette Action */}
          <button
            type="button"
            onClick={() => onRemixPalette(palette.id)}
            title="Randomize / Remix this palette's colors"
            aria-label="Randomize this palette"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-[#737373] hover:text-[#171717] border border-[#EEEEEE] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remix</span>
          </button>

          {/* Open Palette Details & Developer Export Action */}
          <button
            type="button"
            onClick={() => onOpenDetails(palette)}
            title="Open Palette Details, CSS Variables & JSON Export"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-[#171717] border border-[#EEEEEE] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#737373]" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </article>
  );
};
