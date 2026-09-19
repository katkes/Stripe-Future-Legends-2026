import type { GoalMode, RecipeIngredient, RecipeRecommendation, RecommendationResponse, SwapPreview } from '../models';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const recipeApi = {
  recommendations(params: { search?: string; filters?: string[]; goal?: GoalMode; maximumMinutes?: number }) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.goal) query.set('goal', params.goal);
    if (params.maximumMinutes) query.set('maximumMinutes', String(params.maximumMinutes));
    for (const filter of params.filters ?? []) query.append('filters', filter);
    return request<RecommendationResponse>(`/api/v1/recipes/recommendations?${query.toString()}`);
  },

  detail(recipeId: string, goal: GoalMode) {
    return request<RecipeRecommendation>(`/api/v1/recipes/${recipeId}?goal=${goal}`);
  },

  previewSwap(recipeId: string, swapId: string) {
    return request<SwapPreview>(`/api/v1/recipes/${recipeId}/preview-swap`, { method: 'POST', body: JSON.stringify({ swapId }) });
  },

  addGroceryItems(recipeId: string, ingredients: RecipeIngredient[]) {
    return request<{ items: { normalizedFoodId: string }[] }>('/api/v1/grocery-lists/items', {
      method: 'POST',
      body: JSON.stringify({ source: 'recipe', recipeId, ingredients }),
    });
  },

  groceryItems() {
    return request<{ items: { normalizedFoodId: string; displayName: string; quantity: number; unit: string }[] }>('/api/v1/grocery-lists/items');
  },

  startCooking(recipeId: string) {
    return request<{ id: string; recipeId: string; currentStep: number; servingsPrepared: number }>(`/api/v1/recipes/${recipeId}/cooking-sessions`, { method: 'POST' });
  },

  completeCooking(sessionId: string, recipeId: string, servingsPrepared: number, ingredientUsage?: { pantryItemId: string; quantityUsed: number; unit: string }[]) {
    return request<{ pantryUpdates: { pantryItemId: string; previousQuantity: number; newQuantity: number }[]; undoToken: string }>(
      `/api/v1/cooking-sessions/${sessionId}/complete`,
      { method: 'POST', body: JSON.stringify({ recipeId, servingsPrepared, ingredientUsage }) },
    );
  },

  undo(undoToken: string) {
    return request<{ ok: boolean }>('/api/v1/pantry/consumption/undo', { method: 'POST', body: JSON.stringify({ undoToken }) });
  },
};
