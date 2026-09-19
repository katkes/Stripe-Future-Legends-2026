'use client';

import { useEffect, useState } from 'react';
import { api, money } from '../../lib/api';
import { clearCart, readCart, setQuantity } from '../../lib/cart';
import { useSession } from '../../lib/session';
import type { Cart } from '../../lib/types';

const FEE_BPS = 800;

export default function CartPage() {
  const { user } = useSession();
  const [cart, setCart] = useState<Cart>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setCart(readCart());
    sync();
    window.addEventListener('openbasket-cart', sync);
    return () => window.removeEventListener('openbasket-cart', sync);
  }, []);

  const subtotal = cart?.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0) ?? 0;
  const fee = Math.max(1, Math.round((subtotal * FEE_BPS) / 10_000));

  async function checkout() {
    if (!cart) return;
    setBusy(true);
    setError(undefined);
    try {
      const result = await api.checkout(cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
      setBusy(false);
    }
  }

  if (user?.role === 'vendor') {
    return <p className="subhead">Vendor accounts sell produce; they do not check out as customers.</p>;
  }

  if (!cart) {
    return (
      <section className="intro">
        <div>
          <p className="kicker">CART</p>
          <h1>Your cart is empty</h1>
          <p className="subhead">Add items from a single farm on the Marketplace.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="intro">
        <div>
          <p className="kicker">CART</p>
          <h1>{cart.vendorName}</h1>
          <p className="subhead">One farm per checkout. OpenBasket fee is about 8% and is shown before you pay.</p>
        </div>
      </section>
      <ul className="cart-list">
        {cart.items.map((item) => (
          <li className="card cart-row" key={item.productId}>
            <div>
              <h3>{item.name}</h3>
              <p>
                {money(item.priceCents)} / {item.unit}
              </p>
            </div>
            <label>
              Qty
              <input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(event) => setQuantity(item.productId, Number(event.target.value))}
              />
            </label>
            <strong>{money(item.priceCents * item.quantity)}</strong>
          </li>
        ))}
      </ul>
      <aside className="card cart-summary">
        <p>
          Subtotal <b>{money(subtotal)}</b>
        </p>
        <p>
          OpenBasket fee (est.) <b>{money(fee)}</b>
        </p>
        <p className="subhead">Stripe processing fees are separate and collected on the platform balance.</p>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="button" disabled={busy} onClick={() => void checkout()}>
          {busy ? 'Redirecting…' : 'Checkout with Stripe'}
        </button>
        <button className="text-button" type="button" onClick={() => clearCart()}>
          Clear cart
        </button>
      </aside>
    </>
  );
}
