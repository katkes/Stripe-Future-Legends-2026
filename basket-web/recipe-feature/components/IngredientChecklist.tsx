import type { RecipeIngredient } from '../models';

export function IngredientChecklist({
  inPantry,
  missing,
  checked,
  onToggle,
}: {
  inPantry: { name: string; recipeAmount: string; pantryAmount: string }[];
  missing: RecipeIngredient[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rf-checklists">
      <section>
        <h3>In your pantry</h3>
        {inPantry.length === 0 ? <p>No required items matched yet.</p> : (
          <ul>
            {inPantry.map((item) => (
              <li key={item.name}>
                <label>
                  <input type="checkbox" checked={!!checked[item.name]} onChange={() => onToggle(item.name)} />
                  <span><strong>{item.name}</strong> · recipe {item.recipeAmount} · you have {item.pantryAmount}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3>Missing</h3>
        {missing.length === 0 ? <p>You have every required ingredient.</p> : (
          <ul>
            {missing.map((item) => (
              <li key={item.normalizedFoodId}>
                <label>
                  <input type="checkbox" checked={!!checked[item.normalizedFoodId]} onChange={() => onToggle(item.normalizedFoodId)} />
                  <span><strong>{item.displayName}</strong> · {item.quantity} {item.unit}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
