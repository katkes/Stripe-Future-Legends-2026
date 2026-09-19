import type { FreshnessSource, PantryItem } from '../models.js';
import { normalizeFoodName } from '../normalize-food.js';

type StoredFreshness = {
  source: string;
  bestByDate?: Date | string | null;
  estimatedStartDate?: Date | string | null;
  estimatedEndDate?: Date | string | null;
};

function iso(value?: Date | string | null) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

function freshnessSource(source: string): FreshnessSource {
  if (source === 'label') return 'scanned-label';
  if (source === 'user_confirmed') return 'user-entered';
  if (source === 'estimated') return 'estimated';
  return 'unknown';
}

/** Map OpenBasket pantry documents (OCR / scanner API) onto the recipe engine's pantry shape. */
export function mapStoredPantryItems(
  userId: string,
  items: Iterable<{
    _id?: { toString(): string };
    id?: string;
    name: string;
    freshness: StoredFreshness;
  }>,
): PantryItem[] {
  return [...items].map((item) => {
    const printed = item.freshness.source === 'label' || item.freshness.source === 'user_confirmed'
      ? iso(item.freshness.bestByDate)
      : undefined;
    const estimated = iso(item.freshness.estimatedEndDate) ?? iso(item.freshness.bestByDate);
    return {
      id: String(item._id ?? item.id ?? `${userId}-${item.name}`),
      userId,
      normalizedFoodId: normalizeFoodName(item.name),
      displayName: item.name,
      quantity: 1,
      unit: 'item',
      estimatedUseByDate: estimated,
      printedExpirationDate: printed,
      freshnessSource: freshnessSource(item.freshness.source),
      status: 'available' as const,
    };
  });
}
