import { randomUUID } from 'node:crypto';
import { runWithRepair, type Provider } from '@/lib/providers';
import { composeIdeaBatchPrompt } from '@/lib/prompts/compose';
import { PROMPT_VERSION } from '@/lib/prompts/version';
import {
  generatedIdeaSchema,
  ideaSchema,
  type Angle,
  type Idea,
  type IdeaBatchResponse,
  type Platform,
} from '@/lib/schema';
import type { Store } from '@/lib/workspace/store';

export type GenerateIdeasInput = {
  store: Store;
  provider: Provider;
  platform: Platform;
  count: number;
  angles: Angle[];
};

export type GenerateIdeasResult = {
  ideas: Idea[];
  discarded: number;
};

/**
 * One batch of ideas for one platform. Items are validated individually so a
 * single malformed idea costs one idea rather than the whole batch.
 */
export async function generateIdeas(input: GenerateIdeasInput): Promise<GenerateIdeasResult> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Once marka profili olusturulmali.');

  const existing = await input.store.readIdeas();
  const prompt = composeIdeaBatchPrompt({
    brand,
    platform: input.platform,
    count: input.count,
    angles: input.angles,
    recentHooks: existing.map((idea) => idea.hook),
    recentRejections: existing.filter((idea) => idea.status === 'rejected'),
  });

  const result = await runWithRepair<IdeaBatchResponse>(input.provider, {
    prompt,
    schemaName: 'ideaBatchResponse',
  });
  if (!result.ok) throw new Error(result.error.message);

  const batchId = randomUUID();
  const createdAt = new Date().toISOString();

  let discarded = 0;
  const ideas: Idea[] = [];

  for (const candidate of result.data.ideas) {
    const generated = generatedIdeaSchema.safeParse(candidate);
    if (!generated.success) {
      discarded += 1;
      continue;
    }

    const idea = ideaSchema.safeParse({
      ...generated.data,
      id: randomUUID(),
      createdAt,
      batchId,
      status: 'new',
      promptVersion: PROMPT_VERSION,
    });
    if (!idea.success) {
      discarded += 1;
      continue;
    }

    ideas.push(idea.data);
  }

  if (ideas.length) await input.store.appendIdeas(ideas);
  return { ideas, discarded };
}
