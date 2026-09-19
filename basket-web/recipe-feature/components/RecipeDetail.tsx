import type { RecipeRecommendation } from '../models';
import { ImpactSummary } from './ImpactSummary';
import { IngredientChecklist } from './IngredientChecklist';
import { IngredientSwapCard } from './IngredientSwap';

export function RecipeDetail({
  recommendation,
  groceryAdded,
  checked,
  swapPreview,
  onBack,
  onToggleCheck,
  onAddMissing,
  onPreviewSwap,
  onClearSwap,
  onStartCooking,
}: {
  recommendation: RecipeRecommendation;
  groceryAdded: boolean;
  checked: Record<string, boolean>;
  swapPreview: Parameters<typeof IngredientSwapCard>[0]['preview'];
  onBack: () => void;
  onToggleCheck: (id: string) => void;
  onAddMissing: () => void;
  onPreviewSwap: (swapId: string) => void;
  onClearSwap: () => void;
  onStartCooking: () => void;
}) {
  const recipe = recommendation.recipe;
  const nutrition = swapPreview?.nutritionPerServing ?? recipe.nutritionPerServing;
  const cost = swapPreview?.estimatedCost ?? recipe.estimatedCost;
  const impact = swapPreview?.environmentalImpact ?? recipe.environmentalImpact;
  const inPantry = recommendation.matchedIngredients.map((entry) => ({
    name: entry.ingredient.displayName,
    recipeAmount: `${entry.ingredient.quantity} ${entry.ingredient.unit}`,
    pantryAmount: entry.pantryQuantityLabel,
  }));

  return (
    <article className="rf-detail">
      <button type="button" className="text-button" onClick={onBack}>← All recipes</button>
      <p className="kicker">{recommendation.category.replaceAll('-', ' ')}</p>
      <h2>{recipe.title}</h2>
      <p className="subhead">{recipe.description}</p>
      <p className="rf-reason">{recommendation.scoreReasons[0]}</p>
      <p className="rf-meta">{recipe.prepMinutes + recipe.cookMinutes} min · {recipe.servings} servings · {recipe.difficulty} · {recommendation.pantryMatchPercentage}% pantry match</p>

      <IngredientChecklist inPantry={inPantry} missing={recommendation.missingIngredients} checked={checked} onToggle={onToggleCheck} />

      <section>
        <h3>Instructions</h3>
        <ol className="rf-steps">
          {recipe.instructions.map((step) => <li key={step.order}>{step.instruction}</li>)}
        </ol>
      </section>

      <ImpactSummary nutrition={nutrition} cost={cost} impact={impact} servings={recipe.servings} />
      <IngredientSwapCard recommendation={recommendation} preview={swapPreview} onPreview={onPreviewSwap} onClear={onClearSwap} />

      <div className="rf-actions">
        <button type="button" className="outline-button" onClick={onAddMissing} disabled={recommendation.missingIngredients.length === 0}>
          {recommendation.missingIngredients.length === 0 ? 'Nothing missing' : groceryAdded ? 'Added ✓' : 'Add missing ingredients'}
        </button>
        <button type="button" className="primary-button" onClick={onStartCooking}>Start cooking</button>
      </div>
    </article>
  );
}
