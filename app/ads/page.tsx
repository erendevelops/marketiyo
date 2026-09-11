import { CampaignList } from '@/components/CampaignList';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function AdsPage() {
  const store = getStore();
  const [campaigns, brand, settings] = await Promise.all([
    store.readCampaigns(),
    store.readBrand(),
    store.readSettings(),
  ]);

  return (
    <CampaignList
      initial={[...campaigns].reverse()}
      brand={brand}
      language={settings.interfaceLanguage}
    />
  );
}
