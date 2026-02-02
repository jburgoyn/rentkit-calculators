# Depreciation Calculator

## Overview

A tool that calculates tax depreciation schedules for rental inventory, helping owners maximize tax benefits and plan for equipment replacement.

## Problem Statement

Depreciation tracking is often neglected:
- Missing tax deductions
- No visibility into asset book values
- Poor replacement planning
- Accountant dependency for simple calculations

## Target Audience

- **Primary:** Rental company owners (tax planning)
- **Secondary:** Accountants/bookkeepers
- **Tertiary:** Investors evaluating businesses

## Key Features

### 1. Asset Entry
- Purchase date and price
- Asset category
- Useful life selection
- Depreciation method

### 2. Depreciation Methods
- Straight-line
- MACRS (Modified Accelerated Cost Recovery)
- Section 179 deduction
- Bonus depreciation

### 3. Schedule Generation
- Year-by-year depreciation
- Cumulative depreciation
- Book value tracking
- Tax year summaries

### 4. Portfolio View
- All assets summary
- Total depreciation by year
- Upcoming fully depreciated items
- Replacement planning

## Technical Requirements

### Calculation Logic

```typescript
interface DepreciationAsset {
  id: string;
  name: string;
  category: string;
  purchaseDate: Date;
  purchasePrice: number;
  usefulLifeYears: number;
  salvageValue: number;
  depreciationMethod: 'straight_line' | 'macrs_5' | 'macrs_7' | 'section_179';
}

interface DepreciationSchedule {
  asset: DepreciationAsset;
  schedule: YearlyDepreciation[];
  totalDepreciation: number;
  currentBookValue: number;
}

interface YearlyDepreciation {
  year: number;
  beginningValue: number;
  depreciation: number;
  endingValue: number;
  cumulativeDepreciation: number;
}

// MACRS rates for different property classes
const MACRS_RATES = {
  '5_year': [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576],
  '7_year': [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
};

function calculateDepreciation(asset: DepreciationAsset): DepreciationSchedule {
  const schedule: YearlyDepreciation[] = [];
  const depreciableBase = asset.purchasePrice - asset.salvageValue;

  if (asset.depreciationMethod === 'straight_line') {
    const annualDepreciation = depreciableBase / asset.usefulLifeYears;

    for (let year = 1; year <= asset.usefulLifeYears; year++) {
      const beginningValue = asset.purchasePrice - (annualDepreciation * (year - 1));
      schedule.push({
        year,
        beginningValue,
        depreciation: annualDepreciation,
        endingValue: beginningValue - annualDepreciation,
        cumulativeDepreciation: annualDepreciation * year
      });
    }
  } else if (asset.depreciationMethod.startsWith('macrs')) {
    const rates = MACRS_RATES[asset.depreciationMethod.replace('macrs_', '') + '_year'];
    let cumulative = 0;

    rates.forEach((rate, index) => {
      const depreciation = asset.purchasePrice * rate;
      cumulative += depreciation;
      schedule.push({
        year: index + 1,
        beginningValue: asset.purchasePrice - cumulative + depreciation,
        depreciation,
        endingValue: asset.purchasePrice - cumulative,
        cumulativeDepreciation: cumulative
      });
    });
  } else if (asset.depreciationMethod === 'section_179') {
    // Full deduction in year 1 (up to limits)
    const maxSection179 = 1160000; // 2023 limit
    const deduction = Math.min(asset.purchasePrice, maxSection179);
    schedule.push({
      year: 1,
      beginningValue: asset.purchasePrice,
      depreciation: deduction,
      endingValue: asset.purchasePrice - deduction,
      cumulativeDepreciation: deduction
    });
  }

  return {
    asset,
    schedule,
    totalDepreciation: schedule.reduce((sum, y) => sum + y.depreciation, 0),
    currentBookValue: schedule[schedule.length - 1]?.endingValue || asset.purchasePrice
  };
}
```

## UI Design Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  📉 Depreciation Calculator                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ASSET DETAILS                                                  │
│  Item: [50 Gold Chiavari Chairs    ]  Category: [Furniture ▼]  │
│  Purchase Date: [01/15/2023]          Price: $[ 2,250 ]        │
│  Useful Life: [ 7 ] years             Salvage: $[ 225 ]        │
│  Method: ○ Straight-Line  ● MACRS 7-Year  ○ Section 179        │
│                                                                 │
│  ═════════════════════════════════════════════════════════════ │
│                                                                 │
│  📊 DEPRECIATION SCHEDULE                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Year │ Beginning │ Depreciation │  Ending  │ Cumulative  │ │
│  │      │   Value   │              │  Value   │             │ │
│  ├──────┼───────────┼──────────────┼──────────┼─────────────┤ │
│  │ 2023 │  $2,250   │    $321      │ $1,929   │    $321     │ │
│  │ 2024 │  $1,929   │    $551      │ $1,378   │    $872     │ │
│  │ 2025 │  $1,378   │    $393      │   $985   │  $1,265     │ │
│  │ 2026 │    $985   │    $281      │   $704   │  $1,546     │ │
│  │ 2027 │    $704   │    $201      │   $503   │  $1,747     │ │
│  │ 2028 │    $503   │    $201      │   $302   │  $1,948     │ │
│  │ 2029 │    $302   │    $201      │   $101   │  $2,149     │ │
│  │ 2030 │    $101   │    $100      │     $1   │  $2,249     │ │ (partial)
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  2024 TAX DEDUCTION: $551                                       │
│  Current Book Value: $1,378                                     │
│                                                                 │
│  💡 Note: Consult your tax professional for specific advice     │
│                                                                 │
│  [📥 Export Schedule]  [➕ Add to Portfolio]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| User adoption | 40% of RentKit customers |
| Tax savings identified | Track user feedback |
| Export usage | 60% export schedules |

## Implementation Effort

**Total: 5 days / 1 week**

---
