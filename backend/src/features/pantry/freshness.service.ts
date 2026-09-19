type StorageMethod = 'refrigerated' | 'frozen' | 'pantry';
type Freshness = { source: 'label' | 'estimated'; bestByDate?: Date; estimatedStartDate?: Date; estimatedEndDate?: Date; confidence: number; confidenceLabel: 'high' | 'medium' | 'low'; evidence: string[] };

const rules: Record<string, Record<StorageMethod, [number, number]>> = {
  'leafy greens': { refrigerated: [3, 5], frozen: [240, 365], pantry: [1, 2] },
  berries: { refrigerated: [2, 4], frozen: [240, 365], pantry: [1, 2] },
  dairy: { refrigerated: [7, 14], frozen: [30, 90], pantry: [1, 2] },
  poultry: { refrigerated: [1, 2], frozen: [270, 365], pantry: [1, 1] },
  meat: { refrigerated: [3, 5], frozen: [120, 365], pantry: [1, 1] },
  bread: { refrigerated: [5, 7], frozen: [60, 90], pantry: [3, 5] },
  produce: { refrigerated: [4, 7], frozen: [180, 365], pantry: [2, 5] },
  unknown: { refrigerated: [3, 7], frozen: [90, 180], pantry: [3, 7] },
};

function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next; }
function categoryFor(name: string) {
  const text = name.toLowerCase();
  if (/spinach|lettuce|kale|arugula|greens/.test(text)) return 'leafy greens';
  if (/strawberr|blueberr|raspberr|blackberr/.test(text)) return 'berries';
  if (/milk|yogurt|cheese|cream/.test(text)) return 'dairy';
  if (/chicken|turkey/.test(text)) return 'poultry';
  if (/beef|pork|steak|ground meat/.test(text)) return 'meat';
  if (/bread|bagel|tortilla/.test(text)) return 'bread';
  if (/tomato|apple|banana|avocado|carrot|broccoli|pepper|onion/.test(text)) return 'produce';
  return 'unknown';
}

function validDate(year: number, month: number, day: number) { const date = new Date(year, month, day); return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : undefined; }
function monthIndex(value: string) { return ['ja', 'fe', 'ma', 'ap', 'my', 'jn', 'jl', 'au', 'se', 'oc', 'no', 'de'].indexOf(value.toLowerCase().slice(0, 2)); }
function parseDate(value: string): { date: Date; text: string } | undefined {
  const iso = value.match(/\b(20\d{2})\D{1,4}(0?[1-9]|1[0-2])\D{1,4}([0-2]?\d|3[01])\b/);
  if (iso) { const date = validDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])); if (date) return { date, text: iso[0] }; }
  const yearFirstNamed = value.match(/\b(20\d{2})\D{0,4}(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ja|fe|ma|ap|my|jn|jl|au|se|oc|no|de)[a-z]*\D{0,4}([0-2]?\d|3[01])\b/i);
  if (yearFirstNamed) { const date = validDate(Number(yearFirstNamed[1]), monthIndex(yearFirstNamed[2]), Number(yearFirstNamed[3])); if (date) return { date, text: yearFirstNamed[0] }; }
  const named = value.match(/\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*,?\s*(20\d{2})\b/i);
  if (named) { const date = validDate(Number(named[3]), monthIndex(named[2]), Number(named[1])); if (date) return { date, text: named[0] }; }
  const monthFirst = value.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})\s*,?\s*(20\d{2})\b/i);
  if (monthFirst) { const date = validDate(Number(monthFirst[3]), monthIndex(monthFirst[1]), Number(monthFirst[2])); if (date) return { date, text: monthFirst[0] }; }
  const numeric = value.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2})\b/);
  if (numeric) { const date = validDate(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])); if (date) return { date, text: numeric[0] }; }
  return undefined;
}

export function freshnessFromText(text: string, itemName: string, storageMethod: StorageMethod, purchasedAt = new Date()): { category: string; freshness: Freshness } {
  const label = text.match(/(?:best\s*(?:before|by)|use\s*by|expires?|exp(?:iry|iration)?)[^\n]{0,44}/i)?.[0];
  const labelDate = label ? parseDate(label) : undefined;
  if (label && labelDate) return { category: categoryFor(itemName), freshness: { source: 'label', bestByDate: labelDate.date, confidence: 0.97, confidenceLabel: 'high', evidence: [`Printed date label detected: ${label.trim()}`] } };
  const packageDate = parseDate(text);
  if (packageDate) return { category: categoryFor(itemName), freshness: { source: 'label', bestByDate: packageDate.date, confidence: 0.86, confidenceLabel: 'high', evidence: [`Package date detected from OCR: ${packageDate.text}`] } };
  const category = categoryFor(itemName);
  const [start, end] = rules[category][storageMethod];
  const confidence = category === 'unknown' ? 0.4 : 0.68;
  return { category, freshness: { source: 'estimated', estimatedStartDate: addDays(purchasedAt, start), estimatedEndDate: addDays(purchasedAt, end), confidence, confidenceLabel: confidence >= 0.65 ? 'medium' : 'low', evidence: [`Estimated from ${category} shelf-life guidance and ${storageMethod} storage.`] } };
}
