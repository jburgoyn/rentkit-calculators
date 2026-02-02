export type EventType =
  | 'wedding'
  | 'corporate'
  | 'birthday'
  | 'nightclub'
  | 'school';

export type DancingStyle =
  | 'light'
  | 'moderate'
  | 'heavy'
  | 'line_dancing'
  | 'ballroom';

export type TimeOfEvent = 'daytime' | 'evening' | 'late_night';

export interface VenueConstraints {
  maxWidth: number;
  maxLength: number;
  shape: 'any' | 'square' | 'rectangle';
}

export interface DanceFloorCalculation {
  guestCount: number;
  dancerPercentage?: number;

  eventType: EventType;
  dancingStyle: DancingStyle;
  timeOfEvent: TimeOfEvent;

  venueConstraints?: VenueConstraints;
}

export interface DanceFloorSize {
  width: number;
  length: number;
  sqFt: number;
  panels: number;
}

export interface DanceFloorResult {
  expectedDancers: number;
  recommendedSqFt: number;
  recommendedSize: DanceFloorSize;
  alternatives: {
    smaller: DanceFloorSize;
    larger: DanceFloorSize;
  };
  densityDescription: string;
  tips: string[];
}
