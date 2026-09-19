import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { memoryPantryAdapter } from './adapters/pantry-adapter.js';
import { createMockPantry, DEMO_USER_ID } from './data/mock-pantry.js';
import { recommendRecipes } from './services/recommendation-service.js';
import { mockRecipes } from './data/mock-recipes.js';
import { mockPreferences } from './data/mock-preferences.js';
import { completeCooking, undoConsumption } from './services/recipe-service.js';
import { pantryFor, resetRecipeStores } from './stores/memory-store.js';

afterEach(() => resetRecipeStores());

test('cooking a recipe reduces pantry quantity and never goes negative', async () => {
  const before = (await memoryPantryAdapter.getAvailableItems(DEMO_USER_ID)).find((item) => item.normalizedFoodId === 'salmon');
  assert.ok(before);
  const previous = before.quantity;
  const result = await completeCooking(DEMO_USER_ID, 'session-1', 'creamy-salmon-udon', 2);
  const after = pantryFor(DEMO_USER_ID).find((item) => item.id === before.id);
  assert.ok(after);
  assert.ok(after.quantity < previous);
  assert.ok(after.quantity >= 0);
  assert.ok(result.undoToken);

  await undoConsumption(DEMO_USER_ID, result.undoToken);
  const restored = pantryFor(DEMO_USER_ID).find((item) => item.id === before.id);
  assert.equal(restored?.quantity, previous);
  assert.equal(restored?.status, 'available');
});

test('insufficient pantry quantity is rejected instead of going negative', async () => {
  const salmon = pantryFor(DEMO_USER_ID).find((item) => item.normalizedFoodId === 'salmon')!;
  salmon.quantity = 10;
  await assert.rejects(
    () => completeCooking(DEMO_USER_ID, 'session-2', 'creamy-salmon-udon', 2),
    /insufficient/,
  );
  assert.equal(pantryFor(DEMO_USER_ID).find((item) => item.id === salmon.id)?.quantity, 10);
});

test('filter chips combine with search', () => {
  const quick = recommendRecipes(mockRecipes, createMockPantry(), mockPreferences, { filters: ['under-20'], search: 'udon' }, DEMO_USER_ID);
  assert.ok(quick.every((item) => item.recipe.prepMinutes + item.recipe.cookMinutes <= 20));
  assert.ok(quick.some((item) => item.recipe.id === 'garlic-egg-udon'));
  assert.ok(!quick.some((item) => item.recipe.id === 'creamy-salmon-udon'));
});
