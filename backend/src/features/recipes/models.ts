export type FreshnessSource = 'estimated' | 'scanned-label' | 'user-entered' | 'unknown';
export type PantryStatus = 'available' | 'used' | 'finished' | 'frozen' | 'donated' | 'discarded';
export type RecipeDifficulty = 'easy' | 'medium' | 'advanced';
export type ImpactLevel = 'low' | 'moderate' | 'high';
export type IngredientRole = 'protein' | 'base' | 'vegetable' | 'seasoning' | 'optional';
export type GoalMode = 'budget' | 'protein' | 'quick' | 'sustainable';
export type RecommendationCategory = 'ready-now' | 'one-item-away' | 'recommended-for-goal';

export type PantryItem = {
  id: string;
  userId: string;
  normalizedFoodId: string;
  displayName: string;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  estimatedUseByDate?: string;
  printedExpirationDate?: string;
  freshnessSource: FreshnessSource;
  status: PantryStatus;
};

export type RecipeIngredient = {
  normalizedFoodId: string;
  displayName: string;
  quantity: number;
  unit: string;
  optional: boolean;
  role: IngredientRole;
  substitutionIds?: string[];
};

export type RecipeStep = {
  order: number;
  instruction: string;
};

export type NutritionData = {
  calories: number;
  proteinGrams: number;
  fibreGrams: number;
};

export type CostEstimate = {
  minimum: number;
  maximum: number;
  currency: 'CAD';
  source: string;
  lastVerifiedAt?: string;
};

export type EnvironmentalImpact = {
  carbonKgCO2eMin: number;
  carbonKgCO2eMax: number;
  waterLitresMin: number;
  waterLitresMax: number;
  level: ImpactLevel;
  source: string;
  lastVerifiedAt?: string;
};

export type IngredientSwap = {
  id: string;
  fromNormalizedFoodId: string;
  toNormalizedFoodId: string;
  toDisplayName: string;
  quantity: number;
  unit: string;
  reason: string;
  replacementNutritionPerServing: NutritionData;
  replacementCost: CostEstimate;
  replacementImpact: EnvironmentalImpact;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  tags: string[];
  allergenIds: string[];
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

export type PantryUsage = {
  pantryItemId: string;
  quantityUsed: number;
  unit: string;
};

export type PantryTransaction = {
  id: string;
  userId: string;
  type: 'recipe-consumption';
  recipeId: string;
  createdAt: string;
  changes: { pantryItemId: string; previousQuantity: number; newQuantity: number; previousStatus: PantryStatus }[];
  reversedAt?: string;
};

export type UserFoodPreferences = {
  userId: string;
  allergens: string[];
  dislikedFoodIds: string[];
  dietTags: string[];
};

export type PantryAdapter = {
  getAvailableItems(userId: string): Promise<PantryItem[]>;
  consumeItems(userId: string, usage: PantryUsage[], recipeId: string): Promise<PantryTransaction>;
  undoConsumption(userId: string, transactionId: string): Promise<void>;
};

export type GroceryListAdapter = {
  addItems(userId: string, items: RecipeIngredient[], sourceRecipeId: string): Promise<void>;
  hasItem(userId: string, normalizedFoodId: string): Promise<boolean>;
  listItems(userId: string): Promise<{ normalizedFoodId: string; displayName: string; quantity: number; unit: string; sourceRecipeId: string }[]>;
};

export type RecipeRepository = {
  getAll(): Promise<Recipe[]>;
  getById(recipeId: string): Promise<Recipe | null>;
};

export type PreferencesAdapter = {
  getPreferences(userId: string): Promise<UserFoodPreferences>;
};

export type CookingSession = {
  id: string;
  userId: string;
  recipeId: string;
  currentStep: number;
  servingsPrepared: number;
  startedAt: string;
  completedAt?: string;
};
