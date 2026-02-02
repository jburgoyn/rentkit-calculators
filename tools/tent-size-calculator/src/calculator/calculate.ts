import {
  SQUARE_FEET_PER_PERSON,
  SQ_FT_PER_DANCER,
  ELEMENT_SQUARE_FOOTAGE,
  CIRCULATION_MULTIPLIER,
  TENT_USABILITY,
  STANDARD_TENT_SIZES,
} from './constants';
import type {
  TentCalculationInput,
  TentCalculationResult,
  TentSizeResult,
  SquareFootageBreakdown,
  Snugness,
  TentStyle,
  DanceLevel,
} from './types';

function getDancePercentage(level: DanceLevel | undefined): number {
  switch (level) {
    case 'light':
      return 30;
    case 'heavy':
      return 70;
    default:
      return 50; // moderate
  }
}

function calculateSnugness(tentSqFt: number, neededSqFt: number): Snugness {
  const ratio = tentSqFt / neededSqFt;
  if (ratio >= 1.15) return 'comfortable';
  if (ratio >= 1.0) return 'adequate';
  return 'tight';
}

export function calculateTentSize(input: TentCalculationInput): TentCalculationResult {
  const breakdown: SquareFootageBreakdown = {
    seating: 0,
    danceFloor: 0,
    bars: 0,
    buffet: 0,
    entertainment: 0,
    other: 0,
    circulation: 0,
    total: 0,
  };

  // Base seating
  const seatingSqFt = input.guestCount * SQUARE_FEET_PER_PERSON[input.eventStyle];
  breakdown.seating = Math.round(seatingSqFt);

  // Dance floor
  if (input.elements.danceFloor) {
    const pct = input.elements.danceFloorPercentage ?? getDancePercentage(input.elements.danceLevel);
    const dancers = Math.ceil(input.guestCount * (pct / 100));
    const sqFtPerDancer = SQ_FT_PER_DANCER[input.elements.danceLevel ?? 'moderate'] ?? 4.5;
    breakdown.danceFloor = Math.ceil(dancers * sqFtPerDancer);
  }

  breakdown.bars = input.elements.barStations * ELEMENT_SQUARE_FOOTAGE.barStation;
  breakdown.buffet = input.elements.buffetStations * ELEMENT_SQUARE_FOOTAGE.buffetStation;

  switch (input.elements.djBand) {
    case 'dj':
      breakdown.entertainment = ELEMENT_SQUARE_FOOTAGE.dj;
      break;
    case 'small_band':
      breakdown.entertainment = ELEMENT_SQUARE_FOOTAGE.smallBand;
      break;
    case 'large_band':
      breakdown.entertainment = ELEMENT_SQUARE_FOOTAGE.largeBand;
      break;
    default:
      breakdown.entertainment = 0;
  }

  if (input.elements.photoBooth) breakdown.other += ELEMENT_SQUARE_FOOTAGE.photoBooth;
  if (input.elements.cakeTable) breakdown.other += ELEMENT_SQUARE_FOOTAGE.cakeTable;
  if (input.elements.giftTable) breakdown.other += ELEMENT_SQUARE_FOOTAGE.giftTable;

  switch (input.elements.loungeArea) {
    case 'small':
      breakdown.other += ELEMENT_SQUARE_FOOTAGE.loungeSmall;
      break;
    case 'medium':
      breakdown.other += ELEMENT_SQUARE_FOOTAGE.loungeMedium;
      break;
    case 'large':
      breakdown.other += ELEMENT_SQUARE_FOOTAGE.loungeLarge;
      break;
    default:
      break;
  }

  if (input.elements.cateringPrep) breakdown.other += ELEMENT_SQUARE_FOOTAGE.cateringPrep;

  const subtotal =
    breakdown.seating +
    breakdown.danceFloor +
    breakdown.bars +
    breakdown.buffet +
    breakdown.entertainment +
    breakdown.other;
  breakdown.circulation = Math.round(subtotal * (CIRCULATION_MULTIPLIER - 1));
  breakdown.total = Math.round(subtotal * CIRCULATION_MULTIPLIER);

  const totalNeeded = breakdown.total;
  const tentStyle: TentStyle = input.tentPreferences.style ?? 'frame';
  const usability = TENT_USABILITY[tentStyle];

  const results: TentSizeResult[] = STANDARD_TENT_SIZES.map((tent) => {
    const usableSqFt = Math.floor(tent.sqFt * usability);
    const fits = usableSqFt >= totalNeeded;
    const snugness = calculateSnugness(usableSqFt, totalNeeded);
    return {
      ...tent,
      usableSqFt,
      style: tentStyle,
      fits,
      snugness,
    };
  });

  const fitting = results.filter((r) => r.fits);
  const recommended = fitting[0] ?? null;
  const alternatives = fitting.slice(1, 4);

  // If nothing fits, recommend smallest that's close + next sizes up
  let recommendedSize = recommended;
  let alternativeSizes = alternatives;
  if (!recommendedSize) {
    const byUsable = [...results].sort((a, b) => a.usableSqFt - b.usableSqFt);
    recommendedSize = byUsable[byUsable.length - 1] ?? null;
    alternativeSizes = byUsable.slice(-4, -1).reverse();
  }

  const tips = generateTips(input, recommendedSize);
  const warnings = generateWarnings(input, recommendedSize, totalNeeded);

  return {
    recommendedSize,
    alternativeSizes,
    squareFootageBreakdown: breakdown,
    totalNeeded,
    tips,
    warnings,
  };
}

function generateTips(
  input: TentCalculationInput,
  recommended: TentSizeResult | null
): string[] {
  const tips: string[] = [];
  if (input.tentPreferences.style === 'frame' || !input.tentPreferences.style) {
    tips.push('Frame tents have no center poles, making layout easier.');
  }
  if (input.eventStyle === 'ceremony_and_reception') {
    tips.push('Consider a separate 30×30 cocktail tent for the ceremony.');
  }
  if (input.tentPreferences.enclosed) {
    tips.push('Sidewalls add weather protection but reduce airflow—plan for climate control if needed.');
  }
  if (recommended && recommended.snugness === 'adequate') {
    tips.push('You’re at the minimum—consider the next size up for a buffer.');
  }
  if (input.elements.danceFloor) {
    tips.push('Place the dance floor near the DJ/band for better flow.');
  }
  return tips;
}

function generateWarnings(
  input: TentCalculationInput,
  recommended: TentSizeResult | null,
  totalNeeded: number
): string[] {
  const warnings: string[] = [];
  if (!recommended) return ['No standard tent size fits. Consider multiple tents or custom sizing.'];
  if (!recommended.fits) {
    warnings.push(
      `Your needs (${totalNeeded.toLocaleString()} sq ft) exceed the largest standard option. Consider multiple tents or a custom structure.`
    );
  }
  if (recommended.snugness === 'tight') {
    warnings.push('This size will feel tight. Going up one size is recommended.');
  }
  if (input.tentPreferences.climateControl && !input.tentPreferences.enclosed) {
    warnings.push('Climate control works best with sidewalls—expect some loss with open sides.');
  }
  return warnings;
}
