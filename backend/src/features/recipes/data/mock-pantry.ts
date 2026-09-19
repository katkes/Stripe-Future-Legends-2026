import type { PantryItem } from '../models.js';
import { normalizeFoodName } from '../normalize-food.js';

export const DEMO_USER_ID = 'user-alex';

function isoDaysFromNow(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

const rawPantry: Omit<PantryItem, 'normalizedFoodId'>[] = [
  { id: 'pantry-salmon', userId: DEMO_USER_ID, displayName: 'Atlantic salmon fillet', quantity: 300, unit: 'g', estimatedUseByDate: isoDaysFromNow(2), freshnessSource: 'estimated', status: 'available' },
  { id: 'pantry-spinach', userId: DEMO_USER_ID, displayName: 'Baby spinach', quantity: 1, unit: 'bag', estimatedUseByDate: isoDaysFromNow(2), freshnessSource: 'estimated', status: 'available' },
  { id: 'pantry-milk', userId: DEMO_USER_ID, displayName: '2% milk', quantity: 500, unit: 'mL', estimatedUseByDate: isoDaysFromNow(4), freshnessSource: 'estimated', status: 'available' },
  { id: 'pantry-udon', userId: DEMO_USER_ID, displayName: 'Udon noodles', quantity: 2, unit: 'package', freshnessSource: 'unknown', status: 'available' },
  { id: 'pantry-rice', userId: DEMO_USER_ID, displayName: 'White rice', quantity: 1, unit: 'kg', freshnessSource: 'unknown', status: 'available' },
  { id: 'pantry-eggs', userId: DEMO_USER_ID, displayName: 'Large white eggs', quantity: 6, unit: 'count', estimatedUseByDate: isoDaysFromNow(10), freshnessSource: 'estimated', status: 'available' },
  { id: 'pantry-garlic', userId: DEMO_USER_ID, displayName: 'Garlic', quantity: 1, unit: 'bulb', freshnessSource: 'unknown', status: 'available' },
  { id: 'pantry-onion', userId: DEMO_USER_ID, displayName: 'Yellow onion', quantity: 2, unit: 'count', estimatedUseByDate: isoDaysFromNow(12), freshnessSource: 'estimated', status: 'available' },
  { id: 'pantry-gochujang', userId: DEMO_USER_ID, displayName: 'Gochujang', quantity: 1, unit: 'container', freshnessSource: 'unknown', status: 'available' },
  { id: 'pantry-soy', userId: DEMO_USER_ID, displayName: 'Soy sauce', quantity: 500, unit: 'mL', freshnessSource: 'unknown', status: 'available' },
];

export function createMockPantry(): PantryItem[] {
  return rawPantry.map((item) => ({ ...item, normalizedFoodId: normalizeFoodName(item.displayName) }));
}
