import type {
  BarCalculation,
  BarResult,
  BarStyle,
  DrinkPreferences,
  LiquorQuantity,
  MixerQuantity,
} from './types';

type LiquorResult = BarResult['liquor'];

const DRINKS_PER_HOUR = {
  heavy: 2,
  moderate: 1.5,
  light: 1,
  nonDrinker: 0,
};

const COCKTAIL_HOUR_MULTIPLIER = 1.3;

const SEASONAL_ADJUSTMENTS: Record<
  string,
  { beer: number; wine: number; cocktails: number }
> = {
  summer: { beer: 1.2, wine: 0.9, cocktails: 1.1 },
  fall: { beer: 1.0, wine: 1.0, cocktails: 1.0 },
  winter: { beer: 0.9, wine: 1.1, cocktails: 1.0 },
  spring: { beer: 1.05, wine: 1.0, cocktails: 1.0 },
};

const SERVINGS_PER_UNIT = {
  liquorBottle: 17,
  wineBottle: 5,
  champagneBottle: 6,
  beerCase: 24,
  mixerLiter: 8,
};

const BAR_RATIOS: Record<BarStyle, Record<string, number>> = {
  full_bar: {
    vodka: 0.35,
    gin: 0.1,
    rum: 0.15,
    whiskey: 0.2,
    tequila: 0.15,
    other: 0.05,
  },
  beer_wine: {
    vodka: 0,
    gin: 0,
    rum: 0,
    whiskey: 0,
    tequila: 0,
    other: 0,
  },
  signature_cocktails: {
    vodka: 0.3,
    gin: 0.15,
    rum: 0.2,
    whiskey: 0.2,
    tequila: 0.15,
    other: 0,
  },
  beer_only: {
    vodka: 0,
    gin: 0,
    rum: 0,
    whiskey: 0,
    tequila: 0,
    other: 0,
  },
  wine_only: {
    vodka: 0,
    gin: 0,
    rum: 0,
    whiskey: 0,
    tequila: 0,
    other: 0,
  },
  non_alcoholic: {
    vodka: 0,
    gin: 0,
    rum: 0,
    whiskey: 0,
    tequila: 0,
    other: 0,
  },
};

const DEFAULT_DRINK_PREFERENCES: DrinkPreferences = {
  beerPercent: 40,
  winePercent: 30,
  cocktailPercent: 30,
};

function zeroLiquor(): BarResult['liquor'] {
  const zero: LiquorQuantity = { bottles: 0, liters: 0 };
  return {
    vodka: { ...zero },
    gin: { ...zero },
    rum: { ...zero },
    whiskey: { ...zero },
    tequila: { ...zero },
  };
}

function calculateMixers(
  cocktailDrinks: number,
  _signatureCocktails?: string[]
): Record<string, MixerQuantity> {
  const cocktails = Math.ceil(cocktailDrinks);
  const tonic = Math.ceil(cocktails * 0.4 / SERVINGS_PER_UNIT.mixerLiter) || 0;
  const soda = Math.ceil(cocktails * 0.4 / SERVINGS_PER_UNIT.mixerLiter) || 0;
  const cranberry = Math.ceil(cocktails * 0.25 / SERVINGS_PER_UNIT.mixerLiter) || 0;
  const oj = Math.ceil(cocktails * 0.2 / SERVINGS_PER_UNIT.mixerLiter) || 0;
  const limeJuice = Math.ceil(cocktails * 0.15 / SERVINGS_PER_UNIT.mixerLiter) || 0;
  const simpleSyrup = Math.ceil(cocktails * 0.1 / SERVINGS_PER_UNIT.mixerLiter) || 0;
  const mixers: Record<string, MixerQuantity> = {};
  if (tonic > 0) mixers['Tonic'] = { quantity: tonic, unit: 'liters' };
  if (soda > 0) mixers['Soda Water'] = { quantity: soda, unit: 'liters' };
  if (cranberry > 0) mixers['Cranberry Juice'] = { quantity: cranberry, unit: 'liters' };
  if (oj > 0) mixers['Orange Juice'] = { quantity: oj, unit: 'liters' };
  if (limeJuice > 0) mixers['Lime Juice'] = { quantity: limeJuice, unit: 'liters' };
  if (simpleSyrup > 0) mixers['Simple Syrup'] = { quantity: simpleSyrup, unit: 'liters' };
  return mixers;
}

function getGarnishes(signatureCocktails?: string[]): string[] {
  const base = ['Limes', 'Lemons'];
  if (signatureCocktails?.includes('Martini')) base.push('Olives');
  if (signatureCocktails?.includes('Old Fashioned')) base.push('Cherries', 'Orange peel');
  if (signatureCocktails?.includes('Mojito')) base.push('Mint');
  return base;
}

function getBarSupplies(_input: BarCalculation): string[] {
  return [
    'Bar towels',
    'Cocktail shaker',
    'Jigger',
    'Bottle opener',
    'Wine key',
    'Stirring spoon',
    'Strainer',
    'Cutting board & knife',
  ];
}

function distributeWine(
  totalBottles: number,
  _factors: BarCalculation['factors']
): BarResult['wine'] {
  const red = Math.ceil(totalBottles * 0.35);
  const white = Math.ceil(totalBottles * 0.42);
  const sparkling = Math.ceil(totalBottles * 0.23);
  return {
    red: { bottles: red },
    white: { bottles: white },
    sparkling: { bottles: sparkling },
  };
}

function distributeBeer(totalCases: number): BarResult['beer'] {
  const domestic = Math.ceil(totalCases * 0.5);
  const craft = Math.ceil(totalCases * 0.25);
  const light = Math.ceil(totalCases * 0.25);
  return {
    domestic: { quantity: domestic * SERVINGS_PER_UNIT.beerCase, cases: domestic },
    craft: { quantity: craft * SERVINGS_PER_UNIT.beerCase, cases: craft },
    light: { quantity: light * SERVINGS_PER_UNIT.beerCase, cases: light },
  };
}

function calculateGlassware(
  input: BarCalculation,
  beerDrinks: number,
  _wineDrinks: number,
  cocktailDrinks: number
): BarResult['glassware'] {
  const guests = input.guestCount;
  const wineGlasses = Math.ceil(guests * 1.2);
  const champagneFlutes = Math.ceil(guests * 0.5);
  const highballGlasses = Math.ceil(Math.max(cocktailDrinks * 0.6, guests * 0.5));
  const rocksGlasses = Math.ceil(cocktailDrinks * 0.4);
  const beerGlasses = Math.ceil(Math.max(beerDrinks * 0.5, guests * 0.6));
  return {
    wineGlasses,
    champagneFlutes,
    highballGlasses,
    rocksGlasses,
    beerGlasses,
  };
}

function estimateCost(
  liquor: BarResult['liquor'],
  wineBottles: number,
  beerCases: number,
  _mixers: Record<string, MixerQuantity>
): { low: number; high: number } {
  let low = 0;
  let high = 0;
  for (const key of Object.keys(liquor)) {
    const q = liquor[key];
    if (q.bottles > 0) {
      low += q.bottles * 15;
      high += q.bottles * 35;
    }
  }
  low += wineBottles * 10;
  high += wineBottles * 25;
  low += beerCases * 25;
  high += beerCases * 45;
  return { low: Math.round(low), high: Math.round(high) };
}

export function calculateBar(input: BarCalculation): BarResult {
  const totalHours =
    (input.eventDuration.cocktailHour ? 1 : 0) +
    input.eventDuration.receptionHours +
    (input.eventDuration.afterPartyHours ?? 0);

  const avgDrinksPerPerson =
    ((input.drinkerProfile.heavy / 100) * DRINKS_PER_HOUR.heavy +
      (input.drinkerProfile.moderate / 100) * DRINKS_PER_HOUR.moderate +
      (input.drinkerProfile.light / 100) * DRINKS_PER_HOUR.light) *
    totalHours;

  let totalDrinks = Math.ceil(input.guestCount * avgDrinksPerPerson);
  if (input.eventDuration.cocktailHour && totalHours > 1) {
    totalDrinks = Math.ceil(
      totalDrinks * (1 + (COCKTAIL_HOUR_MULTIPLIER - 1) / totalHours)
    );
  }

  if (input.barStyle === 'non_alcoholic') {
    totalDrinks = 0;
  }

  const prefs = input.drinkPreferences ?? DEFAULT_DRINK_PREFERENCES;
  const seasonAdj =
    SEASONAL_ADJUSTMENTS[input.factors.season] ?? SEASONAL_ADJUSTMENTS.fall;

  const beerDrinks =
    totalDrinks * (prefs.beerPercent / 100) * seasonAdj.beer;
  const wineDrinks =
    totalDrinks * (prefs.winePercent / 100) * seasonAdj.wine;
  const cocktailDrinks =
    totalDrinks * (prefs.cocktailPercent / 100) * seasonAdj.cocktails;

  const wineBottles = Math.ceil(wineDrinks / SERVINGS_PER_UNIT.wineBottle);
  const beerCases = Math.ceil(beerDrinks / SERVINGS_PER_UNIT.beerCase);
  const totalLiquorDrinks = cocktailDrinks;
  const totalLiquorBottles = Math.ceil(
    totalLiquorDrinks / SERVINGS_PER_UNIT.liquorBottle
  );

  const ratios = BAR_RATIOS[input.barStyle] ?? BAR_RATIOS.full_bar;
  const liquor: LiquorResult = zeroLiquor();

  if (
    input.barStyle !== 'beer_wine' &&
    input.barStyle !== 'beer_only' &&
    input.barStyle !== 'wine_only' &&
    input.barStyle !== 'non_alcoholic'
  ) {
    for (const [type, ratio] of Object.entries(ratios)) {
      if (type === 'other' || ratio <= 0) continue;
      const bottles = Math.max(0, Math.ceil(totalLiquorBottles * ratio));
      const key = type as keyof LiquorResult;
      if (key in liquor) {
        liquor[key] = {
          bottles,
          liters: Math.round(bottles * 0.75 * 10) / 10,
        };
      }
    }
  }

  const wine = distributeWine(wineBottles, input.factors);
  const beer =
    input.barStyle === 'wine_only' || input.barStyle === 'non_alcoholic'
      ? {
          domestic: { quantity: 0, cases: 0 },
          craft: { quantity: 0, cases: 0 },
          light: { quantity: 0, cases: 0 },
        }
      : distributeBeer(beerCases);

  const wineForResult: BarResult['wine'] =
    input.barStyle === 'beer_only' || input.barStyle === 'non_alcoholic'
      ? { red: { bottles: 0 }, white: { bottles: 0 }, sparkling: { bottles: 0 } }
      : wine;

  const mixers = calculateMixers(cocktailDrinks, input.signatureCocktails);
  const ice = { pounds: Math.ceil(input.guestCount * 1.5) };
  const glassware = calculateGlassware(
    input,
    beerDrinks,
    wineDrinks,
    cocktailDrinks
  );
  const garnishes = getGarnishes(input.signatureCocktails);
  const barSupplies = getBarSupplies(input);
  const estimatedCost = estimateCost(
    liquor,
    wineBottles,
    beerCases,
    mixers
  );

  return {
    liquor,
    wine: wineForResult,
    beer,
    mixers,
    garnishes,
    ice,
    glassware,
    barSupplies,
    estimatedCost,
  };
}

export const BAR_STYLE_LABELS: Record<BarStyle, string> = {
  full_bar: 'Full Bar',
  beer_wine: 'Beer & Wine Only',
  signature_cocktails: 'Signature Cocktails',
  beer_only: 'Beer Only',
  wine_only: 'Wine Only',
  non_alcoholic: 'Non-Alcoholic Only',
};

export const POPULAR_COCKTAILS = [
  'Margarita',
  'Vodka Soda',
  'Old Fashioned',
  'Mojito',
  'Whiskey Sour',
  'Martini',
  'Moscow Mule',
  'Gin & Tonic',
  'Rum & Coke',
] as const;
