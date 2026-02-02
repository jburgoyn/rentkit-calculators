# Cash Flow Forecaster

## Overview

A tool that projects future cash flow based on booked orders, expected payments, and seasonal patterns—helping rental companies plan financially.

## Problem Statement

Cash flow surprises hurt rental businesses:
- Big deposits in spring, expenses all year
- Seasonal payment timing mismatches
- Vendor payments vs customer payments
- Growth opportunities missed due to cash constraints

## Target Audience

- **Primary:** Rental company owners (financial planning)
- **Secondary:** Finance managers/bookkeepers
- **Tertiary:** Investors/lenders evaluating businesses

## Key Features

### 1. Revenue Projection
- Booked orders (confirmed revenue)
- Expected bookings (based on history)
- Payment timing estimates
- Deposit vs balance schedules

### 2. Expense Projection
- Recurring expenses
- Seasonal costs (inventory prep)
- Payroll patterns
- One-time expenses

### 3. Cash Flow Calendar
- Weekly/monthly view
- Net cash position
- Low cash warnings
- Surplus identification

### 4. Scenario Planning
- What-if analysis
- Growth scenarios
- Expense changes
- Seasonal adjustments

## Technical Requirements

### Data Model

```typescript
interface CashFlowForecast {
  period: { start: Date; end: Date };

  projectedInflows: CashInflow[];
  projectedOutflows: CashOutflow[];

  weeklyProjection: WeeklyForecast[];
  monthlyProjection: MonthlyForecast[];

  summary: {
    totalInflows: number;
    totalOutflows: number;
    netCashFlow: number;
    lowestPoint: { date: Date; balance: number };
    highestPoint: { date: Date; balance: number };
  };

  alerts: CashFlowAlert[];
}

interface CashInflow {
  source: 'booked_order' | 'expected_booking' | 'deposit' | 'balance_due' | 'other';
  orderId?: string;
  expectedDate: Date;
  amount: number;
  probability: number; // 100% for booked, less for expected
  notes?: string;
}

interface CashOutflow {
  category: 'payroll' | 'rent' | 'utilities' | 'inventory' | 'vehicle' | 'insurance' | 'other';
  description: string;
  expectedDate: Date;
  amount: number;
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
}

interface WeeklyForecast {
  weekStart: Date;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  inflowDetails: CashInflow[];
  outflowDetails: CashOutflow[];
}
```

### Calculation Logic

```typescript
async function generateCashFlowForecast(
  orgId: string,
  startingBalance: number,
  period: { start: Date; end: Date }
): Promise<CashFlowForecast> {
  // Get confirmed orders with payment schedules
  const orders = await getOrders(orgId, { status: ['confirmed', 'deposit_paid'] });

  const inflows: CashInflow[] = [];

  for (const order of orders) {
    const eventDate = new Date(order.eventDate);

    // Deposit (usually paid at booking or 30 days out)
    if (order.depositAmount && order.depositStatus !== 'paid') {
      inflows.push({
        source: 'deposit',
        orderId: order.id,
        expectedDate: order.depositDueDate || subtractDays(eventDate, 30),
        amount: order.depositAmount,
        probability: 0.95
      });
    }

    // Balance due (typically 7-14 days before event)
    if (order.balanceDue > 0) {
      inflows.push({
        source: 'balance_due',
        orderId: order.id,
        expectedDate: subtractDays(eventDate, 7),
        amount: order.balanceDue,
        probability: 0.90
      });
    }
  }

  // Add expected bookings based on historical patterns
  const expectedBookings = await predictExpectedBookings(orgId, period);
  inflows.push(...expectedBookings);

  // Get recurring expenses
  const expenses = await getRecurringExpenses(orgId);
  const outflows: CashOutflow[] = expandRecurringExpenses(expenses, period);

  // Generate weekly projection
  const weeklyProjection = generateWeeklyProjection(
    startingBalance,
    inflows,
    outflows,
    period
  );

  // Identify alerts
  const alerts = identifyAlerts(weeklyProjection, startingBalance);

  return {
    period,
    projectedInflows: inflows,
    projectedOutflows: outflows,
    weeklyProjection,
    monthlyProjection: aggregateToMonthly(weeklyProjection),
    summary: calculateSummary(weeklyProjection),
    alerts
  };
}

function identifyAlerts(projection: WeeklyForecast[], startingBalance: number): CashFlowAlert[] {
  const alerts = [];
  const warningThreshold = startingBalance * 0.2; // Warn at 20% of starting

  for (const week of projection) {
    if (week.closingBalance < 0) {
      alerts.push({
        type: 'critical',
        date: week.weekStart,
        message: `Projected negative balance of $${Math.abs(week.closingBalance).toLocaleString()}`,
        recommendation: 'Review payment timing or secure line of credit'
      });
    } else if (week.closingBalance < warningThreshold) {
      alerts.push({
        type: 'warning',
        date: week.weekStart,
        message: `Low cash balance projected: $${week.closingBalance.toLocaleString()}`,
        recommendation: 'Consider accelerating customer payments'
      });
    }
  }

  return alerts;
}
```

## UI Design Preview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💰 Cash Flow Forecaster                                    [RentKit]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Starting Balance: $45,000       Forecast: [Next 6 Months ▼]           │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  📊 CASH FLOW PROJECTION                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  $80K ┤                            ╭──────╮                     │   │
│  │       ┤                       ╭────╯      ╰────╮                │   │
│  │  $60K ┤              ╭───────╯                  ╰───╮           │   │
│  │       ┤         ╭────╯                              ╰──         │   │
│  │  $40K ┼─────────╯                                               │   │
│  │       ┤    ↑ Low point                         ↑ Peak season    │   │
│  │  $20K ┤   ($32K Feb)                          ($78K June)       │   │
│  │       ┤                                                         │   │
│  │    $0 ┼─────────────────────────────────────────────────────   │   │
│  │        Jan   Feb   Mar   Apr   May   Jun   Jul   Aug            │   │
│  │                                                                   │   │
│  │  ─── Cash Balance    ░░░ Inflows    ▓▓▓ Outflows                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ⚠️ ALERTS                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🟡 Feb 15: Low balance warning ($32,400)                        │   │
│  │    Recommendation: Follow up on $8,500 in outstanding deposits  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  📅 NEXT 4 WEEKS DETAIL                                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Week      │ Opening │ Inflows │ Outflows │ Closing │ Key Items  │  │
│  ├───────────┼─────────┼─────────┼──────────┼─────────┼────────────┤  │
│  │ Jan 15-21 │ $45,000 │  $8,200 │   $6,500 │ $46,700 │ 3 deposits │  │
│  │ Jan 22-28 │ $46,700 │  $4,500 │  $12,000 │ $39,200 │ Payroll    │  │
│  │ Jan 29-Feb 4│$39,200│  $2,800 │   $5,600 │ $36,400 │ Slow week  │  │
│  │ Feb 5-11  │ $36,400 │  $3,200 │   $7,200 │ $32,400 │ Insurance  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  💡 INSIGHTS                                                            │
│  • 85% of Q2 inflows come from wedding deposits (March-April)          │
│  • Payroll is 45% of monthly outflows                                  │
│  • Consider 2/10 net 30 discounts to accelerate payments               │
│                                                                         │
│  [📥 Export Report]  [🔮 Scenario Planning]  [⚙️ Adjust Assumptions]   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| User engagement | 50% monthly active |
| Forecast accuracy | Within 15% of actual |
| Cash crisis prevention | Track user feedback |

## Implementation Effort

**Total: 12 days / 3 weeks**

---
