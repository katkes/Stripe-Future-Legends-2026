'use client';

import { useEffect, useState } from 'react';
import { api, money } from '../../lib/api';
import { useSession } from '../../lib/session';
import type { Product, Vendor } from '../../lib/types';

export default function SellPage() {
  const { user } = useSession();
  const [vendor, setVendor] = useState<Vendor>();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  async function load() {
    try {
      const mine = await api.myFarm();
      setVendor(mine.vendor);
      setProducts(mine.products);
    } catch {
      setVendor(undefined);
      setProducts([]);
    }
  }

  useEffect(() => {
    if (user?.role === 'vendor') void load();
  }, [user?.role]);

  if (user && user.role !== 'vendor') {
    return <p className="subhead">Switch to a vendor session to list produce.</p>;
  }

  return (
    <>
      <section className="intro">
        <div>
          <p className="kicker">SELL</p>
          <h1>Your farm stall</h1>
          <p className="subhead">Add items and prices. Customers check out through OpenBasket; Stripe sends you the rest after the platform fee.</p>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-ok">{notice}</p> : null}
      <form
        key={vendor?.id ?? 'new-farm'}
        className="card form-card"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void api
            .saveFarm({
              name: String(data.get('name')),
              bio: String(data.get('bio')),
              neighbourhood: String(data.get('neighbourhood')),
            })
            .then((result) => {
              setVendor(result.vendor);
              setProducts(result.products);
              setNotice('Farm profile saved.');
              setError(undefined);
            })
            .catch((err: Error) => setError(err.message));
        }}
      >
        <h3>Farm profile</h3>
        <label>
          Farm name
          <input name="name" defaultValue={vendor?.name ?? user?.displayName} required />
        </label>
        <label>
          Neighbourhood
          <input name="neighbourhood" defaultValue={vendor?.neighbourhood ?? user?.neighbourhood} />
        </label>
        <label>
          Bio
          <textarea name="bio" defaultValue={vendor?.bio} rows={3} />
        </label>
        <button className="primary-button" type="submit">
          Save farm
        </button>
      </form>
      <form
        className="card form-card"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const dollars = Number(data.get('price'));
          void api
            .createProduct({
              name: String(data.get('name')),
              unit: String(data.get('unit')),
              priceCents: Math.round(dollars * 100),
              stock: Number(data.get('stock')),
            })
            .then((result) => {
              setProducts((current) => [...current, result.product]);
              event.currentTarget.reset();
              setNotice(`Listed ${result.product.name}.`);
              setError(undefined);
            })
            .catch((err: Error) => setError(err.message));
        }}
      >
        <h3>Add produce</h3>
        <label>
          Name
          <input name="name" required placeholder="Carrots" />
        </label>
        <label>
          Unit
          <select name="unit" defaultValue="each">
            <option value="each">each</option>
            <option value="lb">lb</option>
            <option value="bunch">bunch</option>
          </select>
        </label>
        <label>
          Price (CAD)
          <input name="price" type="number" min={0.5} step={0.01} required />
        </label>
        <label>
          Stock
          <input name="stock" type="number" min={0} step={1} required />
        </label>
        <button className="primary-button" type="submit">
          Add item
        </button>
      </form>
      <section className="pantry-grid">
        {products.map((product) => (
          <article className="pantry-item card" key={product.id}>
            <div className={`food-icon ${product.active ? 'mint' : 'coral'}`}>🥕</div>
            <div>
              <h3>{product.name}</h3>
              <p>
                {money(product.priceCents)} / {product.unit} · stock {product.stock}
                {product.active ? '' : ' · archived'}
              </p>
            </div>
            {product.active ? (
              <button className="text-button" type="button" onClick={() => void api.archiveProduct(product.id).then(load)}>
                Archive
              </button>
            ) : null}
          </article>
        ))}
      </section>
    </>
  );
}
