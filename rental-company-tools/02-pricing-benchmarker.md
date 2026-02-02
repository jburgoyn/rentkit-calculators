# Pricing Benchmarker

## Overview

A tool that allows rental companies to compare their pricing against anonymized, aggregated data from other RentKit users in similar markets—providing competitive intelligence without revealing individual company data.

## Problem Statement

Rental companies struggle with pricing decisions:
- "Am I charging too much and losing business?"
- "Am I underpricing and leaving money on the table?"
- "What do competitors charge for chiavari chairs?"
- No good data sources for market pricing
- Pricing often based on gut feeling

## Target Audience

- **Primary:** Rental company owners setting prices
- **Secondary:** Sales teams justifying pricing to customers
- **Tertiary:** New rental companies establishing initial pricing

## Value Proposition (Network Effect)

**This tool becomes more valuable as more RentKit users participate:**
- Aggregated data from the RentKit network
- Regional and market-specific insights
- Anonymized to protect competitive info
- Opt-in participation

## Key Features

### 1. Item Selection
- Select from your inventory
- Or browse common rental items
- Category filtering

### 2. Market Definition
- Geographic region
- Market size (metro, suburban, rural)
- Market type (luxury, mid-range, budget)
- Event types served

### 3. Benchmark Data Display
- Your price vs market median
- Price distribution (percentiles)
- Regional variations
- Trend over time (if historical data)

### 4. Pricing Insights
- Where you rank in your market
- Suggested price ranges
- Price elasticity estimates
- Competitor density by price point

### 5. What-If Analysis
- "If I lower by 10%, where would I rank?"
- Volume sensitivity modeling
- Revenue optimization suggestions

## Technical Requirements

### Data Model

```typescript
interface PricingBenchmark {
  itemCategory: string;
  itemType: string;        // "chiavari_chair", "60_round_table"
  itemVariant?: string;    // "gold", "white", "wood"

  yourPrice: number;
  yourMarket: MarketDefinition;

  benchmarkData: {
    sampleSize: number;
    median: number;
    mean: number;
    percentiles: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    priceRange: { min: number; max: number };
    yourPercentile: number;
  };

  regionalData?: {
    [region: string]: {
      median: number;
      sampleSize: number;
    };
  };

  trendData?: {
    [period: string]: number;  // median price by quarter
  };
}

interface MarketDefinition {
  region: string;           // "West Coast", "Northeast", etc.
  state?: string;
  marketSize: 'metro' | 'suburban' | 'rural';
  marketTier: 'luxury' | 'mid_range' | 'budget' | 'mixed';
  primaryEventTypes: string[];
}
```

### Data Aggregation Logic

```typescript
// Server-side aggregation (protects individual data)
async function getBenchmarkData(
  itemType: string,
  market: MarketDefinition,
  requesterOrgId: string
): Promise<BenchmarkData> {
  // Query all RentKit orgs in similar markets
  const similarOrgs = await db.collection('orgs')
    .where('market.region', '==', market.region)
    .where('market.marketSize', '==', market.marketSize)
    .where('benchmarkOptIn', '==', true)
    .get();

  // Get pricing for this item type from each org
  const prices: number[] = [];
  for (const org of similarOrgs.docs) {
    if (org.id === requesterOrgId) continue; // Exclude requester

    const item = await db.collection(`orgs/${org.id}/inventory`)
      .where('itemType', '==', itemType)
      .limit(1)
      .get();

    if (!item.empty) {
      const rate = item.docs[0].data().rates?.daily ||
                   item.docs[0].data().rates?.default;
      if (rate) prices.push(rate);
    }
  }

  // Require minimum sample size for privacy
  if (prices.length < 5) {
    return { insufficient: true, message: 'Not enough data in your market' };
  }

  // Calculate statistics
  prices.sort((a, b) => a - b);
  return {
    sampleSize: prices.length,
    median: calculateMedian(prices),
    mean: prices.reduce((a, b) => a + b, 0) / prices.length,
    percentiles: {
      p10: prices[Math.floor(prices.length * 0.1)],
      p25: prices[Math.floor(prices.length * 0.25)],
      p50: prices[Math.floor(prices.length * 0.5)],
      p75: prices[Math.floor(prices.length * 0.75)],
      p90: prices[Math.floor(prices.length * 0.9)],
    },
    priceRange: { min: prices[0], max: prices[prices.length - 1] }
  };
}
```

### Privacy Protections

```typescript
const PRIVACY_RULES = {
  minimumSampleSize: 5,           // Won't show data if fewer contributors
  noIndividualPrices: true,       // Only aggregates, never specific prices
  excludeRequester: true,         // Your data not included in your view
  regionMinimum: 3,               // Need 3+ orgs to show regional data
  optInRequired: true,            // Orgs must opt-in to contribute
  dataRefreshInterval: 'weekly',  // Not real-time to obscure timing
};
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Pricing Benchmarker                                    [RentKit]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  See how your pricing compares to the market.                          │
│  Data aggregated from 200+ rental companies • Updated weekly           │
│                                                                         │
│  SELECT AN ITEM                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Category: [Chairs              ▼]                                │   │
│  │ Item:     [Chiavari Chair - Gold▼]                              │   │
│  │                                                                   │   │
│  │ Your Current Price: $8.00 per day                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  YOUR MARKET                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Region: [Pacific Northwest    ▼]  Size: [Metro         ▼]      │   │
│  │ Market Tier: [Mid-Range       ▼]                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  📈 MARKET BENCHMARK: Gold Chiavari Chair                              │
│  Based on 23 rental companies in your market                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  PRICE DISTRIBUTION                                              │   │
│  │                                                                   │   │
│  │   $5    $6    $7    $8    $9    $10   $11   $12   $13          │   │
│  │    │     │     │     │     │     │     │     │     │            │   │
│  │    ░░░░░░░███████████████████████░░░░░░░░░                      │   │
│  │              25th        median      75th                        │   │
│  │              $6.50       $8.25       $10.00                      │   │
│  │                                                                   │   │
│  │                    ▲                                             │   │
│  │              YOUR PRICE: $8.00                                   │   │
│  │              You're at the 45th percentile                       │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  💡 INSIGHTS                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  ✓ Your pricing is competitive                                   │   │
│  │    You're slightly below the market median ($8.25)              │   │
│  │                                                                   │   │
│  │  📊 Market breakdown:                                            │   │
│  │    • Budget tier (< $7): 22% of market                          │   │
│  │    • Mid-range ($7-10): 52% of market ← You're here             │   │
│  │    • Premium (> $10): 26% of market                             │   │
│  │                                                                   │   │
│  │  📈 Price trend: +5% over past 12 months                        │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🔍 WHAT-IF ANALYSIS                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  If you price at:       You'd rank:       Market position:      │   │
│  │  $7.00 (-12%)          30th percentile   Budget-competitive     │   │
│  │  $8.00 (current)       45th percentile   Mid-range              │   │
│  │  $9.00 (+12%)          60th percentile   Mid-high range         │   │
│  │  $10.00 (+25%)         75th percentile   Premium positioning    │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🌎 REGIONAL COMPARISON                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Region              Median    Your Price    vs. Region         │   │
│  │  Pacific Northwest   $8.25     $8.00         -3%                │   │
│  │  California          $10.50    $8.00         -24%               │   │
│  │  Mountain West       $7.00     $8.00         +14%               │   │
│  │  National Avg        $8.75     $8.00         -9%                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [Check Another Item]  [📥 Download Report]  [Update My Pricing →]    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────     │
│  📊 Data Contribution: You're opted IN                                 │
│  Your anonymous pricing data helps improve market insights for all.    │
│  [Manage Data Sharing Settings]                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Opt-in rate | 60% of active RentKit users |
| Weekly active users | 200+ |
| Price updates influenced | Track changes after benchmarking |
| Feature satisfaction | 4.5/5 rating |
| Data quality | 50+ contributors per major market |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Data aggregation backend | 3 days | Week 1 |
| Privacy/anonymization layer | 2 days | Week 1-2 |
| UI/UX implementation | 3 days | Week 2 |
| What-if analysis | 1 day | Week 3 |
| Regional comparisons | 1 day | Week 3 |
| Opt-in/settings UI | 1 day | Week 3 |
| Testing & polish | 2 days | Week 3-4 |
| **Total** | **13 days** | **3-4 weeks** |

## Data Privacy & Ethics

### Transparency
- Clear opt-in process
- Explanation of how data is used
- Easy opt-out anytime

### Anonymization
- No individual prices ever shown
- Minimum sample sizes enforced
- No way to identify specific competitors

### Value Exchange
- Contributors get better data
- Non-contributors get limited access
- Incentivizes network participation

## Future Enhancements

1. **Demand signals:** "Searches for this item are up 20% in your area"
2. **Seasonal pricing:** Benchmark by time of year
3. **Package pricing:** Compare bundle prices, not just items
4. **Competitor tracking:** Alert when market prices shift
5. **AI pricing suggestions:** Dynamic pricing recommendations
6. **Revenue estimation:** "Raising price $1 would yield +$X/year"
