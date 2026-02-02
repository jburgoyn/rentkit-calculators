# Staff Calculator

## Overview

A tool that helps rental companies determine staffing needs for deliveries, setups, and events based on order complexity and timing.

## Problem Statement

Staffing decisions are often guessed:
- How many crew for a 200-guest wedding setup?
- How long will this take?
- Am I overstaffing (wasting money) or understaffing (bad service)?

## Target Audience

- **Primary:** Operations managers scheduling crews
- **Secondary:** Sales teams estimating quotes
- **Tertiary:** HR planning seasonal hires

## Key Features

### 1. Order/Event Input
- Select order or enter manually
- Item counts by category
- Setup complexity level
- Venue characteristics

### 2. Task Breakdown
- Delivery time
- Setup time by item type
- Strike/breakdown time
- Travel time

### 3. Staff Calculation
- Crew size recommendation
- Total labor hours
- Labor cost estimate
- Efficiency options

### 4. Scheduling View
- Calendar integration
- Crew assignment
- Conflict detection

## Technical Requirements

### Calculation Logic

```typescript
// Time estimates (minutes per unit)
const SETUP_TIMES = {
  // Tables
  round_table: { setup: 3, strike: 2 },
  banquet_table: { setup: 4, strike: 3 },
  cocktail_table: { setup: 2, strike: 1 },

  // Chairs
  folding_chair: { setup: 0.5, strike: 0.3 },
  chiavari_chair: { setup: 1, strike: 0.5 },
  chair_with_cover: { setup: 2, strike: 1 },

  // Linens
  tablecloth: { setup: 2, strike: 1 },
  napkin_fold: { setup: 1, strike: 0.2 },
  chair_sash: { setup: 1.5, strike: 0.5 },

  // Other
  dance_floor_panel: { setup: 2, strike: 1.5 },
  tent_setup_per_sqft: { setup: 0.1, strike: 0.08 },
  place_setting: { setup: 2, strike: 1 },
};

const COMPLEXITY_MULTIPLIERS = {
  simple: 1.0,      // Basic setup, easy venue
  standard: 1.2,    // Normal wedding/event
  complex: 1.5,     // Difficult venue, intricate design
  premium: 1.8,     // White glove service
};

function calculateStaffingNeeds(order: Order): StaffingResult {
  let totalSetupMinutes = 0;
  let totalStrikeMinutes = 0;

  // Calculate base time
  for (const item of order.items) {
    const times = SETUP_TIMES[item.type] || { setup: 2, strike: 1 };
    totalSetupMinutes += times.setup * item.quantity;
    totalStrikeMinutes += times.strike * item.quantity;
  }

  // Apply complexity multiplier
  const multiplier = COMPLEXITY_MULTIPLIERS[order.complexity];
  totalSetupMinutes *= multiplier;
  totalStrikeMinutes *= multiplier;

  // Calculate crew size for target duration
  const targetSetupHours = 2; // Aim for 2-hour setup
  const crewSize = Math.ceil(totalSetupMinutes / 60 / targetSetupHours);

  // Minimum crew sizes by event size
  const minCrew = order.guestCount > 150 ? 3 : order.guestCount > 75 ? 2 : 1;
  const recommendedCrew = Math.max(crewSize, minCrew);

  return {
    setupMinutes: totalSetupMinutes,
    strikeMinutes: totalStrikeMinutes,
    recommendedCrew,
    actualSetupTime: totalSetupMinutes / recommendedCrew,
    laborHours: (totalSetupMinutes + totalStrikeMinutes) / 60 * recommendedCrew,
    laborCost: calculateLaborCost(recommendedCrew, totalSetupMinutes + totalStrikeMinutes)
  };
}
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Estimate accuracy | Within 20% of actual time |
| User adoption | 50% of orders |
| Labor cost optimization | -10% waste |

## Implementation Effort

**Total: 8 days / 2 weeks**

---
