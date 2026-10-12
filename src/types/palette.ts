export type PaletteCategory =
  | 'Pastel'
  | 'Vintage'
  | 'Retro'
  | 'Neon'
  | 'Gold'
  | 'Light'
  | 'Dark'
  | 'Warm'
  | 'Cold'
  | 'Summer'
  | 'Fall'
  | 'Winter'
  | 'Spring'
  | 'Monochrome'
  | 'Earth Tones'
  | 'Ocean'
  | 'Forest'
  | 'Sunset'
  | 'Minimal'
  | 'Vibrant'
  | 'Muted'
  | 'Jewel Tones'
  | 'Wedding'
  | 'Nature'
  | 'Luxury'
  | 'Corporate'
  | 'Gaming'
  | 'Social Media';

export type NavSection = 'new' | 'popular' | 'random' | 'collection' | 'category';

export interface Palette {
  id: string;
  name: string;
  colors: string[]; // Array of 5+ HEX strings
  categories: PaletteCategory[];
  likes: number;
  createdAt: string; // ISO date or sortable string
  isCustom?: boolean;
}

export type BrightnessFilter = 'all' | 'light' | 'dark';
export type TemperatureFilter = 'all' | 'warm' | 'cool';
export type SaturationFilter = 'all' | 'vibrant' | 'muted' | 'pastel';
export type SortOption = 'popular' | 'newest' | 'random';
export type ColorCountFilter = 'all' | 5 | 6;

export interface FilterState {
  category: PaletteCategory | 'All';
  colorCount: ColorCountFilter;
  brightness: BrightnessFilter;
  temperature: TemperatureFilter;
  saturation: SaturationFilter;
  sortBy: SortOption;
}
