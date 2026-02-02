# Delivery Cost Estimator

## Overview

A tool that calculates accurate delivery fees based on distance, order size, timing, and market rates—helping rental companies price deliveries profitably.

## Problem Statement

Delivery pricing is often wrong:
- Underpricing loses money on fuel and labor
- Overpricing loses customers
- No consistency in quotes
- Remote deliveries especially problematic

## Target Audience

- **Primary:** Sales teams quoting delivery fees
- **Secondary:** Operations managers setting delivery policies
- **Tertiary:** Customers understanding delivery costs

## Key Features

### 1. Delivery Details
- Pickup/warehouse address
- Delivery address
- Order size/weight
- Delivery date/time
- Setup required?

### 2. Cost Calculation
- Mileage cost
- Time cost (loading, travel, unload)
- Setup labor
- Vehicle costs
- Profit margin

### 3. Price Recommendation
- Suggested delivery fee
- Comparison to flat-rate options
- Bundle suggestions

### 4. Zone Pricing
- Define delivery zones
- Set zone-based pricing
- Special area surcharges

## Technical Requirements

### Calculation Logic

```typescript
interface DeliveryCostInput {
  warehouseAddress: string;
  deliveryAddress: string;
  orderWeight: number;
  orderVolume: number;
  requiresSetup: boolean;
  setupComplexity: 'simple' | 'standard' | 'complex';
  deliveryTime: Date;
  returnPickup: boolean;
}

interface DeliveryCostResult {
  distance: number;          // miles
  estimatedTime: number;     // minutes total

  costs: {
    mileage: number;         // fuel + wear
    laborDelivery: number;
    laborSetup: number;
    vehicle: number;
    overhead: number;
  };

  totalCost: number;
  suggestedPrice: number;    // with margin
  margin: number;

  breakdown: string[];
}

const COST_FACTORS = {
  mileageRate: 0.65,         // $ per mile (IRS rate + buffer)
  laborRate: 25,             // $ per hour
  vehicleDailyRate: 100,     // Amortized vehicle cost
  overheadPercent: 0.15,     // 15% overhead
  targetMargin: 0.25,        // 25% profit margin
};

async function calculateDeliveryCost(input: DeliveryCostInput): Promise<DeliveryCostResult> {
  // Get distance and time from mapping API
  const route = await getRoute(input.warehouseAddress, input.deliveryAddress);
  const roundTripMiles = route.distance * 2;
  const roundTripMinutes = route.duration * 2;

  // Loading/unloading time estimate
  const loadingMinutes = estimateLoadingTime(input.orderWeight, input.orderVolume);

  // Setup time if required
  const setupMinutes = input.requiresSetup
    ? calculateSetupTime(input.orderVolume, input.setupComplexity)
    : 0;

  // Total time
  const totalMinutes = roundTripMinutes + loadingMinutes + setupMinutes;
  const totalHours = totalMinutes / 60;

  // Calculate costs
  const mileageCost = roundTripMiles * COST_FACTORS.mileageRate;
  const laborDeliveryCost = (roundTripMinutes + loadingMinutes) / 60 * COST_FACTORS.laborRate;
  const laborSetupCost = setupMinutes / 60 * COST_FACTORS.laborRate;
  const vehicleCost = COST_FACTORS.vehicleDailyRate * (totalHours / 8); // Prorate daily rate

  const subtotal = mileageCost + laborDeliveryCost + laborSetupCost + vehicleCost;
  const overhead = subtotal * COST_FACTORS.overheadPercent;
  const totalCost = subtotal + overhead;
  const suggestedPrice = totalCost / (1 - COST_FACTORS.targetMargin);

  return {
    distance: route.distance,
    estimatedTime: totalMinutes,
    costs: {
      mileage: mileageCost,
      laborDelivery: laborDeliveryCost,
      laborSetup: laborSetupCost,
      vehicle: vehicleCost,
      overhead
    },
    totalCost,
    suggestedPrice: Math.ceil(suggestedPrice / 5) * 5, // Round to nearest $5
    margin: COST_FACTORS.targetMargin,
    breakdown: [
      `${roundTripMiles.toFixed(1)} miles round trip`,
      `${Math.round(totalHours * 10) / 10} hours total time`,
      input.requiresSetup ? `Setup included (${input.setupComplexity})` : 'Drop-off only'
    ]
  };
}
```

## UI Design Preview

```
┌─────────────────────────────────────────────────────────┐
│  🚚 Delivery Cost Estimator                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  From: [Your Warehouse          ]                       │
│  To:   [123 Wedding Venue Dr    ]                       │
│                                                         │
│  Order: $2,500 rental • ~400 lbs • 15 tables, 120 chairs│
│  ☑ Setup included    Complexity: [Standard ▼]          │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│  📊 COST BREAKDOWN                                      │
│  Distance: 24 miles round trip                          │
│  Time: 3.5 hours (travel + load/unload + setup)         │
│                                                         │
│  Mileage:        $31.20                                 │
│  Labor:          $87.50                                 │
│  Vehicle:        $43.75                                 │
│  Overhead:       $24.37                                 │
│  ─────────────────────────                              │
│  Your Cost:      $186.82                                │
│                                                         │
│  💰 SUGGESTED PRICE: $250                               │
│     (25% margin = $63.18 profit)                        │
│                                                         │
│  Compare: Your zone pricing = $150 (losing money!)     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Delivery profitability | +15% avg margin |
| Quote accuracy | Within 10% of actual |
| User adoption | 60% of delivery quotes |

## Implementation Effort

**Total: 6 days / 1.5 weeks**

---
