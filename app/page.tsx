import { Dashboard } from '@/components/Dashboard';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';
import { buildSummary } from '@/lib/dashboard/summary';
import { onboardingStatus } from '@/lib/onboarding/status';
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

  const [settings, brand] = await Promise.all([store.readSettings(), store.readBrand()]);

  const onboarding = onboardingStatus({ onboarded: settings.onboarded, hasBrand: brand !== null });
  if (!onboarding.complete) {
    return <OnboardingChecklist status={onboarding} language={settings.interfaceLanguage} />;
  }

  const [ideas, slots, campaigns, articles] = await Promise.all([
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
