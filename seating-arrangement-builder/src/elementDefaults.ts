import type { ElementType, ElementProperties } from './types';

export interface ElementSpec {
  type: ElementType;
  label: string;
  shortLabel: string;
  widthFt: number;
  lengthFt: number;
  defaultSeats?: number;
  shape: 'circle' | 'rect';
  icon: string;
}

export const ELEMENT_SPECS: Record<ElementType, ElementSpec> = {
  table_round_48: { type: 'table_round_48', label: 'Round 48"', shortLabel: '48"', widthFt: 4, lengthFt: 4, defaultSeats: 4, shape: 'circle', icon: '○' },
  table_round_60: { type: 'table_round_60', label: 'Round 60"', shortLabel: '60"', widthFt: 5, lengthFt: 5, defaultSeats: 6, shape: 'circle', icon: '○' },
  table_round_72: { type: 'table_round_72', label: 'Round 72"', shortLabel: '72"', widthFt: 6, lengthFt: 6, defaultSeats: 8, shape: 'circle', icon: '○' },
  table_rect_6ft: { type: 'table_rect_6ft', label: 'Rect 6ft', shortLabel: '6ft', widthFt: 6, lengthFt: 2.5, defaultSeats: 6, shape: 'rect', icon: '▭' },
  table_rect_8ft: { type: 'table_rect_8ft', label: 'Rect 8ft', shortLabel: '8ft', widthFt: 8, lengthFt: 2.5, defaultSeats: 8, shape: 'rect', icon: '▭' },
  table_square: { type: 'table_square', label: 'Square', shortLabel: '□', widthFt: 4, lengthFt: 4, defaultSeats: 4, shape: 'rect', icon: '□' },
  table_cocktail: { type: 'table_cocktail', label: 'Cocktail', shortLabel: '◇', widthFt: 2, lengthFt: 2, defaultSeats: 0, shape: 'circle', icon: '◇' },
  table_sweetheart: { type: 'table_sweetheart', label: 'Sweetheart', shortLabel: '♥', widthFt: 3, lengthFt: 3, defaultSeats: 2, shape: 'circle', icon: '♥' },
  dance_floor: { type: 'dance_floor', label: 'Dance Floor', shortLabel: 'Dance', widthFt: 12, lengthFt: 12, shape: 'rect', icon: '◇' },
  stage: { type: 'stage', label: 'Stage', shortLabel: 'Stage', widthFt: 12, lengthFt: 8, shape: 'rect', icon: '▤' },
  bar: { type: 'bar', label: 'Bar', shortLabel: 'Bar', widthFt: 8, lengthFt: 3, shape: 'rect', icon: '▤' },
  buffet: { type: 'buffet', label: 'Buffet', shortLabel: 'Buffet', widthFt: 8, lengthFt: 3, shape: 'rect', icon: '▭' },
  photo_booth: { type: 'photo_booth', label: 'Photo Booth', shortLabel: '📸', widthFt: 4, lengthFt: 3, shape: 'rect', icon: '📸' },
  cake_table: { type: 'cake_table', label: 'Cake Table', shortLabel: 'Cake', widthFt: 6, lengthFt: 2, shape: 'rect', icon: '🎂' },
  gift_table: { type: 'gift_table', label: 'Gift Table', shortLabel: 'Gift', widthFt: 6, lengthFt: 2, shape: 'rect', icon: '🎁' },
  lounge: { type: 'lounge', label: 'Lounge', shortLabel: 'Lounge', widthFt: 10, lengthFt: 8, shape: 'rect', icon: '▤' },
};

export function getDefaultProperties(type: ElementType): ElementProperties {
  const spec = ELEMENT_SPECS[type];
  const props: ElementProperties = {
    width: spec.widthFt,
    length: spec.lengthFt,
    label: spec.shortLabel,
  };
  if (spec.defaultSeats != null) props.seats = spec.defaultSeats;
  return props;
}

export function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
