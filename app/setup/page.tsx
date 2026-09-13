import { ResetWorkspace } from '@/components/ResetWorkspace';
import { SetupForm } from '@/components/SetupForm';
import { redactSettings } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const settings = await getStore().readSettings();
  return (
    <>
      <SetupForm initial={redactSettings(settings)} />
      <div className="mx-auto max-w-xl px-8 pb-12">
        <ResetWorkspace language={settings.interfaceLanguage} />
      </div>
    </>
  );
}
