import type { FloorPlan, FloorPlanElement } from './types';
import { getDefaultProperties, generateId } from './elementDefaults';

export function createEmptyFloorPlan(name = 'My Floor Plan'): FloorPlan {
  const now = new Date().toISOString();
  return {
    id: `fp_${Date.now()}`,
    name,
    createdAt: now,
    updatedAt: now,
    venue: {
      width: 60,
      length: 80,
      features: [],
    },
    elements: [],
    settings: {
      gridSize: 5,
      showGrid: true,
      snapToGrid: true,
      showLabels: true,
    },
  };
}

export function createFloorPlanElement(
  type: FloorPlanElement['type'],
  x: number,
  y: number,
  id?: string
): FloorPlanElement {
  const elId = id ?? generateId();
  return {
    id: elId,
    type,
    x,
    y,
    rotation: 0,
    properties: getDefaultProperties(type),
  };
}
