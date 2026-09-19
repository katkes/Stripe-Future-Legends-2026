# Recipes

`GET /api/v1/recipes/recommendations` always returns three meals so the demo works without an AI key.

- Default: ranked dummy catalog (`source: "demo"`).
- If `OPENAI_API_KEY` is set, the same endpoint tries Chat Completions and falls back to the catalog if the model call fails.
- Signed-in pantry items are used when Mongo is connected; guests still get the demo catalog.
