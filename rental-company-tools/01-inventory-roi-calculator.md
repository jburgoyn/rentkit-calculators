# Inventory ROI Calculator

## Overview

A tool that helps rental company owners calculate the return on investment for inventory purchases, determining break-even points and projected profitability.

## Problem Statement

Rental company owners struggle with inventory investment decisions:
- "Should I buy 50 more chiavari chairs?"
- "When will this tent pay for itself?"
- "Is upgrading to premium linens worth it?"
- Emotional decisions vs data-driven decisions

## Target Audience

- **Primary:** Rental company owners (RentKit customers)
- **Secondary:** Rental company managers making purchase recommendations
- **Tertiary:** Investors/partners evaluating rental businesses

## Value Proposition

- Justify equipment purchases with data
- Compare different inventory investment options
- Set realistic rental pricing based on ROI targets
- Plan capital expenditure timing

## Key Features

### 1. Item Information
- Item name and category
- Purchase price (per unit)
- Quantity to purchase
- Expected useful life (years)
- Maintenance costs (annual)
- Storage costs (if applicable)

### 2. Revenue Projections
- Expected rental rate
- Seasonal utilization rates
- Average rental duration
- Replacement/damage rate

### 3. Cost Analysis
- Total purchase cost
- Annual depreciation
- Maintenance and cleaning costs
- Storage allocation
- Insurance costs

### 4. ROI Calculations
- Break-even point (rentals needed)
- Break-even timeline
- Annual ROI percentage
- Lifetime ROI
- Cash flow projections

### 5. Comparison Mode
- Compare multiple items side-by-side
- Compare buy vs continue renting from supplier
- Compare different quantity scenarios

## Technical Requirements

### Data Model

```typescript
interface InventoryROICalculation {
  item: {
    name: string;
    category: string;
    purchasePrice: number;
    quantity: number;
    usefulLifeYears: number;
  };

  costs: {
    annualMaintenance: number;      // per unit
    annualStorage: number;          // per unit
    annualInsurance: number;        // per unit
    replacementRate: number;        // % per year lost/damaged
  };

  revenue: {
    rentalRate: number;             // per rental period
    avgRentalDays: number;
    utilizationRate: {
      peak: number;                 // % (May-Oct typically)
      offPeak: number;              // % (Nov-Apr)
    };
    peakMonths: number;             // How many months are "peak"
  };

  financing?: {
    financed: boolean;
    downPayment: number;
    interestRate: number;
    termMonths: number;
  };
}

interface ROIResult {
  totalInvestment: number;
  annualRevenue: number;
  annualCosts: number;
  annualProfit: number;
  breakEvenRentals: number;
  breakEvenMonths: number;
  yearOneROI: number;
  fiveYearROI: number;
  lifetimeROI: number;
  monthlyProjections: MonthlyProjection[];
  recommendation: string;
}
```

### Calculation Logic

```typescript
function calculateInventoryROI(input: InventoryROICalculation): ROIResult {
  const { item, costs, revenue, financing } = input;

  // Total investment
  const totalInvestment = item.purchasePrice * item.quantity;

  // Annual revenue calculation
  const peakMonthRevenue = (revenue.utilizationRate.peak / 100) *
    (30 / revenue.avgRentalDays) * revenue.rentalRate * item.quantity;
  const offPeakMonthRevenue = (revenue.utilizationRate.offPeak / 100) *
    (30 / revenue.avgRentalDays) * revenue.rentalRate * item.quantity;

  const annualRevenue =
    (peakMonthRevenue * revenue.peakMonths) +
    (offPeakMonthRevenue * (12 - revenue.peakMonths));

  // Annual costs
  const annualDepreciation = totalInvestment / item.usefulLifeYears;
  const annualMaintenance = costs.annualMaintenance * item.quantity;
  const annualStorage = costs.annualStorage * item.quantity;
  const annualInsurance = costs.annualInsurance * item.quantity;
  const annualReplacement = (costs.replacementRate / 100) * totalInvestment;

  const annualCosts = annualMaintenance + annualStorage +
    annualInsurance + annualReplacement;

  // Add financing costs if applicable
  let financingCosts = 0;
  if (financing?.financed) {
    const principal = totalInvestment - financing.downPayment;
    const monthlyRate = financing.interestRate / 100 / 12;
    const monthlyPayment = principal *
      (monthlyRate * Math.pow(1 + monthlyRate, financing.termMonths)) /
      (Math.pow(1 + monthlyRate, financing.termMonths) - 1);
    financingCosts = (monthlyPayment * 12) - (principal / (financing.termMonths / 12));
  }

  // Profit calculations
  const annualProfit = annualRevenue - annualCosts - financingCosts;
  const yearOneROI = (annualProfit / totalInvestment) * 100;

  // Break-even calculations
  const profitPerRental = revenue.rentalRate -
    (annualCosts / (annualRevenue / revenue.rentalRate));
  const breakEvenRentals = Math.ceil(totalInvestment / profitPerRental);

  // Estimate months to break even
  const avgMonthlyRentals = annualRevenue / revenue.rentalRate / 12;
  const breakEvenMonths = Math.ceil(breakEvenRentals / avgMonthlyRentals);

  // Multi-year projections
  const fiveYearRevenue = annualRevenue * 5;
  const fiveYearCosts = annualCosts * 5;
  const fiveYearProfit = fiveYearRevenue - fiveYearCosts - totalInvestment;
  const fiveYearROI = (fiveYearProfit / totalInvestment) * 100;

  const lifetimeRevenue = annualRevenue * item.usefulLifeYears;
  const lifetimeCosts = annualCosts * item.usefulLifeYears;
  const lifetimeProfit = lifetimeRevenue - lifetimeCosts - totalInvestment;
  const lifetimeROI = (lifetimeProfit / totalInvestment) * 100;

  return {
    totalInvestment,
    annualRevenue,
    annualCosts,
    annualProfit,
    breakEvenRentals,
    breakEvenMonths,
    yearOneROI,
    fiveYearROI,
    lifetimeROI,
    monthlyProjections: generateMonthlyProjections(input),
    recommendation: generateRecommendation(yearOneROI, breakEvenMonths, item.usefulLifeYears)
  };
}

function generateRecommendation(roi: number, breakEven: number, lifeYears: number): string {
  if (roi > 50 && breakEven < 12) {
    return "Strong investment - breaks even in under a year with excellent returns";
  } else if (roi > 25 && breakEven < 24) {
    return "Good investment - solid returns within reasonable timeframe";
  } else if (roi > 10 && breakEven < lifeYears * 12 * 0.5) {
    return "Moderate investment - consider if fills a gap in your inventory";
  } else if (breakEven > lifeYears * 12) {
    return "Caution - may not break even within useful life";
  }
  return "Marginal - review pricing or utilization assumptions";
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Inventory ROI Calculator                               [RentKit]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Should you buy it? Let's find out.                                    │
│                                                                         │
│  ITEM DETAILS                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Item: [Chiavari Chairs - Gold            ]  Category: [Chairs▼] │   │
│  │                                                                   │   │
│  │ Purchase Price: $[  45  ] per unit     Quantity: [  50  ] units │   │
│  │                                                                   │   │
│  │ Expected Life: [  8  ] years           Total Investment: $2,250  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  REVENUE ASSUMPTIONS                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Rental Rate: $[  8  ] per chair per event                       │   │
│  │                                                                   │   │
│  │ Utilization:                                                      │   │
│  │   Peak Season (May-Oct):    ○════════════●══○  70%              │   │
│  │   Off-Peak (Nov-Apr):       ○════●══════════○  30%              │   │
│  │                                                                   │   │
│  │ Avg events per month (peak):     12 events × 15 chairs = 180    │   │
│  │ Avg events per month (off-peak): 5 events × 12 chairs = 60      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ONGOING COSTS                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Maintenance/Cleaning: $[ 5 ]/unit/year   Storage: $[ 2 ]/unit/yr│   │
│  │ Insurance: $[ 1 ]/unit/year              Loss/Damage Rate: [ 3 ]%│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ☐ Include Financing?  Down: $[   ] Rate: [  ]% Term: [  ] months    │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  📈 YOUR ROI ANALYSIS                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  💰 INVESTMENT SUMMARY                                           │   │
│  │  Total Investment:        $2,250                                 │   │
│  │  Annual Revenue:          $5,760 (720 rentals × $8)             │   │
│  │  Annual Costs:            $465                                   │   │
│  │  Annual Profit:           $5,295                                 │   │
│  │                                                                   │   │
│  │  ═══════════════════════════════════════════════════════════    │   │
│  │                                                                   │   │
│  │  🎯 BREAK-EVEN ANALYSIS                                          │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Break-even rentals:     282 chair rentals               │    │   │
│  │  │  Break-even time:        ~5 months                       │    │   │
│  │  │                                                           │    │   │
│  │  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  5 mo       │    │   │
│  │  │  ↑ Break even                              ↑ Year 1      │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                   │   │
│  │  📊 ROI PROJECTIONS                                              │   │
│  │                                                                   │   │
│  │  Year 1 ROI:    235%  ████████████████████████████████████████  │   │
│  │  Year 3 ROI:    705%  (cumulative)                              │   │
│  │  Year 5 ROI:   1,175%  (cumulative)                             │   │
│  │  Lifetime ROI: 1,880%  (8 years)                                │   │
│  │                                                                   │   │
│  │  ✅ RECOMMENDATION: Strong Investment                            │   │
│  │     Breaks even in under 6 months with excellent long-term      │   │
│  │     returns. At $8/rental, this is a solid addition to          │   │
│  │     your inventory.                                              │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  SENSITIVITY ANALYSIS                                                   │
│  What if utilization is lower?                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Utilization    Break-Even    Year 1 ROI    Verdict              │   │
│  │ 100% of est.   5 months      235%          ✅ Strong            │   │
│  │ 75% of est.    7 months      165%          ✅ Good              │   │
│  │ 50% of est.    12 months     95%           ⚠️ Moderate         │   │
│  │ 25% of est.    28 months     25%           ❌ Weak              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [📊 Compare Another Item]  [📥 Download Report]  [💾 Save Analysis]   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly uses by RentKit customers | 500+ |
| Calculations saved | 40% |
| Purchase decisions influenced | Track via surveys |
| Feature satisfaction | 4.5/5 rating |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Core calculation engine | 2 days | Week 1 |
| UI/UX implementation | 2 days | Week 1 |
| Comparison mode | 1 day | Week 2 |
| Sensitivity analysis | 1 day | Week 2 |
| Export/save features | 1 day | Week 2 |
| Testing & polish | 1 day | Week 2 |
| **Total** | **8 days** | **2 weeks** |

## Integration Points

- Pull current inventory data to pre-fill rental rates
- Access historical utilization data from RentKit
- Save calculations to user account
- Link to purchase planning/budgeting

## Future Enhancements

1. **Historical performance:** Show actual ROI for similar items in portfolio
2. **Market comparison:** How does your utilization compare to industry?
3. **Seasonal projections:** Month-by-month cash flow visualization
4. **Portfolio view:** See ROI across all inventory categories
5. **AI recommendations:** "Based on your market, consider..."
