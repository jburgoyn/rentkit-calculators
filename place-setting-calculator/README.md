# Place Setting Calculator

Embeddable widget that calculates exact quantities of plates, glasses, flatware, and serving pieces for events based on guest count and menu style.

## Features

- **Guest count:** Adults, children, vendor meals
- **Service style:** Plated, buffet, family style, cocktail
- **Courses:** Appetizer/salad, soup, main, dessert, bread
- **Beverages:** Water, red/white wine, champagne, beer, coffee, tea, cocktails
- **Serving pieces:** Platters, bowls, chafing dishes, utensils (for family style / buffet)
- **Results:** Per-person breakdown, totals with 5% buffer, place-setting diagram, Get Quote CTA

## Development

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # dist/place-setting-calculator.iife.js
npm run preview
```

## Embed

Add a mount point and script:

```html
<div
  id="rentkit-place-setting-calculator"
  data-theme="light"
  data-primary-color="#1976d2"
  data-cta-text="Get Your Quote"
></div>
<script src="https://your-cdn/place-setting-calculator.iife.js"></script>
```

Data attributes:

- `data-theme` — `light` (default)
- `data-primary-color` — hex color for CTA and selected state (default `#1976d2`)
- `data-cta-text` — button label (default "Get Your Quote")

## Build output

- `dist/place-setting-calculator.iife.js` — IIFE bundle for embedding
