import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { memoryGroceryAdapter } from './adapters/grocery-list-adapter.js';
import { DEMO_USER_ID } from './data/mock-pantry.js';
import { mockRecipes } from './data/mock-recipes.js';
import { recommendRecipes } from './services/recommendation-service.js';
import { createMockPantry } from './data/mock-pantry.js';
import { mockPreferences } from './data/mock-preferences.js';
import { applySwapPreview } from './services/swap-service.js';
import { addMissingIngredients } from './services/recipe-service.js';
import { resetRecipeStores } from './stores/memory-store.js';

afterEach(() => resetRecipeStores());

test('budget goal prefers lower-cost ready recipes over salmon bowls', () => {
  const budget = recommendRecipes(mockRecipes, createMockPantry(), mockPreferences, { goal: 'budget', filters: [] }, DEMO_USER_ID)
    .filter((item) => item.category === 'ready-now');
  const protein = recommendRecipes(mockRecipes, createMockPantry(), mockPreferences, { goal: 'protein' }, DEMO_USER_ID)
    .filter((item) => item.category === 'ready-now');
  assert.ok(budget[0].recipe.id === 'spinach-egg-fried-rice' || budget[0].recipe.id === 'garlic-egg-udon');
  assert.ok(protein[0].recipe.nutritionPerServing.proteinGrams >= 30);
});

test('adding missing grocery items is idempotent', async () => {
  const missing = mockRecipes.find((recipe) => recipe.id === 'korean-beef-rice-bowls')!.ingredients.filter((item) => item.normalizedFoodId === 'ground-beef');
  await addMissingIngredients(DEMO_USER_ID, 'korean-beef-rice-bowls', missing);
  await addMissingIngredients(DEMO_USER_ID, 'korean-beef-rice-bowls', missing);
  const items = await memoryGroceryAdapter.listItems(DEMO_USER_ID);
  assert.equal(items.filter((item) => item.normalizedFoodId === 'ground-beef').length, 1);
});

test('preview swap recalculates structured nutrition and impact without mutating the recipe', () => {
  const recipe = mockRecipes.find((item) => item.id === 'beef-and-vegetable-bowl')!;
  const preview = applySwapPreview(recipe, 'beef-to-lentils');
  assert.equal(recipe.ingredients.some((item) => item.normalizedFoodId === 'ground-beef'), true);
  assert.equal(preview.ingredients.some((item) => item.normalizedFoodId === 'lentils'), true);
  assert.equal(preview.nutritionPerServing.fibreGrams, 11);
  assert.equal(preview.environmentalImpact.level, 'low');
  assert.equal(preview.estimatedCost.currency, 'CAD');
});
