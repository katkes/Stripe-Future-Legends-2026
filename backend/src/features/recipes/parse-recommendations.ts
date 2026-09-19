import { AppError } from '../../core/errors/app-error.js';
import type { RecommendedRecipe } from './recipe-types.js';

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asString(entry)).filter(Boolean);
}

function slugId(title: string, index: number) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return `${slug || 'recipe'}-${index + 1}`;
}

export function parseRecommendationJson(raw: string): RecommendedRecipe[] {
  const stripped = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  let parsed: unknown;
  try { parsed = JSON.parse(stripped) as unknown; }
  catch { throw new AppError(502, 'Recipe AI returned text that was not valid JSON.'); }

  const recipes = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { recipes?: unknown }).recipes)
      ? (parsed as { recipes: unknown[] }).recipes
      : [];

  if (!recipes.length) throw new AppError(502, 'Recipe AI did not return any recipes.');

  return recipes.slice(0, 6).map((entry, index) => {
    const recipe = (entry && typeof entry === 'object') ? entry as Record<string, unknown> : {};
    const title = asString(recipe.title, `Recipe ${index + 1}`);
    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((item) => {
        const row = (item && typeof item === 'object') ? item as Record<string, unknown> : {};
        return {
          item: asString(row.item || row.name, 'ingredient'),
          amount: asString(row.amount, 'to taste'),
          fromPantry: Boolean(row.fromPantry),
        };
      })
      : [];
    const steps = asStringList(recipe.steps);
    return {
      id: slugId(title, index),
      title,
      emoji: asString(recipe.emoji, '🍳'),
      minutes: Math.max(5, Math.round(asNumber(recipe.minutes, 20))),
      servings: Math.max(1, Math.round(asNumber(recipe.servings, 2))),
      summary: asString(recipe.summary),
      why: asString(recipe.why),
      usesPantry: asStringList(recipe.usesPantry),
      missing: asStringList(recipe.missing),
      ingredients,
      steps: steps.length ? steps : ['Follow the ingredient list and cook until done.'],
    };
  });
}
