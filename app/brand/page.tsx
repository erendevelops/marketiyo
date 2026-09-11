import { BrandForm } from '@/components/BrandForm';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function BrandPage() {
  const store = getStore();
  const [brand, settings] = await Promise.all([store.readBrand(), store.readSettings()]);
  return <BrandForm initial={brand} language={settings.interfaceLanguage} />;
}
