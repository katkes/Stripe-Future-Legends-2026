export type PantrySnapshot = {
  name: string;
  category: string;
  storageMethod: string;
  bestByDate?: string;
  estimatedEndDate?: string;
};

export type RecipeIngredient = {
  item: string;
  amount: string;
  fromPantry: boolean;
};

export type RecommendedRecipe = {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  servings: number;
  summary: string;
  why: string;
  usesPantry: string[];
  missing: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
};

export type RecommendationPayload = {
  source: 'ai';
  model: string;
  pantryCount: number;
  recipes: RecommendedRecipe[];
};
