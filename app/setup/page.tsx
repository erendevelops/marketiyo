import { ResetWorkspace } from '@/components/ResetWorkspace';
import { SetupForm } from '@/components/SetupForm';
import { redactSettings } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const settings = await getStore().readSettings();
  return (
    <>
      <SetupForm initial={redactSettings(settings)} projectDir={process.cwd()} />
      <div className="mx-auto max-w-6xl px-6 pb-12 [&>*]:max-w-2xl">
        <ResetWorkspace language={settings.interfaceLanguage} />
      </div>
    </>
  );
}
