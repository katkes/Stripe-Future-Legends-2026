import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { mockPreferences } from './data/mock-preferences.js';
import { createMockPantry, DEMO_USER_ID } from './data/mock-pantry.js';
import { mockRecipes } from './data/mock-recipes.js';
import { normalizeFoodName } from './normalize-food.js';
import { recommendRecipes, scoreRecipe } from './services/recommendation-service.js';
import { resetRecipeStores } from './stores/memory-store.js';

afterEach(() => resetRecipeStores());

test('aliases map receipt names onto pantry food ids', () => {
  assert.equal(normalizeFoodName('Baby spinach'), 'spinach');
  assert.equal(normalizeFoodName('Atlantic salmon fillet'), 'salmon');
  assert.equal(normalizeFoodName('2% milk'), 'milk');
  assert.equal(normalizeFoodName('Large white eggs'), 'egg');
});

test('ranks ready-now recipes using pantry coverage and use-soon salmon/spinach', () => {
  const pantry = createMockPantry();
  const results = recommendRecipes(mockRecipes, pantry, mockPreferences, { goal: 'quick' }, DEMO_USER_ID);
  const ready = results.filter((item) => item.category === 'ready-now').map((item) => item.recipe.id);
  assert.ok(ready.includes('creamy-salmon-udon'));
  assert.ok(ready.includes('spinach-egg-fried-rice'));
  assert.ok(ready.includes('gochujang-salmon-rice-bowl'));
  assert.ok(ready.includes('garlic-egg-udon'));
  const salmon = results.find((item) => item.recipe.id === 'creamy-salmon-udon');
  assert.equal(salmon?.pantryMatchPercentage, 100);
  assert.ok(salmon?.useSoonItems.some((item) => item.normalizedFoodId === 'spinach' || item.normalizedFoodId === 'salmon'));
  assert.ok(salmon?.scoreReasons[0].includes('pantry'));
});

test('marks Korean beef bowls as one item away', () => {
  const results = recommendRecipes(mockRecipes, createMockPantry(), mockPreferences, { goal: 'budget' }, DEMO_USER_ID);
  const beef = results.find((item) => item.recipe.id === 'korean-beef-rice-bowls');
  assert.equal(beef?.category, 'one-item-away');
  assert.equal(beef?.missingIngredients[0].normalizedFoodId, 'ground-beef');
  assert.ok((beef?.recipesUnlocked ?? 0) >= 1);
});

test('hard-filters recipes that contain confirmed allergens', () => {
  const scored = scoreRecipe(
    mockRecipes.find((recipe) => recipe.id === 'garlic-egg-udon')!,
    createMockPantry(),
    { ...mockPreferences, allergens: ['egg'] },
    'quick',
    new Date(),
    [],
  );
  assert.equal(scored, null);
});
