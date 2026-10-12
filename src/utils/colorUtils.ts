import { NAMED_COLORS } from '../data/colorNames';
import { ColorInfo, ColorSearchResult, HSL, RGB, ShadeScaleStop } from '../types/color';

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Normalize a 3-digit or 6-digit hex string to uppercase #RRGGBB
 */
export function normalizeHex(input: string): string | null {
  const cleaned = input.trim().replace(/^#/, '');
  if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
    const r = cleaned[0] + cleaned[0];
    const g = cleaned[1] + cleaned[1];
    const b = cleaned[2] + cleaned[2];
    return `#${(r + g + b).toUpperCase()}`;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return null;
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): RGB {
  const norm = normalizeHex(hex) || '#000000';
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Convert RGB to uppercase HEX (#RRGGBB)
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const hNorm = (((h % 360) + 360) % 360) / 360;
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b };
}

/**
 * Convert HSL directly to HEX
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Calculate relative luminance for WCAG contrast
 */
export function getRelativeLuminance({ r, g, b }: RGB): number {
  const transform = (v: number) => {
    const sRGB = v / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  const R = transform(r);
  const G = transform(g);
  const B = transform(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Determine whether a color is light (requiring dark text #171717) or dark (requiring white text #FFFFFF)
 */
export function isLightColor(rgb: RGB): boolean {
  const luminance = getRelativeLuminance(rgb);
  return luminance > 0.34;
}

/**
 * Calculate WCAG contrast ratio between two HEX colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

// Pre-compute RGB values for NAMED_COLORS for fast lookup
const NAMED_COLORS_WITH_RGB = NAMED_COLORS.map((entry) => ({
  ...entry,
  hex: normalizeHex(entry.hex) || entry.hex.toUpperCase(),
  rgb: hexToRgb(entry.hex),
  hsl: rgbToHsl(hexToRgb(entry.hex)),
}));

/**
 * Find the closest human-readable color name for any HEX code
 */
export function getClosestColorName(hex: string): string {
  const norm = normalizeHex(hex);
  if (!norm) return 'Custom Shade';

  const targetRgb = hexToRgb(norm);
  const targetHsl = rgbToHsl(targetRgb);

  let bestName = 'Custom Shade';
  let minDistance = Infinity;

  for (const item of NAMED_COLORS_WITH_RGB) {
    if (item.hex === norm) {
      return item.name.trim();
    }
    // Redmean weighted perceptual RGB distance
    const rmean = (targetRgb.r + item.rgb.r) / 2;
    const dr = targetRgb.r - item.rgb.r;
    const dg = targetRgb.g - item.rgb.g;
    const db = targetRgb.b - item.rgb.b;
    const dist = Math.sqrt(
      (2 + rmean / 256) * dr * dr +
        4 * dg * dg +
        (2 + (255 - rmean) / 256) * db * db
    );

    if (dist < minDistance) {
      minDistance = dist;
      bestName = item.name.trim();
    }
  }

  // If the distance is somewhat large, add a helpful lightness/saturation qualifier if not already present
  if (minDistance > 45) {
    const lower = bestName.toLowerCase();
    if (targetHsl.l >= 86 && !lower.includes('light') && !lower.includes('pale') && !lower.includes('mist') && !lower.includes('white')) {
      return `Pale ${bestName}`;
    }
    if (targetHsl.l <= 20 && !lower.includes('dark') && !lower.includes('deep') && !lower.includes('midnight') && !lower.includes('black')) {
      return `Deep ${bestName}`;
    }
    if (targetHsl.s <= 25 && targetHsl.l > 25 && targetHsl.l < 80 && !lower.includes('muted') && !lower.includes('gray') && !lower.includes('slate')) {
      return `Muted ${bestName}`;
    }
  }

  return bestName;
}

/**
 * Create a complete ColorInfo object from a HEX string
 */
export function createColorInfo(hex: string, customName?: string, category?: string): ColorInfo {
  const norm = normalizeHex(hex) || '#000000';
  const rgb = hexToRgb(norm);
  const hsl = rgbToHsl(rgb);
  const light = isLightColor(rgb);

  return {
    hex: norm,
    name: customName || getClosestColorName(norm),
    rgb,
    hsl,
    rgbString: `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hslString: `HSL(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`,
    isLight: light,
    textColor: light ? '#171717' : '#FFFFFF',
    category,
  };
}

/**
 * Parse a user search query (Name, HEX, RGB, or HSL) into a base ColorInfo
 */
export function parseColorQuery(rawQuery: string): { color: ColorInfo | null; matchedKeyword?: string } {
  const q = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return { color: null };

  // 1. Check direct HEX code (#FF5733, FF5733, #F53)
  const hexCandidate = q.replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hexCandidate) || /^[0-9a-f]{6}$/i.test(hexCandidate)) {
    // Make sure 3-letter words that happen to be hex characters like "bed", "red", "ace" are checked against color names first!
    const exactNamedWord = NAMED_COLORS_WITH_RGB.find(
      (c) => c.name.trim().toLowerCase() === q || c.aliases?.some((a) => a.toLowerCase() === q)
    );
    if (exactNamedWord && !rawQuery.trim().startsWith('#')) {
      return {
        color: createColorInfo(exactNamedWord.hex, exactNamedWord.name.trim()),
        matchedKeyword: exactNamedWord.name.trim(),
      };
    }

    const norm = normalizeHex(hexCandidate);
    if (norm) {
      return { color: createColorInfo(norm) };
    }
  }

  // 2. Check RGB format: rgb(255, 127, 80) or "255, 127, 80"
  const rgbMatch = q.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*\)?$/i);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      const hex = rgbToHex({ r, g, b });
      return { color: createColorInfo(hex) };
    }
  }

  // 3. Check HSL format: hsl(16, 100%, 66%) or hsl(16°, 100%, 66%)
  const hslMatch = q.match(
    /^(?:hsl\s*\(\s*)?(\d{1,3})(?:°|deg)?\s*[, ]\s*(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?\s*\)?$/i
  );
  if (hslMatch && q.includes('%') || q.startsWith('hsl')) {
    if (hslMatch) {
      const h = Number(hslMatch[1]);
      const s = Number(hslMatch[2]);
      const l = Number(hslMatch[3]);
      if (h <= 360 && s <= 100 && l <= 100) {
        const hex = hslToHex({ h, s, l });
        return { color: createColorInfo(hex) };
      }
    }
  }

  // 4. Exact match in NAMED_COLORS (by name or alias)
  const exactNameMatch = NAMED_COLORS_WITH_RGB.find(
    (c) =>
      c.name.trim().toLowerCase() === q ||
      c.aliases?.some((a) => a.trim().toLowerCase() === q)
  );
  if (exactNameMatch) {
    return {
      color: createColorInfo(exactNameMatch.hex, exactNameMatch.name.trim()),
      matchedKeyword: exactNameMatch.name.trim(),
    };
  }

  // 5. Partial / substring match in NAMED_COLORS (prioritize word boundary match)
  const wordBoundaryMatch = NAMED_COLORS_WITH_RGB.find((c) => {
    const words = c.name.trim().toLowerCase().split(/\s+/);
    return words.includes(q) || c.aliases?.some((a) => a.toLowerCase().split(/\s+/).includes(q));
  });
  if (wordBoundaryMatch) {
    return {
      color: createColorInfo(wordBoundaryMatch.hex, wordBoundaryMatch.name.trim()),
      matchedKeyword: wordBoundaryMatch.name.trim(),
    };
  }

  const substringMatch = NAMED_COLORS_WITH_RGB.find(
    (c) =>
      c.name.trim().toLowerCase().includes(q) ||
      c.aliases?.some((a) => a.toLowerCase().includes(q))
  );
  if (substringMatch) {
    return {
      color: createColorInfo(substringMatch.hex, substringMatch.name.trim()),
      matchedKeyword: substringMatch.name.trim(),
    };
  }

  return { color: null };
}

/**
 * Generate a design-system 50 to 950 shade scale from a base HEX color
 */
export function generateShadeScale(hex: string): ShadeScaleStop[] {
  const baseInfo = createColorInfo(hex);
  const { h, s, l } = baseInfo.hsl;

  const stops: { stop: number; targetL: number; satFactor: number }[] = [
    { stop: 50, targetL: 96, satFactor: 0.75 },
    { stop: 100, targetL: 91, satFactor: 0.85 },
    { stop: 200, targetL: 83, satFactor: 0.92 },
    { stop: 300, targetL: 73, satFactor: 0.96 },
    { stop: 400, targetL: 62, satFactor: 1.0 },
    { stop: 500, targetL: 51, satFactor: 1.0 },
    { stop: 600, targetL: 42, satFactor: 0.98 },
    { stop: 700, targetL: 33, satFactor: 0.94 },
    { stop: 800, targetL: 24, satFactor: 0.9 },
    { stop: 900, targetL: 16, satFactor: 0.86 },
    { stop: 950, targetL: 10, satFactor: 0.82 },
  ];

  // Find which stop is closest in lightness to the input color
  let closestStop = 500;
  let minDiff = Infinity;
  for (const item of stops) {
    const diff = Math.abs(item.targetL - l);
    if (diff < minDiff) {
      minDiff = diff;
      closestStop = item.stop;
    }
  }

  return stops.map((item) => {
    if (item.stop === closestStop) {
      return {
        stop: item.stop,
        color: baseInfo,
        isBaseMatch: true,
      };
    }
    const newS = s === 0 ? 0 : clamp(Math.round(s * item.satFactor), 5, 100);
    const stopHex = hslToHex({ h, s: newS, l: item.targetL });
    return {
      stop: item.stop,
      color: createColorInfo(stopHex, `${baseInfo.name} ${item.stop}`),
      isBaseMatch: false,
    };
  });
}

/**
 * Helper to deduplicate ColorInfo array by HEX while keeping order
 */
function uniqueColors(colors: ColorInfo[]): ColorInfo[] {
  const seen = new Set<string>();
  const result: ColorInfo[] = [];
  for (const c of colors) {
    if (!seen.has(c.hex)) {
      seen.add(c.hex);
      result.push(c);
    }
  }
  return result;
}

/**
 * Generate comprehensive color search results (10 harmony/variation categories + 60+ related shades)
 */
export function searchColorsByQuery(rawQuery: string): ColorSearchResult {
  const trimmed = rawQuery.trim();
  const parsed = parseColorQuery(trimmed);

  if (!parsed.color) {
    return {
      query: trimmed,
      isValid: false,
      errorMessage: `We couldn't recognize "${trimmed}" as a color name, HEX, RGB, or HSL value. Try searching names like "Coral", "Lavender", "Teal", "Crimson", or codes like "#FF7F50", "rgb(99, 102, 241)", or "hsl(16, 100%, 66%)".`,
      lighterVariations: [],
      darkerVariations: [],
      saturatedVariations: [],
      desaturatedVariations: [],
      closelyRelatedShades: [],
      complementary: [],
      analogous: [],
      triadic: [],
      tetradic: [],
      monochromaticPalettes: [],
      allRelatedShades: [],
      shadeScale: [],
    };
  }

  const base = parsed.color;
  const { h, s, l } = base.hsl;

  // 2. Lighter Variations (8 steps from slightly lighter up to soft tint)
  const lighterVariations: ColorInfo[] = [];
  for (let i = 1; i <= 8; i++) {
    const newL = clamp(Math.round(l + ((95 - l) * i) / 8.5), l + 2, 97);
    const newS = s === 0 ? 0 : clamp(Math.round(s - i * 2), 15, 100);
    const hex = hslToHex({ h, s: newS, l: newL });
    lighterVariations.push(createColorInfo(hex, undefined, 'Lighter Variation'));
  }

  // 3. Darker Variations (8 steps from slightly darker down to deep shade)
  const darkerVariations: ColorInfo[] = [];
  for (let i = 1; i <= 8; i++) {
    const newL = clamp(Math.round(l - ((l - 8) * i) / 8.5), 6, Math.max(7, l - 2));
    const newS = s === 0 ? 0 : clamp(Math.round(s - i * 1.5), 15, 100);
    const hex = hslToHex({ h, s: newS, l: newL });
    darkerVariations.push(createColorInfo(hex, undefined, 'Darker Variation'));
  }

  // 4a. Saturated Variations (6 steps)
  const saturatedVariations: ColorInfo[] = [];
  const satTargets = [100, 92, 85, 78, 70, 62];
  satTargets.forEach((targetS, idx) => {
    const adjL = clamp(l + (idx % 2 === 0 ? 4 : -4), 18, 84);
    const hex = hslToHex({ h: (h + (idx - 2) * 2 + 360) % 360, s: targetS, l: adjL });
    saturatedVariations.push(createColorInfo(hex, undefined, 'Saturated'));
  });

  // 4b. Desaturated / Muted Variations (6 steps)
  const desaturatedVariations: ColorInfo[] = [];
  const desatTargets = [50, 40, 32, 24, 16, 8];
  desatTargets.forEach((targetS, idx) => {
    const adjL = clamp(l + (idx % 2 === 0 ? -3 : 5), 20, 85);
    const hex = hslToHex({ h, s: targetS, l: adjL });
    desaturatedVariations.push(createColorInfo(hex, undefined, 'Desaturated'));
  });

  // 5. Closely Related Shades (Named dictionary matches + micro-hue neighbors)
  const closelyRelatedShades: ColorInfo[] = [];
  // First include any named colors whose name contains the query or is close in hue
  const qLower = trimmed.toLowerCase();
  for (const entry of NAMED_COLORS_WITH_RGB) {
    if (
      entry.name.toLowerCase().includes(qLower) ||
      entry.aliases?.some((a) => a.toLowerCase().includes(qLower))
    ) {
      closelyRelatedShades.push(createColorInfo(entry.hex, entry.name.trim(), 'Related Shade'));
    }
  }
  // Also add neighboring hue/lightness variations around the base color
  const hueOffsets = [-18, -14, -10, -6, -3, 3, 6, 10, 14, 18, -12, 12];
  hueOffsets.forEach((offset, i) => {
    const neighborH = (h + offset + 360) % 360;
    const neighborS = clamp(s + ((i % 3) - 1) * 8, 25, 100);
    const neighborL = clamp(l + ((i % 4) - 1.5) * 7, 18, 86);
    const hex = hslToHex({ h: neighborH, s: neighborS, l: neighborL });
    closelyRelatedShades.push(createColorInfo(hex, undefined, 'Related Shade'));
  });

  // 6. Complementary Colors (180° opposite hue + split-complementary & tonal steps)
  const compHue = (h + 180) % 360;
  const complementary: ColorInfo[] = [
    createColorInfo(hslToHex({ h: compHue, s: clamp(s, 35, 100), l }), undefined, 'Complementary'),
    createColorInfo(hslToHex({ h: compHue, s: clamp(s, 35, 95), l: clamp(l + 18, 25, 88) }), undefined, 'Complementary Tint'),
    createColorInfo(hslToHex({ h: compHue, s: clamp(s, 35, 95), l: clamp(l - 18, 14, 75) }), undefined, 'Complementary Shade'),
    createColorInfo(hslToHex({ h: (compHue - 15 + 360) % 360, s: clamp(s, 35, 95), l }), undefined, 'Split Complementary'),
    createColorInfo(hslToHex({ h: (compHue + 15) % 360, s: clamp(s, 35, 95), l }), undefined, 'Split Complementary'),
    createColorInfo(hslToHex({ h: compHue, s: clamp(s - 25, 20, 80), l: clamp(l + 8, 20, 85) }), undefined, 'Complementary Muted'),
  ];

  // 7. Analogous Colors (-45°, -30°, -15°, +15°, +30°, +45°)
  const analogousAngles = [-45, -30, -20, -10, 10, 20, 30, 45];
  const analogous: ColorInfo[] = analogousAngles.map((angle) => {
    const anaH = (h + angle + 360) % 360;
    const hex = hslToHex({ h: anaH, s: clamp(s, 30, 96), l });
    return createColorInfo(hex, undefined, 'Analogous');
  });

  // 8. Triadic Colors (+120° and +240° with tonal pairings)
  const triad1 = (h + 120) % 360;
  const triad2 = (h + 240) % 360;
  const triadic: ColorInfo[] = [
    base,
    createColorInfo(hslToHex({ h: triad1, s: clamp(s, 35, 95), l }), undefined, 'Triadic Primary'),
    createColorInfo(hslToHex({ h: triad2, s: clamp(s, 35, 95), l }), undefined, 'Triadic Secondary'),
    createColorInfo(hslToHex({ h: triad1, s: clamp(s - 10, 25, 90), l: clamp(l + 16, 25, 88) }), undefined, 'Triadic Light'),
    createColorInfo(hslToHex({ h: triad2, s: clamp(s - 10, 25, 90), l: clamp(l + 16, 25, 88) }), undefined, 'Triadic Light'),
    createColorInfo(hslToHex({ h: triad1, s: clamp(s, 30, 90), l: clamp(l - 16, 15, 75) }), undefined, 'Triadic Deep'),
  ];

  // 9. Tetradic Color Combinations (+90°, +180°, +270° rectangular & square harmonies)
  const tetradicAngles = [0, 60, 90, 180, 240, 270];
  const tetradic: ColorInfo[] = tetradicAngles.map((angle, i) => {
    const tetH = (h + angle) % 360;
    const tetL = i >= 4 ? clamp(l + 10, 25, 85) : l;
    return createColorInfo(hslToHex({ h: tetH, s: clamp(s, 35, 95), l: tetL }), undefined, 'Tetradic');
  });

  // 10. Monochromatic Palettes (4 curated 5-color palettes built from the searched color)
  const monochromaticPalettes: ColorInfo[][] = [
    // Classic Light-to-Dark Monochromatic
    [88, 72, 54, 38, 22].map((lightness) =>
      createColorInfo(hslToHex({ h, s: clamp(s, 20, 95), l: lightness }))
    ),
    // Soft Pastel & Tint Monochromatic
    [94, 86, 76, 65, 52].map((lightness, idx) =>
      createColorInfo(hslToHex({ h, s: clamp(s - idx * 4, 25, 85), l: lightness }))
    ),
    // Deep Editorial Monochromatic
    [58, 45, 34, 23, 13].map((lightness, idx) =>
      createColorInfo(hslToHex({ h, s: clamp(s - idx * 3, 25, 92), l: lightness }))
    ),
    // Muted & Modern Tonal Monochromatic
    [85, 68, 50, 35, 18].map((lightness, idx) =>
      createColorInfo(hslToHex({ h, s: clamp(Math.round(s * 0.55) + idx * 4, 14, 65), l: lightness }))
    ),
  ];

  // Build 60+ distinct related shades for the comprehensive "All Related Shades" grid
  const extraMatrixShades: ColorInfo[] = [];
  const hueSteps = [-28, -20, -12, -6, 0, 6, 12, 20, 28];
  const lightnessSteps = [90, 78, 66, 54, 42, 30, 18];

  for (const dH of hueSteps) {
    for (const targetL of lightnessSteps) {
      const mH = (h + dH + 360) % 360;
      const mS = s === 0 ? 0 : clamp(s + (dH % 2 === 0 ? -5 : 5), 22, 98);
      const hex = hslToHex({ h: mH, s: mS, l: targetL });
      extraMatrixShades.push(createColorInfo(hex, undefined, 'Shade Matrix'));
    }
  }

  const allRelatedShades = uniqueColors([
    base,
    ...closelyRelatedShades,
    ...lighterVariations,
    ...darkerVariations,
    ...saturatedVariations,
    ...desaturatedVariations,
    ...analogous,
    ...complementary,
    ...triadic,
    ...tetradic,
    ...extraMatrixShades,
  ]);

  const shadeScale = generateShadeScale(base.hex);

  return {
    query: trimmed,
    isValid: true,
    exactMatch: base,
    lighterVariations: uniqueColors(lighterVariations),
    darkerVariations: uniqueColors(darkerVariations),
    saturatedVariations: uniqueColors(saturatedVariations),
    desaturatedVariations: uniqueColors(desaturatedVariations),
    closelyRelatedShades: uniqueColors(closelyRelatedShades).slice(0, 12),
    complementary: uniqueColors(complementary),
    analogous: uniqueColors(analogous),
    triadic: uniqueColors(triadic),
    tetradic: uniqueColors(tetradic),
    monochromaticPalettes,
    allRelatedShades,
    shadeScale,
  };
}
