import { Router } from 'express';
import { AppError } from '../../core/errors/app-error.js';
import { requireAuth } from '../auth/require-auth.js';
import { User } from '../auth/user.model.js';

export const pantryRouter = Router();
pantryRouter.get('/', requireAuth, async (request, response, next) => {
  try { const user = await User.findById(request.auth!.userId); if (!user) throw new AppError(404, 'User not found.'); response.json({ pantryItems: user.pantryItems }); }
  catch (error) { next(error); }
});

pantryRouter.patch('/:itemId/confirm-date', requireAuth, async (request, response, next) => {
  try {
    const { bestByDate } = request.body as { bestByDate?: string };
    if (!bestByDate || Number.isNaN(new Date(bestByDate).valueOf())) throw new AppError(400, 'Provide a valid bestByDate.');
    const user = await User.findById(request.auth!.userId); const item = user?.pantryItems.id(String(request.params.itemId));
    if (!item) throw new AppError(404, 'Pantry item not found.');
    item.freshness = { source: 'user_confirmed', bestByDate: new Date(bestByDate), confidence: 1, confidenceLabel: 'high', evidence: ['User confirmed the package date.'] };
    await user!.save(); response.json({ pantryItem: item });
  } catch (error) { next(error); }
});
