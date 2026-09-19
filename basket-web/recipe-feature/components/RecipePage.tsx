'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GoalMode, RecipeRecommendation, RecommendationResponse, SwapPreview } from '../models';
import { recipeApi } from '../services/recipe-api';
import { CookingMode } from './CookingMode';
import { GoalSelector, RecipeFilters, RecipeSearch } from './RecipeFilters';
import { RecipeDetail } from './RecipeDetail';
import { RecipeSection } from './RecipeSection';
import { UseSoonBanner } from './UseSoonBanner';

type View = 'list' | 'detail' | 'cook';

export function RecipePage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [goal, setGoal] = useState<GoalMode>('quick');
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [detail, setDetail] = useState<RecipeRecommendation | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [view, setView] = useState<View>('list');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [groceryAdded, setGroceryAdded] = useState<Record<string, boolean>>({});
  const [swapPreview, setSwapPreview] = useState<SwapPreview | null>(null);
  const [sessionId, setSessionId] = useState<string>();
  const [cookStep, setCookStep] = useState(0);
  const [servings, setServings] = useState(2);
  const [undoToken, setUndoToken] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setData(await recipeApi.recommendations({ search, filters, goal }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load recipes');
    } finally {
      setLoading(false);
    }
  }, [search, filters, goal]);

  useEffect(() => { void load(); }, [load]);

  const toggleFilter = (id: string) => setFilters((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  async function openRecipe(id: string) {
    const recommendation = await recipeApi.detail(id, goal);
    setSelectedId(id);
    setDetail(recommendation);
    setSwapPreview(null);
    setView('detail');
    setChecked({});
  }

  async function addMissing() {
    if (!detail || detail.missingIngredients.length === 0) return;
    await recipeApi.addGroceryItems(detail.recipe.id, detail.missingIngredients);
    setGroceryAdded((current) => ({ ...current, [detail.recipe.id]: true }));
    setNotice('Missing ingredients were added to your grocery list. Repeat clicks do not duplicate them.');
  }

  async function previewSwap(swapId: string) {
    if (!detail) return;
    setSwapPreview(await recipeApi.previewSwap(detail.recipe.id, swapId));
  }

  async function startCooking() {
    if (!detail) return;
    const session = await recipeApi.startCooking(detail.recipe.id);
    setSessionId(session.id);
    setCookStep(0);
    setServings(detail.recipe.servings);
    setView('cook');
  }

  async function finishCooking() {
    if (!detail || !sessionId) return;
    try {
      const result = await recipeApi.completeCooking(sessionId, detail.recipe.id, servings);
      setUndoToken(result.undoToken);
      setNotice('Pantry quantities were reduced from this cook. You can undo.');
      setView('list');
      await load();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not update pantry';
      if (message.includes('insufficient')) {
        const confirmed = window.confirm(`${message}\n\nUse the remaining pantry amount anyway?`);
        if (!confirmed || !detail) return;
        const usage = detail.matchedIngredients.map((entry) => ({
          pantryItemId: entry.pantryItem.id,
          quantityUsed: entry.pantryItem.quantity,
          unit: entry.pantryItem.unit,
        }));
        const result = await recipeApi.completeCooking(sessionId, detail.recipe.id, servings, usage);
        setUndoToken(result.undoToken);
        setNotice('Pantry updated with the quantity you confirmed.');
        setView('list');
        await load();
        return;
      }
      setError(message);
    }
  }

  async function undo() {
    if (!undoToken) return;
    await recipeApi.undo(undoToken);
    setUndoToken(undefined);
    setNotice('Pantry update undone.');
    await load();
  }

  const inPantry = useMemo(() => detail?.matchedIngredients.map((entry) => ({
    name: entry.ingredient.displayName,
    recipeAmount: `${entry.ingredient.quantity} ${entry.ingredient.unit}`,
    pantryAmount: entry.pantryQuantityLabel,
  })) ?? [], [detail]);

  return (
    <div className="page-content rf-page">
      {view === 'list' ? (
        <>
          <section className="intro">
            <div>
              <p className="kicker">RECIPES</p>
              <h1>What can I make?</h1>
              <p className="subhead">Ranked from your digital pantry. Freshness dates are estimates unless a label was scanned.</p>
            </div>
          </section>
          <RecipeSearch value={search} onChange={setSearch} />
          <RecipeFilters active={filters} onToggle={toggleFilter} />
          <div className="rf-goal-row">
            <p className="kicker">Rank for</p>
            <GoalSelector value={goal} onChange={setGoal} />
          </div>
          {data ? <UseSoonBanner items={data.useSoonItems} /> : null}
          {loading ? <p>Loading recommendations…</p> : null}
          {error ? <p className="rf-error">{error} <button type="button" className="text-button" onClick={() => void load()}>Retry</button></p> : null}
          {data ? (
            <>
              <RecipeSection title="Cook with what you have" kicker="READY NOW" items={data.sections.readyNow} savedRecipeIds={savedRecipeIds} onOpen={(id) => void openRecipe(id)} onSave={(id) => setSavedRecipeIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />
              <RecipeSection title="One item away" kicker="ALMOST READY" items={data.sections.oneItemAway} savedRecipeIds={savedRecipeIds} onOpen={(id) => void openRecipe(id)} onSave={(id) => setSavedRecipeIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />
              <RecipeSection title="Best for your goals" kicker="RECOMMENDED" items={data.sections.recommendedForGoal} savedRecipeIds={savedRecipeIds} onOpen={(id) => void openRecipe(id)} onSave={(id) => setSavedRecipeIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />
            </>
          ) : null}
        </>
      ) : null}

      {view === 'detail' && detail ? (
        <RecipeDetail
          recommendation={detail}
          groceryAdded={!!groceryAdded[detail.recipe.id]}
          checked={checked}
          swapPreview={swapPreview}
          onBack={() => { setView('list'); setSelectedId(undefined); }}
          onToggleCheck={(id) => setChecked((current) => ({ ...current, [id]: !current[id] }))}
          onAddMissing={() => void addMissing()}
          onPreviewSwap={(swapId) => void previewSwap(swapId)}
          onClearSwap={() => setSwapPreview(null)}
          onStartCooking={() => void startCooking()}
        />
      ) : null}

      {view === 'cook' && detail ? (
        <CookingMode
          recipe={detail.recipe}
          stepIndex={cookStep}
          servings={servings}
          inPantry={inPantry}
          missing={detail.missingIngredients}
          checked={checked}
          onServings={setServings}
          onPrev={() => setCookStep((step) => Math.max(0, step - 1))}
          onNext={() => setCookStep((step) => Math.min(detail.recipe.instructions.length - 1, step + 1))}
          onToggle={(id) => setChecked((current) => ({ ...current, [id]: !current[id] }))}
          onFinish={() => void finishCooking()}
          onCancel={() => setView('detail')}
        />
      ) : null}

      {notice ? (
        <div className="rf-toast" role="status">
          <span>{notice}</span>
          {undoToken ? <button type="button" className="primary-button" onClick={() => void undo()}>Undo</button> : <button type="button" className="text-button" onClick={() => setNotice(undefined)}>Dismiss</button>}
        </div>
      ) : null}
      <span className="visually-hidden">{selectedId}</span>
    </div>
  );
}
