'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { recipeApi } from '../../recipe-feature/services/recipe-api';

export default function GroceryRoute() {
  const [items, setItems] = useState<{ displayName: string; quantity: number; unit: string }[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    recipeApi.groceryItems()
      .then((payload) => setItems(payload.items))
      .catch((caught: Error) => setError(caught.message));
  }, []);

  return (
    <AppShell>
      <div className="page-content">
        <p className="kicker">GROCERY LIST</p>
        <h1>From recipes</h1>
        <p className="subhead">Items added from a recipe stay unique per ingredient so repeat clicks do not duplicate them.</p>
        {error ? <p>{error}</p> : null}
        {items.length === 0 ? <p>Nothing added yet. Open a one-item-away recipe and use Add missing ingredients.</p> : (
          <ul className="rf-checklists">
            {items.map((item) => <li key={`${item.displayName}-${item.unit}`}><strong>{item.displayName}</strong> · {item.quantity} {item.unit}</li>)}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
