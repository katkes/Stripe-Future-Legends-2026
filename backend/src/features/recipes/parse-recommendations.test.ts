import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRecommendationJson } from './parse-recommendations.js';
import { buildUserPrompt } from './recommend.service.js';

test('parseRecommendationJson reads an OpenAI JSON object of recipes', () => {
  const recipes = parseRecommendationJson(JSON.stringify({
    recipes: [{
      title: 'Spinach eggs',
      emoji: '🍳',
      minutes: 15,
      servings: 2,
      summary: 'Fast skillet breakfast.',
      why: 'Uses spinach that expires soon.',
      usesPantry: ['spinach', 'eggs'],
      missing: ['chili flakes'],
      ingredients: [{ item: 'spinach', amount: '2 cups', fromPantry: true }],
      steps: ['Wilt spinach', 'Add eggs'],
    }],
  }));
  assert.equal(recipes[0]?.id, 'spinach-eggs-1');
  assert.equal(recipes[0]?.title, 'Spinach eggs');
  assert.equal(recipes[0]?.ingredients[0]?.fromPantry, true);
});

test('parseRecommendationJson rejects empty AI payloads', () => {
  assert.throws(() => parseRecommendationJson('{"recipes":[]}'), /did not return any recipes/);
});

test('buildUserPrompt includes pantry names and an optional cooking goal', () => {
  const prompt = buildUserPrompt([{
    name: 'Baby spinach',
    category: 'leafy greens',
    storageMethod: 'refrigerated',
    bestByDate: '2026-09-21',
  }], 'high protein');
  assert.match(prompt, /Baby spinach/);
  assert.match(prompt, /2026-09-21/);
  assert.match(prompt, /high protein/);
});
