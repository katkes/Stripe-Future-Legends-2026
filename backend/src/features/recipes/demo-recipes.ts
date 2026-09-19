import type { PantrySnapshot, RecommendedRecipe } from './recipe-types.js';

export const demoRecipes: RecommendedRecipe[] = [
  {
    id: 'harissa-eggs-greens',
    title: 'Harissa eggs & greens',
    emoji: '🍳',
    minutes: 20,
    servings: 2,
    summary: 'A skillet breakfast that uses leafy greens before they wilt.',
    why: 'Demo recipe for spinach, eggs, and yogurt already in a typical pantry.',
    usesPantry: ['spinach', 'eggs', 'yogurt'],
    missing: ['harissa'],
    ingredients: [
      { item: 'baby spinach', amount: '3 cups', fromPantry: true },
      { item: 'eggs', amount: '4', fromPantry: true },
      { item: 'Greek yogurt', amount: '1/2 cup', fromPantry: true },
      { item: 'harissa', amount: '1 tbsp', fromPantry: false },
      { item: 'olive oil', amount: '1 tbsp', fromPantry: false },
    ],
    steps: [
      'Warm oil in a skillet and wilt the spinach with a pinch of salt.',
      'Make four wells, crack in the eggs, and spoon harissa around the whites.',
      'Cover until the whites set. Serve with a dollop of yogurt.',
    ],
  },
  {
    id: 'roasted-tomato-toast',
    title: 'Roasted tomato toast',
    emoji: '🍅',
    minutes: 15,
    servings: 2,
    summary: 'Jammy tomatoes on toasted bread for a fast lunch.',
    why: 'Demo recipe for tomatoes and leftover bread.',
    usesPantry: ['tomato', 'bread', 'sourdough'],
    missing: ['garlic'],
    ingredients: [
      { item: 'roma tomatoes', amount: '4, halved', fromPantry: true },
      { item: 'sourdough', amount: '2 thick slices', fromPantry: true },
      { item: 'garlic', amount: '1 clove', fromPantry: false },
      { item: 'olive oil', amount: '1 tbsp', fromPantry: false },
    ],
    steps: [
      'Roast or pan-blister the tomatoes with oil and salt until they collapse.',
      'Toast the bread and rub with garlic.',
      'Pile on the tomatoes and spoon over the pan juices.',
    ],
  },
  {
    id: 'herby-yogurt-bowl',
    title: 'Herby yogurt bowl',
    emoji: '🥣',
    minutes: 10,
    servings: 1,
    summary: 'A no-cook bowl when you need dinner in ten minutes.',
    why: 'Demo recipe for yogurt and whatever produce is on hand.',
    usesPantry: ['yogurt', 'spinach', 'tomato'],
    missing: ['cucumber'],
    ingredients: [
      { item: 'Greek yogurt', amount: '1 cup', fromPantry: true },
      { item: 'baby spinach', amount: '1 handful, chopped', fromPantry: true },
      { item: 'tomato', amount: '1, diced', fromPantry: true },
      { item: 'cucumber', amount: '1/2, diced', fromPantry: false },
      { item: 'olive oil', amount: '1 tsp', fromPantry: false },
    ],
    steps: [
      'Spoon yogurt into a bowl and loosen with a splash of water if needed.',
      'Fold in spinach and tomato. Top with cucumber and oil.',
    ],
  },
  {
    id: 'lemon-garlic-pasta',
    title: 'Lemon garlic pantry pasta',
    emoji: '🍝',
    minutes: 25,
    servings: 2,
    summary: 'Weeknight pasta with a bright sauce from staples.',
    why: 'Demo recipe when you have pasta and a little dairy.',
    usesPantry: ['pasta', 'yogurt', 'garlic'],
    missing: ['lemon', 'pasta'],
    ingredients: [
      { item: 'spaghetti', amount: '200 g', fromPantry: false },
      { item: 'Greek yogurt', amount: '1/3 cup', fromPantry: true },
      { item: 'garlic', amount: '2 cloves', fromPantry: false },
      { item: 'lemon', amount: '1', fromPantry: false },
      { item: 'olive oil', amount: '2 tbsp', fromPantry: false },
    ],
    steps: [
      'Boil pasta in salted water until al dente. Save a cup of pasta water.',
      'Warm oil and garlic, then take off the heat and stir in yogurt and lemon.',
      'Toss with pasta, loosening with pasta water until glossy.',
    ],
  },
  {
    id: 'sheet-pan-veg',
    title: 'Sheet-pan veg & chickpeas',
    emoji: '🥗',
    minutes: 30,
    servings: 2,
    summary: 'Roast whatever produce needs using, plus a can of chickpeas.',
    why: 'Demo recipe for mixed produce that should be eaten soon.',
    usesPantry: ['tomato', 'spinach', 'potato', 'onion'],
    missing: ['chickpeas'],
    ingredients: [
      { item: 'mixed vegetables', amount: '4 cups', fromPantry: true },
      { item: 'chickpeas', amount: '1 can, drained', fromPantry: false },
      { item: 'olive oil', amount: '2 tbsp', fromPantry: false },
      { item: 'smoked paprika', amount: '1 tsp', fromPantry: false },
    ],
    steps: [
      'Heat the oven to 220°C. Toss vegetables and chickpeas with oil, paprika, and salt.',
      'Roast 25 minutes, stirring once, until browned at the edges.',
      'Finish with a handful of raw spinach so it just wilts on the tray.',
    ],
  },
];

function haystack(value: string) {
  return value.toLowerCase();
}

export function recommendDemoRecipes(pantry: PantrySnapshot[], goal?: string): RecommendedRecipe[] {
  const pantryText = pantry.map((item) => haystack(item.name)).join(' ');
  const goalText = haystack(goal ?? '');
  const scored = demoRecipes.map((recipe) => {
    const uses = recipe.usesPantry.filter((token) => pantryText.includes(token));
    const goalHit = goalText && haystack(`${recipe.title} ${recipe.summary} ${recipe.why}`).includes(goalText.split(' ')[0] ?? '');
    return {
      recipe: {
        ...recipe,
        usesPantry: uses.length ? uses : recipe.usesPantry,
        ingredients: recipe.ingredients.map((ingredient) => ({
          ...ingredient,
          fromPantry: pantry.some((item) => {
            const pantryName = haystack(item.name);
            const ingredientName = haystack(ingredient.item);
            return ingredientName.includes(pantryName) || pantryName.includes(ingredientName);
          }),
        })),
        why: pantry.length
          ? (uses.length ? `Uses ${uses.join(', ')} from your pantry.` : 'Demo meal from the OpenBasket catalog.')
          : recipe.why,
      },
      score: uses.length * 3 + (goalHit ? 1 : 0) + (recipe.minutes <= 20 ? 0.5 : 0),
    };
  });
  return scored.sort((left, right) => right.score - left.score).slice(0, 3).map((row) => row.recipe);
}
