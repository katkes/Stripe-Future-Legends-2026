import { Router } from 'express';
import { AppError } from '../../core/errors/app-error.js';
import { optionalAuth } from '../auth/optional-auth.js';
import { User } from '../auth/user.model.js';
import { recommendWithAi } from './recommend.service.js';
import type { PantrySnapshot } from './recipe-types.js';

export const recipesRouter = Router();
recipesRouter.use(optionalAuth);

recipesRouter.get('/recommendations', async (request, response, next) => {
  try {
    let pantry: PantrySnapshot[] = [];
    if (request.auth?.userId) {
      const user = await User.findById(request.auth.userId);
      if (!user) throw new AppError(404, 'User not found.');
      pantry = user.pantryItems.map((item) => ({
        name: item.name,
        category: item.category,
        storageMethod: item.storageMethod,
        bestByDate: item.freshness.bestByDate ? item.freshness.bestByDate.toISOString().slice(0, 10) : undefined,
        estimatedEndDate: item.freshness.estimatedEndDate ? item.freshness.estimatedEndDate.toISOString().slice(0, 10) : undefined,
      }));
    }
    const goal = typeof request.query.goal === 'string' ? request.query.goal : undefined;
    response.json(await recommendWithAi(pantry, goal));
  } catch (error) { next(error); }
});
