export type BarStyle =
  | 'full_bar'
  | 'beer_wine'
  | 'signature_cocktails'
  | 'beer_only'
  | 'wine_only'
  | 'non_alcoholic';

export type Season = 'summer' | 'fall' | 'winter' | 'spring';
export type Setting = 'indoor' | 'outdoor';
export type TimeOfDay = 'daytime' | 'evening';

export interface DrinkerProfile {
  heavy: number;
  moderate: number;
  light: number;
  nonDrinker: number;
}

export interface EventDuration {
  cocktailHour: boolean;
  receptionHours: number;
  afterPartyHours?: number;
}

export interface DrinkPreferences {
  beerPercent: number;
  winePercent: number;
  cocktailPercent: number;
}

export interface BarFactors {
  season: Season;
  setting: Setting;
  timeOfDay: TimeOfDay;
}

export interface BarCalculation {
  guestCount: number;
  drinkerProfile: DrinkerProfile;
  eventDuration: EventDuration;
  barStyle: BarStyle;
  drinkPreferences?: DrinkPreferences;
  signatureCocktails?: string[];
  factors: BarFactors;
}

export interface LiquorQuantity {
  bottles: number;
  liters: number;
}

export interface WineQuantity {
  bottles: number;
}

export interface BeerQuantity {
  quantity: number;
  cases: number;
}

export interface MixerQuantity {
  quantity: number;
  unit: string;
}

export interface BarResult {
  liquor: {
    vodka: LiquorQuantity;
    gin: LiquorQuantity;
    rum: LiquorQuantity;
    whiskey: LiquorQuantity;
    tequila: LiquorQuantity;
    [key: string]: LiquorQuantity;
  };
  wine: {
    red: WineQuantity;
    white: WineQuantity;
    sparkling: WineQuantity;
  };
  beer: {
    domestic: BeerQuantity;
    craft: BeerQuantity;
    light: BeerQuantity;
  };
  mixers: Record<string, MixerQuantity>;
  garnishes: string[];
  ice: { pounds: number };
  glassware: {
    wineGlasses: number;
    champagneFlutes: number;
    highballGlasses: number;
    rocksGlasses: number;
    beerGlasses: number;
  };
  barSupplies: string[];
  estimatedCost?: { low: number; high: number };
}
