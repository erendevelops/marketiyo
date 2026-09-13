import { CalendarGrid } from '@/components/CalendarGrid';
import { getStore } from '@/lib/server/store';
import { requireAccess } from '@/lib/server/onboarding';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  await requireAccess('calendar');
  const store = getStore();
  const [slots, ideas, campaigns, settings] = await Promise.all([
    store.readCalendar(),
    store.readIdeas(),
    store.readCampaigns(),
    store.readSettings(),
  ]);

  return (
    <CalendarGrid
      initialSlots={slots}
      ideas={ideas}
      campaigns={campaigns}
      language={settings.interfaceLanguage}
    />
  );
}
