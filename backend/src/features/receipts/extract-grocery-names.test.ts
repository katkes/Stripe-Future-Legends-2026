import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractGroceryNames } from './extract-grocery-names.js';

test('OCR receipt lines map onto recipe pantry foods', () => {
  const text = 'OPENBASKET MART\nBaby spinach        $3.99\nAtlantic salmon fillet $12.00\n2% milk 1L\nTOTAL $18.00\nTHANK YOU';
  const foods = extractGroceryNames(text, 'Baby spinach');
  const ids = foods.map((item) => item.normalizedFoodId).sort();
  assert.deepEqual(ids, ['milk', 'salmon', 'spinach']);
});
