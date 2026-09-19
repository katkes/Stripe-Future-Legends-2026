import { AppShell } from './AppShell';

export default function PlaceholderPage({ title, body }: { title: string; body: string }) {
  return (
    <AppShell>
      <div className="page-content">
        <p className="kicker">WORKSTREAM</p>
        <h1>{title}</h1>
        <p className="subhead">{body}</p>
      </div>
    </AppShell>
  );
}
