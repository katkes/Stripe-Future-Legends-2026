import { mockPreferences } from '../data/mock-preferences.js';
import type { PreferencesAdapter } from '../models.js';

export const memoryPreferencesAdapter: PreferencesAdapter = {
  async getPreferences(userId) {
    return { ...mockPreferences, userId };
  },
};
