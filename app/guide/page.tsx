import { GuideView } from '@/components/GuideView';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function GuidePage() {
  const settings = await getStore().readSettings();
  return <GuideView language={settings.interfaceLanguage} />;
}
