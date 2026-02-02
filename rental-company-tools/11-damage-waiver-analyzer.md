# Damage Waiver Analyzer

## Overview

A tool that analyzes damage waiver performance, helping rental companies optimize waiver pricing and coverage based on actual claims data.

## Problem Statement

Damage waiver pricing is often arbitrary:
- Is our waiver rate profitable?
- Which items have high damage rates?
- Are we over/under charging?
- Should we adjust coverage terms?

## Target Audience

- **Primary:** Rental company owners (pricing decisions)
- **Secondary:** Operations managers (damage prevention)
- **Tertiary:** Insurance/risk management

## Key Features

### 1. Waiver Revenue Tracking
- Total waiver fees collected
- Waiver attachment rate (% of orders)
- Revenue by category
- Trend over time

### 2. Claims Analysis
- Total claims paid
- Claims by item category
- Average claim amount
- Claim frequency rates

### 3. Profitability Analysis
- Net waiver profit/loss
- Profit by item category
- Break-even analysis
- Rate recommendations

### 4. Item Risk Profiling
- High-risk items (frequent claims)
- High-cost items (expensive claims)
- Items to exclude from waiver
- Suggested rate adjustments

## Technical Requirements

### Data Model

```typescript
interface DamageWaiverAnalysis {
  period: { start: Date; end: Date };

  revenue: {
    totalWaiverFees: number;
    ordersWithWaiver: number;
    totalOrders: number;
    attachmentRate: number;
    averageWaiverFee: number;
    byCategory: CategoryRevenue[];
  };

  claims: {
    totalClaims: number;
    totalClaimAmount: number;
    claimCount: number;
    averageClaimAmount: number;
    claimRate: number;          // % of waiver orders with claims
    byCategory: CategoryClaims[];
  };

  profitability: {
    netProfit: number;
    profitMargin: number;
    lossRatio: number;          // claims / revenue
    byCategory: CategoryProfitability[];
  };

  recommendations: Recommendation[];
  riskProfile: ItemRiskProfile[];
}

interface CategoryProfitability {
  category: string;
  revenue: number;
  claims: number;
  netProfit: number;
  lossRatio: number;
  recommendation: 'increase_rate' | 'maintain' | 'exclude' | 'decrease_rate';
}

interface ItemRiskProfile {
  itemId: string;
  itemName: string;
  totalRentals: number;
  damageIncidents: number;
  damageRate: number;
  totalDamageCost: number;
  averageDamageCost: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  suggestedAction: string;
}
```

### Calculation Logic

```typescript
async function analyzeDamageWaiver(
  orgId: string,
  period: { start: Date; end: Date }
): Promise<DamageWaiverAnalysis> {
  // Get all invoices in period
  const invoices = await getInvoices(orgId, period);

  // Calculate waiver revenue
  const ordersWithWaiver = invoices.filter(i => i.damageWaiverFee > 0);
  const totalWaiverFees = ordersWithWaiver.reduce((sum, i) =>
    sum + i.damageWaiverFee, 0);

  // Get damage claims
  const claims = await getDamageClaims(orgId, period);
  const claimsOnWaiverOrders = claims.filter(c =>
    ordersWithWaiver.some(o => o.id === c.invoiceId));

  const totalClaimAmount = claimsOnWaiverOrders.reduce((sum, c) =>
    sum + c.amount, 0);

  // Profitability
  const netProfit = totalWaiverFees - totalClaimAmount;
  const lossRatio = totalClaimAmount / totalWaiverFees;

  // Calculate by category
  const categoryAnalysis = analyzeByCategory(ordersWithWaiver, claimsOnWaiverOrders);

  // Item risk profiling
  const riskProfiles = await calculateItemRiskProfiles(orgId, period);

  // Generate recommendations
  const recommendations = generateRecommendations(
    lossRatio,
    categoryAnalysis,
    riskProfiles
  );

  return {
    period,
    revenue: {
      totalWaiverFees,
      ordersWithWaiver: ordersWithWaiver.length,
      totalOrders: invoices.length,
      attachmentRate: (ordersWithWaiver.length / invoices.length) * 100,
      averageWaiverFee: totalWaiverFees / ordersWithWaiver.length,
      byCategory: categoryAnalysis.revenue
    },
    claims: {
      totalClaims: claimsOnWaiverOrders.length,
      totalClaimAmount,
      claimCount: claimsOnWaiverOrders.length,
      averageClaimAmount: totalClaimAmount / claimsOnWaiverOrders.length || 0,
      claimRate: (claimsOnWaiverOrders.length / ordersWithWaiver.length) * 100,
      byCategory: categoryAnalysis.claims
    },
    profitability: {
      netProfit,
      profitMargin: (netProfit / totalWaiverFees) * 100,
      lossRatio: lossRatio * 100,
      byCategory: categoryAnalysis.profitability
    },
    recommendations,
    riskProfile: riskProfiles
  };
}

function generateRecommendations(
  lossRatio: number,
  categoryAnalysis: any,
  riskProfiles: ItemRiskProfile[]
): Recommendation[] {
  const recommendations = [];

  // Overall profitability
  if (lossRatio > 0.7) {
    recommendations.push({
      type: 'pricing',
      priority: 'high',
      message: 'Loss ratio of ' + (lossRatio * 100).toFixed(0) + '% is too high',
      action: 'Consider increasing waiver rate by 20-30%'
    });
  } else if (lossRatio < 0.3) {
    recommendations.push({
      type: 'pricing',
      priority: 'low',
      message: 'Strong profitability with ' + (lossRatio * 100).toFixed(0) + '% loss ratio',
      action: 'Current pricing appears appropriate'
    });
  }

  // Category-specific
  for (const cat of categoryAnalysis.profitability) {
    if (cat.lossRatio > 1.0) {
      recommendations.push({
        type: 'category',
        priority: 'high',
        message: `${cat.category} is unprofitable (${(cat.lossRatio * 100).toFixed(0)}% loss ratio)`,
        action: `Consider excluding ${cat.category} from waiver or increasing rate`
      });
    }
  }

  // High-risk items
  const veryHighRiskItems = riskProfiles.filter(r => r.riskLevel === 'very_high');
  if (veryHighRiskItems.length > 0) {
    recommendations.push({
      type: 'items',
      priority: 'medium',
      message: `${veryHighRiskItems.length} items have very high damage rates`,
      action: 'Review handling procedures or exclude from waiver'
    });
  }

  return recommendations;
}
```

## UI Design Preview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🛡️ Damage Waiver Analyzer                                  [RentKit]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Period: [Last 12 Months ▼]                              [Refresh]     │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  📊 WAIVER PERFORMANCE SUMMARY                                         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────┐│
│  │ $48,500        │ │ $18,200        │ │ $30,300        │ │ 37.5%    ││
│  │ Waiver Revenue │ │ Claims Paid    │ │ Net Profit     │ │ Loss     ││
│  │ 72% attach rate│ │ 24 claims      │ │ 62.5% margin   │ │ Ratio    ││
│  │ ✅ Healthy     │ │ 3.2% claim rate│ │ ✅ Profitable  │ │ ✅ Good  ││
│  └────────────────┘ └────────────────┘ └────────────────┘ └──────────┘│
│                                                                         │
│  📈 CATEGORY BREAKDOWN                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Category     │ Revenue │ Claims  │ Profit  │ Loss %  │ Status  │   │
│  ├──────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤   │
│  │ Linens       │ $12,400 │  $2,100 │ $10,300 │   17%   │ ✅ Good │   │
│  │ Tables       │ $15,200 │  $5,800 │  $9,400 │   38%   │ ✅ OK   │   │
│  │ Chairs       │ $14,600 │  $6,200 │  $8,400 │   42%   │ 🟡 Watch│   │
│  │ Glassware    │  $4,800 │  $3,500 │  $1,300 │   73%   │ 🔴 Risk │   │
│  │ Dance Floors │  $1,500 │    $600 │    $900 │   40%   │ ✅ OK   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ⚠️ HIGH-RISK ITEMS                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Item              │ Rentals │ Damage Rate │ Avg Cost │ Action   │   │
│  ├───────────────────┼─────────┼─────────────┼──────────┼──────────┤   │
│  │ Wine Glasses      │    450  │    8.2%     │   $45    │ Exclude? │   │
│  │ Champagne Flutes  │    320  │    6.5%     │   $38    │ ↑ Rate   │   │
│  │ White Linens      │    680  │    5.1%     │   $28    │ Monitor  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  💡 RECOMMENDATIONS                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔴 HIGH: Consider excluding wine glasses from damage waiver     │   │
│  │    8.2% damage rate is 3x the average - unprofitable to cover  │   │
│  │                                                                   │   │
│  │ 🟡 MEDIUM: Review glassware category pricing                     │   │
│  │    73% loss ratio suggests rate increase of 25% needed          │   │
│  │                                                                   │   │
│  │ 🟢 LOW: Overall waiver program is healthy and profitable        │   │
│  │    62.5% margin exceeds industry benchmark of 50%               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [📥 Export Analysis]  [📊 Historical Trends]  [⚙️ Adjust Rates]       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Waiver profitability | Maintain 50%+ margin |
| User engagement | 30% monthly active |
| Rate optimization | Track adjustments made |
| Loss ratio improvement | -10% for users |

## Implementation Effort

**Total: 8 days / 2 weeks**

---
