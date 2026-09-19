'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { clearCart } from '../../../lib/cart';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <section className="intro">
      <div>
        <p className="kicker">ORDER</p>
        <h1>Thanks — we’re confirming payment.</h1>
        <p className="subhead">
          Fulfillment happens when Stripe sends a webhook, not on this page. If the farm order is paid, stock updates automatically.
        </p>
        <Link className="primary-button" href="/marketplace">
          Back to marketplace
        </Link>
      </div>
    </section>
  );
}
