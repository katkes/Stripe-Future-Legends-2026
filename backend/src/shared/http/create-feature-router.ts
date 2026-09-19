import { Router } from 'express';

/** Temporary router until a feature owner adds real controllers and services. */
export function createFeatureRouter(feature: string) {
  const router = Router();
  router.all('/*splat', (_request, response) => response.status(501).json({ feature, status: 'scaffolded', message: `The ${feature} API is reserved for its feature team.` }));
  return router;
}
