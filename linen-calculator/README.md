# Linen Calculator

Embeddable widget that calculates tablecloths, napkins, chair covers, overlays, and other linens for events.

## Features

- **Table inventory** — Round (48", 60", 72"), rectangular (6ft, 8ft), square, cocktail; by purpose (guest, food, cake, gift, DJ).
- **Tablecloth style** — Floor / mid / lap length; optional square or round overlays.
- **Napkins** — Guest count plus extras for vendors, bar, restroom baskets; 5% buffer.
- **Chair accessories** — Chair covers, sashes, Chiavari cushions.
- **Additional items** — Table runners, charger plates.
- **Results** — Linen list with sizes and quantities; tips; “Get a Quote” CTA.

## Development

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # dist/linen-calculator.iife.js + dist/linen-calculator.css
npm run preview
```

## Embedding

1. Build: `npm run build`
2. Host `dist/linen-calculator.iife.js` and `dist/linen-calculator.css`.
3. Add to your page:

```html
<link rel="stylesheet" href="/path/to/linen-calculator.css" />
<div id="rentkit-linen-calculator"></div>
<script src="/path/to/linen-calculator.iife.js"></script>
```

Optional data attributes on the container:

- `data-theme` — `light` (default) or `dark`
- `data-primary-color` — e.g. `#2e7d32`
- `data-cta-text` — e.g. `Get a Quote`

## Table Calculator integration

“Import from Table & Chair Calculator” is reserved for future integration (e.g. shared state via `localStorage` or URL params when both widgets are on the same site).
