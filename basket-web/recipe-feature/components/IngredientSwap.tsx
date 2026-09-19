import type { RecipeRecommendation, SwapPreview } from '../models';

export function IngredientSwapCard({
  recommendation,
  preview,
  onPreview,
  onClear,
}: {
  recommendation: RecipeRecommendation;
  preview: SwapPreview | null;
  onPreview: (swapId: string) => void;
  onClear: () => void;
}) {
  const swap = recommendation.recipe.swaps[0];
  if (!swap) return <p className="rf-muted">No structured swap is available for this recipe.</p>;
  return (
    <section className="rf-swap">
      <h3>One meaningful swap</h3>
      <p>{swap.reason}</p>
      {!preview ? (
        <button type="button" className="outline-button" onClick={() => onPreview(swap.id)}>Preview {swap.toDisplayName} instead</button>
      ) : (
        <div>
          <p>Preview only — the original recipe is unchanged. Fibre {preview.nutritionPerServing.fibreGrams}g · impact {preview.environmentalImpact.level} · ${preview.estimatedCost.minimum.toFixed(2)}–${preview.estimatedCost.maximum.toFixed(2)} CAD.</p>
          <button type="button" className="text-button" onClick={onClear}>Back to original</button>
        </div>
      )}
    </section>
  );
}
