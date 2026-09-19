'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  ['▦', 'Home', '/'],
  ['⌂', 'My pantry', '/pantry'],
  ['♧', 'Recipes', '/recipes'],
  ['☷', 'Grocery list', '/grocery-list'],
  ['◒', 'My impact', '/impact'],
  ['◉', 'Community', '/community'],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><span className="brand-mark">o</span><span>OpenBasket</span></Link>
        <nav aria-label="Main navigation">
          <p className="nav-label">YOUR KITCHEN</p>
          {navItems.map(([icon, label, href]) => (
            <Link className={`nav-item ${pathname === href ? 'active' : ''}`} href={href} key={href}>
              <span aria-hidden="true">{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a className="nav-item" href="#settings"><span aria-hidden="true">⚙</span>Settings</a>
          <div className="user-card">
            <div className="avatar">AM</div>
            <div><strong>Alex Morgan</strong><small>Toronto, ON</small></div>
            <span aria-hidden="true">⌄</span>
          </div>
        </div>
      </aside>
      <section className="content">
        <header className="topbar">
          <Link className="mobile-brand" href="/"><span className="brand-mark">o</span> OpenBasket</Link>
          <button className="text-button" type="button" onClick={() => window.alert('Help centre is coming in a later workstream.')}>? <span>Help centre</span></button>
          <button className="notification" type="button" aria-label="Notifications" onClick={() => window.alert('No new notifications.')}>♢<i /></button>
        </header>
        {children}
      </section>
    </main>
  );
}
