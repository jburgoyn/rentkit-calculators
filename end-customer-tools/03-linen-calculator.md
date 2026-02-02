# Linen Calculator

## Overview

An embeddable widget that calculates the exact quantities of tablecloths, napkins, chair covers, table runners, and other linens needed for an event.

## Problem Statement

Linen calculations are error-prone and often result in:
- Wrong sizes ordered (tablecloth doesn't fit table)
- Incorrect quantities (forgetting napkins for vendor meals)
- Missing accessories (overlays, runners, chair sashes)
- Last-minute rushes for forgotten items
- Wasted money on over-ordering

## Target Audience

- **Primary:** Brides and event hosts planning weddings/parties
- **Secondary:** Event planners and coordinators
- **Tertiary:** Catering companies

## SEO Opportunity

- "tablecloth size calculator" - 1,200 monthly searches
- "how many tablecloths do I need" - 800 monthly searches
- "napkin calculator for wedding" - 400 monthly searches
- "what size tablecloth for 60 inch round table" - 600 monthly searches

## Key Features

### 1. Table Inventory Input
- Import from Table & Chair Calculator (if used)
- Manual entry by table type and quantity:
  - Round tables (48", 60", 72")
  - Rectangular tables (6ft, 8ft)
  - Square tables
  - Cocktail tables
  - Sweetheart/head tables
  - Food station tables
  - Cake/gift tables

### 2. Tablecloth Configuration
- **Drop length preference:**
  - Floor length (formal)
  - Mid-length (30" drop)
  - Lap length (casual)
- **Overlay options:**
  - Square overlay
  - Round overlay
  - No overlay
- **Color selection** (for visual preview)

### 3. Napkin Calculator
- Guest count (auto from tables or manual)
- Napkin fold style (affects visual only)
- Extra napkins for:
  - Vendor meals
  - Bar service
  - Restroom baskets

### 4. Chair Accessories
- Chair covers (by chair count)
- Chair sashes/ties
- Chiavari chair cushions

### 5. Additional Items
- Table runners
- Table skirts (for food tables)
- Charger plates
- Specialty items

### 6. Results Display
- Complete linen list with exact sizes
- Visual preview of table setting
- Notes on care/setup
- "Get a Quote" CTA

## Technical Requirements

### Data Model

```typescript
interface LinenCalculation {
  // Inputs
  tables: TableEntry[];
  guestCount: number;

  tableclothPreferences: {
    dropLength: 'floor' | 'mid' | 'lap';
    useOverlays: boolean;
    overlayStyle?: 'square' | 'round';
  };

  napkinPreferences: {
    extraForVendors: number;
    extraForBar: number;
    extraForRestrooms: number;
  };

  chairAccessories: {
    chairCovers: boolean;
    chairSashes: boolean;
    cushions: boolean;
    chairCount: number;
  };

  additionalItems: {
    tableRunners: boolean;
    tableSkirts: TableSkirtEntry[];
    chargerPlates: boolean;
  };

  // Outputs
  results: LinenList;
}

interface TableEntry {
  type: TableType;
  shape: 'round' | 'rectangular' | 'square' | 'cocktail';
  size: string; // "60inch", "6ft", etc.
  quantity: number;
  purpose: 'guest' | 'food' | 'cake' | 'gift' | 'dj' | 'other';
}

interface LinenList {
  tablecloths: {
    size: string;
    quantity: number;
    forTableType: string;
    notes: string;
  }[];
  overlays: {
    size: string;
    quantity: number;
  }[];
  napkins: {
    quantity: number;
    breakdown: {
      guests: number;
      vendors: number;
      bar: number;
      restroom: number;
      buffer: number;
    };
  };
  chairCovers: number;
  chairSashes: number;
  tableRunners: number;
  tableSkirts: {
    length: string;
    quantity: number;
  }[];
  chargerPlates: number;
}
```

### Calculation Logic

```typescript
const TABLECLOTH_SIZES = {
  round: {
    '48inch': {
      floor: '120inch round',    // 48 + 36 + 36 = 120
      mid: '90inch round',       // 48 + 21 + 21 = 90
      lap: '72inch round'        // 48 + 12 + 12 = 72
    },
    '60inch': {
      floor: '132inch round',
      mid: '108inch round',
      lap: '90inch round'
    },
    '72inch': {
      floor: '144inch round',
      mid: '120inch round',
      lap: '108inch round'
    }
  },
  rectangular: {
    '6ft': {
      floor: '90x156inch',       // 30x72 table + drops
      mid: '90x132inch',
      lap: '60x120inch'
    },
    '8ft': {
      floor: '90x156inch',
      mid: '90x156inch',
      lap: '60x126inch'
    }
  },
  cocktail: {
    '30inch': {
      floor: '120inch round',    // Needs to reach floor (42" height)
      mid: '108inch round',
      fitted: '30x42 spandex'
    }
  }
};

function calculateLinens(input: LinenCalculation): LinenList {
  const tablecloths: LinenList['tablecloths'] = [];

  // Calculate tablecloths for each table type
  for (const table of input.tables) {
    const sizeChart = TABLECLOTH_SIZES[table.shape]?.[table.size];
    if (sizeChart) {
      const clothSize = sizeChart[input.tableclothPreferences.dropLength];
      tablecloths.push({
        size: clothSize,
        quantity: table.quantity,
        forTableType: `${table.size} ${table.shape} (${table.purpose})`,
        notes: getLinenNotes(table, input.tableclothPreferences)
      });
    }
  }

  // Calculate napkins
  const baseNapkins = input.guestCount;
  const napkinBuffer = Math.ceil(input.guestCount * 0.05); // 5% buffer
  const totalNapkins = baseNapkins +
    input.napkinPreferences.extraForVendors +
    input.napkinPreferences.extraForBar +
    input.napkinPreferences.extraForRestrooms +
    napkinBuffer;

  // ... calculate other items

  return {
    tablecloths,
    napkins: {
      quantity: totalNapkins,
      breakdown: {
        guests: baseNapkins,
        vendors: input.napkinPreferences.extraForVendors,
        bar: input.napkinPreferences.extraForBar,
        restroom: input.napkinPreferences.extraForRestrooms,
        buffer: napkinBuffer
      }
    },
    // ... other items
  };
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🎀 Linen Calculator                           [Company Logo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  YOUR TABLES                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Import from Table Calculator? [Yes, import]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Or enter manually:                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Table Type          Size        Qty    Purpose      │   │
│  │ ○ Round            [60"]  ▼    [17]   [Guest] ▼    │   │
│  │ ○ Rectangular      [8ft]  ▼    [ 2]   [Food]  ▼    │   │
│  │ ○ Cocktail         [30"]  ▼    [ 4]   [Bar]   ▼    │   │
│  │                              [+ Add another table]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  TABLECLOTH STYLE                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  Floor   │ │   Mid    │ │   Lap    │                   │
│  │  Length  │ │  Length  │ │  Length  │                   │
│  │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │                   │
│  │ │▓▓▓▓▓▓│ │ │ │▓▓▓▓▓▓│ │ │ │▓▓▓▓▓▓│ │                   │
│  │ │▓    ▓│ │ │ │▓    ▓│ │ │ └──────┘ │                   │
│  │ │▓    ▓│ │ │ └──────┘ │ │    │  │   │                   │
│  │ └──────┘ │ │    │  │   │ │    │  │   │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│       ●            ○            ○                          │
│                                                             │
│  ☑ Add overlays?    Style: [Square] ▼                      │
│                                                             │
│  NAPKINS                        ┌───────────────────────┐  │
│  Guest count: [150]             │     Preview           │  │
│  ☑ Extra for vendors [10]       │   ┌─────────────┐     │  │
│  ☑ Extra for bar     [20]       │   │ ○  ▢  ○    │     │  │
│  ☐ Restroom baskets  [ 0]       │   │    ◇       │     │  │
│                                  │   │ ○       ○  │     │  │
│  CHAIR ACCESSORIES              │   └─────────────┘     │  │
│  Chair count: [150]             │   60" round with      │  │
│  ☐ Chair covers                 │   floor-length cloth  │  │
│  ☐ Chair sashes                 │   + square overlay    │  │
│                                  └───────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  YOUR LINEN LIST                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  TABLECLOTHS                                                │
│  ├─ 17x 132" Round (Ivory) - for 60" round guest tables    │
│  ├─  2x 90x156" Rectangular (Ivory) - for 8ft food tables  │
│  └─  4x 120" Round (Ivory) - for cocktail tables           │
│                                                             │
│  OVERLAYS                                                   │
│  └─ 17x 72" Square Overlay (Gold) - for guest tables       │
│                                                             │
│  NAPKINS                                                    │
│  └─ 190x Dinner Napkins (Ivory)                            │
│      • 150 for guests                                       │
│      •  10 for vendors                                      │
│      •  20 for bar service                                  │
│      •  10 buffer (5%)                                      │
│                                                             │
│  💡 Tips:                                                   │
│  • 132" round cloths provide a 36" drop on 60" tables      │
│  • Order 5-10% extra napkins for spills and replacements   │
│  • Cocktail tables look best with floor-length cloths      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     📧  Get a Quote for These Linens                │   │
│  │     [        Enter your email        ] [Get Quote]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly organic visitors | 3,000+ |
| Calculator completions | 65% of starts |
| Cross-sell from Table Calculator | 40% |
| Email capture rate | 20% of completions |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation logic | 2 days | Week 1 |
| UI/UX with visual preview | 3 days | Week 1-2 |
| Table Calculator integration | 1 day | Week 2 |
| Embed system | 1 day | Week 2 |
| Testing & polish | 1 day | Week 2 |
| **Total** | **8 days** | **2 weeks** |

## Future Enhancements

1. **Color visualization:** See table with selected linen colors
2. **Fabric recommendations:** Polyester vs cotton vs satin
3. **Stain probability calculator:** Humor feature for red wine risk
4. **Laundry/pressing notes:** Care instructions by fabric
5. **Rental vs purchase comparison:** Cost analysis for frequent hosts
