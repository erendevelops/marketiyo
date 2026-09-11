import { IdeaBoard } from '@/components/IdeaBoard';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function IdeasPage() {
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
