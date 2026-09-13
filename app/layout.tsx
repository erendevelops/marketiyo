import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { getOnboarding } from '@/lib/server/onboarding';
import { getStore } from '@/lib/server/store';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketiyo',
  description: 'Urunun icin sosyal medya icerik motoru',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, onboarding] = await Promise.all([getStore().readSettings(), getOnboarding()]);

  return (
    <html lang={settings.interfaceLanguage}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <Nav language={settings.interfaceLanguage} onboarding={onboarding} />
        {children}
      </body>
    </html>
  );
}
