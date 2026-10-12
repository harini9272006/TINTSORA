export interface RGB {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export interface ColorInfo {
  hex: string;       // e.g. "#FF7F50"
  name: string;      // e.g. "Coral"
  rgb: RGB;
  hsl: HSL;
  rgbString: string; // e.g. "RGB(255, 127, 80)"
  hslString: string; // e.g. "HSL(16°, 100%, 66%)"
  isLight: boolean;  // true if luminance suggests dark text (#171717)
  textColor: '#171717' | '#FFFFFF';
  category?: string;
}

export interface ShadeScaleStop {
  stop: number; // 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
  color: ColorInfo;
  isBaseMatch?: boolean;
}

export interface ColorHarmonyGroup {
  id: string;
  title: string;
  description: string;
  colors: ColorInfo[];
}

export interface ColorSearchResult {
  query: string;
  isValid: boolean;
  errorMessage?: string;
  exactMatch?: ColorInfo;
  lighterVariations: ColorInfo[];
  darkerVariations: ColorInfo[];
  saturatedVariations: ColorInfo[];
  desaturatedVariations: ColorInfo[];
  closelyRelatedShades: ColorInfo[];
  complementary: ColorInfo[];
  analogous: ColorInfo[];
  triadic: ColorInfo[];
  tetradic: ColorInfo[];
  monochromaticPalettes: ColorInfo[][];
  allRelatedShades: ColorInfo[]; // 60+ shades for full browsing & pagination
  shadeScale: ShadeScaleStop[];
}
