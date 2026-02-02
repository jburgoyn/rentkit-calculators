# Utilization Analyzer

## Overview

A dashboard tool that analyzes inventory utilization rates, identifying star performers, underperformers, and optimization opportunities.

## Problem Statement

Rental companies lack visibility into inventory performance:
- Which items are actually profitable?
- What's sitting in the warehouse unused?
- Where should I invest more? Less?
- Am I over-stocked on anything?

## Target Audience

- **Primary:** Rental company owners analyzing inventory
- **Secondary:** Purchasing managers making decisions
- **Tertiary:** Financial analysts evaluating the business

## Key Features

### 1. Overall Utilization Dashboard
- Total inventory utilization rate
- Revenue per item metrics
- Trend over time

### 2. Item-Level Analysis
- Utilization rate per item
- Revenue generated
- Number of rentals
- Average rental duration
- Damage/loss rate

### 3. Category Comparisons
- Compare utilization across categories
- Identify best/worst performing categories

### 4. Star vs Dog Analysis
- High utilization + high revenue = Stars (invest more)
- High utilization + low revenue = Workhorses (optimize pricing)
- Low utilization + high revenue = Opportunities (market more)
- Low utilization + low revenue = Dogs (consider liquidating)

### 5. Recommendations
- Items to purchase more of
- Items to retire/sell
- Pricing optimization suggestions
- Marketing focus areas

## Technical Requirements

### Data Model

```typescript
interface UtilizationAnalysis {
  period: { start: Date; end: Date };

  overall: {
    utilizationRate: number;
    totalRevenue: number;
    totalItems: number;
    avgRevenuePerItem: number;
  };

  byItem: ItemUtilization[];
  byCategory: CategoryUtilization[];

  starDogAnalysis: {
    stars: ItemUtilization[];
    workhorses: ItemUtilization[];
    opportunities: ItemUtilization[];
    dogs: ItemUtilization[];
  };

  recommendations: Recommendation[];
}

interface ItemUtilization {
  itemId: string;
  name: string;
  category: string;
  stock: number;

  metrics: {
    rentals: number;
    revenue: number;
    utilizationRate: number;        // % of time rented
    revenuePerUnit: number;
    avgRentalDuration: number;
    damageRate: number;
    daysAvailableNotRented: number;
  };

  quadrant: 'star' | 'workhorse' | 'opportunity' | 'dog';
  trend: 'improving' | 'stable' | 'declining';
}
```

### Calculation Logic

```typescript
async function analyzeUtilization(
  orgId: string,
  period: { start: Date; end: Date }
): Promise<UtilizationAnalysis> {
  const inventory = await getInventory(orgId);
  const invoices = await getInvoices(orgId, period);

  const itemMetrics: Map<string, ItemUtilization> = new Map();

  // Calculate days in period
  const totalDays = daysBetween(period.start, period.end);

  for (const item of inventory) {
    // Find all rentals of this item
    const itemRentals = invoices.flatMap(inv =>
      inv.selectedItems.items.filter(si => si.id === item.id)
    );

    // Calculate metrics
    const totalRentals = itemRentals.length;
    const totalRevenue = itemRentals.reduce((sum, r) =>
      sum + (r.rowTotal || 0), 0);

    // Calculate days rented (accounting for rental duration)
    const daysRented = itemRentals.reduce((sum, r) =>
      sum + (r.selectedDuration || 1), 0);

    // Utilization = days rented / (days in period * stock)
    const maxPossibleDays = totalDays * item.stock;
    const utilizationRate = (daysRented / maxPossibleDays) * 100;

    itemMetrics.set(item.id, {
      itemId: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      metrics: {
        rentals: totalRentals,
        revenue: totalRevenue,
        utilizationRate,
        revenuePerUnit: totalRevenue / item.stock,
        avgRentalDuration: totalRentals > 0 ? daysRented / totalRentals : 0,
        damageRate: calculateDamageRate(item, invoices),
        daysAvailableNotRented: maxPossibleDays - daysRented
      },
      quadrant: determineQuadrant(utilizationRate, totalRevenue / item.stock),
      trend: calculateTrend(item.id, period)
    });
  }

  return {
    period,
    overall: calculateOverallMetrics(itemMetrics),
    byItem: Array.from(itemMetrics.values())
      .sort((a, b) => b.metrics.revenue - a.metrics.revenue),
    byCategory: aggregateByCategory(itemMetrics),
    starDogAnalysis: groupByQuadrant(itemMetrics),
    recommendations: generateRecommendations(itemMetrics)
  };
}

function determineQuadrant(utilization: number, revenuePerUnit: number): string {
  const utilizationThreshold = 40; // %
  const revenueThreshold = 500;    // $ per unit per period

  if (utilization >= utilizationThreshold && revenuePerUnit >= revenueThreshold) {
    return 'star';
  } else if (utilization >= utilizationThreshold && revenuePerUnit < revenueThreshold) {
    return 'workhorse';
  } else if (utilization < utilizationThreshold && revenuePerUnit >= revenueThreshold) {
    return 'opportunity';
  } else {
    return 'dog';
  }
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Utilization Analyzer                                   [RentKit]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Period: [Last 12 Months ▼]  Category: [All Categories ▼]  [Refresh]  │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  OVERALL PERFORMANCE                                                    │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────┐│
│  │ 47%            │ │ $284,500       │ │ $892           │ │ 319      ││
│  │ Avg Utilization│ │ Total Revenue  │ │ Rev/Item       │ │ Items    ││
│  │ ↑ 5% vs LY     │ │ ↑ 12% vs LY    │ │ ↑ 7% vs LY     │ │ Tracked  ││
│  └────────────────┘ └────────────────┘ └────────────────┘ └──────────┘│
│                                                                         │
│  📈 STAR/DOG MATRIX                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  Revenue    ⬆️ HIGH                                               │   │
│  │  Per Unit    │                                                    │   │
│  │             │    OPPORTUNITIES        ⭐ STARS                    │   │
│  │             │    (Market more)        (Invest more)               │   │
│  │             │                                                     │   │
│  │             │    • Farm Tables        • Chiavari Chairs          │   │
│  │             │    • Lounge Sets        • 60" Round Tables         │   │
│  │             │                         • White Linens             │   │
│  │             │─────────────────────────────────────────────────   │   │
│  │             │    🐕 DOGS              💪 WORKHORSES               │   │
│  │             │    (Consider selling)   (Raise prices?)            │   │
│  │             │                                                     │   │
│  │             │    • Plastic Chairs     • Folding Tables          │   │
│  │             │    • Basic Linens       • Basic Chairs            │   │
│  │  LOW        │                                                     │   │
│  │             └─────────────────────────────────────────────────   │   │
│  │                  LOW                                HIGH          │   │
│  │                           Utilization Rate ➡️                     │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ⭐ TOP PERFORMERS                         🐕 UNDERPERFORMERS          │
│  ┌─────────────────────────────┐          ┌─────────────────────────┐  │
│  │ 1. Chiavari Gold Chair     │          │ 1. White Plastic Chair  │  │
│  │    72% util • $45K revenue │          │    12% util • $1.2K rev │  │
│  │                            │          │                          │  │
│  │ 2. 60" Round Tables        │          │ 2. 36" Cocktail Tables  │  │
│  │    68% util • $38K revenue │          │    18% util • $2.1K rev │  │
│  │                            │          │                          │  │
│  │ 3. White Satin Linens      │          │ 3. Basic Polyester Linen│  │
│  │    65% util • $28K revenue │          │    22% util • $1.8K rev │  │
│  │                            │          │                          │  │
│  │ [View All Stars →]         │          │ [Review Dogs →]          │  │
│  └─────────────────────────────┘          └─────────────────────────┘  │
│                                                                         │
│  📋 RECOMMENDATIONS                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  💰 REVENUE OPPORTUNITIES                                        │   │
│  │  ├─ Consider purchasing 25 more Chiavari Gold Chairs            │   │
│  │  │   High demand, currently at 72% utilization                  │   │
│  │  │   Estimated additional revenue: $12,000/year                 │   │
│  │  │                                                               │   │
│  │  └─ Increase marketing for Farm Tables                          │   │
│  │      High revenue when rented, but only 28% utilization         │   │
│  │                                                                   │   │
│  │  🏷️ PRICING OPPORTUNITIES                                        │   │
│  │  └─ Consider raising price on Folding Tables by 15%             │   │
│  │      85% utilization suggests strong demand                     │   │
│  │                                                                   │   │
│  │  🗑️ LIQUIDATION CANDIDATES                                       │   │
│  │  └─ Review 50 White Plastic Chairs                              │   │
│  │      Only 12% utilization, $1,200 revenue in 12 months          │   │
│  │      Consider selling to free up warehouse space                │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [📥 Download Full Report]  [📊 Category Breakdown]  [📈 Trend View]  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Weekly active users | 60% of RentKit customers |
| Recommendations acted on | 30% |
| Inventory optimization | Track purchases/liquidations |
| User satisfaction | 4.4/5 rating |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Data aggregation queries | 2 days | Week 1 |
| Calculation engine | 2 days | Week 1 |
| Star/Dog analysis | 1 day | Week 2 |
| UI/UX implementation | 3 days | Week 2 |
| Recommendations engine | 2 days | Week 3 |
| Export features | 1 day | Week 3 |
| Testing & polish | 2 days | Week 3 |
| **Total** | **13 days** | **3 weeks** |

## Future Enhancements

1. **Automated alerts:** "Item X hasn't been rented in 60 days"
2. **Trend analysis:** See utilization changing over time
3. **Seasonality view:** Utilization by month/season
4. **Cross-sell insights:** Items often rented together
5. **Competitor comparison:** Your utilization vs market (via benchmarker)
