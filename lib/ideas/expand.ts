import { runWithRepair, type Provider } from '@/lib/providers';
import { composeExpansionPrompt } from '@/lib/prompts/compose';
import { EXPANSION_PROMPT_VERSION } from '@/lib/prompts/version';
import type { ExpansionResponse } from '@/lib/schema';
import type { Store } from '@/lib/workspace/store';

export type ExpandIdeaInput = {
  store: Store;
  provider: Provider;
  ideaId: string;
};

/** Turns one kept idea into a platform-specific asset stored as markdown. */
export async function expandIdea(input: ExpandIdeaInput): Promise<string> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Once marka profili olusturulmali.');

  const ideas = await input.store.readIdeas();
  const idea = ideas.find((candidate) => candidate.id === input.ideaId);
  if (!idea) throw new Error('Fikir bulunamadi.');

  const result = await runWithRepair<ExpansionResponse>(input.provider, {
    prompt: composeExpansionPrompt({ brand, idea }),
    schemaName: 'expansionResponse',
  });
  if (!result.ok) throw new Error(result.error.message);

  const frontMatter = [
    '---',
    `ideaId: ${idea.id}`,
    `platform: ${idea.platform}`,
    `generatedAt: ${new Date().toISOString()}`,
    `promptVersion: ${EXPANSION_PROMPT_VERSION}`,
    '---',
    '',
  ].join('\n');

  const markdown = frontMatter + result.data.markdown;
  await input.store.writeExpansion(idea.id, markdown);
  await input.store.updateIdea(idea.id, { status: 'expanded' });
  return markdown;
}
