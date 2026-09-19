import { foodAliases } from '../recipes/data/food-aliases.js';
import { normalizeFoodName } from '../recipes/normalize-food.js';

const IGNORE = /\b(total|subtotal|tax|change|visa|debit|mastercard|thank|tel|gst|hst|cash|card)\b/i;

/** Pull known grocery foods from OCR.space receipt text using the same alias map as recipes. */
export function extractGroceryNames(text: string, extraName?: string) {
  const found: { displayName: string; normalizedFoodId: string }[] = [];

  function add(raw: string) {
    const line = raw.replace(/\$[\d.]+/g, ' ').replace(/\b[\d.]+ ?(kg|g|lb|oz|ml|l|pk)\b/gi, ' ').replace(/[^a-z0-9%\s]/gi, ' ').replace(/\s+/g, ' ').trim();
    if (line.length < 3 || IGNORE.test(line)) return;
    let id: string | undefined;
    const lower = line.toLowerCase();
    if (foodAliases[lower]) id = foodAliases[lower];
    else {
      for (const [alias, foodId] of Object.entries(foodAliases)) {
        if (alias.length >= 3 && lower.includes(alias)) {
          id = foodId;
          break;
        }
      }
    }
    if (!id) return;
    if (found.some((item) => item.normalizedFoodId === id)) return;
    found.push({ displayName: extraName && normalizeFoodName(extraName) === id ? extraName.trim() : line, normalizedFoodId: id });
  }

  if (extraName?.trim() && extraName.trim() !== 'Unidentified grocery item') add(extraName);
  for (const line of text.split(/\n+/)) add(line);
  return found;
}
