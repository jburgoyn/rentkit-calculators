import type {
  PlaceSettingCalculation,
  PlaceSettingResult,
  PerPersonQuantities,
  PlaceSettingCourses,
  PlaceSettingBeverages,
  ServingPieceItem,
} from './types';

const BUFFER = 1.05; // 5% buffer for breakage

function getPerPersonPlated(
  courses: PlaceSettingCourses,
  beverages: PlaceSettingBeverages
): PerPersonQuantities {
  const saladOrApp = courses.salad || courses.appetizer;
  return {
    dinnerPlate: 1,
    saladPlate: saladOrApp ? 1 : 0,
    breadPlate: courses.bread ? 1 : 0,
    soupBowl: courses.soup ? 1 : 0,
    dessertPlate: courses.dessert ? 1 : 0,
    dinnerFork: 1,
    saladFork: courses.salad ? 1 : 0,
    dessertFork: courses.dessert ? 1 : 0,
    dinnerKnife: 1,
    butterKnife: courses.bread ? 1 : 0,
    soupSpoon: courses.soup ? 1 : 0,
    teaspoon: beverages.coffee || beverages.tea ? 1 : 0,
    waterGlass: beverages.water ? 1 : 0,
    wineGlass:
      beverages.redWine || beverages.whiteWine ? 1 : 0,
    champagneFlute: beverages.champagne ? 1 : 0,
    beerGlass: beverages.beer ? 1 : 0,
    coffeeCup: beverages.coffee ? 1 : 0,
    coffeeSaucer: beverages.coffee ? 1 : 0,
  };
}

function getPerPersonBuffet(
  courses: PlaceSettingCourses,
  beverages: PlaceSettingBeverages
): PerPersonQuantities {
  const base = getPerPersonPlated(courses, beverages);
  return {
    ...base,
    dinnerPlate: 1.2, // Extra for seconds
    saladPlate: base.saladPlate > 0 ? 1.2 : 0,
    dessertPlate: base.dessertPlate > 0 ? 1.2 : 0,
  };
}

function getPerPersonFamilyStyle(
  courses: PlaceSettingCourses,
  beverages: PlaceSettingBeverages
): PerPersonQuantities {
  return getPerPersonPlated(courses, beverages);
}

function getPerPersonCocktail(
  _courses: PlaceSettingCourses,
  beverages: PlaceSettingBeverages
): PerPersonQuantities {
  return {
    dinnerPlate: 0,
    saladPlate: 1, // Appetizer/small plate
    breadPlate: 0,
    soupBowl: 0,
    dessertPlate: 0,
    dinnerFork: 0,
    saladFork: 1,
    dessertFork: 0,
    dinnerKnife: 0,
    butterKnife: 0,
    soupSpoon: 0,
    teaspoon: beverages.coffee || beverages.tea ? 1 : 0,
    waterGlass: beverages.water ? 1 : 0,
    wineGlass: beverages.redWine || beverages.whiteWine ? 1 : 0,
    champagneFlute: beverages.champagne ? 1 : 0,
    beerGlass: beverages.beer ? 1 : 0,
    coffeeCup: beverages.coffee ? 1 : 0,
    coffeeSaucer: beverages.coffee ? 1 : 0,
  };
}

function getPerPerson(
  input: PlaceSettingCalculation
): PerPersonQuantities {
  const { serviceStyle, courses, beverages } = input;
  switch (serviceStyle) {
    case 'plated':
      return getPerPersonPlated(courses, beverages);
    case 'buffet':
      return getPerPersonBuffet(courses, beverages);
    case 'family_style':
      return getPerPersonFamilyStyle(courses, beverages);
    case 'cocktail':
      return getPerPersonCocktail(courses, beverages);
    default:
      return getPerPersonPlated(courses, beverages);
  }
}

function calculateServingPieces(
  input: PlaceSettingCalculation
): ServingPieceItem[] {
  const { serviceStyle, familyStyleTables = 15, buffetStations = 2 } = input;
  const pieces: ServingPieceItem[] = [];

  if (serviceStyle === 'family_style') {
    pieces.push(
      {
        item: 'Serving platters',
        quantity: familyStyleTables * 2,
        notes: '2 per table for main/sides',
      },
      {
        item: 'Serving bowls',
        quantity: familyStyleTables * 2,
        notes: '2 per table for salads/sides',
      },
      {
        item: 'Serving utensil sets',
        quantity: familyStyleTables * 4,
        notes: '4 sets per table',
      },
      {
        item: 'Bread baskets',
        quantity: familyStyleTables,
        notes: '1 per table',
      }
    );
  }

  if (serviceStyle === 'buffet') {
    pieces.push(
      {
        item: 'Chafing dishes',
        quantity: buffetStations * 4,
        notes: '4 per station',
      },
      {
        item: 'Serving platters',
        quantity: buffetStations * 3,
        notes: '3 per station',
      },
      {
        item: 'Serving utensils',
        quantity: buffetStations * 8,
        notes: '8 per station',
      }
    );
  }

  return pieces;
}

export function calculatePlaceSettings(
  input: PlaceSettingCalculation
): PlaceSettingResult {
  const totalGuests =
    input.guestCount + input.childCount + input.vendorCount;
  const perPerson = getPerPerson(input);

  const totals: Record<string, number> = {};
  for (const [key, qty] of Object.entries(perPerson)) {
    const val = qty as number;
    totals[key] = Math.ceil(totalGuests * val * BUFFER);
  }

  const servingPieces = calculateServingPieces(input);

  return {
    perPerson,
    totals,
    servingPieces,
    bufferRecommendation: 0.05,
  };
}

export const DEFAULT_CALCULATION: PlaceSettingCalculation = {
  guestCount: 120,
  childCount: 0,
  vendorCount: 0,
  serviceStyle: 'plated',
  courses: {
    appetizer: true,
    salad: true,
    soup: false,
    main: true,
    dessert: true,
    bread: true,
  },
  beverages: {
    water: true,
    redWine: false,
    whiteWine: false,
    champagne: true,
    beer: false,
    coffee: true,
    tea: true,
    cocktails: false,
  },
  familyStyleTables: 15,
  buffetStations: 2,
};
