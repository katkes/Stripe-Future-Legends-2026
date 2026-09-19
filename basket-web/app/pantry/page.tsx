'use client';

import { useEffect, useState } from 'react';
import './pantry.css';
import './urgency.css';
import './delete.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
type PantryItem = { _id: string; name: string; category: string; storageMethod: string; purchasedAt: string; freshness: { source: string; bestByDate?: string; estimatedStartDate?: string; estimatedEndDate?: string; confidence: number; confidenceLabel: 'high' | 'medium' | 'low'; evidence: string[] } };

function freshnessDate(item: PantryItem) { return item.freshness.bestByDate ?? item.freshness.estimatedEndDate; }
function dateText(item: PantryItem) { const date = freshnessDate(item); return item.freshness.bestByDate ? `Best by ${new Date(date!).toLocaleDateString()}` : `Use by ${new Date(date!).toLocaleDateString()} (estimate)`; }
function daysLeft(date: string) { const today = new Date(); today.setHours(0, 0, 0, 0); const target = new Date(date); target.setHours(0, 0, 0, 0); return Math.ceil((target.valueOf() - today.valueOf()) / 86_400_000); }
function urgency(days: number) { return days <= 1 ? 'urgent' : days <= 3 ? 'soon' : 'fresh'; }
function daysLabel(days: number) { return days < 0 ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue` : days === 0 ? 'Use today' : `${days} day${days === 1 ? '' : 's'} left`; }

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]); const [status, setStatus] = useState('Loading your pantry…');
  useEffect(() => { fetch(`${apiUrl}/pantry`, { credentials: 'include' }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setItems(data.pantryItems); setStatus(''); }).catch((error: Error) => setStatus(error.message === 'Authentication is required.' ? 'Sign in through the scanner to see your saved pantry.' : error.message)); }, []);
  async function deleteItem(itemId: string) { const response = await fetch(`${apiUrl}/pantry/${itemId}`, { method: 'DELETE', credentials: 'include' }); if (!response.ok) { const data = await response.json(); setStatus(data.error ?? 'Unable to delete this item.'); return; } setItems((current) => current.filter((item) => item._id !== itemId)); }
  return <main className="pantry-page"><header><a href="/" className="pantry-brand"><span>o</span>OpenBasket</a><a href="/scanner">＋ Scan a receipt</a></header><section><p>YOUR DIGITAL PANTRY</p><h1>Your groceries, in one place.</h1><div className="pantry-status">{status}</div>{!status && !items.length && <div className="empty-pantry"><span>🥬</span><h2>Your pantry is empty.</h2><p>Upload a receipt or product label to add your first item.</p><a href="/scanner">Scan something</a></div>}{items.length > 0 && <div className="live-pantry-grid">{items.map((item) => { const date = freshnessDate(item); const days = date ? daysLeft(date) : null; return <article key={item._id}><div className="pantry-icon">{item.category === 'leafy greens' ? '🥬' : item.category === 'dairy' ? '🥛' : item.category === 'berries' ? '🫐' : '🛒'}</div><div><h2>{item.name}</h2><strong>{dateText(item)}</strong>{days !== null && <span className={`days-left ${urgency(days)}`}>{daysLabel(days)}</span>}<p>{item.storageMethod} · {item.freshness.bestByDate ? 'package date' : `${Math.round(item.freshness.confidence * 100)}% confidence estimate`}</p><small>{item.freshness.evidence[0]}</small><button className="delete-item" onClick={() => void deleteItem(item._id)} aria-label={`Delete ${item.name}`}>Delete</button></div></article>; })}</div>}</section></main>;
}
