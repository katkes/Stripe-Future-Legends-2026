import type { PantryItem } from '../models';

function daysLeft(item: PantryItem) {
  if (!item.estimatedUseByDate) return null;
  return Math.max(0, Math.ceil((new Date(item.estimatedUseByDate).getTime() - Date.now()) / 86_400_000));
}

export function UseSoonBanner({ items }: { items: PantryItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="rf-banner" aria-live="polite">
      <p className="kicker">USE SOON</p>
      <h2>These estimated dates are coming up — not a safety judgement.</h2>
      <ul>
        {items.map((item) => {
          const days = daysLeft(item);
          return (
            <li key={item.id}>
              <strong>{item.displayName}</strong>
              <span>
                {days === null ? 'No freshness estimate' : `Estimated ${days} day${days === 1 ? '' : 's'} remaining`}
                {item.freshnessSource === 'estimated' ? ' · estimate only' : ''}
                {item.printedExpirationDate ? ` · printed date ${item.printedExpirationDate.slice(0, 10)}` : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
