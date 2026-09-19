import { cad } from '../data/mock-impact.js';
import type {
  CostEstimate,
  GoalMode,
  MatchedIngredient,
  PantryItem,
  Recipe,
  RecipeIngredient,
  RecipeRecommendation,
  RecommendationCategory,
  UserFoodPreferences,
} from '../models.js';
import { INGREDIENT_WEIGHT } from '../normalize-food.js';
import { recentRecipeIds } from '../stores/memory-store.js';
import { convertQuantity } from './unit-conversion.js';

export type RecommendationQuery = {
  search?: string;
  filters?: string[];
  goal?: GoalMode;
  maximumMissingIngredients?: number;
  maximumMinutes?: number;
  now?: Date;
};

function requiredIngredients(recipe: Recipe) {
  return recipe.ingredients.filter((ingredient) => !ingredient.optional && ingredient.role !== 'optional');
}

function daysUntil(date: string | undefined, now: Date) {
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.ceil((new Date(date).getTime() - now.getTime()) / 86_400_000);
}

function urgency(days: number) {
  if (days <= 2) return 1;
  if (days <= 4) return 0.6;
  if (days <= 7) return 0.3;
  return 0;
}

export function estimatedDaysRemaining(item: PantryItem, now: Date) {
  return daysUntil(item.estimatedUseByDate, now);
}

function findPantryMatch(ingredient: RecipeIngredient, pantry: PantryItem[]) {
  const matches = pantry.filter((item) => item.normalizedFoodId === ingredient.normalizedFoodId && item.status === 'available');
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => estimatedDaysRemaining(a, new Date()) - estimatedDaysRemaining(b, new Date()))[0];
}

function ownedEnough(ingredient: RecipeIngredient, item: PantryItem) {
  const converted = convertQuantity(ingredient.normalizedFoodId, item.quantity, item.unit, ingredient.unit);
  if (converted === null) return item.quantity > 0;
  return converted + 1e-9 >= ingredient.quantity;
}

function coverage(recipe: Recipe, pantry: PantryItem[]) {
  const required = requiredIngredients(recipe);
  const totalWeight = required.reduce((sum, ingredient) => sum + (INGREDIENT_WEIGHT[ingredient.role] ?? 1), 0) || 1;
  let ownedWeight = 0;
  const matched: MatchedIngredient[] = [];
  const missing: RecipeIngredient[] = [];

  for (const ingredient of required) {
    const pantryItem = findPantryMatch(ingredient, pantry);
    const weight = INGREDIENT_WEIGHT[ingredient.role] ?? 1;
    if (pantryItem && ownedEnough(ingredient, pantryItem)) {
      ownedWeight += weight;
      matched.push({
        ingredient,
        pantryItem,
        pantryQuantityLabel: `${pantryItem.quantity} ${pantryItem.unit}`,
      });
    } else {
      missing.push(ingredient);
    }
  }

  return { pantryCoverage: ownedWeight / totalWeight, matched, missing };
}

function useSoonScore(matched: MatchedIngredient[], now: Date) {
  if (matched.length === 0) return { score: 0, items: [] as PantryItem[] };
  const items = matched
    .map((entry) => entry.pantryItem)
    .filter((item) => item.freshnessSource !== 'unknown' && item.estimatedUseByDate);
  const urgent = items.filter((item) => urgency(estimatedDaysRemaining(item, now)) > 0);
  if (urgent.length === 0) return { score: 0, items: [] };
  const score = urgent.reduce((sum, item) => sum + urgency(estimatedDaysRemaining(item, now)), 0) / urgent.length;
  return { score, items: urgent };
}

function goalRaw(recipe: Recipe, missingCount: number, goal: GoalMode) {
  const minutes = recipe.prepMinutes + recipe.cookMinutes;
  const cost = (recipe.estimatedCost.minimum + recipe.estimatedCost.maximum) / 2 / recipe.servings;
  const carbon = (recipe.environmentalImpact.carbonKgCO2eMin + recipe.environmentalImpact.carbonKgCO2eMax) / 2;
  if (goal === 'budget') return 1 - Math.min(1, cost / 8) * 0.7 - Math.min(1, missingCount / 3) * 0.3;
  if (goal === 'protein') return Math.min(1, recipe.nutritionPerServing.proteinGrams / 40);
  if (goal === 'quick') return 1 - Math.min(1, minutes / 45);
  return 1 - Math.min(1, carbon / 6);
}

function categoryOf(missing: RecipeIngredient[], goalScore: number): RecommendationCategory {
  if (missing.length === 0) return 'ready-now';
  const minorMissing = missing.filter((ingredient) => ingredient.role === 'seasoning');
  const majorMissing = missing.filter((ingredient) => ingredient.role !== 'seasoning');
  if (majorMissing.length === 1 && minorMissing.length === 0) return 'one-item-away';
  if (majorMissing.length === 0 && minorMissing.length > 0 && minorMissing.length <= 2) return 'one-item-away';
  if (goalScore >= 0.55) return 'recommended-for-goal';
  return 'recommended-for-goal';
}

function missingCost(missing: RecipeIngredient[]): CostEstimate {
  const unitPrices: Record<string, number> = {
    'ground-beef': 0.014,
    lentils: 0.006,
    salmon: 0.028,
    spinach: 0.012,
    milk: 0.002,
  };
  const total = missing.reduce((sum, ingredient) => sum + (unitPrices[ingredient.normalizedFoodId] ?? 0.01) * ingredient.quantity, 0);
  if (missing.length === 0) return cad(0, 0);
  return cad(Number((total * 0.9).toFixed(2)), Number((total * 1.15).toFixed(2)));
}

function reasonText(recipe: Recipe, matched: MatchedIngredient[], missing: RecipeIngredient[], useSoon: PantryItem[], now: Date) {
  const names = matched.map((entry) => entry.ingredient.displayName.toLowerCase());
  const soon = useSoon[0];
  const soonLabel = soon
    ? `${soon.displayName.toLowerCase()} that should be used soon (estimated ${Math.max(0, estimatedDaysRemaining(soon, now))} day${estimatedDaysRemaining(soon, now) === 1 ? '' : 's'} remaining)`
    : undefined;
  if (missing.length === 0 && soon) {
    return `Uses ${matched.length} ingredients already in your pantry, including ${soonLabel}.`;
  }
  if (missing.length === 0) {
    return `Uses ${matched.length} ingredients already in your pantry${names[0] ? `, including ${names[0]}` : ''}.`;
  }
  if (missing.length === 1) {
    return `One grocery item away (${missing[0].displayName.toLowerCase()}). You already have ${matched.length} of the required ingredients.`;
  }
  return `Strong match for your selected goal. Missing ${missing.length} required items, including ${missing[0].displayName.toLowerCase()}.`;
}

function passesFilters(recipe: Recipe, filters: string[], minutes: number) {
  for (const filter of filters) {
    if (filter === 'under-20' && minutes > 20) return false;
    if (filter === 'quick' && minutes > 20) return false;
    if (filter === 'high-protein' && recipe.nutritionPerServing.proteinGrams < 25) return false;
    if (filter === 'budget' && (recipe.estimatedCost.maximum / recipe.servings) > 5) return false;
    if (filter === 'easy' && recipe.difficulty !== 'easy') return false;
    if (filter === 'uses-spinach' && !recipe.ingredients.some((ingredient) => ingredient.normalizedFoodId === 'spinach')) return false;
    if (filter === 'uses-salmon' && !recipe.ingredients.some((ingredient) => ingredient.normalizedFoodId === 'salmon')) return false;
    if (filter === 'vegetarian' && recipe.ingredients.some((ingredient) => ['salmon', 'ground-beef'].includes(ingredient.normalizedFoodId))) return false;
  }
  return true;
}

function matchesSearch(recipe: Recipe, search: string) {
  if (!search.trim()) return true;
  const haystack = [recipe.title, recipe.description, ...recipe.tags, ...recipe.ingredients.map((ingredient) => ingredient.displayName)].join(' ').toLowerCase();
  return haystack.includes(search.trim().toLowerCase());
}

function containsAllergen(recipe: Recipe, preferences: UserFoodPreferences) {
  return recipe.allergenIds.some((id) => preferences.allergens.includes(id))
    || recipe.ingredients.some((ingredient) => preferences.allergens.includes(ingredient.normalizedFoodId));
}

export function scoreRecipe(
  recipe: Recipe,
  pantry: PantryItem[],
  preferences: UserFoodPreferences,
  goal: GoalMode,
  now: Date,
  recentlyCooked: string[],
): RecipeRecommendation | null {
  if (containsAllergen(recipe, preferences)) return null;
  if (recipe.ingredients.some((ingredient) => preferences.dislikedFoodIds.includes(ingredient.normalizedFoodId))) return null;

  const { pantryCoverage, matched, missing } = coverage(recipe, pantry);
  const useSoon = useSoonScore(matched, now);
  const goalScore = Math.max(0, Math.min(1, goalRaw(recipe, missing.length, goal)));
  const preferenceCompatibility = recipe.tags.some((tag) => preferences.dietTags.includes(tag)) || preferences.dietTags.length === 0 ? 1 : 0.7;
  const varietyScore = recentlyCooked.includes(recipe.id) ? 0.2 : 1;
  const score = pantryCoverage * 40 + useSoon.score * 25 + goalScore * 20 + preferenceCompatibility * 10 + varietyScore * 5;
  const category = categoryOf(missing, goalScore);
  return {
    recipe,
    pantryMatchPercentage: Math.round(pantryCoverage * 100),
    matchedIngredients: matched,
    missingIngredients: missing,
    useSoonItems: useSoon.items,
    estimatedMissingCost: missingCost(missing),
    score: Number(score.toFixed(2)),
    scoreReasons: [reasonText(recipe, matched, missing, useSoon.items, now)],
    category,
  };
}

export function attachUnlockCounts(results: RecipeRecommendation[]) {
  return results.map((result) => {
    if (result.missingIngredients.length !== 1) return result;
    const foodId = result.missingIngredients[0].normalizedFoodId;
    const unlocked = results.filter((other) => other.missingIngredients.some((ingredient) => ingredient.normalizedFoodId === foodId)).length;
    return { ...result, recipesUnlocked: unlocked };
  });
}

export function recommendRecipes(
  recipes: Recipe[],
  pantry: PantryItem[],
  preferences: UserFoodPreferences,
  query: RecommendationQuery,
  userId: string,
) {
  const now = query.now ?? new Date();
  const goal = query.goal ?? 'quick';
  const filters = query.filters ?? [];
  const cooked = recentRecipeIds(userId);

  const scored = recipes
    .filter((recipe) => matchesSearch(recipe, query.search ?? ''))
    .filter((recipe) => {
      const minutes = recipe.prepMinutes + recipe.cookMinutes;
      if (query.maximumMinutes && minutes > query.maximumMinutes) return false;
      return passesFilters(recipe, filters, minutes);
    })
    .map((recipe) => scoreRecipe(recipe, pantry, preferences, goal, now, cooked))
    .filter((result): result is RecipeRecommendation => result !== null)
    .filter((result) => query.maximumMissingIngredients === undefined || result.missingIngredients.length <= query.maximumMissingIngredients)
    .sort((a, b) => b.score - a.score);

  return attachUnlockCounts(scored);
}

export function sectionize(results: RecipeRecommendation[]) {
  return {
    readyNow: results.filter((item) => item.category === 'ready-now'),
    oneItemAway: results.filter((item) => item.category === 'one-item-away'),
    recommendedForGoal: results.filter((item) => item.category === 'recommended-for-goal'),
  };
}
