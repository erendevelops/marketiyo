import { Dashboard } from '@/components/Dashboard';
import { buildSummary } from '@/lib/dashboard/summary';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

export default async function Home() {
  const store = getStore();

  const settings = await store.readSettings();

  const [brand, ideas, slots, campaigns, articles] = await Promise.all([
    store.readBrand(),
    store.readIdeas(),
    store.readCalendar(),
    store.readCampaigns(),
    store.readArticles(),
  ]);

  const summary = buildSummary({
    onboarded: settings.onboarded,
    brand,
    ideas,
    slots,
    campaigns,
    articles,
    today: todayIso(),
  });

  return <Dashboard summary={summary} language={settings.interfaceLanguage} />;
}
