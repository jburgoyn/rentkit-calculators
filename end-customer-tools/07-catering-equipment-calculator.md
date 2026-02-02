# Catering Equipment Calculator

## Overview

An embeddable widget that calculates the catering and food service equipment needed for events, including chafing dishes, serving utensils, coffee service, and food warmers.

## Problem Statement

Catering equipment planning is often overlooked until the last minute:
- Caterers assume rental company provides, rental company assumes caterer provides
- Wrong quantities of chafing dishes for food volume
- Missing serving utensils for buffet stations
- Coffee service underestimated
- Food safety equipment (sneeze guards, warming lamps) forgotten

## Target Audience

- **Primary:** Caterers and catering companies
- **Secondary:** DIY event hosts doing their own food
- **Tertiary:** Venue coordinators

## SEO Opportunity

- "catering equipment calculator" - 500 monthly searches
- "how many chafing dishes for 100 guests" - 400 monthly searches
- "buffet equipment needed" - 300 monthly searches
- "coffee urn size calculator" - 400 monthly searches

## Key Features

### 1. Event Basics
- Guest count
- Service style (buffet, plated, stations, family style)
- Number of courses

### 2. Buffet Configuration
- Number of buffet lines (single vs double-sided)
- Hot food items count
- Cold food items count
- Salad bar
- Dessert station

### 3. Food Warming Equipment
- Chafing dishes (by food type)
- Heat lamps
- Warming cabinets
- Soup kettles

### 4. Food Serving Equipment
- Serving platters (sizes)
- Serving bowls
- Serving utensils
- Sneeze guards
- Buffet risers/displays

### 5. Beverage Service
- Coffee urns (by cup count)
- Hot water dispensers (tea)
- Beverage dispensers (lemonade, etc.)
- Cream/sugar setups

### 6. Cold Service
- Ice displays
- Refrigerated cases
- Ice bins

### 7. Results Display
- Complete equipment list
- Layout suggestions
- Food safety notes
- "Get a Quote" CTA

## Technical Requirements

### Data Model

```typescript
interface CateringCalculation {
  guestCount: number;
  serviceStyle: 'buffet' | 'plated' | 'stations' | 'family_style';
  courses: number;

  buffetConfig?: {
    lines: 1 | 2;
    doubleSided: boolean;
    hotItems: number;
    coldItems: number;
    hasSaladBar: boolean;
    hasDessertStation: boolean;
  };

  beverageService: {
    coffee: boolean;
    coffeePercent?: number; // % of guests having coffee
    decaf: boolean;
    hotTea: boolean;
    icedBeverages: number; // Number of different drinks
  };

  specialNeeds?: {
    soupCourse: boolean;
    carving: boolean;
    omelette: boolean;
    pasta: boolean;
  };
}

interface CateringResult {
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
```

### Calculation Logic

```typescript
// Chafing dish calculations
const CHAFING_DISH_SERVINGS = {
  full: 40,      // Full-size chafing dish (8 qt)
  half: 20,      // Half-size (4 qt)
  round: 25,     // Round chafing dish (4-6 qt)
};

// Coffee urn sizing
const COFFEE_URN_SERVINGS = {
  '36cup': 36,   // ~36 6oz cups
  '55cup': 55,
  '100cup': 100,
};

// Serving utensils per item
const UTENSILS_PER_ITEM = {
  hot: 1,        // Serving spoon/fork per hot item
  cold: 1,       // Tongs/fork per cold item
  salad: 2,      // Tongs + large spoon
};

function calculateCateringEquipment(input: CateringCalculation): CateringResult {
  const { guestCount, buffetConfig, beverageService } = input;

  // Chafing dishes: 1 per 40 guests per hot item
  const chafingPerItem = Math.ceil(guestCount / CHAFING_DISH_SERVINGS.full);
  const totalChafing = chafingPerItem * (buffetConfig?.hotItems || 3);

  // Coffee: assume 60% of guests have coffee, average 1.5 cups each
  const coffeeDrinkers = guestCount * (beverageService.coffeePercent || 60) / 100;
  const totalCups = Math.ceil(coffeeDrinkers * 1.5);
  const coffeeUrns = calculateCoffeeUrns(totalCups);

  // Serving utensils
  const utensils = [
    { type: 'serving spoon', quantity: buffetConfig?.hotItems || 3 },
    { type: 'serving fork', quantity: buffetConfig?.hotItems || 3 },
    { type: 'tongs', quantity: (buffetConfig?.coldItems || 2) + 2 },
    { type: 'salad servers', quantity: buffetConfig?.hasSaladBar ? 3 : 0 },
    { type: 'cake server', quantity: buffetConfig?.hasDessertStation ? 1 : 0 },
  ];

  // Sterno: 2 per chafing dish, 3-hour burn time, plan for full event
  const sternoCans = totalChafing * 4; // 2 sets of 2 for typical 4-5 hour event

  return {
    warmingEquipment: {
      chafingDishes: [{ size: 'full (8qt)', quantity: totalChafing }],
      sternoCans,
      heatLamps: input.specialNeeds?.carving ? 2 : 0,
      warmingCabinets: guestCount > 150 ? 1 : 0,
      soupKettles: input.specialNeeds?.soupCourse ? Math.ceil(guestCount / 50) : 0,
    },
    servingEquipment: {
      platters: [
        { size: 'large (18")', quantity: Math.ceil((buffetConfig?.coldItems || 2) / 2) },
        { size: 'medium (14")', quantity: buffetConfig?.coldItems || 2 },
      ],
      bowls: [
        { size: 'large serving', quantity: buffetConfig?.hasSaladBar ? 3 : 1 },
      ],
      utensils: utensils.filter(u => u.quantity > 0),
      sneezeGuards: buffetConfig?.lines || 1,
      risers: Math.ceil((buffetConfig?.hotItems + buffetConfig?.coldItems) / 4),
    },
    beverageEquipment: {
      coffeeUrns,
      hotWaterDispensers: beverageService.hotTea ? 1 : 0,
      beverageDispensers: beverageService.icedBeverages,
      creamSugarSets: Math.ceil(guestCount / 50),
    },
    coldEquipment: {
      iceBins: Math.ceil(guestCount / 100),
      iceDisplays: buffetConfig?.coldItems > 3 ? 1 : 0,
    },
    disposables: {
      sternoRefills: sternoCans,
      servingGloves: Math.ceil(guestCount / 25) * 2, // 2 per box
    },
  };
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🍽️ Catering Equipment Calculator              [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EVENT BASICS                                               │
│  Guests: [  150  ]                                          │
│                                                             │
│  Service Style:                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Buffet │ │ Plated │ │Stations│ │ Family │              │
│  │   🍛   │ │   🍽️   │ │   🥘   │ │ Style  │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│      ●          ○          ○          ○                    │
│                                                             │
│  BUFFET CONFIGURATION                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ How many buffet lines?  ○ One   ● Two              │   │
│  │ Double-sided?           ○ Yes   ● No               │   │
│  │                                                      │   │
│  │ Hot food items:    [-] 4 [+]                        │   │
│  │ Cold food items:   [-] 3 [+]                        │   │
│  │ ☑ Salad bar                                         │   │
│  │ ☑ Dessert station                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SPECIALTY STATIONS                                         │
│  ☐ Soup course      ☐ Carving station                      │
│  ☐ Omelette station ☐ Pasta station                        │
│                                                             │
│  BEVERAGE SERVICE                                           │
│  ☑ Coffee service (regular)    Expected: [60]% of guests   │
│  ☑ Decaf coffee                                            │
│  ☑ Hot tea                                                 │
│  Iced beverages (lemonade, etc.): [-] 2 [+]                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  EQUIPMENT LIST                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  FOOD WARMING                    SERVING EQUIPMENT          │
│  ├─ 4x Full Chafing Dishes       ├─ 2x Large Platters (18")│
│  ├─ 16x Sterno Cans              ├─ 3x Medium Platters      │
│  └─ 1x Sneeze Guard              ├─ 3x Large Serving Bowls  │
│                                   ├─ 4x Serving Spoons      │
│  BEVERAGE EQUIPMENT              ├─ 4x Serving Forks        │
│  ├─ 1x 100-Cup Coffee Urn        ├─ 5x Tongs                │
│  ├─ 1x 55-Cup Coffee Urn (decaf) ├─ 1x Salad Server Set     │
│  ├─ 1x Hot Water Dispenser       └─ 2x Buffet Risers        │
│  ├─ 2x Beverage Dispensers                                  │
│  └─ 3x Cream & Sugar Sets        COLD SERVICE               │
│                                   ├─ 2x Ice Bins            │
│                                   └─ 1x Ice Display         │
│                                                             │
│  ⚠️ Food Safety Reminders:                                  │
│  • Replace sterno cans every 2-3 hours                     │
│  • Keep hot foods above 140°F, cold foods below 40°F       │
│  • Use separate utensils for each food item                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     📧  Get a Quote for Catering Equipment          │   │
│  │     [        Enter your email        ] [Get Quote]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 2,000+ |
| Calculator completions | 60% of starts |
| Email capture rate | 25% (higher B2B intent) |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation logic | 1.5 days | Week 1 |
| UI/UX implementation | 2 days | Week 1 |
| Embed system | 0.5 day | Week 1 |
| Testing & polish | 1 day | Week 2 |
| **Total** | **5 days** | **1.5 weeks** |

## Future Enhancements

1. **Menu upload:** Parse menu to suggest equipment
2. **Caterer directory:** Connect to local caterers
3. **Food quantity calculator:** How much food to prepare
4. **Timeline builder:** When to set up each station
5. **Layout designer:** Visual buffet arrangement tool
