export type ServiceStyle =
  | 'buffet'
  | 'plated'
  | 'stations'
  | 'family_style';

export interface BuffetConfig {
  lines: 1 | 2;
  doubleSided: boolean;
  hotItems: number;
  coldItems: number;
  hasSaladBar: boolean;
  hasDessertStation: boolean;
}

export interface BeverageService {
  coffee: boolean;
  coffeePercent?: number;
  decaf: boolean;
  hotTea: boolean;
  icedBeverages: number;
}

export interface SpecialNeeds {
  soupCourse: boolean;
  carving: boolean;
  omelette: boolean;
  pasta: boolean;
}

export interface CateringCalculation {
  guestCount: number;
  serviceStyle: ServiceStyle;
  courses: number;
  buffetConfig?: BuffetConfig;
  beverageService: BeverageService;
  specialNeeds?: SpecialNeeds;
}

export interface CateringResult {
  warmingEquipment: {
    chafingDishes: { size: string; quantity: number }[];
    sternoCans: number;
    heatLamps: number;
    warmingCabinets: number;
    soupKettles: number;
  };
  servingEquipment: {
    platters: { size: string; quantity: number }[];
    bowls: { size: string; quantity: number }[];
    utensils: { type: string; quantity: number }[];
    sneezeGuards: number;
    risers: number;
  };
  beverageEquipment: {
    coffeeUrns: { size: string; quantity: number }[];
    hotWaterDispensers: number;
    beverageDispensers: number;
    creamSugarSets: number;
  };
  coldEquipment: {
    iceBins: number;
    iceDisplays: number;
  };
  disposables: {
    sternoRefills: number;
    servingGloves: number;
  };
}
