import { redirect } from 'next/navigation';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const store = getStore();

  const settings = await store.readSettings();
  if (!settings.onboarded) redirect('/setup');

  const brand = await store.readBrand();
  if (!brand) redirect('/brand');

  redirect('/ideas');
}
