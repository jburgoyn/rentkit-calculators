# Interactive Package Builder

## Overview

An interactive tool that allows customers to build custom rental packages by selecting items, seeing running totals, and submitting for quotes—essentially a guided shopping experience that leads to qualified leads.

## Problem Statement

Rental shopping is overwhelming:
- Too many choices without guidance
- No sense of what "typical" packages look like
- Price anxiety—no idea of total cost until quote
- Missed items lead to last-minute additions
- Customers abandon due to complexity

## Target Audience

- **Primary:** Event hosts in early planning stages
- **Secondary:** Budget-conscious planners
- **Tertiary:** Corporate event coordinators with approval workflows

## SEO & Engagement Opportunity

- "event rental package builder" - 400 monthly searches
- "wedding rental calculator" - 1,100 monthly searches
- "party rental quote" - 900 monthly searches
- "event rental cost estimator" - 600 monthly searches

**High conversion potential:** Users who complete builder have high purchase intent.

## Key Features

### 1. Event Type Selection
- Wedding reception
- Wedding ceremony & reception
- Corporate event
- Birthday party
- Graduation party
- Baby/bridal shower
- Holiday party
- Custom

### 2. Guest Count & Basics
- Number of guests
- Event date (for availability)
- Indoor/outdoor
- Venue type

### 3. Category-by-Category Building
**Guided flow through:**
1. Tables (with recommendations)
2. Chairs
3. Linens
4. Tableware (optional)
5. Dance floor (optional)
6. Tent (if outdoor)
7. Catering equipment
8. Decor/lighting
9. Bars & beverage

### 4. Smart Recommendations
- "Based on 150 guests, you'll need ~19 tables"
- "Most weddings this size include a 15x15 dance floor"
- "Don't forget napkins!"
- Pre-built packages as starting points

### 5. Running Total
- Live price estimate
- Breakdown by category
- Comparison to budget (if entered)
- "Save $X by choosing package deal"

### 6. Package Templates
- Starter packages by event type
- Premium upgrades
- A la carte additions

### 7. Quote & Booking Flow
- Summary review
- Contact information
- Preferred contact method
- Notes/special requests
- Submit for quote

## Technical Requirements

### Data Model

```typescript
interface PackageBuilder {
  sessionId: string;
  orgId: string;           // Rental company

  eventDetails: {
    type: EventType;
    guestCount: number;
    date?: Date;
    venue: VenueType;
    indoor: boolean;
  };

  selections: {
    [category: string]: CategorySelection;
  };

  appliedTemplate?: string;

  pricing: {
    subtotal: number;
    discounts: Discount[];
    estimatedTotal: number;
    breakdown: CategoryBreakdown[];
  };

  contact?: ContactInfo;
  notes?: string;
  status: 'building' | 'submitted' | 'quoted' | 'booked';
}

interface CategorySelection {
  items: SelectedItem[];
  skipped: boolean;
  completedAt?: Date;
}

interface SelectedItem {
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: Record<string, any>;
}

interface PackageTemplate {
  id: string;
  name: string;
  description: string;
  eventType: EventType;
  guestRange: { min: number; max: number };
  items: TemplateItem[];
  basePrice: number;
  savings: number;        // vs a la carte
  popular: boolean;
}
```

### Integration with Existing Systems

```typescript
// Connect to rental company's actual inventory
async function loadInventoryForCategory(
  orgId: string,
  category: string,
  eventDate?: Date
): Promise<InventoryItem[]> {
  // Use existing RentKit inventory API
  const response = await fetch(
    `/api/orgs/${orgId}/inventory?category=${category}&date=${eventDate}`
  );
  return response.json();
}

// Check availability for selected date
async function checkAvailability(
  orgId: string,
  itemId: string,
  date: Date,
  quantity: number
): Promise<AvailabilityResult> {
  // Use existing dailyAvailability system
  const available = await getAvailableInventory(orgId, date, itemId);
  return {
    available: available >= quantity,
    maxAvailable: available,
    alternatives: available < quantity ? await getSimilarItems(itemId) : []
  };
}

// Submit as quote request
async function submitPackageForQuote(
  package: PackageBuilder
): Promise<QuoteRequest> {
  // Create estimate/quote in RentKit system
  const estimate = await createEstimate({
    orgId: package.orgId,
    customer: package.contact,
    items: flattenSelections(package.selections),
    eventDate: package.eventDetails.date,
    notes: package.notes,
    source: 'package_builder'
  });
  return estimate;
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📦 Build Your Rental Package                            [Company Logo] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Progress: ●━━●━━●━━○━━○━━○━━○                                         │
│           Event Tables Chairs Linens Dance Tent  Review                │
│                              ↑ You are here                            │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  LINENS FOR YOUR 150-GUEST WEDDING                                     │
│                                                                         │
│  Based on your 19 round tables, here's what you'll need:               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  TABLECLOTHS                                                     │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │   │
│  │  │   [Image]    │ │   [Image]    │ │   [Image]    │            │   │
│  │  │  120" Round  │ │  132" Round  │ │  90x132      │            │   │
│  │  │  Polyester   │ │   Satin      │ │  Rectangle   │            │   │
│  │  │  $8/each     │ │  $15/each    │ │  $10/each    │            │   │
│  │  │  [-] 19 [+]  │ │  [-] 0 [+]   │ │  [-] 2 [+]   │            │   │
│  │  │  = $152      │ │  = $0        │ │  = $20       │            │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘            │   │
│  │                                                                  │   │
│  │  💡 Recommended: 19 tablecloths for your guest tables           │   │
│  │                 + 2-3 for food/gift tables                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  NAPKINS                                                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │   │
│  │  │   [Image]    │ │   [Image]    │ │   [Image]    │            │   │
│  │  │  Polyester   │ │   Satin      │ │   Linen      │            │   │
│  │  │  $0.50/each  │ │  $1/each     │ │  $2/each     │            │   │
│  │  │  [-] 160 [+] │ │  [-] 0 [+]   │ │  [-] 0 [+]   │            │   │
│  │  │  = $80       │ │  = $0        │ │  = $0        │            │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘            │   │
│  │                                                                  │   │
│  │  💡 Recommended: 160 napkins (150 guests + 10 extra)            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ☐ Add chair covers ($3/each × 150 = $450)                            │
│  ☐ Add table runners ($8/each × 19 = $152)                            │
│  ☐ Add overlays ($12/each × 19 = $228)                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  YOUR PACKAGE SO FAR                           [View Full Breakdown]    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Tables      $570  │  Chairs    $450  │  Linens    $252  │        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━          │ │
│  │                     RUNNING TOTAL: $1,272                          │ │
│  │                                                                     │ │
│  │  🏷️ TIP: Book before [date] and save 10% on linens!               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  [← Back to Chairs]                    [Skip Linens]  [Continue →]     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Builder starts | 5,000/month |
| Completion rate | 35% |
| Quote submissions | 25% of completions |
| Quote → Booking conversion | 30% |
| Average package value | $1,500+ |
| Revenue attributed | Track via source |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core wizard framework | 3 days | Week 1 |
| Event type & templates | 2 days | Week 1 |
| Category pages (x8) | 6 days | Week 2 |
| Pricing engine | 2 days | Week 2-3 |
| Availability checking | 2 days | Week 3 |
| Review & submit flow | 2 days | Week 3 |
| Quote system integration | 2 days | Week 3-4 |
| Testing & polish | 3 days | Week 4 |
| **Total** | **22 days** | **4-5 weeks** |

## Future Enhancements

1. **AI package suggestions:** "Events like yours typically include..."
2. **Budget mode:** "I have $X, what can I get?"
3. **Comparison mode:** Show good/better/best options
4. **Save & resume:** Email link to continue later
5. **Collaboration:** Share with partner, get their input
6. **Instant booking:** Book directly without quote for simple packages
7. **Upsell suggestions:** "Couples also liked..."
8. **Post-event review:** Did you need more/less of anything?
