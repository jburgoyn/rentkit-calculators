# Event Budget Estimator

## Overview

An interactive tool that provides realistic budget ranges for event rentals based on event type, guest count, and quality tier—helping early-stage planners understand costs before getting quotes.

## Problem Statement

Budget anxiety is a major barrier to rental inquiries:
- People don't know what things cost
- Fear of "sticker shock" prevents initial contact
- Budgets are set without understanding rental costs
- Leads are often unqualified (budget too low)
- Comparison shopping without context is frustrating

## Target Audience

- **Primary:** Early-stage event planners setting budgets
- **Secondary:** Budget-conscious planners optimizing spend
- **Tertiary:** Parents/financiers helping plan events

## SEO Opportunity

High-volume, high-intent searches:
- "wedding rental cost" - 2,400 monthly searches
- "how much do wedding rentals cost" - 1,900 monthly searches
- "event rental prices" - 1,600 monthly searches
- "party rental budget" - 800 monthly searches
- "tent rental cost" - 3,600 monthly searches

## Key Features

### 1. Event Type Selection
- Wedding
- Corporate event
- Birthday party (milestone: 1st, 16th, 50th, etc.)
- Baby/bridal shower
- Graduation party
- Holiday party
- Backyard BBQ
- Custom

### 2. Guest Count & Basics
- Guest count slider/input
- Indoor vs outdoor
- Venue type (backyard, venue, park, etc.)
- Region/location (affects pricing)

### 3. Quality Tier Selection
- **Budget:** Basic, functional items
- **Mid-Range:** Standard quality, good selection
- **Premium:** High-end, designer items
- **Luxury:** Top-tier, unique pieces

### 4. Category-by-Category Breakdown
Show ranges for each category:
- Tables & chairs
- Linens
- Tableware
- Dance floor
- Tent (if outdoor)
- Lighting
- Decor
- Catering equipment
- Bars & beverage service

### 5. Interactive Adjustments
- Toggle categories on/off
- Adjust quality per category
- See how changes affect total

### 6. Results & Next Steps
- Total estimated range
- Breakdown by category
- "Get Accurate Quote" CTA
- Save/email estimate
- Budget planner worksheet

## Technical Requirements

### Data Model

```typescript
interface BudgetEstimate {
  eventType: EventType;
  guestCount: number;
  isOutdoor: boolean;
  venueType: VenueType;
  region: Region;
  qualityTier: QualityTier;

  categorySelections: {
    [category: string]: {
      included: boolean;
      qualityOverride?: QualityTier;
    };
  };
}

interface BudgetResult {
  totalRange: {
    low: number;
    mid: number;
    high: number;
  };
  categoryBreakdown: CategoryEstimate[];
  perPersonCost: {
    low: number;
    high: number;
  };
  tips: string[];
  comparisons: {
    national: number;
    regional: number;
  };
}

interface CategoryEstimate {
  category: string;
  description: string;
  included: boolean;
  range: {
    low: number;
    mid: number;
    high: number;
  };
  perUnit?: {
    unit: string;
    lowPrice: number;
    highPrice: number;
  };
  notes?: string;
}
```

### Pricing Data Structure

```typescript
// Pricing matrices by region and quality
const RENTAL_PRICING = {
  tables_chairs: {
    perPerson: {
      budget: { low: 3, mid: 4, high: 5 },
      midrange: { low: 5, mid: 7, high: 9 },
      premium: { low: 8, mid: 12, high: 15 },
      luxury: { low: 15, mid: 20, high: 30 }
    },
    description: "Tables, chairs, and basic setup"
  },
  linens: {
    perPerson: {
      budget: { low: 2, mid: 3, high: 4 },
      midrange: { low: 4, mid: 6, high: 8 },
      premium: { low: 8, mid: 12, high: 16 },
      luxury: { low: 15, mid: 25, high: 40 }
    },
    description: "Tablecloths, napkins, chair covers"
  },
  tableware: {
    perPerson: {
      budget: { low: 0, mid: 0, high: 0 },  // Often not rented at budget
      midrange: { low: 3, mid: 5, high: 7 },
      premium: { low: 6, mid: 10, high: 14 },
      luxury: { low: 12, mid: 20, high: 30 }
    },
    description: "Plates, glasses, flatware"
  },
  danceFloor: {
    flat: {
      budget: { low: 200, mid: 300, high: 400 },
      midrange: { low: 400, mid: 600, high: 800 },
      premium: { low: 700, mid: 1000, high: 1500 },
      luxury: { low: 1200, mid: 2000, high: 3500 }
    },
    perGuest: 0,  // Not per-person
    description: "Dance floor sized for event",
    sizeNote: "Size based on 40% of guests dancing"
  },
  tent: {
    perPerson: {
      budget: { low: 8, mid: 12, high: 16 },
      midrange: { low: 15, mid: 22, high: 30 },
      premium: { low: 25, mid: 40, high: 55 },
      luxury: { low: 50, mid: 80, high: 120 }
    },
    description: "Tent with basic setup",
    note: "Includes installation, sidewalls extra"
  },
  // ... more categories
};

// Regional multipliers
const REGIONAL_MULTIPLIERS = {
  'northeast': 1.2,
  'west_coast': 1.15,
  'midwest': 0.9,
  'south': 0.95,
  'mountain': 1.0
};

function calculateBudget(estimate: BudgetEstimate): BudgetResult {
  const multiplier = REGIONAL_MULTIPLIERS[estimate.region] || 1;
  const breakdown: CategoryEstimate[] = [];
  let totalLow = 0, totalMid = 0, totalHigh = 0;

  for (const [category, pricing] of Object.entries(RENTAL_PRICING)) {
    const selection = estimate.categorySelections[category];
    if (!selection?.included) continue;

    const tier = selection.qualityOverride || estimate.qualityTier;
    const tierPricing = pricing.perPerson?.[tier] || pricing.flat?.[tier];

    let low, mid, high;
    if (pricing.perPerson) {
      low = tierPricing.low * estimate.guestCount * multiplier;
      mid = tierPricing.mid * estimate.guestCount * multiplier;
      high = tierPricing.high * estimate.guestCount * multiplier;
    } else {
      // Flat pricing (like dance floor)
      low = tierPricing.low * multiplier;
      mid = tierPricing.mid * multiplier;
      high = tierPricing.high * multiplier;
    }

    breakdown.push({
      category,
      description: pricing.description,
      included: true,
      range: {
        low: Math.round(low),
        mid: Math.round(mid),
        high: Math.round(high)
      }
    });

    totalLow += low;
    totalMid += mid;
    totalHigh += high;
  }

  return {
    totalRange: {
      low: Math.round(totalLow),
      mid: Math.round(totalMid),
      high: Math.round(totalHigh)
    },
    categoryBreakdown: breakdown,
    perPersonCost: {
      low: Math.round(totalLow / estimate.guestCount),
      high: Math.round(totalHigh / estimate.guestCount)
    },
    tips: generateBudgetTips(estimate, breakdown)
  };
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  💰 Event Rental Budget Estimator                        [Company Logo] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Get a realistic estimate of rental costs for your event               │
│                                                                         │
│  TELL US ABOUT YOUR EVENT                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Event Type: [Wedding Reception           ▼]                      │   │
│  │                                                                   │   │
│  │ Guest Count:                                                      │   │
│  │ [50]═══════════════●════════════════════════════════════[300]   │   │
│  │                    150 guests                                     │   │
│  │                                                                   │   │
│  │ Location: ○ Indoor  ● Outdoor  ○ Tent (we'll add tent costs)    │   │
│  │ Region:   [West Coast            ▼]                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  QUALITY LEVEL                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │  Budget  │ │Mid-Range │ │ Premium  │ │  Luxury  │                  │
│  │    $     │ │    $$    │ │   $$$    │ │   $$$$   │                  │
│  │ Basic,   │ │ Standard │ │ Designer │ │ Top-tier │                  │
│  │functional│ │ quality  │ │ options  │ │ unique   │                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
│       ○            ●            ○            ○                         │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  YOUR ESTIMATED RENTAL BUDGET                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │     💰 $2,800 - $4,200                                           │   │
│  │        Mid-range estimate: $3,400                                │   │
│  │                                                                   │   │
│  │     That's $19 - $28 per guest                                   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  BREAKDOWN BY CATEGORY (click to adjust)                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  ☑ Tables & Chairs        $750 - $1,350      ████████░░░░  30%  │   │
│  │    Standard round tables, chiavari chairs                        │   │
│  │                                                                   │   │
│  │  ☑ Linens                 $600 - $1,200      ██████░░░░░░  25%  │   │
│  │    Tablecloths, napkins, chair sashes                           │   │
│  │                                                                   │   │
│  │  ☑ Tableware              $450 - $1,050      █████░░░░░░░  20%  │   │
│  │    China, glassware, flatware                                    │   │
│  │                                                                   │   │
│  │  ☑ Dance Floor            $400 - $800        ████░░░░░░░░  15%  │   │
│  │    15x15 dance floor                                             │   │
│  │                                                                   │   │
│  │  ☐ Tent                   $2,250 - $4,500    (not included)     │   │
│  │    40x60 frame tent with installation                           │   │
│  │                                                                   │   │
│  │  ☑ Lighting               $200 - $400        ██░░░░░░░░░░   8%  │   │
│  │    String lights, uplighting                                     │   │
│  │                                                                   │   │
│  │  ☐ Catering Equipment     $300 - $600        (not included)     │   │
│  │    Chafing dishes, coffee service                               │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  💡 BUDGET TIPS                                                         │
│  • Linens make the biggest visual impact for the cost                  │
│  • Consider mixing chair styles (chiavari for head table only)         │
│  • Skip charger plates to save ~$300 on tableware                      │
│  • Off-peak dates (Friday, Sunday) often have discounts               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │   Ready for an exact quote based on your specific items?         │   │
│  │                                                                   │
│  │   [📧 Email Me This Estimate]    [🛒 Get Accurate Quote]         │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Compare: National average for 150-guest wedding rentals: $3,200       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 20,000+ |
| Estimator completions | 50% of visitors |
| Email captures | 25% of completions |
| Quote requests | 15% of completions |
| Time on tool | 3+ minutes |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Pricing data research & structuring | 2 days | Week 1 |
| Core calculation engine | 2 days | Week 1 |
| UI/UX implementation | 3 days | Week 1-2 |
| Category adjustments | 1 day | Week 2 |
| Email/save features | 1 day | Week 2 |
| Regional pricing | 1 day | Week 2 |
| Testing & polish | 2 days | Week 2-3 |
| **Total** | **12 days** | **2-3 weeks** |

## Future Enhancements

1. **Price alerts:** Notify when items go on sale
2. **Historical trends:** Show if prices are rising/falling
3. **Vendor comparison:** Anonymous price ranges from multiple vendors
4. **Budget tracker:** Track actual spend against estimate
5. **Financing calculator:** Payment plan options
6. **Bundle deals:** Show savings for package bookings
7. **Seasonal pricing:** Adjust for peak/off-peak
