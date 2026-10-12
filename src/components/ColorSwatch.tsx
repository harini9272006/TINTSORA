import React, { useState } from 'react';
import { Copy, Check, Heart, Maximize2 } from 'lucide-react';
import { ColorInfo } from '../types/color';
import { copyToClipboard } from '../utils/clipboard';

interface ColorSwatchProps {
  color: ColorInfo;
  onSelectColor: (color: ColorInfo) => void;
  isFavorite: boolean;
  onToggleFavorite: (hex: string) => void;
  badgeText?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  onSelectColor,
  isFavorite,
  onToggleFavorite,
  badgeText,
}) => {
  const [copiedField, setCopiedField] = useState<'hex' | 'rgb' | 'hsl' | null>(null);

  const handleCopy = async (
    e: React.MouseEvent,
    value: string,
    field: 'hex' | 'rgb' | 'hsl'
  ) => {
    e.stopPropagation();
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField((prev) => (prev === field ? null : prev));
      }, 1500);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(color.hex);
  };

  return (
    <div
      onClick={() => onSelectColor(color)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectColor(color);
        }
      }}
      aria-label={`Inspect ${color.name} (${color.hex})`}
      className="group bg-white border border-[#EEEEEE] rounded-xl overflow-hidden hover:border-[#171717]/40 transition-all cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-[#171717]"
    >
      {/* Top Color Swatch Area */}
      <div
        className="h-28 w-full p-3 flex flex-col justify-between relative transition-transform"
        style={{ backgroundColor: color.hex, color: color.textColor }}
      >
        {/* Top Row: Optional Badge + Actions */}
        <div className="flex items-center justify-between gap-1">
          {badgeText ? (
            <span
              className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md"
              style={{
                backgroundColor: color.isLight ? 'rgba(23,23,23,0.1)' : 'rgba(255,255,255,0.16)',
                color: color.textColor,
              }}
            >
              {badgeText}
            </span>
          ) : (
            <span
              className="text-[11px] font-mono font-medium opacity-85"
              style={{ color: color.textColor }}
            >
              {color.hex}
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleFavorite}
              title={isFavorite ? 'Remove color from Collection' : 'Save color to Collection'}
              aria-label={isFavorite ? 'Remove color from Collection' : 'Save color to Collection'}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: color.isLight ? 'rgba(23,23,23,0.08)' : 'rgba(255,255,255,0.14)',
                color: color.textColor,
              }}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <span
              title="Open Shade Explorer"
              className="p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: color.isLight ? 'rgba(23,23,23,0.08)' : 'rgba(255,255,255,0.14)',
                color: color.textColor,
              }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Bottom of Swatch: Color Name in Readable Contrast */}
        <div className="flex items-end justify-between">
          <span
            className="font-semibold text-sm tracking-tight truncate"
            style={{ color: color.textColor }}
          >
            {color.name}
          </span>
        </div>
      </div>

      {/* Always-Visible Color Codes Section Beneath Swatch */}
      <div className="p-3 bg-white space-y-1.5 text-xs">
        <div className="font-semibold text-[#171717] text-[13px] truncate pb-0.5 border-b border-[#EEEEEE]">
          {color.name}
        </div>

        {/* HEX Code Row */}
        <button
          type="button"
          onClick={(e) => handleCopy(e, color.hex, 'hex')}
          title="Click to copy HEX code"
          className="w-full flex items-center justify-between py-1 px-1.5 -mx-1.5 rounded-md hover:bg-[#F3F3F3] transition-colors text-left group/row"
        >
          <span className="font-mono font-medium text-[#171717] text-xs">{color.hex}</span>
          {copiedField === 'hex' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <Check className="w-3 h-3" />
              Copied!
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#737373] group-hover/row:text-[#171717] shrink-0" />
          )}
        </button>

        {/* RGB Code Row */}
        <button
          type="button"
          onClick={(e) => handleCopy(e, color.rgbString, 'rgb')}
          title="Click to copy RGB code"
          className="w-full flex items-center justify-between py-1 px-1.5 -mx-1.5 rounded-md hover:bg-[#F3F3F3] transition-colors text-left group/row"
        >
          <span className="font-mono text-[#737373] group-hover/row:text-[#171717] text-[11px] truncate">
            {color.rgbString}
          </span>
          {copiedField === 'rgb' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] shrink-0">
              <Check className="w-3 h-3" />
              Copied!
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#737373] group-hover/row:text-[#171717] shrink-0" />
          )}
        </button>

        {/* HSL Code Row */}
        <button
          type="button"
          onClick={(e) => handleCopy(e, color.hslString, 'hsl')}
          title="Click to copy HSL code"
          className="w-full flex items-center justify-between py-1 px-1.5 -mx-1.5 rounded-md hover:bg-[#F3F3F3] transition-colors text-left group/row"
        >
          <span className="font-mono text-[#737373] group-hover/row:text-[#171717] text-[11px] truncate">
            {color.hslString}
          </span>
          {copiedField === 'hsl' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] shrink-0">
              <Check className="w-3 h-3" />
              Copied!
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#737373] group-hover/row:text-[#171717] shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};
