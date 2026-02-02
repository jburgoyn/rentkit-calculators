import type { CateringCalculation, CateringResult } from './types';

const CHAFING_DISH_SERVINGS = {
  full: 40,
  half: 20,
  round: 25,
} as const;

function calculateCoffeeUrns(totalCups: number): { size: string; quantity: number }[] {
  const result: { size: string; quantity: number }[] = [];
  let remaining = totalCups;
  const sizes = [
    { label: '100-cup', capacity: 100 },
    { label: '55-cup', capacity: 55 },
    { label: '36-cup', capacity: 36 },
  ];
  for (const { label, capacity } of sizes) {
    if (remaining <= 0) break;
    const qty = Math.ceil(remaining / capacity);
    if (qty > 0) {
      result.push({ size: label, quantity: qty });
      remaining -= qty * capacity;
    }
  }
  if (result.length === 0) result.push({ size: '36-cup', quantity: 1 });
  return result;
}

export function calculateCateringEquipment(
  input: CateringCalculation
): CateringResult {
  const { guestCount, buffetConfig, beverageService } = input;
  const hotItems = buffetConfig?.hotItems ?? 3;
  const coldItems = buffetConfig?.coldItems ?? 2;
  const lines = buffetConfig?.lines ?? 1;

  const chafingPerItem = Math.ceil(guestCount / CHAFING_DISH_SERVINGS.full);
  const totalChafing = chafingPerItem * hotItems;

  const coffeePercent = beverageService.coffeePercent ?? 60;
  const coffeeDrinkers = guestCount * (beverageService.coffee ? coffeePercent / 100 : 0);
  const totalCups = Math.ceil(coffeeDrinkers * 1.5);
  const coffeeUrnsRegular = beverageService.coffee
    ? calculateCoffeeUrns(totalCups)
    : [];
  const coffeeUrnsDecaf = beverageService.decaf
    ? calculateCoffeeUrns(Math.ceil(totalCups * 0.3))
    : [];
  const coffeeUrns = [...coffeeUrnsRegular];
  for (const decaf of coffeeUrnsDecaf) {
    const existing = coffeeUrns.find((u) => u.size === decaf.size);
    if (existing) existing.quantity += decaf.quantity;
    else coffeeUrns.push(decaf);
  }
  if (coffeeUrns.length === 0 && (beverageService.coffee || beverageService.decaf)) {
    coffeeUrns.push({ size: '36-cup', quantity: 1 });
  }

  const utensils: { type: string; quantity: number }[] = [
    { type: 'Serving spoon', quantity: hotItems },
    { type: 'Serving fork', quantity: hotItems },
    { type: 'Tongs', quantity: coldItems + 2 },
    { type: 'Salad servers', quantity: buffetConfig?.hasSaladBar ? 3 : 0 },
    { type: 'Cake server', quantity: buffetConfig?.hasDessertStation ? 1 : 0 },
  ].filter((u) => u.quantity > 0);

  const sternoCans = totalChafing * 4;
  const totalItems = hotItems + coldItems;
  const risers = Math.ceil(totalItems / 4);

  return {
    warmingEquipment: {
      chafingDishes: [{ size: 'Full (8qt)', quantity: totalChafing }],
      sternoCans,
      heatLamps: input.specialNeeds?.carving ? 2 : 0,
      warmingCabinets: guestCount > 150 ? 1 : 0,
      soupKettles: input.specialNeeds?.soupCourse ? Math.ceil(guestCount / 50) : 0,
    },
    servingEquipment: {
      platters: [
        { size: 'Large (18")', quantity: Math.ceil(coldItems / 2) },
        { size: 'Medium (14")', quantity: coldItems },
      ],
      bowls: [
        {
          size: 'Large serving',
          quantity: buffetConfig?.hasSaladBar ? 3 : 1,
        },
      ],
      utensils,
      sneezeGuards: lines,
      risers,
    },
    beverageEquipment: {
      coffeeUrns,
      hotWaterDispensers: beverageService.hotTea ? 1 : 0,
      beverageDispensers: beverageService.icedBeverages,
      creamSugarSets: Math.ceil(guestCount / 50),
    },
    coldEquipment: {
      iceBins: Math.ceil(guestCount / 100),
      iceDisplays: coldItems > 3 ? 1 : 0,
    },
    disposables: {
      sternoRefills: sternoCans,
      servingGloves: Math.ceil(guestCount / 25) * 2,
    },
  };
}
