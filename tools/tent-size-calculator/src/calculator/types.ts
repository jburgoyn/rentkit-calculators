export type EventStyle =
  | 'ceremony_only'
  | 'reception_seated'
  | 'reception_buffet'
  | 'cocktail'
  | 'ceremony_and_reception'
  | 'corporate';

export type TentStyle = 'frame' | 'pole' | 'sailcloth' | 'clear_span';

export type DjBand = 'dj' | 'small_band' | 'large_band' | 'none';

export type LoungeSize = 'none' | 'small' | 'medium' | 'large';

export type DanceLevel = 'light' | 'moderate' | 'heavy';

export type Snugness = 'comfortable' | 'adequate' | 'tight';

export interface TentSizeOption {
  width: number;
  length: number;
  sqFt: number;
}

export interface TentSizeResult extends TentSizeOption {
  usableSqFt: number;
  style: TentStyle;
  fits: boolean;
  snugness: Snugness;
}

export interface SquareFootageBreakdown {
  seating: number;
  danceFloor: number;
  bars: number;
  buffet: number;
  entertainment: number;
  other: number;
  circulation: number;
  total: number;
}

export interface TentCalculationInput {
  guestCount: number;
  eventStyle: EventStyle;
  elements: {
    danceFloor: boolean;
    danceFloorPercentage?: number;
    danceLevel?: DanceLevel;
    barStations: number;
    buffetStations: number;
    djBand: DjBand;
    photoBooth: boolean;
    cakeTable: boolean;
    giftTable: boolean;
    loungeArea: LoungeSize;
    cateringPrep: boolean;
  };
  tentPreferences: {
    style?: TentStyle;
    enclosed: boolean;
    climateControl: boolean;
  };
}

export interface TentCalculationResult {
  recommendedSize: TentSizeResult | null;
  alternativeSizes: TentSizeResult[];
  squareFootageBreakdown: SquareFootageBreakdown;
  totalNeeded: number;
  tips: string[];
  warnings: string[];
}
