import { Router } from 'express';
import { createFeatureRouter } from '../shared/http/create-feature-router.js';

export const apiRouter = Router();
apiRouter.use('/auth', createFeatureRouter('authentication'));
apiRouter.use('/receipts', createFeatureRouter('receipt scanning'));
apiRouter.use('/pantry', createFeatureRouter('digital pantry'));
apiRouter.use('/recipes', createFeatureRouter('recipes and meal planning'));
apiRouter.use('/grocery-lists', createFeatureRouter('smart grocery lists'));
apiRouter.use('/prices', createFeatureRouter('neighbourhood prices'));
apiRouter.use('/impact', createFeatureRouter('nutrition and environmental impact'));
apiRouter.use('/community', createFeatureRouter('community baskets and group orders'));
apiRouter.use('/vendors', createFeatureRouter('local farmers and vendors'));
apiRouter.use('/payments', createFeatureRouter('Stripe payments'));
