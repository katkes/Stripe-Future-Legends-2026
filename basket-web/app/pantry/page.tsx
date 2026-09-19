'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

type PantryRow = {
  _id?: string;
  name: string;
  freshness: { source: string; bestByDate?: string; estimatedEndDate?: string; confidenceLabel: string };
};

export default function PantryRoute() {
  const [items, setItems] = useState<PantryRow[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API}/pantry`, { credentials: 'include' })
      .then(async (response) => {
        const payload = await response.json() as { error?: string; pantryItems?: PantryRow[] };
        if (!response.ok) throw new Error(payload.error ?? 'Sign in on /scanner to load your pantry.');
        setItems(payload.pantryItems ?? []);
      })
      .catch((caught: Error) => setError(caught.message));
  }, []);

  return (
    <AppShell>
      <div className="page-content">
        <p className="kicker">PANTRY</p>
        <h1>My pantry</h1>
        <p className="subhead">This is the same OpenBasket pantry the scanner writes to via OCR.space. Recipes rank against these items when you are signed in.</p>
        {error ? <p>{error} <a href="/scanner">Open scanner</a></p> : null}
        {items.length === 0 && !error ? <p>No items yet. Scan a receipt or label, then reopen Recipes.</p> : (
          <ul className="rf-checklists">
            {items.map((item) => (
              <li key={item._id ?? item.name}>
                <strong>{item.name}</strong>
                <span> · {item.freshness.source === 'label' ? 'printed date' : 'estimated freshness'} · {item.freshness.confidenceLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
