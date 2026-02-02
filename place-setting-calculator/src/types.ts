export type ServiceStyle =
  | 'plated'
  | 'buffet'
  | 'family_style'
  | 'cocktail';

export interface PlaceSettingCourses {
  appetizer: boolean;
  salad: boolean;
  soup: boolean;
  main: boolean;
  dessert: boolean;
  bread: boolean;
}

export interface PlaceSettingBeverages {
  water: boolean;
  redWine: boolean;
  whiteWine: boolean;
  champagne: boolean;
  beer: boolean;
  coffee: boolean;
  tea: boolean;
  cocktails: boolean;
}

export interface PlaceSettingCalculation {
  guestCount: number;
  childCount: number;
  vendorCount: number;
  serviceStyle: ServiceStyle;
  courses: PlaceSettingCourses;
  beverages: PlaceSettingBeverages;
  familyStyleTables?: number;
  buffetStations?: number;
}

export interface PerPersonQuantities {
  dinnerPlate: number;
  saladPlate: number;
  breadPlate: number;
  soupBowl: number;
  dessertPlate: number;
  dinnerFork: number;
  saladFork: number;
  dessertFork: number;
  dinnerKnife: number;
  butterKnife: number;
  soupSpoon: number;
  teaspoon: number;
  waterGlass: number;
  wineGlass: number;
  champagneFlute: number;
  beerGlass: number;
  coffeeCup: number;
  coffeeSaucer: number;
}

export interface ServingPieceItem {
  item: string;
  quantity: number;
  notes: string;
}

export interface PlaceSettingResult {
  perPerson: PerPersonQuantities;
  totals: Record<string, number>;
  servingPieces: ServingPieceItem[];
  bufferRecommendation: number;
}
