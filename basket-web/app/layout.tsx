import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'OpenBasket — Your smarter kitchen', description: 'A thoughtful grocery companion for your kitchen and community.' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
