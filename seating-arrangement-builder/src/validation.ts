import type { FloorPlan } from './types';
import { ELEMENT_SPECS } from './elementDefaults';

export interface ValidationWarning {
  type: 'over_seated' | 'spacing' | 'flow';
  elementId?: string;
  message: string;
}

export function validateFloorPlan(floorPlan: FloorPlan): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const elements = floorPlan.elements;

  for (const el of elements) {
    const spec = ELEMENT_SPECS[el.type];
    const maxSeats = spec.defaultSeats ?? 0;
    const seats = el.properties.seats ?? 0;
    if (maxSeats > 0 && seats > maxSeats) {
      warnings.push({
        type: 'over_seated',
        elementId: el.id,
        message: `${el.properties.label ?? spec.shortLabel} is over-seated (${seats}/${maxSeats})`,
      });
    }
  }

  const minSpacingFt = 3;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      const specA = ELEMENT_SPECS[a.type];
      const specB = ELEMENT_SPECS[b.type];
      const wA = (a.properties.width ?? specA.widthFt) / 2;
      const hA = (a.properties.length ?? specA.lengthFt) / 2;
      const wB = (b.properties.width ?? specB.widthFt) / 2;
      const hB = (b.properties.length ?? specB.lengthFt) / 2;
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      const gap = Math.max(0, Math.max(dx - wA - wB, dy - hA - hB));
      if (gap > 0 && gap < minSpacingFt) {
        warnings.push({
          type: 'spacing',
          elementId: a.id,
          message: `${a.properties.label ?? specA.shortLabel} and ${b.properties.label ?? specB.shortLabel} are very close (${gap.toFixed(1)}' gap). Consider ${minSpacingFt}'+ for flow.`,
        });
      }
    }
  }

  return warnings;
}
