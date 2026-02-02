export type ElementType =
  | 'table_round_48'
  | 'table_round_60'
  | 'table_round_72'
  | 'table_rect_6ft'
  | 'table_rect_8ft'
  | 'table_square'
  | 'table_cocktail'
  | 'table_sweetheart'
  | 'dance_floor'
  | 'stage'
  | 'bar'
  | 'buffet'
  | 'photo_booth'
  | 'cake_table'
  | 'gift_table'
  | 'lounge';

export interface ElementProperties {
  label?: string;
  seats?: number;
  width?: number;
  length?: number;
  color?: string;
  assignedGuests?: string[];
}

export interface FloorPlanElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: ElementProperties;
}

export interface VenueFeature {
  id: string;
  type: 'entry' | 'exit' | 'pillar' | 'window';
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  venue: {
    width: number;
    length: number;
    backgroundImage?: string;
    features: VenueFeature[];
  };
  elements: FloorPlanElement[];
  guests?: Guest[];
  assignments?: TableAssignment[];
  settings: {
    gridSize: number;
    showGrid: boolean;
    snapToGrid: boolean;
    showLabels: boolean;
  };
}

export interface Guest {
  id: string;
  name: string;
  party?: string;
  dietaryRestrictions?: string[];
  notes?: string;
  tableId?: string;
  seatNumber?: number;
}

export interface TableAssignment {
  tableId: string;
  guestIds: string[];
}

export interface FloorPlanState {
  floorPlan: FloorPlan;
  selectedElementIds: string[];
  tool: 'select' | 'pan' | 'add';
  addingElement?: ElementType;
  zoom: number;
  pan: { x: number; y: number };
  history: FloorPlan[];
  historyIndex: number;
}
