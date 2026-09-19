'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useSession } from '../lib/session';

const customerNav = [
  ['▦', 'Home', '/'],
  ['⌂', 'My pantry', '/#pantry'],
  ['♧', 'Recipes', '/#recipes'],
  ['☷', 'Grocery list', '/#grocery-list'],
  ['◒', 'My impact', '/#impact'],
  ['◉', 'Community', '/#community'],
  ['❀', 'Marketplace', '/marketplace'],
] as const;

const vendorNav = [
  ['▦', 'Home', '/'],
  ['❀', 'Marketplace', '/marketplace'],
  ['✎', 'Sell produce', '/sell'],
] as const;

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, pickerOpen, openPicker, closePicker, signup, login, logout } = useSession();
  const [authError, setAuthError] = useState<string>();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [accountOpen, setAccountOpen] = useState(false);

  const nav = user?.role === 'vendor' ? vendorNav : customerNav;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">o</span>
          <span>OpenBasket</span>
        </div>
        <nav aria-label="Main navigation">
          <p className="nav-label">{user?.role === 'vendor' ? 'YOUR STALL' : 'YOUR KITCHEN'}</p>
          {nav.map(([icon, label, href]) => {
            const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link className={`nav-item ${active ? 'active' : ''}`} href={href} key={href}>
                <span aria-hidden="true">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link className="nav-item" href="/#settings">
            <span aria-hidden="true">⚙</span>Settings
          </Link>
          <button className="user-card" type="button" onClick={user ? () => void logout() : openPicker}>
            <div className="avatar">{user ? initials(user.displayName) : '—'}</div>
            <div>
              <strong>{user?.displayName ?? 'Guest'}</strong>
              <small>{user ? `${user.role} · ${user.neighbourhood}` : 'Sign in to shop or sell'}</small>
            </div>
          </button>
        </div>
      </aside>
      <section className="content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">o</span> OpenBasket
          </div>
          <button className="text-button" type="button" onClick={user ? () => void logout() : openPicker}>
            {user ? 'Sign out' : 'Sign in'}
          </button>
          <button className="text-button" type="button">
            ? <span>Help centre</span>
          </button>
          <div className="profile-wrap">
            <button
              className="profile-chip"
              type="button"
              aria-label={user ? `${user.displayName} account` : 'Sign in'}
              onClick={() => {
                if (!user) {
                  openPicker();
                  return;
                }
                setAccountOpen((open) => !open);
              }}
            >
              {user ? initials(user.displayName) : '—'}
            </button>
            {accountOpen && user ? (
              <div className="account-menu card">
                <strong>{user.displayName}</strong>
                <small>
                  {user.role} · {user.neighbourhood}
                </small>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    void logout();
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <div className="page-content">{children}</div>
      </section>
      {pickerOpen ? (
        <div
          className="role-overlay"
          onClick={closePicker}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closePicker();
          }}
        >
          <form
            className="role-card card"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const email = String(data.get('email') || '');
              const password = String(data.get('password') || '');
              const action =
                authMode === 'signup'
                  ? signup({
                      name: String(data.get('name') || ''),
                      email,
                      password,
                      role: data.get('role') as 'customer' | 'vendor',
                    })
                  : login({ email, password });
              void action.catch((error: Error) => setAuthError(error.message));
            }}
          >
            <button className="role-close" type="button" aria-label="Close" onClick={closePicker}>
              ×
            </button>
            <p className="kicker">WELCOME TO OPENBASKET</p>
            <h2>{authMode === 'signup' ? 'Create an account' : 'Sign in'}</h2>
            <p>Use the same email and password as pantry and receipt scanning. Customers shop farms; vendors list produce.</p>
            <div className="role-choices">
              <label>
                <input
                  type="radio"
                  name="authMode"
                  checked={authMode === 'login'}
                  onChange={() => {
                    setAuthMode('login');
                    setAuthError(undefined);
                  }}
                />
                Sign in
              </label>
              <label>
                <input
                  type="radio"
                  name="authMode"
                  checked={authMode === 'signup'}
                  onChange={() => {
                    setAuthMode('signup');
                    setAuthError(undefined);
                  }}
                />
                Create account
              </label>
            </div>
            {authMode === 'signup' ? (
              <label>
                Name
                <input name="name" placeholder="Alex Morgan" required />
              </label>
            ) : null}
            <label>
              Email
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input name="password" type="password" minLength={8} placeholder="At least 8 characters" required />
            </label>
            {authMode === 'signup' ? (
              <div className="role-choices">
                <label>
                  <input type="radio" name="role" value="customer" defaultChecked />I shop for groceries
                </label>
                <label>
                  <input type="radio" name="role" value="vendor" />I sell produce
                </label>
              </div>
            ) : null}
            {authError ? <p className="form-error">{authError}</p> : null}
            <button className="primary-button" type="submit">
              {authMode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
            <button className="text-button" type="button" onClick={closePicker}>
              Browse without signing in
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
