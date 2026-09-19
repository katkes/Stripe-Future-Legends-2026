import { randomUUID } from 'node:crypto';
import { AppError } from '../../../core/errors/app-error.js';
import type { PantryAdapter, PantryStatus, PantryUsage } from '../models.js';
import { convertQuantity } from '../services/unit-conversion.js';
import { getTransaction, pantryFor, saveTransaction } from '../stores/memory-store.js';

export const memoryPantryAdapter: PantryAdapter = {
  async getAvailableItems(userId) {
    return pantryFor(userId).filter((item) => item.status === 'available' && item.quantity > 0);
  },

  async consumeItems(userId, usage, recipeId) {
    const pantry = pantryFor(userId);
    const changes: { pantryItemId: string; previousQuantity: number; newQuantity: number; previousStatus: PantryStatus }[] = [];

    for (const entry of usage) {
      const item = pantry.find((candidate) => candidate.id === entry.pantryItemId && candidate.userId === userId);
      if (!item) throw new AppError(400, `Unknown pantry item ${entry.pantryItemId}`);
      const converted = convertQuantity(item.normalizedFoodId, entry.quantityUsed, entry.unit, item.unit);
      const used = converted ?? entry.quantityUsed;
      if (used > item.quantity + 1e-9) {
        throw new AppError(409, `Pantry estimate for ${item.displayName} is insufficient. Confirm the actual quantity used.`);
      }
      const previousQuantity = item.quantity;
      const previousStatus = item.status;
      item.quantity = Math.max(0, Number((item.quantity - used).toFixed(3)));
      if (item.quantity === 0) item.status = 'finished';
      changes.push({ pantryItemId: item.id, previousQuantity, newQuantity: item.quantity, previousStatus });
    }

    const transaction = {
      id: randomUUID(),
      userId,
      type: 'recipe-consumption' as const,
      recipeId,
      createdAt: new Date().toISOString(),
      changes,
    };
    saveTransaction(transaction);
    return transaction;
  },

  async undoConsumption(userId, transactionId) {
    const transaction = getTransaction(transactionId);
    if (!transaction || transaction.userId !== userId) throw new AppError(404, 'Undo token was not found');
    if (transaction.reversedAt) throw new AppError(409, 'This pantry update was already undone');
    const pantry = pantryFor(userId);
    for (const change of transaction.changes) {
      const item = pantry.find((candidate) => candidate.id === change.pantryItemId);
      if (!item) continue;
      item.quantity = change.previousQuantity;
      item.status = change.previousStatus;
    }
    transaction.reversedAt = new Date().toISOString();
  },
};

export async function previewConsumption(userId: string, usage: PantryUsage[]) {
  const pantry = await memoryPantryAdapter.getAvailableItems(userId);
  return usage.map((entry) => {
    const item = pantry.find((candidate) => candidate.id === entry.pantryItemId);
    if (!item) return { ...entry, sufficient: false as const, available: 0 };
    const converted = convertQuantity(item.normalizedFoodId, entry.quantityUsed, entry.unit, item.unit);
    const used = converted ?? entry.quantityUsed;
    return { ...entry, sufficient: used <= item.quantity + 1e-9, available: item.quantity, unit: item.unit, displayName: item.displayName };
  });
}
