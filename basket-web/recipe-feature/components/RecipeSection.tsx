import type { RecipeRecommendation } from '../models';
import { RecipeCard } from './RecipeCard';

export function RecipeSection({
  title,
  kicker,
  items,
  savedRecipeIds,
  onOpen,
  onSave,
}: {
  title: string;
  kicker: string;
  items: RecipeRecommendation[];
  savedRecipeIds: string[];
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}) {
  return (
    <section className="rf-section">
      <div className="section-head">
        <div>
          <p className="kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {items.length === 0 ? <p className="rf-empty">Nothing in this group for the current filters.</p> : (
        <div className="rf-grid">
          {items.map((item) => (
            <RecipeCard
              key={item.recipe.id}
              recommendation={item}
              saved={savedRecipeIds.includes(item.recipe.id)}
              onOpen={() => onOpen(item.recipe.id)}
              onSave={() => onSave(item.recipe.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
