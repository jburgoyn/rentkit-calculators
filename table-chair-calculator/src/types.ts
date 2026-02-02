export type EventStyle =
  | 'seated_dinner'
  | 'buffet'
  | 'cocktail'
  | 'ceremony'
  | 'mixed';

export type TableType =
  | 'round_48'
  | 'round_60'
  | 'round_72'
  | 'banquet_6ft'
  | 'banquet_8ft'
  | 'square_36'
  | 'square_48'
  | 'cocktail'
  | 'sweetheart'
  | 'farm';

export type ChairType =
  | 'folding'
  | 'chiavari'
  | 'crossback'
  | 'ghost'
  | 'banquet_padded';

export interface AdditionalTables {
  headTable?: { seats: number };
  sweetheartTable?: boolean;
  giftTable?: boolean;
  signInTable?: boolean;
  cakeTable?: boolean;
  djTable?: boolean;
  photoBoothTable?: boolean;
  foodStations?: number;
  barStations?: number;
}

export interface TablePreferences {
  primary: TableType;
  allowMixed: boolean;
  preferredSeatsPerTable?: number;
}

export interface CalculatorInput {
  guestCount: number;
  childCount?: number;
  vendorCount?: number;
  eventStyle: EventStyle;
  tablePreferences: TablePreferences;
  additionalTables: AdditionalTables;
  chairStyle?: ChairType;
}

export interface TableResult {
  type: TableType;
  quantity: number;
  seatsPerTable: number;
  label: string;
}

export interface CalculatorResult {
  tables: TableResult[];
  totalTables: number;
  totalChairs: number;
  estimatedSquareFootage: number;
  notes: string[];
}
