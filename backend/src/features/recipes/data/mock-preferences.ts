import type { UserFoodPreferences } from '../models.js';
import { DEMO_USER_ID } from './mock-pantry.js';

export const mockPreferences: UserFoodPreferences = {
  userId: DEMO_USER_ID,
  allergens: [],
  dislikedFoodIds: [],
  dietTags: [],
};
