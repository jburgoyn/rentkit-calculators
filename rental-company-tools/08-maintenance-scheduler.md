# Maintenance Scheduler

## Overview

A tool that tracks inventory maintenance cycles and schedules inspections, cleaning, and repairs based on usage patterns.

## Problem Statement

Maintenance is often reactive, not proactive:
- Items fail at events (embarrassing)
- No tracking of cleaning cycles
- Damage discovered too late
- Compliance issues (fire safety, etc.)

## Target Audience

- **Primary:** Warehouse managers
- **Secondary:** Operations teams
- **Tertiary:** Compliance officers

## Key Features

### 1. Maintenance Tracking
- Last maintenance date per item
- Maintenance type (clean, inspect, repair)
- Rental cycles since maintenance
- Condition notes

### 2. Automated Scheduling
- Rules-based scheduling (every X rentals)
- Calendar integration
- Staff assignment
- Reminder notifications

### 3. Compliance Tracking
- Fire extinguisher inspections
- Tent certifications
- Safety equipment checks
- Documentation storage

### 4. Reporting
- Maintenance history
- Costs by item/category
- Upcoming schedule
- Overdue items

## Technical Requirements

### Data Model

```typescript
interface MaintenanceRecord {
  itemId: string;
  itemName: string;
  lastMaintenance: {
    date: Date;
    type: 'clean' | 'inspect' | 'repair' | 'certification';
    performedBy: string;
    notes: string;
    cost?: number;
  };
  rentalsSinceMaintenance: number;
  nextScheduled?: Date;
  status: 'good' | 'due_soon' | 'overdue' | 'out_of_service';
}

interface MaintenanceRule {
  category: string;
  maintenanceType: string;
  triggerType: 'rentals' | 'days' | 'both';
  rentalInterval?: number;
  dayInterval?: number;
  estimatedDuration: number; // minutes
  requiredSkills?: string[];
}

const MAINTENANCE_RULES: MaintenanceRule[] = [
  { category: 'chairs', maintenanceType: 'clean', triggerType: 'rentals', rentalInterval: 3 },
  { category: 'linens', maintenanceType: 'clean', triggerType: 'rentals', rentalInterval: 1 },
  { category: 'tents', maintenanceType: 'inspect', triggerType: 'both', rentalInterval: 5, dayInterval: 90 },
  { category: 'fire_extinguishers', maintenanceType: 'certification', triggerType: 'days', dayInterval: 365 },
];
```

## UI Design Preview

```
┌─────────────────────────────────────────────────────────┐
│  🔧 Maintenance Scheduler                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DASHBOARD                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 12 OVERDUE  │ │ 28 DUE SOON │ │ 156 CURRENT │       │
│  │    ⚠️       │ │     🟡      │ │     ✅      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ⚠️ OVERDUE ITEMS                                       │
│  ├─ 6x Chiavari Chairs (cleaning) - 2 days overdue     │
│  ├─ Fire Extinguisher #3 (annual cert) - 15 days       │
│  └─ Tent #2 (inspection) - 5 rentals overdue           │
│                                                         │
│  📅 THIS WEEK'S SCHEDULE                                │
│  Mon: 20 chairs cleaning (2 hrs)                       │
│  Tue: Tent inspection (4 hrs)                          │
│  Wed: Linen pressing (3 hrs)                           │
│  Thu: Dance floor refinish (6 hrs)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Event failures | -50% equipment issues |
| Compliance | 100% on-time certifications |
| Proactive maintenance | 80% before due date |

## Implementation Effort

**Total: 10 days / 2.5 weeks**

---
