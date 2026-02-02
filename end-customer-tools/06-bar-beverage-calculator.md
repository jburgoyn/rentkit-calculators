# Bar & Beverage Calculator

## Overview

An embeddable widget that calculates alcohol, mixers, ice, and glassware quantities for events based on guest count, event duration, and beverage preferences.

## Problem Statement

Bar planning is notoriously difficult:
- Running out of alcohol is embarrassing
- Over-ordering is expensive and wasteful
- Mixer and ice quantities are often forgotten
- Different events have different consumption patterns
- Glassware needs vary by drink types served

## Target Audience

- **Primary:** Wedding couples and party hosts
- **Secondary:** Corporate event planners
- **Tertiary:** Caterers and bartenders

## SEO Opportunity

High-volume, high-intent searches:
- "alcohol calculator for party" - 6,600 monthly searches
- "how much alcohol for wedding" - 4,400 monthly searches
- "drink calculator for party" - 3,600 monthly searches
- "wedding bar calculator" - 2,400 monthly searches
- "how much beer for 100 guests" - 1,900 monthly searches

## Key Features

### 1. Guest Count & Demographics
- Total guest count
- Light/moderate/heavy drinkers percentage
- Non-drinkers percentage
- Under 21 (for US events)

### 2. Event Duration
- Cocktail hour (typically 1 hour)
- Reception/party length
- After-party (if applicable)

### 3. Bar Style
- **Full bar:** Liquor, beer, wine, cocktails
- **Beer & wine only:** No spirits
- **Signature cocktails:** Limited menu + beer/wine
- **Beer only:** Casual events
- **Wine only:** Elegant, simple
- **Non-alcoholic only:** Dry events

### 4. Drink Preferences
- Consumption estimates by type:
  - Beer (percentage)
  - Wine (percentage)
  - Cocktails/spirits (percentage)
- Popular cocktails selection (affects specific liquor needs)

### 5. Time & Weather Factors
- Season (summer = more beer/light drinks)
- Indoor vs outdoor
- Daytime vs evening

### 6. Results Display
- Complete shopping list with quantities
- Breakdown by category (liquor, wine, beer, mixers)
- Glassware needs
- Ice requirements
- Bar supplies checklist
- Cost estimate (optional)
- "Get a Quote" for rental bar/glassware

## Technical Requirements

### Data Model

```typescript
interface BarCalculation {
  guestCount: number;
  drinkerProfile: {
    heavy: number;      // percentage
    moderate: number;
    light: number;
    nonDrinker: number;
  };

  eventDuration: {
    cocktailHour: boolean;
    receptionHours: number;
    afterPartyHours?: number;
  };

  barStyle: 'full_bar' | 'beer_wine' | 'signature_cocktails' | 'beer_only' | 'wine_only' | 'non_alcoholic';

  drinkPreferences?: {
    beerPercent: number;
    winePercent: number;
    cocktailPercent: number;
  };

  signatureCocktails?: string[]; // Affects specific liquor needs

  factors: {
    season: 'summer' | 'fall' | 'winter' | 'spring';
    setting: 'indoor' | 'outdoor';
    timeOfDay: 'daytime' | 'evening';
  };
}

interface BarResult {
  liquor: {
    vodka: { bottles: number; liters: number };
    gin: { bottles: number; liters: number };
    rum: { bottles: number; liters: number };
    whiskey: { bottles: number; liters: number };
    tequila: { bottles: number; liters: number };
    // ... other spirits
  };
  wine: {
    red: { bottles: number };
    white: { bottles: number };
    sparkling: { bottles: number };
  };
  beer: {
    domestic: { quantity: number; cases: number };
    craft: { quantity: number; cases: number };
    light: { quantity: number; cases: number };
  };
  mixers: {
    [mixer: string]: { quantity: number; unit: string };
  };
  garnishes: string[];
  ice: { pounds: number };
  glassware: {
    wineGlasses: number;
    champagneFlutes: number;
    highballGlasses: number;
    rocksGlasses: number;
    beerGlasses: number;
    // ...
  };
  barSupplies: string[];
  estimatedCost?: {
    low: number;
    high: number;
  };
}
```

### Calculation Logic

```typescript
// Drinks per person per hour by drinker type
const DRINKS_PER_HOUR = {
  heavy: 2,
  moderate: 1.5,
  light: 1,
  nonDrinker: 0
};

// Cocktail hour is typically higher consumption
const COCKTAIL_HOUR_MULTIPLIER = 1.3;

// Seasonal adjustments
const SEASONAL_ADJUSTMENTS = {
  summer: { beer: 1.2, wine: 0.9, cocktails: 1.1 },
  winter: { beer: 0.9, wine: 1.1, cocktails: 1.0 },
  // ...
};

// Drink servings per bottle/unit
const SERVINGS_PER_UNIT = {
  liquorBottle: 17,      // 750ml bottle
  wineBottle: 5,         // Standard pours
  champagneBottle: 6,    // Flute pours
  beerCase: 24,          // Bottles/cans
  mixerLiter: 8,         // Approximate cocktails
};

// Standard bar ratios
const BAR_RATIOS = {
  full_bar: {
    vodka: 0.35, gin: 0.10, rum: 0.15,
    whiskey: 0.20, tequila: 0.15, other: 0.05
  },
  // ... other bar styles
};

function calculateBar(input: BarCalculation): BarResult {
  // Calculate total drinks needed
  const totalHours = (input.eventDuration.cocktailHour ? 1 : 0) +
    input.eventDuration.receptionHours +
    (input.eventDuration.afterPartyHours || 0);

  const avgDrinksPerPerson =
    (input.drinkerProfile.heavy / 100 * DRINKS_PER_HOUR.heavy +
     input.drinkerProfile.moderate / 100 * DRINKS_PER_HOUR.moderate +
     input.drinkerProfile.light / 100 * DRINKS_PER_HOUR.light) * totalHours;

  const totalDrinks = Math.ceil(input.guestCount * avgDrinksPerPerson);

  // Apply preferences and seasonal adjustments
  const seasonAdj = SEASONAL_ADJUSTMENTS[input.factors.season];
  const beerDrinks = totalDrinks * (input.drinkPreferences?.beerPercent || 40) / 100 * seasonAdj.beer;
  const wineDrinks = totalDrinks * (input.drinkPreferences?.winePercent || 30) / 100 * seasonAdj.wine;
  const cocktailDrinks = totalDrinks * (input.drinkPreferences?.cocktailPercent || 30) / 100 * seasonAdj.cocktails;

  // Convert to bottles/cases
  const wineBottles = Math.ceil(wineDrinks / SERVINGS_PER_UNIT.wineBottle);
  const beerCases = Math.ceil(beerDrinks / SERVINGS_PER_UNIT.beerCase);
  const totalLiquorDrinks = cocktailDrinks;
  const liquorBottles = Math.ceil(totalLiquorDrinks / SERVINGS_PER_UNIT.liquorBottle);

  // Distribute liquor by type
  const liquor = {};
  for (const [type, ratio] of Object.entries(BAR_RATIOS[input.barStyle] || BAR_RATIOS.full_bar)) {
    liquor[type] = {
      bottles: Math.ceil(liquorBottles * ratio),
      liters: Math.ceil(liquorBottles * ratio) * 0.75
    };
  }

  // Calculate mixers (rough estimates)
  const mixers = calculateMixers(cocktailDrinks, input.signatureCocktails);

  // Ice: ~1 lb per person for drinks + 0.5 lb for chilling
  const ice = { pounds: Math.ceil(input.guestCount * 1.5) };

  // Glassware
  const glassware = calculateGlassware(input, beerDrinks, wineDrinks, cocktailDrinks);

  return {
    liquor,
    wine: distributeWine(wineBottles, input.factors),
    beer: distributeBeer(beerCases),
    mixers,
    garnishes: getGarnishes(input.signatureCocktails),
    ice,
    glassware,
    barSupplies: getBarSupplies(input),
    estimatedCost: estimateCost(liquor, wineBottles, beerCases, mixers)
  };
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🍸 Bar & Beverage Calculator                  [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOW MANY GUESTS?  [  100  ]                               │
│                                                             │
│  DRINKING HABITS (adjust sliders)                          │
│  Heavy drinkers:    ○───●─────────○  20%                   │
│  Moderate drinkers: ○────────●────○  50%                   │
│  Light drinkers:    ○─────●───────○  25%                   │
│  Non-drinkers:      ○──●──────────○   5%                   │
│                                                             │
│  EVENT TIMELINE                                             │
│  ☑ Cocktail hour (1 hour)                                  │
│  Reception/party: [-] 4 [+] hours                          │
│  ☐ After-party                                             │
│                                                             │
│  BAR STYLE                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Full   │ │ Beer &   │ │Signature │ │ Beer     │      │
│  │   Bar    │ │  Wine    │ │Cocktails │ │  Only    │      │
│  │ 🍸🍷🍺  │ │  🍷🍺   │ │   🍹     │ │   🍺    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│       ●            ○            ○            ○             │
│                                                             │
│  DRINK PREFERENCES                                          │
│  Beer:      ○────────●────○  40%                           │
│  Wine:      ○─────●───────○  30%                           │
│  Cocktails: ○─────●───────○  30%                           │
│                                                             │
│  POPULAR COCKTAILS (select up to 5)                        │
│  ☑ Margarita    ☑ Vodka Soda    ☐ Old Fashioned           │
│  ☐ Mojito       ☑ Whiskey Sour  ☐ Martini                 │
│  ☐ Moscow Mule  ☐ Gin & Tonic   ☐ Rum & Coke              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  YOUR BAR SHOPPING LIST                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  LIQUOR (750ml bottles)        WINE                        │
│  ├─ 6 Vodka                    ├─ 15 bottles Red          │
│  ├─ 3 Tequila                  ├─ 18 bottles White        │
│  ├─ 4 Whiskey/Bourbon          └─ 10 bottles Sparkling    │
│  ├─ 2 Gin                                                  │
│  └─ 2 Rum                      BEER                        │
│                                 ├─ 4 cases Domestic (96)   │
│  MIXERS                         ├─ 2 cases Craft (48)      │
│  ├─ 8 liters Tonic              └─ 2 cases Light (48)      │
│  ├─ 8 liters Soda Water                                    │
│  ├─ 6 liters Cranberry Juice   ICE                         │
│  ├─ 6 liters Orange Juice      └─ 150 lbs                  │
│  ├─ 4 liters Lime Juice                                    │
│  └─ 4 liters Simple Syrup      GLASSWARE NEEDED            │
│                                 ├─ 100 Wine Glasses        │
│  GARNISHES                      ├─ 100 Highball Glasses    │
│  ├─ 50 Limes                    ├─ 50 Rocks Glasses        │
│  ├─ 20 Lemons                   ├─ 100 Champagne Flutes    │
│  └─ 1 jar Olives                └─ 100 Beer Glasses        │
│                                                             │
│  Estimated Cost: $1,200 - $1,800                           │
│                                                             │
│  💡 Tips:                                                   │
│  • Buy 10-15% extra for spillage and heavy pours           │
│  • Chill white wine and beer at least 4 hours before       │
│  • Plan for 1 bartender per 50 guests                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   📧  Get Glassware & Bar Rental Quote              │   │
│  │   [        Enter your email        ] [Get Quote]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [📥 Download Shopping List PDF]  [📤 Share List]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 15,000+ |
| Calculator completions | 55% of starts |
| PDF downloads | 30% of completions |
| Glassware quote requests | 10% |
| Email capture rate | 20% |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation logic | 2 days | Week 1 |
| UI/UX implementation | 3 days | Week 1-2 |
| PDF export feature | 1 day | Week 2 |
| Embed system | 1 day | Week 2 |
| Testing & polish | 1 day | Week 2 |
| **Total** | **8 days** | **2 weeks** |

## Future Enhancements

1. **Signature cocktail recipe builder:** Create custom cocktails, auto-calculate ingredients
2. **Supplier integration:** Direct links to Total Wine, BevMo, etc.
3. **Cost comparison:** Compare prices across suppliers
4. **Rental company inventory:** Show actual glassware available
5. **Bartender calculator:** How many bartenders needed
6. **Non-alcoholic options:** Mocktail calculations
7. **Dietary considerations:** Gluten-free beer, vegan wine options
