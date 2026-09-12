import { ArticleBoard } from '@/components/ArticleBoard';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function SeoPage() {
  const store = getStore();
  const [articles, settings] = await Promise.all([store.readArticles(), store.readSettings()]);

  return <ArticleBoard initial={articles} language={settings.interfaceLanguage} />;
}
