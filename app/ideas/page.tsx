import { IdeaBoard } from '@/components/IdeaBoard';
import { getStore } from '@/lib/server/store';
import { requireAccess } from '@/lib/server/onboarding';

export const dynamic = 'force-dynamic';

export default async function IdeasPage() {
  await requireAccess('ideas');
  const store = getStore();
  const [ideas, settings, brand] = await Promise.all([
    store.readIdeas(),
    store.readSettings(),
    store.readBrand(),
  ]);

  return (
    <IdeaBoard
      initial={ideas}
      language={settings.interfaceLanguage}
      activePlatforms={brand?.platforms ?? []}
    />
  );
}
