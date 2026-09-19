import type { RecipeRecommendation } from '../models';

function emojiFrom(imageUrl: string) {
  return imageUrl.startsWith('emoji:') ? imageUrl.slice(6) : '🍽️';
}

export function RecipeCard({
  recommendation,
  saved,
  onOpen,
  onSave,
}: {
  recommendation: RecipeRecommendation;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  const recipe = recommendation.recipe;
  const minutes = recipe.prepMinutes + recipe.cookMinutes;
  const cost = ((recipe.estimatedCost.minimum + recipe.estimatedCost.maximum) / 2 / recipe.servings).toFixed(2);
  const soon = recommendation.useSoonItems[0];
  return (
    <article className="rf-card">
      <div className={`rf-card-image tone-${recipe.id.split('-')[0]}`}>
        <span aria-hidden="true">{emojiFrom(recipe.imageUrl)}</span>
        <button type="button" className={saved ? 'saved' : ''} aria-label={saved ? `Unsave ${recipe.title}` : `Save ${recipe.title}`} onClick={onSave}>{saved ? '♥' : '♡'}</button>
      </div>
      <div className="rf-card-body">
        <h3>{recipe.title}</h3>
        <p className="rf-meta">{minutes} min · {recipe.servings} servings · {recommendation.pantryMatchPercentage}% pantry</p>
        {soon ? <p className="rf-soon">Uses {soon.displayName} soon {soon.freshnessSource === 'estimated' ? '(estimated freshness)' : ''}</p> : null}
        <p className="rf-stats">{recipe.nutritionPerServing.calories} kcal · {recipe.nutritionPerServing.proteinGrams}g protein · ~${cost}/serving · {recipe.environmentalImpact.level} impact</p>
        <p className="rf-reason">{recommendation.scoreReasons[0]}</p>
        <button type="button" className="dark-button" onClick={onOpen}>View recipe</button>
      </div>
    </article>
  );
}
