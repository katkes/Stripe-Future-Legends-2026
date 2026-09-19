export type GoalMode = 'budget' | 'protein' | 'quick' | 'sustainable';
export type RecommendationCategory = 'ready-now' | 'one-item-away' | 'recommended-for-goal';

export type NutritionData = { calories: number; proteinGrams: number; fibreGrams: number };
export type CostEstimate = { minimum: number; maximum: number; currency: 'CAD'; source: string; lastVerifiedAt?: string };
export type EnvironmentalImpact = {
  carbonKgCO2eMin: number;
  carbonKgCO2eMax: number;
  waterLitresMin: number;
  waterLitresMax: number;
  level: 'low' | 'moderate' | 'high';
  source: string;
  lastVerifiedAt?: string;
};

export type PantryItem = {
  id: string;
  userId: string;
  normalizedFoodId: string;
  displayName: string;
  quantity: number;
  unit: string;
  estimatedUseByDate?: string;
  printedExpirationDate?: string;
  freshnessSource: 'estimated' | 'scanned-label' | 'user-entered' | 'unknown';
  status: string;
};

export type RecipeIngredient = {
  normalizedFoodId: string;
  displayName: string;
  quantity: number;
  unit: string;
  optional: boolean;
  role?: string;
};

export type RecipeStep = { order: number; instruction: string };

export type IngredientSwap = {
  id: string;
  fromNormalizedFoodId: string;
  toNormalizedFoodId: string;
  toDisplayName: string;
  quantity: number;
  unit: string;
  reason: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'advanced';
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  tags: string[];
  nutritionPerServing: NutritionData;
  estimatedCost: CostEstimate;
  environmentalImpact: EnvironmentalImpact;
  swaps: IngredientSwap[];
};

export type MatchedIngredient = {
  ingredient: RecipeIngredient;
  pantryItem: PantryItem;
  pantryQuantityLabel: string;
};

export type RecipeRecommendation = {
  recipe: Recipe;
  pantryMatchPercentage: number;
  matchedIngredients: MatchedIngredient[];
  missingIngredients: RecipeIngredient[];
  useSoonItems: PantryItem[];
  estimatedMissingCost: CostEstimate;
  recipesUnlocked?: number;
  score: number;
  scoreReasons: string[];
  category: RecommendationCategory;
};

export type RecommendationResponse = {
  useSoonItems: PantryItem[];
  sections: {
    readyNow: RecipeRecommendation[];
    oneItemAway: RecipeRecommendation[];
    recommendedForGoal: RecipeRecommendation[];
  };
  generatedAt: string;
};

export type SwapPreview = {
  recipeId: string;
  swapId: string;
  reason: string;
  ingredients: RecipeIngredient[];
  nutritionPerServing: NutritionData;
  estimatedCost: CostEstimate;
  environmentalImpact: EnvironmentalImpact;
  original: {
    nutritionPerServing: NutritionData;
    estimatedCost: CostEstimate;
    environmentalImpact: EnvironmentalImpact;
  };
};

export type CookingSession = {
  id: string;
  recipeId: string;
  currentStep: number;
  servingsPrepared: number;
};
