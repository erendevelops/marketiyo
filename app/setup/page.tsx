import { SetupForm } from '@/components/SetupForm';
import { redactSettings } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const settings = await getStore().readSettings();
  return <SetupForm initial={redactSettings(settings)} />;
}
