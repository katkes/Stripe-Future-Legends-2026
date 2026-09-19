'use client';

import { FormEvent, useState } from 'react';
import './scanner.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
type User = { id: string; name: string; email: string };
type RecipeCard = { recipe: { id: string; title: string }; pantryMatchPercentage: number; scoreReasons: string[] };
type Result = {
  pantryItem: { name: string; category: string; freshness: { source: string; bestByDate?: string; estimatedStartDate?: string; estimatedEndDate?: string; confidence: number; confidenceLabel: string; evidence: string[] } };
  pantryItems?: string[];
  extractedText: string;
  recommendations?: { sections: { readyNow: RecipeCard[]; oneItemAway: RecipeCard[] } };
};

export default function ScannerPage() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (mode === 'login') delete payload.name;
    const response = await fetch(`${apiUrl}/auth/${mode === 'signup' ? 'signup' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    const data = await response.json() as { error?: string; user?: User };
    setBusy(false);
    if (!response.ok || !data.user) return setMessage(data.error ?? 'Unable to sign in.');
    setUser(data.user);
    setMessage(`Welcome, ${data.user.name}. Your pantry is ready.`);
  }

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/receipts/analyze`, { method: 'POST', body: form, credentials: 'include' });
    const data = await response.json() as Result & { error?: string };
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? 'We could not analyze this image.');
    setResult(data);
    setMessage('Saved to your pantry. Recipe matches below use this OCR.space scan.');
  }

  const freshness = result?.pantryItem.freshness;
  const ready = result?.recommendations?.sections.readyNow ?? [];
  const almost = result?.recommendations?.sections.oneItemAway ?? [];

  return (
    <main className="scanner-page">
      <header className="scanner-header">
        <a href="/" className="scanner-brand"><span>o</span>OpenBasket</a>
        <a href="/recipes">Recipes</a>
      </header>
      <section className="scanner-layout">
        <div className="scanner-intro">
          <p>SMART FRESHNESS</p>
          <h1>Know what to use first.</h1>
          <div>Upload a receipt or an ingredient label. OCR.space reads the ticket, we save pantry items, then the same OpenBasket recipe engine ranks what you can cook.</div>
          <aside><span>1. Upload</span><span>2. OCR.space</span><span>3. Recommend recipes</span></aside>
        </div>
        <section className="scanner-card">
          {!user ? (
            <>
              <div className="scanner-tabs">
                <button className={mode === 'signup' ? 'selected' : ''} onClick={() => setMode('signup')}>Create account</button>
                <button className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')}>Sign in</button>
              </div>
              <form onSubmit={authenticate}>
                {mode === 'signup' && <label>Name<input name="name" placeholder="Alex Morgan" required /></label>}
                <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
                <label>Password<input name="password" type="password" minLength={8} placeholder="At least 8 characters" required /></label>
                <button disabled={busy}>{busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
              </form>
            </>
          ) : (
            <>
              <div className="signed-in">
                <b>{user.name.slice(0, 2).toUpperCase()}</b>
                <div><strong>{user.name}</strong><small>Signed in securely</small></div>
              </div>
              <form onSubmit={analyze} encType="multipart/form-data">
                <label>What is in the photo?<input name="itemName" placeholder="e.g. Baby spinach" required /></label>
                <label>Where will you store it?<select name="storageMethod" defaultValue="refrigerated"><option value="refrigerated">Refrigerator</option><option value="frozen">Freezer</option><option value="pantry">Pantry</option></select></label>
                <label className="file-input">Choose receipt or label image<input name="image" type="file" accept="image/png,image/jpeg,image/webp" required /><small>PNG, JPEG, or WebP · up to 1 MB · OCR.space</small></label>
                <button disabled={busy}>{busy ? 'Analyzing image…' : 'Analyze, save, recommend'}</button>
              </form>
            </>
          )}
          {message && <p className="form-message">{message}</p>}
          {freshness && (
            <div className="freshness-result">
              <p>PANTRY UPDATED WITH OCR.SPACE</p>
              <h2>{result!.pantryItems?.join(', ') ?? result!.pantryItem.name}</h2>
              {freshness.source === 'label' ? (
                <><strong>Best by {new Date(freshness.bestByDate!).toLocaleDateString()}</strong><span>Read directly from the package label.</span></>
              ) : (
                <><strong>Use between {new Date(freshness.estimatedStartDate!).toLocaleDateString()} and {new Date(freshness.estimatedEndDate!).toLocaleDateString()}</strong><span>This is an estimate based on category and storage.</span></>
              )}
              <em className={freshness.confidenceLabel}>{Math.round(freshness.confidence * 100)}% confidence · {freshness.confidenceLabel}</em>
              <small>{freshness.evidence[0]}</small>
              {(ready.length > 0 || almost.length > 0) && (
                <div className="recipe-recs">
                  <p>WHAT YOU CAN MAKE</p>
                  {ready.slice(0, 3).map((item) => (
                    <a key={item.recipe.id} href="/recipes">{item.recipe.title} · {item.pantryMatchPercentage}% pantry</a>
                  ))}
                  {almost.slice(0, 2).map((item) => (
                    <a key={item.recipe.id} href="/recipes">{item.recipe.title} · one item away</a>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
