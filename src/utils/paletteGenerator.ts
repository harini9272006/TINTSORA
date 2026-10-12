import { Palette, PaletteCategory } from '../types/palette';
import { clamp, createColorInfo, hexToRgb, hslToHex, rgbToHsl } from './colorUtils';

const ADJECTIVES = [
  'Nordic', 'Velvet', 'Solar', 'Coastal', 'Botanical', 'Serene', 'Electric',
  'Vintage', 'Golden', 'Misty', 'ethereal', 'Alpine', 'Kyoto', 'Desert',
  'Midnight', 'Luminous', 'Prism', 'Artisan', 'Horizon', 'Obsidian',
  'Pastel', 'Terracotta', 'Cerulean', 'Emerald', 'Saffron', 'Alabaster',
];

const NOUNS = [
  'Breeze', 'Studio', 'Mirage', 'Canopy', 'Harbor', 'Solstice', 'Reverie',
  'Atelier', 'Lagoon', 'Dusk', 'Meadow', 'Pulse', 'Symphony', 'Sanctuary',
  'Cascade', 'Ember', 'Horizon', 'Canvas', 'Glacier', 'Archive', 'Bloom',
];

/**
 * Determine average HSL metrics of a palette for smart filtering
 */
export function getPaletteMetrics(colors: string[]) {
  const hslList = colors.map((hex) => rgbToHsl(hexToRgb(hex)));
  const avgL = hslList.reduce((acc, c) => acc + c.l, 0) / hslList.length;
  const avgS = hslList.reduce((acc, c) => acc + c.s, 0) / hslList.length;

  // Count warm hues (0..75 or 300..360) vs cool hues (76..299)
  let warmCount = 0;
  let coolCount = 0;
  for (const c of hslList) {
    if (c.s < 10) continue; // neutral
    if ((c.h >= 0 && c.h <= 75) || c.h >= 305) {
      warmCount++;
    } else {
      coolCount++;
    }
  }

  return {
    avgL,
    avgS,
    isLight: avgL >= 58,
    isDark: avgL < 46,
    isWarm: warmCount >= coolCount,
    isCool: coolCount > warmCount,
    isPastel: avgL >= 72 && avgS <= 75,
    isVibrant: avgS >= 68 && avgL >= 35 && avgL <= 72,
    isMuted: avgS < 48,
  };
}

/**
 * Generate a genuinely harmonious random palette (5 or 6 colors)
 */
export function generateHarmoniousPalette(
  seedCategory?: PaletteCategory,
  colorCount: number = 5
): Palette {
  const baseHue = Math.floor(Math.random() * 360);
  const harmonyTypes = [
    'analogous',
    'complementary',
    'split-complementary',
    'triadic',
    'monochromatic',
    'pastel',
    'earth',
    'luxury',
  ] as const;

  let mode = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];
  if (seedCategory === 'Pastel' || seedCategory === 'Wedding' || seedCategory === 'Spring') {
    mode = 'pastel';
  } else if (seedCategory === 'Monochrome' || seedCategory === 'Minimal') {
    mode = 'monochromatic';
  } else if (seedCategory === 'Earth Tones' || seedCategory === 'Fall' || seedCategory === 'Vintage') {
    mode = 'earth';
  } else if (seedCategory === 'Luxury' || seedCategory === 'Gold' || seedCategory === 'Dark') {
    mode = 'luxury';
  } else if (seedCategory === 'Neon' || seedCategory === 'Vibrant' || seedCategory === 'Gaming') {
    mode = 'triadic';
  }

  const colors: string[] = [];
  const categories = new Set<PaletteCategory>();
  if (seedCategory) categories.add(seedCategory);

  for (let i = 0; i < colorCount; i++) {
    const t = i / (colorCount - 1); // 0 to 1
    let h = baseHue;
    let s = 70;
    let l = 50;

    switch (mode) {
      case 'analogous':
        h = (baseHue + i * 18 - 30 + 360) % 360;
        s = clamp(65 + Math.sin(i) * 18, 45, 92);
        l = clamp(24 + t * 62, 20, 88);
        categories.add('Vibrant');
        break;
      case 'complementary':
        h = i < Math.ceil(colorCount / 2) ? baseHue : (baseHue + 180) % 360;
        s = clamp(72 - (i % 2) * 15, 40, 95);
        l = clamp(22 + t * 64, 18, 88);
        categories.add('Vibrant');
        break;
      case 'split-complementary':
        if (i === 0) h = baseHue;
        else if (i === 1) h = (baseHue + 15) % 360;
        else if (i === 2) h = (baseHue + 150) % 360;
        else if (i === 3) h = (baseHue + 210) % 360;
        else h = (baseHue + 195) % 360;
        s = clamp(62 + (i % 3) * 10, 42, 90);
        l = clamp(26 + t * 58, 22, 86);
        break;
      case 'triadic':
        h = (baseHue + (i % 3) * 120) % 360;
        s = clamp(82 - i * 4, 65, 98);
        l = clamp(32 + t * 48, 28, 82);
        categories.add('Vibrant');
        categories.add('Neon');
        break;
      case 'monochromatic':
        h = baseHue;
        s = clamp(45 - i * 3, 20, 65);
        l = clamp(16 + t * 74, 14, 92);
        categories.add('Monochrome');
        categories.add('Minimal');
        break;
      case 'pastel':
        h = (baseHue + i * 32) % 360;
        s = clamp(58 + (i % 2) * 12, 45, 78);
        l = clamp(78 + (i % 3) * 5, 75, 90);
        categories.add('Pastel');
        categories.add('Light');
        break;
      case 'earth': {
        const earthHues = [18, 28, 38, 46, 85, 135];
        h = earthHues[i % earthHues.length];
        s = clamp(32 + (i % 3) * 12, 24, 58);
        l = clamp(24 + t * 58, 22, 84);
        categories.add('Earth Tones');
        categories.add('Warm');
        categories.add('Muted');
        break;
      }
      case 'luxury': {
        const luxHues = [baseHue, baseHue, 42, 45, (baseHue + 180) % 360];
        h = luxHues[i % luxHues.length];
        s = i === 2 || i === 3 ? 68 : 35;
        l = clamp(12 + t * 72, 10, 88);
        categories.add('Luxury');
        categories.add('Gold');
        break;
      }
    }

    colors.push(hslToHex({ h, s, l }));
  }

  const metrics = getPaletteMetrics(colors);
  if (metrics.isWarm) categories.add('Warm');
  if (metrics.isCool) categories.add('Cold');
  if (metrics.isLight) categories.add('Light');
  if (metrics.isDark) categories.add('Dark');

  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const capAdj = adj.charAt(0).toUpperCase() + adj.slice(1);

  return {
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${capAdj} ${noun}`,
    colors,
    categories: Array.from(categories).slice(0, 4) as PaletteCategory[],
    likes: Math.floor(120 + Math.random() * 850),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Remix an existing palette by shifting hue/lightness slightly while preserving its character
 */
export function remixPalette(palette: Palette): Palette {
  const hueShift = (Math.floor(Math.random() * 50) + 15) * (Math.random() > 0.5 ? 1 : -1);
  const newColors = palette.colors.map((hex) => {
    const hsl = rgbToHsl(hexToRgb(hex));
    const newH = (hsl.h + hueShift + 360) % 360;
    const newS = clamp(hsl.s + Math.floor(Math.random() * 11) - 5, 10, 98);
    const newL = clamp(hsl.l + Math.floor(Math.random() * 9) - 4, 8, 94);
    return hslToHex({ h: newH, s: newS, l: newL });
  });

  return {
    ...palette,
    id: `remix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${palette.name} Remix`,
    colors: newColors,
  };
}

/**
 * Generate 4 curated matching palettes anchored around a specific HEX color (for ShadeExplorer)
 */
export function generateMatchingPalettesForColor(hex: string): Palette[] {
  const base = createColorInfo(hex);
  const { h, s, l } = base.hsl;

  return [
    {
      id: `match-ana-${base.hex}`,
      name: `${base.name} Analogous Harmony`,
      colors: [
        hslToHex({ h: (h - 30 + 360) % 360, s: clamp(s, 35, 90), l: clamp(l - 12, 18, 78) }),
        hslToHex({ h: (h - 15 + 360) % 360, s: clamp(s, 35, 92), l: clamp(l - 4, 22, 84) }),
        base.hex,
        hslToHex({ h: (h + 15) % 360, s: clamp(s, 35, 92), l: clamp(l + 8, 28, 88) }),
        hslToHex({ h: (h + 30) % 360, s: clamp(s - 10, 25, 85), l: clamp(l + 20, 35, 92) }),
      ],
      categories: ['Vibrant', 'Nature'],
      likes: 640,
      createdAt: '2026-09-15',
    },
    {
      id: `match-comp-${base.hex}`,
      name: `${base.name} Complementary Contrast`,
      colors: [
        hslToHex({ h, s: clamp(s, 30, 90), l: clamp(l - 22, 12, 45) }),
        base.hex,
        hslToHex({ h, s: clamp(s - 30, 15, 65), l: 90 }),
        hslToHex({ h: (h + 180) % 360, s: clamp(s, 35, 90), l: clamp(l + 6, 35, 78) }),
        hslToHex({ h: (h + 180) % 360, s: clamp(s, 35, 88), l: clamp(l - 18, 16, 55) }),
      ],
      categories: ['Minimal', 'Corporate'],
      likes: 520,
      createdAt: '2026-09-12',
    },
    {
      id: `match-mono-${base.hex}`,
      name: `${base.name} Tonal Scale`,
      colors: [
        hslToHex({ h, s: clamp(s - 10, 15, 85), l: 92 }),
        hslToHex({ h, s: clamp(s - 5, 20, 90), l: 74 }),
        base.hex,
        hslToHex({ h, s: clamp(s, 25, 95), l: 36 }),
        hslToHex({ h, s: clamp(s, 25, 90), l: 18 }),
      ],
      categories: ['Monochrome', 'Minimal'],
      likes: 785,
      createdAt: '2026-09-10',
    },
    {
      id: `match-edit-${base.hex}`,
      name: `${base.name} Editorial Mix`,
      colors: [
        '#18181B',
        base.hex,
        hslToHex({ h: (h + 145) % 360, s: clamp(s - 15, 25, 75), l: 62 }),
        hslToHex({ h: 38, s: 45, l: 84 }),
        '#F4F4F5',
      ],
      categories: ['Luxury', 'Minimal'],
      likes: 890,
      createdAt: '2026-09-08',
    },
  ];
}
