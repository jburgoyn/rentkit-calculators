export type TableShape = 'round' | 'rectangular' | 'square' | 'cocktail';
export type TableType =
  | 'round_48'
  | 'round_60'
  | 'round_72'
  | 'rect_6ft'
  | 'rect_8ft'
  | 'square_36'
  | 'square_48'
  | 'cocktail_30'
  | 'sweetheart'
  | 'food'
  | 'cake'
  | 'gift'
  | 'dj'
  | 'other';

export type TablePurpose =
  | 'guest'
  | 'food'
  | 'cake'
  | 'gift'
  | 'dj'
  | 'other';

export type DropLength = 'floor' | 'mid' | 'lap';
export type OverlayStyle = 'square' | 'round';

export interface TableEntry {
  type: TableType;
  shape: TableShape;
  size: string;
  quantity: number;
  purpose: TablePurpose;
}

export interface TableclothPreferences {
  dropLength: DropLength;
  useOverlays: boolean;
  overlayStyle?: OverlayStyle;
}

export interface NapkinPreferences {
  extraForVendors: number;
  extraForBar: number;
  extraForRestrooms: number;
}

export interface ChairAccessories {
  chairCovers: boolean;
  chairSashes: boolean;
  cushions: boolean;
  chairCount: number;
}

export interface TableSkirtEntry {
  length: string;
  quantity: number;
}

export interface AdditionalItems {
  tableRunners: boolean;
  tableSkirts: TableSkirtEntry[];
  chargerPlates: boolean;
}

export interface LinenCalculation {
  tables: TableEntry[];
  guestCount: number;
  tableclothPreferences: TableclothPreferences;
  napkinPreferences: NapkinPreferences;
  chairAccessories: ChairAccessories;
  additionalItems: AdditionalItems;
}

export interface TableclothResult {
  size: string;
  quantity: number;
  forTableType: string;
  notes: string;
}

export interface OverlayResult {
  size: string;
  quantity: number;
}

export interface NapkinBreakdown {
  guests: number;
  vendors: number;
  bar: number;
  restroom: number;
  buffer: number;
}

export interface NapkinResult {
  quantity: number;
  breakdown: NapkinBreakdown;
}

export interface TableSkirtResult {
  length: string;
  quantity: number;
}

export interface LinenList {
  tablecloths: TableclothResult[];
  overlays: OverlayResult[];
  napkins: NapkinResult;
  chairCovers: number;
  chairSashes: number;
  tableRunners: number;
  tableSkirts: TableSkirtResult[];
  chargerPlates: number;
}
