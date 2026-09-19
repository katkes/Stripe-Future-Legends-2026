import { randomUUID } from 'node:crypto';
import { createMockPantry } from '../data/mock-pantry.js';
import type { CookingSession, PantryItem, PantryTransaction } from '../models.js';

export type GroceryEntry = {
  id: string;
  userId: string;
  normalizedFoodId: string;
  displayName: string;
  quantity: number;
  unit: string;
  sourceRecipeId: string;
};

const pantryByUser = new Map<string, PantryItem[]>();
const groceryByUser = new Map<string, GroceryEntry[]>();
const transactions: PantryTransaction[] = [];
const cookingSessions = new Map<string, CookingSession>();
const recentlyCooked = new Map<string, string[]>();

export function pantryFor(userId: string) {
  if (!pantryByUser.has(userId)) pantryByUser.set(userId, createMockPantry().map((item) => ({ ...item, userId })));
  return pantryByUser.get(userId)!;
}

export function replacePantry(userId: string, items: PantryItem[]) {
  pantryByUser.set(userId, items);
}

export function groceryFor(userId: string) {
  if (!groceryByUser.has(userId)) groceryByUser.set(userId, []);
  return groceryByUser.get(userId)!;
}

export function addGroceryItem(userId: string, item: Omit<GroceryEntry, 'id' | 'userId'>) {
  const list = groceryFor(userId);
  const existing = list.find((entry) => entry.normalizedFoodId === item.normalizedFoodId && entry.sourceRecipeId === item.sourceRecipeId);
  if (existing) return existing;
  const created = { ...item, id: randomUUID(), userId };
  list.push(created);
  return created;
}

export function saveTransaction(transaction: PantryTransaction) {
  transactions.push(transaction);
}

export function getTransaction(id: string) {
  return transactions.find((item) => item.id === id);
}

export function saveCookingSession(session: CookingSession) {
  cookingSessions.set(session.id, session);
}

export function getCookingSession(id: string) {
  return cookingSessions.get(id);
}

export function markCooked(userId: string, recipeId: string) {
  const ids = recentlyCooked.get(userId) ?? [];
  recentlyCooked.set(userId, [recipeId, ...ids.filter((id) => id !== recipeId)].slice(0, 8));
}

export function recentRecipeIds(userId: string) {
  return recentlyCooked.get(userId) ?? [];
}

export function resetRecipeStores() {
  pantryByUser.clear();
  groceryByUser.clear();
  transactions.splice(0, transactions.length);
  cookingSessions.clear();
  recentlyCooked.clear();
}
