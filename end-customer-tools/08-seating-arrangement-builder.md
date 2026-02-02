# Seating Arrangement Builder

## Overview

An interactive drag-and-drop tool that allows event planners to create floor plans with tables, chairs, dance floors, and other elements, then export or share their designs.

## Problem Statement

Event planners struggle to visualize their event layout:
- Venue dimensions are hard to work with mentally
- Table spacing and flow are difficult to plan on paper
- Coordinating with vendors requires visual communication
- Last-minute changes are painful without digital tools
- Seat assignments are typically done separately in spreadsheets

## Target Audience

- **Primary:** Brides and wedding planners
- **Secondary:** Corporate event planners
- **Tertiary:** Venues offering layout planning to clients

## SEO & Engagement Opportunity

- "wedding seating chart maker" - 8,100 monthly searches
- "event floor plan creator" - 2,400 monthly searches
- "table layout planner" - 1,800 monthly searches
- "seating arrangement tool" - 1,500 monthly searches

**High engagement potential:** Users spend significant time on this type of tool, creating strong brand association.

## Key Features

### 1. Canvas Setup
- Input venue dimensions (or select from templates)
- Set scale (1 square = X feet)
- Import venue floor plan image as background
- Define entry/exit points, pillars, windows

### 2. Drag-and-Drop Elements
**Tables:**
- Round tables (various sizes)
- Rectangular/banquet tables
- Square tables
- Cocktail tables
- Head table configurations
- Sweetheart tables

**Other Elements:**
- Dance floor (customizable size)
- DJ/Band stage
- Bar stations
- Buffet stations
- Photo booth
- Gift/cake tables
- Lounge areas
- Ceremony arch/altar

### 3. Table Properties
- Number of seats
- Table number/name
- Color coding (by family, relationship, etc.)
- Assigned guests (optional)

### 4. Guest Assignment (Optional)
- Import guest list (CSV, paste)
- Drag guests to tables
- Guest search
- Dietary restrictions/notes
- Relationship grouping

### 5. Validation & Suggestions
- Capacity warnings (over-seated tables)
- Spacing warnings (tables too close)
- Flow analysis (blocked paths)
- ADA accessibility checking

### 6. Export & Sharing
- PDF export (print-ready)
- Image export (PNG/JPG)
- Shareable link
- Vendor view (read-only)
- Integration with Table Calculator results

## Technical Requirements

### Data Model

```typescript
interface FloorPlan {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  venue: {
    width: number;          // feet
    length: number;
    backgroundImage?: string;
    features: VenueFeature[];
  };

  elements: FloorPlanElement[];
  guests?: Guest[];
  assignments?: TableAssignment[];

  settings: {
    gridSize: number;       // feet per grid square
    showGrid: boolean;
    snapToGrid: boolean;
    showLabels: boolean;
  };
}

interface FloorPlanElement {
  id: string;
  type: ElementType;
  x: number;              // position
  y: number;
  rotation: number;       // degrees
  properties: ElementProperties;
}

type ElementType =
  | 'table_round_48' | 'table_round_60' | 'table_round_72'
  | 'table_rect_6ft' | 'table_rect_8ft'
  | 'table_square' | 'table_cocktail' | 'table_sweetheart'
  | 'dance_floor' | 'stage' | 'bar' | 'buffet'
  | 'photo_booth' | 'cake_table' | 'gift_table' | 'lounge';

interface ElementProperties {
  label?: string;
  seats?: number;
  width?: number;
  length?: number;
  color?: string;
  assignedGuests?: string[];
}

interface Guest {
  id: string;
  name: string;
  party?: string;         // "Bride's family", "Groom's coworkers"
  dietaryRestrictions?: string[];
  notes?: string;
  tableId?: string;
  seatNumber?: number;
}

interface TableAssignment {
  tableId: string;
  guestIds: string[];
}
```

### Technical Architecture

```typescript
// React component structure
<FloorPlanBuilder>
  <Toolbar />           // Element palette, tools
  <Canvas>              // Main drawing area
    <Grid />
    <BackgroundImage />
    <Elements />        // Draggable items
    <SelectionBox />
  </Canvas>
  <PropertiesPanel />   // Selected item properties
  <GuestList />         // Guest management sidebar
</FloorPlanBuilder>

// Use a canvas library like:
// - Fabric.js (mature, feature-rich)
// - Konva.js (React-friendly)
// - React Flow (for simpler implementations)

// State management
interface FloorPlanState {
  floorPlan: FloorPlan;
  selectedElements: string[];
  tool: 'select' | 'pan' | 'add';
  addingElement?: ElementType;
  zoom: number;
  history: FloorPlan[];   // For undo/redo
  historyIndex: number;
}
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🪑 Seating Arrangement Builder                    [Save] [Share] [Export]│
├────────────────┬────────────────────────────────────────┬───────────────┤
│   ELEMENTS     │                                        │  PROPERTIES   │
│  ┌──────────┐  │     ┌────────────────────────────┐    │               │
│  │ ○ Round  │  │     │                            │    │  Table #7     │
│  │  60"     │  │     │   ○7    ○8   ┌────────┐   │    │  60" Round    │
│  └──────────┘  │     │              │ Stage  │   │    │               │
│  ┌──────────┐  │     │   ○3    ○4   └────────┘   │    │  Seats: 8     │
│  │ ▭ Rect   │  │     │                            │    │               │
│  │  8ft     │  │     │   ○1 ○2 ┌─────────────┐   │    │  Assigned:    │
│  └──────────┘  │     │         │             │   │    │  • John Smith │
│  ┌──────────┐  │     │    ◇    │ Dance Floor │   │    │  • Jane Doe   │
│  │ □ Dance  │  │     │  Head   │             │   │    │  • Bob Wilson │
│  │  Floor   │  │     │  Table  └─────────────┘   │    │  + 5 more     │
│  └──────────┘  │     │                            │    │               │
│  ┌──────────┐  │     │   ○5    ○6                │    │  [Edit Guests]│
│  │ ▤ Bar    │  │     │                     ▤Bar  │    │               │
│  └──────────┘  │     │   ○9    ○10               │    │  Color:       │
│  ┌──────────┐  │     │              ▭ Buffet     │    │  [●] Blue     │
│  │ ▭ Buffet │  │     │   ○11   ○12               │    │               │
│  └──────────┘  │     │                            │    │  Notes:       │
│  ┌──────────┐  │     └────────────────────────────┘    │  [Bride's     │
│  │ 📸 Photo │  │                                        │   family]     │
│  │  Booth   │  │     Venue: 60' x 80' | 15 Tables | 120 Guests        │
│  └──────────┘  │                                        │               │
│                │     [Zoom: ○──●──○]  [Grid: ☑]        │               │
│  ──────────── │                                        │ ────────────  │
│   GUESTS      │                                        │               │
│  ┌──────────┐ │                                        │ WARNINGS      │
│  │ Search.. │ │                                        │ ⚠️ Table 3 is │
│  └──────────┘ │                                        │   over-seated │
│  ○ Unassigned │                                        │   (9/8)       │
│   • Tom H.    │                                        │               │
│   • Sara K.   │                                        │ ⚠️ Path to    │
│  ○ Table 1    │                                        │   exit blocked│
│   • John S.   │                                        │               │
│   • Jane D.   │                                        │               │
└────────────────┴────────────────────────────────────────┴───────────────┘
```

### Interactions
- **Drag from palette:** Add new elements
- **Click element:** Select, show properties
- **Drag element:** Move on canvas
- **Rotation handle:** Rotate selected element
- **Double-click table:** Edit guests
- **Right-click:** Context menu (duplicate, delete, etc.)
- **Pinch/scroll:** Zoom in/out
- **Two-finger drag:** Pan canvas

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly active users | 10,000+ |
| Avg. session duration | 15+ minutes |
| Plans saved | 60% of sessions |
| Plans shared | 30% of saved plans |
| Quote requests | 10% of users |
| Embed installations | 50+ venues |

## Implementation Effort

| Phase | Effort | Timeline |
|-------|--------|----------|
| Canvas framework setup | 3 days | Week 1 |
| Element palette & drag-drop | 4 days | Week 1-2 |
| Properties panel | 2 days | Week 2 |
| Guest management | 3 days | Week 2-3 |
| Validation engine | 2 days | Week 3 |
| Export features | 2 days | Week 3 |
| Save/share/embed | 2 days | Week 4 |
| Testing & polish | 2 days | Week 4 |
| **Total** | **20 days** | **4-5 weeks** |

## Technical Considerations

### Performance
- Virtualize large guest lists
- Lazy load background images
- Debounce auto-save
- Use web workers for validation calculations

### Mobile Support
- Touch-friendly interactions
- Simplified mobile view (list-based)
- Full editing on tablet

### Data Storage
- Local storage for drafts
- Cloud save for accounts
- Export to prevent data loss

## Future Enhancements

1. **AI suggestions:** "Based on your guest relationships, here's a suggested arrangement"
2. **Venue templates:** Pre-built layouts for popular venues
3. **3D view:** See the layout in 3D perspective
4. **Table cards export:** Print table numbers and place cards
5. **Real-time collaboration:** Multiple planners editing together
6. **Vendor sharing:** Caterer view, rental company view
7. **Integration:** Import from The Knot, Zola, etc.
8. **Guest RSVP integration:** Auto-update counts from RSVP service
