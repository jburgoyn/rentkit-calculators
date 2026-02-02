import type {
  TableEntry,
  TableShape,
  DropLength,
  LinenCalculation,
  LinenList,
  TableclothResult,
  OverlayResult,
  TableSkirtResult,
} from './types';

type SizeKey = string;

const TABLECLOTH_SIZES: Record<
  TableShape,
  Partial<Record<SizeKey, Partial<Record<DropLength, string>>>>
> = {
  round: {
    '48inch': {
      floor: '120" round',
      mid: '90" round',
      lap: '72" round',
    },
    '60inch': {
      floor: '132" round',
      mid: '108" round',
      lap: '90" round',
    },
    '72inch': {
      floor: '144" round',
      mid: '120" round',
      lap: '108" round',
    },
  },
  rectangular: {
    '6ft': {
      floor: '90x156"',
      mid: '90x132"',
      lap: '60x120"',
    },
    '8ft': {
      floor: '90x156"',
      mid: '90x156"',
      lap: '60x126"',
    },
  },
  square: {
    '36inch': {
      floor: '90" square',
      mid: '78" square',
      lap: '60" square',
    },
    '48inch': {
      floor: '108" square',
      mid: '96" square',
      lap: '72" square',
    },
  },
  cocktail: {
    '30inch': {
      floor: '120" round',
      mid: '108" round',
      lap: '90" round',
    },
  },
};

const OVERLAY_SIZES: Record<string, Record<string, string>> = {
  round: {
    '48inch': '72"',
    '60inch': '72"',
    '72inch': '90"',
  },
  rectangular: {
    '6ft': '54x108"',
    '8ft': '54x126"',
  },
  square: {
    '36inch': '54"',
    '48inch': '72"',
  },
  cocktail: {},
};

function getLinenNotes(
  table: TableEntry,
  dropLength: DropLength
): string {
  const dropMap: Record<DropLength, string> = {
    floor: '36" drop (floor length)',
    mid: '30" drop (mid-length)',
    lap: '12–15" drop (lap length)',
  };
  return `${dropMap[dropLength]} on ${table.size} ${table.shape}`;
}

function aggregateTablecloths(
  tablecloths: TableclothResult[]
): TableclothResult[] {
  const byKey = new Map<string, TableclothResult>();
  for (const t of tablecloths) {
    const key = `${t.size}|${t.forTableType}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.quantity += t.quantity;
    } else {
      byKey.set(key, { ...t });
    }
  }
  return Array.from(byKey.values());
}

export function calculateLinens(input: LinenCalculation): LinenList {
  const tableclothResults: TableclothResult[] = [];
  const overlayResults: OverlayResult[] = [];

  for (const table of input.tables) {
    const sizeChart = TABLECLOTH_SIZES[table.shape]?.[table.size];
    if (sizeChart) {
      const clothSize = sizeChart[input.tableclothPreferences.dropLength];
      if (clothSize) {
        tableclothResults.push({
          size: clothSize,
          quantity: table.quantity,
          forTableType: `${table.size} ${table.shape} (${table.purpose})`,
          notes: getLinenNotes(table, input.tableclothPreferences.dropLength),
        });
      }
    }

    if (
      input.tableclothPreferences.useOverlays &&
      input.tableclothPreferences.overlayStyle
    ) {
      const overlayChart = OVERLAY_SIZES[table.shape]?.[table.size];
      if (overlayChart) {
        const overlaySize =
          input.tableclothPreferences.overlayStyle === 'square'
            ? overlayChart
            : overlayChart;
        overlayResults.push({
          size: `${overlaySize} ${input.tableclothPreferences.overlayStyle} overlay`,
          quantity: table.quantity,
        });
      }
    }
  }

  const baseNapkins = input.guestCount;
  const napkinBuffer = Math.ceil(input.guestCount * 0.05);
  const totalNapkins =
    baseNapkins +
    input.napkinPreferences.extraForVendors +
    input.napkinPreferences.extraForBar +
    input.napkinPreferences.extraForRestrooms +
    napkinBuffer;

  const aggregatedOverlays = aggregateOverlays(overlayResults);

  const chairCovers = input.chairAccessories.chairCovers
    ? input.chairAccessories.chairCount
    : 0;
  const chairSashes = input.chairAccessories.chairSashes
    ? input.chairAccessories.chairCount
    : 0;

  const tableRunners = input.additionalItems.tableRunners
    ? input.tables
        .filter((t) => t.purpose === 'guest' || t.purpose === 'food')
        .reduce((sum, t) => sum + t.quantity, 0)
    : 0;

  const chargerPlates = input.additionalItems.chargerPlates
    ? input.guestCount
    : 0;

  return {
    tablecloths: aggregateTablecloths(tableclothResults),
    overlays: aggregatedOverlays,
    napkins: {
      quantity: totalNapkins,
      breakdown: {
        guests: baseNapkins,
        vendors: input.napkinPreferences.extraForVendors,
        bar: input.napkinPreferences.extraForBar,
        restroom: input.napkinPreferences.extraForRestrooms,
        buffer: napkinBuffer,
      },
    },
    chairCovers,
    chairSashes,
    tableRunners,
    tableSkirts: input.additionalItems.tableSkirts.filter(
      (s) => s.quantity > 0
    ) as TableSkirtResult[],
    chargerPlates,
  };
}

function aggregateOverlays(overlays: OverlayResult[]): OverlayResult[] {
  const bySize = new Map<string, number>();
  for (const o of overlays) {
    const q = bySize.get(o.size) ?? 0;
    bySize.set(o.size, q + o.quantity);
  }
  return Array.from(bySize.entries()).map(([size, quantity]) => ({
    size,
    quantity,
  }));
}

export const TABLE_OPTIONS: { type: TableEntry['type']; shape: TableShape; size: string; label: string }[] = [
  { type: 'round_48', shape: 'round', size: '48inch', label: '48" Round' },
  { type: 'round_60', shape: 'round', size: '60inch', label: '60" Round' },
  { type: 'round_72', shape: 'round', size: '72inch', label: '72" Round' },
  { type: 'rect_6ft', shape: 'rectangular', size: '6ft', label: '6ft Rectangular' },
  { type: 'rect_8ft', shape: 'rectangular', size: '8ft', label: '8ft Rectangular' },
  { type: 'square_36', shape: 'square', size: '36inch', label: '36" Square' },
  { type: 'square_48', shape: 'square', size: '48inch', label: '48" Square' },
  { type: 'cocktail_30', shape: 'cocktail', size: '30inch', label: '30" Cocktail' },
];

export const PURPOSE_OPTIONS: { value: TableEntry['purpose']; label: string }[] = [
  { value: 'guest', label: 'Guest' },
  { value: 'food', label: 'Food' },
  { value: 'cake', label: 'Cake' },
  { value: 'gift', label: 'Gift' },
  { value: 'dj', label: 'DJ' },
  { value: 'other', label: 'Other' },
];
