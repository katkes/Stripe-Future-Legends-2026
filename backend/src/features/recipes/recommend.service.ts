import { env } from '../../config/env.js';
import { completeJson } from '../../shared/ai/chat-completions.js';
import { parseRecommendationJson } from './parse-recommendations.js';
import type { PantrySnapshot, RecommendationPayload } from './recipe-types.js';

const SYSTEM_PROMPT = `You are OpenBasket's recipe cook. Recommend practical home-cooked meals.
Return JSON only: {"recipes":[{ "title": string, "emoji": string, "minutes": number, "servings": number, "summary": string, "why": string, "usesPantry": string[], "missing": string[], "ingredients":[{"item":string,"amount":string,"fromPantry":boolean}], "steps": string[] }]}.
Give 3 recipes. Prefer using pantry items that expire soon. Keep missing ingredients to staples. Do not invent branded products.`;

export function buildUserPrompt(pantry: PantrySnapshot[], goal?: string) {
  const pantryLines = pantry.length
    ? pantry.map((item) => {
      const date = item.bestByDate || item.estimatedEndDate;
      const when = date ? `, use by ${date}` : '';
      return `- ${item.name} (${item.category}, ${item.storageMethod}${when})`;
    }).join('\n')
    : '- (no saved pantry items; suggest flexible meals from common kitchen staples)';
  const goalLine = goal?.trim() ? `\nCooking goal: ${goal.trim()}` : '';
  return `Pantry:\n${pantryLines}${goalLine}\nRecommend 3 recipes that cook tonight with this food.`;
}

export async function recommendWithAi(pantry: PantrySnapshot[], goal?: string): Promise<RecommendationPayload> {
  const content = await completeJson([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(pantry, goal) },
  ]);
  return {
    source: 'ai',
    model: env.openaiModel,
    pantryCount: pantry.length,
    recipes: parseRecommendationJson(content),
  };
}
