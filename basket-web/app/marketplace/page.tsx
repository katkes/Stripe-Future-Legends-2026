'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Vendor } from '../../lib/types';

export default function MarketplacePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void api
      .vendors()
      .then((result) => setVendors(result.vendors))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <>
      <section className="intro">
        <div>
          <p className="kicker">MARKETPLACE</p>
          <h1>Neighbourhood farms</h1>
          <p className="subhead">Buy produce from one farm at a time. OpenBasket keeps a small platform fee at checkout.</p>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      <section className="market-grid">
        {vendors.map((vendor) => (
          <Link className="card market-card" href={`/marketplace/${vendor.id}`} key={vendor.id}>
            <div className="food-icon mint">❀</div>
            <h3>{vendor.name}</h3>
            <p>{vendor.neighbourhood}</p>
            <p>{vendor.bio || 'Seasonal produce from a nearby farm.'}</p>
            <span className="recipe-arrow">→</span>
          </Link>
        ))}
        {vendors.length === 0 && !error ? <p className="subhead">No farms listed yet.</p> : null}
      </section>
    </>
  );
}
