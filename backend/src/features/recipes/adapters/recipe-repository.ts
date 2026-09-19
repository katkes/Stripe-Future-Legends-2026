import { mockRecipes } from '../data/mock-recipes.js';
import type { RecipeRepository } from '../models.js';

export const memoryRecipeRepository: RecipeRepository = {
  async getAll() {
    return mockRecipes;
  },
  async getById(recipeId) {
    return mockRecipes.find((recipe) => recipe.id === recipeId) ?? null;
  },
};
