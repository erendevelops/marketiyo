import { BrandForm } from '@/components/BrandForm';
import { getStore } from '@/lib/server/store';
import { requireAccess } from '@/lib/server/onboarding';

export const dynamic = 'force-dynamic';

export default async function BrandPage() {
  await requireAccess('brand');
  const store = getStore();
  const [brand, settings] = await Promise.all([store.readBrand(), store.readSettings()]);
  return <BrandForm initial={brand} language={settings.interfaceLanguage} />;
}
