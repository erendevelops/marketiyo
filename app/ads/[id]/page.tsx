import { notFound } from 'next/navigation';
import { CampaignDetail } from '@/components/CampaignDetail';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();

  const [campaigns, settings] = await Promise.all([store.readCampaigns(), store.readSettings()]);
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) notFound();

  return <CampaignDetail campaign={campaign} language={settings.interfaceLanguage} />;
}
