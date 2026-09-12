import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { createStubProvider } from '@/lib/providers';
import type { Provider } from '@/lib/providers';
import { generateIdeas } from '@/lib/ideas/generate';
import type { BrandProfile } from '@/lib/schema';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-ideas-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Sosyal medya icerik motoru',
  category: 'tool',
  audiences: [{ label: 'Indie hacker', pain: 'Zaman yok', desire: 'Icerik', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

const good = {
  platform: 'x',
  format: 'thread',
  angle: 'education',
  hook: 'Bir kanca',
  premise: 'Ozet',
  whyItWorks: 'Neden',
  audienceRef: 'Indie hacker',
  score: 7,
  tags: [],
};

function recordingProvider(responses: string[], prompts: string[]): Provider {
  const inner = createStubProvider(responses);
  return {
    id: inner.id,
    isAvailable: inner.isAvailable,
    complete: async (req) => {
      prompts.push(req.prompt);
      return inner.complete(req);
    },
  };
}

describe('generateIdeas', () => {
  it('assigns ids, a shared batch id, and new status', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([
      JSON.stringify({ ideas: [good, { ...good, hook: 'Ikinci' }] }),
    ]);

    const result = await generateIdeas({ store, provider, platform: 'x', count: 2, angles: [] });

    expect(result.ideas).toHaveLength(2);
    expect(new Set(result.ideas.map((i) => i.id)).size).toBe(2);
    expect(new Set(result.ideas.map((i) => i.batchId)).size).toBe(1);
    expect(result.ideas.every((i) => i.status === 'new')).toBe(true);
  });

  it('persists generated ideas to the store', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ ideas: [good] })]);
    await generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] });
    expect(await store.readIdeas()).toHaveLength(1);
  });

  it('keeps valid items and counts the discarded ones', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([
      JSON.stringify({ ideas: [good, { ...good, angle: 'nonsense' }, { ...good, hook: '' }] }),
    ]);
    const result = await generateIdeas({ store, provider, platform: 'x', count: 3, angles: [] });
    expect(result.ideas).toHaveLength(1);
    expect(result.discarded).toBe(2);
  });

  it('throws a readable error when no brand profile exists', async () => {
    const store = createStore(root);
    const provider = createStubProvider([JSON.stringify({ ideas: [good] })]);
    await expect(
      generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] }),
    ).rejects.toThrow(/marka profili/i);
  });

  it('feeds prior hooks back as avoidance context', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    await generateIdeas({
      store,
      provider: createStubProvider([JSON.stringify({ ideas: [good] })]),
      platform: 'x',
      count: 1,
      angles: [],
    });

    const prompts: string[] = [];
    await generateIdeas({
      store,
      provider: recordingProvider([JSON.stringify({ ideas: [{ ...good, hook: 'Yeni' }] })], prompts),
      platform: 'x',
      count: 1,
      angles: [],
    });

    expect(prompts[0]).toContain('Bir kanca');
  });

  it('ignores a platform label the model volunteers and stamps the chosen one', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);

    // The reported failure: the model echoed the card heading into the enum field.
    const withLabel = { ...good, platform: 'TikTok/Reels/Shorts' };
    const provider = createStubProvider([JSON.stringify({ ideas: [withLabel] })]);

    const result = await generateIdeas({
      store,
      provider,
      platform: 'short-video',
      count: 1,
      angles: [],
    });

    expect(result.discarded).toBe(0);
    expect(result.ideas).toHaveLength(1);
    expect(result.ideas[0].platform).toBe('short-video');
  });

  it('reports why an item was discarded instead of failing silently', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ ideas: [{ ...good, angle: 'nonsense' }] })]);

    const result = await generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] });

    expect(result.discarded).toBe(1);
    expect(result.discardReasons).toHaveLength(1);
    expect(result.discardReasons[0]).toContain('angle');
  });

  it('writes nothing when every item is invalid', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ ideas: [{ junk: true }] })]);
    const result = await generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] });
    expect(result.ideas).toHaveLength(0);
    expect(result.discarded).toBe(1);
    expect(await store.readIdeas()).toEqual([]);
  });
});
