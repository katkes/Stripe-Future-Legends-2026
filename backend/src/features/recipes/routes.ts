import { Router } from 'express';
import { optionalAuth } from '../auth/require-auth.js';
import { AppError } from '../../core/errors/app-error.js';
import { memoryGroceryAdapter } from './adapters/grocery-list-adapter.js';
import {
  addMissingIngredients,
  completeCooking,
  defaultUserId,
  getRecipeDetail,
  getRecommendations,
  previewSwap,
  startCooking,
  undoConsumption,
} from './services/recipe-service.js';
import type { GoalMode } from './models.js';

function userId(request: { auth?: { userId: string }; header: (name: string) => string | undefined }) {
  return defaultUserId(request.auth?.userId || request.header('x-user-id'));
}

function asGoal(value: unknown): GoalMode {
  return value === 'budget' || value === 'protein' || value === 'quick' || value === 'sustainable' ? value : 'quick';
}

export const recipesRouter = Router();
recipesRouter.use(optionalAuth);

recipesRouter.get('/recommendations', async (request, response, next) => {
  try {
    const filters = request.query.filters;
    const filterList = Array.isArray(filters) ? filters.map(String) : filters ? [String(filters)] : [];
    const payload = await getRecommendations(userId(request), {
      search: request.query.search ? String(request.query.search) : undefined,
      filters: filterList,
      goal: asGoal(request.query.goal),
      maximumMissingIngredients: request.query.maximumMissingIngredients ? Number(request.query.maximumMissingIngredients) : undefined,
      maximumMinutes: request.query.maximumMinutes ? Number(request.query.maximumMinutes) : undefined,
    });
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

recipesRouter.get('/:recipeId', async (request, response, next) => {
  try {
    response.json(await getRecipeDetail(userId(request), request.params.recipeId, asGoal(request.query.goal)));
  } catch (error) {
    next(error);
  }
});

recipesRouter.post('/:recipeId/preview-swap', async (request, response, next) => {
  try {
    const swapId = request.body?.swapId;
    if (!swapId) throw new AppError(400, 'swapId is required');
    response.json(await previewSwap(request.params.recipeId, String(swapId)));
  } catch (error) {
    next(error);
  }
});

recipesRouter.post('/:recipeId/cooking-sessions', async (request, response, next) => {
  try {
    response.status(201).json(await startCooking(userId(request), request.params.recipeId));
  } catch (error) {
    next(error);
  }
});

export const groceryListItemsRouter = Router();
groceryListItemsRouter.use(optionalAuth);
groceryListItemsRouter.get('/items', async (request, response, next) => {
  try {
    response.json({ items: await memoryGroceryAdapter.listItems(userId(request)) });
  } catch (error) {
    next(error);
  }
});
groceryListItemsRouter.post('/items', async (request, response, next) => {
  try {
    const recipeId = String(request.body?.recipeId ?? '');
    const ingredients = request.body?.ingredients;
    if (!recipeId || !Array.isArray(ingredients)) throw new AppError(400, 'recipeId and ingredients are required');
    response.json({ items: await addMissingIngredients(userId(request), recipeId, ingredients) });
  } catch (error) {
    next(error);
  }
});

export const cookingSessionsRouter = Router();
cookingSessionsRouter.use(optionalAuth);
cookingSessionsRouter.post('/:sessionId/complete', async (request, response, next) => {
  try {
    const recipeId = String(request.body?.recipeId ?? '');
    const servingsPrepared = Number(request.body?.servingsPrepared ?? 0);
    if (!recipeId || !servingsPrepared) throw new AppError(400, 'recipeId and servingsPrepared are required');
    response.json(await completeCooking(userId(request), request.params.sessionId, recipeId, servingsPrepared, request.body?.ingredientUsage));
  } catch (error) {
    next(error);
  }
});

export const pantryConsumptionRouter = Router();
pantryConsumptionRouter.use(optionalAuth);
pantryConsumptionRouter.post('/consumption/undo', async (request, response, next) => {
  try {
    const undoToken = String(request.body?.undoToken ?? '');
    if (!undoToken) throw new AppError(400, 'undoToken is required');
    await undoConsumption(userId(request), undoToken);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
