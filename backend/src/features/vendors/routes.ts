import { Router } from 'express';
import { optionalAuth, requireAuth, requireRole } from '../../middleware/require-auth.js';
import {
  deleteProduct,
  getMine,
  getPublicVendor,
  listPublicVendors,
  patchProduct,
  postProduct,
  putMine,
} from './controllers/vendor-controller.js';

export const vendorRouter = Router();
vendorRouter.get('/', optionalAuth, (request, response, next) => {
  void listPublicVendors(request, response).catch(next);
});
vendorRouter.get('/me', requireAuth, requireRole('vendor'), (request, response, next) => {
  void getMine(request, response).catch(next);
});
vendorRouter.post('/me', requireAuth, requireRole('vendor'), (request, response, next) => {
  void putMine(request, response).catch(next);
});
vendorRouter.put('/me', requireAuth, requireRole('vendor'), (request, response, next) => {
  void putMine(request, response).catch(next);
});
vendorRouter.post('/me/products', requireAuth, requireRole('vendor'), (request, response, next) => {
  void postProduct(request, response).catch(next);
});
vendorRouter.patch('/me/products/:id', requireAuth, requireRole('vendor'), (request, response, next) => {
  void patchProduct(request, response).catch(next);
});
vendorRouter.delete('/me/products/:id', requireAuth, requireRole('vendor'), (request, response, next) => {
  void deleteProduct(request, response).catch(next);
});
vendorRouter.get('/:id', optionalAuth, (request, response, next) => {
  void getPublicVendor(request, response).catch(next);
});
