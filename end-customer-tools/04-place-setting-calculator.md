# Place Setting Calculator

## Overview

An embeddable widget that calculates the exact quantities of plates, glasses, flatware, and serving pieces needed for an event based on guest count and menu style.

## Problem Statement

Tableware calculations are complex and often overlooked:
- Different courses require different plates
- Beverage service varies (water, wine, champagne, coffee)
- Serving pieces for family-style vs plated service differ
- Forgetting items like bread plates or dessert forks is common
- Buffet vs plated service has different requirements

## Target Audience

- **Primary:** Event hosts planning formal dinners, weddings
- **Secondary:** Caterers calculating rental needs
- **Tertiary:** Venues without in-house tableware

## SEO Opportunity

- "place setting calculator" - 600 monthly searches
- "how many plates for wedding" - 400 monthly searches
- "flatware needed per person" - 300 monthly searches
- "dinner party supplies calculator" - 300 monthly searches

## Key Features

### 1. Guest Count Input
- Total guest count
- Children (smaller portions/plates)
- Vendor meals

### 2. Service Style
- **Plated service:** Full place settings
- **Buffet:** Plates at stations, flatware at tables
- **Family style:** Serving platters on tables
- **Cocktail/passed:** Appetizer plates, no full settings

### 3. Menu Configuration
- **Courses:**
  - Appetizer/salad course
  - Soup course
  - Main course
  - Dessert course
  - Bread service
- **Course delivery:** Plated vs buffet per course

### 4. Beverage Service
- Water glasses
- Wine glasses (red/white/both)
- Champagne flutes
- Beer glasses
- Coffee/tea service
- Bar glassware (cocktail, rocks, highball)

### 5. Serving Pieces (Family Style/Buffet)
- Platters (sizes)
- Serving bowls
- Chafing dishes
- Serving utensils
- Bread baskets

### 6. Results Display
- Complete tableware list
- Per-person breakdown
- Serving piece recommendations
- Visual place setting diagram
- "Get a Quote" CTA

## Technical Requirements

### Data Model

```typescript
interface PlaceSettingCalculation {
  guestCount: number;
  childCount: number;
  vendorCount: number;

  serviceStyle: 'plated' | 'buffet' | 'family_style' | 'cocktail';

  courses: {
    appetizer: boolean;
    salad: boolean;
    soup: boolean;
    main: boolean;
    dessert: boolean;
    bread: boolean;
  };

  beverages: {
    water: boolean;
    redWine: boolean;
    whiteWine: boolean;
    champagne: boolean;
    beer: boolean;
    coffee: boolean;
    tea: boolean;
    cocktails: boolean;
  };

  familyStyleTables?: number;
  buffetStations?: number;
}

interface PlaceSettingResult {
  perPerson: {
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
    coffeeCup: number;
    coffeeSaucer: number;
  };
  totals: {
    [key: string]: number;
  };
  servingPieces: {
    item: string;
    quantity: number;
    notes: string;
  }[];
  bufferRecommendation: number;
}
```

### Calculation Logic

```typescript
const PLACE_SETTING_FORMULAS = {
  plated: {
    dinnerPlate: 1,
    saladPlate: (courses) => courses.salad || courses.appetizer ? 1 : 0,
    breadPlate: (courses) => courses.bread ? 1 : 0,
    soupBowl: (courses) => courses.soup ? 1 : 0,
    dessertPlate: (courses) => courses.dessert ? 1 : 0,
    dinnerFork: 1,
    saladFork: (courses) => courses.salad ? 1 : 0,
    dessertFork: (courses) => courses.dessert ? 1 : 0,
    dinnerKnife: 1,
    butterKnife: (courses) => courses.bread ? 1 : 0,
    soupSpoon: (courses) => courses.soup ? 1 : 0,
    teaspoon: (bev) => bev.coffee || bev.tea ? 1 : 0
  },
  buffet: {
    dinnerPlate: 1.2, // Extra for seconds
    // ... adjusted quantities
  }
};

const SERVING_PIECE_FORMULAS = {
  family_style: {
    servingPlattersPerTable: 2,
    servingBowlsPerTable: 2,
    servingUtensilSetsPerTable: 4,
    breadBasketsPerTable: 1
  },
  buffet: {
    chafingDishesPerStation: 4,
    servingPlattersPerStation: 3,
    servingUtensilsPerStation: 8
  }
};

function calculatePlaceSettings(input: PlaceSettingCalculation): PlaceSettingResult {
  const totalGuests = input.guestCount + input.childCount + input.vendorCount;
  const formulas = PLACE_SETTING_FORMULAS[input.serviceStyle];

  const perPerson = {};
  for (const [item, formula] of Object.entries(formulas)) {
    if (typeof formula === 'function') {
      perPerson[item] = formula(input.courses, input.beverages);
    } else {
      perPerson[item] = formula;
    }
  }

  const totals = {};
  for (const [item, qty] of Object.entries(perPerson)) {
    totals[item] = Math.ceil(totalGuests * qty * 1.05); // 5% buffer
  }

  // Calculate serving pieces
  const servingPieces = calculateServingPieces(input);

  return { perPerson, totals, servingPieces, bufferRecommendation: 0.05 };
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🍽️ Place Setting Calculator                   [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOW MANY GUESTS?                                           │
│  Adults: [120]  Children: [15]  Vendors: [10]              │
│                                                             │
│  SERVICE STYLE                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Plated  │ │  Buffet  │ │  Family  │ │ Cocktail │      │
│  │    🍽️    │ │    🍴    │ │   Style  │ │    🥂    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│       ●            ○            ○            ○             │
│                                                             │
│  COURSES (select all that apply)                           │
│  ☑ Appetizer/Salad    ☑ Main Course     ☑ Dessert         │
│  ☐ Soup Course        ☑ Bread Service                      │
│                                                             │
│  BEVERAGES                                                  │
│  ☑ Water              ☐ Red Wine        ☐ White Wine       │
│  ☑ Champagne Toast    ☑ Coffee/Tea      ☐ Beer            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              PLACE SETTING DIAGRAM                    │ │
│  │                                                       │ │
│  │         [Bread Plate]                                 │ │
│  │              🍞                                       │ │
│  │   🍴  🍴      🍽️          🔪                        │ │
│  │  salad dinner  DINNER     knife  🥄                  │ │
│  │  fork  fork    PLATE            soup                 │ │
│  │                                  spoon               │ │
│  │                   🥂  🍷  💧                         │ │
│  │              champagne wine water                    │ │
│  │                                                       │ │
│  │                   ☕                                   │ │
│  │              coffee cup                               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  YOUR TABLEWARE NEEDS (145 guests)                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  PLATES                          FLATWARE                   │
│  ├─ 153 Dinner Plates           ├─ 153 Dinner Forks        │
│  ├─ 153 Salad Plates            ├─ 153 Salad Forks         │
│  ├─ 153 Bread Plates            ├─ 153 Dessert Forks       │
│  └─ 153 Dessert Plates          ├─ 153 Dinner Knives       │
│                                  ├─ 153 Butter Knives       │
│  GLASSWARE                       └─ 153 Teaspoons          │
│  ├─ 153 Water Glasses                                       │
│  ├─ 153 Champagne Flutes        COFFEE SERVICE              │
│  └─ 153 Coffee Cups & Saucers   ├─ 153 Coffee Cups         │
│                                  └─ 153 Saucers             │
│                                                             │
│  💡 Includes 5% buffer for breakage and replacements       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     📧  Get a Quote for Complete Tableware          │   │
│  │     [        Enter your email        ] [Get Quote]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 2,500+ |
| Calculator completions | 60% of starts |
| Email capture rate | 15% |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation logic | 1.5 days | Week 1 |
| UI/UX with diagram | 2.5 days | Week 1 |
| Embed system | 1 day | Week 2 |
| Testing & polish | 1 day | Week 2 |
| **Total** | **6 days** | **2 weeks** |

## Future Enhancements

1. **Style selection:** Different china patterns shown
2. **Rental vs purchase calculator:** For frequent hosts
3. **Menu integration:** Input actual menu items
4. **Catering integration:** Connect to catering company data
5. **Dietary accommodations:** Extra plates for special meals
