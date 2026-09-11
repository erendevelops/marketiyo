import { notFound } from 'next/navigation';
import { ExpansionEditor } from '@/components/ExpansionEditor';
import { getStore } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();

  const [ideas, settings] = await Promise.all([store.readIdeas(), store.readSettings()]);
  const idea = ideas.find((candidate) => candidate.id === id);
  if (!idea) notFound();

  const markdown = await store.readExpansion(id);

  return (
    <ExpansionEditor
      idea={idea}
      initialMarkdown={markdown}
      language={settings.interfaceLanguage}
    />
  );
}
