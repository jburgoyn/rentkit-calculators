# Table & Chair Calculator

Embeddable widget that helps event planners determine how many tables and chairs they need based on guest count, event style, and table preferences.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Outputs to `dist/`. For embedding, use the main JS asset (e.g. `dist/table-calculator.js` or the hashed file in `dist/assets/`).

## Embed

Add to any page:

```html
<div
  id="rentkit-table-calculator"
  data-theme="light"
  data-primary-color="#1976d2"
  data-cta-text="Get Your Quote"
  data-cta-url="https://yoursite.com/quote"
></div>
<link rel="stylesheet" href="https://your-cdn.com/table-calculator.css" />
<script src="https://your-cdn.com/table-calculator.js" async></script>
```

### Data attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-theme` | `light` or `dark` | `light` |
| `data-primary-color` | CSS color for buttons/accents | `#1976d2` |
| `data-cta-text` | Get-quote button label | `Get Your Quote` |
| `data-cta-url` | URL for quote (query params added: email, guestCount, totalTables, totalChairs, tableType, eventStyle) | — |
| `data-org-id` | Organization id (for future API) | — |
| `data-show-pricing` | Show pricing (reserved) | `false` |

## Spec

See [tool-ideas/end-customer-tools/01-table-chair-calculator.md](../../tool-ideas/end-customer-tools/01-table-chair-calculator.md) for full product spec.
