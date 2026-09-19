import type { Request, Response } from 'express';
import { AppError } from '../../../core/errors/app-error.js';
import {
  archiveProduct,
  createProduct,
  getMyVendor,
  getVendorStore,
  listVendors,
  updateProduct,
  upsertMyVendor,
} from '../services/vendor-service.js';

export async function listPublicVendors(_request: Request, response: Response) {
  response.json({ vendors: await listVendors() });
}

export async function getPublicVendor(request: Request, response: Response) {
  response.json(await getVendorStore(String(request.params.id)));
}

export async function getMine(request: Request, response: Response) {
  const profile = await getMyVendor(request.user!);
  if (!profile) throw new AppError(404, 'No farm profile yet.');
  response.json(profile);
}

export async function putMine(request: Request, response: Response) {
  response.json(await upsertMyVendor(request.user!, request.body ?? {}));
}

export async function postProduct(request: Request, response: Response) {
  response.status(201).json({ product: await createProduct(request.user!, request.body ?? {}) });
}

export async function patchProduct(request: Request, response: Response) {
  response.json({ product: await updateProduct(request.user!, String(request.params.id), request.body ?? {}) });
}

export async function deleteProduct(request: Request, response: Response) {
  response.json({ product: await archiveProduct(request.user!, String(request.params.id)) });
}
