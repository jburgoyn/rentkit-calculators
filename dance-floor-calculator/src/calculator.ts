import type {
  DanceFloorCalculation,
  DanceFloorResult,
  DanceFloorSize,
  DancingStyle,
  EventType,
  TimeOfEvent,
} from './types';

/** Square feet per dancer by style */
export const SQ_FT_PER_DANCER: Record<DancingStyle, number> = {
  light: 4.5,
  moderate: 5,
  heavy: 6,
  line_dancing: 6,
  ballroom: 9,
};

/** Percentage likely to dance by event type and time */
export const DANCER_PERCENTAGE: Record<
  EventType,
  Record<TimeOfEvent, number>
> = {
  wedding: { daytime: 30, evening: 50, late_night: 60 },
  corporate: { daytime: 20, evening: 35, late_night: 40 },
  birthday: { daytime: 25, evening: 45, late_night: 55 },
  nightclub: { daytime: 50, evening: 70, late_night: 80 },
  school: { daytime: 40, evening: 60, late_night: 70 },
};

/** Standard dance floor sizes (3x3 ft panels), sorted by sq ft */
export const STANDARD_SIZES: DanceFloorSize[] = [
  { width: 9, length: 9, sqFt: 81, panels: 9 },
  { width: 9, length: 12, sqFt: 108, panels: 12 },
  { width: 12, length: 12, sqFt: 144, panels: 16 },
  { width: 12, length: 15, sqFt: 180, panels: 20 },
  { width: 15, length: 15, sqFt: 225, panels: 25 },
  { width: 15, length: 18, sqFt: 270, panels: 30 },
  { width: 18, length: 18, sqFt: 324, panels: 36 },
  { width: 18, length: 21, sqFt: 378, panels: 42 },
  { width: 21, length: 21, sqFt: 441, panels: 49 },
  { width: 21, length: 24, sqFt: 504, panels: 56 },
  { width: 24, length: 24, sqFt: 576, panels: 64 },
  { width: 24, length: 27, sqFt: 648, panels: 72 },
  { width: 27, length: 27, sqFt: 729, panels: 81 },
  { width: 27, length: 30, sqFt: 810, panels: 90 },
  { width: 30, length: 30, sqFt: 900, panels: 100 },
];

function getDensityDescription(sqFtPerPerson: number): string {
  if (sqFtPerPerson >= 8) return 'Spacious – room for couples to move freely';
  if (sqFtPerPerson >= 6) return 'Comfortable – good flow without bumping';
  if (sqFtPerPerson >= 4.5) return 'Cozy – energetic feel, some contact';
  return 'Crowded – nightclub atmosphere';
}

function generateTips(
  input: DanceFloorCalculation,
  recommendedSize: DanceFloorSize,
  expectedDancers: number
): string[] {
  const tips: string[] = [];
  tips.push('Place dance floor near DJ/band for best energy.');
  if (input.eventType === 'wedding') {
    tips.push('Evening weddings typically see 50–60% of guests on the floor.');
  }
  if (input.dancingStyle === 'ballroom' || input.dancingStyle === 'line_dancing') {
    tips.push('Consider adding a bit more space for formation and movement.');
  }
  tips.push('LED lighting under the floor can enhance the look.');
  if (recommendedSize.sqFt / expectedDancers < 5) {
    tips.push('If budget allows, sizing up one option reduces crowding at peak times.');
  }
  return tips;
}

function fitsVenue(size: DanceFloorSize, constraints: DanceFloorCalculation['venueConstraints']): boolean {
  if (!constraints) return true;
  if (size.width > constraints.maxWidth || size.length > constraints.maxLength) return false;
  if (constraints.shape === 'square' && size.width !== size.length) return false;
  return true;
}

export function calculateDanceFloor(input: DanceFloorCalculation): DanceFloorResult {
  let dancerPct = input.dancerPercentage;
  if (dancerPct == null || dancerPct <= 0) {
    dancerPct = DANCER_PERCENTAGE[input.eventType][input.timeOfEvent];
  }
  const expectedDancers = Math.max(1, Math.ceil(input.guestCount * (dancerPct / 100)));

  const sqFtPerDancer = SQ_FT_PER_DANCER[input.dancingStyle];
  const recommendedSqFt = expectedDancers * sqFtPerDancer;

  const candidates = STANDARD_SIZES.filter(
    (size) =>
      size.sqFt >= recommendedSqFt * 0.85 && fitsVenue(size, input.venueConstraints)
  );
  const recommendedSize =
    candidates[0] ?? STANDARD_SIZES.filter((s) => fitsVenue(s, input.venueConstraints)).pop() ?? STANDARD_SIZES[STANDARD_SIZES.length - 1];

  const sizeIndex = STANDARD_SIZES.indexOf(recommendedSize);
  const smaller =
    sizeIndex > 0 ? STANDARD_SIZES[sizeIndex - 1]! : STANDARD_SIZES[0]!;
  const larger =
    sizeIndex < STANDARD_SIZES.length - 1 && sizeIndex >= 0
      ? STANDARD_SIZES[sizeIndex + 1]!
      : STANDARD_SIZES[STANDARD_SIZES.length - 1]!;

  const actualSqFtPerPerson = recommendedSize.sqFt / expectedDancers;
  const densityDescription = getDensityDescription(actualSqFtPerPerson);
  const tips = generateTips(input, recommendedSize, expectedDancers);

  return {
    expectedDancers,
    recommendedSqFt,
    recommendedSize,
    alternatives: { smaller, larger },
    densityDescription,
    tips,
  };
}
