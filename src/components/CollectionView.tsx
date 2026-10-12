import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Edit3,
  Check,
  Copy,
  Code2,
  Sparkles,
  ArrowLeft,
  Palette as PaletteIcon,
  Droplet,
} from 'lucide-react';
import { Palette } from '../types/palette';
import { ColorInfo } from '../types/color';
import { createColorInfo } from '../utils/colorUtils';
import { ColorSwatch } from './ColorSwatch';
import { copyToClipboard } from '../utils/clipboard';

interface CollectionViewProps {
  savedPalettes: Palette[];
  favoriteColorHexes: string[];
  onRenameSavedPalette: (paletteId: string, newName: string) => void;
  onRemoveSavedPalette: (paletteId: string) => void;
  onToggleFavoriteColor: (hex: string) => void;
  onOpenPaletteDetails: (palette: Palette) => void;
  onInspectColor: (color: ColorInfo) => void;
  onExplorePalettes: () => void;
  onTriggerRandom: () => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  savedPalettes,
  favoriteColorHexes,
  onRenameSavedPalette,
  onRemoveSavedPalette,
  onToggleFavoriteColor,
  onOpenPaletteDetails,
  onInspectColor,
  onExplorePalettes,
  onTriggerRandom,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const favoriteColorInfos = favoriteColorHexes.map((hex) => createColorInfo(hex));
  const isEmpty = savedPalettes.length === 0 && favoriteColorInfos.length === 0;

  const startEditing = (palette: Palette) => {
    setEditingId(palette.id);
    setDraftName(palette.name);
  };

  const commitRename = (paletteId: string) => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onRenameSavedPalette(paletteId, trimmed);
    }
    setEditingId(null);
  };

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1500);
    }
  };

  if (isEmpty) {
    return (
      <div className="bg-white border border-[#EEEEEE] rounded-2xl p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-[#F3F3F3] flex items-center justify-center mx-auto mb-4 text-[#171717]">
          <Bookmark className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#171717]">
          Your Collection is Empty
        </h2>
        <p className="mt-2 text-sm text-[#737373] leading-relaxed">
          Save your favorite palettes or individual color swatches while exploring Tintsora. Everything is persisted locally in your browser so your collection is always ready.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onExplorePalettes}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#171717]/90 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Curated Palettes</span>
          </button>
          <button
            type="button"
            onClick={onTriggerRandom}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#EEEEEE] text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Random Palette</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EEEEEE]">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">
            Your Saved Collection
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            {savedPalettes.length} saved {savedPalettes.length === 1 ? 'palette' : 'palettes'} •{' '}
            {favoriteColorInfos.length} favorite{' '}
            {favoriteColorInfos.length === 1 ? 'color' : 'colors'} (stored in localStorage)
          </p>
        </div>

        <button
          type="button"
          onClick={onExplorePalettes}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Palettes</span>
        </button>
      </div>

      {/* Saved Palettes Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <PaletteIcon className="w-4 h-4 text-[#171717]" />
          <h3 className="text-base font-bold text-[#171717]">
            Saved Palettes ({savedPalettes.length})
          </h3>
        </div>

        {savedPalettes.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#EEEEEE] text-center text-xs text-[#737373]">
            You haven&apos;t saved any complete palettes yet. Click the heart button on any palette card to save and give it a custom name here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedPalettes.map((palette) => {
              const infos = palette.colors.map((hex) => createColorInfo(hex));
              const isEditing = editingId === palette.id;

              return (
                <article
                  key={palette.id}
                  className="bg-white border border-[#EEEEEE] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  {/* Swatches Bar */}
                  <div className="h-36 rounded-xl overflow-hidden flex border border-[#EEEEEE]">
                    {infos.map((c, idx) => (
                      <div
                        key={`${palette.id}-${idx}-${c.hex}`}
                        onClick={() => onInspectColor(c)}
                        style={{ backgroundColor: c.hex, color: c.textColor }}
                        className="flex-1 p-2 flex flex-col justify-end cursor-pointer hover:flex-[1.3] transition-all"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(c.hex, `${palette.id}-${c.hex}`);
                          }}
                          className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-semibold w-fit"
                          style={{
                            backgroundColor: c.isLight
                              ? 'rgba(255,255,255,0.75)'
                              : 'rgba(23,23,23,0.58)',
                            color: c.isLight ? '#171717' : '#FFFFFF',
                          }}
                        >
                          {copiedKey === `${palette.id}-${c.hex}` ? 'Copied!' : c.hex}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Custom Editable Palette Name */}
                  <div className="flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename(palette.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          aria-label="Custom palette name"
                          className="flex-1 px-2.5 py-1 text-xs font-semibold border border-[#171717] rounded-lg focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => commitRename(palette.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#171717] text-white cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-[#171717] truncate">
                          {palette.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => startEditing(palette)}
                          title="Give this saved palette a custom name"
                          aria-label={`Rename ${palette.name}`}
                          className="p-1 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveSavedPalette(palette.id)}
                      title="Remove palette from Collection"
                      aria-label={`Remove ${palette.name} from Collection`}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-[#EF4444] hover:bg-[#F3F3F3] transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2 border-t border-[#EEEEEE] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(palette.colors.join(', '), `col-all-${palette.id}`)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                    >
                      {copiedKey === `col-all-${palette.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          <span className="text-[#10B981] font-semibold">Copied All!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#737373]" />
                          <span>Copy All HEX</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPaletteDetails(palette)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#EEEEEE] hover:bg-[#F3F3F3] text-[#171717] transition-colors cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Export CSS / JSON</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Favorite Individual Colors Section */}
      <section className="space-y-4 pt-4 border-t border-[#EEEEEE]">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-[#171717]" />
          <h3 className="text-base font-bold text-[#171717]">
            Favorite Individual Colors ({favoriteColorInfos.length})
          </h3>
        </div>

        {favoriteColorInfos.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#EEEEEE] text-center text-xs text-[#737373]">
            You haven&apos;t saved any individual colors yet. Click the heart icon on any color swatch or inside the Shade Explorer to save it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {favoriteColorInfos.map((c) => (
              <ColorSwatch
                key={c.hex}
                color={c}
                onSelectColor={onInspectColor}
                isFavorite={true}
                onToggleFavorite={onToggleFavoriteColor}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
