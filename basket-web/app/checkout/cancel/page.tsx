import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <section className="intro">
      <div>
        <p className="kicker">CHECKOUT</p>
        <h1>Payment cancelled</h1>
        <p className="subhead">Your cart is still here if you want to try again.</p>
        <Link className="primary-button" href="/cart">
          Return to cart
        </Link>
      </div>
    </section>
  );
}
