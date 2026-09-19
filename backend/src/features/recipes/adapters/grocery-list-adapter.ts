import type { GroceryListAdapter } from '../models.js';
import { addGroceryItem, groceryFor } from '../stores/memory-store.js';

export const memoryGroceryAdapter: GroceryListAdapter = {
  async addItems(userId, items, sourceRecipeId) {
    for (const item of items) {
      addGroceryItem(userId, {
        normalizedFoodId: item.normalizedFoodId,
        displayName: item.displayName,
        quantity: item.quantity,
        unit: item.unit,
        sourceRecipeId,
      });
    }
  },

  async hasItem(userId, normalizedFoodId) {
    return groceryFor(userId).some((item) => item.normalizedFoodId === normalizedFoodId);
  },

  async listItems(userId) {
    return groceryFor(userId);
  },
};
