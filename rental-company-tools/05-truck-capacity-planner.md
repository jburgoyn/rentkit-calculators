# Truck Capacity Planner

## Overview

A visual tool that helps rental companies plan truck loads, ensuring orders fit in available vehicles and optimizing delivery efficiency.

## Problem Statement

Truck loading is often guessed:
- "Will this order fit in the box truck?"
- Multiple trips waste time and fuel
- Items get damaged from poor packing
- Last-minute rental trucks are expensive

## Target Audience

- **Primary:** Delivery coordinators/drivers
- **Secondary:** Operations managers planning routes
- **Tertiary:** Sales teams giving delivery quotes

## Key Features

### 1. Order Selection
- Select order(s) to load
- See item list with dimensions
- Calculate total volume/weight

### 2. Vehicle Selection
- Choose from your fleet
- Standard truck sizes
- Custom vehicle dimensions

### 3. Visual Loading Planner
- 3D or 2D visualization
- Drag items to position
- Weight distribution view

### 4. Fit Analysis
- Will it fit? Yes/No
- Utilization percentage
- Remaining capacity
- Suggested loading order

### 5. Multi-Order Planning
- Combine orders for same route
- Prioritize delivery order
- Unloading sequence

## Technical Requirements

### Data Model

```typescript
interface TruckCapacityPlan {
  orders: OrderForDelivery[];
  vehicle: Vehicle;

  analysis: {
    totalVolume: number;        // cubic feet
    totalWeight: number;        // pounds
    vehicleCapacity: number;    // cubic feet
    vehicleWeightLimit: number;
    volumeUtilization: number;  // percentage
    weightUtilization: number;
    fits: boolean;
    warnings: string[];
  };

  loadingPlan?: {
    items: PlacedItem[];
    sequence: string[];         // Loading order
    unloadSequence: string[];   // First out, last in
  };
}

interface OrderForDelivery {
  orderId: string;
  customerName: string;
  deliveryAddress: string;
  deliveryTime: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  dimensions: {
    length: number;   // inches
    width: number;
    height: number;
    weight: number;   // pounds per unit
  };
  stackable: boolean;
  fragile: boolean;
  maxStackHeight?: number;
}

interface Vehicle {
  id: string;
  name: string;
  type: 'cargo_van' | 'box_truck_14' | 'box_truck_20' | 'box_truck_26' | 'trailer';
  capacity: {
    length: number;   // inches
    width: number;
    height: number;
    maxWeight: number;
  };
}

interface PlacedItem {
  itemId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  stackedOn?: string;
}
```

### Calculation Logic

```typescript
// Standard truck dimensions (interior)
const VEHICLE_SPECS = {
  cargo_van: {
    length: 120, width: 54, height: 54,  // 10ft van
    maxWeight: 2500
  },
  box_truck_14: {
    length: 168, width: 84, height: 84,
    maxWeight: 5000
  },
  box_truck_20: {
    length: 240, width: 96, height: 96,
    maxWeight: 8000
  },
  box_truck_26: {
    length: 312, width: 102, height: 102,
    maxWeight: 12000
  }
};

// Common rental item dimensions
const ITEM_DIMENSIONS = {
  'round_table_60': { length: 60, width: 60, height: 30, weight: 65, stackable: true, maxStack: 4 },
  'folding_chair': { length: 18, width: 20, height: 36, weight: 8, stackable: true, maxStack: 10 },
  'chiavari_chair': { length: 16, width: 16, height: 36, weight: 12, stackable: true, maxStack: 8 },
  'banquet_table_8ft': { length: 96, width: 30, height: 30, weight: 80, stackable: true, maxStack: 4 },
  // ...
};

function analyzeTruckCapacity(orders: OrderForDelivery[], vehicle: Vehicle): TruckCapacityPlan {
  // Calculate totals
  let totalVolume = 0;
  let totalWeight = 0;

  for (const order of orders) {
    for (const item of order.items) {
      const dims = item.dimensions;
      const itemVolume = (dims.length * dims.width * dims.height) / 1728; // cubic feet
      const itemWeight = dims.weight * item.quantity;

      // Account for stacking
      const effectiveQuantity = item.stackable
        ? Math.ceil(item.quantity / (item.maxStackHeight || 1))
        : item.quantity;

      totalVolume += itemVolume * effectiveQuantity;
      totalWeight += itemWeight;
    }
  }

  const vehicleVolume = (vehicle.capacity.length * vehicle.capacity.width * vehicle.capacity.height) / 1728;

  const warnings = [];
  if (totalWeight > vehicle.capacity.maxWeight * 0.9) {
    warnings.push('Approaching vehicle weight limit');
  }
  if (totalVolume > vehicleVolume * 0.85) {
    warnings.push('Tight fit - careful packing required');
  }

  return {
    orders,
    vehicle,
    analysis: {
      totalVolume: Math.round(totalVolume),
      totalWeight: Math.round(totalWeight),
      vehicleCapacity: Math.round(vehicleVolume),
      vehicleWeightLimit: vehicle.capacity.maxWeight,
      volumeUtilization: (totalVolume / vehicleVolume) * 100,
      weightUtilization: (totalWeight / vehicle.capacity.maxWeight) * 100,
      fits: totalVolume <= vehicleVolume && totalWeight <= vehicle.capacity.maxWeight,
      warnings
    }
  };
}

function generateLoadingSequence(plan: TruckCapacityPlan): string[] {
  // Sort orders by delivery sequence (last delivery loads first)
  const sortedOrders = [...plan.orders].sort((a, b) =>
    new Date(b.deliveryTime).getTime() - new Date(a.deliveryTime).getTime()
  );

  const sequence = [];
  for (const order of sortedOrders) {
    // Heavy/stackable items first (on bottom)
    const items = [...order.items].sort((a, b) => {
      if (a.stackable !== b.stackable) return a.stackable ? -1 : 1;
      return b.dimensions.weight - a.dimensions.weight;
    });

    for (const item of items) {
      sequence.push(`Load ${item.quantity}x ${item.name} (${order.customerName})`);
    }
  }

  return sequence;
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🚚 Truck Capacity Planner                                 [RentKit]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SELECT ORDERS TO LOAD                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ☑ Order #1234 - Smith Wedding (10:00 AM delivery)               │   │
│  │   15 tables, 120 chairs, linens                                 │   │
│  │ ☑ Order #1235 - Johnson Corp (2:00 PM delivery)                 │   │
│  │   8 tables, 64 chairs                                           │   │
│  │ ☐ Order #1236 - Davis Party (4:00 PM delivery)                  │   │
│  │   5 tables, 40 chairs                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  SELECT VEHICLE                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Cargo Van    │ │ 14' Box      │ │ 20' Box      │ │ 26' Box      │  │
│  │ 🚐           │ │ 🚛           │ │ 🚛           │ │ 🚛           │  │
│  │ 170 cu ft    │ │ 570 cu ft    │ │ 1,000 cu ft  │ │ 1,600 cu ft  │  │
│  │ 2,500 lbs    │ │ 5,000 lbs    │ │ 8,000 lbs    │ │ 12,000 lbs   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│         ○                ○                ●                ○           │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  📊 CAPACITY ANALYSIS                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  ✅ IT FITS! (with room to spare)                                │   │
│  │                                                                   │   │
│  │  VOLUME                              WEIGHT                      │   │
│  │  ┌────────────────────────────────┐ ┌────────────────────────┐  │   │
│  │  │████████████████░░░░░░░░░░░░░░░│ │██████████░░░░░░░░░░░░░░│  │   │
│  │  │         680 / 1,000 cu ft     │ │   4,200 / 8,000 lbs    │  │   │
│  │  │              68%              │ │         52%            │  │   │
│  │  └────────────────────────────────┘ └────────────────────────┘  │   │
│  │                                                                   │   │
│  │  Remaining Capacity: 320 cu ft • 3,800 lbs                       │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🚚 VISUAL LOAD PREVIEW                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  TRUCK BED (Top-down view)                                       │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ ╔════╗ ╔════╗ ╔════╗ ╔════╗ ╔════╗                        │ │   │
│  │  │ ║ T1 ║ ║ T2 ║ ║ T3 ║ ║ T4 ║ ║ T5 ║  [Tables stacked 3]   │ │   │
│  │  │ ╚════╝ ╚════╝ ╚════╝ ╚════╝ ╚════╝                        │ │   │
│  │  │                                                             │ │   │
│  │  │ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐                  │ │   │
│  │  │ │C ││C ││C ││C ││C ││C ││C ││C ││C ││C │ [Chairs x10 stacks]│ │   │
│  │  │ └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘                  │ │   │
│  │  │                                                             │ │   │
│  │  │ ┌────────┐ ┌────────┐                                      │ │   │
│  │  │ │ Linens │ │ Linens │  [Linen boxes]                       │ │   │
│  │  │ └────────┘ └────────┘                                      │ │   │
│  │  │                           ← DOOR                            │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  📋 LOADING SEQUENCE (First-in, Last-out)                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Load Johnson Corp items first (last delivery)                 │   │
│  │    └─ 8 tables (2 stacks of 4) → back of truck                  │   │
│  │    └─ 64 chairs (8 stacks of 8) → middle                        │   │
│  │                                                                   │   │
│  │ 2. Load Smith Wedding items second (first delivery)              │   │
│  │    └─ 15 tables (5 stacks of 3) → front/middle                  │   │
│  │    └─ 120 chairs (12 stacks of 10) → front                      │   │
│  │    └─ Linens in boxes → on top of tables                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ⚠️ TIPS                                                                │
│  • Distribute weight evenly left-to-right                              │
│  • Fragile items (linens) on top, protected                           │
│  • Strap down stacked tables                                           │
│                                                                         │
│  [📥 Print Load Sheet]  [📧 Send to Driver]  [➕ Add Another Order]    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Usage by delivery teams | 70% of deliveries |
| Multi-trip reduction | -20% extra trips |
| Damage reduction | -15% claims |
| Driver satisfaction | 4.3/5 rating |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Item dimension database | 2 days | Week 1 |
| Calculation engine | 2 days | Week 1 |
| Basic UI | 2 days | Week 2 |
| Visual loading view | 3 days | Week 2 |
| Loading sequence | 1 day | Week 3 |
| Mobile/driver view | 2 days | Week 3 |
| Testing & polish | 2 days | Week 3-4 |
| **Total** | **14 days** | **3-4 weeks** |

## Future Enhancements

1. **3D visualization:** Rotate and view from angles
2. **Auto-pack algorithm:** Optimal packing suggestions
3. **Route integration:** Factor in delivery order
4. **Photo documentation:** Compare to actual load
5. **Driver app:** Mobile-friendly checklist
6. **Learning system:** Improve based on actual loads
