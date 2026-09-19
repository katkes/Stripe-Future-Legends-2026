'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, money } from '../../../lib/api';
import { addToCart, cartCount, readCart } from '../../../lib/cart';
import { useSession } from '../../../lib/session';
import type { Product, Vendor } from '../../../lib/types';

export default function FarmPage() {
  const params = useParams<{ vendorId: string }>();
  const { user } = useSession();
  const [vendor, setVendor] = useState<Vendor>();
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    void api
      .vendor(params.vendorId)
      .then((result) => {
        setVendor(result.vendor);
        setProducts(result.products);
      })
      .catch((err: Error) => setError(err.message));
  }, [params.vendorId]);

  useEffect(() => {
    const sync = () => setCount(cartCount());
    sync();
    window.addEventListener('openbasket-cart', sync);
    return () => window.removeEventListener('openbasket-cart', sync);
  }, []);

  const canShop = user?.role !== 'vendor';

  return (
    <>
      <section className="intro">
        <div>
          <p className="kicker">FARM STALL</p>
          <h1>{vendor?.name ?? 'Loading…'}</h1>
          <p className="subhead">{vendor?.bio || vendor?.neighbourhood}</p>
        </div>
        {user?.role === 'customer' ? (
          <Link className="primary-button" href="/cart">
            Cart{count > 0 ? ` (${count})` : ''} · Checkout
          </Link>
        ) : null}
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-ok">{notice}</p> : null}
      <section className="pantry-grid">
        {products.map((product) => {
          const quantity = qty[product.id] ?? 1;
          return (
            <article className="pantry-item card product-card" key={product.id}>
              <div className="food-icon butter">🥕</div>
              <div>
                <h3>{product.name}</h3>
                <p>
                  {money(product.priceCents)} / {product.unit} · {product.stock} left
                </p>
              </div>
              {canShop ? (
                <div className="product-actions">
                  <label className="qty-field">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(event) =>
                        setQty((current) => ({
                          ...current,
                          [product.id]: Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)),
                        }))
                      }
                    />
                  </label>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={product.stock < 1}
                    onClick={() => {
                      if (!vendor) return;
                      const result = addToCart(vendor, product, quantity);
                      if (!result.replaced && readCart()) {
                        setNotice(`Added ${quantity} × ${product.name} to your cart.`);
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
