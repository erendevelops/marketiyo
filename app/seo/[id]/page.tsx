import { notFound } from 'next/navigation';
import { ArticleDraftEditor } from '@/components/ArticleDraftEditor';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();

  const [articles, settings] = await Promise.all([store.readArticles(), store.readSettings()]);
  const article = articles.find((candidate) => candidate.id === id);
  if (!article) notFound();

  const markdown = await store.readArticleDraft(id);

  return (
    <ArticleDraftEditor
      article={article}
      initialMarkdown={markdown}
      language={settings.interfaceLanguage}
    />
  );
}
