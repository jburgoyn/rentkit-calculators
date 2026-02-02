# Dance Floor Calculator

## Overview

An embeddable widget that calculates the ideal dance floor size based on guest count, expected dancing participation, and dance style.

## Problem Statement

Dance floor sizing is often guessed, leading to:
- Too small: Crowded, uncomfortable, people leave early
- Too large: Looks empty, wasted rental cost
- Wrong shape: Doesn't fit venue layout
- Forgotten: No allowance made in tent/venue planning

## Target Audience

- **Primary:** Wedding planners and couples
- **Secondary:** Corporate event planners
- **Tertiary:** Party hosts

## SEO Opportunity

- "dance floor size calculator" - 1,400 monthly searches
- "how big should dance floor be" - 800 monthly searches
- "dance floor for 100 guests" - 500 monthly searches
- "wedding dance floor size" - 600 monthly searches

## Key Features

### 1. Guest Count Input
- Total guest count
- Estimated dancers (or percentage slider)

### 2. Event Type
- Wedding reception
- Corporate party
- Birthday/anniversary
- Nightclub-style event
- School dance/prom

### 3. Dancing Style
- Light dancing (background music)
- Moderate (some dancing, mostly socializing)
- Heavy dancing (dance party focus)
- Line dancing (needs more space)
- Swing/ballroom (couples need more room)

### 4. Time of Event
- Daytime (less dancing typically)
- Evening (more dancing)
- Late night (peak dancing)

### 5. Dance Floor Options
- Show multiple size options with pros/cons
- Standard sizes available from rental companies
- Shape options (square, rectangle, custom)

### 6. Results Display
- Recommended size with dimensions
- Square footage calculation
- Visual representation
- Alternative sizes
- Integration with tent calculator

## Technical Requirements

### Data Model

```typescript
interface DanceFloorCalculation {
  guestCount: number;
  dancerPercentage: number; // Or calculated from factors

  eventType: 'wedding' | 'corporate' | 'birthday' | 'nightclub' | 'school';
  dancingStyle: 'light' | 'moderate' | 'heavy' | 'line_dancing' | 'ballroom';
  timeOfEvent: 'daytime' | 'evening' | 'late_night';

  venueConstraints?: {
    maxWidth: number;
    maxLength: number;
    shape: 'any' | 'square' | 'rectangle';
  };
}

interface DanceFloorResult {
  expectedDancers: number;
  recommendedSqFt: number;
  recommendedSize: {
    width: number;
    length: number;
    sqFt: number;
    panels: number; // Standard 3x3 or 4x4 panels
  };
  alternatives: {
    smaller: DanceFloorSize;
    larger: DanceFloorSize;
  };
  densityDescription: string;
  tips: string[];
}
```

### Calculation Logic

```typescript
// Square feet per dancer by style
const SQ_FT_PER_DANCER = {
  light: 4.5,        // Casual swaying
  moderate: 5,       // Standard dancing
  heavy: 6,          // Energetic dancing
  line_dancing: 6,   // Need formation space
  ballroom: 9        // Couples moving around floor
};

// Percentage likely to dance by event type and time
const DANCER_PERCENTAGE = {
  wedding: { daytime: 30, evening: 50, late_night: 60 },
  corporate: { daytime: 20, evening: 35, late_night: 40 },
  birthday: { daytime: 25, evening: 45, late_night: 55 },
  nightclub: { daytime: 50, evening: 70, late_night: 80 },
  school: { daytime: 40, evening: 60, late_night: 70 }
};

// Standard dance floor panel sizes
const PANEL_SIZES = {
  small: { width: 3, length: 3, sqFt: 9 },    // 3x3 ft
  large: { width: 4, length: 4, sqFt: 16 }    // 4x4 ft
};

// Common rental sizes (in 3x3 panels)
const STANDARD_SIZES = [
  { width: 12, length: 12, sqFt: 144, panels: 16 },
  { width: 12, length: 15, sqFt: 180, panels: 20 },
  { width: 15, length: 15, sqFt: 225, panels: 25 },
  { width: 15, length: 18, sqFt: 270, panels: 30 },
  { width: 18, length: 18, sqFt: 324, panels: 36 },
  { width: 18, length: 21, sqFt: 378, panels: 42 },
  { width: 21, length: 21, sqFt: 441, panels: 49 },
  { width: 21, length: 24, sqFt: 504, panels: 56 },
  { width: 24, length: 24, sqFt: 576, panels: 64 },
  // ... larger sizes
];

function calculateDanceFloor(input: DanceFloorCalculation): DanceFloorResult {
  // Calculate expected dancers
  let dancerPct = input.dancerPercentage;
  if (!dancerPct) {
    dancerPct = DANCER_PERCENTAGE[input.eventType][input.timeOfEvent];
  }
  const expectedDancers = Math.ceil(input.guestCount * (dancerPct / 100));

  // Calculate square footage needed
  const sqFtPerDancer = SQ_FT_PER_DANCER[input.dancingStyle];
  const recommendedSqFt = expectedDancers * sqFtPerDancer;

  // Find best matching standard size
  const recommendedSize = STANDARD_SIZES.find(size =>
    size.sqFt >= recommendedSqFt &&
    (!input.venueConstraints || (
      size.width <= input.venueConstraints.maxWidth &&
      size.length <= input.venueConstraints.maxLength
    ))
  ) || STANDARD_SIZES[STANDARD_SIZES.length - 1];

  // Get alternatives
  const sizeIndex = STANDARD_SIZES.indexOf(recommendedSize);
  const smaller = STANDARD_SIZES[Math.max(0, sizeIndex - 1)];
  const larger = STANDARD_SIZES[Math.min(STANDARD_SIZES.length - 1, sizeIndex + 1)];

  return {
    expectedDancers,
    recommendedSqFt,
    recommendedSize,
    alternatives: { smaller, larger },
    densityDescription: getDensityDescription(recommendedSize.sqFt / expectedDancers),
    tips: generateTips(input, recommendedSize)
  };
}

function getDensityDescription(sqFtPerPerson: number): string {
  if (sqFtPerPerson >= 8) return "Spacious - room for couples to move freely";
  if (sqFtPerPerson >= 6) return "Comfortable - good flow without bumping";
  if (sqFtPerPerson >= 4.5) return "Cozy - energetic feel, some contact";
  return "Crowded - nightclub atmosphere";
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  💃 Dance Floor Calculator                     [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOW MANY GUESTS?                                           │
│  [    150    ] guests                                       │
│                                                             │
│  WHAT TYPE OF EVENT?                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │   💒   │ │   🏢   │ │   🎂   │ │   🎵   │ │   🎓   │   │
│  │Wedding │ │Corpora-│ │Birthday│ │  Club  │ │ School │   │
│  │        │ │   te   │ │        │ │  Night │ │  Dance │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│      ●          ○          ○          ○          ○         │
│                                                             │
│  HOW MUCH DANCING DO YOU EXPECT?                           │
│                                                             │
│  Light ○────────────●────────────○ Heavy                   │
│         Background    Dance        Everyone on             │
│         music         party        the floor               │
│                                                             │
│  WHAT TIME IS YOUR EVENT?                                   │
│  ○ Daytime    ● Evening    ○ Late Night                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │   Expected dancers: ~75 people (50% of guests)        │ │
│  │                                                       │ │
│  │   ┌─────────────────────────────┐                    │ │
│  │   │    🕺  💃  🕺  💃  🕺      │                    │ │
│  │   │  💃  🕺  💃  🕺  💃  🕺   │   18' x 18'        │ │
│  │   │    🕺  💃  🕺  💃  🕺      │   324 sq ft        │ │
│  │   │  💃  🕺  💃  🕺  💃  🕺   │   36 panels        │ │
│  │   │    🕺  💃  🕺  💃  🕺      │                    │ │
│  │   └─────────────────────────────┘                    │ │
│  │                                                       │ │
│  │   💡 "Comfortable spacing - good flow without         │ │
│  │       bumping into others"                            │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  RECOMMENDED: 18' x 18' Dance Floor                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  • 324 square feet (36 panels of 3'x3')                    │
│  • 4.3 sq ft per dancer - comfortable spacing              │
│  • Fits 75 dancers at peak times                           │
│                                                             │
│  ALTERNATIVES:                                              │
│  ┌─────────────────┐     ┌─────────────────┐              │
│  │   15' x 18'     │     │   18' x 21'     │              │
│  │   270 sq ft     │     │   378 sq ft     │              │
│  │   Cozy but ok   │     │   More spacious │              │
│  │   Save ~$XX     │     │   Add ~$XX      │              │
│  └─────────────────┘     └─────────────────┘              │
│                                                             │
│  💡 Tips:                                                   │
│  • Place dance floor near DJ/band for best energy          │
│  • Consider adding LED lighting under the floor            │
│  • Evening weddings typically see 50-60% of guests dance   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     📧  Get a Quote for Your Dance Floor            │   │
│  │     [        Enter your email        ] [Get Quote]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 3,500+ |
| Calculator completions | 70% of starts |
| Email capture rate | 15% |
| Tent calculator cross-link | 25% |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation logic | 1 day | Week 1 |
| UI/UX with visualization | 2 days | Week 1 |
| Embed system | 0.5 day | Week 1 |
| Testing & polish | 0.5 day | Week 1 |
| **Total** | **4 days** | **1 week** |

## Future Enhancements

1. **Venue integration:** Show floor fitting in venue dimensions
2. **LED floor options:** Show lighting upgrade costs
3. **Surface options:** Wood, vinyl, LED, parquet comparisons
4. **Animation:** Show crowd density at different floor sizes
5. **Music integration:** Recommend floor size by playlist style
