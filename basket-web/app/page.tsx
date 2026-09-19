'use client';

import Link from 'next/link';
import { AppShell } from '../components/AppShell';

const pantryItems = [
  { name: 'Baby spinach', meta: 'Estimated 2 days remaining', icon: '🥬', tone: 'mint' },
  { name: 'Atlantic salmon', meta: 'Estimated 2 days remaining', icon: '🐟', tone: 'coral' },
  { name: '2% milk', meta: 'Estimated 4 days remaining', icon: '🥛', tone: 'blue' },
  { name: 'Udon', meta: '2 packages', icon: '🍜', tone: 'butter' },
];

const recipes = [
  { name: 'Creamy Salmon Udon', time: '25 min', match: '100% pantry', icon: '🐟', color: 'terracotta', href: '/recipes' },
  { name: 'Spinach Egg Fried Rice', time: '15 min', match: '100% pantry', icon: '🍳', color: 'gold', href: '/recipes' },
  { name: 'Garlic Egg Udon', time: '15 min', match: '100% pantry', icon: '🍜', color: 'sage', href: '/recipes' },
];

function ImpactCard() {
  return (
    <section className="impact-card card">
      <div className="eyebrow"><span className="leaf">⌁</span> THIS WEEK'S IMPACT</div>
      <h2>Small choices, real ripple effects.</h2>
      <div className="impact-stats">
        <div><strong>4.2 <em>kg</em></strong><span>CO₂e saved</span></div>
        <div><strong>680 <em>L</em></strong><span>Water saved</span></div>
        <div><strong>3</strong><span>items rescued</span></div>
      </div>
      <Link href="/impact">See your full impact <span>→</span></Link>
    </section>
  );
}

export default function Home() {
  return (
    <AppShell>
      <div className="page-content">
        <section className="intro">
          <div>
            <p className="kicker">FRIDAY, SEPTEMBER 19</p>
            <h1>Good morning, Alex <span>☀</span></h1>
            <p className="subhead">Here’s what’s fresh in your kitchen.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => window.alert('Receipt scanning is a separate workstream. Recipes already read a pantry adapter.')}><span>＋</span> Scan a receipt</button>
        </section>
        <section className="hero-grid">
          <article className="scan-card card">
            <div className="scan-copy">
              <div className="icon-chip">⌁</div>
              <p className="eyebrow">KEEP YOUR PANTRY CURRENT</p>
              <h2>Turn your receipts into a smarter kitchen.</h2>
              <p>Scan groceries once, then let OpenBasket help you use every good thing you bring home.</p>
              <button className="dark-button" type="button" onClick={() => window.alert('Receipt scanning is not wired yet.')}>Scan receipt <span>→</span></button>
            </div>
            <div className="receipt-visual" aria-hidden="true">
              <div className="receipt-paper">
                <div className="receipt-logo">OpenBasket</div>
                <div className="receipt-line wide" />
                <div className="receipt-line" />
                <div className="receipt-row"><span>Baby spinach</span><b>$3.99</b></div>
                <div className="receipt-row"><span>Roma tomatoes</span><b>$4.52</b></div>
                <div className="receipt-row"><span>Sourdough</span><b>$5.49</b></div>
                <div className="receipt-rule" />
                <div className="receipt-total"><span>TOTAL</span><b>$48.26</b></div>
              </div>
              <div className="scan-corner" />
            </div>
          </article>
          <ImpactCard />
        </section>
        <section className="section-head">
          <div>
            <p className="kicker">YOUR PANTRY</p>
            <h2>Use these soon</h2>
          </div>
          <Link href="/pantry">View pantry <span>→</span></Link>
        </section>
        <section className="pantry-grid">
          {pantryItems.map((item) => (
            <article className="pantry-item card" key={item.name}>
              <div className={`food-icon ${item.tone}`}>{item.icon}</div>
              <div>
                <h3>{item.name}</h3>
                <p>{item.meta}</p>
              </div>
              <button type="button" aria-label={`More options for ${item.name}`} onClick={() => window.alert(`${item.name}: freshness is an estimate unless a label was scanned.`)}>•••</button>
            </article>
          ))}
        </section>
        <section className="section-head recipe-head">
          <div>
            <p className="kicker">COOK WITH WHAT YOU HAVE</p>
            <h2>Ideas for tonight</h2>
          </div>
          <Link href="/recipes">Explore recipes <span>→</span></Link>
        </section>
        <section className="recipe-grid">
          {recipes.map((recipe) => (
            <Link className="recipe-card card" href={recipe.href} key={recipe.name}>
              <div className={`recipe-image ${recipe.color}`}>
                <span>{recipe.icon}</span>
              </div>
              <div className="recipe-copy">
                <div>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.time} <i /> {recipe.match}</p>
                </div>
                <span className="recipe-arrow">→</span>
              </div>
            </Link>
          ))}
        </section>
        <section className="community-banner">
          <div className="community-art" aria-hidden="true"><span>🥕</span><span>🍐</span><span>🥖</span></div>
          <div>
            <p className="kicker">NEIGHBOURHOOD BASKET</p>
            <h2>Fresh market delivery, shared with neighbours.</h2>
            <p>Join 4 people in your area to unlock free delivery from Green Acres Farm.</p>
          </div>
          <Link className="outline-button" href="/community">View group order <span>→</span></Link>
        </section>
      </div>
    </AppShell>
  );
}
