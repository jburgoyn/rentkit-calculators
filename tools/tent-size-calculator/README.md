# Tent Size Calculator

An embeddable widget that helps event planners determine the right tent size based on guest count, event style, and what needs to fit under the tent.

## Features

- **Guest count** – Slider and number input (10–500 guests)
- **Event style** – Ceremony only, seated dinner, buffet, cocktail, ceremony + reception, corporate
- **Elements** – Dance floor (with light/moderate/heavy), bar stations, buffet stations, DJ/band, photo booth, cake/gift tables, lounge area, catering prep
- **Tent preferences** – Frame, pole, sailcloth, or clear span; enclosed (sidewalls); climate control
- **Results** – Recommended tent size with dimensions, space breakdown, layout diagram, alternative options, tips, and “Get a Quote” CTA

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in `dist/`. Can be deployed to any static host or embedded via iframe.

## Embedding

To embed on another site:

```html
<iframe
  src="https://your-host/tent-size-calculator/"
  title="Tent Size Calculator"
  width="100%"
  height="900"
  style="border: none; max-width: 720px;"
></iframe>
```

## Spec

Based on [tool-ideas/end-customer-tools/02-tent-size-calculator.md](../../tool-ideas/end-customer-tools/02-tent-size-calculator.md).
