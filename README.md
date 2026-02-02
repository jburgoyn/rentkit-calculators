# RentKit Tool Ideas

This directory contains Product Requirements Documents (PRDs) for potential tools that could drive engagement, SEO traffic, and provide genuine utility to both RentKit customers and their end customers.

## Directory Structure

```
tool-ideas/
├── end-customer-tools/       # Tools for people planning events
│   ├── 01-table-chair-calculator.md
│   ├── 02-tent-size-calculator.md
│   ├── 03-linen-calculator.md
│   ├── 04-place-setting-calculator.md
│   ├── 05-dance-floor-calculator.md
│   ├── 06-bar-beverage-calculator.md
│   ├── 07-catering-equipment-calculator.md
│   ├── 08-seating-arrangement-builder.md
│   ├── 09-event-style-visualizer.md
│   ├── 10-package-builder.md
│   ├── 11-event-timeline-planner.md
│   ├── 12-event-budget-estimator.md
│   ├── 13-rental-checklist-generator.md
│   └── 14-weather-contingency-planner.md
│
└── rental-company-tools/     # Tools for rental company owners
    ├── 01-inventory-roi-calculator.md
    ├── 02-pricing-benchmarker.md
    ├── 03-seasonal-demand-forecaster.md
    ├── 04-utilization-analyzer.md
    ├── 05-truck-capacity-planner.md
    ├── 06-staff-calculator.md
    ├── 07-delivery-cost-estimator.md
    ├── 08-maintenance-scheduler.md
    ├── 09-depreciation-calculator.md
    ├── 10-cash-flow-forecaster.md
    └── 11-damage-waiver-analyzer.md
```

## Priority Matrix

### Tier 1: Quick Wins (High Impact, Lower Effort)
- Table & Chair Calculator
- Tent Size Calculator
- Event Budget Estimator
- Inventory ROI Calculator

### Tier 2: High Engagement (Medium Effort)
- Seating Arrangement Builder
- Package Builder
- Rental Checklist Generator
- Bar/Beverage Calculator

### Tier 3: Platform Features (Higher Effort, Strategic Value)
- Pricing Benchmarker (network effects)
- Utilization Analyzer (uses existing data)
- Seasonal Demand Forecaster (ML potential)

## Technical Approach

All end-customer tools should be built as embeddable widgets following the `adelie-shopping-cart` pattern:
- Single JavaScript file embed
- Isolated CSS (shadow DOM or namespaced)
- Configurable via data attributes
- Lead capture integration
- Analytics tracking

## Success Metrics

| Metric | Target |
|--------|--------|
| Organic search traffic | +25% within 6 months |
| Widget embeds | 100+ rental company websites |
| Lead capture rate | 15% of calculator users |
| Time on tool | 3+ minutes average |
| Quote conversion | 5% of leads → quotes |
