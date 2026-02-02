import type { EventStyle, TentStyle } from './types';

export const SQUARE_FEET_PER_PERSON: Record<EventStyle, number> = {
  ceremony_only: 8,
  reception_seated: 15,
  reception_buffet: 15,
  cocktail: 10,
  ceremony_and_reception: 15,
  corporate: 12,
};

export const SQ_FT_PER_DANCER: Record<string, number> = {
  light: 5,
  moderate: 4.5,
  heavy: 4,
};

export const ELEMENT_SQUARE_FOOTAGE = {
  barStation: 125,
  buffetStation: 150,
  dj: 100,
  smallBand: 200,
  largeBand: 350,
  photoBooth: 80,
  cakeTable: 30,
  giftTable: 30,
  loungeSmall: 150,
  loungeMedium: 250,
  loungeLarge: 400,
  cateringPrep: 150,
} as const;

export const CIRCULATION_MULTIPLIER = 1.18; // 18% for walkways

/** Usable space as % of total for tent types (pole tents lose more to center poles) */
export const TENT_USABILITY: Record<TentStyle, number> = {
  frame: 0.98,
  clear_span: 1,
  sailcloth: 0.92,
  pole: 0.88,
};

export const STANDARD_TENT_SIZES = [
  { width: 20, length: 20, sqFt: 400 },
  { width: 20, length: 30, sqFt: 600 },
  { width: 20, length: 40, sqFt: 800 },
  { width: 30, length: 30, sqFt: 900 },
  { width: 30, length: 45, sqFt: 1350 },
  { width: 30, length: 60, sqFt: 1800 },
  { width: 40, length: 40, sqFt: 1600 },
  { width: 40, length: 60, sqFt: 2400 },
  { width: 40, length: 80, sqFt: 3200 },
  { width: 40, length: 100, sqFt: 4000 },
  { width: 60, length: 60, sqFt: 3600 },
  { width: 60, length: 90, sqFt: 5400 },
  { width: 60, length: 120, sqFt: 7200 },
  { width: 80, length: 80, sqFt: 6400 },
  { width: 80, length: 120, sqFt: 9600 },
];

export const EVENT_STYLE_LABELS: Record<EventStyle, string> = {
  ceremony_only: 'Ceremony only',
  reception_seated: 'Seated dinner',
  reception_buffet: 'Buffet',
  cocktail: 'Cocktail party',
  ceremony_and_reception: 'Ceremony + reception',
  corporate: 'Corporate / trade show',
};

export const TENT_STYLE_LABELS: Record<TentStyle, string> = {
  frame: 'Frame tent',
  pole: 'Pole tent',
  sailcloth: 'Sailcloth tent',
  clear_span: 'Clear span',
};
