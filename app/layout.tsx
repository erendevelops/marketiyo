import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { getStore } from '@/lib/server/store';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketiyo',
  description: 'Urunun icin sosyal medya icerik motoru',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStore().readSettings();

  return (
    <html lang={settings.interfaceLanguage}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <Nav language={settings.interfaceLanguage} />
        {children}
      </body>
    </html>
  );
}
