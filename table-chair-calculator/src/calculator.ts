import type {
  CalculatorInput,
  CalculatorResult,
  TableResult,
  TableType,
} from './types';

export const TABLE_CAPACITY: Record<TableType, number> = {
  round_48: 6,
  round_60: 8,
  round_72: 10,
  banquet_6ft: 6,
  banquet_8ft: 8,
  square_36: 4,
  square_48: 8,
  cocktail: 0,
  sweetheart: 2,
  farm: 10,
};

export const TABLE_LABELS: Record<TableType, string> = {
  round_48: '48" Round',
  round_60: '60" Round',
  round_72: '72" Round',
  banquet_6ft: '6ft Banquet',
  banquet_8ft: '8ft Banquet',
  square_36: '36" Square',
  square_48: '48" Square',
  cocktail: 'Cocktail/Highboy',
  sweetheart: 'Sweetheart',
  farm: 'Farm/Harvest',
};

/** Approximate sq ft per table (table + chairs + aisle) */
export const TABLE_SQUARE_FOOTAGE: Record<TableType, number> = {
  round_48: 64,
  round_60: 100,
  round_72: 144,
  banquet_6ft: 80,
  banquet_8ft: 100,
  square_36: 49,
  square_48: 64,
  cocktail: 25,
  sweetheart: 36,
  farm: 120,
};

export function calculateTablesAndChairs(
  input: CalculatorInput
): CalculatorResult {
  const { guestCount, eventStyle, tablePreferences, additionalTables } = input;
  const notes: string[] = [];

  // Seated guests: cocktail uses ~40% seating
  let seatedGuests = guestCount;
  if (eventStyle === 'cocktail') {
    seatedGuests = Math.ceil(guestCount * 0.4);
    notes.push(
      `Cocktail style: ~40% seating (${seatedGuests} seats for ${guestCount} guests).`
    );
  }

  const seatsPerTable =
    TABLE_CAPACITY[tablePreferences.primary] || 8;
  const guestTablesNeeded =
    seatsPerTable > 0 ? Math.ceil(seatedGuests / seatsPerTable) : 0;

  const tables: TableResult[] = [];
  let totalChairs = eventStyle === 'cocktail' ? seatedGuests : guestCount;
  let totalTableCount = 0;
  let sqFt = 0;

  // Guest tables
  if (guestTablesNeeded > 0) {
    tables.push({
      type: tablePreferences.primary,
      quantity: guestTablesNeeded,
      seatsPerTable,
      label: TABLE_LABELS[tablePreferences.primary],
    });
    totalTableCount += guestTablesNeeded;
    sqFt += guestTablesNeeded * TABLE_SQUARE_FOOTAGE[tablePreferences.primary];
  }

  // Head table
  if (additionalTables.headTable?.seats) {
    const headSeats = additionalTables.headTable.seats;
    const headTables = Math.ceil(headSeats / 8);
    tables.push({
      type: 'banquet_8ft',
      quantity: headTables,
      seatsPerTable: Math.ceil(headSeats / headTables),
      label: 'Head table',
    });
    totalTableCount += headTables;
    totalChairs += headSeats;
    sqFt += headTables * TABLE_SQUARE_FOOTAGE.banquet_8ft;
  }

  // Sweetheart table
  if (additionalTables.sweetheartTable) {
    tables.push({
      type: 'sweetheart',
      quantity: 1,
      seatsPerTable: 2,
      label: 'Sweetheart',
    });
    totalTableCount += 1;
    totalChairs += 2;
    sqFt += TABLE_SQUARE_FOOTAGE.sweetheart;
  }

  // Non-seating tables (each counts as 1 table, no chairs)
  const extraTables: { name: string; count: number }[] = [];
  if (additionalTables.giftTable) extraTables.push({ name: 'Gift table', count: 1 });
  if (additionalTables.signInTable) extraTables.push({ name: 'Sign-in table', count: 1 });
  if (additionalTables.cakeTable) extraTables.push({ name: 'Cake table', count: 1 });
  if (additionalTables.djTable) extraTables.push({ name: 'DJ/band table', count: 1 });
  if (additionalTables.photoBoothTable) extraTables.push({ name: 'Photo booth', count: 1 });
  const foodStations = additionalTables.foodStations ?? 0;
  if (foodStations > 0) extraTables.push({ name: 'Food stations', count: foodStations });
  const barStations = additionalTables.barStations ?? 0;
  if (barStations > 0) extraTables.push({ name: 'Bar stations', count: barStations });

  let extraTableCount = 0;
  for (const { count } of extraTables) {
    extraTableCount += count;
  }
  totalTableCount += extraTableCount;
  sqFt += extraTableCount * 30; // ~30 sq ft per utility table

  if (extraTables.length > 0) {
    tables.push({
      type: 'banquet_6ft',
      quantity: extraTableCount,
      seatsPerTable: 0,
      label: 'Additional (gift, cake, DJ, etc.)',
    });
  }

  notes.push(
    'We recommend 1–2 extra chairs for late additions or replacements.'
  );

  return {
    tables,
    totalTables: totalTableCount,
    totalChairs,
    estimatedSquareFootage: Math.round(sqFt),
    notes,
  };
}
