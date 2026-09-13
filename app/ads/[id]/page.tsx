import { notFound } from 'next/navigation';
import { CampaignDetail } from '@/components/CampaignDetail';
import { getStore } from '@/lib/server/store';
import { requireAccess } from '@/lib/server/onboarding';

export const dynamic = 'force-dynamic';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAccess('ads');
  const { id } = await params;
  const store = getStore();

  const [campaigns, settings] = await Promise.all([store.readCampaigns(), store.readSettings()]);
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) notFound();

  return <CampaignDetail campaign={campaign} language={settings.interfaceLanguage} />;
}
