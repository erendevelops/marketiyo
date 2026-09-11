import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketiyo',
  description: 'Urunun icin sosyal medya icerik motoru',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
