import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapStoredPantryItems } from './adapters/user-pantry.js';

test('maps scanner pantry names onto recipe food ids', () => {
  const items = mapStoredPantryItems('user-1', [
    { _id: { toString: () => 'abc' }, name: 'Baby spinach', freshness: { source: 'estimated', estimatedEndDate: '2026-09-21T12:00:00.000Z' } },
    { name: 'Atlantic salmon fillet', freshness: { source: 'label', bestByDate: '2026-09-22T12:00:00.000Z' } },
  ]);
  assert.equal(items[0].normalizedFoodId, 'spinach');
  assert.equal(items[0].freshnessSource, 'estimated');
  assert.equal(items[1].normalizedFoodId, 'salmon');
  assert.equal(items[1].freshnessSource, 'scanned-label');
  assert.equal(items[1].printedExpirationDate?.startsWith('2026-09-22'), true);
});
