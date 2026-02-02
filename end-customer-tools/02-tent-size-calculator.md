# Tent Size Calculator

## Overview

An embeddable widget that helps event planners determine the right tent size based on guest count, event style, and what needs to fit under the tent.

## Problem Statement

Tent sizing is one of the most confusing aspects of outdoor event planning:
- Square footage requirements vary dramatically by event style
- People forget to account for dance floors, bars, buffets
- Weather contingencies affect sizing decisions
- Tent shapes (pole vs frame vs sailcloth) have different effective spaces
- Over-sizing is expensive, under-sizing is disastrous

## Target Audience

- **Primary:** Individuals planning outdoor weddings, parties, corporate events
- **Secondary:** Event planners coordinating outdoor venues
- **Tertiary:** Venues with outdoor spaces

## SEO Opportunity

High-volume search queries:
- "what size tent for 100 guests" - 2,900 monthly searches
- "tent size calculator" - 1,900 monthly searches
- "how big of a tent do I need" - 1,300 monthly searches
- "wedding tent size guide" - 700 monthly searches
- "party tent calculator" - 600 monthly searches

## Key Features

### 1. Guest Count Input
- Total guest count
- Standing vs seated breakdown (for cocktail hours)

### 2. Event Style Selection
- **Ceremony only:** Rows of chairs, aisle
- **Reception - seated dinner:** Tables, chairs, head table
- **Reception - buffet:** Same seating + food station space
- **Cocktail party:** Standing with some seating
- **Ceremony + Reception:** Full setup
- **Corporate/Trade show:** Booth spaces

### 3. What's Under the Tent?

Interactive checklist with size implications:

| Element | Square Footage |
|---------|----------------|
| Dance floor | 4 sq ft per dancer (calculate from guest %) |
| Bar station | 100-150 sq ft each |
| Buffet station | 100-200 sq ft each |
| DJ/Band stage | 100-300 sq ft |
| Photo booth | 64-100 sq ft |
| Cake table | 25 sq ft |
| Gift table | 25 sq ft |
| Lounge area | 150-300 sq ft |
| Catering prep | 100-200 sq ft |

### 4. Tent Style Comparison
Show results for different tent types:
- **Frame tent:** Most usable space, no center poles
- **Pole tent:** Classic look, center poles reduce usable area
- **Sailcloth tent:** Premium aesthetic, some pole interference
- **Clear span:** Large events, maximum flexibility

### 5. Weather Considerations
- Open sides vs enclosed
- Climate control (heating/AC) space requirements
- Rain gutters and drainage considerations

### 6. Results Display
- Recommended tent size(s) with dimensions
- Visual layout showing what fits where
- Alternative options (slightly smaller/larger)
- Important considerations and tips
- "Get a Quote" CTA

## User Stories

```
As someone planning an outdoor wedding,
I want to know what size tent I need for 150 guests with dinner and dancing,
So that I can budget appropriately and ensure everyone is comfortable.

As an event planner,
I want to quickly compare tent sizes and types,
So that I can give my client accurate recommendations.

As a rental company customer,
I want to understand why a certain tent size is recommended,
So that I feel confident in my rental decision.
```

## Technical Requirements

### Data Model

```typescript
interface TentCalculation {
  // Inputs
  guestCount: number;
  eventStyle: EventStyle;

  elements: {
    danceFloor: boolean;
    danceFloorPercentage?: number; // % of guests expected to dance
    barStations: number;
    buffetStations: number;
    djBand: 'dj' | 'small_band' | 'large_band' | 'none';
    photoBooth: boolean;
    cakeTable: boolean;
    giftTable: boolean;
    loungeArea: 'none' | 'small' | 'medium' | 'large';
    cateringPrep: boolean;
  };

  tentPreferences: {
    style?: TentStyle;
    enclosed: boolean;
    climateControl: boolean;
  };

  // Outputs
  results: {
    recommendedSize: TentSize;
    alternativeSizes: TentSize[];
    squareFootageBreakdown: SquareFootageBreakdown;
    layoutDiagram: LayoutData;
    tips: string[];
    warnings: string[];
  };
}

type EventStyle =
  | 'ceremony_only'
  | 'reception_seated'
  | 'reception_buffet'
  | 'cocktail'
  | 'ceremony_and_reception'
  | 'corporate';

type TentStyle = 'frame' | 'pole' | 'sailcloth' | 'clear_span';

interface TentSize {
  width: number;
  length: number;
  totalSqFt: number;
  usableSqFt: number;
  style: TentStyle;
  fits: boolean;
  snugness: 'comfortable' | 'adequate' | 'tight';
}

interface SquareFootageBreakdown {
  seating: number;
  danceFloor: number;
  bars: number;
  buffet: number;
  entertainment: number;
  other: number;
  circulation: number; // 15-20% for walkways
  total: number;
}
```

### Calculation Logic

```typescript
const SQUARE_FEET_PER_PERSON = {
  ceremony_only: 8,        // Rows of chairs
  reception_seated: 15,    // Tables with chairs
  reception_buffet: 15,    // Same seating
  cocktail: 10,           // Standing/mingling
  ceremony_and_reception: 15,
  corporate: 12
};

const ELEMENT_SQUARE_FOOTAGE = {
  danceFloor: (guests: number, percentage: number) =>
    Math.ceil(guests * (percentage / 100)) * 4.5, // 4.5 sq ft per dancer
  barStation: 125,
  buffetStation: 150,
  dj: 100,
  smallBand: 200,
  largeBand: 350,
  photoBooth: 80,
  cakeTable: 30,
  giftTable: 30,
  loungeSmall: 150,
  loungeMedium: 250,
  loungeLarge: 400,
  cateringPrep: 150
};

const STANDARD_TENT_SIZES = [
  { width: 20, length: 20, sqFt: 400 },
  { width: 20, length: 30, sqFt: 600 },
  { width: 20, length: 40, sqFt: 800 },
  { width: 30, length: 30, sqFt: 900 },
  { width: 30, length: 45, sqFt: 1350 },
  { width: 30, length: 60, sqFt: 1800 },
  { width: 40, length: 40, sqFt: 1600 },
  { width: 40, length: 60, sqFt: 2400 },
  { width: 40, length: 80, sqFt: 3200 },
  { width: 40, length: 100, sqFt: 4000 },
  { width: 60, length: 60, sqFt: 3600 },
  { width: 60, length: 90, sqFt: 5400 },
  { width: 60, length: 120, sqFt: 7200 },
  // ... more sizes
];

function calculateTentSize(input: TentCalculation): TentResult {
  // Calculate base seating area
  let totalSqFt = input.guestCount * SQUARE_FEET_PER_PERSON[input.eventStyle];

  // Add elements
  if (input.elements.danceFloor) {
    totalSqFt += ELEMENT_SQUARE_FOOTAGE.danceFloor(
      input.guestCount,
      input.elements.danceFloorPercentage || 50
    );
  }

  totalSqFt += input.elements.barStations * ELEMENT_SQUARE_FOOTAGE.barStation;
  totalSqFt += input.elements.buffetStations * ELEMENT_SQUARE_FOOTAGE.buffetStation;
  // ... other elements

  // Add circulation space (15-20%)
  totalSqFt *= 1.18;

  // Find best fitting tent
  const recommendations = STANDARD_TENT_SIZES
    .map(tent => ({
      ...tent,
      fits: tent.sqFt >= totalSqFt,
      snugness: calculateSnugness(tent.sqFt, totalSqFt)
    }))
    .filter(tent => tent.fits)
    .slice(0, 3);

  return {
    recommendedSize: recommendations[0],
    alternativeSizes: recommendations.slice(1),
    squareFootageBreakdown: breakdown,
    tips: generateTips(input),
    warnings: generateWarnings(input, recommendations[0])
  };
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ⛺ Tent Size Calculator                       [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP 1: Guest Count                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [  150  ] guests                                    │   │
│  │                                                      │   │
│  │  ○──────────●──────────○                            │   │
│  │  50       150        300                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  STEP 2: Event Style                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │   🍽️   │ │   🍴   │ │   🥂   │ │   💒   │              │
│  │ Seated │ │ Buffet │ │Cocktail│ │Ceremony│              │
│  │ Dinner │ │        │ │        │ │  Only  │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                             │
│  STEP 3: What's Under the Tent?                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Dance Floor        How much dancing?              │   │
│  │                      ○ Light  ● Moderate  ○ Heavy   │   │
│  │                                                      │   │
│  │ ☑ Bar    How many?  [-] 2 [+]                       │   │
│  │ ☑ Buffet How many?  [-] 1 [+]                       │   │
│  │ ☑ DJ/Band           ○ DJ  ○ Small Band  ○ Big Band │   │
│  │ ☐ Photo Booth                                       │   │
│  │ ☑ Cake & Gift Tables                                │   │
│  │ ☐ Lounge Area       ○ Small  ○ Medium  ○ Large     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  YOUR RECOMMENDED TENT SIZE                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │     ⛺ 40' x 80' Frame Tent                         │  │
│  │        3,200 square feet                            │  │
│  │                                                      │  │
│  │    ┌────────────────────────────────────┐          │  │
│  │    │  ┌─────┐                 ┌─────┐   │          │  │
│  │    │  │ Bar │   ○ ○ ○ ○      │ DJ  │   │          │  │
│  │    │  └─────┘   ○ ○ ○ ○      └─────┘   │          │  │
│  │    │            ○ ○ ○ ○                 │          │  │
│  │    │  ┌──────────────────┐             │          │  │
│  │    │  │   Dance Floor    │   ○ ○ ○ ○  │          │  │
│  │    │  │                  │   ○ ○ ○ ○  │          │  │
│  │    │  └──────────────────┘             │          │  │
│  │    │                        ┌───────┐  │          │  │
│  │    │  ○ ○ ○ ○   ○ ○ ○ ○   │Buffet │  │          │  │
│  │    │  ○ ○ ○ ○   ○ ○ ○ ○   └───────┘  │          │  │
│  │    └────────────────────────────────────┘          │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Space Breakdown:                                           │
│  ├─ Seating (19 tables)     2,100 sq ft  ████████████░░░  │
│  ├─ Dance Floor               450 sq ft  ███░░░░░░░░░░░░  │
│  ├─ Bars (2)                  250 sq ft  ██░░░░░░░░░░░░░  │
│  ├─ Buffet                    150 sq ft  █░░░░░░░░░░░░░░  │
│  ├─ DJ Setup                  100 sq ft  █░░░░░░░░░░░░░░  │
│  └─ Circulation               400 sq ft  ███░░░░░░░░░░░░  │
│      TOTAL NEEDED:          3,050 sq ft                    │
│      TENT PROVIDES:         3,200 sq ft  ✓ 5% buffer      │
│                                                             │
│  Alternative Options:                                       │
│  • 30' x 90' (2,700 sq ft) - Would be tight               │
│  • 40' x 100' (4,000 sq ft) - More breathing room         │
│                                                             │
│  💡 Tips:                                                   │
│  • Frame tents have no center poles - easier layout        │
│  • Consider a 30x30 cocktail tent for ceremony            │
│  • Add sidewalls if weather is a concern (+$XX)           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     📧  Get a Quote for This Tent Setup             │   │
│  │     [        Enter your email        ] [Get Quote]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Analytics & Tracking

```typescript
analytics.track('tent_calculator_started');
analytics.track('tent_calculator_completed', {
  guestCount: 150,
  eventStyle: 'reception_seated',
  recommendedSize: '40x80',
  squareFootageNeeded: 3050,
  elementsSelected: ['danceFloor', 'bar', 'buffet', 'dj']
});
analytics.track('tent_quote_requested', {
  email: 'user@example.com',
  tentSize: '40x80',
  // ...
});
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 6,000+ |
| Calculator completions | 55% of starts |
| Email capture rate | 18% of completions |
| Time on calculator | 3+ minutes |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation logic | 2 days | Week 1 |
| UI/UX with visual diagram | 4 days | Week 1-2 |
| Tent layout visualization | 3 days | Week 2 |
| Embed system | 1 day | Week 3 |
| Testing & polish | 2 days | Week 3 |
| **Total** | **12 days** | **3 weeks** |

## Future Enhancements

1. **3D tent visualization:** Rotate and explore tent layout
2. **Weather integration:** Suggest sidewalls based on forecast
3. **Venue overlay:** Upload venue photo, overlay tent
4. **Multi-tent configurations:** Connect multiple tents
5. **Real-time pricing:** Show estimated costs
6. **Save configurations:** Return to saved layouts
