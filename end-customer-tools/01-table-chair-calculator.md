# Table & Chair Calculator

## Overview

An embeddable widget that helps event planners determine exactly how many tables and chairs they need based on their guest count, event style, and table preferences.

## Problem Statement

Event planners frequently struggle to calculate the right number of tables and chairs for their events. Common pain points:
- Different table shapes seat different numbers
- Meal style (seated dinner vs. cocktail) affects spacing
- Head tables, sweetheart tables, and vendor tables are often forgotten
- Over-ordering wastes money, under-ordering creates last-minute panic

## Target Audience

- **Primary:** Individuals planning weddings, corporate events, parties
- **Secondary:** Event planners and coordinators
- **Tertiary:** Venues recommending rental companies

## SEO Opportunity

High-volume search queries:
- "how many tables for 100 guests" - 2,400 monthly searches
- "table and chair calculator" - 1,600 monthly searches
- "how many chairs per table" - 1,200 monthly searches
- "wedding table calculator" - 800 monthly searches

## Key Features

### 1. Guest Count Input
- Total guest count
- Breakdown by category (optional):
  - Adults
  - Children (may need smaller chairs)
  - Vendors/staff who need seating

### 2. Event Style Selection
- Seated dinner (more space per person)
- Buffet (same seating, separate food stations)
- Cocktail/standing (30-50% seating)
- Ceremony only (rows)
- Mixed (ceremony + reception)

### 3. Table Type Configuration
- **Round tables:**
  - 48" round (seats 4-6)
  - 60" round (seats 8-10)
  - 72" round (seats 10-12)
- **Rectangular/banquet:**
  - 6ft banquet (seats 6-8)
  - 8ft banquet (seats 8-10)
- **Square tables:**
  - 36" square (seats 4)
  - 48" square (seats 4-8)
- **Specialty:**
  - Cocktail/highboy (standing, 2-4)
  - Sweetheart table (2)
  - Farm/harvest table (8-12)

### 4. Additional Table Needs
- [ ] Head table (bridal party) - input number of seats
- [ ] Sweetheart table
- [ ] Gift table
- [ ] Sign-in/guest book table
- [ ] Cake table
- [ ] DJ/band table
- [ ] Photo booth area
- [ ] Food stations (input count)
- [ ] Bar stations (input count)

### 5. Chair Style Selection
- Folding chairs
- Chiavari chairs
- Cross-back chairs
- Ghost chairs
- Padded banquet chairs
- (Informational - doesn't change count, but helps with quote)

### 6. Results Display
- Total tables by type
- Total chairs
- Visual diagram showing layout concept
- Square footage estimate needed
- "Get a Quote" CTA with pre-filled quantities

## User Stories

```
As an event planner,
I want to input my guest count and event style,
So that I know exactly how many tables and chairs to rent.

As a bride planning my wedding,
I want to see different table layout options,
So that I can decide between round tables and long farm tables.

As a rental company customer,
I want to send my calculations to get a quote,
So that I don't have to re-enter all the information.

As a venue coordinator,
I want to embed this calculator on our website,
So that clients can plan before contacting our preferred vendors.
```

## Technical Requirements

### Data Model

```typescript
interface TableChairCalculation {
  // Inputs
  guestCount: number;
  childCount?: number;
  vendorCount?: number;
  eventStyle: 'seated_dinner' | 'buffet' | 'cocktail' | 'ceremony' | 'mixed';

  tablePreferences: {
    primary: TableType;
    allowMixed: boolean;
    preferredSeatsPerTable?: number;
  };

  additionalTables: {
    headTable?: { seats: number };
    sweetheartTable?: boolean;
    giftTable?: boolean;
    signInTable?: boolean;
    cakeTable?: boolean;
    djTable?: boolean;
    photoBoothTable?: boolean;
    foodStations?: number;
    barStations?: number;
  };

  chairStyle?: ChairType;

  // Outputs
  results: {
    tables: {
      type: TableType;
      quantity: number;
      seatsPerTable: number;
    }[];
    totalTables: number;
    totalChairs: number;
    estimatedSquareFootage: number;
    notes: string[];
  };
}

type TableType =
  | 'round_48' | 'round_60' | 'round_72'
  | 'banquet_6ft' | 'banquet_8ft'
  | 'square_36' | 'square_48'
  | 'cocktail' | 'sweetheart' | 'farm';

type ChairType =
  | 'folding' | 'chiavari' | 'crossback'
  | 'ghost' | 'banquet_padded';
```

### Calculation Logic

```typescript
function calculateTablesAndChairs(input: CalculatorInput): CalculatorResult {
  const { guestCount, eventStyle, tablePreferences, additionalTables } = input;

  // Adjust for event style
  let seatedGuests = guestCount;
  if (eventStyle === 'cocktail') {
    seatedGuests = Math.ceil(guestCount * 0.4); // 40% seating for cocktail
  }

  // Get seats per table based on preference
  const seatsPerTable = TABLE_CAPACITY[tablePreferences.primary];

  // Calculate guest tables
  const guestTables = Math.ceil(seatedGuests / seatsPerTable);

  // Calculate additional tables
  let additionalTableCount = 0;
  let additionalChairs = 0;

  if (additionalTables.headTable) {
    additionalTableCount += Math.ceil(additionalTables.headTable.seats / 8);
    additionalChairs += additionalTables.headTable.seats;
  }
  // ... other additional tables

  // Calculate total chairs
  const guestChairs = eventStyle === 'cocktail'
    ? seatedGuests
    : guestCount; // Always have a chair for each guest at seated events

  return {
    tables: [
      { type: tablePreferences.primary, quantity: guestTables, seatsPerTable }
    ],
    totalTables: guestTables + additionalTableCount,
    totalChairs: guestChairs + additionalChairs,
    estimatedSquareFootage: calculateSquareFootage(guestTables, tablePreferences.primary),
    notes: generateNotes(input)
  };
}

const TABLE_CAPACITY = {
  'round_48': 6,
  'round_60': 8,
  'round_72': 10,
  'banquet_6ft': 6,
  'banquet_8ft': 8,
  'square_36': 4,
  'square_48': 8,
  'cocktail': 0, // Standing
  'sweetheart': 2,
  'farm': 10
};

const TABLE_SQUARE_FOOTAGE = {
  'round_48': 64,   // 8x8 with chairs
  'round_60': 100,  // 10x10 with chairs
  'round_72': 144,  // 12x12 with chairs
  'banquet_6ft': 80,
  'banquet_8ft': 100,
  // ...
};
```

### Embed Implementation

```html
<!-- Embed code for rental company websites -->
<div
  id="rentkit-table-calculator"
  data-org-id="abc123"
  data-theme="light"
  data-primary-color="#1976d2"
  data-show-pricing="false"
  data-cta-text="Get Your Quote"
  data-cta-url="https://rentals.example.com/quote"
></div>
<script src="https://widgets.rentkit.com/table-calculator.js" async></script>
```

### API Endpoints

```typescript
// Save calculation for lead capture
POST /api/widgets/calculations
{
  orgId: string;
  calculatorType: 'table-chair';
  inputs: CalculatorInput;
  results: CalculatorResult;
  contact?: {
    email: string;
    name?: string;
    eventDate?: string;
  };
}

// Get org-specific configuration
GET /api/widgets/config/:orgId
{
  branding: { primaryColor, logo };
  inventory: { availableTableTypes, availableChairTypes };
  pricing: { showPrices: boolean, priceList?: PriceList };
}
```

## UI/UX Design

### Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│  🪑 Table & Chair Calculator                    [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  How many guests?                          ┌─────────────┐  │
│  [    150    ] guests                      │             │  │
│                                            │   Visual    │  │
│  What type of event?                       │   Preview   │  │
│  ○ Seated Dinner  ○ Buffet                │   (tables   │  │
│  ○ Cocktail       ○ Ceremony              │   layout)   │  │
│                                            │             │  │
│  Preferred table style?                    │             │  │
│  ┌─────┐ ┌─────┐ ┌─────┐                  └─────────────┘  │
│  │ 60" │ │ 8ft │ │Farm │                                   │
│  │Round│ │Rect │ │Table│  ← visual selection               │
│  └─────┘ └─────┘ └─────┘                                   │
│                                                             │
│  Additional needs?                                          │
│  ☑ Head table (12 seats)    ☐ Gift table                   │
│  ☑ Sweetheart table         ☐ Cake table                   │
│  ☑ DJ table                 ☐ Sign-in table                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  YOUR RESULTS                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  🪑 19 Round Tables (60")      💺 152 Chiavari Chairs       │
│  📐 2 Banquet Tables (8ft)     📏 ~2,400 sq ft needed       │
│                                                             │
│  Breakdown:                                                 │
│  • 17 guest tables (8 per table = 136 seats)               │
│  • 1 head table (12 seats)                                 │
│  • 1 sweetheart table (2 seats)                            │
│  • 1 DJ table, 1 gift table                                │
│                                                             │
│  💡 Tip: We recommend 1-2 extra chairs for late additions  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     📧  Get an Instant Quote for These Items        │   │
│  │     [        Enter your email        ] [Get Quote]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout
- Single column, stepped wizard format
- Large touch targets for table selection
- Sticky results bar at bottom
- Full-screen quote modal

## Analytics & Tracking

```typescript
// Events to track
analytics.track('calculator_started', { type: 'table-chair' });
analytics.track('calculator_completed', {
  type: 'table-chair',
  guestCount: 150,
  tableType: 'round_60',
  eventStyle: 'seated_dinner',
  totalTables: 19,
  totalChairs: 152
});
analytics.track('quote_requested', {
  type: 'table-chair',
  email: 'user@example.com',
  // ...calculation data
});
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly organic visitors | 5,000+ | Google Analytics |
| Calculator completions | 60% of starts | Event tracking |
| Email capture rate | 15% of completions | Form submissions |
| Quote requests | 500/month | CRM tracking |
| Time on calculator | 2+ minutes | Analytics |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculator logic | 2 days | Week 1 |
| UI/UX implementation | 3 days | Week 1-2 |
| Embed system | 2 days | Week 2 |
| Lead capture integration | 1 day | Week 2 |
| Testing & polish | 2 days | Week 3 |
| **Total** | **10 days** | **3 weeks** |

## Future Enhancements

1. **AI-powered suggestions:** "Based on your wedding, most couples choose..."
2. **Floor plan export:** Download PDF layout
3. **Venue integration:** Pre-loaded venue dimensions
4. **Real-time availability:** Show if items are available for selected date
5. **Price estimation:** Show approximate costs (if rental company opts in)
6. **Save & share:** Save calculations to account, share link with planning partner
