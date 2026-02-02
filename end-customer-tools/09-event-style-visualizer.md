# Event Style Visualizer

## Overview

An interactive tool that allows users to select colors, themes, and rental items to see mockup visualizations of their event setup, helping them make design decisions before committing to rentals.

## Problem Statement

Event planners struggle to visualize how rental items will look together:
- Colors on screens don't match real fabrics
- Combining multiple elements is hard to imagine
- Pinterest inspiration doesn't show available rental options
- Decisions are made without seeing the full picture
- Returns and disappointment due to mismatched expectations

## Target Audience

- **Primary:** Brides and couples planning weddings
- **Secondary:** Party planners seeking cohesive designs
- **Tertiary:** Corporate event planners with brand requirements

## SEO & Engagement Opportunity

- "wedding color visualizer" - 1,200 monthly searches
- "event design tool" - 800 monthly searches
- "table setting visualizer" - 500 monthly searches
- "wedding decor preview" - 600 monthly searches

**High engagement/sharing:** Visual tools get shared on Pinterest, Instagram.

## Key Features

### 1. Style Selection
- **Themes:** Rustic, Modern, Classic, Bohemian, Glamorous, Garden, Beach
- **Seasons:** Spring, Summer, Fall, Winter
- **Formality:** Casual, Semi-formal, Formal, Black-tie

### 2. Color Palette Builder
- Color picker for primary, secondary, accent colors
- Pre-built palettes (trending wedding colors)
- Color harmony suggestions
- Pantone color matching

### 3. Element Customization
**Table Setup:**
- Table style (round, farm, ghost, etc.)
- Tablecloth color/texture
- Overlay/runner options
- Napkin color and fold
- Charger plates
- Centerpiece style

**Chairs:**
- Chair style (chiavari, crossback, folding, etc.)
- Chair color
- Chair covers
- Sashes/ties

**Backdrop:**
- Indoor/outdoor setting
- Wall color/texture
- Draping options
- Lighting (warm, cool, colored)

### 4. Visualization Engine
- Real-time rendered mockups
- Multiple viewing angles
- Day/night lighting simulation
- Full table view and place setting detail view

### 5. Save & Share
- Save combinations
- Share to Pinterest, Instagram
- Download mood boards
- Email to planner/partner

### 6. Shop Integration
- "Rent This Look" links
- Item availability check
- Add to cart/quote

## Technical Requirements

### Data Model

```typescript
interface EventVisualization {
  id: string;
  name: string;

  theme: ThemePreset | 'custom';
  colorPalette: {
    primary: string;      // hex color
    secondary: string;
    accent: string;
    neutral: string;
  };

  tableSetup: {
    tableStyle: TableStyle;
    tableclothColor: string;
    tableclothMaterial: Material;
    overlay?: {
      style: 'square' | 'round' | 'runner';
      color: string;
      material: Material;
    };
    napkin: {
      color: string;
      fold: NapkinFold;
    };
    charger?: {
      style: ChargerStyle;
      color: string;
    };
    centerpiece: CenterpieceStyle;
  };

  chairSetup: {
    style: ChairStyle;
    color: string;
    cover?: {
      color: string;
      material: Material;
    };
    sash?: {
      color: string;
      style: SashStyle;
    };
  };

  setting: {
    location: 'indoor' | 'outdoor' | 'tent';
    backdrop: BackdropStyle;
    lighting: LightingStyle;
    timeOfDay: 'day' | 'golden_hour' | 'evening' | 'night';
  };
}

type TableStyle = 'round_60' | 'round_72' | 'farm_8ft' | 'ghost' | 'glass';
type ChairStyle = 'chiavari' | 'crossback' | 'ghost' | 'folding' | 'garden';
type NapkinFold = 'flat' | 'rolled' | 'standing' | 'pocket' | 'fan';
type Material = 'polyester' | 'satin' | 'lace' | 'burlap' | 'sequin';
type CenterpieceStyle = 'tall_floral' | 'low_floral' | 'candles' | 'greenery' | 'lantern';
type BackdropStyle = 'brick' | 'greenery_wall' | 'draping' | 'string_lights' | 'garden';
type LightingStyle = 'warm' | 'cool' | 'natural' | 'romantic' | 'dramatic';
```

### Technical Architecture

**Option A: Pre-rendered Images (Faster to build)**
- Create base images for each combination type
- Use image compositing to layer colors/textures
- Apply color filters for different palettes
- Limited but curated options

**Option B: 3D Rendering (More flexible)**
- Three.js or similar for WebGL rendering
- 3D models of tables, chairs, elements
- Material/texture swapping
- More realistic, but complex to build

**Recommended: Hybrid Approach**
```typescript
// Start with pre-rendered bases, add dynamic elements
interface RenderLayer {
  base: string;           // Pre-rendered base image URL
  colorizable: {
    region: 'tablecloth' | 'napkin' | 'chair' | 'sash';
    mask: string;         // Mask image for region
    currentColor: string;
  }[];
  overlays: {
    type: 'centerpiece' | 'charger' | 'place_setting';
    position: { x: number; y: number };
    image: string;
  }[];
}

// Use CSS filters or canvas manipulation
function applyColorToRegion(
  baseImage: HTMLImageElement,
  mask: HTMLImageElement,
  targetColor: string
): HTMLCanvasElement {
  // ... color transformation logic
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✨ Event Style Visualizer                     [Save] [Share] [📌 Pin]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                   │ │
│  │                                                                   │ │
│  │                      [VISUALIZATION AREA]                         │ │
│  │                                                                   │ │
│  │                      Beautiful rendered image                     │ │
│  │                      of table setup with                          │ │
│  │                      selected options                             │ │
│  │                                                                   │ │
│  │                                                                   │ │
│  │                                                                   │ │
│  │   [< Prev View]            ○ ● ○ ○            [Next View >]      │ │
│  │   Table Setting    Full Table    Venue     Place Setting         │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  COLOR PALETTE                                                   │   │
│  │  Primary    Secondary   Accent      Neutral                      │   │
│  │  [██████]   [██████]    [██████]    [██████]                    │   │
│  │  Dusty Rose  Sage       Gold        Ivory                        │   │
│  │                                                                   │   │
│  │  Quick Palettes: [Romantic] [Rustic] [Modern] [Classic] [+]     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   TABLE     │ │   CHAIRS    │ │  LINENS     │ │  SETTING    │      │
│  │  ┌─────┐   │ │  ┌─────┐   │ │             │ │             │      │
│  │  │ ○   │   │ │  │╲ ╱│   │ │ Tablecloth  │ │ Indoor      │      │
│  │  │     │   │ │  │ X │   │ │ [Satin ▼]   │ │ [Ballroom▼] │      │
│  │  └─────┘   │ │  └─────┘   │ │             │ │             │      │
│  │ 60" Round  │ │  Chiavari  │ │ Napkin Fold │ │ Lighting    │      │
│  │ [Change]   │ │  Gold      │ │ [Pocket ▼]  │ │ [Romantic▼] │      │
│  │            │ │  [Change]  │ │             │ │             │      │
│  │ ☐ Add      │ │ ☑ Sash    │ │ ☐ Overlay  │ │ Time: 🌅    │      │
│  │   Charger  │ │   Ivory    │ │ ☑ Runner   │ │ Golden Hour │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  💡 This Look Includes:                                          │   │
│  │  • 60" Round Tables           • Gold Chiavari Chairs            │   │
│  │  • Dusty Rose Satin Linens    • Ivory Chair Sashes              │   │
│  │  • Gold Charger Plates        • Rose Gold Table Runner          │   │
│  │                                                                   │   │
│  │  [🛒 Rent This Look - Get Quote]    [📋 Download Mood Board]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly visitors | 8,000+ |
| Avg. session duration | 8+ minutes |
| Designs saved | 40% of sessions |
| Social shares | 15% of saves |
| Quote requests | 12% of users |
| Mood board downloads | 25% |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Design system & color engine | 3 days | Week 1 |
| Base image creation/curation | 5 days | Week 1-2 |
| Color application engine | 4 days | Week 2 |
| UI component building | 4 days | Week 2-3 |
| Save/share/export | 2 days | Week 3 |
| Shop integration | 2 days | Week 3-4 |
| Testing & polish | 2 days | Week 4 |
| **Total** | **22 days** | **4-5 weeks** |

## Future Enhancements

1. **AI style suggestions:** "Based on your Pinterest board..."
2. **Real product images:** Show actual rental inventory
3. **AR preview:** See table in your actual venue via phone camera
4. **Vendor matching:** Connect with florists, planners who work with this style
5. **Style quiz:** Guide uncertain users to their perfect style
6. **Seasonal trends:** Highlight trending looks
7. **Real wedding gallery:** See actual events using these items
