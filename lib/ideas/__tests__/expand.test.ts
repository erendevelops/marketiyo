import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { createStubProvider } from '@/lib/providers';
import { expandIdea } from '@/lib/ideas/expand';
import type { BrandProfile, Idea } from '@/lib/schema';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-expand-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Test',
  category: 'tool',
  audiences: [{ label: 'A', pain: 'B', desire: 'C', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

const idea: Idea = {
  id: 'i1',
  createdAt: '2026-09-11T00:00:00.000Z',
  batchId: 'b1',
  platform: 'x',
  format: 'thread',
  angle: 'education',
  hook: 'Kanca',
  premise: 'Ozet',
  whyItWorks: 'Neden',
  audienceRef: 'A',
  score: 6,
  tags: [],
  status: 'kept',
  promptVersion: 'idea-batch@1',
};

describe('expandIdea', () => {
  it('writes markdown with front matter and flips the status', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    await store.appendIdeas([idea]);
    const provider = createStubProvider([JSON.stringify({ markdown: '# Kanca\n\nGovde' })]);

    await expandIdea({ store, provider, ideaId: 'i1' });

    const markdown = await store.readExpansion('i1');
    expect(markdown).toContain('ideaId: i1');
    expect(markdown).toContain('# Kanca');
    expect((await store.readIdeas())[0].status).toBe('expanded');
  });

  it('throws when the idea does not exist', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ markdown: 'x' })]);
    await expect(expandIdea({ store, provider, ideaId: 'nope' })).rejects.toThrow(/bulunamadi/i);
  });

  it('throws when there is no brand profile', async () => {
    const store = createStore(root);
    const provider = createStubProvider([JSON.stringify({ markdown: 'x' })]);
    await expect(expandIdea({ store, provider, ideaId: 'i1' })).rejects.toThrow(/marka profili/i);
  });

  it('does not overwrite the file when the provider fails', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    await store.appendIdeas([idea]);
    await store.writeExpansion('i1', 'onceki icerik');
    const provider = createStubProvider(['bad', 'still bad']);

    await expect(expandIdea({ store, provider, ideaId: 'i1' })).rejects.toThrow();
    expect(await store.readExpansion('i1')).toBe('onceki icerik');
  });
});
