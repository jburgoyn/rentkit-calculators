# Seasonal Demand Forecaster

## Overview

A tool that analyzes historical booking data to predict future demand patterns, helping rental companies optimize inventory, staffing, and pricing.

## Problem Statement

Rental companies struggle with demand planning:
- Overbooking during peak seasons
- Idle inventory during slow periods
- Hiring too late for busy seasons
- Missed pricing optimization opportunities
- Cash flow surprises

## Target Audience

- **Primary:** Rental company owners/managers
- **Secondary:** Operations teams planning inventory
- **Tertiary:** Finance teams for cash flow planning

## Value Proposition

- Predict busy periods before they happen
- Optimize inventory purchases timing
- Staff appropriately for demand
- Set strategic pricing by demand level
- Improve cash flow planning

## Key Features

### 1. Historical Analysis
- Revenue by month/week
- Bookings by category
- Average order value trends
- Event type distribution
- Utilization rates by item

### 2. Demand Forecasting
- Predicted bookings by period
- Confidence intervals
- Comparison to previous years
- Growth trend identification

### 3. Category-Level Insights
- Which items are in highest demand when?
- Cross-category correlations
- Emerging vs declining categories

### 4. Actionable Recommendations
- Inventory purchase timing
- Pricing adjustments
- Staffing recommendations
- Marketing timing

### 5. Scenario Planning
- "What if growth is 10% higher?"
- "What if we add new inventory?"
- Sensitivity analysis

## Technical Requirements

### Data Model

```typescript
interface DemandForecast {
  orgId: string;
  forecastPeriod: {
    start: Date;
    end: Date;
  };

  historicalData: {
    byMonth: MonthlyMetrics[];
    byCategory: CategoryMetrics[];
    byEventType: EventTypeMetrics[];
  };

  predictions: {
    overall: PeriodPrediction[];
    byCategory: CategoryPrediction[];
  };

  recommendations: Recommendation[];
  confidence: number;
}

interface MonthlyMetrics {
  month: string;          // "2024-01"
  revenue: number;
  bookings: number;
  avgOrderValue: number;
  utilization: number;    // % of inventory rented
}

interface PeriodPrediction {
  period: string;
  predictedBookings: number;
  predictedRevenue: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  vsLastYear: number;     // % change
  demandLevel: 'low' | 'medium' | 'high' | 'peak';
}

interface Recommendation {
  type: 'inventory' | 'pricing' | 'staffing' | 'marketing';
  period: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}
```

### Forecasting Logic

```typescript
async function generateForecast(orgId: string): Promise<DemandForecast> {
  // Get historical data (past 2-3 years)
  const invoices = await getInvoices(orgId, {
    startDate: subtractYears(new Date(), 3),
    endDate: new Date()
  });

  // Aggregate by time period
  const monthlyData = aggregateByMonth(invoices);
  const categoryData = aggregateByCategory(invoices);

  // Identify seasonal patterns
  const seasonalPattern = identifySeasonalPattern(monthlyData);
  // Returns: { peakMonths: [5,6,9,10], troughMonths: [1,2,12], ... }

  // Calculate growth trend
  const yearOverYearGrowth = calculateYoYGrowth(monthlyData);

  // Generate predictions
  const predictions = [];
  for (let month = 1; month <= 12; month++) {
    const historicalForMonth = monthlyData.filter(m =>
      new Date(m.month).getMonth() + 1 === month
    );

    const avgBookings = mean(historicalForMonth.map(m => m.bookings));
    const stdDev = standardDeviation(historicalForMonth.map(m => m.bookings));

    // Apply growth trend
    const predicted = avgBookings * (1 + yearOverYearGrowth);

    predictions.push({
      period: `2025-${month.toString().padStart(2, '0')}`,
      predictedBookings: Math.round(predicted),
      confidenceInterval: {
        low: Math.round(predicted - stdDev),
        high: Math.round(predicted + stdDev)
      },
      vsLastYear: yearOverYearGrowth * 100,
      demandLevel: categorizeDemand(predicted, avgBookings)
    });
  }

  // Generate recommendations
  const recommendations = generateRecommendations(predictions, seasonalPattern);

  return {
    orgId,
    forecastPeriod: { start: new Date(), end: addYears(new Date(), 1) },
    historicalData: { byMonth: monthlyData, byCategory: categoryData },
    predictions: { overall: predictions },
    recommendations,
    confidence: calculateConfidence(monthlyData)
  };
}

function generateRecommendations(
  predictions: PeriodPrediction[],
  patterns: SeasonalPattern
): Recommendation[] {
  const recommendations = [];

  // Inventory recommendations
  const peakPeriods = predictions.filter(p => p.demandLevel === 'peak');
  if (peakPeriods.length > 0) {
    recommendations.push({
      type: 'inventory',
      period: peakPeriods[0].period,
      message: `Peak season approaching in ${peakPeriods[0].period}. Review inventory levels for high-demand items.`,
      priority: 'high',
      impact: 'Avoid missed bookings due to inventory shortages'
    });
  }

  // Staffing recommendations
  const upcomingPeak = predictions.find((p, i) =>
    p.demandLevel === 'peak' && i < 3
  );
  if (upcomingPeak) {
    recommendations.push({
      type: 'staffing',
      period: upcomingPeak.period,
      message: `Begin hiring seasonal staff now for ${upcomingPeak.period} peak.`,
      priority: 'medium',
      impact: 'Ensure adequate delivery and setup capacity'
    });
  }

  // Pricing recommendations
  const lowDemandPeriods = predictions.filter(p => p.demandLevel === 'low');
  if (lowDemandPeriods.length > 0) {
    recommendations.push({
      type: 'pricing',
      period: lowDemandPeriods[0].period,
      message: `Consider promotions for ${lowDemandPeriods[0].period} to boost bookings.`,
      priority: 'medium',
      impact: 'Increase utilization during slow periods'
    });
  }

  return recommendations;
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📈 Seasonal Demand Forecaster                             [RentKit]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Forecast based on 3 years of booking history • 87% confidence        │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  📊 12-MONTH DEMAND FORECAST                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  Predicted Bookings                        ▲ Peak Season         │   │
│  │   150│            ╭──╮         ╭──╮                             │   │
│  │      │      ╭────╯   ╰───╮   ╭╯   ╰╮                            │   │
│  │   100│    ╭╯               ╰─╯      ╰──╮                         │   │
│  │      │  ╭╯                               ╰╮                      │   │
│  │    50│╭╯                                   ╰╮                    │   │
│  │      │╯                                      ╰─── Confidence     │   │
│  │     0│──────────────────────────────────────────── Band          │   │
│  │       J   F   M   A   M   J   J   A   S   O   N   D             │   │
│  │                                                                   │   │
│  │  █ Predicted    ░ Confidence Range    ─ Last Year                │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  UPCOMING PERIODS                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  MARCH 2025           APRIL 2025           MAY 2025             │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │   │
│  │  │    LOW       │    │   MEDIUM     │    │    PEAK      │       │   │
│  │  │  🔵 45 books │    │  🟡 78 books │    │  🔴 142 books│       │   │
│  │  │  vs LY: +5%  │    │  vs LY: +12% │    │  vs LY: +8%  │       │   │
│  │  │              │    │              │    │              │       │   │
│  │  │  Rev: $18K   │    │  Rev: $35K   │    │  Rev: $72K   │       │   │
│  │  └──────────────┘    └──────────────┘    └──────────────┘       │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ⚡ ACTION ITEMS                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  🔴 HIGH PRIORITY                                                │   │
│  │  ├─ Review tent inventory before May peak - only 3 available    │   │
│  │  └─ Start hiring delivery staff now for May-June                │   │
│  │                                                                   │   │
│  │  🟡 MEDIUM PRIORITY                                              │   │
│  │  ├─ Consider March promotion to boost slow month bookings       │   │
│  │  └─ Place chair order by April 1 for May availability           │   │
│  │                                                                   │   │
│  │  🟢 PLANNING                                                     │   │
│  │  └─ September wedding season typically books 4-6 months out     │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  📦 CATEGORY FORECAST                                   [Expand All]   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Category        Peak Period    Expected Demand    vs Last Year │   │
│  │  Tables/Chairs   May-Oct        +15% bookings      +8%          │   │
│  │  Tents           Jun-Sep        +22% bookings      +12%         │   │
│  │  Linens          May-Oct        +18% bookings      +10%         │   │
│  │  Tableware       May-Oct        +10% bookings      +5%          │   │
│  │  Dance Floors    Jun-Oct        +20% bookings      +15%         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [📥 Download Full Report]  [📊 Detailed Category Analysis]           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Forecast accuracy | Within 15% of actual |
| User engagement | 70% monthly active |
| Recommendation action rate | 40% acted upon |
| User satisfaction | 4.3/5 rating |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Data aggregation pipeline | 3 days | Week 1 |
| Forecasting algorithms | 4 days | Week 1-2 |
| Recommendation engine | 2 days | Week 2 |
| UI/UX implementation | 3 days | Week 2-3 |
| Category-level analysis | 2 days | Week 3 |
| Export/reporting | 1 day | Week 3 |
| Testing & validation | 2 days | Week 3-4 |
| **Total** | **17 days** | **4 weeks** |

## Future Enhancements

1. **Weather integration:** Factor in weather patterns
2. **Local event calendar:** Major events in area
3. **Economic indicators:** Wedding industry trends
4. **Machine learning:** Improve accuracy over time
5. **Automated actions:** Auto-adjust pricing based on demand
6. **Inventory suggestions:** "Buy X chairs before May"
