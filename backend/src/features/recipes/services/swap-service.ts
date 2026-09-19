import { AppError } from '../../../core/errors/app-error.js';
import type { Recipe } from '../models.js';

export function applySwapPreview(recipe: Recipe, swapId: string) {
  const swap = recipe.swaps.find((item) => item.id === swapId);
  if (!swap) throw new AppError(404, `Unknown swap ${swapId}`);

  const ingredients = recipe.ingredients.map((ingredient) => {
    if (ingredient.normalizedFoodId !== swap.fromNormalizedFoodId) return ingredient;
    return {
      ...ingredient,
      normalizedFoodId: swap.toNormalizedFoodId,
      displayName: swap.toDisplayName,
      quantity: swap.quantity,
      unit: swap.unit,
    };
  });

  return {
    recipeId: recipe.id,
    swapId: swap.id,
    reason: swap.reason,
    ingredients,
    nutritionPerServing: swap.replacementNutritionPerServing,
    estimatedCost: swap.replacementCost,
    environmentalImpact: swap.replacementImpact,
    original: {
      nutritionPerServing: recipe.nutritionPerServing,
      estimatedCost: recipe.estimatedCost,
      environmentalImpact: recipe.environmentalImpact,
    },
  };
}
