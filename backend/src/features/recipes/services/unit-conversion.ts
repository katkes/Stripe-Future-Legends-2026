/** Convert compatible units into a shared base amount for one food id. */

type Factor = { base: string; amount: number };

const GENERIC: Record<string, Factor> = {
  g: { base: 'g', amount: 1 },
  kg: { base: 'g', amount: 1000 },
  ml: { base: 'ml', amount: 1 },
  l: { base: 'ml', amount: 1000 },
  count: { base: 'count', amount: 1 },
  package: { base: 'package', amount: 1 },
  clove: { base: 'clove', amount: 1 },
};

const FOOD_UNITS: Record<string, Record<string, Factor>> = {
  spinach: {
    g: { base: 'g', amount: 1 },
    bag: { base: 'g', amount: 250 },
  },
  garlic: {
    clove: { base: 'clove', amount: 1 },
    bulb: { base: 'clove', amount: 10 },
  },
  gochujang: {
    g: { base: 'g', amount: 1 },
    container: { base: 'g', amount: 250 },
  },
  rice: {
    g: { base: 'g', amount: 1 },
    kg: { base: 'g', amount: 1000 },
  },
  egg: {
    count: { base: 'count', amount: 1 },
  },
};

function key(unit: string) {
  return unit.toLowerCase().replace(/s$/, '');
}

export function toBaseAmount(normalizedFoodId: string, quantity: number, unit: string) {
  const foodTable = FOOD_UNITS[normalizedFoodId];
  const factor = foodTable?.[key(unit)] ?? GENERIC[key(unit)];
  if (!factor) return null;
  return { base: factor.base, amount: quantity * factor.amount };
}

export function convertQuantity(normalizedFoodId: string, quantity: number, fromUnit: string, toUnit: string) {
  const from = toBaseAmount(normalizedFoodId, quantity, fromUnit);
  const to = toBaseAmount(normalizedFoodId, 1, toUnit);
  if (!from || !to || from.base !== to.base) return null;
  return from.amount / to.amount;
}

export function canConvert(normalizedFoodId: string, fromUnit: string, toUnit: string) {
  return convertQuantity(normalizedFoodId, 1, fromUnit, toUnit) !== null;
}
