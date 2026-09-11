import { CalendarGrid } from '@/components/CalendarGrid';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const store = getStore();
  const [slots, ideas, settings] = await Promise.all([
    store.readCalendar(),
    store.readIdeas(),
    store.readSettings(),
  ]);

  return (
    <CalendarGrid initialSlots={slots} ideas={ideas} language={settings.interfaceLanguage} />
  );
}
