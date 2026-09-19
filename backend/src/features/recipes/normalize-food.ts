import { foodAliases } from './data/food-aliases.js';

export function slugifyFood(value: string) {
  return value
    .toLowerCase()
    .replace(/[%0-9]/g, ' ')
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-');
}

/** Convert a receipt or recipe display name into a stable food id via aliases, not equality. */
export function normalizeFoodName(displayName: string) {
  const cleaned = displayName.toLowerCase().replace(/[^a-z0-9%\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (foodAliases[cleaned]) return foodAliases[cleaned];

  const withoutSize = cleaned.replace(/\b(baby|fresh|large|small|white|brown|atlantic|fillet|fillets|package|packages)\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (foodAliases[withoutSize]) return foodAliases[withoutSize];

  for (const [alias, id] of Object.entries(foodAliases)) {
    if (cleaned.includes(alias) || withoutSize.includes(alias)) return id;
  }

  return slugifyFood(withoutSize || cleaned);
}

export const INGREDIENT_WEIGHT: Record<string, number> = {
  protein: 3,
  base: 3,
  vegetable: 2,
  seasoning: 1,
  optional: 0,
};
