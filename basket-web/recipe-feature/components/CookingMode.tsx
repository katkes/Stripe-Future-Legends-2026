import type { Recipe } from '../models';
import { IngredientChecklist } from './IngredientChecklist';

export function CookingMode({
  recipe,
  stepIndex,
  servings,
  inPantry,
  missing,
  checked,
  onServings,
  onPrev,
  onNext,
  onToggle,
  onFinish,
  onCancel,
}: {
  recipe: Recipe;
  stepIndex: number;
  servings: number;
  inPantry: { name: string; recipeAmount: string; pantryAmount: string }[];
  missing: Recipe['ingredients'];
  checked: Record<string, boolean>;
  onServings: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggle: (id: string) => void;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const step = recipe.instructions[stepIndex];
  return (
    <article className="rf-cook">
      <button type="button" className="text-button" onClick={onCancel}>← Exit cooking mode</button>
      <p className="kicker">COOKING</p>
      <h2>{recipe.title}</h2>
      <label className="rf-servings">
        Servings prepared
        <input type="number" min={1} max={12} value={servings} onChange={(event) => onServings(Number(event.target.value) || 1)} />
      </label>
      <p className="rf-progress">Step {stepIndex + 1} of {recipe.instructions.length}</p>
      <p className="rf-step">{step.instruction}</p>
      <div className="rf-actions">
        <button type="button" className="outline-button" onClick={onPrev} disabled={stepIndex === 0}>Previous</button>
        {stepIndex < recipe.instructions.length - 1 ? (
          <button type="button" className="primary-button" onClick={onNext}>Next</button>
        ) : (
          <button type="button" className="primary-button" onClick={onFinish}>Finish cooking</button>
        )}
      </div>
      <IngredientChecklist inPantry={inPantry} missing={missing} checked={checked} onToggle={onToggle} />
    </article>
  );
}
