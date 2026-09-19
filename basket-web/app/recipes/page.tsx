'use client';

import { FormEvent, useEffect, useState } from 'react';
import './recipes.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

type Recipe = {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  servings: number;
  summary: string;
  why: string;
  usesPantry: string[];
  missing: string[];
  ingredients: Array<{ item: string; amount: string; fromPantry: boolean }>;
  steps: string[];
};

type Payload = { source: string; model: string; pantryCount: number; recipes: Recipe[]; error?: string };

async function loadRecommendations(goal = '') {
  const query = goal.trim() ? `?goal=${encodeURIComponent(goal.trim())}` : '';
  const response = await fetch(`${apiUrl}/recipes/recommendations${query}`, { credentials: 'include' });
  const data = await response.json() as Payload;
  if (!response.ok) throw new Error(data.error ?? 'Unable to recommend recipes.');
  return data;
}

export default function RecipesPage() {
  const [goal, setGoal] = useState('');
  const [status, setStatus] = useState('Loading recipes from the API…');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [busy, setBusy] = useState(false);

  async function recommend(nextGoal = goal) {
    setBusy(true);
    setStatus('Loading recipes…');
    try {
      const data = await loadRecommendations(nextGoal);
      setPayload(data);
      setSelected(data.recipes[0] ?? null);
      const source = data.source === 'demo' ? 'demo catalog' : data.model;
      setStatus(data.pantryCount
        ? `Using ${data.pantryCount} pantry item${data.pantryCount === 1 ? '' : 's'} · ${source}`
        : `Demo recipes from the OpenBasket API · ${source}`);
    } catch (error) {
      setPayload(null);
      setStatus(error instanceof TypeError ? 'Cannot reach the API at localhost:4000. Start the backend, then refresh.' : (error instanceof Error ? error.message : 'Unable to recommend recipes.'));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void recommend(''); }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await recommend(goal);
  }

  return (
    <main className="recipes-page">
      <header>
        <a href="/" className="recipes-brand"><span>o</span>OpenBasket</a>
        <nav>
          <a href="/pantry">Pantry</a>
          <a href="/scanner">＋ Scan a receipt</a>
        </nav>
      </header>
      <section>
        <p>COOK WITH WHAT YOU HAVE</p>
        <h1>Recipes from your kitchen.</h1>
        <form className="recipe-ask" onSubmit={onSubmit}>
          <label>
            Optional goal
            <input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Use spinach tonight, high protein, 20 minutes…" />
          </label>
          <button disabled={busy}>{busy ? 'Loading…' : 'Refresh recipes'}</button>
        </form>
        <div className="recipes-status">{status}</div>
        {payload?.recipes?.length ? (
          <div className="recipe-results">
            {payload.recipes.map((recipe) => (
              <article key={recipe.id} className={selected?.id === recipe.id ? 'selected' : ''}>
                <button type="button" onClick={() => setSelected(recipe)}>
                  <span className="recipe-emoji">{recipe.emoji}</span>
                  <div>
                    <h2>{recipe.title}</h2>
                    <p>{recipe.minutes} min · {recipe.servings} serving{recipe.servings === 1 ? '' : 's'}</p>
                    <small>{recipe.why || recipe.summary}</small>
                  </div>
                </button>
              </article>
            ))}
          </div>
        ) : null}
        {selected ? (
          <aside className="recipe-detail">
            <p>HOW TO COOK</p>
            <h2>{selected.emoji} {selected.title}</h2>
            <p>{selected.summary}</p>
            <h3>Ingredients</h3>
            <ul>
              {selected.ingredients.map((ingredient) => (
                <li key={`${ingredient.item}-${ingredient.amount}`}>
                  <b>{ingredient.item}</b> · {ingredient.amount}
                  {ingredient.fromPantry ? <em> in pantry</em> : selected.missing.includes(ingredient.item) ? <em className="missing"> buy</em> : null}
                </li>
              ))}
            </ul>
            <h3>Steps</h3>
            <ol>{selected.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
