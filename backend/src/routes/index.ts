import { Router } from 'express';
import { createFeatureRouter } from '../shared/http/create-feature-router.js';
import { authRouter } from '../features/auth/auth.routes.js';
import { pantryRouter } from '../features/pantry/pantry.routes.js';
import { receiptRouter } from '../features/receipts/receipt.routes.js';

export const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/receipts', receiptRouter);
apiRouter.use('/pantry', pantryRouter);
apiRouter.use('/recipes', createFeatureRouter('recipes and meal planning'));
apiRouter.use('/grocery-lists', createFeatureRouter('smart grocery lists'));
apiRouter.use('/prices', createFeatureRouter('neighbourhood prices'));
apiRouter.use('/impact', createFeatureRouter('nutrition and environmental impact'));
apiRouter.use('/community', createFeatureRouter('community baskets and group orders'));
apiRouter.use('/vendors', createFeatureRouter('local farmers and vendors'));
apiRouter.use('/payments', createFeatureRouter('Stripe payments'));
