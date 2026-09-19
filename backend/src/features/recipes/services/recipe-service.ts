import { randomUUID } from 'node:crypto';
import { AppError } from '../../../core/errors/app-error.js';
import { User } from '../../auth/user.model.js';
import { memoryGroceryAdapter } from '../adapters/grocery-list-adapter.js';
import { memoryPantryAdapter } from '../adapters/pantry-adapter.js';
import { memoryPreferencesAdapter } from '../adapters/preferences-adapter.js';
import { memoryRecipeRepository } from '../adapters/recipe-repository.js';
import { mapStoredPantryItems } from '../adapters/user-pantry.js';
import { DEMO_USER_ID } from '../data/mock-pantry.js';
import type { GoalMode, PantryUsage, RecipeIngredient } from '../models.js';
import { getCookingSession, markCooked, replacePantry, saveCookingSession } from '../stores/memory-store.js';
import { recommendRecipes, sectionize, type RecommendationQuery } from './recommendation-service.js';
import { applySwapPreview } from './swap-service.js';

async function pantryItemsFor(userId: string) {
  if (userId !== DEMO_USER_ID) {
    const user = await User.findById(userId).catch(() => null);
    replacePantry(userId, user ? mapStoredPantryItems(userId, user.pantryItems) : []);
  }
  return memoryPantryAdapter.getAvailableItems(userId);
}

export async function getRecommendations(userId: string, query: RecommendationQuery) {
  const [recipes, pantry, preferences] = await Promise.all([
    memoryRecipeRepository.getAll(),
    pantryItemsFor(userId),
    memoryPreferencesAdapter.getPreferences(userId),
  ]);
  const results = recommendRecipes(recipes, pantry, preferences, query, userId);
  const useSoonItems = pantry
    .filter((item) => item.estimatedUseByDate)
    .sort((a, b) => new Date(a.estimatedUseByDate!).getTime() - new Date(b.estimatedUseByDate!).getTime())
    .slice(0, 6);

  return {
    useSoonItems,
    sections: sectionize(results),
    generatedAt: new Date().toISOString(),
    goal: query.goal ?? 'quick',
  };
}

export async function getRecipeDetail(userId: string, recipeId: string, goal: GoalMode = 'quick') {
  const recipe = await memoryRecipeRepository.getById(recipeId);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  const [pantry, preferences] = await Promise.all([
    pantryItemsFor(userId),
    memoryPreferencesAdapter.getPreferences(userId),
  ]);
  const recommendation = recommendRecipes([recipe], pantry, preferences, { goal }, userId)[0];
  if (!recommendation) throw new AppError(403, 'This recipe is excluded by your dietary restrictions');
  return recommendation;
}

export async function previewSwap(recipeId: string, swapId: string) {
  const recipe = await memoryRecipeRepository.getById(recipeId);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  return applySwapPreview(recipe, swapId);
}

export async function addMissingIngredients(userId: string, recipeId: string, ingredients: RecipeIngredient[]) {
  await memoryGroceryAdapter.addItems(userId, ingredients, recipeId);
  return memoryGroceryAdapter.listItems(userId);
}

export async function startCooking(userId: string, recipeId: string) {
  const recipe = await memoryRecipeRepository.getById(recipeId);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  const session = {
    id: randomUUID(),
    userId,
    recipeId,
    currentStep: 0,
    servingsPrepared: recipe.servings,
    startedAt: new Date().toISOString(),
  };
  saveCookingSession(session);
  return session;
}

export function plannedUsage(recipeServings: number, servingsPrepared: number, ingredients: RecipeIngredient[], pantryItemIdByFood: Record<string, string>): PantryUsage[] {
  const scale = servingsPrepared / recipeServings;
  return ingredients
    .filter((ingredient) => !ingredient.optional && pantryItemIdByFood[ingredient.normalizedFoodId])
    .map((ingredient) => ({
      pantryItemId: pantryItemIdByFood[ingredient.normalizedFoodId],
      quantityUsed: Number((ingredient.quantity * scale).toFixed(3)),
      unit: ingredient.unit,
    }));
}

export async function completeCooking(userId: string, sessionId: string, recipeId: string, servingsPrepared: number, ingredientUsage?: PantryUsage[]) {
  const recipe = await memoryRecipeRepository.getById(recipeId);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  const pantry = await pantryItemsFor(userId);
  const pantryItemIdByFood: Record<string, string> = {};
  for (const item of pantry) {
    if (!pantryItemIdByFood[item.normalizedFoodId]) pantryItemIdByFood[item.normalizedFoodId] = item.id;
  }
  const usage = ingredientUsage ?? plannedUsage(recipe.servings, servingsPrepared, recipe.ingredients, pantryItemIdByFood);
  const transaction = await memoryPantryAdapter.consumeItems(userId, usage, recipeId);
  const session = getCookingSession(sessionId);
  if (session) {
    session.completedAt = new Date().toISOString();
    session.servingsPrepared = servingsPrepared;
  }
  markCooked(userId, recipeId);
  return { pantryUpdates: transaction.changes, undoToken: transaction.id, transaction };
}

export async function undoConsumption(userId: string, undoToken: string) {
  await memoryPantryAdapter.undoConsumption(userId, undoToken);
}

export function defaultUserId(header?: string) {
  return header || DEMO_USER_ID;
}
